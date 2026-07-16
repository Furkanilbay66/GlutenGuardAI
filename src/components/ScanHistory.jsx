import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { History, ShieldCheck, ShieldAlert, Trash2, Search, Calendar, ArrowRight, CheckCircle2, AlertOctagon, Utensils } from 'lucide-react';

export const ScanHistory = ({ history = [], onSelectHistoryItem, onClearHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'safe' | 'risky'

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.food_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.detected_raw_text?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === 'safe') return matchesSearch && item.is_safe;
    if (filterMode === 'risky') return matchesSearch && !item.is_safe;
    return matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header Bar */}
      <div className="backdrop-blur-md bg-white/75 rounded-3xl border border-[#E5E2DA] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20">
            <Utensils className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#2C3E35]">Geçmiş Taramalar & Kişisel Tüketim Günlüğü</h2>
            <p className="text-xs text-[#5C6B64]">Ne tarattım? Hangi ürünleri tekrar güvenle yiyebilirim veya uzak durmalıyım?</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#9A3B3B]/10 hover:bg-[#9A3B3B]/20 text-[#732525] border border-[#9A3B3B]/30 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" /> Günlüğü Sıfırla
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#5C6B64] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Ürün adı, yemek türü (ör: Pizza, Bisküvi) veya içerik ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 border border-[#E5E2DA] text-xs text-[#2C3E35] placeholder-[#5C6B64] focus:outline-none focus:border-[#2D5A43] transition-colors shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EFECE6]/80 border border-[#E5E2DA] w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              filterMode === 'all' ? 'bg-white text-[#2C3E35] shadow-xs' : 'text-[#5C6B64] hover:text-[#2C3E35]'
            }`}
          >
            Tümü ({history.length})
          </button>
          <button
            onClick={() => setFilterMode('safe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              filterMode === 'safe' ? 'bg-[#2D5A43] text-white shadow-xs' : 'text-[#5C6B64] hover:text-[#2C3E35]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" /> Tekrar Yenebilir ({history.filter(h => h.is_safe).length})
          </button>
          <button
            onClick={() => setFilterMode('risky')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              filterMode === 'risky' ? 'bg-[#9A3B3B] text-white shadow-xs' : 'text-[#5C6B64] hover:text-[#2C3E35]'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-200" /> Yasaklı Listem ({history.filter(h => !h.is_safe).length})
          </button>
        </div>
      </div>

      {/* History Cards List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelectHistoryItem(item)}
              className={`p-4 sm:p-5 rounded-2xl backdrop-blur-md bg-white/80 border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none shadow-xs hover:shadow-md ${
                item.is_safe ? 'border-[#2D5A43]/30 hover:border-[#2D5A43]' : 'border-[#9A3B3B]/30 hover:border-[#9A3B3B]'
              }`}
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Food Category Icon Tile */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl border ${
                  item.is_safe
                    ? 'bg-[#2D5A43]/10 border-[#2D5A43]/30 text-[#2D5A43]'
                    : 'bg-[#9A3B3B]/10 border-[#9A3B3B]/30 text-[#9A3B3B]'
                }`}>
                  {item.category_icon || (item.is_safe ? '🥗' : '⚠️')}
                </div>

                <div className="min-w-0 space-y-1">
                  {/* Category & Date Tag */}
                  <div className="flex items-center gap-2 text-[11px] text-[#5C6B64]">
                    <span className="font-semibold px-2 py-0.5 rounded-md bg-[#FAF9F6] border border-[#E5E2DA] text-[#2C3E35]">
                      {item.food_category || 'Genel Gıda'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#2D5A43]" /> {item.timestamp}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h4 className="font-extrabold text-base text-[#2C3E35] truncate">
                    {item.name}
                  </h4>

                  {/* Memory Verdict Line */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className={`text-xs font-bold inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                      item.is_safe
                        ? 'bg-[#2D5A43]/10 border-[#2D5A43]/30 text-[#2D5A43]'
                        : 'bg-[#9A3B3B]/10 border-[#9A3B3B]/30 text-[#732525]'
                    }`}>
                      {item.is_safe ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43]" />
                          <span>{item.memory_verdict || "Tekrar Güvenle Satın Alınabilir (%100 Temiz Etiket)"}</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5 text-[#732525]" />
                          <span>{item.memory_verdict || "Kesinlikle Uzak Durulmalı (Alerjen İçerir)"}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="self-end sm:self-center flex items-center gap-1.5 text-xs text-[#2D5A43] font-bold shrink-0">
                <span>Raporu Aç</span>
                <ArrowRight className="w-4 h-4 text-[#2D5A43]" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl backdrop-blur-md bg-white/75 border border-[#E5E2DA] shadow-xs space-y-3">
          <History className="w-12 h-12 text-[#5C6B64] mx-auto" />
          <h3 className="font-bold text-base text-[#2C3E35]">Kayıtlı Tüketim Günlüğü Bulunmuyor</h3>
          <p className="text-xs text-[#5C6B64] max-w-sm mx-auto">
            Tarama Paneli'nden ürün veya yemek etiketini tara ve "Tekrar yenebilir mi?" geçmiş kaydını anında oluştur.
          </p>
        </div>
      )}
    </motion.div>
  );
};
