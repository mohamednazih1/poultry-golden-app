import React from 'react';
import { 
  Calculator, 
  Activity, 
  ShieldAlert, 
  BookOpen, 
  MessageSquare, 
  History, 
  X, 
  CheckCircle,
  TrendingDown,
  ChevronLeft,
  KeyRound,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole?: 'admin' | 'user';
  onClickAdminPortal?: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, isOpen, setIsOpen, userRole = 'user', onClickAdminPortal }: SidebarProps) {
  const allMenuItems = [
    { id: 'schedule', name: 'دليل التسمين اليومي', icon: Activity, desc: 'من عمر يوم حتى 5+ كجم' },
    { id: 'calculator', name: 'الحاسبة الذكية & FCR', icon: Calculator, desc: 'حساب الأوزان وفقد العلف' },
    { id: 'exchanges-directory', name: 'بورصات الشرقية اليومية 📊', icon: Building2, desc: 'أسعار مكاتب ههيا، بلبيس والزقازيق' },
    { id: 'vet-chat', name: 'المستشار البيطري الذكي', icon: MessageSquare, desc: 'مستشار مدعوم بالذكاء الاصطناعي' },
    { id: 'vaccines', name: 'برنامج التحصينات المعتمد', icon: CheckCircle, desc: 'اللقاحات حسب السن والنوع' },
    { id: 'diseases', name: 'موسوعة الأمراض والعلاجات', icon: ShieldAlert, desc: 'تشخيص سريع وطرق مكافحة' },
    { id: 'logs', name: 'سجل المتابعة والقطيع', icon: History, desc: 'حفظ ومتابعة أوزان دورتك' },
    { id: 'subscriptions', name: 'إدارة التراخيص وقاعدة بيانات MySQL 👑', icon: KeyRound, desc: 'لوحة التحكم والشيفرات المصدرية للربط الكلي' },
  ];

  // Filter items: Only admins can see the subscription/MySQL controller tab!
  const menuItems = userRole === 'admin' 
    ? allMenuItems 
    : allMenuItems.filter(item => item.id !== 'subscriptions');

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-[#031109] text-slate-105 flex flex-col border-l border-emerald-950
        transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-emerald-950 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Cute GOLDENPOULTRY Chicken Logo from Image 1 */}
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md border border-slate-700/20">
                <svg viewBox="0 0 100 100" className="w-10 h-10 text-emerald-700 fill-current" xmlns="http://www.w3.org/2000/svg">
                  {/* Hen Body, neck, head, tail feather */}
                  <path d="M45,25 C45,18 52,18 55,20 C58,18 63,18 63,24 C63,25 64,26 65,27 C67,26 69,28 68,30 C69,32 68,34 66,35 C68,43 66,51 60,56 C57,59 52,61 46,62 C32,61 22,54 18,42 C22,41 26,44 28,45 C30,41 33,38 38,37 C34,42 35,48 39,51 C41,53 45,53 49,50 C51,48 52,44 51,40 C46,42 41,40 39,36 C41,31 46,28 51,31 C52,32 53,32 54,31 C54,29 52,28 50,28 C47,28 45,26 45,25 Z" />
                  {/* Eye */}
                  <circle cx="58" cy="27" r="2" fill="#fff" />
                  {/* Beak */}
                  <path d="M63,28 L66,30 L63,32 Z" />
                  {/* Little baby chick sitting next to her */}
                  <path d="M72,55 C72,51 76,51 78,52 C79,52 80,53 81,54 C82,53 83,54 83,55 C84,56 83,57 82,58 C83,59 81,61 78,61 C73,61 72,58 72,55 Z" />
                  <circle cx="77" cy="54" r="0.8" fill="#fff" />
                </svg>
              </div>
              <div className="text-right">
                <h1 className="font-black text-xs tracking-[0.2em] text-[#648f80] dark:text-emerald-400 font-mono">GOLDENPOULTRY</h1>
                <p className="text-[10px] text-slate-400 font-bold">تطبيق التسمين العملاق ٥ كجم</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false); // Close on mobile
                }}
                className={`w-full flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 text-right ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/10' 
                    : 'hover:bg-emerald-950/45 text-slate-300 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-slate-950/20' : 'bg-emerald-950/60'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 text-right">
                  <span className="block text-sm font-semibold">{item.name}</span>
                  <span className={`block text-[11px] mt-0.5 ${isActive ? 'text-slate-900/80' : 'text-slate-400'}`}>
                    {item.desc}
                  </span>
                </div>
                <ChevronLeft size={16} className={`opacity-60 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
              </button>
            );
          })}

          {/* Secure Admin General Manager login gateway button */}
          <div className="pt-4 border-t border-slate-800/60 mt-4">
            {userRole === 'admin' ? (
              <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-black text-emerald-400 block tracking-wider">أنت تتصفح كمدير عام النظام 👑</span>
                <button
                  type="button"
                  onClick={onClickAdminPortal}
                  className="text-[9.5px] text-rose-400 hover:text-rose-300 underline font-extrabold cursor-pointer block mx-auto pt-1"
                >
                  تسجيل الخروج من لوحة المسؤول 🚪
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onClickAdminPortal}
                className="w-full bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-amber-400 p-2.5 rounded-xl border border-dashed border-slate-800 transition duration-150 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
              >
                <span>🔑 لوحة الملاك والمشرفين</span>
              </button>
            )}
          </div>
        </nav>

        {/* Footer / Badge */}
        <div className="p-4 border-t border-emerald-950 bg-black/45 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>دليل التسمين العملاق المطور 2026</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">نسخة بيطرية معتمدة ومتكاملة</p>
        </div>
      </aside>
    </>
  );
}
