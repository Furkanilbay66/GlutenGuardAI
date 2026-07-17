import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const GuideScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="medical-outline" size={24} color="#2D5A43" />
        <Text style={styles.title}>Çölyak & Alerjen Rehberi</Text>
      </View>
      <Text style={styles.subtitle}>İnce bağırsak villus sağlığı ve etiket okuma standartları.</Text>

      {/* Guide Banner */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌾 Çölyak Hastalığı Nedir?</Text>
        <Text style={styles.cardBody}>
          Çölyak hastalığı; buğday, arpa, çavdar ve yulaf gibi tahıllarda bulunan gluten (gliadin, hordein, secalin) proteinine karşı otoimmün tepki olarak gelişen kronik bir bağırsak hassasiyetidir.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧪 Gizli Alerjen & Katkı Maddesi Sözlüğü</Text>
        <View style={styles.itemBox}>
          <Text style={styles.itemTitle}>Maltodekstrin (E1400)</Text>
          <Text style={styles.itemDesc}>Nişastanın hidrolizi ile üretilir. Buğday kaynaklı olduğunda gluten içerebilir.</Text>
        </View>
        <View style={styles.itemBox}>
          <Text style={styles.itemTitle}>Peynir Altı Suyu (Whey)</Text>
          <Text style={styles.itemDesc}>Süt imalatı yan ürünüdür. Yoğun miktarda laktoz barındırır.</Text>
        </View>
        <View style={styles.itemBox}>
          <Text style={styles.itemTitle}>Soya Lesitini (E322)</Text>
          <Text style={styles.itemDesc}>Çikolata ve bisküvilerde kıvam artırıcı olarak kullanılır. Soya alerjenidir.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F4F3EF', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '900', color: '#2C3E35' },
  subtitle: { fontSize: 13, color: '#5C6B64', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#2C3E35', marginBottom: 8 },
  cardBody: { fontSize: 13, color: '#5C6B64', lineHeight: 18 },
  itemBox: { backgroundColor: '#FAF9F6', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E2DA', marginTop: 8 },
  itemTitle: { fontSize: 13, fontWeight: '800', color: '#2D5A43' },
  itemDesc: { fontSize: 11, color: '#5C6B64', marginTop: 2 }
});
