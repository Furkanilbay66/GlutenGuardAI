import AsyncStorage from '@react-native-async-storage/async-storage';

// Live Railway API Backend URL for global mobile connectivity
export const DEFAULT_API_URL = "https://glutenguardai-production.up.railway.app";

let currentApiUrl = DEFAULT_API_URL;

export const setApiUrl = async (url) => {
  currentApiUrl = url;
  await AsyncStorage.setItem('glutenguard_api_url', url);
};

export const getApiUrl = async () => {
  const saved = await AsyncStorage.getItem('glutenguard_api_url');
  if (saved) currentApiUrl = saved;
  return currentApiUrl;
};

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('glutenguard_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  login: async (email, password) => {
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Giriş yapılamadı.');
    }
    return await response.json();
  },

  register: async (email, password, full_name) => {
    const baseUrl = await getApiUrl();
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Kayıt gerçekleştirilemedi.');
    }
    return await response.json();
  },

  getMe: async () => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();
    const response = await fetch(`${baseUrl}/auth/me`, {
      headers: { ...authHeader }
    });
    if (!response.ok) return null;
    return await response.json();
  },

  updateAllergens: async (allergens) => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();
    const response = await fetch(`${baseUrl}/profile/allergens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ allergens })
    });
    if (!response.ok) throw new Error('Profil güncellenemedi.');
    return await response.json();
  },

  getScanHistory: async () => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();
    const response = await fetch(`${baseUrl}/scan-history`, {
      headers: { ...authHeader }
    });
    if (!response.ok) return [];
    return await response.json();
  },

  analyzeImage: async (imageUri, allergens) => {
    const baseUrl = await getApiUrl();
    const authHeader = await getAuthHeader();

    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', { uri: imageUri, name: filename, type });
    formData.append('allergens', JSON.stringify(allergens));

    const response = await fetch(`${baseUrl}/analyze-ingredients`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...authHeader
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Görsel analizi yapılamadı.');
    }
    return await response.json();
  }
};
