import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = ({ navigation }) => {
  const { loginUser, apiUrl, updateServerUrl } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setSubmitting(true);
    try {
      await loginUser(email.trim(), password);
    } catch (err) {
      Alert.alert('Giriş Hatası', err.message || 'E-posta veya şifre yanlış.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveServerUrl = async () => {
    await updateServerUrl(tempUrl);
    setShowServerConfig(false);
    Alert.alert('Sunucu Adresi Güncellendi', `Yeni API adresi: ${tempUrl}`);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header Icon */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={48} color="#2D5A43" />
          </View>
          <Text style={styles.title}>GlutenGuard AI</Text>
          <Text style={styles.subtitle}>Doğal & Akıllı Alerjen Asistanı</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hesabınıza Giriş Yapın</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Posta Adresi</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#5C6B64" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor="#A0AAB0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#5C6B64" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0AAB0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>
              Hesabınız yok mu? <Text style={styles.registerBold}>Hemen Kayıt Olun</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Server IP Config Toggle */}
        <TouchableOpacity style={styles.serverConfigBtn} onPress={() => setShowServerConfig(!showServerConfig)}>
          <Ionicons name="wifi-outline" size={16} color="#5C6B64" />
          <Text style={styles.serverConfigText}>Wi-Fi Sunucu IP Ayarı ({apiUrl})</Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverCard}>
            <Text style={styles.serverTitle}>Yerel Wi-Fi API Adresi</Text>
            <TextInput
              style={styles.serverInput}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="http://192.168.1.X:8000"
            />
            <TouchableOpacity style={styles.saveServerBtn} onPress={handleSaveServerUrl}>
              <Text style={styles.saveServerText}>Adresi Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F3EF' },
  scrollContainer: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(45, 90, 67, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(45, 90, 67, 0.2)'
  },
  title: { fontSize: 26, fontWeight: '900', color: '#2C3E35' },
  subtitle: { fontSize: 13, color: '#5C6B64', marginTop: 4 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E2DA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#2C3E35', marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#2C3E35', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E5E2DA',
    borderRadius: 12,
    paddingHorizontal: 12
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 14, color: '#2C3E35' },
  loginBtn: {
    backgroundColor: '#2D5A43',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  registerLink: { marginTop: 18, alignItems: 'center' },
  registerText: { fontSize: 13, color: '#5C6B64' },
  registerBold: { fontWeight: '800', color: '#2D5A43' },
  serverConfigBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 6 },
  serverConfigText: { fontSize: 12, color: '#5C6B64', fontWeight: '600' },
  serverCard: { marginTop: 12, padding: 16, backgroundColor: '#FAF9F6', borderRadius: 16, borderWidth: 1, borderColor: '#E5E2DA' },
  serverTitle: { fontSize: 12, fontWeight: '700', color: '#2C3E35', marginBottom: 8 },
  serverInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E2DA', borderRadius: 10, padding: 10, fontSize: 13, color: '#2C3E35', marginBottom: 10 },
  saveServerBtn: { backgroundColor: '#2C3E35', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  saveServerText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' }
});
