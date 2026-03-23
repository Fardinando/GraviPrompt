import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation, TranslationKey } from '../lib/i18n';

interface TutorialStep {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: string;
  targetId?: string;
}

const STEPS: TutorialStep[] = [
  {
    titleKey: "tutorial.welcome" as TranslationKey,
    descriptionKey: "tutorial.welcome_desc" as TranslationKey,
    icon: "rocket_launch"
  },
  {
    titleKey: "tutorial.categories" as TranslationKey,
    descriptionKey: "tutorial.categories_desc" as TranslationKey,
    icon: "category",
    targetId: "cat-group-desenvolvimento"
  },
  {
    titleKey: "tutorial.targets" as TranslationKey,
    descriptionKey: "tutorial.targets_desc" as TranslationKey,
    icon: "target",
    targetId: "target-dropdown"
  },
  {
    titleKey: "tutorial.deep_research" as TranslationKey,
    descriptionKey: "tutorial.deep_research_desc" as TranslationKey,
    icon: "search",
    targetId: "cat-group-pesquisa"
  },
  {
    titleKey: "tutorial.history" as TranslationKey,
    descriptionKey: "tutorial.history_desc" as TranslationKey,
    icon: "history",
    targetId: "sidebar-history"
  }
];

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'pt-BR' | 'en';
}

export default function TutorialModal({ isOpen, onClose, language }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const { t } = useTranslation(language);

  useEffect(() => {
    if (isOpen) {
      const targetId = STEPS[currentStep].targetId;
      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Add padding to the spotlight area
          setSpotlightRect({
            left: rect.left - 8,
            top: rect.top - 8,
            right: rect.right + 8,
            bottom: rect.bottom + 8,
            width: rect.width + 16,
            height: rect.height + 16,
            x: rect.x - 8,
            y: rect.y - 8,
            toJSON: () => ({})
          } as DOMRect);
        } else {
          setSpotlightRect(null);
        }
      } else {
        setSpotlightRect(null);
      }
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Spotlight Overlay */}
      <AnimatePresence mode="wait">
        {spotlightRect && (
          <motion.div
            key="spotlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-black/60 pointer-events-none backdrop-blur-md"
            style={{
              clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                ${spotlightRect.left}px 100%, 
                ${spotlightRect.left}px ${spotlightRect.top}px, 
                ${spotlightRect.right}px ${spotlightRect.top}px, 
                ${spotlightRect.right}px ${spotlightRect.bottom}px, 
                ${spotlightRect.left}px ${spotlightRect.bottom}px, 
                ${spotlightRect.left}px 100%, 
                100% 100%, 
                100% 0%
              )`
            }}
          />
        )}
      </AnimatePresence>

      {!spotlightRect && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      )}

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`bg-white dark:bg-space-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-white/10 ${spotlightRect ? 'mt-48' : ''}`}
        >
          <div className="p-8 text-center space-y-6">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary"
            >
              <span className="material-symbols-outlined text-[48px]">
                {STEPS[currentStep].icon}
              </span>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black dark:text-white tracking-tight">
                {t(STEPS[currentStep].titleKey)}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(STEPS[currentStep].descriptionKey)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-8 bg-primary' : 'w-1.5 bg-slate-200 dark:bg-white/10'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {t('tutorial.prev')}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                {currentStep === STEPS.length - 1 ? t('tutorial.finish') : t('tutorial.next')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
