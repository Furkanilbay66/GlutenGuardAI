import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, HelpCircle, Apple, Sparkles, Wheat } from 'lucide-react';

export const CeliacGuide = () => {
  const [activeSubTab, setActiveSubTab] = useState('whatis'); // 'whatis' | 'allowed' | 'forbidden' | 'hidden'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Main Banner Header */}
      <div className="backdrop-blur-md bg-white/75 rounded-3xl border border-[#E5E2DA] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20">
              <BookOpen className="w-3.5 h-3.5" /> Rehber & Bilgilendirme
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E35] tracking-tight">
              Çölyak Hastalığı ve Sağlıklı Beslenme Rehberi
            </h2>
            <p className="text-[#5C6B64] text-xs sm:text-sm max-w-2xl leading-relaxed">
              Gluten hassasiyeti ve çölyak tanısı almış bireyler için neyin güvenli olduğu, hangi gıdalardan uzak durulması gerektiği ve gizli içerik tuzaklarına dair detaylı kılavuzunuz.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#2D5A43]/10 border border-[#2D5A43]/20 text-center shrink-0 w-full md:w-auto">
            <ShieldCheck className="w-8 h-8 text-[#2D5A43] mx-auto mb-1" />
            <span className="text-xs font-bold text-[#2D5A43] block">%100 Glutensiz Yaşam</span>
            <span className="text-[10px] text-[#5C6B64]">Sağlıklı & Güvenli Diyet</span>
          </div>
        </div>
      </div>

      {/* Guide Navigation Pills */}
      <div className="flex items-center p-1.5 rounded-2xl bg-[#EFECE6]/80 border border-[#E5E2DA] overflow-x-auto justify-start gap-1">
        <button
          onClick={() => setActiveSubTab('whatis')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'whatis'
              ? 'bg-[#2D5A43] text-white shadow-xs'
              : 'text-[#5C6B64] hover:text-[#2C3E35] hover:bg-white/60'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Çölyak Nedir?
        </button>
        <button
          onClick={() => setActiveSubTab('allowed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'allowed'
              ? 'bg-[#2D5A43] text-white shadow-xs'
              : 'text-[#5C6B64] hover:text-[#2C3E35] hover:bg-white/60'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100" /> Serbest & Güvenli Gıdalar
        </button>
        <button
          onClick={() => setActiveSubTab('forbidden')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'forbidden'
              ? 'bg-[#9A3B3B] text-white shadow-xs'
              : 'text-[#5C6B64] hover:text-[#2C3E35] hover:bg-white/60'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-rose-100" /> Yasak Gıdalar (Uzak Durun)
        </button>
        <button
          onClick={() => setActiveSubTab('hidden')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            activeSubTab === 'hidden'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'text-[#5C6B64] hover:text-[#2C3E35] hover:bg-white/60'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-100" /> Gizli Alerjen & Katkılar
        </button>
      </div>

      {/* Sub-Tab Content Area */}
      {activeSubTab === 'whatis' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl backdrop-blur-md bg-white/75 border border-[#E5E2DA] shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="text-lg font-bold text-[#2C3E35] flex items-center gap-2">
              <Wheat className="w-5 h-5 text-[#2D5A43]" /> Çölyak Hastalığı ve Gluten Hassasiyeti Nedir?
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6B64] leading-relaxed">
              Çölyak hastalığı, gluten adlı proteine karşı vücudun bağışıklık sisteminin gösterdiği kronik bir otoimmün reaksiyondur. Gluten alındığında, ince bağırsaktaki emilimi sağlayan <strong className="text-[#2D5A43]">villus</strong> yapıları zarar görür ve besin öğelerinin emilimi engellenir.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E2DA] space-y-1">
                <span className="text-[#2D5A43] font-bold text-xs">🧬 Genetik Yatkınlık</span>
                <p className="text-[11px] text-[#5C6B64]">Çölyak genetik geçiş gösterebilir. Tek kesin tedavisi ömür boyu sıkı glutensiz diyettir.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E2DA] space-y-1">
                <span className="text-amber-800 font-bold text-xs">⚠️ Çapraz Bulaşma</span>
                <p className="text-[11px] text-[#5C6B64]">Aynı mutfak tezgahı veya yağda pişen gıdalardan mikro düzeyde gluten bulaşabilir.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E2DA] space-y-1">
                <span className="text-sky-800 font-bold text-xs">🍏 Beslenme Yaşamı</span>
                <p className="text-[11px] text-[#5C6B64]">Doğal işlenmemiş gıdalarla (taze sebze, meyve, et, pirinç) son derece zengin beslenilebilir.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'allowed' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-[#2D5A43]/10 border border-[#2D5A43]/20 shadow-xs space-y-3">
            <h4 className="font-extrabold text-sm text-[#2D5A43] flex items-center gap-2">
              <Apple className="w-4 h-4 text-[#2D5A43]" /> Doğal & Taze Gıdalar (Tamamen Serbest)
            </h4>
            <ul className="text-xs text-[#2C3E35] space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> Taze Meyveler & Tüm Sebzeler
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> İşlenmemiş Kırmızı Et, Tavuk, Hindi ve Balık
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> Yumurta ve Doğal Süt Ürünleri (Alerjiniz yoksa)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> Zeytinyağı, Tereyağı ve Ayçiçek Yağı
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-3xl bg-[#2D5A43]/10 border border-[#2D5A43]/20 shadow-xs space-y-3">
            <h4 className="font-extrabold text-sm text-[#2D5A43] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2D5A43]" /> Glutensiz Tahıl & Un Çeşitleri
            </h4>
            <ul className="text-xs text-[#2C3E35] space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> Pirinç ve Mısır (Unları ve Nişastaları)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> Karabuğday (Greçka) ve Kinoa
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> Nohut Unu, Mercimek Unu, Patates Unu
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" /> Sertifikalı Glutensiz Saf Yulaf Ezmesi
              </li>
            </ul>
          </div>
        </div>
      )}

      {activeSubTab === 'forbidden' && (
        <div className="p-6 rounded-3xl bg-[#9A3B3B]/10 border border-[#9A3B3B]/30 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-[#732525] flex items-center gap-2">
            <XCircle className="w-5 h-5 text-[#9A3B3B]" /> Kesinlikle Uzak Durulması Gereken Yasaklı Gıdalar
          </h4>
          <p className="text-xs text-[#5C6B64] leading-relaxed">
            Aşağıdaki tahıllar ve bu tahıllardan üretilen tüm türev gıdalar doğrudan gluten barındırır.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-white border border-[#9A3B3B]/20 text-xs text-[#2C3E35]">
              <span className="font-bold text-[#732525] block mb-1">🌾 Buğday & Türevleri</span>
              Ekmek, makarna, erişte, simit, poğaça, bisküvi, kek, bulgur, irmik, kuskus.
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#9A3B3B]/20 text-xs text-[#2C3E35]">
              <span className="font-bold text-[#732525] block mb-1">🍺 Arpa & Çavdar</span>
              Arpa şehriye, arpa maltı, çavdar ekmeği, bira, malt içecekleri.
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[#9A3B3B]/20 text-xs text-[#2C3E35]">
              <span className="font-bold text-[#732525] block mb-1">🥖 Pane ve Harçlar</span>
              Galeta unu, pane harçlı çıtır tavuklar, hazıl un karışımları.
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'hidden' && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 shadow-xs space-y-4">
          <h4 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700" /> Paket Etiketlerindeki Gizli Gluten & Alerjen Tuzakları
          </h4>
          <p className="text-xs text-[#5C6B64] leading-relaxed">
            Paketli hazır gıdalarda gluten bazen doğrudan buğday un olarak değil, kıvam artırıcı veya aroma taşıyıcı maddelerin altında gizlenebilir:
          </p>

          <div className="space-y-2 text-xs text-[#2C3E35]">
            <div className="p-3 rounded-xl bg-white border border-amber-200 flex items-start gap-2">
              <span className="text-amber-800 font-bold font-mono">1. Maltodekstrin:</span>
              <span>Buğday nişastasından elde edilmişse gluten içerebilir. Ambalajda "Glutensiz" ibaresi aranmalıdır.</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-amber-200 flex items-start gap-2">
              <span className="text-amber-800 font-bold font-mono">2. Arpa Maltı Ekstraktı:</span>
              <span>Cips, çikolata ve gevreklerde tatlandırıcı olarak kullanılır, gluten barındırır.</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-amber-200 flex items-start gap-2">
              <span className="text-amber-800 font-bold font-mono">3. Modifiye Nişasta:</span>
              <span>Kaynağı buğday ise risklidir. Mısır veya patates nişastası güvenlidir.</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-amber-200 flex items-start gap-2">
              <span className="text-amber-800 font-bold font-mono">4. Hazır Soslar ve Çorbalar:</span>
              <span>Soya sosları, bulyonlar ve toz çorbalar kıvam için buğday unu barındırır.</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
