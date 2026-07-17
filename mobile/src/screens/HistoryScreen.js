import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export const HistoryScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getScanHistory();
      setHistory(data);
    } catch (e) {
      console.log('Error fetching scan history:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="journal-outline" size={24} color="#2D5A43" />
        <Text style={styles.title}>Kişisel Tüketim Günlüğü</Text>
      </View>
      <Text style={styles.subtitle}>Ne tarattım? Hangi ürünleri tekrar yiyebilirim veya uzak durmalıyım?</Text>

      {loading ? (
        <ActivityIndicator color="#2D5A43" style={{ marginTop: 40 }} />
      ) : history.length > 0 ? (
        <View style={styles.list}>
          {history.map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.card, item.is_safe ? styles.safeBorder : styles.riskBorder]}>
              <View style={styles.cardHeader}>
                <Text style={styles.icon}>{item.category_icon || '📦'}</Text>
                <View style={styles.cardInfo}>
                  <Text style={styles.itemCategory}>{item.food_category || 'Genel Gıda'}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <View style={[styles.badge, item.is_safe ? styles.safeBadge : styles.riskBadge]}>
                  <Text style={[styles.badgeText, item.is_safe ? styles.safeText : styles.riskText]}>
                    {item.is_safe ? '✓ Yenebilir' : '⚠️ Yasaklı'}
                  </Text>
                </View>
              </View>

              <Text style={styles.verdict}>{item.memory_verdict}</Text>
              <Text style={styles.date}>{item.timestamp}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="time-outline" size={48} color="#5C6B64" />
          <Text style={styles.emptyTitle}>Henüz Kayıtlı Taranan Ürün Yok</Text>
          <Text style={styles.emptyDesc}>Kamera veya galeriden gıda etiketlerini taradığınızda kişisel beslenme geçmişiniz burada saklanacaktır.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F4F3EF', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: '#2C3E35' },
  subtitle: { fontSize: 13, color: '#5C6B64', marginBottom: 20 },
  list: { gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1 },
  safeBorder: { borderColor: 'rgba(45,90,67,0.3)' },
  riskBorder: { borderColor: 'rgba(154,59,59,0.3)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 28, marginRight: 12 },
  cardInfo: { flex: 1 },
  itemCategory: { fontSize: 10, fontWeight: '800', color: '#5C6B64', textTransform: 'uppercase' },
  itemName: { fontSize: 15, fontWeight: '800', color: '#2C3E35', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  safeBadge: { backgroundColor: 'rgba(45,90,67,0.1)' },
  riskBadge: { backgroundColor: 'rgba(154,59,59,0.1)' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  safeText: { color: '#2D5A43' },
  riskText: { color: '#9A3B3B' },
  verdict: { fontSize: 12, color: '#2C3E35', fontWeight: '600' },
  date: { fontSize: 10, color: '#A0AAB0', marginTop: 6 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', marginTop: 60, padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#2C3E35', marginTop: 12 },
  emptyDesc: { fontSize: 12, color: '#5C6B64', textAlign: 'center', marginTop: 6, lineHeight: 18 }
});
