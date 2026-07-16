import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, RefreshCw, Zap, Lightbulb, Search, BookOpen, Sparkles, HelpCircle, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { PRESET_SAMPLES } from '../data/presetSamples';

const DAILY_TIPS = [
  {
    id: 1,
    category: "Çözüm & İpucu",
    title: "Etikette 'Modifiye Nişasta' Yazıyorsa Ne Yapmalı?",
    text: "Ambalajda kaynağı belirtilmeyen modifiye nişasta görürseniz buğday kökenli olma ihtimali yüksektir. Ambalajında 'Glutensiz' ibaresi yoksa üretici beyanı olmadan tüketmeyiniz.",
    icon: "🧪"
  },
  {
    id: 2,
    category: "Mutfak Güvenliği",
    title: "Çapraz Bulaşmayı Önlemenin 1 Numaralı Kuralı",
    text: "Aynı ekmek kızartma makinesini veya aynı yağı kesinlikle glutensiz gıdalar için kullanmayın. Havada uçuşan tek bir un tanesi bile villus yapısını uyarabilir.",
    icon: "🍳"
  },
  {
    id: 3,
    category: "Gizli Alerjen",
    title: "Soya Sosu Neden Glutensiz Değildir?",
    text: "Geleneksel soya soslarının yapımında fermantasyon için yüksek oranda buğday kullanılır. Tamamen soya fasulyesinden yapılan 'Tamari' sosları güvenli alternatiftir.",
    icon: "🫘"
  }
];

const QUICK_ECODES = [
  { code: "E1400", name: "Dextrin / Maltodekstrin", safety: "Dikkat (Buğday kaynaklı olabilir)", risk: "medium" },
  { code: "E322", name: "Lesitin (Soya / Ayçiçek)", safety: "Soya Alerjisine Dikkat", risk: "medium" },
  { code: "E621", name: "Monosodyum Glutamat", safety: "Hassasiyet Yapabilir", risk: "low" },
  { code: "E150", name: "Karamel Renklendirici", safety: "Arpa Maltı Riski", risk: "high" }
];

