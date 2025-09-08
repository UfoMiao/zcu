/**
 * ZCU Web Dashboard - Main Application Component
 * Demonstrates i18n integration in Web environment
 */

import type { SupportedLang } from '@ufomiao/i18n-react'
import { i18n, I18nextProvider, initI18nForBrowser, useI18nInstance } from '@ufomiao/i18n-react'
import { Button, CancelButton, DeleteButton, SaveButton } from '@ufomiao/ui-react'
import { Suspense, useEffect, useState } from 'react'
import { LanguageSwitcher } from './components/LanguageSwitcher'

// Internal component that uses hooks but maintains i18n.t() format for i18n-ally
function AppContent() {
  const i18nInstance = useI18nInstance()
  const [language, setLanguage] = useState<SupportedLang>('en')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      try {
        await initI18nForBrowser({ language })
        const newLang = i18nInstance.language as SupportedLang
        setLanguage(newLang)
      }
      catch (error) {
        console.error('Failed to initialize i18n for web:', error)
      }
      finally {
        const newIsLoading = false
        setIsLoading(newIsLoading)
      }
    }

    const handleLanguageChange = (lng: string) => {
      const newLang = lng as SupportedLang
      setLanguage(newLang)
    }

    if (!i18nInstance.isInitialized) {
      initialize()
    }
    else {
      const currentLang = i18nInstance.language as SupportedLang
      setLanguage(currentLang)
      const initialLoading = false
      setIsLoading(initialLoading)
    }

    i18nInstance.on('languageChanged', handleLanguageChange)

    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange)
    }
  }, [i18nInstance, language])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {i18nInstance.t('commands:status_title')}
                {' '}
                - ZCU Web
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {i18nInstance.t('messages:development_mode')}
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                {i18nInstance.t('ui:message_loading')}
                {' '}
                ZCU Web Dashboard...
              </p>

              {/* Language Demo */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Language Demo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      {i18nInstance.t('ui:label_status')}
                      :
                      {language}
                    </h4>
                    <ul className="text-left text-gray-600 space-y-2">
                      <li>
                        •
                        {i18nInstance.t('commands:undo_description')}
                      </li>
                      <li>
                        •
                        {i18nInstance.t('commands:redo_description')}
                      </li>
                      <li>
                        •
                        {i18nInstance.t('commands:checkpoint_description')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      {i18nInstance.t('ui:label_actions')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <SaveButton size="sm" />
                      <CancelButton size="sm" />
                      <DeleteButton size="sm" />
                      <Button variant="outline" size="sm">
                        {i18nInstance.t('ui:button_refresh')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {i18nInstance.t('commands:checkpoint_title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {i18nInstance.t('commands:checkpoint_description')}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {i18nInstance.t('commands:list_title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {i18nInstance.t('commands:list_description')}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {i18nInstance.t('commands:restore_title')}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {i18nInstance.t('commands:restore_description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            ZCU - Zero-Config Claude-Code Undo •
            {' '}
            {i18nInstance.t('ui:message_success')}
          </p>
        </div>
      </footer>
    </div>
  )
}

// Root App component with i18next provider
export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={(
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading translations...</p>
          </div>
        </div>
      )}
      >
        <AppContent />
      </Suspense>
    </I18nextProvider>
  )
}
