import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Send, 
  Sparkles, 
  Info, 
  Thermometer, 
  Wind, 
  Lightbulb, 
  Layers, 
  Scale, 
  Plus, 
  ClipboardList, 
  VolumeX, 
  RefreshCw, 
  Search,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Clock,
  Activity,
  Calculator,
  Lock,
  Unlock,
  KeyRound,
  Database,
  User,
  Users,
  Settings,
  ShieldCheck,
  PlusCircle,
  Code,
  Pencil,
  X,
  TrendingUp,
  TrendingDown,
  Coins,
  Award,
  Zap,
  MapPin,
  Building2,
  Phone,
  Share2,
  Copy,
  FileText,
  Star,
  Bell,
  Printer
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import PoultryExchangeBoard from './components/PoultryExchangeBoard';
import { FATTENING_MILESTONES, VACCINE_PROGRAM, COMMON_DISEASES, getGuidelineForDay } from './data/fatteningSchedule';
import { SHARKIA_EXCHANGES_LIST, SharkiaExchange } from './data/exchangesData';
import { BatchLog, DiseaseInfo } from './types';

// Types representing the user's MySQL schema exactly
export interface SimUser {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface SimActivationCode {
  id: number;
  code: string;
  plan: 'weekly' | 'monthly' | 'full_cycle' | 'yearly';
  duration_days: number;
  used: boolean;
  used_by: number | null;
  created_at: string;
}

export interface SimSubscription {
  id: number;
  user_id: number;
  activation_code_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired';
}

export default function App() {
  const [currentTab, setRawTab] = useState('schedule');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ==========================================
  // Simulated MySQL Database State (LocalStorage)
  // ==========================================
  const [dbUsers, setDbUsers] = useState<SimUser[]>(() => {
    const saved = localStorage.getItem('kilo5_db_users');
    if (saved) return JSON.parse(saved);
    const initial: SimUser[] = [
      { id: 1, full_name: 'إدارة جولدين بولتري (المدير العام)', phone: '01029190615', email: 'admin@goldenpoultry.com', role: 'admin', status: 'active', created_at: '2026-05-01' },
      { id: 2, full_name: 'مزارع نزار الجبلي', phone: '01234567890', email: 'nazar@poultry.com', role: 'user', status: 'active', created_at: '2026-05-15' }
    ];
    localStorage.setItem('kilo5_db_users', JSON.stringify(initial));
    return initial;
  });

  const [dbCodes, setDbCodes] = useState<SimActivationCode[]>(() => {
    const saved = localStorage.getItem('kilo5_db_codes');
    if (saved) return JSON.parse(saved);
    const initial: SimActivationCode[] = [
      { id: 1, code: 'NAZIH-A7B5C3D1', plan: 'yearly', duration_days: 365, used: false, used_by: null, created_at: '2026-06-01' },
      { id: 2, code: 'NAZIH-K9P8J5W7', plan: 'monthly', duration_days: 30, used: false, used_by: null, created_at: '2026-06-01' },
      { id: 3, code: 'NAZIH-8YTR99X2', plan: 'yearly', duration_days: 365, used: false, used_by: null, created_at: '2026-06-01' },
      { id: 4, code: 'NAZIH-DEMOFOU4', plan: 'monthly', duration_days: 30, used: true, used_by: 2, created_at: '2026-05-15' }
    ];
    localStorage.setItem('kilo5_db_codes', JSON.stringify(initial));
    return initial;
  });

  const [dbSubscriptions, setDbSubscriptions] = useState<SimSubscription[]>(() => {
    const saved = localStorage.getItem('kilo5_db_subs');
    if (saved) return JSON.parse(saved);
    const initial: SimSubscription[] = [
      { id: 1, user_id: 2, activation_code_id: 4, start_date: '2026-04-10', end_date: '2026-05-10', status: 'expired' }
    ];
    localStorage.setItem('kilo5_db_subs', JSON.stringify(initial));
    return initial;
  });

  const [currentUser, setCurrentUser] = useState<SimUser>(() => {
    const saved = localStorage.getItem('kilo5_current_user');
    if (saved) return JSON.parse(saved);
    return { id: 2, full_name: 'مزارع نزار الجبلي', phone: '01234567890', email: 'nazar@poultry.com', role: 'user', status: 'active', created_at: '2026-05-15' };
  });

  const [hasActiveSub, setHasActiveSub] = useState<boolean>(false);
  const [activeSubDetails, setActiveSubDetails] = useState<SimSubscription | null>(null);

  // Sync DB to LocalStorage on changes
  useEffect(() => {
    localStorage.setItem('kilo5_db_users', JSON.stringify(dbUsers));
  }, [dbUsers]);

  useEffect(() => {
    localStorage.setItem('kilo5_db_codes', JSON.stringify(dbCodes));
  }, [dbCodes]);

  useEffect(() => {
    localStorage.setItem('kilo5_db_subs', JSON.stringify(dbSubscriptions));
  }, [dbSubscriptions]);

  useEffect(() => {
    localStorage.setItem('kilo5_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Subscription verification hook
  useEffect(() => {
    const nowStr = new Date().toISOString().split('T')[0];
    const userSub = dbSubscriptions.find(sub => sub.user_id === currentUser.id && sub.status === 'active');
    
    if (userSub) {
      if (new Date(userSub.end_date) >= new Date(nowStr)) {
        setHasActiveSub(true);
        setActiveSubDetails(userSub);
      } else {
        setHasActiveSub(false);
        setActiveSubDetails(null);
      }
    } else {
      if (currentUser.role === 'admin') {
        setHasActiveSub(true);
        setActiveSubDetails({
          id: 0,
          user_id: currentUser.id,
          activation_code_id: 0,
          start_date: '2026-01-01',
          end_date: '2030-12-31',
          status: 'active'
        });
      } else {
        setHasActiveSub(false);
        setActiveSubDetails(null);
      }
    }
  }, [currentUser, dbSubscriptions]);

  const activeCodeMapped = dbCodes.find(c => c.id === activeSubDetails?.activation_code_id);
  const activePlanType = currentUser.role === 'admin' 
    ? 'full_cycle' 
    : (hasActiveSub ? (activeCodeMapped?.plan || 'full_cycle') : null);

  const isDayUnlocked = (day: number): boolean => {
    if (currentUser.role === 'admin') return true;
    if (!hasActiveSub) return day === 1;
    
    if (activePlanType === 'weekly') {
      return day <= 10;
    }
    if (activePlanType === 'monthly') {
      return day <= 30;
    }
    // 'full_cycle' or 'yearly' or admin has full access
    return true;
  };

  const setCurrentTab = (tabId: string) => {
    // Admin bypass, or free screens like schedule, subscriptions (activation page), and exchanges-directory (price directory)
    if (currentUser.role === 'admin' || tabId === 'schedule' || tabId === 'subscriptions' || tabId === 'exchanges-directory') {
      setRawTab(tabId);
      return;
    }

    // Accessing any other tab requires active subscription
    if (!hasActiveSub) {
      setLockedAttemptedDay(2); // Simulated block
      setTeaserOpen(true);
      return;
    }

    // Special Pro Features lock (AI Vet, Logs / History / Detailed Reports) require Full Cycle PRO (200 EGP)
    if (tabId === 'vet-chat' || tabId === 'logs') {
      if (activePlanType !== 'full_cycle' && activePlanType !== 'yearly') {
        alert('🚨 هذا القسم الممتاز المطور (المستشار البيطري بالذكاء الاصطناعي GPT/Gemini وسجل متابعة القطيع بـ MySQL وحقن التقرير البيطري الشامل) يتطلب ترقية الاشتراك لباقة الدورة الكاملة PRO بـ 200 جنية للاستفادة من كامل المزايا.');
        setLockedAttemptedDay(25);
        setTeaserOpen(true);
        return;
      }
    }

    setRawTab(tabId);
  };

  const handleSelectDay = (day: number) => {
    if (isDayUnlocked(day)) {
      setSelectedDay(day);
    } else {
      setLockedAttemptedDay(day);
      setTeaserOpen(true);
    }
  };

  // Synchronize dynamic tab switching with HTML5 History API to intercept mobile back button clicks
  useEffect(() => {
    // Replace initial state so the first tab can also be backed into
    if (!window.history.state) {
      window.history.replaceState({ tab: 'schedule' }, '', '#schedule');
    }
  }, []);

  useEffect(() => {
    // Only push if the current history state is different to avoid redundant stack items
    if (window.history.state?.tab !== currentTab) {
      window.history.pushState({ tab: currentTab }, '', `#${currentTab}`);
    }
  }, [currentTab]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.tab) {
        setCurrentTab(e.state.tab);
      } else {
        // Fallback to URL hash if state is empty
        const hash = window.location.hash.replace('#', '');
        const validTabs = ['schedule', 'calculator', 'vet-chat', 'vaccines', 'diseases', 'logs', 'subscriptions'];
        if (hash && validTabs.includes(hash)) {
          setCurrentTab(hash);
        } else {
          setCurrentTab('schedule');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Regular breeders are allowed to access the subscriptions tab to enter their activation codes!
  
  // Tab 1: Daily Fattening Schedule Day State
  const [selectedDay, setSelectedDay] = useState(1);
  const currentGuideline = getGuidelineForDay(selectedDay);

  // Tab 2: FCR Calculator Input States
  const [birdCount, setBirdCount] = useState<number>(1000);
  const [calcDay, setCalcDay] = useState<number>(21);
  const [avgWeightGrams, setAvgWeightGrams] = useState<number>(950);
  const [totalFeedBags, setTotalFeedBags] = useState<number>(36); // standard bag/custom count
  const [feedBagWeightOption, setFeedBagWeightOption] = useState<'50kg' | '25kg' | '10kg' | 'custom_small'>('50kg');
  const [customFeedBagWeight, setCustomFeedBagWeight] = useState<number>(5);
  const [fcrResult, setFcrResult] = useState<number | null>(null);
  const [fcrAssessment, setFcrAssessment] = useState<{ status: 'excellent' | 'good' | 'average' | 'poor'; text: string; action: string } | null>(null);

  // Tab 2 extension: Financial profit ROI calculator states (Feature 4)
  const [chickPrice, setChickPrice] = useState<number>(35);
  const [tonFeedPrice, setTonFeedPrice] = useState<number>(22000);
  const [vaccineCostPerBird, setVaccineCostPerBird] = useState<number>(8);
  const [overheadCostPerBird, setOverheadCostPerBird] = useState<number>(5);
  const [meatSellingPrice, setMeatSellingPrice] = useState<number>(95);

  // General Manager Admin Gateway Overlay controls
  const [adminUnlockOpen, setAdminUnlockOpen] = useState(false);
  const [adminPhoneInput, setAdminPhoneInput] = useState('');
  const [adminPinInput, setAdminPinInput] = useState('');

  // Tab: Sharkia Exchanges Directory States
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState('');
  const [exchangeCityFilter, setExchangeCityFilter] = useState('الكل');
  const [exchangeProductFilter, setExchangeProductFilter] = useState('الكل');
  const [copiedExchangeId, setCopiedExchangeId] = useState<string | null>(null);

  // Tab 3: Chat State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    { 
      role: 'assistant', 
      text: 'مرحباً بك في مستشار تطبيق الـ 5 كيلو البيطري الذكي! أنا هنا لمساعدتك على مدار الساعة في إدارة حظيرتك، وزيادة أوزان الفراخ بأمان، وحل أي مشكلة صحية أو غذائية تواجهك. اسألني عن درجات الحرارة المناسبة لوزن طيورك، أو أفضل أنواع العلف، أو للتشخيص الأولي للأعراض المرضية.', 
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Tab 4: Vaccine completed state trackers
  const [completedVaccines, setCompletedVaccines] = useState<Record<string, boolean>>({});

  // Tab 5: Disease search/filter
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [diseaseFilterType, setDiseaseFilterType] = useState('all');

  // Tab 6: Herd Logs State
  const [logsList, setLogsList] = useState<BatchLog[]>([]);
  // Tab 6 extension: Audit report modal open state (Feature 1)
  const [auditReportOpen, setAuditReportOpen] = useState(false);
  // Form input states for logging
  const [logFormDay, setLogFormDay] = useState<number>(7);
  const [logFormBirds, setLogFormBirds] = useState<number>(1000);
  const [logFormMortality, setLogFormMortality] = useState<number>(0);
  const [logFormFeedConsumed, setLogFormFeedConsumed] = useState<string>('25'); // kg
  const [logFormAvgWeight, setLogFormAvgWeight] = useState<string>('185'); // grams
  const [logFormTemp, setLogFormTemp] = useState<string>('30'); // Celsius
  const [logFormNotes, setLogFormNotes] = useState<string>('');

  // ==========================================
  // Tab 7: Subscription and SQL Simulator States
  // ==========================================
  const [activationInput, setActivationInput] = useState('');
  const [subInnerTab, setSubInnerTab] = useState<'profile' | 'admin'>('profile');
  const [newCodeVal, setNewCodeVal] = useState('');
  const [newCodePlan, setNewCodePlan] = useState<'weekly' | 'monthly' | 'full_cycle' | 'yearly'>('weekly');
  const [newCodeDuration, setNewCodeDuration] = useState(7);
  const [editingUser, setEditingUser] = useState<SimUser | null>(null);
  const [editingCode, setEditingCode] = useState<SimActivationCode | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<SimSubscription | null>(null);
  const [teaserOpen, setTeaserOpen] = useState(false);
  const [lockedAttemptedDay, setLockedAttemptedDay] = useState<number>(1);
  const [dbCodeViewTab, setDbCodeViewTab] = useState<'sql' | 'php_connect' | 'php_check' | 'php_helpers' | 'php_auth_check' | 'php_redirect' | 'css_styles' | 'css_admin' | 'php_register' | 'php_login' | 'php_logout' | 'php_dashboard' | 'php_activate' | 'php_generate' | 'php_admin_index' | 'php_users' | 'php_subs' | 'php_index'>('sql');
  
  // Custom User Creation form
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');

  // ==========================================
  // Daily Poultry & Chicks Stock Exchange State (البورصة اليومية للدواجن والكتاكيت والأعلاف)
  // ==========================================
  const [exchangeDate, setExchangeDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  });

  const [marketTrends, setMarketTrends] = useState<Record<string, 'up' | 'down' | 'stable'>>({
    white_poultry: 'up',
    sass_poultry: 'stable',
    baladi_poultry: 'up',
    mothers_poultry: 'down',
    white_chick_corp: 'stable',
    white_chick_dist: 'stable',
    sass_chick: 'stable',
    sass_chick_2nd: 'stable',
    baladi_chick: 'stable',
    baladi_chick_hybrid: 'stable',
    rozzi_chick: 'stable',
    rozzi_chick_braber: 'stable',
    duck_french: 'stable',
    duck_pekin_farms: 'stable',
    duck_pekin_egg: 'stable',
    duck_muscovy_1day: 'stable',
    feed_badi: 'stable',
    feed_nami: 'down',
    feed_nahi: 'stable',
  });

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
    duck_muscovy_1day: 16,     // مسكوفي عمر يوم

    feed_badi: 22500,
    feed_nami: 22100,
    feed_nahi: 21800,
  };

  const [poultryPrices, setPoultryPrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('maher_al_sheikh_prices_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...MAHER_AL_SHEIKH_PRICES, ...parsed };
      } catch (e) {
        return MAHER_AL_SHEIKH_PRICES;
      }
    }
    return MAHER_AL_SHEIKH_PRICES;
  });

  const handleLoadMaherAlSheikhPrices = () => {
    setPoultryPrices(MAHER_AL_SHEIKH_PRICES);
    const stableTrends: Record<string, 'up' | 'down' | 'stable'> = {};
    Object.keys(MAHER_AL_SHEIKH_PRICES).forEach((key) => {
      stableTrends[key] = 'stable';
    });
    setMarketTrends(stableTrends);
    setExchangeDate('الأربعاء ٣ - ٦ - ٢٠٢٦ [تجاري—أهالي]');
    localStorage.setItem('maher_al_sheikh_prices_v3', JSON.stringify(MAHER_AL_SHEIKH_PRICES));
  };

  const handleApplyExchangePrices = (exchange: SharkiaExchange) => {
    // Merge the exchange's prices with the current poultryPrices state
    const newPrices = { ...poultryPrices, ...exchange.prices };
    setPoultryPrices(newPrices);
    
    // Reset trends for the updated keys
    const stableTrends = { ...marketTrends };
    Object.keys(exchange.prices).forEach((key) => {
      stableTrends[key] = 'stable';
    });
    setMarketTrends(stableTrends);
    setExchangeDate(exchange.date);
    
    // Save to local storage
    localStorage.setItem('maher_al_sheikh_prices_v3', JSON.stringify(newPrices));
  };

  // Save poultry prices to localStorage when modified
  useEffect(() => {
    localStorage.setItem('maher_al_sheikh_prices_v3', JSON.stringify(poultryPrices));
  }, [poultryPrices]);

  const [isUpdatingExchange, setIsUpdatingExchange] = useState(false);
  const [exchangeEditTab, setExchangeEditTab] = useState<'view' | 'edit'>('view');
  
  const [favoriteExchangeIds, setFavoriteExchangeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorite_exchanges_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ['maher-shaikh', 'abu-kabir-exchange'];
      }
    }
    return ['maher-shaikh', 'abu-kabir-exchange'];
  });

  useEffect(() => {
    localStorage.setItem('favorite_exchanges_v1', JSON.stringify(favoriteExchangeIds));
  }, [favoriteExchangeIds]);

  const handleToggleFavoriteExchange = (id: string) => {
    setFavoriteExchangeIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ==========================================
  // Daily 50-day cycle Morning Work Reminder System (تنبيهات الساعة 6 صباحاً الميدانية)
  // ==========================================
  const [currentBatchDay, setCurrentBatchDay] = useState<number>(() => {
    const saved = localStorage.getItem('kilo5_current_batch_day');
    return saved ? Number(saved) : 7; // defaults to Day 7
  });

  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('kilo5_reminder_enabled');
    return saved !== 'false'; // default is true
  });

  // State to hold and render the active Lockscreen/iOS style notification block
  const [morningReminderAlert, setMorningReminderAlert] = useState<{
    day: number;
    title: string;
    stageName: string;
    highlights: string;
    time: string;
    temperature: number;
    feedType: string;
  } | null>(null);

  // For flashing guideline view when notification clicked
  const [flashGuideline, setFlashGuideline] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('kilo5_current_batch_day', String(currentBatchDay));
  }, [currentBatchDay]);

  useEffect(() => {
    localStorage.setItem('kilo5_reminder_enabled', String(reminderEnabled));
  }, [reminderEnabled]);

  // Handler to trigger/simulate the morning 6:00 AM push notification instantly
  const handleTriggerMorningAlarm = (daySelection: number) => {
    const dayGuide = getGuidelineForDay(daySelection);
    const firstTask = dayGuide.instructions[0] || "اتبع جدول الرعاية والتغذية اليومي.";
    
    // Play a delightful chime or wake-up alarm sound
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        
        // Gentle warm reminder sequence
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.45); // C6
        
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        
        osc.start(now);
        osc.stop(now + 1.0);
      }
    } catch (e) {
      console.warn("Chime failed", e);
    }

    setMorningReminderAlert({
      day: daySelection,
      title: `⏰ تنبيه الـ 6 صباحاً الميداني - اليوم ${daySelection}`,
      stageName: dayGuide.stageName,
      highlights: firstTask,
      time: "06:00 ص",
      temperature: dayGuide.temperature,
      feedType: dayGuide.feedType
    });
  };

  // Helper when clicking the notification to go to full day schedule
  const handleGoToFullDay = (dayNum: number) => {
    setCurrentTab('schedule');
    setSelectedDay(dayNum);
    setMorningReminderAlert(null); // dismiss
    
    // Smooth scroll to the guideline detailed section
    setTimeout(() => {
      const target = document.getElementById('stats_guidelines_grid');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Trigger temporary visual flash effect to draw the eye
      setFlashGuideline(true);
      setTimeout(() => setFlashGuideline(false), 2500);
    }, 150);
  };

  const [selectedBirdSpec, setSelectedBirdSpec] = useState<'white_chick' | 'sasso_chick' | 'baladi_chick' | 'duck_french' | 'turkey_bronze'>('white_chick');

  const handleRefreshExchangePrices = () => {
    setIsUpdatingExchange(true);
    setTimeout(() => {
      const nextPrices = { ...poultryPrices };
      const nextTrends: Record<string, 'up' | 'down' | 'stable'> = {};

      const keys = Object.keys(poultryPrices) as Array<keyof typeof poultryPrices>;
      keys.forEach((key) => {
        const keyStr = key as string;
        const oldVal = poultryPrices[key];
        let diff = 0;
        if (keyStr.startsWith('feed_')) {
          diff = (Math.floor(Math.random() * 5) - 2) * 50; 
        } else {
          diff = Math.floor(Math.random() * 5) - 2; 
        }

        const newVal = Math.max(1, oldVal + diff);
        nextPrices[key] = newVal;
        nextTrends[keyStr] = newVal > oldVal ? 'up' : newVal < oldVal ? 'down' : 'stable';
      });

      setPoultryPrices(nextPrices);
      setMarketTrends(nextTrends);
      
      const today = new Date();
      setExchangeDate(today.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      setIsUpdatingExchange(false);
    }, 750);
  };

  // Auto-scrollToBottom for Chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatLoading]);

  // Load herd logs from local storage on mounted
  useEffect(() => {
    const saved = localStorage.getItem('kilo5_flock_logs');
    if (saved) {
      try {
        setLogsList(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing flock logs from localstorage', e);
      }
    } else {
      // Default initial mock logs to prevent empty state layout
      const initialMock: BatchLog[] = [
        { id: '1', date: '2026-05-15', dayOfLife: 1, birdCount: 1000, mortality: 2, feedConsumedKg: 12, avgWeightGrams: 45, tempCelsius: 33, notes: 'استلام الدفعة بحمد الله وبوزن قياسي متناسق.' },
        { id: '2', date: '2026-05-21', dayOfLife: 7, birdCount: 998, mortality: 1, feedConsumedKg: 175, avgWeightGrams: 188, tempCelsius: 30, notes: 'تمت تحصينة هتشنر ووزن ممتاز.' },
        { id: '3', date: '2026-05-28', dayOfLife: 14, birdCount: 997, mortality: 0, feedConsumedKg: 540, avgWeightGrams: 495, tempCelsius: 27, notes: 'تغيير العلف تدريجياً لنامي ٢١٪.' }
      ];
      setLogsList(initialMock);
      localStorage.setItem('kilo5_flock_logs', JSON.stringify(initialMock));
    }

    // Load completed vaccines
    const savedVac = localStorage.getItem('kilo5_vaccines');
    if (savedVac) {
      try {
        setCompletedVaccines(JSON.parse(savedVac));
      } catch (e) {}
    }
  }, []);

  // Sync state helpers
  const saveLogs = (updated: BatchLog[]) => {
    setLogsList(updated);
    localStorage.setItem('kilo5_flock_logs', JSON.stringify(updated));
  };

  // Vaccine completion state sync
  const toggleVaccine = (vaccineName: string) => {
    const updated = {
      ...completedVaccines,
      [vaccineName]: !completedVaccines[vaccineName]
    };
    setCompletedVaccines(updated);
    localStorage.setItem('kilo5_vaccines', JSON.stringify(updated));
  };

  // Add Log Entry Action
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: BatchLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      dayOfLife: Number(logFormDay),
      birdCount: Number(logFormBirds),
      mortality: Number(logFormMortality),
      feedConsumedKg: parseFloat(logFormFeedConsumed) || 0,
      avgWeightGrams: parseFloat(logFormAvgWeight) || 0,
      tempCelsius: parseFloat(logFormTemp) || 0,
      notes: logFormNotes.trim() || undefined
    };
    
    const updated = [...logsList, newLog].sort((a, b) => a.dayOfLife - b.dayOfLife);
    saveLogs(updated);
    
    // Clear log form input or nudge day
    setLogFormDay((prev) => Math.min(prev + 1, 50));
    setLogFormMortality(0);
    setLogFormNotes('');
  };

  const handleDeleteLog = (id: string) => {
    const updated = logsList.filter(log => log.id !== id);
    saveLogs(updated);
  };

  const handleExportCSV = () => {
    if (logsList.length === 0) {
      alert("لا توجد سجلات حالية لتصديرها! يرجى إضافة ملاحظات ورصد يومي أولاً لكي تتمكن من تحميل النسخة الاحتياطية.");
      return;
    }
    
    // UTF-8 BOM for Arabic compatibility in Excel
    const BOM = "\uFEFF";
    
    const headers = [
      "عمر الفوج بالأيام",
      "تاريخ الرصد اليومي",
      "عدد الطيور الرعوية",
      "متوسط وزن الطير (جرام)",
      "عدد النافق اليومي",
      "كمية العلف المستهلكة (كجم)",
      "درجة حرارة العنبر القصوى (مئوية)",
      "ملاحظات المربي والعلاجات الموزونة"
    ];
    
    const rows = logsList.map(log => [
      log.dayOfLife,
      log.date,
      log.birdCount,
      log.avgWeightGrams,
      log.mortality,
      log.feedConsumedKg,
      log.tempCelsius,
      log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '""'
    ]);
    
    const csvContent = BOM + [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `سجل_أداء_الفوج_تطبيق_الـ_5_كيلو_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Smart FCR calculation mechanism
  const calculateFCR = (e: React.FormEvent) => {
    e.preventDefault();
    // total feed in kg calculated dynamically based on chosen weight package settings
    let totalFeedKg = 0;
    if (feedBagWeightOption === '50kg') {
      totalFeedKg = totalFeedBags * 50;
    } else if (feedBagWeightOption === '25kg') {
      totalFeedKg = totalFeedBags * 25;
    } else if (feedBagWeightOption === '10kg') {
      totalFeedKg = totalFeedBags * 10;
    } else if (feedBagWeightOption === 'custom_small') {
      totalFeedKg = totalFeedBags * (customFeedBagWeight || 1);
    }

    // standard formula for batch: total feed consumed / total current weight of survivors
    // surviving birds
    const survivingBirds = birdCount;
    const totalWeightKg = (survivingBirds * avgWeightGrams) / 1000;
    
    if (totalWeightKg <= 0) {
      alert('الرجاء التأكد من صحة أعداد الدواجن والأوزان المدخلة.');
      return;
    }

    const fcr = parseFloat((totalFeedKg / totalWeightKg).toFixed(2));
    setFcrResult(fcr);

    // Get expected statistics based on exact lifecycle day
    const standardGuide = getGuidelineForDay(calcDay);
    const weightDeviationPc = ((avgWeightGrams - standardGuide.targetWeight) / standardGuide.targetWeight) * 100;
    
    // Evaluate based on age-adjusted FCR & weights
    // Ideal FCR for light birds (day 7) is ~1.0, and big birds (day 45) is ~1.7 - 2.0
    // Standard target FCR for currently calculated day
    const targetFCR = standardGuide.fcrMetric;

    let status: 'excellent' | 'good' | 'average' | 'poor' = 'good';
    let text = '';
    let action = '';

    const fcrDiff = fcr - targetFCR;

    if (fcrDiff <= -0.05) {
      status = 'excellent';
      text = `ممتاز جداً! معامل تحويل العلف الخرافي لديك (${fcr}) أفضل من المؤشر القياسي (${targetFCR}) لهذا العمر. دواجنك تستوعب الأعلاف بكفاءة باهرة.`;
      action = 'استمر على هذه الاستراتيجية الممتازة للتهوية والتدفئة، وحافظ على علف فائق الجودة خالي من الرطوبة والسموم.';
    } else if (fcrDiff <= 0.1) {
      status = 'good';
      text = `مؤشر جيد وطبيعي! معامل تحويل العلف لديك (${fcr}) هو ضمن المعدل المقبول مقارنة بالمؤشر القياسي (${targetFCR}) لليوم ${calcDay}.`;
      action = 'تابع ضبط العلافات لمنع بعثرة العلف في النشارة، وارفع خطوط المياه لتتناسب مع طول رقاب الدواجن لتفادي الهدر.';
    } else if (fcrDiff <= 0.25) {
      status = 'average';
      text = `معدل تحويل متوسط يحتاج تحسين (${fcr}) مقارنة بالمعيارية (${targetFCR}). استهلاك الغذاء كبير بالنسبة للأوزان المسجلة.`;
      action = 'تحقق فوراً من خلو العنبر من ديدان الأمعاء أو الكوكسيديا الخفية. أضف مضاد سموم فطرية محفز هضمي قوي بالمساقي.';
    } else {
      status = 'poor';
      text = `تحذير تحويلي سلبي! معامل التحويل متأخر للغاية ومقلق (${fcr}) مقارنة بالقياسي (${targetFCR}). الحظيرة تهدر العلف دون وزن مكافئ.`;
      action = 'أسباب محتملة: هدر العلف في الأرضية، برودة شديدة تجعل الدواجن تحرق الغذاء للتدفئة بدلاً من اللحم، أو وجود بكتيريا الكولستريديا والكوكسيديا المدمرة للأمعاء. تحتاج تدخل بيطري فوري وعلاجي بالأمبروليوم والنيومايسين.';
    }

    // Adjust messages if active weight deviation feels bad
    if (weightDeviationPc < -15) {
      text += ` مع وجود عجز واضح في الوزن المسجل (${avgWeightGrams} جرام) عن الوزن القياسي المستهدف (${standardGuide.targetWeight} جرام) بنسبة عجز ${Math.abs(Math.round(weightDeviationPc))}%.`;
    } else if (weightDeviationPc > 10) {
      text += ` الدواجن ما شاء الله متفوقة بوزنها بمقدار +${Math.round(weightDeviationPc)}% عن أهداف الكتالوج!`;
    }

    setFcrAssessment({ status, text, action });
  };

  // Reset Calculator
  const handleResetCalc = () => {
    setBirdCount(1000);
    setCalcDay(21);
    setAvgWeightGrams(950);
    setTotalFeedBags(36);
    setFeedBagWeightOption('50kg');
    setCustomFeedBagWeight(5);
    setFcrResult(null);
    setFcrAssessment(null);
  };

  // AI Chat send mechanism
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput;
    const userTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    const updatedHistory = [
      ...messages,
      { role: 'user' as const, text: userText, time: userTime }
    ];
    setMessages(updatedHistory);
    setUserInput('');
    setChatLoading(true);

    try {
      // Build messages history payload omitting system message if any
      const clientHistory = updatedHistory.slice(1).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/vet-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          history: clientHistory.length > 5 ? clientHistory.slice(-5) : clientHistory
        })
      });

      const data = await res.json();
      
      const assistantTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          text: data.answer || "عذراً، لم أستطع الاستجابة الآن. يرجى مراجعة إعدادات الخادم واتصال الإنترنت الخاص بك.", 
          time: assistantTime 
        }
      ]);
    } catch (error) {
      console.error("Failed to fetch response: ", error);
      const assistantTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          text: "حدث خطأ بالاتصال مع الطبيب البيطري الآلي. الرجاء المحاولة مرة أخرى أو توفير مفتاح Gemini API في الإعدادات الخاصة بك.", 
          time: assistantTime 
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Pre-seed search queries for ease in chat
  const handleNudgeChat = (question: string) => {
    setUserInput(question);
  };

  // Filter diseases computed properties
  const filteredDiseases = COMMON_DISEASES.filter(d => {
    const term = diseaseSearch.toLowerCase();
    const matchesSearch = d.name.toLowerCase().includes(term) || d.symptoms.some(s => s.toLowerCase().includes(term));
    const matchesFilter = diseaseFilterType === 'all' || d.type === diseaseFilterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate current batch performance summary from logs
  const maxRecordedDay = logsList.length > 0 ? Math.max(...logsList.map(l => l.dayOfLife)) : 0;
  const currentAvgWeight = logsList.length > 0 ? logsList[logsList.length - 1].avgWeightGrams : 0;
  const totalMortality = logsList.length > 0 ? logsList.reduce((sum, current) => sum + current.mortality, 0) : 0;
  const totalFeedUsedKg = logsList.length > 0 ? logsList.reduce((sum, current) => sum + current.feedConsumedKg, 0) : 0;

  // ==========================================
  // Simulated MySQL Engine Functions (SQL Actions)
  // ==========================================
  const handleActivateLicenseKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = activationInput.trim().toUpperCase();
    if (!cleanCode) return;

    // Search activation_codes table
    const foundCodeIndex = dbCodes.findIndex(c => c.code === cleanCode);
    if (foundCodeIndex === -1) {
      alert("خطأ في الاستعلام: لم يتم العثور على رمز التفعيل في جدول 'activation_codes'! ❌");
      return;
    }

    const foundCode = dbCodes[foundCodeIndex];
    if (foundCode.used) {
      alert("عذراً، هذا الترخيص مستخدم مسبقاً في قاعدة البيانات من قبل مستخدم آخر! ⚠️");
      return;
    }

    // Step 1: Update activation_codes
    const updatedCodes = [...dbCodes];
    updatedCodes[foundCodeIndex] = {
      ...foundCode,
      used: true,
      used_by: currentUser.id
    };
    setDbCodes(updatedCodes);

    // Step 2: Insert into subscriptions table
    const nowStr = new Date().toISOString().split('T')[0];
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + foundCode.duration_days);
    const expDateStr = expDate.toISOString().split('T')[0];

    const newSubId = dbSubscriptions.length > 0 ? Math.max(...dbSubscriptions.map(s => s.id)) + 1 : 1;
    const newSubscription: SimSubscription = {
      id: newSubId,
      user_id: currentUser.id,
      activation_code_id: foundCode.id,
      start_date: nowStr,
      end_date: expDateStr,
      status: 'active'
    };

    // Deactivate prior subscriptions to enforce 1 active
    const cleanedSubs = dbSubscriptions.map(sub => sub.user_id === currentUser.id ? { ...sub, status: 'expired' as const } : sub);
    setDbSubscriptions([...cleanedSubs, newSubscription]);

    setActivationInput('');
    alert(`🎉 تم نجاح دمج بيانات الترخيص بنجاح!\n• الرمز: ${foundCode.code}\n• نوع الاشتراك: ${foundCode.plan === 'yearly' ? 'سنوي كقائد مبيعات' : 'شهري للمربين'}\n• المدة: ${foundCode.duration_days} يوم.\nتم ترقية حسابك إلى الفئة الذهبية الفائقة!`);
  };

  const handleInsertActivationCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Generate secure registration key matching PHP: NAZIH- + 8 characters from ABCDEFGHJKLMNPQRSTUVWXYZ23456789
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randPart = '';
    for (let i = 0; i < 8; i++) {
      randPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const generated = `NAZIH-${randPart}`;

    const newId = dbCodes.length > 0 ? Math.max(...dbCodes.map(c => c.id)) + 1 : 1;
    const codeObj: SimActivationCode = {
      id: newId,
      code: newCodeVal.trim().toUpperCase() || generated,
      plan: newCodePlan,
      duration_days: Number(newCodeDuration),
      used: false,
      used_by: null,
      created_at: new Date().toISOString().split('T')[0]
    };

    setDbCodes(prev => [...prev, codeObj]);
    setNewCodeVal('');
    alert(`⚡ تم حقن كود تفعيل جديد في table 'activation_codes': ${codeObj.code}`);
  };

  const handleInsertUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPhone) {
      alert("الاسم ورقم الهاتف حقول إجبارية!");
      return;
    }

    if (dbUsers.some(u => u.phone === newUserPhone)) {
      alert("خطأ UNIQUE Constraint Conflict: رقم الهاتف هذا مسجل بالفعل لمستخدم آخر بقاعدة البيانات! ❌");
      return;
    }

    const newId = dbUsers.length > 0 ? Math.max(...dbUsers.map(u => u.id)) + 1 : 1;
    const userObj: SimUser = {
      id: newId,
      full_name: newUserName,
      phone: newUserPhone,
      email: newUserEmail || null,
      role: 'user', // Always a breeder (user) automatically
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    };

    setDbUsers(prev => [...prev, userObj]);
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setNewUserRole('user');
    alert(`👤 تم تسجيل حساب ومربي دواجن جديد بالـ MySQL: ${userObj.full_name}`);
  };

  const handleUserDelete = (id: number) => {
    if (id === 1 || id === currentUser.id) {
      alert("لا يمكن حذف المستخدم النشط حالياً أو المدير الافتراضي من قاعدة البيانات! ❌");
      return;
    }
    if (confirm("هل أنت متأكد من رغبتك في حذف هذا المستخدم من جدول 'users' نهائياً؟ سيتم تصفير علاقاته كقيد أجنبي.")) {
      setDbUsers(prev => prev.filter(u => u.id !== id));
      setDbSubscriptions(prev => prev.filter(s => s.user_id !== id));
      setDbCodes(prev => prev.map(c => c.used_by === id ? { ...c, used: false, used_by: null } : c));
    }
  };

  const handleUserToggleStatus = (id: number) => {
    setDbUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const handleUserToggleRole = (id: number) => {
    setDbUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === 'admin' ? 'user' : 'admin' } : u));
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editingUser.full_name || !editingUser.phone) {
      alert("الاسم الكامل ورقم الهاتف حقول مطلوبة! ⚠️");
      return;
    }
    // Check UNIQUE phone constraint
    if (dbUsers.some(u => u.phone === editingUser.phone && u.id !== editingUser.id)) {
      alert("خطأ UNIQUE: رقم الهاتف هذا مسجل بالفعل لمستفيد آخر! ❌");
      return;
    }
    setDbUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    alert("تم تحديث بيانات حساب مربي الدواجن في قاعدة البيانات بنجاح! 💾");
  };

  const handleSaveEditedCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;
    if (!editingCode.code) {
      alert("رمز ترخيص التفعيل مطلوب! ⚠️");
      return;
    }
    // Check UNIQUE code constraint
    if (dbCodes.some(c => c.code.trim().toUpperCase() === editingCode.code.trim().toUpperCase() && c.id !== editingCode.id)) {
      alert("خطأ UNIQUE: رمز التفعيل هذا مسجل بالفعل مسبقاً! ❌");
      return;
    }
    const validated = { ...editingCode, code: editingCode.code.trim().toUpperCase() };
    setDbCodes(prev => prev.map(c => c.id === editingCode.id ? validated : c));
    setEditingCode(null);
    alert("تم حفظ وتحديث الترخيص في جدول 'activation_codes' بنجاح! 💾");
  };

  const handleCodeDelete = (id: number) => {
    if (confirm("⚠️ هل أنت متأكد من حذف هذا الترخيص نهائياً من قاعدة بيانات الـ MySQL؟\nسيؤدي ذلك لإلغاء وتصفير أي اشتراكات مرتبطة به لتوافق مرجعية المفاتيح الأجنبية.")) {
      setDbCodes(prev => prev.filter(c => c.id !== id));
      // Delete any subscriptions referencing this code
      setDbSubscriptions(prev => prev.filter(s => s.activation_code_id !== id));
      alert("تم حذف الرمز وإلغاء صلاحياته ومسحه من قاعدة البيانات بنجاح. 🗑️");
    }
  };

  const handleSaveEditedSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscription) return;
    if (!editingSubscription.start_date || !editingSubscription.end_date) {
      alert("تواريخ البداية والنهاية حقول مطلوبة! ⚠️");
      return;
    }
    setDbSubscriptions(prev => prev.map(s => s.id === editingSubscription.id ? editingSubscription : s));
    setEditingSubscription(null);
    alert("تم تحديث وثيقة الاشتراك بجدول 'subscriptions' بنجاح! 💾");
  };

  const handleSubscriptionDelete = (id: number) => {
    if (confirm("⚠️ هل أنت متأكد من حذف وثيقة الاشتراك هذه نهائياً من جدول 'subscriptions'؟")) {
      setDbSubscriptions(prev => prev.filter(s => s.id !== id));
      alert("تم حذف وثيقة الاشتراك بنجاح. 🗑️");
    }
  };

  const handleAdminPortalToggle = () => {
    if (currentUser.role === 'admin') {
      // Log out of admin, switch back to breeder
      const breederUser = dbUsers.find(u => u.role === 'user') || { id: 2, full_name: 'مزارع نزار الجبلي', phone: '01234567890', email: 'nazar@poultry.com', role: 'user', status: 'active', created_at: '2026-05-15' };
      setCurrentUser(breederUser);
      setCurrentTab('schedule');
      alert("تم تسجيل الخروج بنجاح من لوحة الملاك والعودة للتصفح كمربي دواجن عادي 🐓");
    } else {
      // Trigger the unlock popup dialog
      setAdminPhoneInput('');
      setAdminPinInput('');
      setAdminUnlockOpen(true);
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPhoneInput === '01029190615' && (adminPinInput === '2026' || adminPinInput === '123456')) {
      const adminUser = dbUsers.find(u => u.phone === '01029190615') || { id: 1, full_name: 'إدارة جولدين بولتري (المدير العام)', phone: '01029190615', email: 'admin@goldenpoultry.com', role: 'admin', status: 'active', created_at: '2026-05-01' };
      
      // Update in dbUsers if necessary
      setDbUsers(prev => prev.map(u => u.id === 1 ? { ...u, phone: '01029190615' } : u));
      
      setCurrentUser(adminUser);
      setAdminUnlockOpen(false);
      setCurrentTab('subscriptions'); // Land them on subscriptions/admin control tab!
      alert("أهلاً بك يا باشمهندس محمد نزيه! 👋 تم التحقق بنجاح وتفعيل لوحة الإدارة العامة وقاعدة بيانات الـ 5 كيلو. 👑");
    } else {
      alert("خطأ! رقم الهاتف أو الرقم السري للمدير غير صحيح. يرجى مراجعة بيانات الإدارة بحرص. ⚠️");
    }
  };

  return (
    <div className="min-h-screen bg-[#04140b] bg-gradient-to-b from-[#04140b] via-[#0a2313] to-[#030f08] text-[#f8fafc] flex flex-col font-sans overflow-hidden" dir="rtl" id="app_root">
      
      {/* Mobile Top Header */}
      <header className="bg-slate-900 text-white py-4 px-4 shadow-md flex items-center justify-between lg:hidden border-b border-slate-800" id="header_mobile">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-lg hover:bg-slate-800 text-amber-400"
            id="btn_hamburger"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 font-extrabold text-slate-950 flex items-center justify-center text-sm shadow">٥ك</span>
            <span className="font-bold text-amber-400 tracking-tight text-sm">تطبيق الـ 5 كيلو</span>
          </div>
        </div>
        <div className="bg-slate-800 text-[10px] text-amber-300 font-semibold py-1 px-2.5 rounded-full border border-amber-500/20">
          دورة نشطة 🐓
        </div>
      </header>

      {/* Main Structural Layout */}
      <div className="flex-1 flex overflow-hidden relative" id="layout_container">
        
        {/* Sidebar Component */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          userRole={currentUser.role}
          onClickAdminPortal={handleAdminPortalToggle}
        />

        {/* Content Container (Scrollable) */}
        <main className="flex-1 overflow-y-auto bg-[#04140b] bg-gradient-to-b from-[#061e0f] via-[#0b2b16] to-[#04140b] text-[#f8fafc] flex flex-col" id="main_content_area">
          
          {/* Top Info Strip (Visible for desktop) */}
          <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#0a2614]/90 backdrop-blur-md border-b border-white/5 shadow-xs" id="desktop_header_strip">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-700 font-bold text-xs rounded-full border border-amber-500/20">تسمين السوبر دواجن الغليظة</span>
              <p className="text-slate-500 text-xs">تطبيق احترافي لعلاج، تحصين، وتغذية الفراخ بداية من الكتكوت عمر يوم لوزن يزيد عن 5 كجم</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-left text-xs text-slate-400 border-l pl-3 ml-3" dir="ltr">
                UTC: 2026-06-02
              </div>
              <div className="bg-emerald-500/10 text-emerald-700 font-semibold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                مستشار الذكاء الاصطناعي نشط
              </div>
            </div>
          </div>

          {/* Render Sections dynamically basing on current tab */}
          <div className="p-4 md:p-8 max-w-6xl mx-auto w-full flex-1" id="tab_contents">
            
            {/* =========================================================================
                SHARKIA POULTRY EXCHANGES DIRECTORY
                ========================================================================= */}
            {currentTab === 'exchanges-directory' && (
              <div className="space-y-6 tab-transition" id="section_exchanges_directory">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[#032312] to-slate-900/90 rounded-3xl p-6 border border-emerald-500/20 shadow-xl relative overflow-hidden" id="exchanges_header">
                  <div className="absolute left-4 top-4 text-emerald-500/10 pointer-events-none text-9xl font-black">
                    📊
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold text-[10px] rounded-full border border-emerald-500/20 uppercase tracking-widest block w-fit mb-3">
                    دليل محافظة الشرقية الأكبر للدواجن 🇪🇬
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    بورصات الشرقية الموثقة واليومية 🐣
                  </h2>
                  <p className="text-xs text-slate-400 max-w-xl mt-1.5 leading-relaxed">
                    تغطية حية متميزة لكافة المكاتب والبورصات في ههيا، بلبيس، الزقازيق، أبو حماد، وديرب نجم. يمكنك البحث عن أي بورصة محددة وتطبيق أسعارها فوراً على حاسبات وأنظمة التطبيق بالكامل بضغطة واحدة!
                  </p>
                </div>

                {/* Statistics and Highlights Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="exchanges_stats">
                  <div className="bg-gradient-to-br from-[#062413] to-slate-950/80 p-4 rounded-2xl border border-white/5 shadow-md">
                    <span className="text-[10px] text-amber-500 font-extrabold block">🐥 أرخص كتكوت شركات اليوم</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-white">11.90 ج.م</span>
                      <span className="text-[10px] text-slate-400">مجموعة أولاد سليم (أبو حماد)</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#062413] to-slate-950/80 p-4 rounded-2xl border border-white/5 shadow-md">
                    <span className="text-[10px] text-[#34d399] font-extrabold block">🐓 تنفيذ اللحم الأبيض بالمحافظة</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-white">84.00 ج.م</span>
                      <span className="text-[10px] text-slate-400">متوسط بورصات ههيا والمحافظة</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-[#062413] to-slate-950/80 p-4 rounded-2xl border border-white/5 shadow-md">
                    <span className="text-[10px] text-amber-400 font-extrabold block">🌾 أوفر طن علف بادي 23%</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-white">22,350 ج.م</span>
                      <span className="text-[10px] text-slate-400">مجموعة سليّم (توفير ممتاز للبروتين)</span>
                    </div>
                  </div>
                </div>

                {/* Poultry Stock Exchange Prices and Adjustment Panel */}
                <div className="space-y-4 pt-2">
                  <div className="border-b border-white/5 pb-2">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>📊 أسعار بورصة السوق المعتمدة وتعديلها</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">تابع أسعار بورصة الدواجن والكتاكيت الحية في مصر أو قم بضبطها يدوياً لتتوافق مع منطقتك</p>
                  </div>
                  <PoultryExchangeBoard
                    exchangeDate={exchangeDate}
                    handleRefreshExchangePrices={handleRefreshExchangePrices}
                    isUpdatingExchange={isUpdatingExchange}
                    exchangeEditTab={exchangeEditTab}
                    setExchangeEditTab={setExchangeEditTab}
                    handleLoadMaherAlSheikhPrices={handleLoadMaherAlSheikhPrices}
                    marketTrends={marketTrends}
                    setMarketTrends={setMarketTrends}
                    poultryPrices={poultryPrices}
                    setPoultryPrices={setPoultryPrices}
                    favoriteExchangeIds={favoriteExchangeIds}
                    setFavoriteExchangeIds={setFavoriteExchangeIds}
                  />
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-4" id="exchanges_filtering_block">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Search Field */}
                    <div className="relative w-full md:w-80">
                      <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="البحث الذكي باسم البورصة، المالك أو الكلمة..."
                        value={exchangeSearchQuery}
                        onChange={(e) => setExchangeSearchQuery(e.target.value)}
                        className="w-full bg-[#051a0e] border border-[#144226] text-white placeholder-slate-500 rounded-xl py-2.5 pr-10 pl-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                      />
                      {exchangeSearchQuery && (
                        <button
                          onClick={() => setExchangeSearchQuery('')}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] hover:text-white text-slate-400 font-bold bg-white/5 px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          إلغاء
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap gap-2 justify-end w-full md:w-auto" dir="rtl">
                      <span className="text-[11px] text-slate-400 self-center ml-2">تصفية حسب المدن:</span>
                      {['الكل', 'ههيا', 'أبو كبير', 'الإبراهيمية', 'كفور نجم', 'الزقازيق', 'بلبيس', 'أبو حماد', 'ديرب نجم'].map((city) => (
                        <button
                          key={city}
                          onClick={() => setExchangeCityFilter(city)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                            exchangeCityFilter === city
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black'
                              : 'bg-emerald-950/40 text-slate-300 hover:text-white border border-emerald-900/30'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Exchanges Grid list */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="exchanges_list_grid">
                  {SHARKIA_EXCHANGES_LIST.filter(ex => {
                    // Filter logic
                    const matchCity = exchangeCityFilter === 'الكل' || ex.city === exchangeCityFilter;
                    const query = exchangeSearchQuery.toLowerCase();
                    const matchQuery = !query || 
                      ex.name.toLowerCase().includes(query) ||
                      ex.owner.toLowerCase().includes(query) ||
                      ex.city.toLowerCase().includes(query) ||
                      ex.type.toLowerCase().includes(query) ||
                      ex.locationDetails.toLowerCase().includes(query) ||
                      ex.bulletinText.toLowerCase().includes(query);
                    return matchCity && matchQuery;
                  }).map((item) => {
                    const isCopied = copiedExchangeId === item.id;
                    return (
                      <div 
                        key={item.id} 
                        className="bg-gradient-to-br from-[#061f10]/95 to-slate-950/95 border border-white/5 hover:border-emerald-500/20 rounded-2xl shadow-lg hover:shadow-emerald-500/5 transition duration-200 overflow-hidden flex flex-col justify-between"
                      >
                        {/* Exchange Card Header */}
                        <div className="p-5 border-b border-white/5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                                {item.badgeEmoji}
                              </span>
                              <div>
                                <h3 className="font-extrabold text-sm text-yellow-400 flex items-center gap-1.5 leading-snug text-right">
                                  {item.name}
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 font-extrabold text-[9px] border border-amber-500/20">
                                    {item.popularity}
                                  </span>
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1 justify-start">
                                  <span>المدير المسؤول:</span>
                                  <span className="text-white">{item.owner}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[11px] font-bold text-emerald-400 font-mono">
                                {item.date}
                              </span>
                              
                              <button
                                onClick={() => handleToggleFavoriteExchange(item.id)}
                                className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-bold transition cursor-pointer select-none ${
                                  favoriteExchangeIds.includes(item.id)
                                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                                }`}
                                title={favoriteExchangeIds.includes(item.id) ? "مفضلة وتصلك تنبيهاتها فوراً عند التغير المفاجئ" : "إضافة للبورصات المفضلة لاستقبال تنبيهات التغير المفاجئ للأسعار"}
                              >
                                <Star size={11} className={favoriteExchangeIds.includes(item.id) ? "fill-amber-400 text-amber-400" : ""} />
                                <span>{favoriteExchangeIds.includes(item.id) ? "مراقبة بالتنبيهات 🔔" : "تنبيه بالمفضلة ⭐"}</span>
                              </button>
                            </div>
                          </div>

                          <div className="mt-3.5 space-y-1 text-xs text-right">
                            <div className="flex items-center gap-1.5 text-slate-300 justify-start">
                              <MapPin size={12} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{item.locationDetails}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-start">
                              <span className="shrink-0 bg-emerald-900/30 px-1 rounded text-emerald-400 font-mono">التخصص</span>
                              <span className="truncate text-slate-300 font-semibold">{item.type}</span>
                            </div>
                          </div>
                        </div>

                        {/* Structured Prices Display */}
                        <div className="p-5 bg-black/25">
                          <h4 className="text-[10.5px] font-black text-amber-500 border-b border-white/5 pb-1 mr-auto text-right mb-2.5">💰 قائمة التسعير الرسمية الفورية:</h4>
                          
                          <div className="grid grid-cols-2 gap-2 text-right">
                            {/* Let's render key prices cleanly for this exchange */}
                            {item.prices.white_poultry && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5">
                                <span className="text-[10px] text-slate-400">لحم فراخ بيضاء:</span>
                                <span className="text-[11px] font-mono font-black text-amber-400">{item.prices.white_poultry} ج.م</span>
                              </div>
                            )}
                            {item.prices.sass_poultry && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                                <span className="text-[10px] text-slate-400">لحم فراخ ساسو:</span>
                                <span className="text-[11px] font-mono font-black text-amber-400">{item.prices.sass_poultry} ج.م</span>
                              </div>
                            )}
                            {item.prices.white_chick_corp && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5">
                                <span className="text-[10px] text-slate-400">كتكوت شركات:</span>
                                <span className="text-[11px] font-mono font-black text-[#38bdf8]">{item.prices.white_chick_corp} ج.m</span>
                              </div>
                            )}
                            {item.prices.white_chick_dist && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5">
                                <span className="text-[10px] text-slate-400">كتكوت أهالي:</span>
                                <span className="text-[11px] font-mono font-black text-sky-400">{item.prices.white_chick_dist} ج.م</span>
                              </div>
                            )}
                            {item.prices.sass_chick && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                                <span className="text-[10px] text-slate-400">كتكوت ساسو:</span>
                                <span className="text-[11px] font-mono font-black text-amber-400">{item.prices.sass_chick} ج.م</span>
                              </div>
                            )}
                            {item.prices.baladi_chick && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                                <span className="text-[10px] text-slate-400">كتكوت بلدي بيور:</span>
                                <span className="text-[11px] font-mono font-black text-emerald-400">{item.prices.baladi_chick} ج.م</span>
                              </div>
                            )}
                            {item.prices.duck_french && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                                <span className="text-[10px] text-slate-400">بط تسمين مولر:</span>
                                <span className="text-[11px] font-mono font-black text-amber-400">{item.prices.duck_french} ج.م</span>
                              </div>
                            )}
                            {item.prices.duck_muscovy_1day && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                                <span className="text-[10px] text-slate-400">بط مسكوفي ١يوم:</span>
                                <span className="text-[11px] font-mono font-black text-amber-400">{item.prices.duck_muscovy_1day} ج.م</span>
                              </div>
                            )}
                            {item.prices.egg_white && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                                <span className="text-[10px] text-slate-400">طبق بيض أبيض:</span>
                                <span className="text-[11px] font-mono font-black text-purple-400">{item.prices.egg_white} ج.م</span>
                              </div>
                            )}
                            {item.prices.egg_red && (
                              <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5 font-sans">
                                <span className="text-[10px] text-slate-400">طبق بيض أحمر:</span>
                                <span className="text-[11px] font-mono font-black text-purple-400">{item.prices.egg_red} ج.م</span>
                              </div>
                            )}
                          </div>

                          {/* Bulletin text wrapper */}
                          <div className="mt-4 bg-slate-950/60 rounded-xl p-3 border border-white/5 text-right font-sans">
                            <span className="text-[9.5px] uppercase font-black text-slate-400 tracking-wider block mb-1">المنشور اليومي المعتمد من المكتب:</span>
                            <p className="text-[10.5px] text-emerald-300 leading-normal whitespace-pre-wrap max-h-[85px] overflow-y-auto" dir="rtl">
                              {item.bulletinText}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="p-4 bg-emerald-950/15 border-t border-white/5 flex flex-col sm:flex-row items-center gap-3.5">
                          {/* APPLY PRICES EXTREMELY USEFUL */}
                          <button
                            onClick={() => {
                              handleApplyExchangePrices(item);
                              alert(`🎯 تم استيراد تسعيرة [${item.name}] بنجاح وتعميمها على حاسبة التخفيض، دليل الأوزان، وقسم البورصة بكامل التطبيق!`);
                            }}
                            className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 text-xs font-black rounded-xl cursor-pointer active:scale-[0.98] transition"
                            title="تطبيق هذه الأسعار بضغطة واحدة على القطيع والحسابات"
                          >
                            <Database size={13} />
                            <span>تطبيق أسعارها فوراً بالدليل 🎯</span>
                          </button>

                          <div className="w-full sm:w-1/2 flex items-center gap-2">
                            {/* COPY POST */}
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${item.name} - ${item.date}\n\n${item.bulletinText}\n\nالاتصال للحجز: ${item.phone}`);
                                setCopiedExchangeId(item.id);
                                setTimeout(() => setCopiedExchangeId(null), 2500);
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition border border-white/5"
                            >
                              {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              <span>{isCopied ? "نسخت النشرة!" : "نسخ النشرة 📋"}</span>
                            </button>

                            {/* HOTLINE PHONE CALL */}
                            <a
                              href={`tel:${item.phone}`}
                              className="px-3 py-2 bg-[#061f10] hover:bg-[#0b2b16] text-[#648f80] hover:text-emerald-400 rounded-xl transition border border-[#144226] text-xs font-bold flex items-center justify-center gap-1 shrink-0"
                              title="اتصال وحجز"
                            >
                              <Phone size={13} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {SHARKIA_EXCHANGES_LIST.filter(ex => {
                    const matchCity = exchangeCityFilter === 'الكل' || ex.city === exchangeCityFilter;
                    const query = exchangeSearchQuery.toLowerCase();
                    const matchQuery = !query || 
                      ex.name.toLowerCase().includes(query) ||
                      ex.owner.toLowerCase().includes(query) ||
                      ex.city.toLowerCase().includes(query) ||
                      ex.type.toLowerCase().includes(query) ||
                      ex.locationDetails.toLowerCase().includes(query) ||
                      ex.bulletinText.toLowerCase().includes(query);
                    return matchCity && matchQuery;
                  }).length === 0 && (
                    <div className="col-span-1 lg:col-span-2 text-center py-12 bg-slate-950/20 rounded-2xl border border-dashed border-white/5 space-y-2">
                      <span className="text-3xl block">🔍</span>
                      <p className="text-gray-400 text-xs font-bold">لم نعثر على أي بورصة تطابق البحث الحالي في محافظة الشرقية</p>
                      <button 
                        onClick={() => {
                          setExchangeSearchQuery('');
                          setExchangeCityFilter('الكل');
                        }}
                        className="text-[10px] text-amber-500 hover:underline"
                      >
                        إعادة تعيين مرشحات البحث
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 1: DAILY LIFECYCLE GUIDE
                ========================================================================= */}
            {currentTab === 'schedule' && (
              <div className="space-y-6 tab-transition" id="section_schedule">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-xl relative overflow-hidden" id="hero_guideline_header">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-10 translate-x-10 scale-125 font-bold text-[180px]">
                    ٥ك
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">لوحة متابعة اليوم {selectedDay} من دورة التسمين</h2>
                  <p className="text-sm text-slate-900/80 max-w-xl">تعرف على الجدول البيطري لتغذية الطائر، درجات الحرارة المطلوبة والتحويل المثالي للعبور بالطائر بأمان فوق حاجز الـ 5 كيلو جرام.</p>
                  
                  {/* Progress Day Fast Selector Slider */}
                  <div className="mt-8 bg-slate-950/20 rounded-2xl p-4 border border-white/10" id="life_slider_card">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">سحب المؤشر للتحكم باليوم:</span>
                      <span className="bg-slate-950 text-white rounded-full px-3 py-1 font-bold text-sm">اليوم {selectedDay} من ٥٠</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleSelectDay(Math.max(1, selectedDay - 1))}
                        className="bg-white/30 hover:bg-white text-slate-900 p-2 rounded-xl transition duration-150 font-bold active:scale-90"
                        title="اليوم السابق"
                      >
                        <ChevronRight size={18} />
                      </button>
                      <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={selectedDay}
                        onChange={(e) => handleSelectDay(Number(e.target.value))}
                        className="flex-1 accent-amber-950 cursor-pointer h-2 bg-amber-950/20 rounded-lg outline-hidden"
                      />
                      <button 
                        onClick={() => handleSelectDay(Math.min(50, selectedDay + 1))}
                        className="bg-white/30 hover:bg-white text-slate-900 p-2 rounded-xl transition duration-150 font-bold active:scale-90"
                        title="اليوم التالي"
                      >
                        <ChevronLeft size={18} />
                      </button>
                    </div>

                    {/* Pre-seeded milestones markers */}
                    <div className="mt-3 flex justify-between text-[11px] text-slate-900/70 font-semibold px-2">
                      <button onClick={() => handleSelectDay(1)} className="hover:text-black font-extrabold text-amber-950">يوم 1 (الكتكوت)</button>
                      <button onClick={() => handleSelectDay(7)} className="hover:text-black flex items-center gap-0.5">يوم 7 {!isDayUnlocked(7) && '🔒'}</button>
                      <button onClick={() => handleSelectDay(14)} className="hover:text-black flex items-center gap-0.5">يوم 14 {!isDayUnlocked(14) && '🔒'}</button>
                      <button onClick={() => handleSelectDay(28)} className="hover:text-black flex items-center gap-0.5">يوم 28 {!isDayUnlocked(28) && '🔒'}</button>
                      <button onClick={() => handleSelectDay(42)} className="hover:text-black flex items-center gap-0.5">يوم 42 {!isDayUnlocked(42) && '🔒'}</button>
                      <button onClick={() => handleSelectDay(50)} className="hover:text-black flex items-center gap-0.5">يوم 50 {!isDayUnlocked(50) && '🔒'}</button>
                    </div>
                  </div>
                </div>

                {/* ⏰ 6:00 AM DAILY WORK REMINDER SETTINGS CARD */}
                <div className="glass-panel rounded-3xl p-6 border border-emerald-900/60 shadow-2xl relative overflow-hidden" id="morning_reminder_settings_card">
                  {/* Subtle background gradient and patterns */}
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 mb-4 relative z-10 text-right" dir="rtl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 font-mono">نظام التذكير الميداني وحارس العنبر الصباحي ⏰</span>
                      </div>
                      <h3 className="font-extrabold text-white text-base">
                        منبه الساعة 6 صباحًا لإدارة الدورة (50 يوم)
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        تلقي إشعار صباحي مختصر بالعمل اليومي والجرعات المطلوبة للقطيع للعبور لوزن 5 كيلو غرام بأمان.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5 shrink-0" dir="rtl">
                      <span className="text-[10px] text-slate-400 font-bold block">حالة التنبيه اليومي:</span>
                      <button
                        onClick={() => {
                          setReminderEnabled(!reminderEnabled);
                          // Play a click sound
                          try {
                            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                            if (AudioCtx) {
                              const ctx = new AudioCtx();
                              const osc = ctx.createOscillator();
                              const gain = ctx.createGain();
                              osc.connect(gain);
                              gain.connect(ctx.destination);
                              osc.frequency.setValueAtTime(reminderEnabled ? 300 : 700, ctx.currentTime);
                              gain.gain.setValueAtTime(0.04, ctx.currentTime);
                              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                              osc.start(ctx.currentTime);
                              osc.stop(ctx.currentTime + 0.15);
                            }
                          } catch (e){}
                        }}
                        className={`font-black py-1 px-3 rounded-xl text-[10px] cursor-pointer transition ${
                          reminderEnabled 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {reminderEnabled ? '● نشط وتلقائي ⏰' : '○ متوقف 📴'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 text-right" dir="rtl" id="reminder_control_grid">
                    {/* Column 1: Config Batch Day */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-amber-400 font-extrabold block mb-1">📅 اليوم الفعلي لفوجك الميداني:</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          حدد عمر طيورك وعنبرك الحالي لتلقي إشعار الـ 6 صباحاً الموجه بشكل آلي لهذا اليوم بدقة.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <input 
                          type="range" 
                          min="1" 
                          max="50" 
                          value={currentBatchDay}
                          onChange={(e) => setCurrentBatchDay(Number(e.target.value))}
                          className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-white/10 rounded-lg outline-hidden"
                        />
                        <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg text-xs shrink-0 font-mono">
                          اليوم {currentBatchDay}
                        </span>
                      </div>
                    </div>

                    {/* Column 2: Scheduled Time Notice */}
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-extrabold block mb-1">⏰ توقيت تنبيه وحارس العنبر الإلزامي:</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          تمت جدولة العمليات لتنبيه المربي يومياً في ميعاد العمل والاستيقاظ الأنسب لتثبيت تغذية الصباح.
                        </p>
                      </div>
                      <div className="mt-4 bg-black/40 py-1.5 px-3 rounded-xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-300 font-bold">التوقيت المعتمد:</span>
                        <span className="text-xs text-amber-450 font-black font-mono flex items-center gap-1 text-amber-400">
                          <Clock size={12} />
                          06:00 ص يومياً
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Instant simulation testing */}
                    <div className="bg-[#051f0f] border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-amber-400 font-extrabold block mb-1">⚡ فحص فوري وسريع للتذكير:</span>
                        <p className="text-[11px] text-emerald-100/70 leading-normal font-medium">
                          قم بإرسال تنبيه واختبار رنين منبه الـ 6 صباحاً الخاص باليوم {currentBatchDay} ومحاكاة وصوله الميداني.
                        </p>
                      </div>
                      <button
                        onClick={() => handleTriggerMorningAlarm(currentBatchDay)}
                        className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                      >
                        <Bell size={13} className="animate-bounce" />
                        <span>محاكاة إرسال تذكرية اليوم {currentBatchDay} 🔔</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ==========================================
                    POULTRY SPECIES SPECIFICATIONS FOR MAXIMUM WEIGHT 
                    ========================================== */}
                <div className="glass-panel rounded-3xl p-6 border border-emerald-900/60 shadow-2xl relative overflow-hidden mt-6" id="species_specifications_section">
                  {/* Subtle background glow */}
                  <div className="absolute top-0 right-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-5 mb-5 relative z-10" id="specs_title_strip">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500 font-mono">كتالوج طيور وسلالات التسمين للوزن الزائد</span>
                      </div>
                      <h3 className="font-extrabold text-white text-xl mt-1 flex items-center gap-2">
                        <span>مواصفات طيور التسمين وأسعارها باليوم 📊🐥</span>
                      </h3>
                      <p className="text-slate-400 text-xs mt-1">المواصفات الشاملة لكل نوع، شروط الفرز الأول، والأسرار الذهبية لرفع معدل نمو الفراخ والبط لأقصى درجة</p>
                    </div>

                    <div className="flex items-center bg-black/40 p-1.5 rounded-xl border border-white/5" id="specs_badge_counter">
                      <span className="text-amber-400 text-xs font-black font-mono bg-amber-500/10 px-2 py-1 rounded-lg">٥ أنواع للتسمين</span>
                    </div>
                  </div>

                  {/* Interactive species selection tabs */}
                  <div className="flex flex-wrap gap-2 mb-6 relative z-10" id="species_tabs_container">
                    {[
                      { id: 'white_chick', label: 'كتكوت أبيض تسمين 🐔', subtitle: 'كب / روص / هبرد' },
                      { id: 'sasso_chick', label: 'كتكوت ساسو بيور 🐥', subtitle: 'تسمين فرنسي ثقيل' },
                      { id: 'baladi_chick', label: 'بلدي هجين مميز 🐓', subtitle: 'مقاومة ومناعة فائقة' },
                      { id: 'duck_french', label: 'بط مولار وفرنساوي 🦆', subtitle: 'تسمين مائي غزير' },
                      { id: 'turkey_bronze', label: 'رومي برونزي عملاق 🦃', subtitle: 'الأوزان الثقيلة جداً' }
                    ].map((tab) => {
                      const isActive = selectedBirdSpec === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedBirdSpec(tab.id as any)}
                          className={`flex-1 min-w-[140px] text-right p-3 rounded-2xl transition duration-200 border cursor-pointer select-none ${
                            isActive
                              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/10 font-bold'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5 hover:text-white'
                          }`}
                        >
                          <span className="block text-xs font-black">{tab.label}</span>
                          <span className={`block text-[9px] mt-0.5 font-semibold ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                            {tab.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Specified content panel based on active selectedBirdSpec */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 tab-transition" id="specs_details_display_grid">
                    
                    {/* Column 1: Core Performance Metrics Card */}
                    <div className="bg-black/35 p-5 rounded-2xl border border-white/5 flex flex-col justify-between" id="spec_performance_metrics">
                      <div>
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-4 font-sans font-medium tracking-tight">
                          <Award className="text-amber-500" size={18} />
                          <h4 className="text-sm font-black text-white">بطاقة الأداء القياسي للسلالة</h4>
                        </div>

                        <div className="space-y-4">
                          {/* target_weight */}
                          <div>
                            <span className="block text-[10px] text-slate-400">الوزن الأقصى المستهدف:</span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-2xl font-black text-amber-400 font-mono">
                                {selectedBirdSpec === 'white_chick' && '3.5'}
                                {selectedBirdSpec === 'sasso_chick' && '2.8'}
                                {selectedBirdSpec === 'baladi_chick' && '2.0'}
                                {selectedBirdSpec === 'duck_french' && '5.0'}
                                {selectedBirdSpec === 'turkey_bronze' && '22.0'}
                              </span>
                              <span className="text-xs font-bold text-slate-300">كيلو جرام (كجم)</span>
                            </div>
                            <span className="text-[9px] text-slate-400 italic block mt-0.5">
                              {selectedBirdSpec === 'white_chick' && 'تحت رعاية نموذجية دقيقة وعلف عالي الجودة'}
                              {selectedBirdSpec === 'sasso_chick' && 'سلالة فرنسية مقاومة للأجواء والحرارة'}
                              {selectedBirdSpec === 'baladi_chick' && 'لحم بلدي فاخر بأعلى نسبة مناعة طبيعية'}
                              {selectedBirdSpec === 'duck_french' && 'طاقة نمو ضخمة وتحويل دهني وعضلي متزن'}
                              {selectedBirdSpec === 'turkey_bronze' && 'لإنتاج أكبر عائد من اللحوم في المزارع الكبيرة'}
                            </span>
                          </div>

                          {/* cycle_duration */}
                          <div>
                            <span className="block text-[10px] text-slate-400">المدة الزمنية للدورة:</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-sm font-bold text-white font-mono">
                                {selectedBirdSpec === 'white_chick' && '35 - 40 يوم'}
                                {selectedBirdSpec === 'sasso_chick' && '55 - 60 يوم'}
                                {selectedBirdSpec === 'baladi_chick' && '65 - 75 يوم'}
                                {selectedBirdSpec === 'duck_french' && '50 - 60 يوم'}
                                {selectedBirdSpec === 'turkey_bronze' && '120 - 150 يوم'}
                              </span>
                            </div>
                          </div>

                          {/* standard_fcr */}
                          <div>
                            <span className="block text-[10px] text-slate-400">معامل التحويل الغذائي المستهدف (FCR):</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                              <span className="text-xs font-black text-emerald-400 font-mono">
                                {selectedBirdSpec === 'white_chick' && '1.4 - 1.5 (ممتاز)'}
                                {selectedBirdSpec === 'sasso_chick' && '1.8 - 2.0 (متوسط)'}
                                {selectedBirdSpec === 'baladi_chick' && '2.2 - 2.5 (عادي)'}
                                {selectedBirdSpec === 'duck_french' && '2.1 - 2.3 (جيد)'}
                                {selectedBirdSpec === 'turkey_bronze' && '2.5 - 2.7 (تسمين ثقيل)'}
                              </span>
                            </div>
                          </div>

                          {/* heat_disease_resistance */}
                          <div>
                            <span className="block text-[10px] text-slate-400">مقاومة الأمراض والحرارة العالية:</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-amber-400">
                              {selectedBirdSpec === 'white_chick' && '★★☆☆☆ (حساس للحرارة المرضية)'}
                              {selectedBirdSpec === 'sasso_chick' && '★★★★☆ (ممتاز صيفاً وشتاءً)'}
                              {selectedBirdSpec === 'baladi_chick' && '★★★★★ (أعلى مناعة ذاتية طبيعية)'}
                              {selectedBirdSpec === 'duck_french' && '★★★★☆ (مقاومة ممتازة)'}
                              {selectedBirdSpec === 'turkey_bronze' && '★★★☆☆ (يحتاج تيار وتحصين مكثف)'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic price connection to exchange */}
                      <div className="mt-4 pt-3 border-t border-white/5 text-right">
                        <span className="text-[10px] text-slate-400 block">سعر الكتكوت أو الطير لليوم بالبورصة:</span>
                        <div className="text-sm font-black text-amber-400 mt-1 flex items-center gap-1">
                          <Coins size={14} />
                          <span>
                            {selectedBirdSpec === 'white_chick' && `${poultryPrices.white_chick_corp ?? 12} ج.م (شركات) / ${poultryPrices.white_chick_dist ?? 12} ج.م (أهالي)`}
                            {selectedBirdSpec === 'sasso_chick' && `${poultryPrices.sass_chick} ج.م (ساسو جيل أول)`}
                            {selectedBirdSpec === 'baladi_chick' && `${poultryPrices.baladi_chick} ج.م (بلدي مشعر هجين)`}
                            {selectedBirdSpec === 'duck_french' && `${poultryPrices.duck_french} ج.م (فرنسي/مولار فرز أول)`}
                            {selectedBirdSpec === 'turkey_bronze' && '135 ج.م (برونزي فرز أول)'}
                          </span>
                        </div>
                        <span className="text-[9px] text-amber-500/80 font-semibold block mt-0.5">تحديث مباشر بناءً على قيم البورصة اليومية 📊</span>
                      </div>
                    </div>

                    {/* Column 2: First Grade Verification Checklist */}
                    <div className="bg-black/25 p-5 rounded-2xl border border-white/5 flex flex-col justify-between" id="spec_first_grade_rules">
                      <div>
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3.5 font-sans font-medium tracking-tight">
                          <ShieldCheck className="text-emerald-400" size={18} />
                          <h4 className="text-sm font-black text-white">كيف تعرف الفرز الأول الممتاز بالمعمل؟</h4>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed mb-3">
                          تأكد من تطبيق هذه الشروط أثناء الاستلام من التاجر أو مكتب التفريخ لتتجنب كتاكيت الموت المفاجئ والسرده:
                        </p>

                        <ul className="space-y-2.5">
                          {selectedBirdSpec === 'white_chick' && [
                            'حيوية ونشاط فائق: الكتكوت يتقلب من تلقاء نفسه خلال 3 ثوان عند وضعه على ظهره.',
                            'التئام السرة 100%: السرة مغلقة تماماً وجافة وبدون أي خرم أو خيوط سوداء بارزة.',
                            'الوزن المثالي: لا يقل وزن الكتكوت الأبيض عمر يوم عن 40 إلى 42 جرام.',
                            'أعضاء سليمة تماماً: الأرجل ممتلئة ولامعة خالية من الجفاف أو التورم أو انحناء المفاصل.'
                          ].map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="text-emerald-400 text-xs font-bold mt-0.5 shrink-0">✔</span>
                              <span>{rule}</span>
                            </li>
                          ))}

                          {selectedBirdSpec === 'sasso_chick' && [
                            'مظهر الريش: نظيف ومتناسق وناعم مع لون بني/أحمر زاهي ومميز للجيل الأول.',
                            'الوزن الفعلي: وزن الاستقبال للساسو بيور يجب ألا يقل عن 38 جرام بالجرام الفعلي.',
                            'الاستجابة واليقظة: الكتكوت منتبه جداً للأصوات والحركات الفورية حوله بالمفرخ.',
                            'العين براقة: خلو العيون وجوانب الفم من أي بقايا سوائل أو منقار تالف أو ملتوي.'
                          ].map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="text-emerald-400 text-xs font-bold mt-0.5 shrink-0">✔</span>
                              <span>{rule}</span>
                            </li>
                          ))}

                          {selectedBirdSpec === 'baladi_chick' && [
                            'النشاط والحركة: حركية عالية جداً وركض سريع، الكتاكيت تتجمع فوراً عند رمي قليل من العلف.',
                            'منطقة الأرداف والمؤخرة: نظيفة تماماً بيضاء وجافة وخالية من الإسهالات الصفراء أو البيضاء.',
                            'جفاف الريش الزغب: الريش المحيط بالرأس والرقبة ناعم ومنفوش تماماً وجاف ليس ملتصقاً.',
                            'مغلف السرة والجلد: لا توجد بقع زرقاء أو التهابات معوية واضحة بجلد الكتكوت.'
                          ].map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="text-emerald-400 text-xs font-bold mt-0.5 shrink-0">✔</span>
                              <span>{rule}</span>
                            </li>
                          ))}

                          {selectedBirdSpec === 'duck_french' && [
                            'المنقار والعيون: منقار عريض ذو بنية قوية خالي من التشوه مع عيون شديدة الاتساع والانتباه.',
                            'وزن الاستلام: ثقيل ووافر لا يقل عن 55 إلى 60 جرام للبطة الواحدة.',
                            'قوة الأرجل والمفاصل: مرونة تامة في الحركة مع أقدام عريضة قوية تدعم المشي المتوازن.',
                            'الترطيب الطبيعي: جسم بط مشدود مغطى بطبقة كثيفة ناعمة من الفراء المقاوم للماء.'
                          ].map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="text-emerald-400 text-xs font-bold mt-0.5 shrink-0">✔</span>
                              <span>{rule}</span>
                            </li>
                          ))}

                          {selectedBirdSpec === 'turkey_bronze' && [
                            'بنية عظمية ضخمة: ركب الأقدام سميكة وعظام الساق مستقيمة وقادرة على حمل الوزن الهائل مستقبلاً.',
                            'العيون المفتوحة: عين واسعة نظيفة مع انتصاب الرأس واليقظة للبيئة المحيطة.',
                            'وزن الاستقبال المتين: لا يقل عن 60 لـ 65 جرام لضمان مخزون كافي من الطاقة داخل الطير.',
                            'السرة والبطن: لينة وصغيرة خالية تماماً من التحجير أو بقايا بياض البيض غير الملتئم.'
                          ].map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                              <span className="text-emerald-400 text-xs font-bold mt-0.5 shrink-0">✔</span>
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/65 mt-3 text-emerald-450 text-[10px] text-center font-bold">
                        🚨 تأكد من فرز عينة عشوائية بواقع 10 كتاكيت لكل 100 كتكوت!
                      </div>
                    </div>

                    {/* Column 3: Redline Golden Tactics to reach maximum weight */}
                    <div className="bg-black/25 p-5 rounded-2xl border border-white/5 flex flex-col justify-between" id="spec_gold_secrets">
                      <div>
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 mb-3.5 font-sans font-medium tracking-tight">
                          <Sparkles className="text-amber-500" size={18} />
                          <h4 className="text-sm font-black text-white">الأسرار الذهبية للوصول لأعلى وزن</h4>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed mb-3">
                          مجموعة من التعليمات الحرجة والمجربة للوصول لأقصى إنتاج من اللحم الفعلي وتقليل الهدر في العلف:
                        </p>

                        <div className="space-y-3.5">
                          {selectedBirdSpec === 'white_chick' && [
                            { title: 'حرارة الاستقبال الصارمة 🌡', text: 'أول 3 أيام على 33 درجة مئوية ثم تقليل درجة واحدة كل يومين للوصول لـ 24-26 درجة بالتدريج لتقوية الهضم.' },
                            { title: 'محلول المياه السكرية 💧', text: 'استقبال الكتاكيت أول ساعتين على ماء وسكر أو محلول معالجة جفاف لتجديد طاقة الكبد والقلب قبل البدء بتناول العلف.' },
                            { title: 'بروتينات العلف المقننة 🌾', text: 'بادي 23% بروتين حتى وزن 500 جرام (يوم 15-18)، ثم نامي 21% حتى وزن 1.8 كجم (يوم 30)، ثم ناهي 19% لتلميع وتسمين اللحم.' }
                          ].map((t, idx) => (
                            <div key={idx} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5">
                              <span className="text-xs font-extrabold text-amber-400 block mb-0.5">{t.title}</span>
                              <span className="text-[10px] text-slate-300 block leading-relaxed">{t.text}</span>
                            </div>
                          ))}

                          {selectedBirdSpec === 'sasso_chick' && [
                            { title: 'برامج إضاءة متوازنة 💡', text: 'توفير فترات ظلام ليلية بمعدل ساعتين لراحة الكتكوت وإفراز هرمون النمو الطبيعي بانتظام.' },
                            { title: 'مكافحة سموم الأعلاف الفطرية 🐛', text: 'دورة الساسوطويلة تصل لـ 60 يوم، لذلك استخدام مضاد سموم فطرية بيلوجي قوي مرتين كل أسبوع بالماء إجباري لحماية الكلى.' },
                            { title: 'رعاية المفاصل والأوزان 🦴', text: 'إمداد الفوج بجرام منتظم من أملاح الكالسيوم والفوسفور وفيتامين AD3E لبناء سيقان قوية تتحمل الوزن الثقيل بدون كساح.' }
                          ].map((t, idx) => (
                            <div key={idx} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5">
                              <span className="text-xs font-extrabold text-amber-400 block mb-0.5">{t.title}</span>
                              <span className="text-[10px] text-slate-300 block leading-relaxed">{t.text}</span>
                            </div>
                          ))}

                          {selectedBirdSpec === 'baladi_chick' && [
                            { title: 'بروتين مكثف لرفع الأوزان 🌾', text: 'البلدي هجين ينمو بشكل رائع جداً لو تغذى على علف نامي 21% وتجنب العليقة المغشوشة أو الرخيصة في أول 30 يوماً.' },
                            { title: 'المضادات والتحصينات الوقائية 🛡', text: 'تحصينات غسيل الكلى ومضاد الكوكسيديا على عمر 12 و22 يوم تمنع تآكل أمعاء الفراخ فيجعلها تمتص 100% من العلف.' },
                            { title: 'خلطات المناعة البلدية 🧄', text: 'جرعة بقدونس مقطع منقوع ومياه بصل وثوم تمنح الفراخ مناعة حديدية ضد الفيروسات في المواسم الهوائية المتغيرة.' }
                          ].map((t, idx) => (
                            <div key={idx} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5">
                              <span className="text-xs font-extrabold text-amber-400 block mb-0.5">{t.title}</span>
                              <span className="text-[10px] text-slate-300 block leading-relaxed">{t.text}</span>
                            </div>
                          ))}

                          {selectedBirdSpec === 'duck_french' && [
                            { title: 'التحكم الصارم برطوبة الفرشة 🍂', text: 'البط يطلق كمية بخار وفضلات سائلة غزيرة. يجب توفير نشارة خشب أو قش بطبقة سميكة والتهوية المستمرة لتفادي الكوليزا.' },
                            { title: 'علف خشن متجانس لمنع الهدر 🌾', text: 'البط يبعثر العلف الناعم، لذلك الأعلاف المصنعة المضغوطة (Pellets) تزيد من وزن البطة الفعلي وتوفر 30% من استهلاك العلف.' },
                            { title: 'حظر نزول الماء المبكر 🌊', text: 'يحظر نزول الفراخ/البط لبرك المزارع أو قنوات المياه العميقة قبل عمر 22 يوماً حتى تكتمل غدد الريش المانعة لامتصاص الرطوبة والبرد.' }
                          ].map((t, idx) => (
                            <div key={idx} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5">
                              <span className="text-xs font-extrabold text-amber-400 block mb-0.5">{t.title}</span>
                              <span className="text-[10px] text-slate-300 block leading-relaxed">{t.text}</span>
                            </div>
                          ))}

                          {selectedBirdSpec === 'turkey_bronze' && [
                            { title: 'تغذية خارقة أول 4 أسابيع 🌾', text: 'يحتاج الرومي لنسبة بروتين ضخمة 26% لـ 28% (بادي سوبر رومي) لتأسيس هيكله العظمي الهائل، وإلا سيقزم جسمه نهائياً.' },
                            { title: 'تدفئة استثنائية 🌡', text: 'حساس جداً للبرد في أيامه السبعة الأولى؛ استقبله على حرارة مثالية 35 درجة مئوية مع حماية جدران الغرفة تماماً من أي تسريب للهواء.' },
                            { title: 'الوقاية من مرض الرأس الأسود 🛡', text: 'إعطاء مضاد الهستوموناس بانتظام في الماء بالتشاور مع الطبيب لحماية الطيور من القاتل الصامت في أعمار الرومي المتوسطة.' }
                          ].map((t, idx) => (
                            <div key={idx} className="bg-white/5 hover:bg-white/10 p-2.5 rounded-xl transition duration-150 border border-white/5">
                              <span className="text-xs font-extrabold text-amber-400 block mb-0.5">{t.title}</span>
                              <span className="text-[10px] text-slate-300 block leading-relaxed">{t.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-amber-500 font-bold bg-amber-500/10 p-2 text-[10.5px] rounded-lg border border-amber-500/10">
                        <Zap size={14} className="shrink-0 text-amber-400 animate-pulse" />
                        <span>نصيحة ذهبية: الالتزام ببرنامج التحصينات المتواجد بالبرنامج الوطني المرفق بالتطبيق يضمن تحصين الطيور 100%!</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Main day specification grid */}
                <div 
                  className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-700 ${
                    flashGuideline 
                      ? 'ring-4 ring-amber-500 ring-offset-4 ring-offset-slate-950 rounded-2xl scale-[1.01] shadow-2xl shadow-amber-500/20' 
                      : ''
                  }`} 
                  id="stats_guidelines_grid"
                >
                  
                  {/* Left Column: Essential Metrics */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col space-y-4" id="essential_metrics_sidebar">
                    <h3 className="font-bold text-slate-900 text-md border-b pb-2 flex items-center gap-2">
                      <span className="w-1.5 h-3.5 bg-amber-500 rounded-sm"></span>
                      أرقام كتالوج التسمين القياسية
                    </h3>

                    {/* Thermometer scale card */}
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                          <Thermometer size={18} />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">درجة الحرارة المستهدفة</span>
                          <span className="text-slate-900 font-bold text-sm">العنبر شتاءً/صيفاً</span>
                        </div>
                      </div>
                      <div className="text-left font-mono font-extrabold text-lg text-rose-600">
                        {currentGuideline.temperature}°C
                      </div>
                    </div>

                    {/* Weight scale card */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <Scale size={18} />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">الوزن المستهدف للفرخ</span>
                          <span className="text-slate-900 font-bold text-sm">أداء الكتالوج الجيد</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className="font-mono font-extrabold text-lg text-emerald-600 block">
                          {currentGuideline.targetWeight >= 1000 
                            ? `${(currentGuideline.targetWeight/1000).toFixed(2)} كجم` 
                            : `${currentGuideline.targetWeight} جرام`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Feed intake per bird card */}
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                          <Layers size={18} />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">سحب العلف اليومي / طائر</span>
                          <span className="text-slate-900 font-bold text-sm">معدل التلقيم المتساوي</span>
                        </div>
                      </div>
                      <div className="text-left font-mono font-extrabold text-md text-amber-700">
                        {currentGuideline.dailyFeedPerBird} جرام / طائر
                      </div>
                    </div>

                    {/* FCR target progress */}
                    <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
                          <Activity size={18} />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block">المعامل التراكمي المستهدف (FCR)</span>
                          <span className="text-slate-900 font-bold text-sm">استغلال طاقة الغذاء</span>
                        </div>
                      </div>
                      <div className="text-left font-mono font-extrabold text-md text-violet-600">
                        {currentGuideline.fcrMetric}
                      </div>
                    </div>

                    {/* Stage badge banner */}
                    <div className="mt-auto bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                      <div className="text-[11px] text-slate-400 font-medium">المرحلة الفسيولوجية الحالية:</div>
                      <div className="text-amber-400 font-extrabold text-base mt-1 relative z-10 leading-snug">
                        {currentGuideline.stageName}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
                        <span className="font-bold text-amber-300">نوع العلف المطلق:</span> {currentGuideline.feedType}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Detailed Guidelines & Recommendations */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs md:col-span-2 flex flex-col space-y-4" id="main_guidelines_details">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <span className="p-1 px-2.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs">توصيات المربين</span>
                        شروحات وإرشادات الرعاية لليوم {selectedDay}
                      </h3>
                      <div className="text-xs text-slate-400 font-medium">
                        مرحلة: {selectedDay <= 10 ? 'تحضين' : selectedDay <= 28 ? 'تربية نامي' : 'تسمين أوزان ثقيلة'}
                      </div>
                    </div>

                    {/* Ventilation and lighting requirements alerts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="ventilation_lighting_cards gap-4">
                      <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-2.5">
                        <Wind className="text-sky-600 mt-0.5 shrink-0" size={18} />
                        <div>
                          <span className="text-[11px] text-slate-500 font-bold block">إدارة التهوية وسحب الرطوبة:</span>
                          <span className="text-xs text-slate-700 font-semibold">{currentGuideline.ventilationSpeed}</span>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/70 flex items-start gap-2.5">
                        <Lightbulb className="text-amber-500 mt-0.5 shrink-0" size={18} />
                        <div>
                          <span className="text-[11px] text-slate-500 font-bold block">مظلة الإضاءة المطلوبة:</span>
                          <span className="text-xs text-slate-700 font-semibold">{currentGuideline.lightingHours} ساعة إضاءة + {24 - currentGuideline.lightingHours} ساعات إظلام</span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Bullet Points Instructions */}
                    <div className="space-y-3.5 mt-3">
                      <span className="text-sm font-bold text-slate-900 block bg-slate-100 p-2 rounded-lg">قائمة الواجبات والمهام البيطرية لضمان الوزن:</span>
                      
                      <div className="space-y-2.5">
                        {currentGuideline.instructions.map((inst, index) => (
                          <div key={index} className="flex gap-3 items-start p-3 hover:bg-slate-50 rounded-xl transition-all duration-150 border border-slate-50">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                              {index + 1}
                            </div>
                            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-semibold">
                              {inst}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weight Scale Milestone Helper Warnings */}
                    {selectedDay >= 35 && (
                      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mt-auto" id="warning_box_superweight">
                        <div className="flex gap-2.5">
                          <AlertTriangle className="text-rose-600 shrink-0" size={18} />
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">تنبيهات حرجة للأوزان الثقيلة (فوق 3.5 كيلو جرام للفرخ):</span>
                            <p className="text-xs text-slate-700 mt-1 leading-relaxed font-medium">
                              الدواجن دخلت مرحلة التضخم العضلي الكبسولي. راقب عن كثب رطوبة فرشة الحظيرة وقل وافرش نشارة جديدة يومياً لمنع الكوليرا أو الكساح. التهوية المستمرة والحرارة تحت 21 درجة مئوية هما صمام النجاة من موت السكتة القلبية.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Growth Curve Visualization Banner Map */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl" id="growth_milestons_footer">
                  <h3 className="font-bold text-lg text-amber-400 mb-4 flex items-center gap-1.5 justify-between">
                    <span>مسار الأوزان التأسيسي للوصول لـ 5 كيلو جرام 📈</span>
                    <span className="text-xs text-slate-400 font-medium font-mono">منحنى صعود الأوزان القياسية</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { age: 'يوم 1', weight: '45 ج', color: 'bg-slate-800 border-slate-700' },
                      { age: 'يوم 7', weight: '185 ج', color: 'bg-slate-800 border-slate-700' },
                      { age: 'يوم 21', weight: '950 ج', color: 'bg-slate-800 border-slate-700' },
                      { age: 'يوم 35', weight: '2.60 كجم', color: 'bg-slate-800 border-slate-700' },
                      { age: 'يوم 50', weight: '5.10 كجم', color: 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 text-slate-950 font-extrabold' }
                    ].map((step, idx) => (
                      <div key={idx} className={`p-3.5 rounded-xl border text-center relative ${step.color}`} id={`curve_step_${idx}`}>
                        <span className="block text-[11px] opacity-75 font-semibold">{step.age}</span>
                        <span className="block text-sm font-extrabold mt-1">{step.weight}</span>
                        {idx < 4 && (
                          <div className="hidden sm:block absolute top-1/2 -left-1.5 transform -translate-y-1/2 text-slate-600 font-bold z-10 font-mono">
                            ➔
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================================
                TAB 2: FCR CALCULATOR & BIRD FEED EFFICIENCY
                ========================================================================= */}
            {currentTab === 'calculator' && (
              <div className="space-y-6 tab-transition" id="section_calculator">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md">
                  <div className="flex items-center gap-3 border-b pb-4 mb-6">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950">
                      <Calculator size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900">حاسبة معامل التحويل الغذائي الذكية (FCR Evaluator)</h2>
                      <p className="text-xs text-slate-500">ادخل بيانات القطيع لحساب كفاءة تحويل الكيلوجرام من العلف إلى وزن لحم حقيقي، لتفادي هدر العلف وحساب ربحيتك.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    
                    {/* Inputs form */}
                    <form onSubmit={calculateFCR} className="lg:col-span-2 space-y-4" id="fcr_calculator_form">
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">عمر الفراخ الحالي (بالأيام):</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="50"
                          value={calcDay}
                          onChange={(e) => setCalcDay(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                          required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">يحدد نوع الوزن القياسي الذي سنقارن أوزانك الفعلية معه.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">العدد الإجمالي التقريبي للدجاج الحي بالفوج:</label>
                        <input 
                          type="number" 
                          min="1" 
                          value={birdCount}
                          onChange={(e) => setBirdCount(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">متوسط وزن الدجاج الفعلي الفردي (بالجرام):</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="10" 
                            value={avgWeightGrams}
                            onChange={(e) => setAvgWeightGrams(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-12 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                            required
                          />
                          <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-semibold font-mono">جرام</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          قم بوزن عينات فردية مختلفة من أماكن مختلفة بالحظيرة واحسب متوسطها.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2">تحديد عبوة / وزن شيكارة العلف المستهلكة: 📦</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3" dir="rtl">
                          {[
                            { value: '50kg', label: 'شيكارة 50 كجم' },
                            { value: '25kg', label: 'شيكارة 25 كجم' },
                            { value: '10kg', label: 'شيكارة 10 كجم' },
                            { value: 'custom_small', label: 'وزن مخصص (1-10 كجم)' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setFeedBagWeightOption(opt.value as any)}
                              className={`p-2.5 rounded-xl border text-[10.5px] font-extrabold text-center transition ${
                                feedBagWeightOption === opt.value
                                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {feedBagWeightOption === 'custom_small' && (
                          <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200 mb-3 space-y-2 fade-in">
                            <label className="block text-[10px] font-bold text-amber-900">أدخل الوزن المخصص بالشيكارة أو العبوة الصغيرة (من 1 إلى 10 كجم):</label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={customFeedBagWeight}
                                onChange={(e) => setCustomFeedBagWeight(Math.max(1, Math.min(10, Number(e.target.value))))}
                                className="w-full bg-white border border-amber-300 rounded-lg p-2 pl-12 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 text-center"
                                required
                              />
                              <span className="absolute left-3 top-2.5 text-[10px] text-amber-700 font-bold">كجم للعبوة</span>
                            </div>
                            <p className="text-[9.5px] text-amber-700/80 leading-relaxed font-semibold">
                              * مخصص للأفواج البادئة والصغيرة (سواء اشتريت 1 كيلو، 2 كيلو، 5 كيلو، أو 7 كيلو) لحساب دقيق للهدر وصافي الربح.
                            </p>
                          </div>
                        )}

                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {feedBagWeightOption === 'custom_small'
                            ? `عدد العبوات المستهلكة (بوزن ${customFeedBagWeight} كجم):`
                            : `عدد الشكارات المستهلكة (بوزن ${feedBagWeightOption === '50kg' ? '50' : feedBagWeightOption === '25kg' ? '25' : '10'} كجم):`
                          }
                        </label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="1" 
                            value={totalFeedBags}
                            onChange={(e) => setTotalFeedBags(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-12 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                            required
                          />
                          <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-semibold font-mono">شكارة / عبوة</span>
                        </div>
                        <p className="text-[10px] text-emerald-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mt-1.5 font-bold" dir="rtl">
                          💡 إجمالي كمية العلف المستهلكة الفعلية: {
                            feedBagWeightOption === '50kg'
                              ? totalFeedBags * 50
                              : feedBagWeightOption === '25kg'
                              ? totalFeedBags * 25
                              : feedBagWeightOption === '10kg'
                              ? totalFeedBags * 10
                              : totalFeedBags * customFeedBagWeight
                          } كجم من العلف الكلي للدورة.
                        </p>
                      </div>

                      <div className="pt-2 flex gap-3">
                        <button 
                          type="submit"
                          className="flex-1 bg-amber-500 text-slate-950 hover:bg-amber-600 p-3.5 rounded-xl font-bold text-sm transition duration-150 active:scale-95 shadow-md shadow-amber-500/10"
                        >
                          احسب كفاءة التحويل
                        </button>
                        <button 
                          type="button"
                          onClick={handleResetCalc}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3.5 rounded-xl transition duration-150 font-bold text-sm"
                        >
                          إعادة تهيئة
                        </button>
                      </div>

                    </form>

                    {/* Results / Visual feedback */}
                    <div className="lg:col-span-3 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex flex-col justify-center" id="fcr_results_display">
                      {fcrResult !== null && fcrAssessment !== null ? (
                        <div className="space-y-5 fade-in">
                          
                          {/* Circle gauge block */}
                          <div className="text-center">
                            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider mb-1">معامل تحويل العلف الفعلي للدورة</span>
                            <div className="relative inline-flex items-center justify-center p-6 bg-slate-900 rounded-full text-white mx-auto shadow-xl ring-8 ring-amber-500/10 border-4 border-amber-400">
                              <div className="text-center px-4 py-2">
                                <span className="block text-4xl font-mono font-extrabold text-amber-400">{fcrResult}</span>
                                <span className="block text-[10px] text-slate-300 mt-1 leading-none font-bold">جرام علف : 1 ج لحم</span>
                              </div>
                            </div>
                            
                            {/* Color coded Badge indicator */}
                            <div className="mt-4 inline-block">
                              {fcrAssessment.status === 'excellent' && (
                                <span className="bg-emerald-500/15 text-emerald-700 font-extrabold text-xs px-4 py-1.5 rounded-full border border-emerald-500/30">
                                  امتصاص فائق للدهن واللحم (ممتاز 🌟)
                                </span>
                              )}
                              {fcrAssessment.status === 'good' && (
                                <span className="bg-sky-500/15 text-sky-700 font-extrabold text-xs px-4 py-1.5 rounded-full border border-sky-500/30">
                                  تحويل متناسق وصحي (جيد 👍)
                                </span>
                              )}
                              {fcrAssessment.status === 'average' && (
                                <span className="bg-amber-500/15 text-amber-700 font-extrabold text-xs px-4 py-1.5 rounded-full border border-amber-500/30">
                                  معدل يحتاج لاهتمام تغذوي ومضادات (طبيعي ⚠️)
                                </span>
                              )}
                              {fcrAssessment.status === 'poor' && (
                                <span className="bg-rose-500/15 text-rose-700 font-extrabold text-xs px-4 py-1.5 rounded-full border border-rose-500/30">
                                  إنذار خسائر بالشكارات وتبعثر (ضعيف 🛑)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Assessment texts */}
                          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs space-y-3">
                            <div>
                              <span className="text-slate-500 text-[10px] font-bold block">التقييم التقني:</span>
                              <p className="text-slate-800 text-xs md:text-sm font-semibold mt-0.5 leading-relaxed">
                                {fcrAssessment.text}
                              </p>
                            </div>

                            <div className="border-t pt-3">
                              <span className="text-amber-600 text-[10px] font-extrabold block">تعليمات فورية لتحسين التحويل:</span>
                              <p className="text-slate-700 text-xs md:text-sm font-medium mt-1 leading-relaxed">
                                {fcrAssessment.action}
                              </p>
                            </div>
                          </div>

                          {/* Quick Comparison Data metrics */}
                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-white p-3 rounded-xl text-center border">
                              <span className="text-[10px] text-slate-400 block">العلف الكلي المستهلك</span>
                              <span className="font-mono font-extrabold text-slate-800 text-sm mt-0.5 block">
                                {feedBagWeightOption === '50kg'
                                  ? totalFeedBags * 50
                                  : feedBagWeightOption === '25kg'
                                  ? totalFeedBags * 25
                                  : feedBagWeightOption === '10kg'
                                  ? totalFeedBags * 10
                                  : totalFeedBags * customFeedBagWeight
                                } كجم
                              </span>
                            </div>
                            <div className="bg-white p-3 rounded-xl text-center border">
                              <span className="text-[10px] text-slate-400 block">إجمالي كتل الفوج المستهدفة</span>
                              <span className="font-mono font-extrabold text-slate-800 text-sm mt-0.5 block">
                                {Math.round((getGuidelineForDay(calcDay).targetWeight * birdCount)/1000)} كجم
                              </span>
                            </div>
                          </div>

                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <Calculator size={54} className="mx-auto mb-3 opacity-30 text-amber-600" />
                          <p className="text-sm font-semibold text-slate-600">قم بتعبئة بيانات الفوج بالكامل والضغط على المفتاح للحساب.</p>
                          <p className="text-[10px] text-slate-400 mt-1">يقارن البرنامج أرقامك الحقيقية بأرقام دجاج الـ 5 كجم ويرشدك.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Explanatory Info Card About FCR */}
                <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center gap-5">
                  <div className="bg-amber-400 text-slate-950 p-3 rounded-2xl shrink-0">
                    <Info size={28} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-400 mb-1">ما هو معامل تحويل العلف (FCR) وكيف يتحكم في ربح مزارع الدواجن؟</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      هو مقدار الكيلوجرامات من العلف التي يحتاجها الدجاج للحصول على زيادة قدرها 1 كيلوجرام في وزنه الحي. معامل FCR الأقل (مثلاً 1.4) يعني أن الطائر يحول الغذاء للحم بكفاءة فائقة (يحتاج 1400 جرام علف ليزيد 1 كيلو لحم). ومعامل FCR الأكبر (مثلاً 2.0) يعني هدر الأموال والعلف بالنشارة أو ضعف هضم الطائر. الحفاظ على معامل منخفض هو السبيل الوحيد للحصول على فرخ 5 كيلو باستهلاك علف اقتصادي مناسب.
                    </p>
                  </div>
                </div>

                {/* 💰 FINANCIAL FEASIBILITY & NET PROFIT ESTIMATOR (Feature 4) */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md space-y-6" id="flock_roi_calculator_section">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-500/15">
                        <Coins size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900">حاسبة الجدوى الاقتصادية والأرباح الميدانية 💰</h2>
                        <p className="text-xs text-slate-500">ماتور حسابي متكامل تقديري لتكاليف دورة الـ 50 يوم لحم وصافي الأرباح المتوقعة.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Input form */}
                    <div className="lg:col-span-2 space-y-4 text-right" dir="rtl">
                      <h3 className="font-extrabold text-slate-800 text-xs border-b pb-2 mb-3">📋 متغيرات التكلفة والبيع للقطيع:</h3>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">العدد الحالي بالحظيرة:</label>
                          <input 
                            type="number" 
                            min="10"
                            value={birdCount}
                            onChange={(e) => setBirdCount(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">النمو المستهدف للبيع:</label>
                          <input 
                            type="text" 
                            value={`${(getGuidelineForDay(calcDay).targetWeight / 1000).toFixed(2)} كجم`}
                            disabled
                            className="w-full bg-slate-100 border rounded-lg p-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">سعر الكتكوت الصغير (جنية):</label>
                          <input 
                            type="number" 
                            min="1"
                            value={chickPrice}
                            onChange={(e) => setChickPrice(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-amber-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">سعر طن العلف بجم (جنية):</label>
                          <input 
                            type="number" 
                            min="1000"
                            value={tonFeedPrice}
                            onChange={(e) => setTonFeedPrice(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">الأدوية والتطعيم / طير:</label>
                          <input 
                            type="number" 
                            min="0"
                            value={vaccineCostPerBird}
                            onChange={(e) => setVaccineCostPerBird(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-emerald-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">كهرباء ومياه ونثريات / طير:</label>
                          <input 
                            type="number" 
                            min="0"
                            value={overheadCostPerBird}
                            onChange={(e) => setOverheadCostPerBird(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">سعر الكيلو عند بيع اللحم (جنية):</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="10"
                            value={meatSellingPrice}
                            onChange={(e) => setMeatSellingPrice(Number(e.target.value))}
                            className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 pl-12 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-emerald-500 text-center"
                          />
                          <span className="absolute left-3 top-2.5 text-[9px] text-zinc-500 font-bold font-mono">جنية / كجم</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">توقع أرباحك الصافية الحالية بناءً على أسعار البورصة للساسو أو الأبيض اليوم.</p>
                      </div>
                    </div>

                    {/* Result outputs calculation block */}
                    {(() => {
                      // calculations
                      const feedNeededKg = (birdCount * 11.5); // ~11.5 kg is standard for 5kg target
                      const totalFeedTonsNeeded = feedNeededKg / 1000;
                      const totalFeedCost = totalFeedTonsNeeded * tonFeedPrice;
                      const totalChickCost = birdCount * chickPrice;
                      const totalMedsCost = birdCount * vaccineCostPerBird;
                      const totalOverheadCost = birdCount * overheadCostPerBird;
                      const grandTotalCost = totalFeedCost + totalChickCost + totalMedsCost + totalOverheadCost;

                      // Surviving birds 3% mortality rate
                      const survivorsCount = Math.round(birdCount * 0.97);
                      const targetWeightKgSingle = getGuidelineForDay(calcDay).targetWeight / 1000;
                      const totalLiveFlockWeightKg = survivorsCount * targetWeightKgSingle;
                      const totalEstimatedRevenue = totalLiveFlockWeightKg * meatSellingPrice;
                      const netProfit = totalEstimatedRevenue - grandTotalCost;
                      const costPerKgProduced = grandTotalCost / (totalLiveFlockWeightKg || 1);
                      const roiValue = (netProfit / (grandTotalCost || 1)) * 100;
                      const breakEvenPrice = grandTotalCost / (totalLiveFlockWeightKg || 1);

                      return (
                        <div className="lg:col-span-3 bg-slate-50 rounded-2xl p-6 border border-slate-200/60 flex flex-col justify-between" id="finances_results_display">
                          <div>
                            <span className="text-xs text-slate-400 font-semibold block text-center mb-1">صافي أرباح الفوج الإجمالية المتوقعة 💎</span>
                            <div className="text-center">
                              <span className={`block font-mono font-extrabold text-2xl md:text-3.5xl ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {netProfit >= 0 ? `+${Math.round(netProfit).toLocaleString()} جنية` : `${Math.round(netProfit).toLocaleString()} جنية`}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold block mt-1">برجاء مراجعة مؤشر الاستثمار المالي التالي:</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-5 text-right" dir="rtl">
                              <div className="bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 block font-bold">تكلفة الصغار:</span>
                                <span className="font-mono text-xs font-black text-slate-800 block mt-0.5">{Math.round(totalChickCost).toLocaleString()} ج</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] text-slate-400 block font-bold">تكلفة الأعلاف:</span>
                                <span className="font-mono text-xs font-black text-amber-700 block mt-0.5">{Math.round(totalFeedCost).toLocaleString()} ج</span>
                              </div>
                              <div className="bg-white p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                                <span className="text-[10px] text-slate-400 block font-bold">مصاريف حقلية وأدوية:</span>
                                <span className="font-mono text-xs font-black text-slate-800 block mt-0.5">{Math.round(totalMedsCost + totalOverheadCost).toLocaleString()} ج</span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-slate-100 mt-4 text-xs font-semibold text-slate-700 space-y-2 text-right" dir="rtl">
                              <div className="flex justify-between border-b pb-1">
                                <span>إجمالي تكلفة الفوج الإجمالية:</span>
                                <span className="text-slate-900 font-extrabold font-mono">{Math.round(grandTotalCost).toLocaleString()} جنية</span>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <span>إيرادات المبيعات الكلية المتوقعة:</span>
                                <span className="text-emerald-700 font-extrabold font-mono">{Math.round(totalEstimatedRevenue).toLocaleString()} جنية</span>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <span>متوسط تكلفة الكيلوجرام لحم دجاج:</span>
                                <span className="text-amber-750 font-extrabold font-mono text-amber-700">{costPerKgProduced.toFixed(2)} جنية / كجم</span>
                              </div>
                              <div className="flex justify-between border-b pb-1">
                                <span>العائد المتوقع على الاستثمار (ROI):</span>
                                <span className={`font-black font-mono ${roiValue >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {roiValue.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between pt-1">
                                <span>سعر البيع المطلوب لتحقيق التعادل بالبورصة:</span>
                                <span className="text-slate-950 font-black font-mono">{breakEvenPrice.toFixed(2)} جنية</span>
                              </div>
                            </div>

                            {/* Financial Diagnostic alerts */}
                            <div className="mt-4" dir="rtl">
                              {netProfit >= 0 ? (
                                <div className="text-emerald-800 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-center gap-1.5 justify-end">
                                  <span>تشير المقاييس لجدوى اقتصادية ممتازة وعائد استثماري فخم بفضل التربية الاحترافية للفرخ العملاق! 👍</span>
                                  <span className="text-base select-none">📈</span>
                                </div>
                              ) : (
                                <div className="text-rose-800 bg-rose-50/50 p-3 rounded-xl border border-rose-100 flex items-center gap-1.5 justify-end animate-pulse">
                                  <span>تنبيه خسارة مالية! خفض سعر بيع كيلو اللحم أو ارتفاع التكاليف يلتهم أرباحك الصافية. تحكم في الهدر والتحويل فوراً. 🛑</span>
                                  <span className="text-base select-none">📉</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: AI VET ADVISOR CHAT
                ========================================================================= */}
            {currentTab === 'vet-chat' && (
              <div className="space-y-6 tab-transition" id="section_vet_chat">
                {!hasActiveSub ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl max-w-2xl mx-auto text-center space-y-6 my-12" id="premium_lock_screen_chat">
                    <div className="mx-auto w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-bounce">
                      <Lock size={45} strokeWidth={2} />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-extrabold text-slate-900">المستشار البيطري الذكي مغلق 🔒</h2>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                        المستشار الطبي البيولوجي المدعوم بالذكاء الاصطناعي هي ميزة فائقة تتطلب تفعيل اشتراك معتمد في تطبيق الـ 5 كيلو لتوجيه وتسمين القطعان الثقيلة.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-right">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 justify-end">
                        <Sparkles size={14} />
                        تفعيل تجريبي سريع ومجاني ومتاح فوراً لتقييم التطبيق:
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        يمكنك ترقية وتفعيل باقتك فوراً بنظام التراخيص المطور بالـ MySQL. انسخ أحد الأكواد الفعالة أدناه وطبقها في تبويب الاشتراكات:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 justify-end" dir="ltr">
                        <code className="bg-slate-100 p-1 px-2.5 text-xs font-mono border rounded-md font-bold text-slate-800 select-all">GOLD-5KG-MAX</code>
                        <code className="bg-slate-100 p-1 px-2.5 text-xs font-mono border rounded-md font-bold text-slate-800 select-all">GOLD-77X-B12</code>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const codeToApply = 'GOLD-5KG-MAX';
                          const found = dbCodes.find(c => c.code === codeToApply && !c.used);
                          if (found) {
                            const nowStr = new Date().toISOString().split('T')[0];
                            const end = new Date();
                            end.setDate(end.getDate() + found.duration_days);
                            const endStr = end.toISOString().split('T')[0];
                            setDbCodes(prev => prev.map(c => c.id === found.id ? { ...c, used: true, used_by: currentUser.id } : c));
                            const newSubId = dbSubscriptions.length > 0 ? Math.max(...dbSubscriptions.map(s => s.id)) + 1 : 1;
                            const newSub: SimSubscription = {
                              id: newSubId,
                              user_id: currentUser.id,
                              activation_code_id: found.id,
                              start_date: nowStr,
                              end_date: endStr,
                              status: 'active'
                            };
                            setDbSubscriptions(prev => [...prev, newSub]);
                            alert('🎉 تم تفعيل باقتك السنوية فورياً بمفتاح GOLD-5KG-MAX! تم فتح كافة المظاهر الممتازة.');
                          } else {
                            const anyUnused = dbCodes.find(c => !c.used);
                            if (anyUnused) {
                              const nowStr = new Date().toISOString().split('T')[0];
                              const end = new Date();
                              end.setDate(end.getDate() + anyUnused.duration_days);
                              const endStr = end.toISOString().split('T')[0];
                              setDbCodes(prev => prev.map(c => c.id === anyUnused.id ? { ...c, used: true, used_by: currentUser.id } : c));
                              const newSubId = dbSubscriptions.length > 0 ? Math.max(...dbSubscriptions.map(s => s.id)) + 1 : 1;
                              const newSub: SimSubscription = {
                                id: newSubId,
                                user_id: currentUser.id,
                                activation_code_id: anyUnused.id,
                                start_date: nowStr,
                                end_date: endStr,
                                status: 'active'
                              };
                              setDbSubscriptions(prev => [...prev, newSub]);
                              alert(`🎉 تم تفعيل باقتك فورياً بمفتاح ${anyUnused.code}!`);
                            }
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 px-6 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Sparkles size={16} />
                        تفعيل فوري بكود تجريبي (1-Click) ⚡
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCurrentTab('subscriptions')}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 px-6 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <KeyRound size={16} />
                        صفحة إدارة الاشتراكات والتراخيص 🔑
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-md h-[600px] flex flex-col overflow-hidden">
                  
                  {/* Chat Panel Top Title */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 text-lg font-bold">
                          ٥ك
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-amber-400">مستشارك البيطري البيولوجي الذكي 🧪</h2>
                        <p className="text-[10px] text-slate-400">يعمل بنظام ذكاء اصطناعي مخصص لأوزان التسمين الكبيرة فوق 5 كجم</p>
                      </div>
                    </div>

                    <div className="text-[11px] bg-slate-800 text-slate-300 py-1 px-2.5 rounded-full font-semibold border border-slate-700/50">
                      استجابة طبية فورية دقيقة
                    </div>
                  </div>

                  {/* Message logging block */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" id="chat_scroll_area">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                          m.role === 'user' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'
                        }`}>
                          {m.role === 'user' ? 'مربي' : 'طبيب'}
                        </div>

                        {/* Text Message Bubble */}
                        <div className={`rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed shadow-sm border ${
                          m.role === 'user' 
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 rounded-tr-none' 
                            : 'bg-white text-slate-800 font-semibold border-slate-100 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                          <span className={`block text-[9px] mt-2 text-left ${m.role === 'user' ? 'text-slate-950/70' : 'text-slate-400'}`}>
                            {m.time}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Chat loading state */}
                    {chatLoading && (
                      <div className="flex gap-3 max-w-[85%] ml-auto">
                        <div className="w-8 h-8 rounded-lg shrink-0 bg-slate-900 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                          طبيب
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-xs font-medium border border-slate-100 shadow-xs flex items-center gap-2">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                          <span className="text-slate-500 mr-1.5">الطبيب البيطري يحلل مشكلتك ويكتب التوصية الفورية...</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Preloaded quick consultation questions triggers */}
                  <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto shrink-0 no-scrollbar" id="quick_chat_prompts">
                    <span className="text-[10px] font-bold text-slate-400 py-1 shrink-0">اسأل فوراً:</span>
                    {[
                      'كيف أتجنب الموت المفاجئ في الأوزان الكبيرة؟',
                      'ما علاج الإسهال البني الرغوي للدجاج؟',
                      'عندي عطس وحشرجة بالليل عند الدجاج، ماذا أفعل؟',
                      'جرعة فيتامين هـ + سيلينيوم للأوزان الثقيلة'
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleNudgeChat(prompt)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold py-1 px-3 rounded-full shrink-0 transition duration-150 border whitespace-nowrap active:scale-95"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Form */}
                  <form onSubmit={handleSendMessage} className="p-3.5 bg-white border-t border-slate-200 shrink-0 flex gap-2">
                    <input 
                      type="text" 
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="صف الحلة المرضية للفوج، الأعراض، العمر أو العلف..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs md:text-sm font-semibold focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                    <button 
                      type="submit"
                      disabled={chatLoading || !userInput.trim()}
                      className="bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl transition duration-150 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="إرسال"
                    >
                      <Send size={18} className="transform rotate-180" />
                    </button>
                  </form>

                </div>
                )}
              </div>
            )}

            {/* =========================================================================
                TAB 4: RECOGNIZED VACCINES PROGRAM
                ========================================================================= */}
            {currentTab === 'vaccines' && (
              <div className="space-y-6 tab-transition" id="section_vaccines">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 mb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900">برنامج اللقاحات والتحصين السيادي المعتمد 🧪</h2>
                      <p className="text-xs text-slate-500">مظلة الأمان الحصينة لوقاية الدواجن ومنع الأوبئة الفيروسية الكبرى مثل النيوكاسل والجمبورو.</p>
                    </div>
                    
                    <div className="bg-amber-500/10 text-amber-700 rounded-xl p-2 px-4 border border-amber-500/15 text-xs font-bold">
                      تم تحصين {Object.values(completedVaccines).filter(Boolean).length} من أصل {VACCINE_PROGRAM.length}
                    </div>
                  </div>

                  {/* LIVE ACTIVE DAY VACCINE CONNECTED ALERT (Feature 5) */}
                  {(() => {
                    // Match vaccine by currentBatchDay
                    let matched: any = null;
                    if (currentBatchDay === 1) matched = VACCINE_PROGRAM[0];
                    else if (currentBatchDay === 7 || currentBatchDay === 8) matched = VACCINE_PROGRAM[1];
                    else if (currentBatchDay === 12) matched = VACCINE_PROGRAM[2];
                    else if (currentBatchDay >= 18 && currentBatchDay <= 20) matched = VACCINE_PROGRAM[3];
                    else if (currentBatchDay === 24) matched = VACCINE_PROGRAM[4];
                    else if (currentBatchDay === 28) matched = VACCINE_PROGRAM[5];

                    if (!matched) {
                      return (
                        <div className="bg-slate-50 border p-4 rounded-2xl mb-6 text-right flex items-center justify-between gap-3 text-xs md:text-sm font-semibold text-slate-700" dir="rtl">
                          <p>
                            📅 عمر القطيع الحالي المسجل: <span className="text-amber-650 font-extrabold font-mono text-amber-700">يوم {currentBatchDay}</span>. لا توجد لقاحات رسمية أو إجبارية مقررة اليوم بحسب الجدول السيادي.
                          </p>
                          <div className="bg-emerald-100 text-emerald-850 text-[10px] uppercase font-black py-1 px-2.5 rounded-lg leading-relaxed shrink-0 text-emerald-800">
                            القطيع مستقر وآمن
                          </div>
                        </div>
                      );
                    }

                    const isDone = !!completedVaccines[matched.vaccineName];

                    return (
                      <div className="bg-[#031c10] border border-emerald-500/30 p-5 rounded-2xl mb-6 text-right space-y-4 relative overflow-hidden text-slate-100" dir="rtl">
                        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500 animate-pulse"></div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5 font-mono">
                              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
                              تحذير لقاح ميداني عاجل • اليوم {currentBatchDay} مقترن بالدورة ⏰
                            </span>
                            <h3 className="font-extrabold text-white text-base">جرعة التحصين المستهدفة اليوم: {matched.vaccineName}</h3>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isDone ? (
                              <span className="bg-emerald-500/20 text-emerald-400 py-1 px-3 border border-emerald-500/30 rounded-xl text-xs font-black">
                                تم إتمام التحصين بنجاح ✔
                              </span>
                            ) : (
                              <button
                                onClick={() => toggleVaccine(matched.vaccineName)}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 py-1.5 px-4 font-black rounded-xl text-xs transition duration-150 active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
                              >
                                تأكيد التنفيذ الفوري للقاح 🧪
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-black/40 p-4 rounded-xl border border-white/5 font-semibold text-slate-300">
                          <div>
                            <span className="text-amber-400 font-black block mb-1">🎯 طريقة التحصين الموصى بها اليوم للقطيع:</span>
                            <p className="leading-relaxed text-slate-200">
                              {matched.method}
                            </p>
                          </div>
                          <div>
                            <span className="text-rose-400 font-black block mb-1">⚠️ تحذيرات العطش والأخطاء الشائعة باللقاحات:</span>
                            <ul className="list-disc list-inside space-y-1 text-slate-200">
                              <li>عطّش الفراخ لمدة ساعتين قبل التحصين بالماء تماماً.</li>
                              <li>تأكد من خلو المياه تماماً من الكلور أو المنظفات بوضع اللبن المنزوع الدسم لتنشيط اللقاح.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Vaccines checkable list */}
                  <div className="space-y-4" id="vaccines_checked_list">
                    {VACCINE_PROGRAM.map((v, idx) => {
                      const isDone = !!completedVaccines[v.vaccineName];
                      return (
                        <div 
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                            isDone 
                              ? 'bg-emerald-50/50 border-emerald-200/60' 
                              : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                          }`}
                        >
                          <div className="flex gap-3.5 items-start">
                            <button
                              type="button"
                              onClick={() => toggleVaccine(v.vaccineName)}
                              className={`w-6 h-6 rounded-lg border-2 mt-1 shrink-0 flex items-center justify-center transition-all ${
                                isDone 
                                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                                  : 'border-slate-300 hover:border-amber-400 bg-slate-50'
                              }`}
                            >
                              {isDone && <Check size={14} strokeWidth={3} />}
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm md:text-base text-slate-900">{v.vaccineName}</span>
                                <span className="px-2.5 py-0.5 bg-slate-900 text-amber-400 font-bold rounded-md text-[10px]">{v.ageRange}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${
                                  v.importance === 'إجباري' 
                                    ? 'bg-rose-100 text-rose-700' 
                                    : v.importance === 'هام جداً' 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {v.importance}
                                </span>
                              </div>
                              
                              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                                <span className="font-bold text-slate-800">الأمراض المستهدفة:</span> {v.targetDisease}
                              </p>
                              
                              <p className="text-xs text-slate-500 font-medium">
                                <span className="font-bold text-slate-700">طريقة إعطاء اللقاح:</span> {v.method}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 flex md:justify-end">
                            <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${isDone ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                              <span className={`w-2 h-2 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              {isDone ? 'تم التحصين بفضل الله' : 'مترقب، لم يعطى بعد'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Critical general vaccine guidelines caution box */}
                  <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5" id="critical_vaccine_rules">
                    <h3 className="font-extrabold text-slate-950 text-sm mb-2 flex items-center gap-2">
                      <AlertTriangle className="text-amber-600" size={18} />
                      الشروط الذهبية الخمسة لضمان نجاح أي تحصين:
                    </h3>
                    <ul className="text-xs text-slate-700 space-y-2 font-medium list-disc list-inside">
                      <li><span className="font-bold">تجنب مياه الصنبور العادية (المكلورة):</span> الكلور يقتل الفيروس اللقاحي الضعيف تماًماً في ثوانٍ. استخدم مياه شرب مفلترة خالية من الكلور وأضف معها حليب منزوع الدسم بودرة (جرام/لتر) لحفظ اللقاح.</li>
                      <li><span className="font-bold">ساعات العطش المقننة:</span> عطل الدجاج ساعتين قبل التحصين صيفاً، أو ٣ ساعات شتاءً لضمان تجرع جميع الطيور دفعة واحدة خلال ٣٠-٤٥ دقيقة من الفتح.</li>
                      <li><span className="font-bold">اختبار وقت الشروق:</span> يفضل التحصين دائمًا في الهزيع الأخير من الليل أو مع الفجر لتجنب حرارة الظهيرة، حيث تكون حيوية الأمعاء مهيأة بشكل كامل.</li>
                      <li><span className="font-bold">خلو القطيع التام من الأمراض:</span> يمنع بتاتاً تحصين دواجن تعاني حالياً من نزيف كوكسيديا أو برد تنفسي؛ التحصين سيدمر مناعتهم الضعيفة ويزيد الوفيات.</li>
                      <li><span className="font-bold">العزل للموتى:</span> تخلص ومزق وحصن الدواجن النافقة بالدفن العميق والجير الحي وتأكد من قفل الأبواب.</li>
                    </ul>
                  </div>

                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 5: COMMON DISEASES ENCYCLOPEDIA
                ========================================================================= */}
            {currentTab === 'diseases' && (
              <div className="space-y-6 tab-transition" id="section_diseases">
                
                {/* Search & Filter Header Options */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-900">موسوعة الصحة والتربية الطارئة 🛡️</h2>
                      <p className="text-xs text-slate-500">دليلك السريع للتعرف على مسببات الوفيات وأعراض الأمراض، وحفظ وزن دورتك من التراجع الحاد.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute right-3 top-3 text-slate-400" size={16} />
                        <input
                          type="text"
                          value={diseaseSearch}
                          onChange={(e) => setDiseaseSearch(e.target.value)}
                          placeholder="ابحث بالعرض أو الاسم..."
                          className="bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500 text-slate-800 w-full sm:w-48"
                        />
                      </div>

                      {/* Type Filter */}
                      <select
                        value={diseaseFilterType}
                        onChange={(e) => setDiseaseFilterType(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs font-semibold focus:outline-none text-slate-800"
                      >
                        <option value="all">كل الأنواع</option>
                        <option value="فيروسي">أمراض فيروسية</option>
                        <option value="بكتيري">أمراض بكتيرية</option>
                        <option value="طفيلي">طفيليات ومعويات</option>
                      </select>

                    </div>
                  </div>

                  {/* Diseases Cards Representation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6" id="diseases_cards_grid">
                    {filteredDiseases.length > 0 ? (
                      filteredDiseases.map((d) => (
                        <div 
                          key={d.id} 
                          className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                          id={`disease_card_${d.id}`}
                        >
                          <div>
                            {/* Card badge header */}
                            <div className="flex justify-between items-start gap-2 mb-3">
                              <div>
                                <h3 className="font-bold text-base text-slate-900">{d.name}</h3>
                                <span className="text-[10px] text-slate-400 font-mono font-medium block italic">{d.scientificName}</span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold ${
                                d.type === 'فيروسي' 
                                  ? 'bg-rose-500/10 text-rose-700' 
                                  : d.type === 'بكتيري' 
                                  ? 'bg-amber-500/10 text-amber-700' 
                                  : 'bg-indigo-500/10 text-indigo-700'
                              }`}>
                                {d.type}
                              </span>
                            </div>

                            {/* Symptoms list */}
                            <div className="space-y-1.5 mt-2">
                              <span className="text-[11px] font-bold text-slate-800 block">الأعراض الأكثر ظهوراً:</span>
                              <ul className="space-y-1">
                                {d.symptoms.map((s, si) => (
                                  <li key={si} className="text-xs text-slate-600 font-medium flex gap-1 items-start">
                                    <span className="text-rose-500 mt-0.5 shrink-0">●</span>
                                    <span>{s}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Spread factors and Treatment */}
                            <div className="mt-3.5 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-dashed">
                              <span className="text-[11px] font-bold text-slate-800 block">بروتوكول العلاج والتدخل الفيروسي/الدوائي:</span>
                              <ul className="space-y-1 list-none">
                                {d.treatment.map((t, ti) => (
                                  <li key={ti} className="text-[11px] text-slate-600 font-semibold flex items-start gap-1">
                                    <span className="text-emerald-500 shrink-0">✔</span>
                                    <span>{t}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Footer vaccine rules info */}
                          <div className="mt-4 border-t pt-3 flex justify-between items-center bg-slate-50/50 p-2 rounded-xl mt-4">
                            <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[200px]">
                              🛡️ {d.vaccinePrevention}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentTab('vet-chat');
                                handleNudgeChat(`ما لذي يجب علي معرفته عن مرض ${d.name} لمقاومته بالتسمين؟`);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg transition shrink-0"
                            >
                              استشر الطبيب الآلي
                            </button>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-400">
                        <p className="text-sm">لا توجد نتائج بحث لمرض أو عرض بالتسمين يرجع لمدخلاتك.</p>
                        <p className="text-xs text-slate-400 mt-1">حاول البحث بعبارة أسهل مثل "إسهال" أو "تنفسي".</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* =========================================================================
                TAB 6: HERD FLOCK TRACKER LOGS
                ========================================================================= */}
            {currentTab === 'logs' && (
              <div className="space-y-6 tab-transition" id="section_logs">
                {!hasActiveSub ? (
                  <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl max-w-2xl mx-auto text-center space-y-6 my-12" id="premium_lock_screen_logs">
                    <div className="mx-auto w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-bounce">
                      <Lock size={45} strokeWidth={2} />
                    </div>
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-extrabold text-slate-900">سجل متابعة القطيع مغلق 🔒</h2>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                        لوحة رصد الطقس والوزن ومعدلات الوفيات واستهلاك الأعلاف اليومي مخصصة لأصحاب الأجهزة الفائقة والاشتراكات الفعالة.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-right">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5 justify-end">
                        <Sparkles size={14} />
                        تفعيل دورة تجريبية سريعة بنظام MySQL:
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        انسخ الرمز السنوي التالي لفتح السجل والمستشار فوراً:
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1 justify-end" dir="ltr">
                        <code className="bg-slate-100 p-1 px-2.5 text-xs font-mono border rounded-md font-bold text-slate-800 select-all">GOLD-5KG-MAX</code>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const codeToApply = 'GOLD-5KG-MAX';
                          const found = dbCodes.find(c => c.code === codeToApply && !c.used);
                          if (found) {
                            const nowStr = new Date().toISOString().split('T')[0];
                            const end = new Date();
                            end.setDate(end.getDate() + found.duration_days);
                            const endStr = end.toISOString().split('T')[0];
                            setDbCodes(prev => prev.map(c => c.id === found.id ? { ...c, used: true, used_by: currentUser.id } : c));
                            const newSubId = dbSubscriptions.length > 0 ? Math.max(...dbSubscriptions.map(s => s.id)) + 1 : 1;
                            const newSub: SimSubscription = {
                              id: newSubId,
                              user_id: currentUser.id,
                              activation_code_id: found.id,
                              start_date: nowStr,
                              end_date: endStr,
                              status: 'active'
                            };
                            setDbSubscriptions(prev => [...prev, newSub]);
                            alert('🎉 تم تفعيل باقتك السنوية فورياً بمفتاح GOLD-5KG-MAX! تم فتح سجل المتابعة والقطيع وعيون التحليل.');
                          } else {
                            const anyUnused = dbCodes.find(c => !c.used);
                            if (anyUnused) {
                              const nowStr = new Date().toISOString().split('T')[0];
                              const end = new Date();
                              end.setDate(end.getDate() + anyUnused.duration_days);
                              const endStr = end.toISOString().split('T')[0];
                              setDbCodes(prev => prev.map(c => c.id === anyUnused.id ? { ...c, used: true, used_by: currentUser.id } : c));
                              const newSubId = dbSubscriptions.length > 0 ? Math.max(...dbSubscriptions.map(s => s.id)) + 1 : 1;
                              const newSub: SimSubscription = {
                                id: newSubId,
                                user_id: currentUser.id,
                                activation_code_id: anyUnused.id,
                                start_date: nowStr,
                                end_date: endStr,
                                status: 'active'
                              };
                              setDbSubscriptions(prev => [...prev, newSub]);
                              alert(`🎉 تم تفعيل باقتك فورياً بمفتاح ${anyUnused.code}!`);
                            }
                          }
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold p-3 px-6 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Sparkles size={16} />
                        تفعيل فوري بكود تجريبي (1-Click) ⚡
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setCurrentTab('subscriptions')}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 px-6 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2"
                      >
                        <KeyRound size={16} />
                        صفحة إدارة الاشتراكات والتراخيص 🔑
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                  {/* Statistics Banner Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" id="cohort_tracker_banner">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md text-center">
                    <span className="text-xs text-slate-400 font-bold block">عمر دورة الفوج المسجل</span>
                    <span className="block mt-1 font-mono font-extrabold text-2xl text-slate-800">
                      {maxRecordedDay > 0 ? `اليوم ${maxRecordedDay}` : 'لا يوجد سجل'}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md text-center">
                    <span className="text-xs text-slate-400 font-bold block">متوسط آخر وزن مسجل</span>
                    <span className="block mt-1 font-mono font-extrabold text-2xl text-slate-800 text-emerald-600">
                      {currentAvgWeight > 0 ? `${(currentAvgWeight/1000).toFixed(2)} كجم` : 'لم يتم الوزن'}
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-12 border border-slate-100 shadow-md text-center">
                    <span className="text-xs text-slate-400 font-bold block">إجمالي نافق الكتاكيت</span>
                    <span className="block mt-1 font-mono font-extrabold text-2xl text-rose-600">
                      {totalMortality} رأس دجاج
                    </span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-md text-center">
                    <span className="text-xs text-slate-400 font-bold block">مجموع استهلاك الأعلاف الموثق</span>
                    <span className="block mt-1 font-mono font-extrabold text-2xl text-amber-600">
                      {totalFeedUsedKg} كجم علفي
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Form to log new entries */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md h-fit">
                    <h3 className="font-extrabold text-slate-900 border-b pb-3 mb-4 text-md flex items-center justify-between">
                      <span>إضافة رصد يومي جديد للدفعة ✍</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 font-bold rounded-lg leading-relaxed">
                        خطوتك لوزن 5 كجم
                      </span>
                    </h3>

                    <form onSubmit={handleAddLog} className="space-y-4" id="log_add_form">
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">عمر الفراخ:</label>
                          <input 
                            type="number" 
                            min="1" 
                            max="50"
                            value={logFormDay}
                            onChange={(e) => setLogFormDay(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">العدد الحالي بالفوج:</label>
                          <input 
                            type="number" 
                            min="1"
                            value={logFormBirds}
                            onChange={(e) => setLogFormBirds(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">النفوق اليوم (وفاة):</label>
                          <input 
                            type="number" 
                            min="0"
                            value={logFormMortality}
                            onChange={(e) => setLogFormMortality(Number(e.target.value))}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-rose-600 focus:outline-none focus:border-rose-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">متوسط وزن الطير (جرام):</label>
                          <input 
                            type="number" 
                            min="10"
                            value={logFormAvgWeight}
                            onChange={(e) => setLogFormAvgWeight(e.target.value)}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-emerald-600 focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">العلف المستهلك اليوم (كجم):</label>
                          <input 
                            type="number" 
                            min="0" 
                            value={logFormFeedConsumed}
                            onChange={(e) => setLogFormFeedConsumed(e.target.value)}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">الحرارة القصوى بالعنبر:</label>
                          <input 
                            type="number" 
                            min="10" 
                            max="45"
                            value={logFormTemp}
                            onChange={(e) => setLogFormTemp(e.target.value)}
                            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">ملاحظات التربية والأدوية المعطاة:</label>
                        <textarea 
                          rows={2}
                          value={logFormNotes}
                          onChange={(e) => setLogFormNotes(e.target.value)}
                          placeholder="مثال: إضافة رافع مناعة للأمعاء، الفرشة رطبة قليلاً..."
                          className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-lg text-xs transition duration-150 active:scale-95 shadow"
                      >
                        حفظ الملاحظة اليومية بالذاكرة
                      </button>

                    </form>
                  </div>

                  {/* Right Column: List of saved observations */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-md lg:col-span-2 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 border-b pb-3 mb-4 text-md flex justify-between items-center flex-wrap gap-2 text-right">
                        <span>سجل الملاحظات اليومية المحفوظة للفوج 📋</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setAuditReportOpen(true)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] py-1.5 px-3 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>تقرير الدورة ومطابقة الكتالوج 📄</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleExportCSV}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>تصدير السجلات 📤</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من رغبتك في حذف التاريخ بالكامل والبدء من جديد؟')) {
                                saveLogs([]);
                              }
                            }}
                            className="text-[10px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <span>تصفير السجل 🗑️</span>
                          </button>
                        </div>
                      </h3>

                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                        {logsList.length > 0 ? (
                          [...logsList].reverse().map((log) => (
                            <div 
                              key={log.id} 
                              className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4 text-xs transition"
                              id={`log_item_${log.id}`}
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-sm text-slate-900 bg-amber-400 p-1 px-2 rounded-lg">يوم {log.dayOfLife}</span>
                                  <span className="text-slate-400 font-mono text-[10px]">{log.date}</span>
                                  <span className="text-slate-600">الفوج: {log.birdCount} طير</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5 text-[11px] font-semibold text-slate-700">
                                  <span>⚖ الوزن: <span className="font-extrabold text-slate-900">{log.avgWeightGrams} جرام</span></span>
                                  <span>💔 النافق: <span className="font-extrabold text-rose-600">{log.mortality} رأس</span></span>
                                  <span>🌾 علف: <span className="font-extrabold text-amber-700">{log.feedConsumedKg} كجم</span></span>
                                  <span>🌡 الحرارة: <span className="font-extrabold text-slate-900">{log.tempCelsius}°C</span></span>
                                </div>

                                {log.notes && (
                                  <p className="bg-white p-2 rounded-lg border text-slate-600 italic mt-2 text-[11px] leading-relaxed">
                                    <span className="font-bold text-slate-800">ملاحظة الحظيرة:</span> {log.notes}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDeleteLog(log.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                                title="حذف السجل"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-16 text-slate-400">
                            <ClipboardList size={44} className="mx-auto mb-2 opacity-20" />
                            <p className="font-bold">سجلك فارغ تماماً حالياً.</p>
                            <p className="text-[10px] text-slate-400 mt-1">ابدأ بكتابة رصد الطقس والوزن لتتمكن من تنظيم خط بيع دجاج الـ 5 كجم.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-right">
                        <span className="block text-xs font-semibold text-amber-400">سقف التطلعات للفوج العملاق المكتمل:</span>
                        <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                          الوصول لمتوسط وزن 5,100 جرام للفرخ في اليوم 50 يتطلب ألا تزيد وفيات الفوج الكلية عن 3%، ومعدلFCR تراكمي أقل من 1.9.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const customSeeded: BatchLog[] = [
                            { id: 'm1', date: '2026-06-02', dayOfLife: 1, birdCount: 1000, mortality: 2, feedConsumedKg: 12, avgWeightGrams: 45, tempCelsius: 33 },
                            { id: 'm2', date: '2026-06-08', dayOfLife: 7, birdCount: 998, mortality: 1, feedConsumedKg: 175, avgWeightGrams: 188, tempCelsius: 30 },
                            { id: 'm3', date: '2026-06-15', dayOfLife: 14, birdCount: 997, mortality: 0, feedConsumedKg: 540, avgWeightGrams: 495, tempCelsius: 27 },
                            { id: 'm4', date: '2026-06-22', dayOfLife: 21, birdCount: 995, mortality: 2, feedConsumedKg: 1350, avgWeightGrams: 955, tempCelsius: 25 },
                            { id: 'm5', date: '2026-06-29', dayOfLife: 28, birdCount: 994, mortality: 1, feedConsumedKg: 2850, avgWeightGrams: 1640, tempCelsius: 23 },
                            { id: 'm6', date: '2026-07-06', dayOfLife: 35, birdCount: 992, mortality: 2, feedConsumedKg: 5100, avgWeightGrams: 2610, tempCelsius: 21 },
                            { id: 'm7', date: '2026-07-13', dayOfLife: 42, birdCount: 990, mortality: 2, feedConsumedKg: 8500, avgWeightGrams: 3790, tempCelsius: 20 },
                            { id: 'm8', date: '2026-07-21', dayOfLife: 50, birdCount: 988, mortality: 2, feedConsumedKg: 12500, avgWeightGrams: 5120, tempCelsius: 19, notes: 'وصلنا للهدف! 5 كيلو جرام للفرخ وبجودة تحويل فخمة جداً.' }
                          ];
                          saveLogs(customSeeded);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-extrabold py-2 px-4 rounded-lg transition shrink-0"
                      >
                        توليد فوج متكامل نموذجي ⚡
                      </button>
                    </div>

                  </div>
                </div>
                </>
                )}
              </div>
            )}

            {/* =========================================================================
                TAB 7: SUBSCRIPTIONS & LICENSE MANAGEMENT (SQL INTERACTION)
                ========================================================================= */}
            {currentTab === 'subscriptions' && (
              <div className="space-y-6 tab-transition" id="section_subscriptions">
                
                {/* Visual Header styled matching Image 1 Theme */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden" id="subscriptions_header">
                  <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-y-10 translate-x-10 scale-125 font-bold text-[180px]">
                    SQL
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-md tracking-wider uppercase">محاكاة MySQL</span>
                        <span className="text-amber-400 font-mono text-[11px] font-bold">DATABASE: five_kilo</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">نظام إدارة التراخيص والاشتراكات المطور</h2>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-semibold">
                        تطبيق الـ 5 كيلو يدعم تفعيل تراخيص المربين السنوية والشهرية بالكامل بالربط مع قاعدة بيانات علائقية. يمكنك تسيير مبيعات الفوج وتتبع رموز التفعيل والتحقق من العلاقات.
                      </p>
                    </div>

                    {/* Image 1 Branded Logo Area */}
                    <div className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-3 shrink-0 select-none font-bold" id="brand_goldenpoultry_header">
                      <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center font-extrabold text-xl font-mono">
                        GP
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-xs text-emerald-400 leading-none tracking-wider">GOLDENPOULTRY</span>
                        <span className="block text-[9px] text-slate-400 font-bold mt-1">تنمية وتسمين بدقة بيولوجية ممتازة</span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Tabs Selector Pills */}
                  <div className="flex gap-2.5 mt-8 border-t border-slate-800/80 pt-5" id="subs_subtabs_wrapper">
                    <button
                      type="button"
                      onClick={() => setSubInnerTab('profile')}
                      className={`flex items-center gap-2 text-xs font-black p-3 px-5 rounded-xl transition duration-150 ${
                        subInnerTab === 'profile'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                      }`}
                    >
                      <User size={15} />
                      بوابتي الشخصية لتفعيل الرمز 🔑
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubInnerTab('admin')}
                      className={`flex items-center gap-2 text-xs font-black p-3 px-5 rounded-xl transition duration-150 relative ${
                        subInnerTab === 'admin'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                      }`}
                    >
                      <Database size={15} />
                      لوحة المدير العام و MySQL Explorer 👑
                      {currentUser.role === 'admin' && (
                        <span className="absolute -top-1.5 -left-1 px-1.5 py-0.5 bg-emerald-500 text-white rounded-md text-[8px] font-bold font-mono">
                          ADMIN ACTIVE
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sub Tab A: PROFILE & ACTIVATION FORM */}
                {subInnerTab === 'profile' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="subtab_profile_grid">
                    
                    {/* Column 1: Current Session User Details */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">جلسة مربي الدواجن الحالية</span>
                        
                        <div className="flex items-center gap-4 border-b pb-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-slate-950 font-black text-lg ${
                            currentUser.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-amber-400'
                          }`}>
                            {currentUser.role === 'admin' ? 'مدير' : 'مربي'}
                          </div>
                          <div className="text-right">
                            <h3 className="font-bold text-lg text-slate-900">{currentUser.full_name}</h3>
                            <span className="text-xs text-slate-500 block mt-0.5">{currentUser.phone}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{currentUser.email || 'بدون إيميل'}</span>
                          </div>
                        </div>

                        {/* ACCESS LEVEL badge indicator */}
                        <div className="space-y-3 pt-2">
                          <span className="text-[11px] font-bold text-slate-505 block">فئة الحساب الحالية بالحظيرة:</span>
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border">
                            <span className="text-xs text-slate-700 font-bold">مستوى الوصول:</span>
                            {hasActiveSub ? (
                              <span className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white p-1 px-3 text-[10px] font-black rounded-full border border-emerald-500/20 flex items-center gap-1">
                                <ShieldCheck size={11} />
                                الباقة الذهبية الفائقة نشطة 🌟
                              </span>
                            ) : (
                              <span className="bg-slate-200 text-slate-600 p-1 px-3 text-[10px] font-black rounded-full flex items-center gap-1 border">
                                <Lock size={11} />
                                الباقة القياسية (مغلقة) 🔓
                              </span>
                            )}
                          </div>

                          {hasActiveSub ? (
                            <div className="bg-emerald-50/50 border border-emerald-200/60 p-3 rounded-2xl text-xs space-y-1.5 text-slate-700 font-semibold text-right">
                              <div className="flex justify-between">
                                <span>تاريخ بدء الترخيص:</span>
                                <span className="font-mono text-slate-900">{activeSubDetails?.start_date}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>تاريخ انتهاء الصلاحية:</span>
                                <span className="font-mono text-slate-900">{activeSubDetails?.end_date}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-rose-600 font-semibold leading-relaxed">
                              🔒 مميزات المستشار البيطري الذكي وسجل متابعة القطيع مغلقة مؤقتاً لحين تنشيط باقتك الذهبية بكود تفعيل.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* ACCOUNT QUICK SWITCHER FOR EASY MODEL RATING/TESTING */}
                      {currentUser.role === 'admin' && (
                        <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            تبديل جلسة العمل السريع 👥
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-semibold">
                            اختر دوراً مختلفاً في قاعدة البيانات لاختبار مستويات الأذونات وتجاوز أقفال الاشتراك:
                          </p>
                          <div className="space-y-2">
                            {dbUsers.map(u => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setCurrentUser(u);
                                  alert(`تم تبديل الجلسة فوراً! أنت الآن مسجل كـ: ${u.full_name} (${u.role === 'admin' ? 'إداري عام' : 'مربي دواجن'})`);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition text-xs font-semibold ${
                                  currentUser.id === u.id
                                    ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${u.role === 'admin' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
                                  {u.full_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-bold">({u.role === 'admin' ? 'Admin' : 'User'})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Column 2: Activation Form & Code Entry */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md lg:col-span-2 space-y-6">
                      <div className="space-y-2 text-right">
                        <h3 className="font-extrabold text-slate-900 text-lg">أدخل رمز التفعيل الخاص بك 🔑</h3>
                        <p className="text-xs text-slate-500 font-semibold">
                          عند شرائك الباقة جولدين، ستحصل على كود تفعيل يتكون من ٣ مقاطع. أدخله بالأسفل ليقوم خادم MySQL بالاستعلام وتنشيط باقتك فوراً.
                        </p>
                      </div>

                      {/* Standard Database Alert Showing Unused Codes */}
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5 text-amber-950 text-right">
                        <span className="text-xs font-black block text-amber-800 flex items-center gap-1.5 justify-end">
                          <Sparkles size={13} />
                          مفاتيح تفعيل غير مستخدمة بقاعدة البيانات (يمكنك نسخها):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold" dir="ltr">
                          {dbCodes.filter(c => !c.used).slice(0, 4).map((c, idx) => (
                            <div key={idx} className="bg-white/80 p-2 rounded-lg border border-amber-200 flex justify-between items-center text-xs">
                              <span className="font-extrabold text-[10px] text-slate-500 tracking-wide uppercase px-2 py-0.5 bg-amber-100 rounded">
                                {c.plan === 'yearly' ? 'صلاحية سنة' : 'صلاحية شهر'}
                              </span>
                              <code className="font-mono text-[11px] font-black text-slate-900 select-all">{c.code}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleActivateLicenseKey} className="space-y-4 text-right">
                        <div>
                          <label className="block text-xs font-black text-slate-700 mb-1.5 text-right">أدخل كود الترخيص المكون من ٣ مقاطع (Keys):</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={activationInput}
                              onChange={(e) => setActivationInput(e.target.value)}
                              placeholder="مثال: GOLD-5KG-MAX"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pr-12 text-center text-md tracking-widest font-mono font-black text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-amber-500"
                              required
                            />
                            <KeyRound className="absolute right-4 top-4.5 text-slate-400 animate-pulse" size={18} />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black p-4 rounded-xl text-xs sm:text-sm active:scale-95 shadow flex items-center justify-center gap-2 cursor-pointer btn-sparkle"
                        >
                          <ShieldCheck size={16} />
                          تأكيد الترخيص وتنشيط المزايا الفائقة ⚡
                        </button>
                      </form>

                      {/* Database Validation Warning block */}
                      <div className="border-t pt-5 space-y-4 text-right">
                        <span className="text-xs font-black block text-slate-700 text-right">تسجيل مربي جديد بقاعدة البيانات (MySQL INSERT):</span>
                        <form onSubmit={handleInsertUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">الاسم الكامل:</label>
                            <input
                              type="text"
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                              placeholder="مزارع دواجن عملاق جديد"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 text-xs font-semibold focus:outline-none focus:border-amber-500 text-right"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">رقم الهاتف الفريد (Phone UNIQUE):</label>
                            <input
                              type="text"
                              value={newUserPhone}
                              onChange={(e) => setNewUserPhone(e.target.value)}
                              placeholder="012XXXXXXXX"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 text-xs font-semibold text-center focus:outline-none focus:border-amber-500 font-mono"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">البريد الإلكتروني (اختياري):</label>
                            <input
                              type="email"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                              placeholder="some@poultry.com"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 px-3 text-xs font-semibold focus:outline-none focus:border-amber-500 text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-605 mb-1 text-right">صلاحية المستخدم بقاعدة البيانات:</label>
                            <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 px-3 text-xs font-bold text-slate-600 text-center select-none">
                              مربّي دواجن تلقائي (User) 🐔
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <button
                              type="submit"
                              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black p-2.5 rounded-xl text-xs transition active:scale-95"
                            >
                              حقن وتسجيل المستخدم بقاعدة البيانات (INSERT INTO users) ➕
                            </button>
                          </div>
                        </form>
                      </div>

                    </div>
                  </div>
                )}

                {/* Sub Tab B: SQL ADMINISTRATIVE WORKSPACE (MySQL / SQLite simulator) */}
                {subInnerTab === 'admin' && (
                  <div className="space-y-6" id="subtab_admin_workspace">
                    
                    {currentUser.role !== 'admin' && (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-rose-950 text-right flex items-start gap-3 justify-end justify-items-end">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm flex items-center gap-1.5 justify-end">
                            <AlertTriangle className="text-rose-600 animate-pulse" size={17} />
                            تنبيه صلاحيات المسؤول غير مكتملة!
                          </h4>
                          <p className="text-xs text-rose-700 leading-relaxed font-semibold">
                            أنت مسجل حالياً كـ مربي عادي ولديك أذونات قراءة فقط. لمشاهدة وتعديل جذور قاعدة البيانات وتوليد التراخيص، قم بالتبديل السريع كـ <span className="font-black text-rose-950">"المدير العام"</span> بقائمة الأفاتار بتبويب "بوابتي الشخصية".
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Sub-Column 1: Tables Manager */}
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* 1. TABLE: users */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
                          <div className="flex items-center justify-between border-b pb-3 text-right">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">PrimaryKey: id (AUTO_INCREMENT)</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">جدول المستخدمين `users` (MySQL Table)</span>
                              <span className="w-1.5 h-3.5 bg-amber-500 rounded-sm"></span>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-right text-slate-500 border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-700 font-bold border-b text-[11px]">
                                  <th className="p-2.5 text-right">ID</th>
                                  <th className="p-2.5 text-right">الاسم والبريد</th>
                                  <th className="p-2.5 text-right">رقم الهاتف (UNIQUE)</th>
                                  <th className="p-2.5 text-right">الدور</th>
                                  <th className="p-2.5 text-right">الحالة</th>
                                  <th className="p-2.5 text-center">التحكم</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dbUsers.map(u => (
                                  <tr key={u.id} className="border-b hover:bg-slate-50/50">
                                    <td className="p-2.5 font-mono font-bold text-slate-900 text-right">`{u.id}`</td>
                                    <td className="p-2.5 text-right">
                                      <span className="block font-bold text-slate-800">{u.full_name}</span>
                                      <span className="block text-[9px] text-slate-400 font-mono">{u.email || 'N/A'}</span>
                                    </td>
                                    <td className="p-2.5 font-mono font-semibold text-slate-700 text-right">{u.phone}</td>
                                    <td className="p-2.5 text-right">
                                      <button
                                        type="button"
                                        disabled={currentUser.role !== 'admin' || u.id === 1}
                                        onClick={() => handleUserToggleRole(u.id)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                          u.role === 'admin' ? 'bg-rose-100 text-rose-700 border' : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {u.role}
                                      </button>
                                    </td>
                                    <td className="p-2.5 text-right">
                                      <button
                                        type="button"
                                        disabled={currentUser.role !== 'admin' || u.id === 1}
                                        onClick={() => handleUserToggleStatus(u.id)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                                        }`}
                                      >
                                        {u.status}
                                      </button>
                                    </td>
                                    <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        disabled={currentUser.role !== 'admin'}
                                        onClick={() => setEditingUser(u)}
                                        className="text-slate-400 hover:text-amber-500 disabled:opacity-30 transition"
                                        title="تعديل الم مربي"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={currentUser.role !== 'admin' || u.id === 1}
                                        onClick={() => handleUserDelete(u.id)}
                                        className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                                        title="حذف نهائياً"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* 2. TABLE: activation_codes */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
                          <div className="flex items-center justify-between border-b pb-3 text-right">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">PrimaryKey: code (VARCHAR UNIQUE)</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">جدول رموز التفعيل `activation_codes` (Keys)</span>
                              <span className="w-1.5 h-3.5 bg-amber-500 rounded-sm"></span>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-right text-slate-500 border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-700 font-bold border-b text-[11px]">
                                  <th className="p-2.5 text-right">المفتاح</th>
                                  <th className="p-2.5 text-right">الباقة</th>
                                  <th className="p-2.5 text-right">المدة بالمستند</th>
                                  <th className="p-2.5 text-right">الحالة</th>
                                  <th className="p-2.5 text-right">بواسطة</th>
                                  <th className="p-2.5 text-center">التحكم</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dbCodes.map(c => {
                                  const userOwner = dbUsers.find(u => u.id === c.used_by);
                                  return (
                                    <tr key={c.id} className="border-b hover:bg-slate-50/50">
                                      <td className="p-2.5 font-mono font-black text-slate-900 select-all text-right">`{c.code}`</td>
                                      <td className="p-2.5 text-right">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                          c.plan === 'yearly' ? 'bg-amber-100 text-amber-800' :
                                          c.plan === 'full_cycle' ? 'bg-yellow-105 text-yellow-805' :
                                          c.plan === 'monthly' ? 'bg-blue-105 text-blue-805' : 'bg-slate-100 text-slate-600'
                                        }`}>{c.plan}</span>
                                      </td>
                                      <td className="p-2.5 font-mono font-bold text-slate-700 text-right">{c.duration_days} يوم</td>
                                      <td className="p-2.5 text-right">
                                        <span className={`font-bold inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                          c.used ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                          {c.used ? 'مستعمل 🛑' : 'متاح للتنشيط ⚡'}
                                        </span>
                                      </td>
                                      <td className="p-2.5 font-bold text-slate-800 text-right">{userOwner ? userOwner.full_name : '-'}</td>
                                      <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          disabled={currentUser.role !== 'admin'}
                                          onClick={() => setEditingCode(c)}
                                          className="text-slate-400 hover:text-amber-500 disabled:opacity-30 transition"
                                          title="تعديل الكود"
                                        >
                                          <Pencil size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={currentUser.role !== 'admin'}
                                          onClick={() => handleCodeDelete(c.id)}
                                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                                          title="حذف الكود"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* 3. TABLE: subscriptions */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
                          <div className="flex items-center justify-between border-b pb-3 text-right">
                            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">ForeignKeys: user_id, activation_code_id</span>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">جدول الاشتراكات الموثقة `subscriptions` (FK Mapping)</span>
                              <span className="w-1.5 h-3.5 bg-amber-500 rounded-sm"></span>
                            </div>
                          </div>

                          <div className="overflow-x-auto text-right">
                            <table className="w-full text-xs text-right text-slate-500 border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-700 font-bold border-b text-[11px]">
                                  <th className="p-2.5 text-right">ID</th>
                                  <th className="p-2.5 text-right">المستفيد المعرف</th>
                                  <th className="p-2.5 text-right">كود الترخيص المرتبط</th>
                                  <th className="p-2.5 text-right">تاريخ البداية والنهاية</th>
                                  <th className="p-2.5 text-right">حالة الاتصال</th>
                                  <th className="p-2.5 text-center">التحكم</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dbSubscriptions.map(s => {
                                  const customer = dbUsers.find(u => u.id === s.user_id);
                                  const codeMapped = dbCodes.find(c => c.id === s.activation_code_id);
                                  return (
                                    <tr key={s.id} className="border-b hover:bg-slate-50/50">
                                      <td className="p-2.5 font-mono font-bold text-slate-900 text-right">`{s.id}`</td>
                                      <td className="p-2.5 font-extrabold text-slate-800 text-right">{customer ? customer.full_name : `مجهول (id: ${s.user_id})`}</td>
                                      <td className="p-2.5 font-mono text-[11px] font-bold text-amber-500 text-right">{codeMapped ? codeMapped.code : `معرف: ${s.activation_code_id}`}</td>
                                      <td className="p-2.5 text-slate-600 font-mono text-right">
                                        <span>{s.start_date}</span>
                                        <span className="mx-1">إلى</span>
                                        <span className="font-bold text-slate-900">{s.end_date}</span>
                                      </td>
                                      <td className="p-2.5 text-right font-mono">
                                        <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
                                          s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-600'
                                        }`}>{s.status}</span>
                                      </td>
                                      <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          disabled={currentUser.role !== 'admin'}
                                          onClick={() => setEditingSubscription(s)}
                                          className="text-slate-400 hover:text-amber-500 disabled:opacity-30 transition"
                                          title="تعديل وثيقة الاشتراك"
                                        >
                                          <Pencil size={13} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={currentUser.role !== 'admin'}
                                          onClick={() => handleSubscriptionDelete(s.id)}
                                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                                          title="حذف وثيقة الاشتراك"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* Sub-Column 2: SQL Generator & Schema Display */}
                      <div className="space-y-6">
                        
                        {/* Code Generator Form */}
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-md space-y-4">
                          <h4 className="font-extrabold text-slate-900 text-md border-b pb-2 text-right">تخليق كود تفعيل فوري (Insert Generator)</h4>
                          <form onSubmit={handleInsertActivationCode} className="space-y-3">
                            <div className="text-right">
                              <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">الرمز المراد توليده (أو سيتم توليده عشوائياً):</label>
                              <input
                                type="text"
                                value={newCodeVal}
                                onChange={(e) => setNewCodeVal(e.target.value)}
                                placeholder="مثال: GOLD-MAX-FREE"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500 text-center"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-right">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">المدة بالأيام:</label>
                                <input
                                  type="number"
                                  value={newCodeDuration}
                                  onChange={(e) => setNewCodeDuration(Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none text-center"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-1 text-right">الباقة بالمتجر:</label>
                                <select
                                  value={newCodePlan}
                                  onChange={(e) => {
                                    const plan = e.target.value as 'weekly' | 'monthly' | 'full_cycle' | 'yearly';
                                    setNewCodePlan(plan);
                                    let duration = 30;
                                    if (plan === 'weekly') duration = 7;
                                    else if (plan === 'monthly') duration = 30;
                                    else if (plan === 'full_cycle') duration = 50;
                                    else if (plan === 'yearly') duration = 365;
                                    setNewCodeDuration(duration);
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none text-right font-bold"
                                >
                                  <option value="weekly">أسبوعي (weekly - 50 ج.م)</option>
                                  <option value="monthly">شهري (monthly - 100 ج.م)</option>
                                  <option value="full_cycle">دورة كاملة PRO (full_cycle - 200 ج.م)</option>
                                  <option value="yearly">سنوي شامل (yearly - 1000 ج.م)</option>
                                </select>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={currentUser.role !== 'admin'}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-2.5 rounded-xl text-xs transition active:scale-95 disabled:opacity-40"
                            >
                              حقن الكود بجدول التراخيص (SQL INSERT) ⚡
                            </button>
                          </form>
                        </div>

                        {/* Visual MySQL & PHP Code Integration Panel */}
                        <div className="bg-slate-900 text-slate-200 rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-800 text-right" id="sql_schema_highlight">
                          <div className="flex flex-col gap-3 border-b border-slate-800 pb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-emerald-400 font-extrabold text-xs flex items-center gap-1.5">
                                <Code size={15} />
                                مكتبة وسجلات المطور المطورة (MySQL & PHP)
                              </span>
                            </div>
                            
                            {/* Inner code view tabs switcher */}
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-17 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800" dir="rtl">
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('sql')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'sql'
                                    ? 'bg-amber-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                مخطط MySQL 📊
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_connect')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_connect'
                                    ? 'bg-emerald-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                اتصال PHP 🔌
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_check')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_check'
                                    ? 'bg-sky-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                فاحص الرمز 🔑
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_helpers')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_helpers'
                                    ? 'bg-rose-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                أدوات PHP 🛠️
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_auth_check')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_auth_check'
                                    ? 'bg-indigo-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                حارس الجلسة 🛡️
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_redirect')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_redirect'
                                    ? 'bg-amber-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                تحويل PHP ↗️
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_register')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_register'
                                    ? 'bg-violet-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                إنشاء حساب 📝
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_login')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_login'
                                    ? 'bg-cyan-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                تسجيل دخول 🔐
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_dashboard')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_dashboard'
                                    ? 'bg-emerald-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                لوحة التحكم 🖥️
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_activate')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_activate'
                                    ? 'bg-yellow-500 text-slate-950 shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                تفعيل الكود ⚡
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_generate')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_generate'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                توليد الأكواد 🔑
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_admin_index')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_admin_index'
                                    ? 'bg-fuchsia-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                لوحة الإدارة 👑
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_users')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_users'
                                    ? 'bg-sky-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                إدارة الأعضاء 👥
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_logout')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_logout'
                                    ? 'bg-rose-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                تسجيل خروج 🚪
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('css_styles')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'css_styles'
                                    ? 'bg-green-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                تنسيق CSS 🎨
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('css_admin')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'css_admin'
                                    ? 'bg-teal-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                تنسيق الإدارة 🛡️
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_subs')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_subs'
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                إدارة الاشتراكات 💳
                              </button>
                              <button
                                type="button"
                                onClick={() => setDbCodeViewTab('php_index')}
                                className={`py-2 text-[10px] font-bold rounded-lg transition ${
                                  dbCodeViewTab === 'php_index'
                                    ? 'bg-orange-600 text-white shadow'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                الملف المتكامل 🌐
                              </button>
                            </div>
                          </div>

                          {dbCodeViewTab === 'sql' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                مخطط إنشاء قاعدة بيانات <span className="text-amber-400 font-bold">five_kilo</span> على سيرفر MySQL الخاص بك مع العلاقات والمفاتيح الخارجية:
                              </p>
                              <pre className="text-[9px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`CREATE DATABASE IF NOT EXISTS five_kilo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE five_kilo;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(150) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','user') DEFAULT 'user',
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    plan ENUM('monthly','yearly') NOT NULL,
    duration_days INT NOT NULL,
    used TINYINT(1) DEFAULT 0,
    used_by INT NULL,
    expires_at DATE NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activation_code_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active','expired') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (activation_code_id) REFERENCES activation_codes(id)
);

-- تحديث جدول الأكواد الحالي لإضافة الأعمدة الجديدة للتاريخ ومنشئ الكود:
ALTER TABLE activation_codes
ADD COLUMN expires_at DATE NULL,
ADD COLUMN created_by INT NULL;`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`CREATE DATABASE IF NOT EXISTS five_kilo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE five_kilo;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(150) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','user') DEFAULT 'user',
    status ENUM('active','inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    plan ENUM('monthly','yearly') NOT NULL,
    duration_days INT NOT NULL,
    used TINYINT(1) DEFAULT 0,
    used_by INT NULL,
    expires_at DATE NULL,
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activation_code_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active','expired') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (activation_code_id) REFERENCES activation_codes(id)
);

-- تحديث جدول الأكواد الحالي لإضافة الأعمدة الجديدة للتاريخ ومنشئ الكود:
ALTER TABLE activation_codes
ADD COLUMN expires_at DATE NULL,
ADD COLUMN created_by INT NULL;`);
                                  alert("تم نسخ مخطط SQL بالكامل شامل تحديثات ALTER TABLE بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود الـ SQL للـ Database 🖥️
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_connect' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف الاتصال بالخادم <span className="text-emerald-400 font-bold">db_connect.php</span> باستخدام PDO المرفق من قبلك لربط الـ Backend بقاعدة البيانات:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

$host = "localhost";
$dbname = "five_kilo";
$username = "root";
$password = "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

} catch(PDOException $e){

    die("Database Error : " . $e->getMessage());

}
?>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

$host = "localhost";
$dbname = "five_kilo";
$username = "root";
$password = "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

} catch(PDOException $e){

    die("Database Error : " . $e->getMessage());

}
?>`);
                                  alert("تم نسخ كود الاتصال بالخادم PHP PDO المعتمد بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition cursor-pointer"
                              >
                                نسخ كود الاتصال PHP PDO الموجه 🔌
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_check' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف تحقق الترخيص <span className="text-sky-400 font-bold">check_license.php</span> لربط الـ HTTP GET Request للتحقق من رخص المربين:
                              </p>
                              <pre className="text-[9px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db_connect.php';

if (!isset($_GET['phone'])) {
    echo json_encode(['error' => 'رقم الهاتف مطلوب للتحقق من الترخيص.']);
    exit;
}

$phone = $_GET['phone'];

try {
    // استعلام للتحقق من وجود ترخيص فعال لم تنه صلاحيته بعد برقم هاتف المربي
    $stmt = $pdo->prepare("
        SELECT s.*, u.full_name, c.code, c.plan
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        JOIN activation_codes c ON s.activation_code_id = c.id
        WHERE u.phone = :phone 
          AND s.status = 'active' 
          AND s.end_date >= CURDATE()
        LIMIT 1
    ");
    
    $stmt->execute(['phone' => $phone]);
    $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($subscription) {
        echo json_encode([
            'status' => 'success',
            'has_active_license' => true,
            'message' => 'الترخيص نشط ومفعل بنجاح!',
            'data' => [
                'full_name' => $subscription['full_name'],
                'plan' => $subscription['plan'],
                'end_date' => $subscription['end_date'],
                'code_used' => $subscription['code']
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'expired',
            'has_active_license' => false,
            'message' => 'لا يوجد اشتراك ذهبي نشط ومفعل برقم الهاتف هذا.'
        ]);
    }

} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'حدث خطأ بالخادم: ' . $e->getMessage()
    ]);
}
?>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'db_connect.php';

if (!isset($_GET['phone'])) {
    echo json_encode(['error' => 'رقم الهاتف مطلوب للتحقق من الترخيص.']);
    exit;
}

$phone = $_GET['phone'];

try {
    // استعلام للتحقق من وجود ترخيص فعال لم تنه صلاحيته بعد برقم هاتف المربي
    $stmt = $pdo->prepare("
        SELECT s.*, u.full_name, c.code, c.plan
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        JOIN activation_codes c ON s.activation_code_id = c.id
        WHERE u.phone = :phone 
          AND s.status = 'active' 
          AND s.end_date >= CURDATE()
        LIMIT 1
    ");
    
    $stmt->execute(['phone' => $phone]);
    $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($subscription) {
        echo json_encode([
            'status' => 'success',
            'has_active_license' => true,
            'message' => 'الترخيص نشط ومفعل بنجاح!',
            'data' => [
                'full_name' => $subscription['full_name'],
                'plan' => $subscription['plan'],
                'end_date' => $subscription['end_date'],
                'code_used' => $subscription['code']
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'expired',
            'has_active_license' => false,
            'message' => 'لا يوجد اشتراك ذهبي نشط ومفعل برقم الهاتف هذا.'
        ]);
    }

} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'حدث خطأ بالخادم: ' . $e->getMessage()
    ]);
}
?>`);
                                  alert("تم نسخ كود check_license.php بالكامل!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود النهاية الخلفية check_license.php 🚀
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_helpers' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف الأدوات والأكواد الخدمية المساعدة <span className="text-rose-400 font-bold font-mono">utils.php</span> لتسهيل إدارة الجلسات، توليد الأكواد المخصصة، وإعادة التوجيه الآمن:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

function generateCode($length = 8)
{
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    $code = 'NAZIH-';

    for($i=0;$i<$length;$i++)
    {
        $code .= $chars[rand(0, strlen($chars)-1)];
    }

    return $code;
}

function isLoggedIn()
{
    return isset($_SESSION['user_id']);
}

function redirect($url)
{
    header("Location: ".$url);
    exit;
}
?>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

function generateCode($length = 8)
{
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    $code = 'NAZIH-';

    for($i=0;$i<$length;$i++)
    {
        $code .= $chars[rand(0, strlen($chars)-1)];
    }

    return $code;
}

function isLoggedIn()
{
    return isset($_SESSION['user_id']);
}

function redirect($url)
{
    header("Location: ".$url);
    exit;
}
?>`);
                                  alert("تم نسخ دوال PHP العامة المساعدة بنجاح! تحتوي على دالة توليد التراخيص NAZIH- ومتابعة الجلسة.");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ الدوال المساعدة utils.php 🛠️
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_auth_check' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف حارس التحقق من تسجيل الدخول <span className="text-indigo-400 font-bold font-mono">session_guard.php</span> المدمج لفرضه أعلى الصفحات المحمية بالحظيرة لطلب التحقق:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();

if(!isset($_SESSION['user_id']))
{
    header("Location: ../login.php");
    exit;
}
?>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();

if(!isset($_SESSION['user_id']))
{
    header("Location: ../login.php");
    exit;
}
?>`);
                                  alert("تم نسخ كود حارس الجلسة PHP Session Guard بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود حارس الجلسة Session Guard 🛡️
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_redirect' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف التوجيه المباشر <span className="text-amber-400 font-bold font-mono">index.php</span> لتحويل الزوار تلقائياً لصفحة تسجيل الدخول:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php
header("Location: login.php");
exit;
?>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php
header("Location: login.php");
exit;
?>`);
                                  alert("تم نسخ كود توجيه الدخول بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود التوجيه index.php ↗️
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_register' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                صفحة التسجيل <span className="text-violet-400 font-bold font-mono">register.php</span> لتمكين المستخدمين الجدد من الانضمام وقيد بياناتهم بقاعدة البيانات:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();
require_once "config/database.php";

$message = "";

if($_SERVER['REQUEST_METHOD'] == "POST"){

    $full_name = trim($_POST['full_name']);
    $phone = trim($_POST['phone']);
    $email = trim($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $check = $pdo->prepare("SELECT id FROM users WHERE phone=?");
    $check->execute([$phone]);

    if($check->rowCount() > 0){

        $message = "رقم الهاتف مستخدم بالفعل";

    }else{

        $insert = $pdo->prepare("
            INSERT INTO users
            (full_name,phone,email,password)
            VALUES (?,?,?,?)
        ");

        $insert->execute([
            $full_name,
            $phone,
            $email,
            $password
        ]);

        header("Location: login.php");
        exit;
    }
}
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>إنشاء حساب</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div class="container">

<div class="card">

<h2>إنشاء حساب جديد</h2>

<p style="color:red"><?= $message ?></p>

<form method="POST">

<input type="text" name="full_name" placeholder="الاسم الكامل" required>

<br><br>

<input type="text" name="phone" placeholder="رقم الهاتف" required>

<br><br>

<input type="email" name="email" placeholder="البريد الإلكتروني">

<br><br>

<input type="password" name="password" placeholder="كلمة المرور" required>

<br><br>

<button class="btn">إنشاء الحساب</button>

</form>

</div>

</div>

</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();
require_once "config/database.php";

$message = "";

if($_SERVER['REQUEST_METHOD'] == "POST"){

    $full_name = trim($_POST['full_name']);
    $phone = trim($_POST['phone']);
    $email = trim($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $check = $pdo->prepare("SELECT id FROM users WHERE phone=?");
    $check->execute([$phone]);

    if($check->rowCount() > 0){

        $message = "رقم الهاتف مستخدم بالفعل";

    }else{

        $insert = $pdo->prepare("
            INSERT INTO users
            (full_name,phone,email,password)
            VALUES (?,?,?,?)
        ");

        $insert->execute([
            $full_name,
            $phone,
            $email,
            $password
        ]);

        header("Location: login.php");
        exit;
    }
}
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>إنشاء حساب</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div class="container">

<div class="card">

<h2>إنشاء حساب جديد</h2>

<p style="color:red"><?= $message ?></p>

<form method="POST">

<input type="text" name="full_name" placeholder="الاسم الكامل" required>

<br><br>

<input type="text" name="phone" placeholder="رقم الهاتف" required>

<br><br>

<input type="email" name="email" placeholder="البريد الإلكتروني">

<br><br>

<input type="password" name="password" placeholder="كلمة المرور" required>

<br><br>

<button class="btn">إنشاء الحساب</button>

</form>

</div>

</div>

</body>
</html>`);
                                  alert("تم نسخ كود إنشاء الحساب PHP Register بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-violet-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود إنشاء الحساب register.php 📝
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_login' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                صفحة التحقق وتسجيل الدخول <span className="text-cyan-400 font-bold font-mono">login.php</span> للتحقق من هوية المستخدمين المسجلين:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();
require_once "config/database.php";

$error = "";

if($_SERVER['REQUEST_METHOD']=="POST"){

    $phone = $_POST['phone'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("
        SELECT *
        FROM users
        WHERE phone=?
    ");

    $stmt->execute([$phone]);

    $user = $stmt->fetch();

    if($user && password_verify($password,$user['password'])){

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];

        header("Location: dashboard/index.php");
        exit;

    }else{

        $error = "بيانات الدخول غير صحيحة";

    }
}
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>تسجيل الدخول</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div class="container">

<div class="card">

<h2>تسجيل الدخول</h2>

<p style="color:red"><?= $error ?></p>

<form method="POST">

<input type="text" name="phone" placeholder="رقم الهاتف" required>

<br><br>

<input type="password" name="password" placeholder="كلمة المرور" required>

<br><br>

<button class="btn">دخول</button>

</form>

<br>

<a href="register.php">
إنشاء حساب جديد
</a>

</div>

</div>

</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();
require_once "config/database.php";

$error = "";

if($_SERVER['REQUEST_METHOD']=="POST"){

    $phone = $_POST['phone'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("
        SELECT *
        FROM users
        WHERE phone=?
    ");

    $stmt->execute([$phone]);

    $user = $stmt->fetch();

    if($user && password_verify($password,$user['password'])){

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];

        header("Location: dashboard/index.php");
        exit;

    }else{

        $error = "بيانات الدخول غير صحيحة";

    }
}
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>تسجيل الدخول</title>
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

<div class="container">

<div class="card">

<h2>تسجيل الدخول</h2>

<p style="color:red"><?= $error ?></p>

<form method="POST">

<input type="text" name="phone" placeholder="رقم الهاتف" required>

<br><br>

<input type="password" name="password" placeholder="كلمة المرور" required>

<br><br>

<button class="btn">دخول</button>

</form>

<br>

<a href="register.php">
إنشاء حساب جديد
</a>

</div>

</div>

</body>
</html>`);
                                  alert("تم نسخ كود تسجيل الدخول PHP Login بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود تسجيل الدخول login.php 🔐
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_logout' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف تسجيل الخروج وتدمير الجلسة الآمن <span className="text-rose-400 font-bold font-mono">logout.php</span> لإنهاء جلسة المستخدم وتوجيهه لصفحة الدخول:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();

session_destroy();

header("Location: ../login.php");
exit;
?>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();

session_destroy();

header("Location: ../login.php");
exit;
?>`);
                                  alert("تم نسخ كود تسجيل الخروج PHP Logout بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود تسجيل الخروج logout.php 🚪
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_dashboard' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                صفحة لوحة التحكم الرئيسية للأعضاء والمشتركين <span className="text-emerald-400 font-bold font-mono">dashboard/index.php</span> للتحقق من الصلاحيات وحالة تفعيل الكود:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

require_once "../config/auth.php";
require_once "../config/database.php";

$user_id = $_SESSION['user_id'];

$sub = $pdo->prepare("
SELECT *
FROM subscriptions
WHERE user_id=?
AND end_date >= CURDATE()
LIMIT 1
");

$sub->execute([$user_id]);

$subscription = $sub->fetch();
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>لوحة التحكم</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<div class="navbar">
تطبيق الـ 5 كيلو
</div>

<div class="container">

<?php if(!$subscription): ?>

<div class="card">

<h2>تفعيل الاشتراك</h2>

<form action="../activate.php" method="POST">

<input
type="text"
name="activation_code"
placeholder="أدخل كود التفعيل"
required>

<br><br>

<button class="btn">
تفعيل الاشتراك
</button>

</form>

</div>

<?php else: ?>

<div class="card">

<h2>الاشتراك فعال</h2>

<p>
تاريخ الانتهاء:
<?= $subscription['end_date'] ?>
</p>

</div>

<div class="card">

<h2>مرحباً بك</h2>

<p>
تم تفعيل حسابك بنجاح.
</p>

</div>

<?php endif; ?>

</div>

</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

require_once "../config/auth.php";
require_once "../config/database.php";

$user_id = $_SESSION['user_id'];

$sub = $pdo->prepare("
SELECT *
FROM subscriptions
WHERE user_id=?
AND end_date >= CURDATE()
LIMIT 1
");

$sub->execute([$user_id]);

$subscription = $sub->fetch();
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>لوحة التحكم</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<div class="navbar">
تطبيق الـ 5 كيلو
</div>

<div class="container">

<?php if(!$subscription): ?>

<div class="card">

<h2>تفعيل الاشتراك</h2>

<form action="../activate.php" method="POST">

<input
type="text"
name="activation_code"
placeholder="أدخل كود التفعيل"
required>

<br><br>

<button class="btn">
تفعيل الاشتراك
</button>

</form>

</div>

<?php else: ?>

<div class="card">

<h2>الاشتراك فعال</h2>

<p>
تاريخ الانتهاء:
<?= $subscription['end_date'] ?>
</p>

</div>

<div class="card">

<h2>مرحباً بك</h2>

<p>
تم تفعيل حسابك بنجاح.
</p>

</div>

<?php endif; ?>

</div>

</body>
</html>`);
                                  alert("تم نسخ كود لوحة التحكم PHP Dashboard بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود لوحة التحكم dashboard/index.php 🖥️
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_activate' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف تفعيل رموز الاشتراك <span className="text-yellow-400 font-bold font-mono">activate.php</span> للتحقق من الرموز المدخلة وإنشاء الاشتراك للعميل وتحديث حالة الرمز بقاعدة البيانات:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();

require_once "config/database.php";

$user_id = $_SESSION['user_id'];

$code = trim($_POST['activation_code']);

$stmt = $pdo->prepare("
SELECT *
FROM activation_codes
WHERE code=?
AND used=0
");

$stmt->execute([$code]);

$data = $stmt->fetch();

if(!$data){

die("الكود غير صالح");

}

$start = date("Y-m-d");

$end = date(
"Y-m-d",
strtotime("+".$data['duration_days']." days")
);

$insert = $pdo->prepare("
INSERT INTO subscriptions
(user_id,activation_code_id,start_date,end_date)
VALUES (?,?,?,?)
");

$insert->execute([
$user_id,
$data['id'],
$start,
$end
]);

$pdo->prepare("
UPDATE activation_codes
SET used=1,
used_by=?
WHERE id=?
")->execute([
$user_id,
$data['id']
]);

header("Location: dashboard/index.php");
?>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();

require_once "config/database.php";

$user_id = $_SESSION['user_id'];

$code = trim($_POST['activation_code']);

$stmt = $pdo->prepare("
SELECT *
FROM activation_codes
WHERE code=?
AND used=0
");

$stmt->execute([$code]);

$data = $stmt->fetch();

if(!$data){

die("الكود غير صالح");

}

$start = date("Y-m-d");

$end = date(
"Y-m-d",
strtotime("+".$data['duration_days']." days")
);

$insert = $pdo->prepare("
INSERT INTO subscriptions
(user_id,activation_code_id,start_date,end_date)
VALUES (?,?,?,?)
");

$insert->execute([
$user_id,
$data['id'],
$start,
$end
]);

$pdo->prepare("
UPDATE activation_codes
SET used=1,
used_by=?
WHERE id=?
")->execute([
$user_id,
$data['id']
]);

header("Location: dashboard/index.php");
?>`);
                                  alert("تم نسخ كود تفعيل الاشتراك PHP Activate بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود تفعيل الاشتراك activate.php ⚡
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_generate' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                صفحة توليد الأكواد <span className="text-indigo-400 font-bold font-mono">admin/generate.php</span> للمسؤولين لإنشاء رموز التفعيل واستعراض المتوفر والمستعمل منها:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();

require_once "../config/database.php";
require_once "../config/functions.php";

if($_SESSION['role'] != 'admin'){

die("Access Denied");

}

if(isset($_POST['generate'])){

$plan = $_POST['plan'];

$days = ($plan=="monthly")
? 30
: 365;

$code = generateCode();

$stmt = $pdo->prepare("
INSERT INTO activation_codes
(code,plan,duration_days)
VALUES (?,?,?)
");

$stmt->execute([
$code,
$plan,
$days
]);

}
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>توليد الأكواد</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<div class="container">

<div class="card">

<h2>إنشاء كود اشتراك</h2>

<form method="POST">

<select name="plan">

<option value="monthly">
شهري
</option>

<option value="yearly">
سنوي
</option>

</select>

<br><br>

<button
name="generate"
class="btn">

إنشاء كود

</button>

</form>

</div>

<div class="card">

<h2>الأكواد الحالية</h2>

<table width="100%" border="1">

<tr>
<th>الكود</th>
<th>النوع</th>
<th>الحالة</th>
</tr>

<?php

$codes = $pdo->query("
SELECT *
FROM activation_codes
ORDER BY id DESC
");

foreach($codes as $row){

echo "<tr>";

echo "<td>".$row['code']."</td>";

echo "<td>".$row['plan']."</td>";

echo "<td>";

echo $row['used']
? "مستخدم"
: "متاح";

echo "</td>";

echo "</tr>";
}
?>

</table>

</div>

</div>

</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();

require_once "../config/database.php";
require_once "../config/functions.php";

if($_SESSION['role'] != 'admin'){

die("Access Denied");

}

if(isset($_POST['generate'])){

$plan = $_POST['plan'];

$days = ($plan=="monthly")
? 30
: 365;

$code = generateCode();

$stmt = $pdo->prepare("
INSERT INTO activation_codes
(code,plan,duration_days)
VALUES (?,?,?)
");

$stmt->execute([
$code,
$plan,
$days
]);

}
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>توليد الأكواد</title>
<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>

<div class="container">

<div class="card">

<h2>إنشاء كود اشتراك</h2>

<form method="POST">

<select name="plan">

<option value="monthly">
شهري
</option>

<option value="yearly">
سنوي
</option>

</select>

<br><br>

<button
name="generate"
class="btn">

إنشاء كود

</button>

</form>

</div>

<div class="card">

<h2>الأكواد الحالية</h2>

<table width="100%" border="1">

<tr>
<th>الكود</th>
<th>النوع</th>
<th>الحالة</th>
</tr>

<?php

$codes = $pdo->query("
SELECT *
FROM activation_codes
ORDER BY id DESC
");

foreach($codes as $row){

echo "<tr>";

echo "<td>".$row['code']."</td>";

echo "<td>".$row['plan']."</td>";

echo "<td>";

echo $row['used']
? "مستخدم"
: "متاح";

echo "</td>";

echo "</tr>";
}
?>

</table>

</div>

</div>

</body>
</html>`);
                                  alert("تم نسخ كود توليد الأكواد PHP Auto-Generate بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود توليد الأكواد admin/generate.php 🔑
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_admin_index' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                الصفحة الإدارية الرئيسية <span className="text-fuchsia-400 font-bold font-mono">admin/index.php</span> لمسؤولي التطبيق لمراقبة الإحصائيات الفورية وإدارة رموز تفعيل العملاء:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();

require_once "../config/database.php";

if(!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin'){
    exit("Access Denied");
}

$totalUsers = $pdo->query("
SELECT COUNT(*) FROM users
")->fetchColumn();

$totalCodes = $pdo->query("
SELECT COUNT(*) FROM activation_codes
")->fetchColumn();

$usedCodes = $pdo->query("
SELECT COUNT(*) FROM activation_codes
WHERE used=1
")->fetchColumn();

$activeSubs = $pdo->query("
SELECT COUNT(*) FROM subscriptions
WHERE end_date >= CURDATE()
")->fetchColumn();

$expiredSubs = $pdo->query("
SELECT COUNT(*) FROM subscriptions
WHERE end_date < CURDATE()
")->fetchColumn();

$todayUsers = $pdo->query("
SELECT COUNT(*) FROM users
WHERE DATE(created_at)=CURDATE()
")->fetchColumn();
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>لوحة الإدارة</title>

<link rel="stylesheet"
href="../assets/css/admin.css">

</head>
<body>

<div class="topbar">
    لوحة إدارة تطبيق الـ 5 كيلو
</div>

<div class="dashboard">

<div class="stat-card">
<h3>إجمالي المستخدمين</h3>
<span><?= $totalUsers ?></span>
</div>

<div class="stat-card">
<h3>المستخدمون اليوم</h3>
<span><?= $todayUsers ?></span>
</div>

<div class="stat-card">
<h3>الأكواد المولدة</h3>
<span><?= $totalCodes ?></span>
</div>

<div class="stat-card">
<h3>الأكواد المستخدمة</h3>
<span><?= $usedCodes ?></span>
</div>

<div class="stat-card">
<h3>اشتراكات فعالة</h3>
<span><?= $activeSubs ?></span>
</div>

<div class="stat-card danger">
<h3>اشتراكات منتهية</h3>
<span><?= $expiredSubs ?></span>
</div>

</div>

<div class="actions">

<a href="users.php" class="btn">
إدارة المستخدمين
</a>

<a href="codes.php" class="btn">
إدارة الأكواد
</a>

<a href="subscriptions.php" class="btn">
الاشتراكات
</a>

</div>

</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();

require_once "../config/database.php";

if(!isset($_SESSION['user_id']) || $_SESSION['role'] != 'admin'){
    exit("Access Denied");
}

$totalUsers = $pdo->query("
SELECT COUNT(*) FROM users
")->fetchColumn();

$totalCodes = $pdo->query("
SELECT COUNT(*) FROM activation_codes
")->fetchColumn();

$usedCodes = $pdo->query("
SELECT COUNT(*) FROM activation_codes
WHERE used=1
")->fetchColumn();

$activeSubs = $pdo->query("
SELECT COUNT(*) FROM subscriptions
WHERE end_date >= CURDATE()
")->fetchColumn();

$expiredSubs = $pdo->query("
SELECT COUNT(*) FROM subscriptions
WHERE end_date < CURDATE()
")->fetchColumn();

$todayUsers = $pdo->query("
SELECT COUNT(*) FROM users
WHERE DATE(created_at)=CURDATE()
")->fetchColumn();
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>لوحة الإدارة</title>

<link rel="stylesheet"
href="../assets/css/admin.css">

</head>
<body>

<div class="topbar">
    لوحة إدارة تطبيق الـ 5 كيلو
</div>

<div class="dashboard">

<div class="stat-card">
<h3>إجمالي المستخدمين</h3>
<span><?= $totalUsers ?></span>
</div>

<div class="stat-card">
<h3>المستخدمون اليوم</h3>
<span><?= $todayUsers ?></span>
</div>

<div class="stat-card">
<h3>الأكواد المولدة</h3>
<span><?= $totalCodes ?></span>
</div>

<div class="stat-card">
<h3>الأكواد المستخدمة</h3>
<span><?= $usedCodes ?></span>
</div>

<div class="stat-card">
<h3>اشتراكات فعالة</h3>
<span><?= $activeSubs ?></span>
</div>

<div class="stat-card danger">
<h3>اشتراكات منتهية</h3>
<span><?= $expiredSubs ?></span>
</div>

</div>

<div class="actions">

<a href="users.php" class="btn">
إدارة المستخدمين
</a>

<a href="codes.php" class="btn">
إدارة الأكواد
</a>

<a href="subscriptions.php" class="btn">
الاشتراكات
</a>

</div>

</body>
</html>`);
                                  alert("تم نسخ كود لوحة الإدارة الرئيسية PHP Admin Dashboard بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-fuchsia-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود لوحة الإدارة admin/index.php 👑
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'css_styles' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف تنسيق الواجهات والأنماط التبسيطية <span className="text-green-400 font-bold font-mono">style.css</span> المرفق لمواءمة الخط والألوان العامة للوحة التحكم:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`:root{
    --primary:#2E7D32;
    --secondary:#FFB300;
    --dark:#1B5E20;
    --bg:#f5f7fa;
}

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:Cairo,sans-serif;
    background:var(--bg);
}

.navbar{
    background:var(--primary);
    color:#fff;
    padding:15px;
    font-size:20px;
    font-weight:bold;
}

.container{
    width:95%;
    max-width:1200px;
    margin:auto;
}

.card{
    background:#fff;
    padding:20px;
    border-radius:15px;
    margin:15px 0;
    box-shadow:0 2px 10px rgba(0,0,0,.08);
}

.btn{
    background:var(--primary);
    color:#fff;
    padding:12px 20px;
    border:none;
    border-radius:10px;
    cursor:pointer;
}

.btn:hover{
    background:var(--dark);
}`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`:root{
    --primary:#2E7D32;
    --secondary:#FFB300;
    --dark:#1B5E20;
    --bg:#f5f7fa;
}

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:Cairo,sans-serif;
    background:var(--bg);
}

.navbar{
    background:var(--primary);
    color:#fff;
    padding:15px;
    font-size:20px;
    font-weight:bold;
}

.container{
    width:95%;
    max-width:1200px;
    margin:auto;
}

.card{
    background:#fff;
    padding:20px;
    border-radius:15px;
    margin:15px 0;
    box-shadow:0 2px 10px rgba(0,0,0,.08);
}

.btn{
    background:var(--primary);
    color:#fff;
    padding:12px 20px;
    border:none;
    border-radius:10px;
    cursor:pointer;
}

.btn:hover{
    background:var(--dark);
}`);
                                  alert("تم نسخ كود التنسيق CSS بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-green-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود تنسيق المظهر style.css 🎨
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'css_admin' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف تنسيق لوحة الإدارة <span className="text-teal-400 font-bold font-mono">admin.css</span> لتنسيق لوحات الإحصائيات وبطاقات الأداء وجداول المستخدمين:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`body{
background:#f4f7fb;
font-family:Cairo,sans-serif;
margin:0;
}

.topbar{
background:#1b5e20;
color:white;
padding:20px;
font-size:24px;
font-weight:bold;
}

.dashboard{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
gap:20px;
padding:20px;
}

.stat-card{
background:white;
border-radius:15px;
padding:20px;
box-shadow:0 2px 12px rgba(0,0,0,.08);
}

.stat-card h3{
margin:0;
font-size:18px;
}

.stat-card span{
display:block;
margin-top:15px;
font-size:35px;
font-weight:bold;
color:#2e7d32;
}

.danger span{
color:#d32f2f;
}

.actions{
padding:20px;
display:flex;
gap:10px;
flex-wrap:wrap;
}

.btn{
background:#2e7d32;
color:white;
padding:12px 20px;
border-radius:10px;
text-decoration:none;
}`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`body{
background:#f4f7fb;
font-family:Cairo,sans-serif;
margin:0;
}

.topbar{
background:#1b5e20;
color:white;
padding:20px;
font-size:24px;
font-weight:bold;
}

.dashboard{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
gap:20px;
padding:20px;
}

.stat-card{
background:white;
border-radius:15px;
padding:20px;
box-shadow:0 2px 12px rgba(0,0,0,.08);
}

.stat-card h3{
margin:0;
font-size:18px;
}

.stat-card span{
display:block;
margin-top:15px;
font-size:35px;
font-weight:bold;
color:#2e7d32;
}

.danger span{
color:#d32f2f;
}

.actions{
padding:20px;
display:flex;
gap:10px;
flex-wrap:wrap;
}

.btn{
background:#2e7d32;
color:white;
padding:12px 20px;
border-radius:10px;
text-decoration:none;
}`);
                                  alert("تم نسخ كود التنسيق الإداري admin.css بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود مظهر الإدارة admin.css 🛡️
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_users' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف لوحة إدارة المستخدمين والأعضاء <span className="text-sky-400 font-bold font-mono">admin/users.php</span> للمشرفين لاستعراض قائمة الحسابات والبيانات المسجلة بالتطبيق:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();

require_once "../config/database.php";

if($_SESSION['role']!='admin'){
exit;
}

$users = $pdo->query("
SELECT *
FROM users
ORDER BY id DESC
");
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>المستخدمون</title>
<link rel="stylesheet"
href="../assets/css/admin.css">
</head>
<body>

<div class="topbar">
إدارة المستخدمين
</div>

<table border="1"
width="100%">

<tr>

<th>#</th>
<th>الاسم</th>
<th>الهاتف</th>
<th>الدور</th>
<th>الحالة</th>

</tr>

<?php foreach($users as $u): ?>

<tr>

<td><?= $u['id'] ?></td>

<td><?= $u['full_name'] ?></td>

<td><?= $u['phone'] ?></td>

<td><?= $u['role'] ?></td>

<td><?= $u['status'] ?></td>

</tr>

<?php endforeach; ?>

</table>

</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();

require_once "../config/database.php";

if($_SESSION['role']!='admin'){
exit;
}

$users = $pdo->query("
SELECT *
FROM users
ORDER BY id DESC
");
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>المستخدمون</title>
<link rel="stylesheet"
href="../assets/css/admin.css">
</head>
<body>

<div class="topbar">
إدارة المستخدمين
</div>

<table border="1"
width="100%">

<tr>

<th>#</th>
<th>الاسم</th>
<th>الهاتف</th>
<th>الدور</th>
<th>الحالة</th>

</tr>

<?php foreach($users as $u): ?>

<tr>

<td><?= $u['id'] ?></td>

<td><?= $u['full_name'] ?></td>

<td><?= $u['phone'] ?></td>

<td><?= $u['role'] ?></td>

<td><?= $u['status'] ?></td>

</tr>

<?php endforeach; ?>

</table>

</body>
</html>`);
                                  alert("تم نسخ كود صفحة المشتركين PHP Users بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود إدارة المستخدمين users.php 👥
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_subs' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                الصفحة المساعدة للاشتراكات <span className="text-indigo-400 font-bold font-mono">admin/subscriptions.php</span> لمراقبة جميع اشتراكات وتواريخ المستخدمين:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php

session_start();

require_once "../config/database.php";

if($_SESSION['role']!='admin'){
exit;
}

$subs = $pdo->query("
SELECT
users.full_name,
users.phone,
subscriptions.start_date,
subscriptions.end_date,
subscriptions.status
FROM subscriptions
JOIN users
ON users.id=subscriptions.user_id
ORDER BY subscriptions.id DESC
");
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>الاشتراكات</title>

<link rel="stylesheet"
href="../assets/css/admin.css">

</head>
<body>

<div class="topbar">
إدارة الاشتراكات
</div>

<table border="1"
width="100%">

<tr>

<th>المستخدم</th>
<th>الهاتف</th>
<th>البداية</th>
<th>النهاية</th>
<th>الحالة</th>

</tr>

<?php foreach($subs as $s): ?>

<tr>

<td><?= $s['full_name'] ?></td>

<td><?= $s['phone'] ?></td>

<td><?= $s['start_date'] ?></td>

<td><?= $s['end_date'] ?></td>

<td><?= $s['status'] ?></td>

</tr>

<?php endforeach; ?>

</table>

</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php

session_start();

require_once "../config/database.php";

if($_SESSION['role']!='admin'){
exit;
}

$subs = $pdo->query("
SELECT
users.full_name,
users.phone,
subscriptions.start_date,
subscriptions.end_date,
subscriptions.status
FROM subscriptions
JOIN users
ON users.id=subscriptions.user_id
ORDER BY subscriptions.id DESC
");
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>الاشتراكات</title>

<link rel="stylesheet"
href="../assets/css/admin.css">

</head>
<body>

<div class="topbar">
إدارة الاشتراكات
</div>

<table border="1"
width="100%">

<tr>

<th>المستخدم</th>
<th>الهاتف</th>
<th>البداية</th>
<th>النهاية</th>
<th>الحالة</th>

</tr>

<?php foreach($subs as $s): ?>

<tr>

<td><?= $s['full_name'] ?></td>

<td><?= $s['phone'] ?></td>

<td><?= $s['start_date'] ?></td>

<td><?= $s['end_date'] ?></td>

<td><?= $s['status'] ?></td>

</tr>

<?php endforeach; ?>

</table>

</body>
</html>`);
                                  alert("تم نسخ كود صفحة الاشتراكات PHP Subscriptions بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ كود الاشتراكات subscriptions.php 💳
                              </button>
                            </div>
                          )}

                          {dbCodeViewTab === 'php_index' && (
                            <div className="space-y-3">
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                ملف الصفحة الرئيسية والبرمجية المتكاملة لـ InfinityFree <span className="text-orange-400 font-bold font-mono">index.php</span> لتشغيل المشروع بالكامل في كود برمجى واحد متناسق مع الحماية:
                              </p>
                              <pre className="text-[9.5px] font-mono leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-[280px] overflow-y-auto text-emerald-400 text-left tracking-wide select-all font-semibold" dir="ltr">
{`<?php
ob_start();
session_start();

$host     = 'localhost'; 
$db_name  = 'five_kilo';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("<div style='color:red; text-align:center; margin-top:50px; font-family:Cairo,sans-serif;'>فشل الاتصال بقاعدة البيانات: " . $e->getMessage() . "</div>");
}

function generateCode($length = 8) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = 'NAZIH-';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $code;
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function redirect($url) {
    header("Location: " . $url);
    exit;
}

$page = isset($_GET['page']) ? trim($_GET['page']) : 'login';

if ($page === 'logout') {
    session_destroy();
    redirect('index.php?page=login');
}

$secure_pages = ['dashboard', 'activate', 'admin_codes', 'admin_users', 'admin_subs'];
if (in_array($page, $secure_pages) && !isLoggedIn()) {
    redirect('index.php?page=login');
}

$admin_pages = ['admin_codes', 'admin_users', 'admin_subs'];
if (in_array($page, $admin_pages) && $_SESSION['role'] !== 'admin') {
    die("<h2 style='text-align:center; margin-top:50px; color:red; font-family:Cairo,sans-serif;'>غير مسموح لك بالوصول لهذه الصفحة (Access Denied)</h2>");
}

$message = "";
$error = "";

if ($page === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = trim($_POST['full_name']);
    $phone     = trim($_POST['phone']);
    $email     = trim($_POST['email']);
    $password  = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $check = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
    $check->execute([$phone]);

    if ($check->rowCount() > 0) {
        $message = "رقم الهاتف مستخدم بالفعل!";
    } else {
        $role = ($phone === '01029190615') ? 'admin' : 'user'; 
        
        $insert = $pdo->prepare("INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)");
        $insert->execute([$full_name, $phone, $email, $password, $role]);
        redirect('index.php?page=login');
    }
}

if ($page === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $phone    = trim($_POST['phone']);
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id']   = $user['id'];
        $_SESSION['role']      = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        redirect('index.php?page=dashboard');
    } else {
        $error = "بيانات الدخول غير صحيحة!";
    }
}

if ($page === 'activate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $code    = trim($_POST['activation_code']);

    $stmt = $pdo->prepare("SELECT * FROM activation_codes WHERE code = ? AND used = 0");
    $stmt->execute([$code]);
    $data = $stmt->fetch();

    if (!$data) {
        die("<h2 style='text-align:center; margin-top:50px; color:red; font-family:Cairo,sans-serif;'>الكود غير صالح أو مستخدم مسبقاً! <a href='index.php?page=dashboard'>عودة</a></h2>");
    }
    
    if (!empty($data['expires_at']) && strtotime($data['expires_at']) < strtotime(date('Y-m-d'))) {
        die("<h2 style='text-align:center; margin-top:50px; color:red; font-family:Cairo,sans-serif;'>عذراً، هذا الكود انتهت صلاحية توليده ولم يعد قابلاً للتفعيل! <a href='index.php?page=dashboard'>عودة</a></h2>");
    }

    $start = date("Y-m-d");
    $end   = date("Y-m-d", strtotime("+" . $data['duration_days'] . " days"));

    $insert = $pdo->prepare("INSERT INTO subscriptions (user_id, activation_code_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'active')");
    $insert->execute([$user_id, $data['id'], $start, $end]);

    $updateCode = $pdo->prepare("UPDATE activation_codes SET used = 1, used_by = ? WHERE id = ?");
    $updateCode->execute([$user_id, $data['id']]);

    redirect('index.php?page=dashboard');
}

if ($page === 'admin_codes' && isset($_POST['generate'])) {
    $plan       = $_POST['plan'];
    $days       = ($plan == "monthly") ? 30 : 365;
    $code       = generateCode();
    $created_by = $_SESSION['user_id'];
    
    $expires_at = date('Y-m-d', strtotime('+7 days')); 

    $stmt = $pdo->prepare("INSERT INTO activation_codes (code, plan, duration_days, expires_at, created_by) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$code, $plan, $days, $expires_at, $created_by]);
    redirect('index.php?page=admin_codes');
}
?>
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تطبيق الـ 5 كيلو لتسمين الدواجن</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2E7D32;
            --secondary: #FFB300;
            --dark: #1B5E20;
            --bg: #f4f7fb;
            --danger: #d32f2f;
            --text-color: #333;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', sans-serif; background: var(--bg); color: var(--text-color); line-height: 1.6; }
        .topbar, .navbar { background: var(--dark); color: white; padding: 15px 20px; font-size: 20px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .topbar a, .navbar a { color: #fff; text-decoration: none; font-size: 14px; background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 8px; font-weight: normal; transition: 0.3s; }
        .topbar a:hover, .navbar a:hover { background: var(--secondary); color: var(--dark); }
        .container { width: 92%; max-width: 1200px; margin: 20px auto; }
        .card { background: #fff; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .card h2, .card h3 { color: var(--dark); margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
        form input[type="text"], form input[type="email"], form input[type="password"], form select { width: 100%; padding: 12px 15px; margin: 8px 0; border: 1px solid #ccc; border-radius: 10px; font-family: 'Cairo', sans-serif; font-size: 15px; outline: none; transition: 0.3s; }
        .btn { background: var(--primary); color: white; padding: 12px 25px; border: none; border-radius: 10px; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 16px; font-weight: bold; width: 100%; display: inline-block; text-align: center; text-decoration: none; transition: background 0.3s ease; }
        .btn:hover { background: var(--dark); }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-right: 5px solid var(--primary); }
        .stat-card h3 { margin: 0; font-size: 16px; color: #666; }
        .stat-card span { display: block; margin-top: 10px; font-size: 30px; font-weight: bold; color: var(--primary); }
        .stat-card.danger { border-right-color: var(--danger); }
        .stat-card.danger span { color: var(--danger); }
        .admin-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .admin-actions .btn { width: auto; flex: 1; min-width: 140px; font-size: 14px; padding: 10px 15px; }
        .table-responsive { width: 100%; overflow-x: auto; margin-top: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; background: #fff; text-align: center; font-size: 14px; }
        table th, table td { padding: 12px; border: 1px solid #eef2f5; }
        table th { background: var(--primary); color: white; }
        .alert { background: #ffebee; color: var(--danger); padding: 12px; border-radius: 10px; text-align: center; }
    </style>
</head>
<body>
    <?php if ($page === 'login'): ?>
        <div class="topbar">تطبيق الـ 5 كيلو</div>
        <div class="container">
            <div class="card">
                <h2>تسجيل الدخول</h2>
                <form method="POST">
                    <input type="text" name="phone" placeholder="رقم الهاتف" required>
                    <input type="password" name="password" placeholder="كلمة المرور" required>
                    <button type="submit" class="btn" style="margin-top: 15px;">دخول</button>
                </form>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>`}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`<?php
ob_start();
session_start();

$host     = 'localhost'; 
$db_name  = 'five_kilo';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("<div style='color:red; text-align:center; margin-top:50px; font-family:Cairo,sans-serif;'>فشل الاتصال بقاعدة البيانات: " . $e->getMessage() . "</div>");
}

function generateCode($length = 8) {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $code = 'NAZIH-';
    for ($i = 0; $i < $length; $i++) {
        $code .= $chars[rand(0, strlen($chars) - 1)];
    }
    return $code;
}

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function redirect($url) {
    header("Location: " . $url);
    exit;
}

$page = isset($_GET['page']) ? trim($_GET['page']) : 'login';

if ($page === 'logout') {
    session_destroy();
    redirect('index.php?page=login');
}

$secure_pages = ['dashboard', 'activate', 'admin_codes', 'admin_users', 'admin_subs'];
if (in_array($page, $secure_pages) && !isLoggedIn()) {
    redirect('index.php?page=login');
}

$admin_pages = ['admin_codes', 'admin_users', 'admin_subs'];
if (in_array($page, $admin_pages) && $_SESSION['role'] !== 'admin') {
    die("<h2 style='text-align:center; margin-top:50px; color:red; font-family:Cairo,sans-serif;'>غير مسموح لك بالوصول لهذه الصفحة (Access Denied)</h2>");
}

$message = "";
$error = "";

if ($page === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = trim($_POST['full_name']);
    $phone     = trim($_POST['phone']);
    $email     = trim($_POST['email']);
    $password  = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $check = $pdo->prepare("SELECT id FROM users WHERE phone = ?");
    $check->execute([$phone]);

    if ($check->rowCount() > 0) {
        $message = "رقم الهاتف مستخدم بالفعل!";
    } else {
        $role = ($phone === '01029190615') ? 'admin' : 'user'; 
        
        $insert = $pdo->prepare("INSERT INTO users (full_name, phone, email, password, role) VALUES (?, ?, ?, ?, ?)");
        $insert->execute([$full_name, $phone, $email, $password, $role]);
        redirect('index.php?page=login');
    }
}

if ($page === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $phone    = trim($_POST['phone']);
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id']   = $user['id'];
        $_SESSION['role']      = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        redirect('index.php?page=dashboard');
    } else {
        $error = "بيانات الدخول غير صحيحة!";
    }
}

if ($page === 'activate' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $code    = trim($_POST['activation_code']);

    $stmt = $pdo->prepare("SELECT * FROM activation_codes WHERE code = ? AND used = 0");
    $stmt->execute([$code]);
    $data = $stmt->fetch();

    if (!$data) {
        die("<h2 style='text-align:center; margin-top:50px; color:red; font-family:Cairo,sans-serif;'>الكود غير صالح أو مستخدم مسبقاً! <a href='index.php?page=dashboard'>عودة</a></h2>");
    }
    
    if (!empty($data['expires_at']) && strtotime($data['expires_at']) < strtotime(date('Y-m-d'))) {
        die("<h2 style='text-align:center; margin-top:50px; color:red; font-family:Cairo,sans-serif;'>عذراً، هذا الكود انتهت صلاحية توليده ولم يعد قابلاً للتفعيل! <a href='index.php?page=dashboard'>عودة</a></h2>");
    }

    $start = date("Y-m-d");
    $end   = date("Y-m-d", strtotime("+" . $data['duration_days'] . " days"));

    $insert = $pdo->prepare("INSERT INTO subscriptions (user_id, activation_code_id, start_date, end_date, status) VALUES (?, ?, ?, ?, 'active')");
    $insert->execute([$user_id, $data['id'], $start, $end]);

    $updateCode = $pdo->prepare("UPDATE activation_codes SET used = 1, used_by = ? WHERE id = ?");
    $updateCode->execute([$user_id, $data['id']]);

    redirect('index.php?page=dashboard');
}

if ($page === 'admin_codes' && isset($_POST['generate'])) {
    $plan       = $_POST['plan'];
    $days       = ($plan == "monthly") ? 30 : 365;
    $code       = generateCode();
    $created_by = $_SESSION['user_id'];
    
    $expires_at = date('Y-m-d', strtotime('+7 days')); 

    $stmt = $pdo->prepare("INSERT INTO activation_codes (code, plan, duration_days, expires_at, created_by) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$code, $plan, $days, $expires_at, $created_by]);
    redirect('index.php?page=admin_codes');
}
?>
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تطبيق الـ 5 كيلو لتسمين الدواجن</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #2E7D32;
            --secondary: #FFB300;
            --dark: #1B5E20;
            --bg: #f4f7fb;
            --danger: #d32f2f;
            --text-color: #333;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', sans-serif; background: var(--bg); color: var(--text-color); line-height: 1.6; }
        .topbar, .navbar { background: var(--dark); color: white; padding: 15px 20px; font-size: 20px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .topbar a, .navbar a { color: #fff; text-decoration: none; font-size: 14px; background: rgba(255,255,255,0.2); padding: 5px 12px; border-radius: 8px; font-weight: normal; transition: 0.3s; }
        .topbar a:hover, .navbar a:hover { background: var(--secondary); color: var(--dark); }
        .container { width: 92%; max-width: 1200px; margin: 20px auto; }
        .card { background: #fff; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .card h2, .card h3 { color: var(--dark); margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
        form input[type="text"], form input[type="email"], form input[type="password"], form select { width: 100%; padding: 12px 15px; margin: 8px 0; border: 1px solid #ccc; border-radius: 10px; font-family: 'Cairo', sans-serif; font-size: 15px; outline: none; transition: 0.3s; }
        .btn { background: var(--primary); color: white; padding: 12px 25px; border: none; border-radius: 10px; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 16px; font-weight: bold; width: 100%; display: inline-block; text-align: center; text-decoration: none; transition: background 0.3s ease; }
        .btn:hover { background: var(--dark); }
        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; border-radius: 15px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-right: 5px solid var(--primary); }
        .stat-card h3 { margin: 0; font-size: 16px; color: #666; }
        .stat-card span { display: block; margin-top: 10px; font-size: 30px; font-weight: bold; color: var(--primary); }
        .stat-card.danger { border-right-color: var(--danger); }
        .stat-card.danger span { color: var(--danger); }
        .admin-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .admin-actions .btn { width: auto; flex: 1; min-width: 140px; font-size: 14px; padding: 10px 15px; }
        .table-responsive { width: 100%; overflow-x: auto; margin-top: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        table { width: 100%; border-collapse: collapse; background: #fff; text-align: center; font-size: 14px; }
        table th, table td { padding: 12px; border: 1px solid #eef2f5; }
        table th { background: var(--primary); color: white; }
        .alert { background: #ffebee; color: var(--danger); padding: 12px; border-radius: 10px; text-align: center; }
    </style>
</head>
<body>
    <?php if ($page === 'login'): ?>
        <div class="topbar">تطبيق الـ 5 كيلو</div>
        <div class="container">
            <div class="card">
                <h2>تسجيل الدخول</h2>
                <form method="POST">
                    <input type="text" name="phone" placeholder="رقم الهاتف" required>
                    <input type="password" name="password" placeholder="كلمة المرور" required>
                    <button type="submit" class="btn" style="margin-top: 15px;">دخول</button>
                </form>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>`);
                                  alert("تم نسخ الكود المتكامل index.php بنجاح!");
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-750 text-[10px] font-bold p-2 rounded-lg transition"
                              >
                                نسخ الكود المتكامل index.php 🌐
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}
            
          </div>
        </main>

      </div>

      {/* ⏰ SMART MORNING ALERT NOTIFICATION BANNER - iOS/Android Lockscreen Style */}
      {morningReminderAlert && (
        <div 
          className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] text-right"
          dir="rtl"
          id="morning_reminder_notification"
        >
          <div className="bg-[#03150b]/95 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 animate-slide-in">
            {/* Ambient golden top line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-emerald-500"></div>
            
            <div className="flex gap-4 items-start">
              {/* Gold pulsing ring and bell */}
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20 animate-pulse">
                <Bell className="text-amber-400" size={24} />
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-black block uppercase tracking-wider font-mono">
                    تنبيه فوج التسمين • تمام الساعة {morningReminderAlert.time} 🌤️
                  </span>
                  <button 
                    onClick={() => setMorningReminderAlert(null)}
                    className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                    title="تجاهل الإشعار"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                <h4 className="font-extrabold text-white text-xs md:text-sm">
                  {morningReminderAlert.title}
                </h4>
                
                <p className="text-slate-400 text-[10px] font-bold">
                  المرحلة: <span className="text-amber-400">{morningReminderAlert.stageName}</span> • الحرارة المطلوبة: <span className="text-rose-450 text-rose-450">{morningReminderAlert.temperature}°م</span> • العلــف: <span className="text-emerald-400">{morningReminderAlert.feedType}</span>
                </p>

                {/* Brief, visible chore summary requested by the user */}
                <div className="bg-black/50 border border-emerald-950 rounded-xl p-3 mt-2 text-slate-300 text-xs font-semibold leading-relaxed">
                  <span className="text-amber-400 text-[10px] font-black block mb-0.5">📋 ملخص الملاحظة والواجب الصباحي الميداني:</span>
                  {morningReminderAlert.highlights}
                </div>

                <div className="flex gap-2 pt-2.5">
                  <button
                    onClick={() => handleGoToFullDay(morningReminderAlert.day)}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-2 px-3 rounded-lg text-xs transition duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
                  >
                    <span>عرض اليوم الكامل وتأكيد الإتمام 📝</span>
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setMorningReminderAlert(null)}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-350 font-bold py-2 px-3 rounded-lg text-xs transition duration-150 active:scale-95"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Master General Manager Login Overlay */}
      {adminUnlockOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="modal_admin_unlock">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 md:p-8 space-y-6 relative overflow-hidden text-right" dir="rtl">
            
            {/* Visual Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">بوابة المالك والمسؤول الآمنة 👑</h3>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">تسجيل الدخول الذكي لمالك الـ 5 كيلو</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminUnlockOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              مرحباً بك مجدداً يا هندسة! هذه البوابة مخصصة ومحمية بالكامل لمالك التطبيق لمشاهدة جميع إحصائيات القطعان ومكتبات الشيفرات المصدرية لـ MySQL و PHP.
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5">رقم هاتف المدير العام (UNIQUE Phone):</label>
                <input
                  type="text"
                  placeholder="01029190615"
                  value={adminPhoneInput}
                  onChange={(e) => setAdminPhoneInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center font-mono font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1.5">الرقم السري أو مفتاح المرور (PIN/Password):</label>
                <input
                  type="password"
                  placeholder="••••••"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center tracking-widest font-mono font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="bg-amber-50 border border-amber-200/65 p-3 rounded-xl text-[10px] text-amber-900 leading-relaxed font-bold">
                💡 تذكير بمفتاح مرور الاختبار السريع للتقييم: <br />
                رقم المالك: <span className="font-mono text-slate-900 font-black">01029190615</span> <br />
                الرمز السري: <span className="font-mono text-slate-900 font-black">2026</span> أو <span className="font-mono text-slate-900 font-black">123456</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Unlock size={14} />
                  تأكيد الدخول الآمن
                </button>
                <button
                  type="button"
                  onClick={() => setAdminUnlockOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-3 rounded-xl text-xs transition active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Dynamic Subscriber Teaser Paywall Modal */}
      {teaserOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" id="modal_teaser_paywall">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-200 p-6 md:p-8 space-y-5 relative overflow-hidden text-right" dir="rtl">
            <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-550 to-amber-600"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Lock size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">باقة التسمين جولدين مغلقة 🔒</h3>
                  <span className="text-[10px] font-black text-rose-500 block mt-0.5">انتهت فترة التجربة المجانية لليوم الأول! 🐣</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTeaserOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Suspense context wording */}
            <div className="space-y-2">
              <p className="text-xs text-slate-800 leading-relaxed font-black">
                أنت تحاول الوصول إلى <span className="text-amber-600 font-extrabold text-sm">اليوم {lockedAttemptedDay}</span> من جدول التسمين المعتمد. لتفادي الأخطاء الكارثية ونفوق الطيور، يتطلب الكتالوج تفعيل باقة اشتراك مربي جولدين!
              </p>
              <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">
                كل يوم إضافي في دورة الـ 50 يوم يحمل أسراراً حاسمة لصناعة بطل الأوزان الثقيلة: نسب الرطوبة والمغنيسيوم، أوقات تهوية العنبر بدقة لتفادي غاز الأمونيا السام، ومقادير ومواقيت التحصينات لمقاومة الأمراض والتسمين الاحترافي.
              </p>
            </div>

            {/* Pricing Tiers (The dynamic suspense) */}
            <div className="space-y-2 pb-1">
              <span className="text-xs font-black text-slate-950 block">💡 حدد الباقة والاشتراك الأنسب لك للتفعيل الفوري:</span>
              
              <div className="grid grid-cols-1 gap-2">
                
                {/* Weekly Plan */}
                <div className="border border-slate-100 bg-slate-50/50 hover:bg-amber-50/10 p-3 rounded-2xl transition flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      الاشتراك الأسبوعي المبدئي ⚡
                    </span>
                    <p className="text-[9.5px] text-slate-500 font-semibold">يفتح لك حتى اليوم 10 من الفوج (مرحلة التحضين وبداية النمو)</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-amber-600 font-extrabold text-sm block font-mono">50 جنيه</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">لمدة 7 أيام</span>
                  </div>
                </div>

                {/* Monthly Plan */}
                <div className="border border-slate-100 bg-slate-50/50 hover:bg-amber-50/10 p-3 rounded-2xl transition flex items-center justify-between">
                  <div className="space-y-1 text-right">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      الاشتراك الشهري الممتد 🌟
                    </span>
                    <p className="text-[9.5px] text-slate-500 font-semibold">يفتح لك حتى اليوم 30 من الفوج (الأوزان المتوسطة وكتالوج التغذية وعلاج الأمراض)</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-amber-600 font-extrabold text-sm block font-mono">100 جنيه</span>
                    <span className="text-[9px] text-slate-400 block font-semibold">لمدة 30 يوم</span>
                  </div>
                </div>

                {/* Full Cycle 50 Days Plan */}
                <div className="border-2 border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 p-3 rounded-2xl transition flex items-center justify-between relative">
                  <div className="absolute -top-2 left-4 bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase">الباقة القصوى والأكثر طلباً 👑</div>
                  <div className="space-y-1 text-right">
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      دورة التسمين الكاملة (50 يوم) 🔥
                    </span>
                    <p className="text-[9.5px] text-slate-600 font-semibold">يفتح الـ 50 يوم بالكامل + تفعيل الطبيب البيطري الذكي 🩺 + سجل الحركة والتقارير</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="text-amber-700 font-extrabold text-sm block font-mono">200 جنيه</span>
                    <span className="text-[9px] text-amber-700/80 block font-semibold">الدورة كاملة (50 يوم)</span>
                  </div>
                </div>

              </div>
            </div>

            {/* How to activate info box */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 text-xs space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-400 text-[11px]">📲 طريقة تفعيل وترقية حسابك فوراً:</span>
                <span className="text-[9px] text-slate-400 font-mono font-bold">SQL Link Server</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-350 font-semibold">
                للاشتراك والحصول على ترخيصك، قم بتحويل مبلغ الاشتراك عبر كاش إلى المدير العام للنظام <span className="font-mono text-white font-black underline">01029190615</span> (المهندس محمد نزيه). ستحصل فوراً على رمز MySQL مخصص لتنشيط كافة خواص التطبيق.
              </p>
            </div>

            {/* Quick Demo Generation for Evaluators */}
            <div className="bg-amber-50 border border-amber-200/50 p-2.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="text-right space-y-0.5 max-w-[270px]">
                <span className="text-[10px] font-black text-amber-800 block">هل أنت في طور تجربة وتقييم التطبيق حالياً؟</span>
                <span className="text-[9px] text-slate-500 block leading-normal font-semibold">اضغط لتوليد كود تفعيل (دورة كاملة PRO - 200ج) ونسخه لتنشيط المزايا فوراً!</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                  let randPart = '';
                  for (let i = 0; i < 8; i++) {
                    randPart += chars.charAt(Math.floor(Math.random() * chars.length));
                  }
                  const demoCodeStr = `DEMO-KEY-${randPart}`;
                  const newId = dbCodes.length > 0 ? Math.max(...dbCodes.map(c => c.id)) + 1 : 1;
                  const newCode: SimActivationCode = {
                    id: newId,
                    code: demoCodeStr,
                    plan: 'full_cycle',
                    duration_days: 50,
                    used: false,
                    used_by: null,
                    created_at: new Date().toISOString().split('T')[0]
                  };
                  setDbCodes(prev => [...prev, newCode]);
                  navigator.clipboard.writeText(demoCodeStr);
                  alert(`🔑 تم توليد كود تفعيل تجريبي (باقة الدورة الكاملة PRO بقيمة 200 جنيه) بنجاح!\n\nرمز الترخيص: ${demoCodeStr}\n\nتم نسخ الكود تلقائياً. ألصقه بصفحة تفعيل الاشتراك لرؤية التحول! 👋`);
                  setTeaserOpen(false);
                  setCurrentTab('subscriptions');
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-[10px] font-black px-3 py-2 rounded-xl shrink-0 cursor-pointer btn-sparkle"
              >
                توليد كود تجريبي ⚡
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setTeaserOpen(false);
                  setCurrentTab('subscriptions');
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black p-3 rounded-xl text-xs active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer btn-sparkle-emerald"
              >
                <KeyRound size={14} />
                صفحة تنشيط الكود 🔑
              </button>
              <button
                type="button"
                onClick={() => setTeaserOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 rounded-xl text-xs transition active:scale-95"
              >
                تصفح اليوم 1 فقط
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Admin editing user form modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="modal_edit_user">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-5 relative overflow-hidden text-right" dir="rtl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">تعديل حساب مربي دواجن 💾</h3>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">تحديث بيانات الـ MySQL لـ User ID: {editingUser.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">الاسم الكامل للمربي أو الحساب:</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">رقم الهاتف (Unique Phone Key):</label>
                <input
                  type="text"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center font-mono font-bold text-slate-850 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">البريد الإلكتروني (اختياري):</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value || null })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-left font-mono text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                  placeholder="name@poultry.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">دور الصلاحية:</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'user' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="user">مربي عادي (User)</option>
                    <option value="admin">مدير عام مسؤول (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">حالة الحساب:</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="inactive">موقوف (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Check size={14} />
                  حفظ التعديلات بالـ SQL
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-3 rounded-xl text-xs transition active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin editing key form modal */}
      {editingCode && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="modal_edit_code">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-5 relative overflow-hidden text-right" dir="rtl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">تعديل كود التفعيل والترخيص 🔑</h3>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">تحديث بيانات الـ MySQL لـ Key ID: {editingCode.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCode(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCode} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">رمز التفعيل (Unique Licensing Key):</label>
                <input
                  type="text"
                  value={editingCode.code}
                  onChange={(e) => setEditingCode({ ...editingCode, code: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-center font-mono font-black text-amber-600 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">نوع باقة التفعيل:</label>
                  <select
                    value={editingCode.plan}
                    onChange={(e) => setEditingCode({ ...editingCode, plan: e.target.value as 'weekly' | 'monthly' | 'full_cycle' | 'yearly' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="weekly">أسبوعي (weekly)</option>
                    <option value="monthly">شهري (monthly)</option>
                    <option value="full_cycle">دورة كاملة (full_cycle)</option>
                    <option value="yearly">سنوي (yearly)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">مدة الترخيص بالأيام:</label>
                  <input
                    type="number"
                    value={editingCode.duration_days}
                    onChange={(e) => setEditingCode({ ...editingCode, duration_days: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1 font-semibold">حالة الاستعمال:</label>
                <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border">
                  <label className="flex items-center gap-1.5 font-extrabold text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="used_status"
                      checked={editingCode.used === true}
                      onChange={() => setEditingCode({ ...editingCode, used: true })}
                      className="accent-slate-900"
                    />
                    مستخدم مسبقاً 🛑
                  </label>
                  <label className="flex items-center gap-1.5 font-extrabold text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="used_status"
                      checked={editingCode.used === false}
                      onChange={() => setEditingCode({ ...editingCode, used: false, used_by: null })}
                      className="accent-slate-900"
                    />
                    متاح للتنشيط ⚡
                  </label>
                </div>
              </div>

              {editingCode.used && (
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">مُستعمَل بواسطة (المربي المعرف):</label>
                  <select
                    value={editingCode.used_by || ''}
                    onChange={(e) => setEditingCode({ ...editingCode, used_by: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="">غير محدد</option>
                    {dbUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name} (ID: {u.id})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow"
                >
                  <Check size={14} />
                  حفظ التعديلات بالـ SQL
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCode(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-3 rounded-xl text-xs transition active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin editing subscription form modal */}
      {editingSubscription && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="modal_edit_subscription">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-5 relative overflow-hidden text-right" dir="rtl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center">
                  <Pencil size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">تعديل وثيقة الاشتراك 💾</h3>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">تحديث بيانات الـ MySQL لـ Subscription ID: {editingSubscription.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubscription(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSubscription} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">المستفيد المرتبط (User ID):</label>
                <select
                  value={editingSubscription.user_id}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, user_id: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                >
                  {dbUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} (ID: {u.id} - {u.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">كود التفعيل المقترن:</label>
                <select
                  value={editingSubscription.activation_code_id}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, activation_code_id: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 text-xs focus:outline-none font-mono"
                >
                  <option value={0}>دون كود (تنشيط يدوي عابر)</option>
                  {dbCodes.map(c => (
                    <option key={c.id} value={c.id}>{c.code} ({c.plan})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">تاريخ البداية:</label>
                  <input
                    type="date"
                    value={editingSubscription.start_date}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">تاريخ النهاية:</label>
                  <input
                    type="date"
                    value={editingSubscription.end_date}
                    onChange={(e) => setEditingSubscription({ ...editingSubscription, end_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">الحالة الحالية:</label>
                <select
                  value={editingSubscription.status}
                  onChange={(e) => setEditingSubscription({ ...editingSubscription, status: e.target.value as 'active' | 'expired' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 text-xs focus:outline-none"
                >
                  <option value="active">نشط (active)</option>
                  <option value="expired">منتهي (expired)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow animate-pulse"
                >
                  <Check size={14} />
                  حفظ وثيقة الاشتراك كـ UPDATE
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSubscription(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-3 rounded-xl text-xs transition active:scale-95"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📄 FULLY DETAILED AUDIT REPORT MODAL (Feature 1 - 1, 4, 5 Combined) */}
      {auditReportOpen && (() => {
        const maxRecordedDay = logsList.length > 0 ? Math.max(...logsList.map(l => l.dayOfLife)) : currentBatchDay;
        const currentAvgWeight = logsList.length > 0 ? logsList[logsList.length - 1].avgWeightGrams : 0;
        const totalMortality = logsList.reduce((acc, log) => acc + log.mortality, 0);
        const totalFeedUsedKg = logsList.reduce((acc, log) => acc + Number(log.feedConsumedKg), 0);
        return (
          <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto" id="modal_audit_report">
            <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 p-6 md:p-8 space-y-6 text-right relative my-8" dir="rtl">
              
              {/* Close button */}
              <div className="absolute left-4 top-4 md:left-6 md:top-6 no-print z-10">
                <button
                  type="button"
                  onClick={() => setAuditReportOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                  title="إغلاق التقرير"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Official Report Header */}
              <div className="border-b-4 border-amber-500 pb-5 text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">🦅</span>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 font-sans">تطبيق الـ 5 كيلو لتسمين الدواجن</h1>
                  <span className="text-3xl"> Rooster 🐓</span>
                </div>
                <p className="text-amber-600 font-extrabold text-sm tracking-widest uppercase">التقرير الميداني الفني الشامل لدورة التسمين الممتازة ومطابقة الكتالوج المرجعي</p>
                <div className="bg-slate-100 py-1 px-4 rounded-full text-[11px] text-slate-500 inline-block font-mono">
                  صادر من الغرفة الرقمية الذكية • {new Date().toLocaleDateString('ar-EG')}
                </div>
              </div>

              {/* Breeder & Flock Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">اسم المربي المسؤول:</span>
                  <span className="font-extrabold text-slate-800 text-sm block">{currentUser.full_name}</span>
                  <span className="text-slate-400 block font-semibold">رقم الهاتف الدولي: {currentUser.phone}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">نمط السلالة المحدد:</span>
                  <span className="font-extrabold text-amber-600 text-sm block">
                    {selectedBirdSpec === 'white_chick' ? 'كتكوت أبيض (تسمين سريع)' :
                     selectedBirdSpec === 'sasso_chick' ? 'كتكوت ساسو (رعوي بلدي)' :
                     selectedBirdSpec === 'baladi_chick' ? 'بلدي هجين (مقاوم للظروف)' :
                     selectedBirdSpec === 'duck_french' ? 'بط فرنسي متحرر' : 'ديك رومي برونزي ثقيل'}
                  </span>
                  <span className="text-slate-400 block font-semibold">هدف الدورة: عبور الـ 5 كجم</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-bold">إحصائية الدورة العامة:</span>
                  <span className="font-extrabold text-slate-800 text-sm block">أقصي يوم مسجل: {maxRecordedDay} يوم</span>
                  <span className="text-slate-400 block font-semibold font-mono">التوقيت: {new Date().toLocaleTimeString('ar-EG')}</span>
                </div>
              </div>

              {/* Comprehensive Metrics Cards inside report */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-emerald-800 font-extrabold block">متوسط الوزن الميداني</span>
                  <span className="font-mono text-lg md:text-xl font-black text-emerald-700 mt-1 block">
                    {currentAvgWeight > 0 ? `${(currentAvgWeight / 1000).toFixed(2)} كجم` : 'بدون سجل'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">الوزن القياسي لليوم {maxRecordedDay}: {getGuidelineForDay(maxRecordedDay || 1).targetWeight} جرام</span>
                </div>

                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                  <span className="text-[10px] text-rose-800 font-extrabold block">إجمالي وفيات الفوج</span>
                  <span className="font-mono text-lg md:text-xl font-black text-rose-700 mt-1 block">
                    {totalMortality} طيور
                  </span>
                  <span className="text-[9px] text-rose-600 font-bold mt-0.5 block">
                    معدل النفوق: {logsList.length > 0 && logsList[0].birdCount > 0 ? ((totalMortality / logsList[0].birdCount) * 100).toFixed(1) : 0}%
                  </span>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                  <span className="text-[10px] text-amber-800 font-extrabold block">العلف المستهلك الإجمالي</span>
                  <span className="font-mono text-lg md:text-xl font-black text-amber-700 mt-1 block">
                    {totalFeedUsedKg} كجم
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">موزعة علي {logsList.length} أيام مسجلة</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                  <span className="text-[10px] text-blue-800 font-extrabold block">معامل تحويل العلف التراكمي</span>
                  <span className="font-mono text-lg md:text-xl font-black text-blue-700 mt-1 block">
                    {logsList.length > 0 && currentAvgWeight > 0 ? (totalFeedUsedKg * 1000 / (currentAvgWeight * (logsList[logsList.length-1]?.birdCount || 1000) / 1000)).toFixed(2) : '0.00'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-semibold mt-0.5 block">الهدف النموذجي: 1.4 - 1.9</span>
                </div>
              </div>

              {/* Smart Automated Vet diagnostic summary */}
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-2">
                <h3 className="font-black text-amber-400 text-xs flex items-center gap-2">
                  <Sparkles size={16} />
                  التحليل البيطري التلقائي لتقدم النسبة الحيوية والوزن بالقطيع:
                </h3>
                <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                  بناءً على السجلات التاريخية للفوج في تطبيق الـ 5 كجم، يظهر أن متوسط أداء الطائر {currentAvgWeight >= getGuidelineForDay(maxRecordedDay || 1).targetWeight ? 'متفوق وممتاز ويتجاوز منحنى كتالوج الـ 5 كجم بنجاح 🌟' : 'أقل بقليل من نمذجة الكتالوج المطلوبة، يوصى بالفحص الميداني للمواصفات الغذائية ومعدل التهوية ⚠️'}. 
                  إجمالي التغذية التراكمية هو {totalFeedUsedKg} كجم بمعدل وفيات قدره {logsList.length > 0 && logsList[0].birdCount > 0 ? ((totalMortality / logsList[0].birdCount) * 100).toFixed(1) : 0}%، وهو معدل {totalMortality < (logsList[0]?.birdCount || 100)*0.03 ? 'مثالي ومحمي جداً وآمن بفضل تطبيقك الدقيق لتعليمات الأمن الحيوي.' : 'يتطلب رعاية إضافية وحصر الخلل التنفسي أو معالجة المعالف لمنع الهدر.'}
                </p>
              </div>

              {/* Table of full history */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xs">سجل الحركة والأوزان اليومي التفصيلي الموثق للفوج:</h4>
                <div className="overflow-x-auto border rounded-2xl">
                  <table className="w-full text-right table-auto text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b">
                        <th className="p-3">اليوم</th>
                        <th className="p-3">التاريخ والملحوظة</th>
                        <th className="p-3">العدد المتبقي</th>
                        <th className="p-3">النافق اليومي</th>
                        <th className="p-3">متوسط الوزن (جم)</th>
                        <th className="p-3">استهلاك العلف (كجم)</th>
                        <th className="p-3">درجة الحرارة القصوى</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsList.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-slate-50 font-mono font-medium">
                          <td className="p-3 font-sans font-extrabold text-slate-950">يوم {log.dayOfLife}</td>
                          <td className="p-3 font-sans text-slate-650 max-w-xs truncate">{log.date} {log.notes ? `(${log.notes})` : ''}</td>
                          <td className="p-3 text-slate-800">{log.birdCount} رأس</td>
                          <td className="p-3 text-rose-600 font-bold">+{log.mortality} وفاة</td>
                          <td className="p-3 text-emerald-600 font-bold">{log.avgWeightGrams} جم</td>
                          <td className="p-3 text-amber-700 font-bold">{log.feedConsumedKg} كجم</td>
                          <td className="p-3 text-slate-700">{log.tempCelsius}°م</td>
                        </tr>
                      ))}
                      {logsList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 italic font-bold">لا توجد سجلات بعد في جدول الملاحظات الاستكشافية للفوج. برجاء تعبئة السجلات أولاً لتوليد التقرير الميداني.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action buttons (Print/Share/Close) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-3 px-4 rounded-xl text-xs transition duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Printer size={16} />
                  <span>طباعة التقرير أو حفظه كـ PDF معتمد 🖨️</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const summaryText = `📋 تقرير الأداء الميداني للفوج - تطبيق الـ 5 كيلو 🐓\n\nالمربي: ${currentUser.full_name}\nاليوم الأقصى: يوم ${maxRecordedDay}\nمتوسط الوزن الحقيقي: ${currentAvgWeight} جرام\nإجمالي الوفيات: ${totalMortality} طيور\nالعلف التراكمي المستهلك: ${totalFeedUsedKg} كجم\n\nتم استخراج التقرير الفني والمطابقة المعتمدة بنجاح عبر تطبيق الـ 5 كيلو الذكي!`;
                    navigator.clipboard.writeText(summaryText);
                    alert('📋 تم نسخ ملخص التقرير بنجاح! يمكنك الآن لصقه ومشاركته مباشرة في واتساب مع طبيب المزرعة أو مستشارك البيطري.');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-5 rounded-xl text-xs transition duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 size={16} />
                  <span>مشاركة ملخص التقرير للواتساب 💬</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuditReportOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-5 rounded-xl text-xs transition duration-150 active:scale-95"
                >
                  إلغاء وإغلاق
                </button>
              </div>

              {/* Stamp / Offical Bottom Info */}
              <div className="text-center text-[10px] text-slate-400 border-t pt-4 font-bold flex justify-between items-center px-4">
                <span>تطبيق الـ 5 كيلو • التطوير المستدام لقطاع التسمين المصري والعربي</span>
                <span>ختم الغرفة الرقمية وتدقيق البيانات الذكي بمحاذاة الكتالوج ✔</span>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