export const ScanPanel = ({ onStartScan, isScanning, currentImage, setCurrentImage, onSelectPreset }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [selectedEcode, setSelectedEcode] = useState(null);

  const handleNextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setCurrentImage(dataUrl);
        onStartScan(dataUrl, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setCurrentImage(dataUrl);
        onStartScan(dataUrl, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const tip = DAILY_TIPS[currentTipIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Upload Zone & Viewport */}
      <div className="backdrop-blur-md bg-white/70 rounded-3xl border border-[#E5E2DA] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.06)] transition-all duration-500 ease-out">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {currentImage ? (
          /* Live Image Scanning Viewport */
          <div className="relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden border border-[#E5E2DA] bg-[#2C3E35] shadow-md group">
            <img
              src={currentImage}
              alt="Tarama Görseli"
              className="w-full h-72 sm:h-96 object-cover"
            />

            {/* Soft Sheen Light Scan Animation */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden bg-slate-950/20 backdrop-blur-[1px]">
                <motion.div
                  initial={{ y: "0%" }}
                  animate={{ y: ["0%", "360%", "0%"] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-full h-12 bg-gradient-to-b from-transparent via-[#2D5A43]/40 to-transparent relative z-20"
                >
                  <div className="w-full h-0.5 bg-emerald-300/80 shadow-xs" />
                </motion.div>

                {/* Status Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full backdrop-blur-md bg-white/90 border border-[#E5E2DA] text-xs font-semibold text-[#2C3E35] flex items-center gap-2 shadow-md">
                  <RefreshCw className="w-4 h-4 text-[#2D5A43] animate-spin" />
                  <span>Ürün İçeriği ve Alerjenler Analiz Ediliyor...</span>
                </div>
              </div>
            )}

            {!isScanning && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/90 text-[#2C3E35] border border-[#E5E2DA] hover:bg-white flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-[#2D5A43]" /> Yeni Fotoğraf Çek
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Carved Dropzone */
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-inner ${
              dragActive
                ? 'border-[#2D5A43] bg-[#FAF9F6]/90 scale-[1.01]'
                : 'border-[#D2CFC7] bg-[#FAF9F6]/50 hover:bg-[#FAF9F6]/90 hover:border-[#2C3E35]/40'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#2D5A43]/10 border border-[#2D5A43]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera className="w-8 h-8 text-[#2D5A43]" />
            </div>

            <h3 className="text-lg font-bold text-[#2C3E35] mb-1">
              Ürün İçindekiler Etiketini Yükleyin veya Çekin
            </h3>
            <p className="text-[#5C6B64] text-xs sm:text-sm max-w-md mx-auto mb-5 leading-relaxed">
              Market ürününün arkasındaki içindekiler etiketini buraya sürükleyin ya da kameranızla anında fotoğrafını çekin.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2D5A43] hover:bg-[#234734] text-white shadow-xs transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" /> Fotoğraf Yükle / Kamera Aç
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Demo Samples */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#2D5A43]" />
            <h3 className="font-extrabold text-sm text-[#2C3E35]">
              Hazır Örnek Test Etiketleri
            </h3>
          </div>
          <span className="text-xs text-[#5C6B64]">Tek tıkla anında deneyin</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SAMPLES.map((sample) => (
            <motion.div
              key={sample.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPreset(sample)}
              className="cursor-pointer p-3 rounded-2xl backdrop-blur-md bg-white/70 border border-[#E5E2DA] hover:border-[#2D5A43]/50 transition-all group flex items-center gap-3 shadow-[0_4px_16px_0_rgba(0,0,0,0.02)] select-none"
            >
              <img
                src={sample.image}
                alt={sample.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#E5E2DA] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-[#2C3E35] truncate group-hover:text-[#2D5A43] transition-colors">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-[#5C6B64] truncate">{sample.category}</p>
                <span className="inline-block mt-0.5 text-[10px] text-[#2D5A43] font-semibold">
                  Analiz Et →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ANİMASYONLU İNTERAKTİF DASHBOARD EĞİTİM KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* WIDGET 1: Rotasyonlu Günün İpucu Kartı */}
        <motion.div
          whileHover={{ y: -3 }}
          className="md:col-span-2 backdrop-blur-md bg-white/70 rounded-3xl border border-[#E5E2DA] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2D5A43]">
              <Sparkles className="w-4 h-4" />
              <span>Günün Alerjen İpucu</span>
            </div>
            <button
              onClick={handleNextTip}
              className="text-[11px] font-bold text-[#2D5A43] hover:underline flex items-center gap-1"
            >
              Sonraki İpucu <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-2 py-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{tip.icon}</span>
                <h4 className="font-bold text-sm text-[#2C3E35]">{tip.title}</h4>
              </div>
              <p className="text-xs text-[#5C6B64] leading-relaxed">
                {tip.text}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="pt-3 border-t border-[#E5E2DA] flex items-center justify-between text-[11px] text-[#5C6B64]">
            <span>İpucu {currentTipIndex + 1} / {DAILY_TIPS.length}</span>
            <span className="text-[#2D5A43] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Bilgi Kütüphanesi
            </span>
          </div>
        </motion.div>

        {/* WIDGET 2: Hızlı E-Kodu Çözücü */}
        <motion.div
          whileHover={{ y: -3 }}
          className="backdrop-blur-md bg-white/70 rounded-3xl border border-[#E5E2DA] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.02)] flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2D5A43] border-b border-[#E5E2DA] pb-2">
              <BookOpen className="w-4 h-4" />
              <span>Hızlı Katkı Çözücü</span>
            </div>

            <p className="text-[11px] text-[#5C6B64]">
              Ambalajlarda sık geçen kod üzerine tıklayarak analiz edin:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_ECODES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setSelectedEcode(selectedEcode?.code === item.code ? null : item)}
                  className={`p-2 rounded-xl text-left border text-xs transition-all ${
                    selectedEcode?.code === item.code
                      ? 'bg-[#2D5A43] text-white border-[#2D5A43]'
                      : 'bg-[#FAF9F6] border-[#E5E2DA] text-[#2C3E35] hover:border-[#2D5A43]/40'
                  }`}
                >
                  <span className="font-mono font-bold block text-[11px]">{item.code}</span>
                  <span className="text-[10px] truncate block opacity-80">{item.name}</span>
                </button>
              ))}
            </div>

            {selectedEcode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E2DA] text-[11px] text-[#2C3E35] space-y-1"
              >
                <div className="font-bold text-[#2D5A43]">{selectedEcode.code} - {selectedEcode.name}</div>
                <div className="text-[#5C6B64]">{selectedEcode.safety}</div>
              </motion.div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};
