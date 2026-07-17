// Fix Event.NONE read-only property mutation in Hermes JS Engine
if (typeof globalThis.Event !== 'undefined') {
  try {
    const origEvent = globalThis.Event;
    if (origEvent && Object.isFrozen && Object.isFrozen(origEvent)) {
      // Ignore or safely patch Event properties
    }
  } catch (e) {}
}

import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ScanScreen } from './src/screens/ScanScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { GuideScreen } from './src/screens/GuideScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { Ionicons } from '@expo/vector-icons';

const MainNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'profile' | 'history' | 'guide'
  const [currentStackScreen, setCurrentStackScreen] = useState(null); // 'result' | 'login' | 'register'
  const [stackParams, setStackParams] = useState({});

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#2D5A43" />
        <Text style={styles.loadingText}>GlutenGuard AI Yükleniyor...</Text>
      </View>
    );
  }

  const navigateTo = (screenName, params = {}) => {
    setStackParams(params);
    setCurrentStackScreen(screenName);
  };

  const goBackFromStack = () => {
    setCurrentStackScreen(null);
  };

  // Render sub-screens or stack screens
  let content;
  if (currentStackScreen === 'result') {
    content = <ResultScreen route={{ params: stackParams }} navigation={{ goBack: goBackFromStack }} />;
  } else if (currentStackScreen === 'login') {
    content = <LoginScreen navigation={{ navigate: (scr) => setCurrentStackScreen(scr.toLowerCase()), goBack: goBackFromStack }} />;
  } else if (currentStackScreen === 'register') {
    content = <RegisterScreen navigation={{ goBack: goBackFromStack }} />;
  } else {
    if (activeTab === 'scan') {
      content = <ScanScreen navigation={{ navigate: (scr, p) => navigateTo('result', p) }} />;
    } else if (activeTab === 'profile') {
      content = <ProfileScreen navigation={{ navigate: (scr) => navigateTo(scr.toLowerCase()) }} />;
    } else if (activeTab === 'history') {
      content = <HistoryScreen navigation={{ navigate: (scr, p) => navigateTo('result', p) }} />;
    } else if (activeTab === 'guide') {
      content = <GuideScreen />;
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F3EF" />
      <View style={styles.container}>
        {/* Top Navbar */}
        <View style={styles.navbar}>
          <View style={styles.navBrand}>
            <View style={styles.brandBadge}>
              <Ionicons name="shield-checkmark" size={20} color="#2D5A43" />
            </View>
            <View>
              <Text style={styles.brandTitle}>GlutenGuard AI</Text>
              <Text style={styles.brandSub}>Mobil Alerjen Asistanı</Text>
            </View>
          </View>

          {user ? (
            <View style={styles.userBadge}>
              <Ionicons name="person-circle" size={24} color="#2D5A43" />
              <Text style={styles.userBadgeText}>{user.full_name ? user.full_name.split(' ')[0] : 'Üye'}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.authBtn} onPress={() => navigateTo('login')}>
              <Text style={styles.authBtnText}>Giriş Yap</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Main Content View */}
        <View style={styles.body}>{content}</View>

        {/* Bottom Tab Navigation Bar */}
        {!currentStackScreen && (
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('scan')}>
              <Ionicons name={activeTab === 'scan' ? 'scan' : 'scan-outline'} size={24} color={activeTab === 'scan' ? '#2D5A43' : '#5C6B64'} />
              <Text style={[styles.tabLabel, activeTab === 'scan' && styles.activeTabLabel]}>Tarama</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
              <Ionicons name={activeTab === 'profile' ? 'options' : 'options-outline'} size={24} color={activeTab === 'profile' ? '#2D5A43' : '#5C6B64'} />
              <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>Profilim</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('history')}>
              <Ionicons name={activeTab === 'history' ? 'journal' : 'journal-outline'} size={24} color={activeTab === 'history' ? '#2D5A43' : '#5C6B64'} />
              <Text style={[styles.tabLabel, activeTab === 'history' && styles.activeTabLabel]}>Günlük</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('guide')}>
              <Ionicons name={activeTab === 'guide' ? 'medical' : 'medical-outline'} size={24} color={activeTab === 'guide' ? '#2D5A43' : '#5C6B64'} />
              <Text style={[styles.tabLabel, activeTab === 'guide' && styles.activeTabLabel]}>Rehber</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F3EF' },
  container: { flex: 1, backgroundColor: '#F4F3EF' },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F3EF' },
  loadingText: { fontSize: 13, fontWeight: '700', color: '#2D5A43', marginTop: 12 },
  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#F4F3EF', borderBottomWidth: 1, borderBottomColor: '#E5E2DA' },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(45,90,67,0.1)', alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontSize: 16, fontWeight: '900', color: '#2C3E35' },
  brandSub: { fontSize: 10, color: '#5C6B64' },
  userBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: '#E5E2DA' },
  userBadgeText: { fontSize: 12, fontWeight: '700', color: '#2C3E35' },
  authBtn: { backgroundColor: '#2D5A43', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  authBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  body: { flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E2DA', paddingVertical: 8, paddingBottom: 12 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 11, color: '#5C6B64', marginTop: 2, fontWeight: '600' },
  activeTabLabel: { color: '#2D5A43', fontWeight: '800' }
});
