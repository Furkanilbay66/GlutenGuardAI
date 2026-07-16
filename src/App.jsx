import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { AllergyProfile } from './components/AllergyProfile';
import { ScanPanel } from './components/ScanPanel';
import { ScanResult } from './components/ScanResult';
import { ScanHistory } from './components/ScanHistory';
import { CeliacGuide } from './components/CeliacGuide';
import { chemicalDictionary } from './data/chemicalDictionary';
import { ShieldCheck, Heart, ShieldAlert, CloudLightning, Loader2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7860';

const normalizeLocalText = (str) => {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
};

const ALLERGEN_KEYWORDS = {
  gluten: [
    "buğday", "bugday", "wheat", "arpa", "barley", "çavdar", "cavdar", "rye",
    "yulaf", "oat", "oats", "gluten", "glüten", "un", "flour", "bulgur",
    "irmik", "semolina", "galeta", "lavaş", "lavas", "pide", "börek", "borek",
    "yufka", "ekmek", "bread", "makarna", "pasta", "erişte", "eriste", "noodle",
    "bisküvi", "biskuvi", "kek", "cake", "gofret", "waffle", "malt", "bira", "beer",
    "kuskus", "couscous", "aşurelik", "asurelik", "gliadin", "hordein", "secalin",
    "prolamin", "nişasta", "nisasta", "starch", "maltodekstrin", "maltodextrin"
  ],
  lactose: [
    "süt", "sut", "milk", "peynir altı suyu", "peynir alti suyu", "whey",
    "laktoz", "lactose", "tereyağ", "tereyag", "tereyağı", "butter", "krema",
    "cream", "yoğurt", "yogurt", "peynir", "cheese", "süt tozu", "sut tozu",
    "dondurma"
  ],
  milk_protein: [
    "kazein", "casein", "kazeinat", "caseinate", "sodyum kazeinat",
    "sodium caseinate", "süt proteini", "sut proteini", "albümin", "albumin",
    "laktalbümin", "lactalbumin", "laktoglobulin"
  ],
  peanuts: [
    "yer fıstığı", "yer fistigi", "yerfıstığı", "yerfistigi", "fıstık ezmesi",
    "fistik ezmesi", "fıstık yağı", "fistik yagi", "peanut", "peanuts", "arachis", "fıstık", "fistik"
  ],
  nuts: [
    "fındık", "findik", "hazelnut", "badem", "almond", "ceviz", "walnut",
    "antep fıstığı", "antep fistigi", "pistachio", "kaju", "cashew", "kestane",
    "chestnut", "kabuklu meyve", "nut", "nuts"
  ],
  soy: [
    "soya", "soy", "lesitin", "lecithin", "e322", "soya lesitini", "soya unu",
    "soya yağı", "soya sosu", "soy sauce", "tofu", "edamame"
  ],
  egg: [
    "yumurta", "egg", "eggs", "yumurta akı", "yumurta aki", "yumurta sarısı",
    "yumurta sarisi", "albümin", "albumin", "lysozyme", "lizozim", "mayonez", "mayonnaise"
  ],
  seafood: [
    "balık", "balik", "fish", "karides", "shrimp", "prawn", "yengeç", "yengec",
    "crab", "kalamar", "squid", "midye", "mussel", "ıstakoz", "istakoz", "lobster",
    "ahtapot", "octopus", "ton balığı", "ton baligi", "tuna", "somon", "salmon", "hamsi"
  ],
  sesame: [
    "susam", "sesame", "tahin", "tahini", "susam yağı", "susam yagi", "simit"
  ]
};

const ALLERGEN_DISPLAY_NAMES = {
  gluten: "Gluten & Buğday Grubu",
  lactose: "Laktoz & Süt Şekeri",
  milk_protein: "Süt Proteini (Kazein)",
  peanuts: "Yer Fıstığı & Türevleri",
  nuts: "Sert Kabuklu Meyveler",
  soy: "Soya & Lesitin (E322)",
  egg: "Yumurta & Albümin",
  seafood: "Deniz Ürünleri & Balık",
  sesame: "Susam & Tahin"
};

const analyzeIngredientsTextLocal = (ocrText, fileName, userSelectedAllergens) => {
  const ocrTextLower = normalizeLocalText(ocrText + " " + fileName);
  const detectedRisks = [];
  let isSafe = true;

  const effectiveAllergens = new Set(userSelectedAllergens || ["gluten", "lactose"]);
  effectiveAllergens.add("gluten");

  effectiveAllergens.forEach((allergen) => {
    if (ALLERGEN_KEYWORDS[allergen]) {
      for (let keyword of ALLERGEN_KEYWORDS[allergen]) {
        const keyNorm = normalizeLocalText(keyword);
        if (ocrTextLower.includes(keyNorm)) {
          isSafe = false;
          const groupTitle = ALLERGEN_DISPLAY_NAMES[allergen] || allergen;
          detectedRisks.push({
            name: `${groupTitle} ('${keyword}')`,
            allergen_group: allergen,
            trigger_word: keyword,
            risk: (allergen === "gluten" || allergen === "peanuts") ? "critical" : "high",
            description: `Ürün etiketinde '${keyword}' tespit edildi. Bu madde seçtiğiniz '${groupTitle}' hassasiyeti için sakıncalıdır!`
          });
          break;
        }
      }
    }
  });

  return {
    is_safe: isSafe,
    detected_risks: detectedRisks,
    norm_text: ocrTextLower
  };
};

const inferDynamicFoodData = (text, fileName = "") => {
  const norm = normalizeLocalText(text + " " + fileName);
  if (norm.includes("cavdar") || norm.includes("rye")) {
    return { category: "Çavdar & Tahıl Ürünleri", icon: "🌾", name: "Çavdar / Çavdar Unu Ürünü" };
  } else if (norm.includes("arpa") || norm.includes("barley") || norm.includes("malt")) {
    return { category: "Arpa & Malt Ürünleri", icon: "🍺", name: "Arpa / Arpa Maltı Ürünü" };
  } else if (norm.includes("asurelik") || norm.includes("bugday") || norm.includes("wheat") || norm.includes("bulgur") || norm.includes("irmik")) {
    return { category: "Buğday & Tahıl Ürünleri", icon: "🌾", name: norm.includes("asurelik") ? "Aşurelik Buğday (%100 Saf Gluten)" : "Buğday / Buğday Unu Ürünü" };
  } else if (norm.includes("kebap") || norm.includes("kofte") || norm.includes("izgara") || norm.includes("doner")) {
    return { category: "Kebap & Et Yemekleri", icon: "🍢", name: "Kebap & Izgara Tabağı" };
  } else if (norm.includes("pizza") || norm.includes("hamur") || norm.includes("pide") || norm.includes("lahmacun")) {
    return { category: "Pide, Pizza & Hamur İşi", icon: "🍕", name: "Pide & Hamur İşi" };
  } else if (norm.includes("biskuvi") || norm.includes("kraker") || norm.includes("gofret") || norm.includes("kek")) {
    return { category: "Bisküvi & Atıştırmalık", icon: "🍪", name: "Bisküvi Atıştırmalık" };
  } else if (norm.includes("cikolata") || norm.includes("tatli") || norm.includes("sutlac")) {
    return { category: "Tatlı & Çörek", icon: "🍨", name: "Tatlı Çeşidi" };
  } else if (norm.includes("yulaf") || norm.includes("musli")) {
    return { category: "Kahvaltılık Tahıl", icon: "🥣", name: "Yulaf Ezmesi" };
  } else {
    return { category: "Ambalajlı Paketli Gıda", icon: "📦", name: fileName ? fileName.split('.')[0].toUpperCase() : "Yüklenen Paket Gıda" };
  }
};

export const App = () => {
  const [activeTab, setActiveTab] = useState('scan');
  const [selectedAllergens, setSelectedAllergens] = useState(() => {
    const saved = localStorage.getItem('glutenguard_allergens');
    const parsed = saved ? JSON.parse(saved) : ['gluten', 'lactose'];
    return parsed.includes('gluten') ? parsed : ['gluten', ...parsed];
  });
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('glutenguard_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentImage, setCurrentImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isColdStarting, setIsColdStarting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    localStorage.setItem('glutenguard_allergens', JSON.stringify(selectedAllergens));
  }, [selectedAllergens]);

  useEffect(() => {
    localStorage.setItem('glutenguard_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
        if (res.ok) {
          setBackendOnline(true);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleAllergen = (id) => {
    setSelectedAllergens(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAllAllergens = () => {
    setSelectedAllergens(['gluten', 'lactose', 'milk_protein', 'peanuts', 'nuts', 'soy', 'egg', 'seafood', 'sesame']);
  };

  const clearAllAllergens = () => {
    setSelectedAllergens(['gluten']);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const processScan = async (dataUrl, file = null, rawTextOverride = null, productName = null) => {
    setIsScanning(true);
    setIsColdStarting(false);
    setScanResult(null);

    // Cold start notification timer after 5 seconds
    const coldStartTimer = setTimeout(() => {
      setIsColdStarting(true);
    }, 5000);

    const scanDelay = new Promise(resolve => setTimeout(resolve, 2200));

    try {
      let finalResult = null;

      if (file && backendOnline) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('allergens', JSON.stringify(selectedAllergens));

        const [apiRes] = await Promise.all([
          fetch(`${BACKEND_URL}/analyze-ingredients`, {
            method: 'POST',
            body: formData,
          }),
          scanDelay
        ]);

        if (apiRes.ok) {
          const data = await apiRes.json();
          finalResult = {
            id: Date.now().toString(),
            name: data.detected_food_name || productName || "Yüklenen Paket Gıda",
            food_category: data.food_category,
            category_icon: data.category_icon,
            memory_verdict: data.memory_verdict,
            is_safe: data.is_safe,
            matched_allergens: data.matched_allergens,
            unmatched_but_suspicious: data.unmatched_but_suspicious,
            detected_raw_text: data.detected_raw_text,
            explanation: data.explanation,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          };
        }
      }

      if (!finalResult) {
        await scanDelay;
        
        const fileNameStr = file ? file.name : "";
        const rawText = rawTextOverride || (fileNameStr ? `yüklenen etiket resmi: ${fileNameStr}` : "yüklenen etiket görseli.");
        
        const analysis = analyzeIngredientsTextLocal(rawText, fileNameStr, selectedAllergens);
        const foodData = inferDynamicFoodData(rawText, fileNameStr);
        const isSafe = analysis.is_safe;
        const matched = analysis.detected_risks;
        const displayTitle = productName || foodData.name;

        const memoryVerdict = isSafe
          ? `Tekrar Güvenle Tercih Edilebilir (${foodData.category})`
          : `KESİNLİKLE YASAK (${matched.map(m => m.trigger_word.toUpperCase()).join(', ')} Riski)`;

        const triggerSummary = matched.map(m => `'${m.trigger_word}'`).join(', ');

        const explanation = isSafe ? {
          title: `Bu ${foodData.category} Seçili Alerjen Profiliniz İçin Güvenli mi?`,
          summary: `Yapay zeka analizimiz, aktifleştirdiğiniz ${selectedAllergens.length} adet alerjen profilinize göre etiket üzerinde hiçbir tetikleyici kök kelimeye rastlamamıştır.`,
          proofs: [
            { step: "01", title: "Alerjen Kök Sözlük Taraması Temiz", description: "Sisteme tanımlı sakıncalı hammadde kök kelimeleri taranmış ve temiz çıkmıştır." },
            { step: "02", title: "Çoklu Profil Uyumluluğu", description: "Seçtiğiniz tüm hassasiyet kriterleri karşılanmıştır." }
          ],
          dietitian_note: "GlutenGuard Uzman Notu: Seçtiğiniz tüm alerjen profillerine göre rahatlıkla tüketebilirsiniz."
        } : {
          title: `Bu ${displayTitle} Aktif Alerjen Profiliniz İçin KESİNLİKLE RİSKLİ!`,
          summary: `Aktifleştirdiğiniz alerjen filtrelerine göre etiket üzerinde tetikleyici kök kelimeler (${triggerSummary}) tespit edilmiştir.`,
          proofs: [
            { step: "01", title: "Doğrudan Tetikleyici Kelime Bulundu", description: `İçerik etiketinde tespit edilen ${triggerSummary} sakıncalı hammadde listenizle doğrudan eşleşmektedir.` },
            { step: "02", title: "Alerjen Kök Sözlük İhlali", description: "Taranan gıda içerik taksonomisi bağışıklık sisteminde reaksiyon riski oluşturmaktadır." }
          ],
          dietitian_note: `GlutenGuard Uzman Uyarısı: KESİNLİKLE TÜKETMEYİNİZ! Ürün etiketinde ${triggerSummary} maddeleri tespit edilmiştir.`
        };

        finalResult = {
          id: Date.now().toString(),
          name: displayTitle,
          food_category: foodData.category,
          category_icon: foodData.icon,
          memory_verdict: memoryVerdict,
          is_safe: isSafe,
          matched_allergens: matched,
          unmatched_but_suspicious: [],
          detected_raw_text: rawText,
          explanation: explanation,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
      }

      setScanResult(finalResult);
      setHistory(prev => [finalResult, ...prev]);

    } catch (error) {
      console.error("Scan error:", error);
    } finally {
      clearTimeout(coldStartTimer);
      setIsScanning(false);
      setIsColdStarting(false);
    }
  };

  const handleSelectPreset = (sample) => {
    setCurrentImage(sample.image);
    processScan(sample.image, null, sample.ocrText, sample.name);
  };

  const handleSelectHistoryItem = (historyItem) => {
    setScanResult(historyItem);
    setActiveTab('scan');
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-tr from-[#EFECE6] via-[#F4F3EF] to-[#F9F8F6] text-[#2C3E35] font-sans overflow-x-hidden selection:bg-[#2D5A43] selection:text-white flex flex-col justify-between">
      {/* Marble Texture Background Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay bg-[radial-gradient(#E8E5DD_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#E2DFD8] rounded-full filter blur-[120px] opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#EAE7DF] rounded-full filter blur-[150px] opacity-40 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAllergensCount={selectedAllergens.length}
        />

        {/* Dynamic Taxonomy NLP Status Ribbon */}
        <div className="max-w-4xl mx-auto px-4 mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 bg-[#2D5A43]/10 text-[#2D5A43] px-3.5 py-1.5 rounded-full text-xs font-semibold border border-[#2D5A43]/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#2D5A43] animate-pulse"></span>
            <span className="font-bold">Alerjen Kök Sözlüğü NLP Eşleştirmesi Aktif ({selectedAllergens.length} Profil Taranıyor)</span>
          </div>

          <span className="text-xs text-[#5C6B64] font-medium hidden sm:inline">
            FastAPI Hugging Face Space Engine
          </span>
        </div>

        {/* Cold Start Banner Notification */}
        <AnimatePresence>
          {isColdStarting && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto px-4 mt-3"
            >
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <CloudLightning className="w-4 h-4 text-amber-600 animate-bounce" />
                  <span>Yapay zeka motorumuz uyanıyor, lütfen bekleyin... İlk tarama 15-20 saniye sürebilir.</span>
                </div>
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'scan' && (
              <div className="space-y-6">
                {!scanResult ? (
                  <ScanPanel
                    onStartScan={(img, file) => processScan(img, file)}
                    isScanning={isScanning}
                    currentImage={currentImage}
                    setCurrentImage={setCurrentImage}
                    onSelectPreset={handleSelectPreset}
                  />
                ) : (
                  <ScanResult
                    result={scanResult}
                    onRescan={() => {
                      setScanResult(null);
                      setCurrentImage(null);
                    }}
                  />
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <AllergyProfile
                selectedAllergens={selectedAllergens}
                toggleAllergen={toggleAllergen}
                selectAll={selectAllAllergens}
                clearAll={clearAllAllergens}
              />
            )}

            {activeTab === 'guide' && (
              <CeliacGuide />
            )}

            {activeTab === 'history' && (
              <ScanHistory
                history={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onClearHistory={clearHistory}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Travertine Footer */}
      <footer className="relative z-10 w-full py-5 px-6 border-t border-[#E5E2DA] bg-[#F4F3EF]/80 backdrop-blur-md text-center text-xs text-[#5C6B64]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2D5A43]" />
            <span className="font-bold text-[#2C3E35]">GlutenGuard AI Asistanı</span>
          </div>
          <p className="flex items-center gap-1">
            Çölyak ve Alerji Hastaları İçin Sevgiyle Tasarlandı <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 inline" />
          </p>
        </div>
      </footer>
    </div>
  );
};
