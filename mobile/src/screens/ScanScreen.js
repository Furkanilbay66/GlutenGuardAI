import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export const ScanScreen = ({ navigation }) => {
  const { selectedAllergens } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const requestPermissionAndPick = async (useCamera = false) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Kamera erişim izni verilmedi.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Galeri erişim izni verilmedi.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        handleAnalyze(uri);
      }
    } catch (e) {
      Alert.alert('Hata', 'Görsel seçilirken bir sorun oluştu.');
    }
  };

  const handleAnalyze = async (imageUri) => {
    setAnalyzing(true);
    try {
      const result = await api.analyzeImage(imageUri, selectedAllergens);
      navigation.navigate('Result', { result, imageUri });
    } catch (err) {
      Alert.alert('Tarama Hatası', err.message || 'Görsel analizi tamamlanamadı.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Status Card */}
      <View style={styles.statusBadge}>
        <Ionicons name="sparkles" size={16} color="#2D5A43" />
        <Text style={styles.statusText}>{selectedAllergens.length} Aktif Alerjen Koruması Çalışıyor</Text>
      </View>

      <Text style={styles.title}>Gıda Etiketi veya Yemek Taraması</Text>
      <Text style={styles.subtitle}>Paket üzerindeki içindekiler kısmının veya yemeğin fotoğrafını çekin.</Text>

      {/* Main Image Drop Area */}
      <View style={styles.previewBox}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderBox}>
            <Ionicons name="camera-outline" size={64} color="#5C6B64" />
            <Text style={styles.placeholderText}>Fotoğraf Çekin veya Galeriden Seçin</Text>
          </View>
        )}
      </View>

      {analyzing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D5A43" />
          <Text style={styles.loadingText}>Yapay Zeka Etiketi Okuyor & NLP Kök Sözlüğü Analiz Ediyor...</Text>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => requestPermissionAndPick(true)}>
            <Ionicons name="camera" size={22} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Kamera İle Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => requestPermissionAndPick(false)}>
            <Ionicons name="images-outline" size={22} color="#2C3E35" />
            <Text style={styles.secondaryBtnText}>Galeriden Yükle</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F4F3EF', padding: 20, alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(45,90,67,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(45,90,67,0.2)', marginBottom: 16 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#2D5A43' },
  title: { fontSize: 22, fontWeight: '900', color: '#2C3E35', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#5C6B64', textAlign: 'center', marginBottom: 20, paddingHorizontal: 10 },
  previewBox: { width: '100%', height: 260, borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E2DA', borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderBox: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  placeholderText: { fontSize: 13, color: '#5C6B64', marginTop: 12, fontWeight: '600', textAlign: 'center' },
  actionButtons: { width: '100%', gap: 12 },
  primaryBtn: { backgroundColor: '#2D5A43', borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { backgroundColor: '#FFFFFF', borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: '#E5E2DA' },
  secondaryBtnText: { color: '#2C3E35', fontSize: 15, fontWeight: '700' },
  loadingContainer: { marginTop: 10, alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 13, fontWeight: '700', color: '#2D5A43', marginTop: 12, textAlign: 'center' }
});
