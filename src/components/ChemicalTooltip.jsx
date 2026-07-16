import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, AlertTriangle, BookOpen } from 'lucide-react';
import { chemicalDictionary } from '../data/chemicalDictionary';

export const ChemicalTooltip = ({ chemicalKey, displayText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const info = chemicalDictionary[chemicalKey.toLowerCase()] || {
    name: displayText || chemicalKey,
    group: 'bilinmiyor',
    risk: 'medium',
    category: 'Gıda Katkı Maddesi',
    description: `${chemicalKey} maddesi alerjen veya katkı maddesi listemizde tanımlanmış karmaşık bir gıda bileşenidir.`,
    advice: 'Hassasiyet durumunuza göre etiketi ve üretici beyanını inceleyiniz.'
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'critical':
      case 'high':
        return <span className="bg-[#9A3B3B]/10 text-[#732525] border border-[#9A3B3B]/30 text-xs px-2 py-0.5 rounded-full font-semibold">Yüksek Risk</span>;
      case 'medium':
        return <span className="bg-amber-500/10 text-amber-900 border border-amber-500/30 text-xs px-2 py-0.5 rounded-full font-semibold">Orta Risk</span>;
      default:
        return <span className="bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/30 text-xs px-2 py-0.5 rounded-full font-semibold">Düşük / Bilgi</span>;
    }
  };

  return (
    <div className="relative inline-block m-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EFECE6]/80 hover:bg-[#2D5A43]/10 border border-[#E5E2DA] hover:border-[#2D5A43]/30 text-[#2C3E35] hover:text-[#2D5A43] transition-all shadow-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A43]" />
        <span className="font-semibold underline underline-offset-2 decoration-[#D2CFC7] group-hover:decoration-[#2D5A43]">
          {info.name}
        </span>
        <Info className="w-3.5 h-3.5 text-[#5C6B64] group-hover:text-[#2D5A43] transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-4 rounded-2xl bg-white border border-[#E5E2DA] shadow-xl text-[#2C3E35] pointer-events-none"
          >
            <div className="flex items-center justify-between border-b border-[#E5E2DA] pb-2 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2D5A43]" />
                <span className="font-bold text-sm text-[#2C3E35]">{info.name}</span>
              </div>
              {getRiskBadge(info.risk)}
            </div>

            <div className="text-xs text-[#5C6B64] mb-2 font-medium flex items-center gap-1">
              <span>Kategori:</span>
              <span className="text-[#2C3E35] font-semibold">{info.category}</span>
            </div>

            <p className="text-xs text-[#5C6B64] leading-relaxed mb-3">
              {info.description}
            </p>

            {info.advice && (
              <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span>{info.advice}</span>
              </div>
            )}
            
            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
