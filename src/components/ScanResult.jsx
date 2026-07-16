import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, FileText, RotateCcw, ChevronDown, ChevronUp, Info, BookOpenCheck, Zap } from 'lucide-react';
import { ChemicalTooltip } from './ChemicalTooltip';
import confetti from 'canvas-confetti';

export const ScanResult = ({ result, onRescan }) => {
  const [showRawText, setShowRawText] = useState(false);

  if (!result) return null;

  const {
    is_safe,
    matched_allergens = [],
    unmatched_but_suspicious = [],
    detected_raw_text = '',
    name = 'Taranan Gıda Ürünü',
    food_category = 'Ambalajlı Paketli Gıda',
    category_icon = '📦',
    explanation
  } = result;

  const defaultExplanation = is_safe ? {
    title: `Bu ${food_category} Seçili Alerjen Profiliniz İçin Güvenli mi?`,
    summary: "Yapay zeka analizimiz, aktifleştirdiğiniz alerjen profillerinize göre etiket üzerinde hiçbir tetikleyici kök kelimeye rastlamamıştır.",
    proofs: [
      {
        step: "01",
        title: "Kök Sözlük Taraması Temiz",
        description: "Tetikleyici hammaddeler taranmış ve sakıncalı içerik kökü bulunmamıştır."
      },
      {
        step: "02",
        title: "Çoklu Alerjen Süzgeci Tamamlandı",
        description: "Seçilen profil kapsamındaki tüm hassasiyet kriterleri karşılanmaktadır."
      }
    ],
    dietitian_note: "GlutenGuard Uzman Notu: Seçtiğiniz tüm alerjen profillerine göre rahatlıkla tüketebilirsiniz."
  } : {
    title: `Bu ${name} Aktif Alerjen Profiliniz İçin KESİNLİKLE RİSKLİ!`,
    summary: `Yapılan etiket taramasında seçtiğiniz alerjen profilinizle çelişen tetikleyici kelimeler tespit edilmiştir.`,
    proofs: [
      {
        step: "01",
        title: "Doğrudan Tetikleyici Kelime Yakalandı",
        description: `İçerik etiketinde geçen sakıncalı kelimeler hassasiyet listenizle çelişmektedir.`
      },
      {
        step: "02",
        title: "Alerjen Kök Sözlük İhlali",
        description: "Ürün içeriği bağışıklık sisteminde reaksiyon riski taşımaktadır."
      }
    ],
    dietitian_note: "GlutenGuard Uzman Uyarısı: KESİNLİKLE TÜKETMEYİNİZ! Ürün etiketinde sakıncalı hammadde kelimeleri bulunmaktadır."
  };

  const activeExplanation = explanation || defaultExplanation;

  React.useEffect(() => {
    if (is_safe) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2D5A43', '#5E8C74', '#99BCAB']
      });
    }
  }, [is_safe]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* EXECUTIVE STATUS BANNER CARD */}
      <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-md bg-white/75 border shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] relative overflow-hidden transition-all ${
        is_safe ? 'border-[#2D5A43]/30' : 'border-[#9A3B3B]/30'
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Status Circle Badge */}
          <div className="flex flex-col items-center shrink-0">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-md ${
                is_safe
                  ? 'bg-[#2D5A43] border-[#7CA992] text-white'
                  : 'bg-[#9A3B3B] border-[#D98888] text-white'
              }`}
            >
              {is_safe ? (
                <>
                  <ShieldCheck className="w-12 h-12" />
                  <span className="text-[11px] font-black tracking-wider uppercase mt-1">GÜVENLİ</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-12 h-12" />
                  <span className="text-[11px] font-black tracking-wider uppercase mt-1">RİSKLİ</span>
                </>
              )}
            </motion.div>
          </div>

          {/* Headline & Safety Summary */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9F6] border border-[#E5E2DA] text-[#2C3E35] flex items-center gap-1.5 shadow-xs">
                <span>{category_icon}</span>
                <span>Yemek Türü: <strong>{food_category}</strong></span>
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                is_safe
                  ? 'bg-[#2D5A43]/10 border-[#2D5A43]/30 text-[#2D5A43]'
                  : 'bg-[#9A3B3B]/10 border-[#9A3B3B]/30 text-[#9A3B3B]'
              }`}>
                {is_safe ? '✓ Tüketilebilir' : '⚠️ Dikkat: Risk İçeriyor'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E35] tracking-tight">
              {name}
            </h2>

            <p className="text-[#5C6B64] text-xs sm:text-sm leading-relaxed max-w-xl">
              {is_safe ? (
                "Aktifleştirdiğiniz alerjen profilinize göre etiket üzerinde hiçbir sakıncalı hammadde köküne rastlanmamıştır."
              ) : (
                `Bu üründe alerji tercihlerinizle çelişen toplam ${matched_allergens.length} adet tetikleyici kelime yakalandı.`
              )}
            </p>

            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <button
                onClick={onRescan}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#EFECE6] hover:bg-[#E2DFD8] text-[#2C3E35] border border-[#E5E2DA] flex items-center gap-2 transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#2D5A43]" /> Başka Ürün Tara
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL EXPLANATION CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="backdrop-blur-md bg-white/70 rounded-3xl border border-[#E5E2DA] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.02)] space-y-5"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20 shrink-0">
            <BookOpenCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2C3E35] mb-1">
              {activeExplanation.title}
            </h3>
            <p className="text-sm text-[#5C6B64] leading-relaxed">
              {activeExplanation.summary}
            </p>
          </div>
        </div>

        <hr className="border-[#E5E2DA] my-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeExplanation.proofs.map((proof, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#FAF9F6]/80 border border-[#E5E2DA] space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5A43]">
                {proof.step}. {proof.title}
              </span>
              <h4 className="font-bold text-[#2C3E35] text-sm pt-0.5 mb-1">
                {proof.title}
              </h4>
              <p className="text-xs text-[#5C6B64] leading-relaxed">
                {proof.description}
              </p>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-[#2D5A43]/10 border border-[#2D5A43]/20 text-xs text-[#2D5A43] flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2D5A43] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2D5A43]"></span>
          </span>
          <span className="leading-relaxed font-medium">
            {activeExplanation.dietitian_note}
          </span>
        </div>
      </motion.div>

      {/* MATCHED TRIGGER WORDS DETECTED BY NLP */}
      {matched_allergens.length > 0 && (
        <div className="p-6 rounded-3xl backdrop-blur-md bg-white/75 border border-[#9A3B3B]/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E2DA] pb-3">
            <Zap className="w-5 h-5 text-[#9A3B3B]" />
            <h3 className="font-extrabold text-base text-[#2C3E35]">
              NLP Tarafından Yakalanan Tetikleyici Kelimeler ({matched_allergens.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {matched_allergens.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#9A3B3B]/10 border border-[#9A3B3B]/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#732525] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#9A3B3B]" />
                    {item.name}
                  </span>
                  {item.trigger_word && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-[#9A3B3B] text-white">
                      '{item.trigger_word}'
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C6B64] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADDITIVES & CHEMICAL BREAKDOWN */}
      <div className="p-6 rounded-3xl backdrop-blur-md bg-white/75 border border-[#E5E2DA] shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E2DA] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#2C3E35] flex items-center gap-2">
              <Info className="w-5 h-5 text-[#2D5A43]" />
              Katkı Maddesi Sözlük Analizi
            </h3>
            <p className="text-xs text-[#5C6B64] mt-0.5">
              Etikette geçen E-kodlu ve sentetik katkı maddeleri taranmıştır. Açıklama için tıklayın.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 py-1">
          {unmatched_but_suspicious.length > 0 ? (
            unmatched_but_suspicious.map((item, idx) => (
              <ChemicalTooltip
                key={idx}
                chemicalKey={item.key || item.name}
                displayText={item.name}
              />
            ))
          ) : (
            ['maltodekstrin', 'peynir altı suyu', 'soya lesitini', 'sodyum kazeinat'].map((chemKey, idx) => (
              <ChemicalTooltip
                key={idx}
                chemicalKey={chemKey}
                displayText={chemKey}
              />
            ))
          )}
        </div>
      </div>

      {/* RAW OCR TEXT */}
      <div className="rounded-2xl backdrop-blur-md bg-white/70 border border-[#E5E2DA] overflow-hidden shadow-xs">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-[#2C3E35] hover:text-[#2D5A43] transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2D5A43]" />
            <span>Okunan Ham Etiket Metnini Görüntüle</span>
          </div>
          {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawText && (
          <div className="p-4 bg-[#FAF9F6] border-t border-[#E5E2DA] text-xs font-mono text-[#2C3E35] leading-relaxed whitespace-pre-wrap select-all">
            {detected_raw_text || "Taranan etiketin ham OCR kaydı."}
          </div>
        )}
      </div>
    </motion.div>
  );
};
