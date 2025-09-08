/**
 * Language Switcher Component
 * Allows users to switch between supported languages
 */

import type { SupportedLang } from '@ufomiao/i18n-react'
import { LANG_LABELS, useLanguageSwitcher } from '@ufomiao/i18n-react'

export function LanguageSwitcher() {
  const {
    currentLanguage,
    changeLanguage,
    isReady,
  } = useLanguageSwitcher()

  const handleLanguageChange = async (newLanguage: SupportedLang) => {
    if (newLanguage !== currentLanguage) {
      await changeLanguage(newLanguage)
    }
  }

  if (!isReady) {
    return <div className="animate-pulse w-20 h-8 bg-gray-200 rounded"></div>
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
        Language:
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={e => handleLanguageChange(e.target.value as SupportedLang)}
        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {Object.entries(LANG_LABELS).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
