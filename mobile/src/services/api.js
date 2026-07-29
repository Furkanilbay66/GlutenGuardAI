import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImageManipulator from 'expo-image-manipulator';

export const DEFAULT_API_URL = "http://172.20.10.13:8000";

let currentApiUrl = DEFAULT_API_URL;

export const setApiUrl = async (url) => {
  currentApiUrl = url;
  await AsyncStorage.setItem('glutenguard_api_url', url);
};

export const getApiUrl = async () => {
  const saved = await AsyncStorage.getItem('glutenguard_api_url');
  if (saved && saved !== "https://glutenguardai-production.up.railway.app") {
    currentApiUrl = saved;
  } else {
    currentApiUrl = DEFAULT_API_URL;
  }
  return currentApiUrl;
};

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('glutenguard_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Timeout wrapper
const fetchWithTimeout = (url, options, timeoutMs = 40000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

export const api = {
  login: async (email, password) => {
    const baseUrl = await getApiUrl();
    const response = await fetchWithTimeout(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Giriş yapılamadı.');
    }
    return response.json();
  },

  register: async (email, password, full_name) => {
    const baseUrl = await getApiUrl();
    const response = await fetchWithTimeout(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Kayıt gerçekleştirilemedi.');
    }
    return response.json();
  },

  getMe: async () => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();
    try {
      const response = await fetchWithTimeout(`${baseUrl}/auth/me`, {
        headers: { ...authHeader },
      }, 10000);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  updateAllergens: async (allergens) => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();
    const response = await fetchWithTimeout(`${baseUrl}/profile/allergens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ allergens }),
    });
    if (!response.ok) throw new Error('Profil güncellenemedi.');
    return response.json();
  },

  getScanHistory: async () => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();
    try {
      const response = await fetchWithTimeout(`${baseUrl}/scan-history`, {
        headers: { ...authHeader },
      }, 10000);
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  },

  analyzeImage: async (imageUri, allergens) => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();

    // 1. Sıkıştır: 600px genişlik, %30 kalite → ~40-70KB küçük dosya
    //    base64: true → manipulator base64 string döndürür, JS btoa döngüsü YOK
    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 600 } }],
      {
        compress: 0.3,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,   // Natif base64, hızlı
      }
    );

    const base64 = result.base64;
    const filename = `scan_${Date.now()}.jpg`;

    // 2. JSON olarak gönder
    const response = await fetchWithTimeout(
      `${baseUrl}/analyze-base64`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({
          image_base64: `data:image/jpeg;base64,${base64}`,
          allergens: allergens,
          filename: filename,
        }),
      },
      40000
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Sunucu hatası: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      name: data.detected_food_name || 'Taranan Ürün',
      matched_allergens: data.matched_allergens || [],
    };
  },
};
