'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function QuizPage() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const t = {
    bn: {
      title: 'মেশিনারি সেফটি ও জরুরি সেফটি লকআউট (LOTO) কুইজ',
      subtitle: 'আপনার সেফটি জ্ঞান যাচাই করুন',
      questionLabel: 'প্রশ্ন',
      ofLabel: 'এর মধ্যে',
      nextBtn: 'পরবর্তী প্রশ্ন ➡️',
      submitBtn: 'কুইজ জমা দিন 🎯',
      resultTitle: 'কুইজ ফলাফল!',
      scoreLabel: 'আপনার অর্জিত স্কোর:',
      passMsg: 'অভিনন্দন! আপনি সেফটি পরীক্ষায় পাস করেছেন।',
      dashboardBtn: 'ড্যাশবোর্ডে ফিরে যান',
      viewCertificate: '📜 সার্টিফিকেট দেখুন ও ডাউনলোড করুন',
      switchLang: 'English',
      correctFeedback: '✅ সঠিক উত্তর!',
      wrongFeedback: '❌ ভুল উত্তর! সঠিক উত্তরটি সবুজ রঙে দেখানো হয়েছে।',
    },
    en: {
      title: 'Machinery Safety & Emergency Safety Lockout (LOTO) Quiz',
      subtitle: 'Evaluate your safety knowledge',
      questionLabel: 'Question',
      ofLabel: 'of',
      nextBtn: 'Next Question ➡️',
      submitBtn: 'Submit Quiz 🎯',
      resultTitle: 'Quiz Results!',
      scoreLabel: 'Your Score:',
      passMsg: 'Congratulations! You passed the safety assessment.',
      dashboardBtn: 'Return to Dashboard',
      viewCertificate: '📜 View & Download Certificate',
      switchLang: 'বাংলা',
      correctFeedback: '✅ Correct Answer!',
      wrongFeedback: '❌ Incorrect! The correct answer is highlighted in green.',
    },
  }[lang];

  const questions = [
    {
      bn: {
        q: '১. কারখানায় ভারী মেশিন রক্ষণাবেক্ষণের আগে কোন কাজ করা বাধ্যতামূলক?',
        options: [
          'মেশিন পরিষ্কার করা',
          'LOTO (লকআউট/ট্যাগআউট) প্রোটোকল মেনে বিদ্যুৎ বিচ্ছিন্ন করা',
          'সরাসরি কাজ শুরু করা',
          'সুপারভাইজারকে না জানিয়ে কাজ করা',
        ],
      },
      en: {
        q: '1. What is mandatory before performing heavy machine maintenance?',
        options: [
          'Cleaning the machine',
          'Isolate power following LOTO (Lockout/Tagout) protocol',
          'Start working directly',
          'Work without informing the supervisor',
        ],
      },
      correct: 1,
    },
    {
      bn: {
        q: '২. জরুরি পরিস্থিতিতে ফ্লোরের অ্যালার্ম বাজলে প্রথম কাজ কী?',
        options: [
          'মেশিন চালু রাখা',
          'নিকটস্থ জরুরি নির্গমন পথ (Emergency Exit) দিয়ে বের হওয়া',
          'ব্যক্তিগত জিনিসপত্র খোঁজা',
          'লিফট ব্যবহার করা',
        ],
      },
      en: {
        q: '2. What is the first action when an emergency floor alarm sounds?',
        options: [
          'Keep the machine running',
          'Evacuate via the nearest Emergency Exit',
          'Search for personal belongings',
          'Use the elevator',
        ],
      },
      correct: 1,
    },
    {
      bn: {
        q: '৩. মেশিন চালানোর সময় কোন ধরনের ব্যক্তিগত সুরক্ষা সরঞ্জাম (PPE) পরতে হয়?',
        options: [
          'যেকোনো ঢিলেঢালা পোশাক',
          'সেফটি হেলমেট, গ্লাভস এবং সেফটি শু',
          'শুধু সুতি জামা',
          'কোনোটিই নয়',
        ],
      },
      en: {
        q: '3. Which Personal Protective Equipment (PPE) is required while operating machinery?',
        options: [
          'Any loose clothing',
          'Safety helmet, gloves, and safety shoes',
          'Ordinary cotton shirt only',
          'None of the above',
        ],
      },
      correct: 1,
    },
    {
      bn: {
        q: '৪. LOTO (Lockout/Tagout) সেফটি প্যাডলক/তালা খোলার অধিকার কার রয়েছে?',
        options: [
          'যেকোনো সহকর্মী বা শ্রমিকের',
          'শুধুমাত্র যে ব্যক্তি বা অনুমোদিত টেকনিশিয়ান তালাটি লাগিয়েছিলেন',
          'ফ্যাক্টরির যেকোনো দর্শনার্থীর',
          'ক্লিনার বা পরিচ্ছন্নতাকর্মীর',
        ],
      },
      en: {
        q: '4. Who is authorized to remove a LOTO safety lock/tag?',
        options: [
          'Any colleague or worker',
          'Only the authorized technician who applied the lock',
          'Any factory visitor',
          'The cleaning staff',
        ],
      },
      correct: 1,
    },
    {
      bn: {
        q: '৫. কারখানায় মেশিনে কাজ করার সময় কোনো ত্রুটি বা অস্বাভাবিক শব্দ হলে কী করা উচিত?',
        options: [
          'উপেক্ষা করে কাজ চালিয়ে যাওয়া',
          'অবিলম্বে মেশিন বন্ধ করা ও সংশ্লিষ্ট সুপারভাইজার/মেকানিককে জানানো',
          'শব্দ বন্ধ করতে মেশিনে ধাক্কা দেওয়া',
          'শিফট শেষ হওয়া পর্যন্ত অপেক্ষা করা',
        ],
      },
      en: {
        q: '5. What should you do if you notice a defect or unusual noise in a machine?',
        options: [
          'Ignore it and continue working',
          'Immediately stop the machine and inform the supervisor/mechanic',
          'Hit the machine to reduce noise',
          'Wait until the shift ends',
        ],
      },
      correct: 1,
    },
  ];

  const handleOptionSelect = (index: number) => {
    if (isSubmitted) return; // একবার সিলেক্ট করার পর লকিং

    setSelectedOption(index);
    setIsSubmitted(true);

    if (index === questions[currentQuestion].correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col justify-center items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <Link
          href="/dashboard"
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-xl border border-slate-800 transition-all"
        >
          ⬅️ {t.dashboardBtn}
        </Link>
        <button
          onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
          className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold px-3 py-2 rounded-xl border border-slate-800 transition-all"
        >
          🌐 {t.switchLang}
        </button>
      </div>

      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        {!showResult ? (
          <div>
            {/* Header */}
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h1 className="text-lg md:text-xl font-bold text-amber-400">
                {t.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {t.questionLabel} {currentQuestion + 1} {t.ofLabel} {questions.length}
                </span>
                <span className="bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20 font-mono">
                  Progress: {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-base md:text-lg font-semibold mb-6 text-slate-100">
              {questions[currentQuestion][lang].q}
            </h2>

            {/* Options with Color Feedback */}
            <div className="space-y-3 mb-6">
              {questions[currentQuestion][lang].options.map((opt, idx) => {
                const isCorrectIndex = idx === questions[currentQuestion].correct;
                const isUserSelected = selectedOption === idx;

                let buttonStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

                if (isSubmitted) {
                  if (isCorrectIndex) {
                    // সঠিক উত্তর সবুজ কালার
                    buttonStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold shadow-lg shadow-emerald-900/30';
                  } else if (isUserSelected && !isCorrectIndex) {
                    // ভুল উত্তর হালকা লাল কালার
                    buttonStyle = 'bg-red-950/80 border-red-500 text-red-300 font-semibold';
                  } else {
                    buttonStyle = 'bg-slate-950/50 border-slate-900 text-slate-600 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${buttonStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-block w-6 h-6 rounded-full bg-slate-800 text-center text-xs leading-6 font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {/* Feedback Badges */}
                    {isSubmitted && isCorrectIndex && (
                      <span className="text-emerald-400 text-xs font-bold bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                        ✓ সঠিক উত্তর
                      </span>
                    )}
                    {isSubmitted && isUserSelected && !isCorrectIndex && (
                      <span className="text-red-400 text-xs font-bold bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/30">
                        ✕ ভুল উত্তর
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback Alert Bar */}
            {isSubmitted && (
              <div className={`p-3 rounded-xl mb-6 text-xs font-medium border flex items-center gap-2 ${
                selectedOption === questions[currentQuestion].correct
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {selectedOption === questions[currentQuestion].correct ? t.correctFeedback : t.wrongFeedback}
              </div>
            )}

            {/* Next / Submit Button */}
            {isSubmitted && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
              >
                {currentQuestion + 1 === questions.length ? t.submitBtn : t.nextBtn}
              </button>
            )}
          </div>
        ) : (
          /* Result Screen */
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-white mb-2">{t.resultTitle}</h2>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 my-6 max-w-sm mx-auto">
              <p className="text-xs text-slate-400 mb-2">{t.scoreLabel}</p>
              <p className="text-4xl font-extrabold text-amber-400 font-mono">
                {score} / {questions.length}
              </p>
              <p className="text-xs text-emerald-400 mt-3 font-medium">{t.passMsg}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/dashboard"
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 px-6 rounded-xl transition-all text-xs"
              >
                {t.dashboardBtn}
              </Link>
              <Link
                href="/certificate"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-600/30 text-xs flex items-center justify-center gap-2"
              >
                {t.viewCertificate}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}