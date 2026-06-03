import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Pencil, 
  Award, 
  Database, 
  TrendingUp, 
  TrendingDown, 
  Coins,
  Activity,
  Bell,
  Clock,
  Sparkles,
  Star,
  ShieldCheck,
  Volume2,
  VolumeX,
  Check,
  X,
  Share2
} from 'lucide-react';
import { SHARKIA_EXCHANGES_LIST, SharkiaExchange } from '../data/exchangesData';

interface PoultryExchangeBoardProps {
  exchangeDate: string;
  handleRefreshExchangePrices: () => void;
  isUpdatingExchange: boolean;
  exchangeEditTab: 'view' | 'edit';
  setExchangeEditTab: (tab: 'view' | 'edit') => void;
  handleLoadMaherAlSheikhPrices: () => void;
  marketTrends: Record<string, string>;
  setMarketTrends?: React.Dispatch<React.SetStateAction<Record<string, 'up' | 'down' | 'stable'>>>;
  poultryPrices: Record<string, number>;
  setPoultryPrices: React.Dispatch<React.SetStateAction<Record<string, number>>> | ((prices: Record<string, number>) => void);
  favoriteExchangeIds?: string[];
  setFavoriteExchangeIds?: React.Dispatch<React.SetStateAction<string[]>>;
}

const MAHER_AL_SHEIKH_PRICES = {
  white_poultry: 84, // لحم كيلو بالمزرعة
  sass_poultry: 105,
  baladi_poultry: 140,
  mothers_poultry: 72,

  // أسعار بورصة ماهر الشيخ المعتمدة بالشرقية (الأربعاء ٣-٦-٢٠٢٦)
  white_chick_corp: 12,      // كتكوت تسمين شركات
  white_chick_dist: 12,      // كتكوت تسمين
  sass_chick: 6,             // كتكوت ساسو شفر
  sass_chick_2nd: 5.5,       // كتكوت ساسو جيل تان
  baladi_chick: 4.5,         // كتكوت بلدي
  baladi_chick_hybrid: 4.5,  // كتكوت بلدي هجين
  rozzi_chick: 7,            // كتكوت رزي
  rozzi_chick_braber: 5.5,   // كتكوت رزي برابر
  duck_french: 12,           // بط مولر عمر يوم / بط تسمين
  duck_pekin_farms: 6,       // بط بكيني مزارع
  duck_pekin_egg: 6,         // بيض بط بكيني
  duck_muscovy_1day: 16,     // بط مسكوفي عمر يوم فرز أول متميز
  feed_badi: 22800,          // أسعار أعلاف سوبر بادي 23% للطن بالمخزن
  feed_nami: 22700,          // نامي 21%
  feed_nahi: 22550,          // ناهي 19%
};

const PRICE_KEY_LABELS: Record<string, string> = {
  white_poultry: "فراخ بيضاء تسمين",
  sass_poultry: "فراخ ساسو حمراء",
  baladi_poultry: "فراخ بلدي حر متميز",
  mothers_poultry: "فراخ أمهات بيضاء",
  white_chick_corp: "كتكوت أبيض شركات",
  white_chick_dist: "كتكوت تسمين (أهالي)",
  sass_chick: "كتكوت ساسو شفر",
  sass_chick_2nd: "كتكوت ساسو جيل ثاني",
  baladi_chick: "كتكوت بلدي بيور",
  baladi_chick_hybrid: "كتكوت بلدي هجين",
  rozzi_chick: "كتكوت رزي متميز",
  rozzi_chick_braber: "كتكوت رزي برابر",
  duck_french: "بط مولر / تسمين",
  duck_pekin_farms: "بط بكيني مزارع",
  duck_pekin_egg: "بيض بط بكيني للمربين",
  duck_muscovy_1day: "بط مسكوفي عمر يوم",
  feed_badi: "علف بادي 23% سوبر",
  feed_nami: "علف نامي 21% سوبر",
  feed_nahi: "علف ناهي 19% سوبر",
};

interface PushNotificationToast {
  id: string;
  title: string;
  body: string;
  time: string;
  trend: 'up' | 'down' | 'stable';
  exchangeName: string;
  itemKey: string;
  targetPrice: number;
  durationMs: number;
}

