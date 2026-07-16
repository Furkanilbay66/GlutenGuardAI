import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Info, Sparkles } from 'lucide-react';

export const ALLERGEN_OPTIONS = [
  { id: 'gluten', title: 'Gluten & Buğday', icon: '🌾', category: 'Çölyak & Gluten', description: 'Buğday, arpa, çavdar, yulaf ve türevi tahıllar.' },
  { id: 'lactose', title: 'Laktoz', icon: '🥛', category: 'Süt Şekeri', description: 'Süt, peynir altı suyu (whey), krema ve yoğurt türevleri.' },
  { id: 'milk_protein', title: 'Süt Proteini (Kazein)', icon: '🧀', category: 'Süt Proteini', description: 'Sodyum kazeinat ve süt kaynaklı bağlayıcılar.' },
  { id: 'peanuts', title: 'Yer Fıstığı', icon: '🥜', category: 'Kuruyemiş', description: 'Fıstık ezmesi, fıstık yağı ve parçacıkları.' },
  { id: 'nuts', title: 'Sert Kabuklu Meyveler', icon: '🌰', category: 'Kuruyemiş', description: 'Fındık, badem, ceviz, antep fıstığı ve kaju.' },
  { id: 'soy', title: 'Soya & Lesitin', icon: '🫘', category: 'Baklagil', description: 'Soya unu, soya lesitini (E322), soya sosu.' },
  { id: 'egg', title: 'Yumurta', icon: '🥚', category: 'Hayvansal', description: 'Yumurta akı, sarısı, albümin ve lysozyme.' },
  { id: 'seafood', title: 'Deniz Ürünleri & Balık', icon: '🦐', category: 'Kabuklu & Balık', description: 'Karides, yengeç, kalamar ve balık proteinleri.' },
  { id: 'sesame', title: 'Susam & Tahin', icon: '⚪', category: 'Tohum', description: 'Susam tohumu, tahin ve yağı.' }
];

export const AllergyProfile = ({ selectedAllergens, toggleAllergen, selectAll, clearAll }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header Banner */}
      <div className="backdrop-blur-md bg-white/75 rounded-3xl border border-[#E5E2DA] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C3E35]">
                Kişisel Alerjen Profiliniz
              </h2>
            </div>
            <p className="text-[#5C6B64] text-xs sm:text-sm max-w-xl leading-relaxed">
              Hassas olduğunuz alerjen ve gıda gruplarını belirleyin. GlutenGuard AI etiket taramalarını bu hassasiyet haritasına göre filtreleyecektir.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <button
              onClick={selectAll}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-[#2D5A43] text-white hover:bg-[#234734] transition-colors shadow-xs"
            >
              Tümünü Seç
            </button>
            <button
              onClick={clearAll}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-[#EFECE6] text-[#2C3E35] hover:bg-[#E2DFD8] transition-colors"
            >
              Temizle
            </button>
          </div>
        </div>
      </div>

      {/* Allergens Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ALLERGEN_OPTIONS.map((item) => {
          const isSelected = selectedAllergens.includes(item.id);
          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleAllergen(item.id)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 select-none ${
                isSelected
                  ? 'bg-[#2D5A43]/10 border-2 border-[#2D5A43] shadow-xs'
                  : 'backdrop-blur-md bg-white/75 border border-[#E5E2DA] hover:border-[#D6D2C8] shadow-[0_8px_30px_rgb(0,0,0,0.02)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-transform ${
                    isSelected ? 'bg-[#2D5A43]/20 border border-[#2D5A43]/30' : 'bg-[#F4F3EF] border border-[#E5E2DA]'
                  }`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2C3E35] flex items-center gap-1.5">
                      {item.title}
                    </h3>
                    <span className="text-[11px] text-[#5C6B64] font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#2D5A43] text-white shadow-xs'
                    : 'border border-[#D2CFC7] bg-white'
                }`}>
                  {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>

              <p className="mt-3 text-xs text-[#5C6B64] leading-relaxed">
                {item.description}
              </p>

              {isSelected && (
                <div className="mt-2.5 pt-2 border-t border-[#2D5A43]/20 flex items-center justify-between text-[11px] text-[#2D5A43] font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#2D5A43]" /> Aktif Koruma
                  </span>
                  <span>Analiz Ediliyor</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Travertine Info Card */}
      <div className="p-4 rounded-2xl backdrop-blur-md bg-white/60 border border-[#E5E2DA] flex items-start gap-3 text-xs text-[#2C3E35]">
        <Info className="w-5 h-5 text-[#2D5A43] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#2C3E35] mb-0.5">Gizli İçerik ve Katkı Maddesi Filtreleme</p>
          <p className="text-[#5C6B64] leading-relaxed">
            Sistemimiz ürün etiketlerinde maltodekstrin, sodyum kazeinat ve peynir altı suyu gibi tüm gizli bileşenleri otomatik olarak tespit edecektir.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
