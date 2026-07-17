import React, { useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ALLERGEN_CARDS = [
  { id: 'gluten', title: 'Gluten & Buğday', subtitle: 'Çölyak & Gluten', desc: 'Buğday, arpa, çavdar, yulaf ve türevi tahıllar.', icon: 'leaf-outline' },
  { id: 'lactose', title: 'Laktoz', subtitle: 'Süt Şekeri', desc: 'Süt, peynir altı suyu (whey), krema ve yoğurt.', icon: 'water-outline' },
  { id: 'milk_protein', title: 'Süt Proteini (Kazein)', subtitle: 'Süt Proteini', desc: 'Sodyum kazeinat ve süt kaynaklı bağlayıcılar.', icon: 'nutrition-outline' },
  { id: 'peanuts', title: 'Yer Fıstığı', subtitle: 'Kuruyemiş', desc: 'Fıstık ezmesi, fıstık yağı ve parçacıkları.', icon: 'bug-outline' },
  { id: 'nuts', title: 'Sert Kabuklu Meyveler', subtitle: 'Kuruyemiş', desc: 'Fındık, badem, ceviz, antep fıstığı ve kaju.', icon: 'cube-outline' },
  { id: 'soy', title: 'Soya & Lesitin', subtitle: 'Baklagil', desc: 'Soya unu, soya lesitini (E322), soya sosu.', icon: 'bonfire-outline' },
  { id: 'egg', title: 'Yumurta', subtitle: 'Hayvansal', desc: 'Yumurta akı, sarısı, albümin ve lizozim.', icon: 'egg-outline' },
  { id: 'seafood', title: 'Deniz Ürünleri & Balık', subtitle: 'Kabuklu & Balık', desc: 'Karides, yengeç, kalamar ve balık proteinleri.', icon: 'fish-outline' },
  { id: 'sesame', title: 'Susam & Tahin', subtitle: 'Tohum', desc: 'Susam tohumu, tahin ve yağı.', icon: 'disc-outline' }
];

export const ProfileScreen = ({ navigation }) => {
  const { user, selectedAllergens, updateAllergenPreferences, logoutUser } = useContext(AuthContext);

  const toggleAllergen = (id) => {
    let updated;
    if (selectedAllergens.includes(id)) {
      // Keep gluten active for baseline Celiac safety if toggling gluten
      updated = selectedAllergens.filter(item => item !== id);
      if (id === 'gluten' && updated.length === 0) updated = ['gluten'];
    } else {
      updated = [...selectedAllergens, id];
    }
    updateAllergenPreferences(updated);
  };

  const selectAll = () => {
    updateAllergenPreferences(ALLERGEN_CARDS.map(c => c.id));
  };

  const clearAll = () => {
    updateAllergenPreferences(['gluten']);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User Header */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color="#2D5A43" />
        </View>

        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.full_name || 'GlutenGuard Üyesi'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        ) : (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Ziyaretçi Modu</Text>
            <Text style={styles.userEmail}>Tercihlerinizi SQL DB'de saklamak için giriş yapın</Text>
          </View>
        )}

        {user ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
            <Ionicons name="log-out-outline" size={20} color="#9A3B3B" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Section Title */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Alerjen & Hassasiyet Profilim</Text>
          <Text style={styles.sectionSubtitle}>{selectedAllergens.length} Aktif Koruma Kartı Filtreleniyor</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={selectAll} style={styles.quickBtn}>
            <Text style={styles.quickBtnText}>Tümünü Seç</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAll} style={styles.quickBtn}>
            <Text style={styles.quickBtnText}>Temizle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Allergen Toggle Cards */}
      {ALLERGEN_CARDS.map((card) => {
        const isActive = selectedAllergens.includes(card.id);
        return (
          <View key={card.id} style={[styles.card, isActive && styles.activeCard]}>
            <View style={styles.cardLeft}>
              <View style={[styles.cardIconBox, isActive && styles.activeIconBox]}>
                <Ionicons name={card.icon} size={22} color={isActive ? '#2D5A43' : '#5C6B64'} />
              </View>
              <View style={styles.cardTextContent}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
                <Text style={styles.cardDesc}>{card.desc}</Text>
              </View>
            </View>

            <Switch
              trackColor={{ false: '#E5E2DA', true: '#2D5A43' }}
              thumbColor={isActive ? '#FFFFFF' : '#FAF9F6'}
              onValueChange={() => toggleAllergen(card.id)}
              value={isActive}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F4F3EF', flexGrow: 1 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(45,90,67,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: '#2C3E35' },
  userEmail: { fontSize: 12, color: '#5C6B64', marginTop: 2 },
  logoutBtn: { padding: 8 },
  loginBtn: { backgroundColor: '#2D5A43', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  loginBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#2C3E35' },
  sectionSubtitle: { fontSize: 12, color: '#5C6B64', marginTop: 2 },
  quickActions: { flexDirection: 'row', gap: 8 },
  quickBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E5E2DA' },
  quickBtnText: { fontSize: 11, fontWeight: '700', color: '#2C3E35' },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 10 },
  activeCard: { borderColor: '#2D5A43' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  cardIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FAF9F6', alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: '#E5E2DA' },
  activeIconBox: { backgroundColor: 'rgba(45,90,67,0.1)', borderColor: 'rgba(45,90,67,0.2)' },
  cardTextContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#2C3E35' },
  cardSubtitle: { fontSize: 10, color: '#5C6B64', backgroundColor: '#FAF9F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  cardDesc: { fontSize: 11, color: '#5C6B64', marginTop: 2 }
});
