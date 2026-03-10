import React from 'react';
import { X, Loader, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export interface TicketFormData {
  problemType: string;
  priority: 'low' | 'medium' | 'high';
  problemSummary: string;
  deviceModel: string;
  deviceSN: string;
  additionalNotes: string;
  images: string[];
}

interface TicketFormProps {
  formData: TicketFormData;
  onFormDataChange: (data: TicketFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
  error?: string | null;
  showAIAssist?: boolean;
  onAIAssist?: () => void;
  aiAssisting?: boolean;
}

export function TicketForm({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  submitting = false,
  error = null,
  showAIAssist = false,
  onAIAssist,
  aiAssisting = false
}: TicketFormProps) {
  const { t } = useLanguage();
  const problemTypes = [
    { value: 'malfunction', label: t('ticket_type_malfunction') },
    { value: 'maintenance', label: t('ticket_type_maintenance') },
    { value: 'consultation', label: t('ticket_type_consultation') },
    { value: 'parts', label: t('ticket_type_parts') }
  ];

  const priorities = [
    { value: 'low' as const, label: t('priority_low'), color: 'gray' },
    { value: 'medium' as const, label: t('priority_medium'), color: 'blue' },
    { value: 'high' as const, label: t('priority_high'), color: 'red' }
  ];

  const updateFormData = (field: keyof TicketFormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
        onClick={onCancel}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('ticket_form_title')}</h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* AI 辅助填写按钮 */}
          {showAIAssist && onAIAssist && (
            <div className="px-6 pt-4">
              <button
                onClick={onAIAssist}
                disabled={aiAssisting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed haptic-feedback"
              >
                {aiAssisting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>{t('ticket_ai_assisting')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{t('ticket_ai_assist_fill')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 表单内容 */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* 问题类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ticket_problem_type_label')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {problemTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => updateFormData('problemType', type.value)}
                      className={`px-3 py-2 border rounded-lg text-sm transition-all haptic-feedback ${formData.problemType === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 优先级 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ticket_priority_label')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => updateFormData('priority', priority.value)}
                      className={`px-3 py-2 border rounded-lg text-sm transition-all haptic-feedback ${formData.priority === priority.value
                        ? priority.value === 'high'
                          ? 'border-red-500 bg-red-50 text-red-700 font-medium'
                          : priority.value === 'medium'
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-500 bg-gray-50 text-gray-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 问题摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ticket_problem_summary')}
                </label>
                <input
                  type="text"
                  value={formData.problemSummary}
                  onChange={(e) => updateFormData('problemSummary', e.target.value)}
                  placeholder={t('ticket_problem_summary_placeholder')}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* 设备型号和设备SN码 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ticket_device_model_label')}
                  </label>
                  <input
                    type="text"
                    value={formData.deviceModel}
                    onChange={(e) => updateFormData('deviceModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ticket_device_sn_input')}
                  </label>
                  <input
                    type="text"
                    value={formData.deviceSN}
                    onChange={(e) => updateFormData('deviceSN', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* 补充说明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ticket_additional_notes_optional')}
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  rows={3}
                  placeholder={t('ticket_additional_notes_placeholder')}
                />
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">{t('ticket_submit_includes')}</p>
                    <ul className="space-y-0.5">
                      <li>• {t('ticket_submit_item_problem_desc')}</li>
                      <li>• {t('ticket_submit_item_device_info')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl haptic-feedback disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{t('ticket_creating')}</span>
                </>
              ) : (
                <span>{t('ticket_confirm_create')}</span>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
