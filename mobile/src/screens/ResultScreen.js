import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ResultScreen = ({ route, navigation }) => {
  const { result } = route.params || {};
  const [showRawText, setShowRawText] = useState(false);

  if (!result) return null;

  const {
    is_safe,
    detected_food_name = 'Taranan Gıda Ürünü',
    food_category = 'Ambalajlı Paketli Gıda',
    category_icon = '📦',
    matched_allergens = [],
    explanation = {},
    detected_raw_text = ''
  } = result;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#2C3E35" />
      </TouchableOpacity>

      {/* Main Status Executive Card */}
      <View style={[styles.statusCard, is_safe ? styles.safeBorder : styles.riskBorder]}>
        <View style={[styles.statusCircle, is_safe ? styles.safeBg : styles.riskBg]}>
          <Ionicons name={is_safe ? "shield-checkmark" : "shield-disagree"} size={48} color="#FFFFFF" />
          <Text style={styles.statusCircleText}>{is_safe ? "GÜVENLİ" : "RİSKLİ"}</Text>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{category_icon}</Text>
          <Text style={styles.categoryText}>Yemek Türü: <Text style={styles.boldText}>{food_category}</Text></Text>
        </View>

        <Text style={styles.productName}>{detected_food_name}</Text>
        <Text style={styles.productDesc}>
          {is_safe ? "Seçtiğiniz alerjen profilinize göre etiket üzerinde hiçbir sakıncalı hammadde köküne rastlanmamıştır." : `Bu üründe alerji tercihlerinizle çelişen toplam ${matched_allergens.length} adet tetikleyici kelime yakalandı.`}
        </Text>
      </View>

      {/* Educational Explanation Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book-outline" size={22} color="#2D5A43" />
          <Text style={styles.cardTitle}>{explanation.title || "Çölyak & Alerjen Değerlendirmesi"}</Text>
        </View>
        <Text style={styles.cardSummary}>{explanation.summary}</Text>

        {explanation.proofs && explanation.proofs.map((proof, idx) => (
          <View key={idx} style={styles.proofBox}>
            <Text style={styles.proofStep}>{proof.step}. {proof.title}</Text>
            <Text style={styles.proofDesc}>{proof.description}</Text>
          </View>
        ))}

        {explanation.dietitian_note && (
          <View style={styles.noteBox}>
            <Ionicons name="medical" size={16} color="#2D5A43" />
            <Text style={styles.noteText}>{explanation.dietitian_note}</Text>
          </View>
        )}
      </View>

      {/* Matched Allergens with Trigger Words */}
      {matched_allergens.length > 0 && (
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <Ionicons name="warning-outline" size={22} color="#9A3B3B" />
            <Text style={styles.riskTitle}>Yakalanan Tetikleyici Kelimeler ({matched_allergens.length})</Text>
          </View>

          {matched_allergens.map((item, idx) => (
            <View key={idx} style={styles.riskItem}>
              <View style={styles.riskItemTop}>
                <Text style={styles.riskItemName}>{item.name}</Text>
                {item.trigger_word && (
                  <View style={styles.triggerBadge}>
                    <Text style={styles.triggerText}>'{item.trigger_word}'</Text>
                  </View>
                )}
              </View>
              <Text style={styles.riskItemDesc}>{item.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Raw Text Accordion */}
      <TouchableOpacity style={styles.accordionBtn} onPress={() => setShowRawText(!showRawText)}>
        <Ionicons name="document-text-outline" size={18} color="#2D5A43" />
        <Text style={styles.accordionText}>Okunan Ham Etiket Metni</Text>
        <Ionicons name={showRawText ? "chevron-up" : "chevron-down"} size={18} color="#5C6B64" />
      </TouchableOpacity>

      {showRawText && (
        <View style={styles.rawTextBox}>
          <Text style={styles.rawTextContent}>{detected_raw_text || "Taranan etiketin ham OCR kaydı."}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.rescanBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        <Text style={styles.rescanBtnText}>Başka Ürün Tara</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F4F3EF', flexGrow: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E5E2DA' },
  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 1, marginBottom: 16 },
  safeBorder: { borderColor: 'rgba(45,90,67,0.3)' },
  riskBorder: { borderColor: 'rgba(154,59,59,0.3)' },
  statusCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  safeBg: { backgroundColor: '#2D5A43' },
  riskBg: { backgroundColor: '#9A3B3B' },
  statusCircleText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, marginTop: 4 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FAF9F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 10 },
  categoryIcon: { fontSize: 16 },
  categoryText: { fontSize: 12, color: '#5C6B64' },
  boldText: { fontWeight: '800', color: '#2C3E35' },
  productName: { fontSize: 22, fontWeight: '900', color: '#2C3E35', textAlign: 'center', marginBottom: 6 },
  productDesc: { fontSize: 13, color: '#5C6B64', textAlign: 'center', lineHeight: 18 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#2C3E35', flex: 1 },
  cardSummary: { fontSize: 13, color: '#5C6B64', lineHeight: 18, marginBottom: 14 },
  proofBox: { backgroundColor: '#FAF9F6', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 8 },
  proofStep: { fontSize: 11, fontWeight: '800', color: '#2D5A43', textTransform: 'uppercase' },
  proofDesc: { fontSize: 12, color: '#5C6B64', marginTop: 4 },
  noteBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(45,90,67,0.1)', padding: 12, borderRadius: 12, marginTop: 6 },
  noteText: { fontSize: 12, color: '#2D5A43', fontWeight: '600', flex: 1 },
  riskCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(154,59,59,0.3)', marginBottom: 16 },
  riskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  riskTitle: { fontSize: 15, fontWeight: '800', color: '#9A3B3B' },
  riskItem: { backgroundColor: 'rgba(154,59,59,0.08)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(154,59,59,0.2)', marginBottom: 10 },
  riskItemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  riskItemName: { fontSize: 13, fontWeight: '800', color: '#732525' },
  triggerBadge: { backgroundColor: '#9A3B3B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  triggerText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  riskItemDesc: { fontSize: 12, color: '#5C6B64' },
  accordionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 12, gap: 8 },
  accordionText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#2C3E35' },
  rawTextBox: { backgroundColor: '#FAF9F6', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E5E2DA', marginBottom: 16 },
  rawTextContent: { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#2C3E35' },
  rescanBtn: { backgroundColor: '#2D5A43', height: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  rescanBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 }
});
