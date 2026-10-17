'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  const t = {
    bn: {
      title: 'সেফটি ড্যাশবোর্ড',
      subtitle: '২০কিউব লজিস্টিকস - নিরাপত্তা ও কমপ্লায়েন্স পজিটিভ ট্র্যাকার',
      scoreLabel: 'আপনার সেফটি স্কোর',
      completedLabel: 'সম্পন্ন কোর্স',
      ongoingLabel: 'চলমান প্রশিক্ষণ',
      certificatesLabel: 'অর্জিত সনদপত্র',
      alertTitle: 'জরুরি নিরাপত্তা নির্দেশিকা (PPE)',
      alertDesc: 'ফ্লোরে প্রবেশের পূর্বে অবশ্যই হেলমেট এবং সেফটি জুতো পরিধান করুন। কোনো দুর্ঘটনা দেখলে অবিলম্বে অ্যালার্ম বোতাম চাপুন।',
      moduleTitle: 'আপনার সেফটি ট্রেনিং মডিউল',
      switchLang: 'English',
      logout: 'লগআউট',
      viewCertBtn: '📜 সার্টিফিকেট দেখুন',
      continueBtn: 'চালিয়ে যান (৬০%)',
      startBtn: 'ট্রে‌নিং শুরু করুন',
    },
    en: {
      title: 'Safety Dashboard',
      subtitle: '20Cube Logistics - Safety & Compliance Tracker',
      scoreLabel: 'Your Safety Score',
      completedLabel: 'Completed courses',
      ongoingLabel: 'Ongoing training',
      certificatesLabel: 'Certificates earned',
      alertTitle: 'Emergency Safety Instructions (PPE)',
      alertDesc: 'Always wear a helmet and safety shoes when entering the floor. If you see an accident, press the alarm button immediately.',
      moduleTitle: 'Your Safety Training Module',
      switchLang: 'বাংলা',
      logout: 'Logout',
      viewCertBtn: '📜 View certificate',
      continueBtn: 'Continue (60%)',
      startBtn: 'Start training',
    },
  }[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">
            {t.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-800 transition-all flex items-center gap-1.5"
          >
            🌐 {t.switchLang}
          </button>
          <Link
            href="/login"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold px-3.5 py-2 rounded-xl border border-red-500/20 transition-all"
          >
            {t.logout}
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">{t.scoreLabel}</p>
              <p className="text-2xl font-black text-amber-400 font-mono mt-1">95%</p>
            </div>
            <span className="text-2xl">⭐</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">{t.completedLabel}</p>
              <p className="text-2xl font-black text-emerald-400 font-mono mt-1">1</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">{t.ongoingLabel}</p>
              <p className="text-2xl font-black text-amber-500 font-mono mt-1">1</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">{t.certificatesLabel}</p>
              <p className="text-2xl font-black text-purple-400 font-mono mt-1">1</p>
            </div>
            <span className="text-2xl">📜</span>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-xs font-bold text-amber-400">{t.alertTitle}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{t.alertDesc}</p>
          </div>
        </div>

        {/* Safety Training Modules */}
        <div>
          <h2 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
            📚 {t.moduleTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Module 1: Completed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2">
                  <span className="bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    ফায়ার সেফটি
                  </span>
                  <span>⏱️ ১৫ মিনিট</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-3">
                  কর্মক্ষেত্রে প্রাথমিক ফায়ার সেফটি ও ড্রিল
                </h3>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-5">
                  <div className="bg-emerald-500 h-full w-full"></div>
                </div>
              </div>

              {/* সরাসরি সার্টিফিকেট পেজের লিংক */}
              <Link
                href="/certificate"
                className="w-full bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-center shadow-lg"
              >
                {t.viewCertBtn}
              </Link>
            </div>

            {/* Module 2: In Progress */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2">
                  <span className="bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    মেশিন নিরাপত্তা
                  </span>
                  <span>⏱️ ২০ মিনিট</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-3">
                  মেশিনারি সেফটি ও জরুরি সেফটি লকআউট (LOTO)
                </h3>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-5">
                  <div className="bg-amber-500 h-full w-[60%]"></div>
                </div>
              </div>

              {/* কুইজ পেজের লিংক */}
              <Link
                href="/quiz"
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-center shadow-lg"
              >
                {t.continueBtn}
              </Link>
            </div>

            {/* Module 3: Not Started */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2">
                  <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    কেমিক্যাল সেফটি
                  </span>
                  <span>⏱️ ২৫ মিনিট</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-3">
                  কেমিক্যাল হ্যান্ডলিং ও বিপজ্জনক বস্তু সচেতনতা
                </h3>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-5">
                  <div className="bg-slate-800 h-full w-0"></div>
                </div>
              </div>

              <Link
                href="/quiz"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-center shadow-lg"
              >
                {t.startBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}