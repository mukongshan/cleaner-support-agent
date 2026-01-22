import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageSelectionPageProps {
  onBack: () => void;
}

export function LanguageSelectionPage({ onBack }: LanguageSelectionPageProps) {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'zh' as const, label: '简体中文' },
    { code: 'en' as const, label: 'English' }
  ];

  const handleLanguageSelect = (langCode: 'zh' | 'en') => {
    setLanguage(langCode);
    // 立即返回，语言切换会立即生效
    onBack();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'white',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '28rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'transparent'
        }}
      >
        {/* Header */}
        <div 
          className="px-4 py-3 flex items-center gap-3 relative z-10"
          style={{
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/20 rounded-lg transition-colors haptic-feedback"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">{t('language_select_title')}</h2>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div 
            className="rounded-2xl overflow-hidden"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}
          >
            {languages.map((lang, index) => {
              const isSelected = language === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleLanguageSelect(lang.code)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem'
                  }}
                  className="hover:bg-gray-50 transition-colors haptic-feedback"
                >
                  <span className="text-sm font-medium text-gray-900">{lang.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-5 h-5 text-blue-600" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
