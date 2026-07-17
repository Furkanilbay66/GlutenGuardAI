import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getApiUrl, setApiUrl, DEFAULT_API_URL } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAllergens, setSelectedAllergens] = useState(['gluten', 'lactose']);
  const [apiUrl, setServerUrl] = useState(DEFAULT_API_URL);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      const savedUrl = await getApiUrl();
      setServerUrl(savedUrl);

      const token = await AsyncStorage.getItem('glutenguard_token');
      if (token) {
        const userData = await api.getMe();
        if (userData) {
          setUser(userData);
          if (userData.allergens) {
            setSelectedAllergens(userData.allergens);
          }
        } else {
          await AsyncStorage.removeItem('glutenguard_token');
        }
      } else {
        const savedAllergens = await AsyncStorage.getItem('glutenguard_allergens');
        if (savedAllergens) {
          setSelectedAllergens(JSON.parse(savedAllergens));
        }
      }
    } catch (e) {
      console.log('Error loading auth state:', e);
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    const res = await api.login(email, password);
    await AsyncStorage.setItem('glutenguard_token', res.access_token);
    setUser(res.user);
    if (res.user.allergens) {
      setSelectedAllergens(res.user.allergens);
    }
    return res;
  };

  const registerUser = async (email, password, fullName) => {
    const res = await api.register(email, password, fullName);
    await AsyncStorage.setItem('glutenguard_token', res.access_token);
    setUser(res.user);
    if (res.user.allergens) {
      setSelectedAllergens(res.user.allergens);
    }
    return res;
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem('glutenguard_token');
    setUser(null);
  };

  const updateAllergenPreferences = async (newAllergens) => {
    setSelectedAllergens(newAllergens);
    await AsyncStorage.setItem('glutenguard_allergens', JSON.stringify(newAllergens));
    if (user) {
      try {
        await api.updateAllergens(newAllergens);
      } catch (e) {
        console.log('Error syncing profile with DB:', e);
      }
    }
  };

  const updateServerUrl = async (newUrl) => {
    await setApiUrl(newUrl);
    setServerUrl(newUrl);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      selectedAllergens,
      apiUrl,
      loginUser,
      registerUser,
      logoutUser,
      updateAllergenPreferences,
      updateServerUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};
