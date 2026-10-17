'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CertificatePage() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  // ডাইনামিক কোম্পানি ইনফো
  const [companyInfo, setCompanyInfo] = useState({
    name: '20Cube Logistics Limited',
    unit: 'কারখানা ইউনিট-২ / কমপ্লায়েন্স বিভাগ',
    address: 'ঢাকা, বাংলাদেশ',
    logo: '',
  });

  // কালার ও লেআউট সাইজ কনফিগারেশন স্টেট
  const [colors, setColors] = useState({
    borderColor: '#dc2626', // Default: Red
    titleColor: '#f59e0b',  // Default: Amber Gold
    nameColor: '#ffffff',   // Default: White
  });

  // সার্টিফিকেটের সাইজ ও ওরিয়েন্টেশন
  const [certSize, setCertSize] = useState<'landscape' | 'portrait' | 'square'>('landscape');

  // সার্টিফিকেটের ফিল্ডস
  const [certLayout, setCertLayout] = useState({
    workerNameBn: 'মো: রফিকুল ইসলাম',
    workerNameEn: 'Md. Rafiqul Islam',
    workerDesignationBn: 'সিনিয়র মেশিন অপারেটর',
    workerDesignationEn: 'Senior Machine Operator',
    workerId: 'EMP-8842',
    courseNameBn: 'মেশিনারি সেফটি ও জরুরি সেফটি লকআউট (LOTO)',
    courseNameEn: 'Machinery Safety & Emergency Safety Lockout (LOTO)',
  });

  const [isEditingLayout, setIsEditingLayout] = useState(false);

  const t = {
    bn: {
      backBtn: 'ড্যাশবোর্ডে ফিরে যান',
      downloadBtn: 'সার্টিফিকেট প্রিন্ট / ডাউনলোড করুন',
      editLayoutBtn: '⚙️ সাইজ, লেআউট ও কালার কনফিগার করুন',
      title: 'নিরাপত্তা ও কমপ্লায়েন্স সনদপত্র',
      subtitle: 'ডিজিটাল সেফটি ও কমপ্লায়েন্স ট্রেনিং প্ল্যাটফর্ম',
      presentedTo: 'এই মডিউল সফলভাবে সম্পন্ন করার জন্য প্রদান করা হলো',
      courseLabel: 'প্রশিক্ষণ মডিউল:',
      description: 'তিনি সফলভাবে কারখানা নিরাপত্তা বিধি, এলওটিও সেফটি গাইডলাইন এবং জরুরি প্রোটোকল সম্পর্কিত মূল্যায়ন পরীক্ষায় ১০০% কৃতিত্ব অর্জন করেছেন।',
      issueDate: 'ইস্যুর তারিখ:',
      validUntil: 'মেয়াদ শেষ:',
      dateVal: '১৬ অক্টোবর, ২০২৬',
      validVal: '১৫ অক্টোবর, ২০২৭ (১ বছর)',
      authSignature: 'অনুমোদিত স্বাক্ষরকারী',
      complianceOfficer: 'এইচআর ও কমপ্লায়েন্স বিভাগ',
      signatory1: 'সেফটি অডিট টিম',
      signatory2: 'মো: আকরাম হোসাইন',
      switchLang: 'English',
    },
    en: {
      backBtn: 'Return to Dashboard',
      downloadBtn: 'Print / Download Certificate',
      editLayoutBtn: '⚙️ Configure Size, Layout & Colors',
      title: 'SAFETY AND COMPLIANCE CERTIFICATE',
      subtitle: 'DIGITAL SAFETY & COMPLIANCE TRAINING PLATFORM',
      presentedTo: 'Awarded for successful completion of this module',
      courseLabel: 'TRAINING MODULE:',
      description: 'Has successfully completed the interactive workplace safety guidelines, emergency protocols, and evaluation assessment with excellence.',
      issueDate: 'Issue Date:',
      validUntil: 'Expiration:',
      dateVal: 'October 16, 2026',
      validVal: 'October 15, 2027 (1 year)',
      authSignature: 'Authorized Signatory',
      complianceOfficer: 'HR & Compliance Department',
      signatory1: 'Safety Audit Team',
      signatory2: 'Md. Akram Hossan',
      switchLang: 'বাংলা',
    },
  }[lang];

  const handlePrint = () => {
    window.print();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCompanyInfo({ ...companyInfo, logo: imageUrl });
    }
  };

  // সাইজ অনুযায়ী কন্টেইনার ক্লাস নির্ধারণ
  const getContainerDimensions = () => {
    switch (certSize) {
      case 'portrait':
        return 'max-w-2xl min-h-[900px] aspect-[1/1.41]';
      case 'square':
        return 'max-w-2xl aspect-square';
      case 'landscape':
      default:
        return 'max-w-4xl aspect-[1.41/1]';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center justify-center">
      {/* Top Action Bar */}
      <div className="w-full max-w-4xl flex flex-wrap justify-between items-center gap-3 mb-6 print:hidden">
        <Link
          href="/dashboard"
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2.5 rounded-xl border border-slate-800 transition-all flex items-center gap-2"
        >
          ⬅️ {t.backBtn}
        </Link>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsEditingLayout(!isEditingLayout)}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-xs flex items-center gap-2 shadow-md"
          >
            {t.editLayoutBtn}
          </button>
          <button
            onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all text-xs flex items-center gap-2"
          >
            🌐 {t.switchLang}
          </button>
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2"
          >
            🖨️ {t.downloadBtn}
          </button>
        </div>
      </div>

      {/* Configuration Control Panel */}
      {isEditingLayout && (
        <div className="w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl p-5 mb-6 print:hidden space-y-4 shadow-2xl">
          <h4 className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            ⚙️ সাইজ, লেআউট ও কালার প্যানেল (Size & Layout Configurator)
          </h4>

          {/* Size & Orientation Picker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                📐 পেপার/সার্টিফিকেট সাইজ (Certificate Dimensions):
              </label>
              <select
                value={certSize}
                onChange={(e) => setCertSize(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-400 font-semibold focus:outline-none"
              >
                <option value="landscape">A4 Landscape (আড়াআড়ি / স্ট্যান্ডার্ড)</option>
                <option value="portrait">A4 Portrait (লম্বালম্বি / পোর্টেট)</option>
                <option value="square">Square Kiosk View (বর্গাকার)</option>
              </select>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-3 gap-2 items-center">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">বর্ডার কালার</label>
                <input
                  type="color"
                  value={colors.borderColor}
                  onChange={(e) => setColors({ ...colors, borderColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">টাইটেল কালার</label>
                <input
                  type="color"
                  value={colors.titleColor}
                  onChange={(e) => setColors({ ...colors, titleColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">নেম ফন্ট কালার</label>
                <input
                  type="color"
                  value={colors.nameColor}
                  onChange={(e) => setColors({ ...colors, nameColor: e.target.value })}
                  className="w-full h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div>
              <label className="text-slate-400 block mb-1">কোম্পানির নাম</label>
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">কর্মীর নাম (বাংলা)</label>
              <input
                type="text"
                value={certLayout.workerNameBn}
                onChange={(e) => setCertLayout({ ...certLayout, workerNameBn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">পদবী (বাংলা)</label>
              <input
                type="text"
                value={certLayout.workerDesignationBn}
                onChange={(e) => setCertLayout({ ...certLayout, workerDesignationBn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col md:flex-row gap-3 items-center">
            <span className="text-[11px] text-slate-400">লোগো আপডেট:</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-blue-600 file:text-white hover:file:bg-blue-500"
            />
            <input
              type="text"
              placeholder="অথবা লোগোর URL দিন..."
              value={companyInfo.logo}
              onChange={(e) => setCompanyInfo({ ...companyInfo, logo: e.target.value })}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Dynamic Sized & Colored Certificate Canvas */}
      <div
        style={{ borderColor: colors.borderColor }}
        className={`w-full ${getContainerDimensions()} bg-slate-900 border-8 rounded-3xl p-2 md:p-3 shadow-2xl relative overflow-hidden text-center transition-all duration-300 flex flex-col justify-between print:border-4 print:p-2 print:text-black print:bg-white`}
      >
        <div className="border-2 border-slate-800 rounded-2xl p-6 md:p-10 relative bg-slate-900/95 flex-1 flex flex-col justify-between print:bg-white print:border-black/30">
          
          {/* Header Section */}
          <div>
            <div className="mb-4 flex flex-col items-center">
              {companyInfo.logo ? (
                <img
                  src={companyInfo.logo}
                  alt="Company Logo"
                  className="h-14 md:h-16 object-contain max-w-[220px] mb-2"
                />
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-2xl text-red-500 text-3xl mb-2 shadow-inner">
                  🛡️
                </div>
              )}
              <h3 className="text-base md:text-lg font-black text-slate-100 tracking-wider uppercase">
                {companyInfo.name}
              </h3>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                {companyInfo.unit} {companyInfo.address && `| ${companyInfo.address}`}
              </p>
            </div>

            {/* Certificate Title */}
            <h1
              style={{ color: colors.titleColor }}
              className="text-2xl md:text-3xl font-extrabold uppercase tracking-wider mb-1 transition-all"
            >
              {t.title}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 tracking-widest uppercase mb-4">
              {t.subtitle}
            </p>

            <div
              style={{ backgroundColor: colors.borderColor }}
              className="w-28 h-1 mx-auto mb-6 transition-all"
            ></div>

            <p className="text-xs md:text-sm text-slate-300 italic mb-2">
              {t.presentedTo}
            </p>

            {/* Worker Name & Details */}
            <h2
              style={{ color: colors.nameColor }}
              className="text-3xl md:text-4xl font-black mb-1 border-b border-slate-800 pb-1 inline-block px-8 transition-all"
            >
              {lang === 'bn' ? certLayout.workerNameBn : certLayout.workerNameEn}
            </h2>
            
            <p className="text-sm font-semibold text-amber-400 mt-1">
              {lang === 'bn' ? certLayout.workerDesignationBn : certLayout.workerDesignationEn}
            </p>
            <p className="text-xs font-mono text-blue-400 mt-0.5 mb-6">
              ID: {certLayout.workerId} | {companyInfo.unit}
            </p>
          </div>

          {/* Course Details Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 max-w-2xl mx-auto my-2 w-full">
            <p className="text-[11px] text-amber-400 uppercase font-bold mb-1">
              {t.courseLabel}
            </p>
            <h3 className="text-base md:text-lg font-bold text-slate-100 mb-1">
              {lang === 'bn' ? certLayout.courseNameBn : certLayout.courseNameEn}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.description}
            </p>
          </div>

          {/* Footer Section: Dates & Signatures */}
          <div>
            <div className="flex justify-center gap-10 text-xs text-slate-400 mb-6 mt-4">
              <div>
                <span className="text-slate-500 block text-[11px]">{t.issueDate}</span>
                <span className="font-semibold text-slate-200">{t.dateVal}</span>
              </div>
              <div className="border-r border-slate-800"></div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t.validUntil}</span>
                <span className="font-semibold text-emerald-400">{t.validVal}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 border-t border-slate-800 pt-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="font-bold text-sm text-slate-200 border-b border-dashed border-slate-700 pb-1 mb-1">
                  {t.signatory1}
                </div>
                <p className="text-[11px] text-slate-500">{t.authSignature}</p>
              </div>

              <div className="text-center">
                <div className="font-bold text-sm text-slate-200 border-b border-dashed border-slate-700 pb-1 mb-1">
                  {t.signatory2}
                </div>
                <p className="text-[11px] text-slate-500">{t.complianceOfficer}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}