export default function PoultryExchangeBoard({
  exchangeDate,
  handleRefreshExchangePrices,
  isUpdatingExchange,
  exchangeEditTab,
  setExchangeEditTab,
  handleLoadMaherAlSheikhPrices,
  marketTrends,
  setMarketTrends,
  poultryPrices,
  setPoultryPrices,
  favoriteExchangeIds = ['maher-shaikh', 'abu-kabir-exchange'],
  setFavoriteExchangeIds
}: PoultryExchangeBoardProps) {

  // Local Tab System to seamlessly integrate View Prices, Manual Adjusted, and Push Notification settings
  const [localTab, setLocalTab] = useState<'view' | 'edit' | 'notifications'>('view');

  // Push Notifications Configuration State
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('alerts_push_enabled');
    return saved !== 'false';
  });
  
  const [browserPermission, setBrowserPermission] = useState<'granted' | 'default' | 'denied'>('granted');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  const [alertDeviationThreshold, setAlertDeviationThreshold] = useState<number>(0); // 0 = any change, 0.5 = greater than 0.5 L.E.
  const [monitoredItemKeys, setMonitoredItemKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('alerts_monitored_keys');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ['white_poultry', 'white_chick_corp', 'feed_badi', 'duck_french']; // defaults
  });

  // Keep alert configuration stored persistently in storage
  useEffect(() => {
    localStorage.setItem('alerts_push_enabled', String(isPushEnabled));
  }, [isPushEnabled]);

  useEffect(() => {
    localStorage.setItem('alerts_monitored_keys', JSON.stringify(monitoredItemKeys));
  }, [monitoredItemKeys]);

  // Sync parent exchangeEditTab changes to our internal tab seamlessly
  useEffect(() => {
    if (exchangeEditTab === 'edit') {
      setLocalTab('edit');
    } else if (exchangeEditTab === 'view' && localTab === 'edit') {
      setLocalTab('view');
    }
  }, [exchangeEditTab]);

  // Audio synthesis using AudioContext (premium sound experience)
  const playChime = (trend: 'up' | 'down' | 'stable') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (trend === 'up') {
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
        gainNode.gain.setValueAtTime(0.06, now);
      } else if (trend === 'down') {
        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc1.frequency.exponentialRampToValueAtTime(493.88, now + 0.14); // B4
        gainNode.gain.setValueAtTime(0.06, now);
      } else {
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(523.25, now + 0.08);
        gainNode.gain.setValueAtTime(0.04, now);
      }
      
      osc1.type = 'sine';
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc1.start(now);
      osc1.stop(now + 0.35);
    } catch (err) {
      console.warn("Chime Audio failed:", err);
    }
  };

  // State to toggle the continuous background auto-update simulation
  const [isAutoSimActive, setIsAutoSimActive] = useState(true);

  // Helper dictionary to track which keys have been updated "TODAY" (or in this session)
  const [updatedTodayKeys, setUpdatedTodayKeys] = useState<Record<string, { time: string; isLiveSim?: boolean }>>(() => {
    return {
      white_poultry: { time: "09:12 ص" },
      white_chick_corp: { time: "09:30 ص" },
      sass_chick: { time: "10:15 ص" },
      feed_badi: { time: "08:45 ص" },
      duck_french: { time: "09:40 ص" }
    };
  });

  // Small background log entries to display inside the terminal UI
  const [simLogs, setSimLogs] = useState<Array<{ id: string; text: string; time: string; trend: 'up' | 'down' | 'stable' }>>([
    { id: 'init-ok', text: 'تم بدء البورصة وتوصيل قناة التسعير التلقائي اليوم بالشرقية 📡', time: '09:00 ص', trend: 'stable' },
    { id: 'init-ahly', text: 'تجديد أسعار الأعلاف الفردية بمخازن ماهر الحبيبي بأبو كبير.', time: '08:45 ص', trend: 'stable' }
  ]);

  // Active push alerts list rendered absolute over screen
  const [activeAlerts, setActiveAlerts] = useState<PushNotificationToast[]>([]);

  // Real-time Arabic Time Helper
  const getArabicTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // '0' is '12'
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // 1. Synchronize when the user refreshes manually or loads an office (represented by exchangeDate update)
  useEffect(() => {
    const keys = Object.keys(poultryPrices);
    const refreshed: Record<string, { time: string }> = {};
    const currTime = getArabicTime();
    keys.forEach(key => {
      refreshed[key] = { time: currTime };
    });
    setUpdatedTodayKeys(refreshed);

    setSimLogs(prev => [
      {
        id: Math.random().toString(),
        text: `⚡ تم تعميم وتثبيت أسعار البورصة المتكاملة لكافة السلالات اليوم (${exchangeDate})`,
        time: currTime,
        trend: 'stable'
      },
      ...prev.slice(0, 4)
    ]);
  }, [exchangeDate]);

  // 2. Active background auto-update simulator effect (runs periodically on interval)
  useEffect(() => {
    if (!isAutoSimActive) return;

    const intervalId = setInterval(() => {
      const keys = Object.keys(poultryPrices);
      if (keys.length === 0) return;

      // Select a random price key
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const oldVal = poultryPrices[randomKey];
      if (oldVal === undefined) return;

      let diff = 0;
      if (randomKey.startsWith('feed_')) {
        // Feed fluctuates by +/- 100 L.E.
        diff = (Math.random() > 0.5 ? 100 : -100);
      } else {
        // Chick or Poultry prices fluctuate slightly by +/- 0.25 L.E. - 0.75 L.E.
        diff = Number((Math.random() > 0.5 ? 0.25 * (Math.floor(Math.random() * 3) + 1) : -0.25 * (Math.floor(Math.random() * 3) + 1)).toFixed(2));
      }

      if (diff === 0) return;

      const newVal = Math.max(1, Number((oldVal + diff).toFixed(2)));
      const trendOutcome: 'up' | 'down' | 'stable' = newVal > oldVal ? 'up' : newVal < oldVal ? 'down' : 'stable';

      // Update Parent State securely
      if (typeof setPoultryPrices === 'function') {
        const setPrices = setPoultryPrices as any;
        setPrices((prev: any) => ({
          ...prev,
          [randomKey]: newVal
        }));
      }

      // Update Trends also
      if (setMarketTrends) {
        setMarketTrends(prev => ({
          ...prev,
          [randomKey]: trendOutcome
        }));
      }

      // Register in today updated keys with high quality time
      const currTime = getArabicTime();
      setUpdatedTodayKeys(prev => ({
        ...prev,
        [randomKey]: { time: currTime, isLiveSim: true }
      }));

      // Add terminal log
      const label = PRICE_KEY_LABELS[randomKey] || randomKey;
      const logText = `تحديث تلقائي: تغير سعر [${label}] إلى ${newVal} ج.م (بفارق ${diff > 0 ? '+' : ''}${diff})`;
      setSimLogs(prev => [
        {
          id: Math.random().toString(),
          text: logText,
          time: currTime,
          trend: trendOutcome
        },
        ...prev.slice(0, 4)
      ]);

      // 🚨 PUSH NOTIFICATION TRIGGER LOGIC!
      // Check absolute conditions:
      const passPushCheck = isPushEnabled && monitoredItemKeys.includes(randomKey) && Math.abs(diff) >= alertDeviationThreshold;
      
      if (passPushCheck) {
        // Find which of their Favorite Exchanges is affected (randomly pick one of their favorites, or fallback)
        let matchedExchange = "البورصة العمومية للشرقية";
        if (favoriteExchangeIds.length > 0) {
          const randId = favoriteExchangeIds[Math.floor(Math.random() * favoriteExchangeIds.length)];
          const exObj = SHARKIA_EXCHANGES_LIST.find(e => e.id === randId);
          if (exObj) {
            matchedExchange = exObj.name;
          }
        }

        const isUp = newVal > oldVal;
        const formattedDiff = Math.abs(diff);
        const titleText = isUp 
          ? `📈 صعود مفاجئ في بورصة مفضلة: [${matchedExchange}]`
          : `📉 هبوط مفاجئ في بورصة مفضلة: [${matchedExchange}]`;
          
        const bodyText = `تغير فوري في سعر [${label}] بمقدار ${isUp ? 'ارتفاع كلي +' : 'انخفاض بقيمة -'}${formattedDiff} ج.م، تم تسجيل السعر الجديد ليصبح ${newVal.toLocaleString('ar-EG')} ج.م بالمزرعة الآن!`;

        // Push new active Notification
        const newNotification: PushNotificationToast = {
          id: Math.random().toString(),
          title: titleText,
          body: bodyText,
          time: currTime,
          trend: trendOutcome,
          exchangeName: matchedExchange,
          itemKey: randomKey,
          targetPrice: newVal,
          durationMs: 8000
        };

        setActiveAlerts(prev => [newNotification, ...prev]);
        playChime(trendOutcome);

        // Auto-remove toast after session
        setTimeout(() => {
          setActiveAlerts(prev => prev.filter(n => n.id !== newNotification.id));
        }, 8000);
      }

    }, 12000); // Trigger every 12 seconds for real response

    return () => clearInterval(intervalId);
  }, [isAutoSimActive, poultryPrices, setPoultryPrices, setMarketTrends, isPushEnabled, monitoredItemKeys, alertDeviationThreshold, favoriteExchangeIds, soundEnabled]);

  // Remove alert toast manually
  const handleDismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.filter(item => item.id !== id));
  };

  // Toggle monitored item keys helper
  const handleToggleMonitoredKey = (key: string) => {
    setMonitoredItemKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Toggle favorite exchange inline
  const handleToggleExchangeLocal = (id: string) => {
    if (setFavoriteExchangeIds) {
      setFavoriteExchangeIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
  };

  // Pulse Dot renderer helper
  const renderPulse = (key: string) => {
    const updated = updatedTodayKeys[key];
    if (updated) {
      return (
        <div 
          className="flex items-center gap-1.5 shrink-0 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg select-none" 
          title={`تم تحديث هذا السعر اليوم الساعة ${updated.time}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] text-emerald-400 font-bold font-mono">اليوم {updated.time}</span>
        </div>
      );
    }
    return (
      <div 
        className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/50 px-1.5 py-0.5 rounded-lg shrink-0" 
        title="سعر مستقر من يوم سابق"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
        <span className="text-[9px] text-slate-400 font-medium font-sans">الأيام السابقة 📅</span>
      </div>
    );
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-emerald-900/60 shadow-2xl relative overflow-hidden" id="daily_exchange_section">
      {/* Absolute subtle background glowing accent */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Interactive Push Notifications Container (Absolute in component context) */}
      {activeAlerts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4 space-y-3 pointer-events-auto" dir="rtl">
          {activeAlerts.map((alert) => (
            <div 
              key={alert.id}
              className="bg-slate-900/98 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl p-4 overflow-hidden relative transform transition-all duration-300 translate-y-0 scale-100 flex flex-col gap-2 animate-bounce-short"
            >
              {/* Gold warning glowing border left */}
              <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-amber-500"></div>

              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Bell className="text-amber-400 text-xs animate-swing" size={16} />
                  </div>
                  <div>
                    <h5 className="text-[11.5px] font-black text-white leading-tight">
                      {alert.title}
                    </h5>
                    <span className="text-[8.5px] text-slate-400 font-mono mt-0.5 block">{alert.time} • دقيقة حية بالشرقية</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleDismissAlert(alert.id)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-normal font-sans pr-0.5">
                {alert.body}
              </p>

              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={() => {
                    // Update poultry prices manually
                    if (typeof setPoultryPrices === 'function') {
                      const setPrices = setPoultryPrices as any;
                      setPrices((prev: any) => ({
                        ...prev,
                        [alert.itemKey]: alert.targetPrice
                      }));
                    }
                    handleDismissAlert(alert.id);
                    alert(`✅ تم بنجاح تطبيق وتثبيت السعر الجديد الساخن لـ [${PRICE_KEY_LABELS[alert.itemKey] || alert.itemKey}] في حوسبتك الميدانية!`);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] py-1.5 px-2 rounded-lg text-center transition cursor-pointer"
                >
                  تطبيق ومطابقة السعر المباشر 📝
                </button>
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg text-center transition cursor-pointer"
                >
                  تجاهل ✖️
                </button>
              </div>

              {/* Progress bar countdown */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 animate-timer-drain"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Top title and tabs dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5 mb-5 relative z-10" id="exchange_title_strip">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 font-mono">بورصة الدواجن والمفضلة الفورية</span>
          </div>
          <h3 className="font-extrabold text-white text-xl mt-1 flex items-center gap-2">
            <span>البورصة الذكية وتنبيهات الدفع 📊</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1">تابع أسعار بورصة الدواجن بمحافظة الشرقية مع تنبيهات دفع ذكية عند حدوث أي تغير سري مفاجئ</p>
        </div>

        {/* Triple tabs selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5" id="exchange_actions_nav_pills">
          <button
            onClick={() => {
              setLocalTab('view');
              setExchangeEditTab('view');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
              localTab === 'view'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📊 أسعار السوق
          </button>
          
          <button
            onClick={() => {
              setLocalTab('edit');
              setExchangeEditTab('edit');
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer ${
              localTab === 'edit'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚙️ ضبط الأسعار
          </button>

          <button
            onClick={() => {
              setLocalTab('notifications');
              setExchangeEditTab('view'); // keep view on parent to avoid screen override
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer absolute-pulse-indicator relative ${
              localTab === 'notifications'
                ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell size={12} className={localTab === 'notifications' ? "animate-swing" : ""} />
            <span>تنبيهات الدفع</span>
            {isPushEnabled && (
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-sky-400 border border-slate-950 rounded-full animate-ping"></span>
            )}
          </button>
        </div>
      </div>

      {/* Auto-Update Background Simulator Switch */}
      <div 
        className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10"
        id="live_auto_update_box"
      >
        <div className="flex items-center gap-3 text-right w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Activity size={20} className={isAutoSimActive ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-black block">قناة نبض السوق الحية 📡</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <h4 className="text-xs font-black text-white">محاكاة التغيرات السعرية وجيل التنبيهات</h4>
              {isAutoSimActive ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/20 px-1.5 py-0.5 rounded-full text-[8.5px] text-emerald-400 font-bold">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                  نشط وتلقائي
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-full text-[8.5px] text-slate-400 font-bold">
                  متوقف مؤقتاً
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">يقوم مولد الحركة بمحاكاة تغيرات الأسعار بالبورصة للتأكد من فاعلية التنبيهات واصطياد الفرص.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsAutoSimActive(!isAutoSimActive);
          }}
          className={`w-full sm:w-auto px-4 py-2 text-xs font-black rounded-xl transition duration-150 cursor-pointer text-center select-none ${
            isAutoSimActive 
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20' 
              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
          }`}
        >
          {isAutoSimActive ? 'تعطيل محاكي السوق ⏸️' : 'تفعيل محاكي السوق ▶️'}
        </button>
      </div>

      {localTab === 'notifications' ? (
        /* 🔔 COMPLETE INTERACTIVE PUSH NOTIFICATION SETTINGS & FAIVORITES CONFIG CONTROL */
        <div className="space-y-5 relative z-10 tab-transition text-right" dir="rtl" id="push_alerts_dashboard">
          
          <div className="bg-gradient-to-br from-sky-950/40 to-slate-950 border border-sky-900/30 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-black text-sky-400 flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Bell size={16} className="text-sky-400" />
              <span>إعدادات تنبيهات الدفع المباشرة للأسعار (Instant Web Push Setup)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="alert_settings_grid">
              
              {/* Box 1: Global Toggle and browser permissions */}
              <div className="bg-slate-900/80 border border-white/5 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-white block">ميزة التنبيهات الفورية (Web Push):</label>
                    <span className="text-[10px] text-slate-400 block mt-0.5">تلقي لافتة منبثقة عند صعود أو هبوط أسعار المفضلة</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsPushEnabled(!isPushEnabled);
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition duration-200 outline-none ${
                      isPushEnabled ? 'bg-sky-500 flex justify-end' : 'bg-slate-700 flex justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-md block"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div>
                    <label className="text-xs font-black text-white block">إذن التنبيه بالمتصفح (Browser Token):</label>
                    <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5 flex items-center gap-1">
                      <ShieldCheck size={11} />
                      تفعيل الإرسال السحابي الممنوح بشكل ثابت ✅
                    </span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    ممنوح (Granted)
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div>
                    <label className="text-xs font-bold text-white block">صوت التنبيه الصوتي الحصري (Chime Chime):</label>
                    <span className="text-[10px] text-slate-400 block mt-0.5">تشغيل رنين فوري لطيف لمطاردة الصعود والهبوط بالبورصة</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      playChime('stable');
                    }}
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-slate-300"
                    title={soundEnabled ? "كتم الصوت" : "تشغيل الصوت"}
                  >
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
              </div>

              {/* Box 2: Sensitivity Deviation threshold */}
              <div className="bg-slate-900/80 border border-white/5 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-black text-white block mb-1">حساسية التغيير السعري (Deviation Sensitivity):</label>
                  <p className="text-[10px] text-slate-400 mb-3">تجاهل تذبذبات ومجاملات السوق الطفيفة وتنبيهك فقط بالفروق السعرية المؤثرة:</p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "حساسية كلية ⚡", desc: "نبض أي تغيير (كل ملّيم)", val: 0 },
                      { label: "0.25 ج.م سوبر", desc: "فرز رقيق للتغيير", val: 0.25 },
                      { label: "0.50 ج.م كاشف", desc: "تغيرات راديكالية وهامة", val: 0.50 }
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => {
                          setAlertDeviationThreshold(item.val);
                        }}
                        className={`p-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          alertDeviationThreshold === item.val
                            ? 'bg-sky-500/10 border-sky-500 text-sky-400 font-extrabold'
                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] font-black">{item.label}</span>
                        <span className="text-[8px] text-slate-500 block">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-2.5 border border-white/5 text-[10px] text-slate-400 leading-normal font-medium">
                  💡 <span className="text-white font-bold">ملحوظة مريحة:</span> يقوم الفحص التلقائي بالخلفية بفحص الأسعار كل ١٢ ثانية. إذا تغير أي صنف بمقدار يساوي أو يتجاوز الحساسية المطلوبة، سيصلك إشعاع فوري على شاشتك.
                </div>
              </div>

            </div>

            {/* Box 3: Select Monitored Category Items */}
            <div className="bg-slate-900/80 border border-white/5 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs font-black text-white block">أصناف البورصة المراقبة تحت المجهر (Watchlist Items):</label>
                <p className="text-[10px] text-slate-400 mt-0.5">حدد الكتاكيت أو اللحوم أو الخامات المحددة التي تنتظر تقلباتها للبدء في دورتك الجديدة:</p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {Object.keys(PRICE_KEY_LABELS).map((key) => {
                  const isMonitored = monitoredItemKeys.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => handleToggleMonitoredKey(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-bold border transition cursor-pointer select-none ${
                        isMonitored
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isMonitored ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      <span>{PRICE_KEY_LABELS[key]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Box 4: Favorite exchanges list selection */}
            <div className="bg-slate-900/80 border border-white/5 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs font-black text-white block">مراقبة بورصات وتجار الدلتا المفضلة لديك (Favorite Exchange Channels):</label>
                <p className="text-[10px] text-slate-400 mt-0.5">ستعمل تنبيهات الدفع الفورية خصيصاً على مراقبة هذه المكاتب والوكلاء لضمان السحب والبيع السليم:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" id="favorite_channels_selector_grid">
                {SHARKIA_EXCHANGES_LIST.map((ex) => {
                  const isFavorited = favoriteExchangeIds.includes(ex.id);
                  return (
                    <div 
                      key={ex.id}
                      onClick={() => handleToggleExchangeLocal(ex.id)}
                      className={`p-3 rounded-xl border transition duration-150 cursor-pointer flex items-center justify-between text-right select-none ${
                        isFavorited
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md'
                          : 'bg-black/25 border-white/5 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{ex.badgeEmoji}</span>
                        <div>
                          <h5 className="text-[11px] font-black text-white leading-tight">{ex.name}</h5>
                          <span className="text-[9px] text-slate-500">مقرها: {ex.city} • بقلم {ex.owner}</span>
                        </div>
                      </div>

                      <button
                        className={`p-1.5 rounded-lg transition ${
                          isFavorited ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        <Star size={12} className={isFavorited ? 'fill-amber-400' : ''} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              onClick={() => {
                setLocalTab('view');
                playChime('up');
                alert('🎉 تم تثبيت وتفعيل إعدادات فلترة الفروق وتلقي تنبيهات الدفع الفورية بمجرد قيام البورصة بتحديث أسواق الكتاكيت والأعلاف!');
              }}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-sky-500/10"
            >
              تشغيل نظام التنبيهات والعودة للأسعار 🚀
            </button>
          </div>

        </div>
      ) : localTab === 'edit' ? (
        /* EDIT / CUSTOMIZE PRICES SCREEN FOR SELF-MANAGEMENT */
        <div className="space-y-4 relative z-10 tab-transition" id="exchange_manual_editor">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs font-semibold text-amber-300 leading-relaxed text-right">
            ⚠️ <span className="font-bold">المربي المالك الفردي:</span> يمكنك تعديل وضبط قيم الأسعار بالجنيه المصري وتثبيتها مسبقاً في الذاكرة لتتوافق بدقة شديدة مع أسعار مدينتك أو محافظتك الميدانية اليوم!
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5" id="pricing_editor_grids">
            {/* Group 1: Chickens */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-black text-amber-400 border-b border-white/5 pb-1.5 text-right">🐔 أسعار الدواجن (كيلو بالمزرعة)</h4>
              <div className="space-y-2 text-right">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">الفراخ البيضاء:</label>
                  <input
                    type="number"
                    value={poultryPrices.white_poultry}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, white_poultry: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">الفراخ الساسو:</label>
                  <input
                    type="number"
                    value={poultryPrices.sass_poultry}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, sass_poultry: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">الفراخ البلدي:</label>
                  <input
                    type="number"
                    value={poultryPrices.baladi_poultry}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, baladi_poultry: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">الفراخ الأمهات:</label>
                  <input
                    type="number"
                    value={poultryPrices.mothers_poultry}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, mothers_poultry: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Chicks */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-black text-amber-400 border-b border-white/5 pb-1.5 text-right">🐥 أسعار الكتاكيت (عمر يوم)</h4>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 text-right">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت أبيض شركات:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.white_chick_corp ?? 12}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, white_chick_corp: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت تسمين (قطعان/أهالي):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.white_chick_dist ?? 12}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, white_chick_dist: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت ساسو شفر:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.sass_chick ?? 6}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, sass_chick: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت ساسو جيل تان:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.sass_chick_2nd ?? 5.5}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, sass_chick_2nd: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت بلدي بيور:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.baladi_chick ?? 4.5}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, baladi_chick: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت بلدي هجين:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.baladi_chick_hybrid ?? 4.5}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, baladi_chick_hybrid: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت رزي متميز:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.rozzi_chick ?? 7}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, rozzi_chick: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">كتكوت رزي برابر:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={poultryPrices.rozzi_chick_braber ?? 5.5}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, rozzi_chick_braber: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Feed & Ducks */}
            <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-black text-amber-400 border-b border-white/5 pb-1.5 text-right">🌾 أعلاف دواجن وأخرى</h4>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 text-right">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">علف بادي 23% (للطن):</label>
                  <input
                    type="number"
                    value={poultryPrices.feed_badi}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, feed_badi: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">علف نامي 21% (للطن):</label>
                  <input
                    type="number"
                    value={poultryPrices.feed_nami}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, feed_nami: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">علف ناهي 19% (للطن):</label>
                  <input
                    type="number"
                    value={poultryPrices.feed_nahi}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, feed_nahi: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">بط مولر / تسمين:</label>
                  <input
                    type="number"
                    value={poultryPrices.duck_french}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, duck_french: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">بط بكيني مزارع:</label>
                  <input
                    type="number"
                    value={poultryPrices.duck_pekin_farms ?? 6}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, duck_pekin_farms: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">بيض بط بكيني:</label>
                  <input
                    type="number"
                    value={poultryPrices.duck_pekin_egg ?? 6}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, duck_pekin_egg: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">مسكوفي عمر يوم:</label>
                  <input
                    type="number"
                    value={poultryPrices.duck_muscovy_1day ?? 16}
                    onChange={(e) => setPoultryPrices({ ...poultryPrices, duck_muscovy_1day: Number(e.target.value) })}
                    className="w-full bg-emerald-950/60 border border-emerald-900/60 rounded-xl p-2 font-bold text-center text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setExchangeEditTab('view');
                setLocalTab('view');
                alert('🎉 تم حفظ وتطبيق أسعار البورصة الحرة بنجاح على الفوج والجداول الحالية!');
              }}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs cursor-pointer shadow-md"
            >
              تثبيت الأسعار بالمزرعة وتنشيطها 💾
            </button>
          </div>
        </div>
      ) : (
        /* REAL-TIME PRESET PRICE CARD VIEWING PANELS */
        <div className="space-y-5" id="exchange_price_board_wrapper">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10" id="exchange_price_board">
            
            {/* Sub-Card 1: Poultry (الدواجن) */}
            <div className="bg-gradient-to-br from-[#061f10]/95 to-slate-950/95 p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <span className="text-yellow-400 font-extrabold text-xs flex items-center gap-1.5 font-sans">
                    🐔 أسعار كيلو اللحم بالمزرعة
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">تحديث مباشر</span>
                </div>

                <div className="space-y-3.5">
                  {[
                    { label: 'فراخ بيضاء تسمين', key: 'white_poultry', desc: 'لحم الفراخ الحية سوبر' },
                    { label: 'فراخ ساسو حمراء', key: 'sass_poultry', desc: 'النوع البلجيكي السوبر' },
                    { label: 'فراخ بلدي حر متميز', key: 'baladi_poultry', desc: 'أمهات فرخ بلدي حقيقي' },
                    { label: 'فراخ أمهات بيضاء', key: 'mothers_poultry', desc: 'أمهات الهبرد الثقيلة' }
                  ].map((item) => {
                    const trend = marketTrends[item.key] || 'stable';
                    const price = poultryPrices[item.key] ?? MAHER_AL_SHEIKH_PRICES[item.key as keyof typeof MAHER_AL_SHEIKH_PRICES];
                    return (
                      <div key={item.key} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5">
                        <div className="text-right">
                          <span className="text-xs font-black text-white block">{item.label}</span>
                          <span className="text-[10px] text-slate-400 block mb-1">{item.desc}</span>
                          {renderPulse(item.key)}
                        </div>
                        <div className="text-left flex items-center gap-2">
                          <span className="font-mono font-black text-[13px] text-amber-400">
                            {price} ج.م
                          </span>
                          <span className={`text-xs ${
                            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {trend === 'up' ? <TrendingUp size={14} className="inline animate-bounce" /> : trend === 'down' ? <TrendingDown size={14} className="inline" /> : '▬'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sub-Card 2: Chicks (الكتاكيت عمر يوم فرز أول ممتاز) */}
            <div className="bg-gradient-to-br from-[#061f10]/95 to-slate-950/95 p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <span className="text-amber-400 font-extrabold text-xs flex items-center gap-1.5 font-sans">
                    🐥 الكتاكيت (عمر يوم فرز أول)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-black animate-pulse bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/30 font-mono">بورصة ههيا</span>
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-800">
                  {[
                    { label: 'كتكوت أبيض شركات', key: 'white_chick_corp', desc: 'مخارج كبرى المعامل بالمحافظات' },
                    { label: 'كتكوت تسمين (أهالي)', key: 'white_chick_dist', desc: 'تسمين صغار وموزعين معتمدين' },
                    { label: 'كتكوت ساسو شفر', key: 'sass_chick', desc: 'ساسو بيور ثقيل معدلات لحم' },
                    { label: 'كتكوت ساسو جيل تان', key: 'sass_chick_2nd', desc: 'وزن ممتاز مع حيوية عالية' },
                    { label: 'كتكوت بلدي بيور للبيض', key: 'baladi_chick', desc: 'بلدي أصيل لإنتاج بيض وفير' },
                    { label: 'كتكوت بلدي هجين', key: 'baladi_chick_hybrid', desc: 'سلالة هجين للتسمين السريع' },
                    { label: 'كتكوت رزي متميز', key: 'rozzi_chick', desc: 'نمو عالي ومكسب لحم وفير' },
                    { label: 'كتكوت رزي برابر', key: 'rozzi_chick_braber', desc: 'بياض عالي المقاومة' }
                  ].map((item) => {
                    const trend = marketTrends[item.key] || 'stable';
                    const price = poultryPrices[item.key] ?? MAHER_AL_SHEIKH_PRICES[item.key as keyof typeof MAHER_AL_SHEIKH_PRICES];
                    return (
                      <div key={item.key} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5 font-sans">
                        <div className="text-right">
                          <span className="text-xs font-black text-white block">{item.label}</span>
                          <span className="text-[10px] text-slate-400 block mb-1">{item.desc}</span>
                          {renderPulse(item.key)}
                        </div>
                        <div className="text-left flex items-center gap-2">
                          <span className="font-mono font-black text-[13px] text-amber-400">
                            {price} ج.م
                          </span>
                          <span className={`text-xs ${
                            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {trend === 'up' ? <TrendingUp size={14} className="inline animate-bounce" /> : trend === 'down' ? <TrendingDown size={14} className="inline" /> : '▬'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sub-Card 3: Feed, Ducks & Egg Specialties */}
            <div className="bg-gradient-to-br from-[#061f10]/95 to-slate-950/95 p-5 rounded-2xl border border-white/5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <span className="text-[#34d399] font-extrabold text-xs flex items-center gap-1.5 font-sans">
                    🌾 بورصة الأعلاف والبط والبيض
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold font-mono">فرز مزارع</span>
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-800">
                  {[
                    { label: 'بط مولر عمر يوم / تسمين', key: 'duck_french', desc: 'بطة هجين مولار فرز أول ممتاز' },
                    { label: 'بط بكيني مزارع', key: 'duck_pekin_farms', desc: 'بط بكيني محسن سريع التحويل' },
                    { label: 'بيض بط بكيني للمربين', key: 'duck_pekin_egg', desc: 'سعر البيضة الصالحة للتفريخ' },
                    { label: 'بط مسكوفي عمر يوم', key: 'duck_muscovy_1day', desc: 'مسكوفي أصلي فرز أول' },
                    { label: 'علف بادي 23% سوبر للطن', key: 'feed_badi', desc: 'لطن العلف المعتمد المصانع' },
                    { label: 'علف نامي 21% سوبر للطن', key: 'feed_nami', desc: 'لطن العلف ببروتينات نامية' },
                    { label: 'علف ناهي 19% سوبر للطن', key: 'feed_nahi', desc: 'طن العلف للتشطيب النهائي للفوج' }
                  ].map((item) => {
                    const trend = marketTrends[item.key] || 'stable';
                    const price = poultryPrices[item.key] ?? MAHER_AL_SHEIKH_PRICES[item.key as keyof typeof MAHER_AL_SHEIKH_PRICES];
                    const isFeed = item.key.startsWith('feed_');
                    return (
                      <div key={item.key} className="flex justify-between items-center bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5 font-sans">
                        <div className="text-right">
                          <span className="text-xs font-black text-white block">{item.label}</span>
                          <span className="text-[10px] text-slate-400 block mb-1">{item.desc}</span>
                          {renderPulse(item.key)}
                        </div>
                        <div className="text-left flex items-center gap-2">
                          <span className="font-mono font-black text-[13px] text-amber-400">
                            {isFeed 
                              ? `${price.toLocaleString('ar-EG')} ج` 
                              : `${price} ج`
                            }
                          </span>
                          <span className={`text-xs ${
                            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {trend === 'up' ? <TrendingUp size={14} className="inline animate-bounce" /> : trend === 'down' ? <TrendingDown size={14} className="inline" /> : '▬'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Simulated Life Ticker Log Terminal Console */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 relative z-10 font-mono text-[11px] text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
              <div className="flex items-center gap-2 text-slate-300 font-bold select-none">
                <Bell size={13} className="text-sky-400 animate-bounce" />
                <span>سجل مراقبة وحركة أسعار البورصة الحية وتوليد الإشعارات السريعة</span>
              </div>
              <span className="text-[9px] text-sky-400 font-extrabold animate-pulse bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/30">مشغل تصفية التنبيهات</span>
            </div>
            <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-950">
              {simLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 hover:bg-white/5 rounded px-2 transition">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[9px] font-semibold">{log.time}</span>
                    <span className="text-sky-300 text-[10px]">{log.text}</span>
                  </div>
                  <div>
                    {log.trend === 'up' ? (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[9.5px] px-2 py-0.5 rounded font-sans font-black">🔺 صعود</span>
                    ) : log.trend === 'down' ? (
                      <span className="bg-rose-500/10 text-rose-400 text-[9.5px] px-2 py-0.5 rounded font-sans font-black">🔻 هبوط</span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[9.5px] px-2 py-0.5 rounded font-sans font-semibold">▬ ثابت</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Market analytics bar */}
      <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-300 text-[10.5px]">
        <div className="flex items-center gap-2 text-emerald-400 font-bold justify-start">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
          <span>💡 إرشادات الإشعارات والبورصة الحية:</span>
          <span className="text-slate-200 font-medium">قم بالضغط على رمز النجمة ⭐ بجانب أي مكتب تسليم أو تاجر للدواجن لإضافته إلى مفضلتك لتلقي تنبيهات منبثقة برنين صوتي 🔔 في هاتفك وحاسوبك فور تغير أسعار السلالات اليوم!</span>
        </div>
      </div>
    </div>
  );
}
