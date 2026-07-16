import React from 'react';
import { motion } from 'framer-motion';
import { Scan, UserCheck, History, ShieldAlert, BookOpen } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, activeAllergensCount }) => {
  const tabs = [
    { id: 'scan', label: 'Tarama Paneli', icon: Scan },
    { id: 'profile', label: 'Alerjen Profilim', icon: UserCheck, badge: activeAllergensCount },
    { id: 'guide', label: 'Çölyak & Beslenme', icon: BookOpen },
    { id: 'history', label: 'Geçmiş Taramalar', icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 w-full pt-3 px-4 pb-2 backdrop-blur-md bg-[#F4F3EF]/90 border-b border-[#E5E2DA] shadow-xs">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab('scan')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/80 border border-[#E5E2DA] flex items-center justify-center shadow-xs group-hover:bg-white transition-colors">
            <ShieldAlert className="w-5 h-5 text-[#2D5A43]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight text-[#2C3E35]">
                GlutenGuard <span className="font-semibold text-[#2D5A43]">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#2D5A43]/10 text-[#2D5A43] border border-[#2D5A43]/20">
                Alerjen Asistanı
              </span>
            </div>
            <p className="text-[11px] text-[#5C6B64] hidden sm:block font-medium">Doğal & Akıllı Alerjen Rehberi</p>
          </div>
        </div>

        {/* Tab Navigation Pill Buttons */}
        <nav className="flex items-center p-1.5 rounded-2xl bg-[#EFECE6]/80 border border-[#E5E2DA] w-full sm:w-auto overflow-x-auto justify-between sm:justify-start gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 select-none ${
                  isActive ? 'text-white' : 'text-[#5C6B64] hover:text-[#2C3E35] hover:bg-white/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#2D5A43] rounded-xl shadow-xs"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#5C6B64]'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-[#2D5A43]' : 'bg-[#2D5A43]/10 text-[#2D5A43]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
