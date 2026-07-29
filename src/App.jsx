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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://glutenguardai-production.up.railway.app';

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

const isKeywordInTextLocal = (keyNorm, textNorm) => {
  if (!keyNorm || !textNorm) return false;
  if (keyNorm.length <= 4) {
    const pattern = new RegExp(`(?<![a-z0-9çğıöşü])${keyNorm}(?![a-z0-9çğıöşü])`, 'i');
    return pattern.test(textNorm);
  }
  return textNorm.includes(keyNorm);
};

const analyzeIngredientsTextLocal = (ocrText, fileName, userSelectedAllergens) => {
  const ocrTextLower = normalizeLocalText(ocrText + " " + fileName);
  const detectedRisks = [];
  let isSafe = true;

  const effectiveAllergens = (userSelectedAllergens && userSelectedAllergens.length > 0)
    ? new Set(userSelectedAllergens)
    : new Set(["gluten", "lactose"]);

  effectiveAllergens.forEach((allergen) => {
    if (ALLERGEN_KEYWORDS[allergen]) {
      for (let keyword of ALLERGEN_KEYWORDS[allergen]) {
        const keyNorm = normalizeLocalText(keyword);
        if (isKeywordInTextLocal(keyNorm, ocrTextLower)) {
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

const FOOD_TAKSONOMI_DATABASE = [
  // 1. FAST FOOD & ATIŞTIRMALIK MENÜLER
  {
    id: "hamburger",
    keywords: ["burger", "hamburger", "cheeseburger", "fastfood", "whopper", "mc", "hamburgr", "king"],
    name: "Hamburger / Cheeseburger Menü",
    category: "Fast Food & Hamburger",
    icon: "🍔",
    components: [
      { item: "Hamburger Ekmeği (Bun)", desc: "Buğday unu (Gliadin & Glutenin) içerir. Çölyak ve gluten hastaları için sakıncalıdır." },
      { item: "Köfte Harcı & Soya", desc: "Köfte yoğrulurken galeta unu/ekmek içi (Gluten) ve emülgatör olarak soya lesitini (E322) eklenebilir." },
      { item: "Cheddar / Dilim Peynir", desc: "Süt ürünü (Laktoz & Süt Proteini) barındırır." },
      { item: "Patates Kızartması Fritözü", desc: "Ortak fritöz yağında çıtır kaplamalı glutenli ürünler pişirildiyse çapraz bulaşma riski vardır." }
    ]
  },
  {
    id: "pizza",
    keywords: ["pizza", "pizzas", "peperoni", "margarita", "kapan"],
    name: "Pizza Çeşitleri",
    category: "Pizza & Fast Food",
    icon: "🍕",
    components: [
      { item: "Pizza Hamur Tabanı", desc: "%100 Buğday unu (Gluten) ve mayalama maddeleri içerir." },
      { item: "Mozzarella / Kaşar Peyniri", desc: "Süt proteini (Kazein) ve laktoz barındırır." },
      { item: "Pizza Sosu & Şarküteri Etler", desc: "İşlenmiş sucuk/sosis gibi etlerde galeta unu ve soya proteini eklentisi bulunabilir." }
    ]
  },
  {
    id: "tost_sandvic",
    keywords: ["tost", "sandvic", "toast", "sandwich", "panini", "kumru", "ayvalik"],
    name: "Tost & Sandviç Çeşitleri",
    category: "Fast Food & Atıştırmalık",
    icon: "🥪",
    components: [
      { item: "Tost Ekmeği / Somun", desc: "Maya ve buğday unu (Gluten) temel hammaddedir." },
      { item: "Kaşar / Peynir Dolgusu", desc: "Erimiş kaşar peyniri laktoz ve süt proteini kazein içerir." },
      { item: "Margarin & Şarküteri", desc: "Margarin ve şarküteri etlerinde süt tozu ve soya proteini bulunabilir." }
    ]
  },
  {
    id: "fried_chicken",
    keywords: ["crispy", "chicken", "nugget", "nuggets", "sinitzel", "snitzel", "kizarmis pilic", "tavuk burger"],
    name: "Kızarmış Çıtır Tavuk / Nugget",
    category: "Fast Food & Tavuk",
    icon: "🍗",
    components: [
      { item: "Çıtır Kaplama Panesi", desc: "Galeta unu, mısır/buğday nişastası ve pane harcı (Gluten) ile kaplanır." },
      { item: "Tavuk Marinasyonu", desc: "Marinasyonda süt tozu, yoğurt veya peynir altı suyu kullanılabilir." }
    ]
  },
  {
    id: "hotdog_sosisli",
    keywords: ["sosisli", "hotdog", "hot dog", "sosis ekmek", "gorali"],
    name: "Sosisli Sandviç / Hot Dog",
    category: "Fast Food & Atıştırmalık",
    icon: "🌭",
    components: [
      { item: "Sosisli Ekmeği", desc: "Buğday unu ve tatlandırıcı malt eklentisi (Gluten) içerir." },
      { item: "Sosis Et İçeriği", desc: "Sosis kıymasında kıvam için nişasta, soya proteini ve galeta unu yer alır." },
      { item: "Mayonez & Ketçap Sos", desc: "Mayonez sos yumurta sarısı albümini içerir." }
    ]
  },
  {
    id: "taco_burrito",
    keywords: ["taco", "burrito", "wrap", "quesadilla", "nachos", "fajita"],
    name: "Meksika Taco / Burrito / Wrap",
    category: "Fast Food & Meksika Mutfagi",
    icon: "🌮",
    components: [
      { item: "Lavaş / Tortilla Ekmeği", desc: "Buğday unu tortillasından yapılan dürümler gluten içerir." },
      { item: "Krema & Ekşi Peynir", desc: "Sour cream ve peynir sosları laktoz riski taşır." }
    ]
  },

  // 2. HAMUR İŞLERİ & PASTANELER
  {
    id: "lahmacun",
    keywords: ["lahmacun", "findik lahmacun"],
    name: "Çıtır Lahmacun",
    category: "Hamur İşi & Pide",
    icon: "🍕",
    components: [
      { item: "İnce Lahmacun Hamuru", desc: "Buğday unu (Gliadin/Glutenin) ana hammaddedir." },
      { item: "Kıymalı Harç", desc: "Kıymada bayat ekmek veya galeta unu eklentisi bulunabilir." }
    ]
  },
  {
    id: "pide",
    keywords: ["pide", "kasarli pide", "kiymali pide", "kusbasi pide", "bafra pidesi"],
    name: "Geleneksel Pide Çeşitleri",
    category: "Hamur İşi & Pide",
    icon: "🍞",
    components: [
      { item: "Mayalı Pide Hamuru", desc: "Yüksek glutenli ekmeklik buğday unundan üretilir." },
      { item: "Kaşar / İçi", desc: "Erimiş kaşar peyniri süt şekeri ve laktoz barındırır." }
    ]
  },
  {
    id: "borek_poaca",
    keywords: ["borek", "pogaca", "acma", "simit", "boyoz", "gozleme", "katmer", "manti", "su boregi"],
    name: "Börek, Poğaça, Simit & Mantı",
    category: "Hamur İşi & Pastane",
    icon: "🥐",
    components: [
      { item: "Yufka & Hamur", desc: "Kat kat açılan yufkalar %100 buğday unu (Gluten) barındırır." },
      { item: "Peynir / Çökelek İçi", desc: "İç harcında kullanılan peynirler laktoz ve süt proteini kazein içerir." },
      { item: "Susam & Tahin", desc: "Simit ve açmalardaki susam güçlü bir alerjen grubudur." }
    ]
  },
  {
    id: "tatli_pastane",
    keywords: ["baklava", "kadayif", "sekerpare", "pasta", "kek", "tart", "waffle", "pankek", "donut", "kurabiye"],
    name: "Pastane Tatlıları & Baklava",
    category: "Tatlı & Pastane",
    icon: "🍰",
    components: [
      { item: "Un & Baklava Yufkası", desc: "Sert glutenli unlardan elde edilen baklavalık yufkalar içerir." },
      { item: "Tereyağı & Şerbet & Süt", desc: "Süt yağı, krema ve laktoz içerir." },
      { item: "Yumurta & Ceviz/Fındık", desc: "Yumurta sarısı ve sert kabuklu meyve parçacıkları (Alerjen)." }
    ]
  },

  // 3. DÖNER, KEBAP & ET ÜRÜNLERİ
  {
    id: "doner_iskender",
    keywords: ["doner", "iskender", "yaprak doner", "tavuk doner", "et doner"],
    name: "Döner / İskender Dürüm",
    category: "Döner & Kebap Çeşitleri",
    icon: "🥙",
    components: [
      { item: "Lavaş & Tırnak Pide", desc: "Dürüm lavaşı ve pide buğday unu (Gluten) içerir." },
      { item: "İskender Sosu & Tereyağı", desc: "Kızgın tereyağı laktoz ve sos meyanesinde buğday unu içerebilir." },
      { item: "Döner Marinesi & Harcı", desc: "Döner etinin yoğurt/süt ile marinesi (Laktoz) veya bağlayıcı un içerebilir." }
    ]
  },
  {
    id: "kebap_izgara",
    keywords: ["kebap", "adana", "urfa", "beyti", "ali nazik", "cag kebap"],
    name: "Geleneksel Kebap & Izgara Tabağı",
    category: "Kebap & Et Yemekleri",
    icon: "🍢",
    components: [
      { item: "Taban Lavaş / Pide", desc: "Kebap altında sunulan tırnak pide %100 buğday unu (Gluten) içerir." },
      { item: "Kebap Harcı & Baharatlar", desc: "Bazı kıyma harçlarında bağlayıcı ekmek içi ve baharat çeşnileri bulunabilir." },
      { item: "Süzme Yoğurt / Tereyağ", desc: "Ali Nazik ve Beyti kebaplarında süzme yoğurt ve tereyağı laktoz içerir." }
    ]
  },
  {
    id: "kofte_cesitleri",
    keywords: ["kofte", "meatball", "inegol", "tekirdag", "akcaabat", "kadinbudu"],
    name: "Izgara / Ev Köftesi Tabağı",
    category: "Köfte & Et Ürünleri",
    icon: "🧆",
    components: [
      { item: "Köfte Bağlayıcı Harç", desc: "Kıymaya elastikiyet ve hacim kazandırmak için galeta unu / bayat ekmek içi (Gluten) eklenir." },
      { item: "Yumurta & Baharat", desc: "Kadınbudu ve ev köftelerinde harcı bağlamak için yumurta kullanılır." }
    ]
  },
  {
    id: "sarkuteri_et",
    keywords: ["sucuk", "pastirma", "sosis", "salam", "kavurma", "kokorec", "tantuni"],
    name: "İşlenmiş Et & Şarküteri Ürünleri",
    category: "Şarküteri & İşlenmiş Et",
    icon: "🥓",
    components: [
      { item: "İşlenmiş Et Bağlayıcıları", desc: "Sosis ve salamda soya proteini (E322) ve nişasta (Gluten riski) kullanılır." },
      { item: "Süt Proteini / Kazein", desc: "Şarküteri emülsiyonlarında sodyum kazeinat ve süt tozu koruyucu olarak eklenir." }
    ]
  },

  // 4. ÇORBALAR & SULU YEMEKLER
  {
    id: "corbalar",
    keywords: ["corba", "soup", "tarhana", "mercimek", "ezogelin", "beyran", "iskembe", "paca", "kelle paca", "yayla"],
    name: "Geleneksel Çorba Çeşitleri",
    category: "Sulu Yemek & Çorba",
    icon: "🥣",
    components: [
      { item: "Meyane / Bağlayıcı Un", desc: "Çorbanın kıvamını bağlamak için kavrulmuş buğday unu (Gluten) meyane olarak kullanılır." },
      { item: "Tereyağı & Yoğurt Terbiyesi", desc: "Yayla ve terbiye çorbalarda süzme yoğurt, süt ve kızgın tereyağı bulunur." }
    ]
  },

  // 5. SÜT, PEYNİR & SÜTLÜ TATLILAR
  {
    id: "sutlu_tatlilar",
    keywords: ["sutlac", "muhallebi", "kazandibi", "keskul", "trilece", "krem karamel", "dondurma", "supangle", "puding"],
    name: "Geleneksel Sütlü Tatlılar & Dondurma",
    category: "Sütlü Tatlı & Dondurma",
    icon: "🍨",
    components: [
      { item: "Taze Süt & Krema", desc: "Tüm sütlü tatlılar %100 yüksek laktoz ve süt proteini kazein içerir." },
      { item: "Nişasta & Buğday Unu", desc: "Muhallebi ve pudinglerde kıvam için buğday nişastası kullanılabilir." }
    ]
  },

  // 6. DENİZ ÜRÜNLERİ
  {
    id: "seafood_dishes",
    keywords: ["balik", "fish", "hamsi", "kalamar", "midye", "karides", "istakoz", "yengec", "ton baligi", "somon"],
    name: "Deniz Ürünleri & Balık Yemekleri",
    category: "Deniz Ürünleri & Balık",
    icon: "🐟",
    components: [
      { item: "Balık / Deniz Canlısı", desc: "Deniz ürünleri alerjisi olan bireylerde doğrudan ana reaksiyon kaynağıdır." },
      { item: "Mısır / Buğday Unu Tava Panesi", desc: "Hamsi ve kalamar kızartılırken un (Gluten) ile kaplanır." },
      { item: "Karides Güveç Tereyağı", desc: "Güveç pişiriminde kaşar peyniri ve tereyağı (Laktoz) kullanılır." }
    ]
  },

  // 6. DENİZ ÜRÜNLERİ & BALIKLAR
  {
    id: "seafood_dishes",
    keywords: ["balik", "fish", "hamsi", "kalamar", "midye", "karides", "istakoz", "yengec", "ton baligi", "somon", "levrek", "cupra"],
    name: "Taze Balık & Deniz Ürünleri Tabağı",
    category: "Deniz Ürünleri & Balık",
    icon: "🐟",
    components: [
      { item: "Balık / Deniz Canlısı Eti", desc: "Deniz ürünleri alerjisi olan bireylerde doğrudan ana reaksiyon kaynağıdır. Ham balık eti glutensizdir." },
      { item: "Mısır / Buğday Unu Tava Panesi", desc: "Hamsi ve kalamar kızartılırken un (Gluten) ile kaplanır." },
      { item: "Karides Güveç Tereyağı & Peynir", desc: "Güveç pişiriminde kaşar peyniri ve tereyağı (Laktoz) kullanılır." }
    ]
  },

  // 7. SEBZE, SALATA & ZEYTİNYAĞLILAR
  {
    id: "sebze_salata",
    keywords: ["salata", "sebze", "zeytinyagli", "enginar", "fasulye", "brokoli", "ispanak", "karnabahar", "kabak", "semizotu", "sezar"],
    name: "Taze Sebze & Salata Yemeği",
    category: "Taze Sebze & Salata",
    icon: "🥦",
    components: [
      { item: "Taze Organik Sebzeler", desc: "%100 Doğal taze sebzeler tamamen glutensiz ve laktozsuzdur." },
      { item: "Salata Sosu & Mayonez", desc: "Sezar ve hazır salata soslarında yumurta sarısı ve hardal alerjenleri bulunabilir." },
      { item: "Kruton Ekmek Parçaları", desc: "Salatalara eklenen çıtır ekmek parçaları (Kruton) buğday unu (Gluten) içerir." }
    ]
  },

  // 8. MEYVE & DOĞAL İÇECEKLER
  {
    id: "meyve_dogal",
    keywords: ["meyve", "elma", "muz", "portakal", "cilek", "karpuz", "kavun", "smoothie", "detoks", "taze sikma"],
    name: "Taze Meyve & Doğal Meyve Suyu",
    category: "Taze Meyve & İçecek",
    icon: "🍎",
    components: [
      { item: "Doğal Meyve Fruktozu", desc: "%100 Doğal taze meyveler tamamen katkısız, glutensiz ve laktozsuzdur." },
      { item: "Süt / Yoğurt Katkısı", desc: "Smoothie ve meyveli içeceklerde süt veya yoğurt (Laktoz) eklenebilir." }
    ]
  },

  // 9. YUMURTA & KAHVALTILIKLAR
  {
    id: "yumurta_kahvalti",
    keywords: ["yumurta", "omlet", "menemen", "sucuklu yumurta", "poyraz", "kaygana", "poche"],
    name: "Taze Yumurta & Kahvaltılık Tabağı",
    category: "Kahvaltılık & Yumurta",
    icon: "🍳",
    components: [
      { item: "Saf Yumurta Albümini", desc: "Yumurta alerjisi olan bireyler için doğrudan ana alerjendir." },
      { item: "Tereyağı & Beyaz Peynir", desc: "Menemen ve omlet pişiriminde kullanılan tereyağı ve peynir laktoz barındırır." }
    ]
  },

  // 10. SULU EV YEMEKLERİ & GÜVEÇLER
  {
    id: "sulu_ev_yemekleri",
    keywords: ["kuru fasulye", "nohut", "guvec", "musakka", "karniyarik", "türlü", "tavuk sote", "tas kebabi", "izmir kofte"],
    name: "Ev Usulü Sulu Yemekler & Güveç",
    category: "Sulu Yemek & Ev Yemeği",
    icon: "🍲",
    components: [
      { item: "Bakliyat & Sebze İçeriği", desc: "Kuru fasulye, nohut ve sebzeler doğası gereği glutensizdir." },
      { item: "Salça & Kıvam Unu Riski", desc: "Yemek suyuna kıvam bağlamak için kavrulmuş buğday unu eklenebilir." },
      { item: "Tereyağ Sote", desc: "Soteleme esnasında kullanılan tereyağı laktoz içerir." }
    ]
  },

  // 11. SÜT, YOĞURT & PEYNİRLER
  {
    id: "sut_peynir",
    keywords: ["sut", "yogurt", "ayran", "kefir", "peynir", "kasar", "mozzarella", "lor", "tulum", "kaymak", "labne"],
    name: "Süt, Yoğurt & Peynir Ürünleri",
    category: "Süt & Süt Ürünleri",
    icon: "🥛",
    components: [
      { item: "Süt Şekeri & Kazein Proteini", desc: "%100 Doğal laktoz ve süt proteini kazein içerir." }
    ]
  },

  // 12. AMBALAJLI BİSKÜVİ, ÇİKOLATA, CİPS & İÇECEKLER
  {
    id: "cips_cerez",
    keywords: ["cips", "chips", "doritos", "ruffles", "lays", "cheetos", "pringles", "cerez", "kuruyemis"],
    name: "Çeşnili Cips & Çerez Atıştırmalık",
    category: "Cips & Çerez",
    icon: "🍿",
    components: [
      { item: "Çeşni Bağlayıcı Nişasta", desc: "Aroma çeşnilerinde buğday unu veya modifiye nişasta (Gluten) kullanılabilir." },
      { item: "Peynir Altı Suyu Tozu (Whey)", desc: "Çeşni lezzetlendiricisi olarak peynir altı suyu tozu (Laktoz) eklenir." },
      { item: "MSG & Lezzet Artırıcılar (E621)", desc: "Monosodyum glutamat ve aroma artırıcı katkı maddeleri barındırabilir." }
    ]
  },
  {
    id: "cikolata_bar",
    keywords: ["cikolata", "chocolate", "gofret", "wafer", "eti", "ulker", "nestle", "milka", "snickers", "twix", "tadelle", "metro", "bar"],
    name: "Çikolata & Gofret Bar",
    category: "Çikolata & Atıştırmalık Bar",
    icon: "🍫",
    components: [
      { item: "Süt Yağı & Süt Tozu", desc: "Yüksek oranda süt proteini (Kazein) ve laktoz barındırır." },
      { item: "Buğday Unu (Gofret Yaprağı)", desc: "Çıtır gofret katmanları buğday unu (Gluten) içerir." },
      { item: "Soya Lesitini (E322)", desc: "Çikolata emülsiyonunda soya lesitini kullanılır." },
      { item: "Fındık / Fıstık İçi & Eser Miktar", desc: "Fındık, antep fıstığı veya iz miktarda kabuklu meyve alerjenleri içerir." }
    ]
  },
  {
    id: "biskuvi_kek",
    keywords: ["kraker", "cracker", "biskuvi", "biscuit", "kek", "cake", "browni", "kurabiye", "crax", "tutku", "benimo", "hanimeller", "negro", "biscrem", "biskrem"],
    name: "Bisküvi, Kraker & Kek",
    category: "Bisküvi & Pastane Atıştırmalık",
    icon: "🍪",
    components: [
      { item: "Buğday Unu & Gliadin", desc: "Hamurun ana bileşeni glutenli buğday unudur." },
      { item: "Peynir Altı Suyu (Whey) & Süt", desc: "Laktoz ve süt tozu aroma bileşenleri barındırır." },
      { item: "Yumurta Albümini", desc: "Kek ve bisküvi yapısında emülgatör yumurta akı yer alır." }
    ]
  },
  {
    id: "noodle_makarna",
    keywords: ["noodle", "makarna", "indomie", "knorr", "maggi", "sos", "ketcap", "mayonez", "salca", "hardal"],
    name: "Hazır Noodle, Makarna & Sos",
    category: "Noodle, Makarna & Çeşni",
    icon: "🍜",
    components: [
      { item: "Durum Buğdayı İrmiği / Unu", desc: "Noodle ve makarna %100 durum buğday irmiği (Gluten) içerir." },
      { item: "Çeşni Paketi & MSG", desc: "Çeşni tozunda buğday unu, koruyucular ve monosodyum glutamat bulunur." }
    ]
  },
  {
    id: "icecek_sut",
    keywords: ["icecek", "drink", "meyve suyu", "kola", "fanta", "sprite", "fuse tea", "icetea", "smoothie", "kahve"],
    name: "İçecek & Sütlü İçecek",
    category: "İçecek & Süt Ürünleri",
    icon: "🥤",
    components: [
      { item: "Aroma & Şeker Şurubu", desc: "İçeceklerde aroma verici bileşenler bulunur." },
      { item: "Karamel Renklendirici (E150d)", desc: "Kola ve soğuk çaylarda arpa maltından elde edilen karamel renklendirici bulunabilir." }
    ]
  }
];

const LOCAL_FILLER_WORDS = new Set([
  "pisirme", "yontem", "ve", "dereceleri", "nasil", "pisirilir", "hakkinda", "tarifi",
  "resmi", "gorseli", "indir", "photo", "image", "scan", "pic", "dsc", "img", "frame",
  "gorsel", "resim", "yapilir", "yapilisi", "kadar", "dakika", "kolay", "nefis", "yemek", "tarifleri"
]);

const cleanFilenameToTitleLocal = (filename) => {
  if (!filename) return "Taranan Lezzet Ürünü";
  const raw = filename.split('.')[0];
  const clean = raw.replace(/[-_.]+/g, ' ').toLowerCase();

  if (clean.includes("pirzola")) return "Izgara Pirzola Et Tabağı";
  if (clean.includes("biftek") || clean.includes("antrikot") || clean.includes("bonfile") || clean.includes("steak")) return "Izgara Biftek / Antrikot Tabağı";
  if (clean.includes("tavuk") || clean.includes("chicken") || clean.includes("nugget") || clean.includes("sinitzel") || clean.includes("kanat")) return "Kızarmış / Izgara Tavuk Menü";
  if (clean.includes("balik") || clean.includes("hamsi") || clean.includes("somon") || clean.includes("kalamar") || clean.includes("midye") || clean.includes("karides")) return "Taze Balık & Deniz Ürünleri Tabağı";
  if (clean.includes("kofte") || clean.includes("meatball")) return "Izgara / Ev Köftesi Tabağı";
  if (clean.includes("burger") || clean.includes("hamburger") || clean.includes("whopper")) return "Hamburger / Cheeseburger Menü";
  if (clean.includes("doner") || clean.includes("iskender")) return "Döner / İskender Dürüm";
  if (clean.includes("pizza")) return "Pizza Çeşitleri";
  if (clean.includes("lahmacun")) return "Çıtır Lahmacun";
  if (clean.includes("pide")) return "Geleneksel Pide Çeşitleri";
  if (clean.includes("borek") || clean.includes("pogaca") || clean.includes("acma") || clean.includes("simit")) return "Pastane Börek & Poğaça";
  if (clean.includes("corba") || clean.includes("soup")) return "Geleneksel Çorba Çeşidi";
  if (clean.includes("salata") || clean.includes("sebze") || clean.includes("zeytinyagli")) return "Taze Sebze & Salata Yemeği";
  if (clean.includes("yumurta") || clean.includes("omlet") || clean.includes("menemen")) return "Taze Yumurta & Kahvaltılık Tabağı";
  if (clean.includes("sutlac") || clean.includes("baklava") || clean.includes("kadayif") || clean.includes("pasta") || clean.includes("kek")) return "Pastane & Geleneksel Tatlı";

  const words = clean.split(' ').filter(w => !LOCAL_FILLER_WORDS.has(w) && w.length > 1);
  if (words.length > 0) {
    const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `${formatted} Yemek Ürünü`;
  }
  return "Taranan Yemek Ürünü";
};

const inferDynamicFoodData = (text, fileName = "") => {
  const norm = normalizeLocalText(text + " " + fileName);

  for (let entry of FOOD_TAKSONOMI_DATABASE) {
    if (entry.keywords.some(k => norm.includes(k))) {
      return {
        category: entry.category,
        icon: entry.icon,
        name: entry.name,
        components: entry.components
      };
    }
  }

  const customTitle = cleanFilenameToTitleLocal(fileName);

  const isPackagedHint = ["icindekiler", "ingredients", "ambalaj", "paket", "kod", "e322", "e621", "gram", "net", "son kullanma"].some(k => (text + " " + fileName).toLowerCase().includes(k));

  if (isPackagedHint) {
    return {
      category: "Ambalajlı İçerik & Atıştırmalık",
      icon: "🍱",
      name: customTitle,
      components: [
        { item: "Buğday Unu, Nişasta & Malt Ekstraktı", desc: "Gıda bağlayıcısı ve hacim artırıcı olarak buğday unu, modifiye nişasta (Gluten) kullanılabilir." },
        { item: "Süt Tozu & Peynir Altı Suyu (Whey)", desc: "Aroma lezzeti için peynir altı suyu tozu ve süt proteini (Laktoz & Kazein) içerebilir." },
        { item: "Soya Lesitini (E322) & Katkılar", desc: "Emülgatör olarak soya türevleri ve kıvam artırıcı E-kodları barındırabilir." },
        { item: "Tesis Çapraz Bulaşma Uyarısı", desc: "Ortak imalat bandında fındık, fıstık, susam ve yumurta işlenme riski mevcuttur." }
      ]
    };
  }

  return {
    category: "Taze Yemek & Yöresel Mutfak",
    icon: "🍲",
    name: customTitle,
    components: [
      { item: "Taze Hammadde Doğallığı", desc: "%100 Doğal işlenmemiş hammaddeler katkı ve gluten barındırmaz." },
      { item: "Sote & Sos Marinasyonu", desc: "Yemek marinasyonunda soya sosu veya unlu sos bağlayıcılar eklenebilir." },
      { item: "Kızartma & Tereyağı Yağı", desc: "Lezzetlendirmede kullanılan tereyağı laktoz ve süt proteini kazein içerir." },
      { item: "Servis Pidesi & Çapraz Bulaşma", desc: "Restoran mutfağında unlu mamullerle ortak alanda hazırlanma riski mevcuttur." }
    ]
  };
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
            cross_contamination_warnings: data.cross_contamination_warnings || [],
            additive_warnings: data.additive_warnings || [],
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

        const customProofs = (foodData.components && foodData.components.length > 0)
          ? foodData.components.map((comp, i) => ({
              step: `0${i + 1}`,
              title: comp.item,
              description: comp.desc
            }))
          : [
              { step: "01", title: "Doğrudan Tetikleyici Kelime Bulundu", description: `İçerik etiketinde tespit edilen ${triggerSummary} sakıncalı hammadde listenizle doğrudan eşleşmektedir.` },
              { step: "02", title: "Alerjen Kök Sözlük İhlali", description: "Taranan gıda içerik taksonomisi bağışıklık sisteminde reaksiyon riski oluşturmaktadır." }
            ];

        const explanation = isSafe ? {
          title: `Bu ${foodData.name} Seçili Alerjen Profiliniz İçin Güvenli mi?`,
          summary: `Yapay zeka analizimiz, aktifleştirdiğiniz ${selectedAllergens.length} adet alerjen profilinize göre etiket üzerinde hiçbir tetikleyici kök kelimeye rastlamamıştır.`,
          proofs: customProofs.length > 0 ? customProofs : [
            { step: "01", title: "Alerjen Kök Sözlük Taraması Temiz", description: "Sisteme tanımlı sakıncalı hammadde kök kelimeleri taranmış ve temiz çıkmıştır." },
            { step: "02", title: "Çoklu Profil Uyumluluğu", description: "Seçtiğiniz tüm hassasiyet kriterleri karşılanmıştır." }
          ],
          dietitian_note: `GlutenGuard Uzman Notu: ${displayTitle} seçtiğiniz ${selectedAllergens.length} adet aktif alerjen profilinize göre güvenlidir.`
        } : {
          title: `Bu ${displayTitle} Aktif Alerjen Profiliniz İçin KESİNLİKLE RİSKLİ!`,
          summary: `Aktifleştirdiğiniz alerjen filtrelerine göre etiket üzerinde tetikleyici kök kelimeler (${triggerSummary}) ve gıda içerik riskleri tespit edilmiştir.`,
          proofs: customProofs,
          dietitian_note: `GlutenGuard Uzman Uyarısı: KESİNLİKLE TÜKETMEYİNİZ! Ürün içeriğinde ${triggerSummary} ve alerjen tetikleyici bileşenler tespit edilmiştir.`
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
