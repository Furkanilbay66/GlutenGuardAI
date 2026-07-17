import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen = ({ navigation }) => {
  const { registerUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Eksik Bilgi', 'Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Zayıf Şifre', 'Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(email.trim(), password, fullName.trim());
      Alert.alert('Kayıt Başarılı', 'GlutenGuard AI hesabınız oluşturuldu!');
    } catch (err) {
      Alert.alert('Kayıt Hatası', err.message || 'Kayıt işlemi gerçekleştirilemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2C3E35" />
          </TouchableOpacity>
          <Text style={styles.title}>Yeni Hesabınızı Oluşturun</Text>
          <Text style={styles.subtitle}>Alerjen koruma profilinizi doğrudan yönetin</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#5C6B64" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ahmet Yılmaz"
                placeholderTextColor="#A0AAB0"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

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

          <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerBtnText}>Kayıt Ol ve Başla</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F3EF' },
  scrollContainer: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  header: { marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E5E2DA' },
  title: { fontSize: 24, fontWeight: '900', color: '#2C3E35' },
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
  registerBtn: {
    backgroundColor: '#2D5A43',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' }
});
