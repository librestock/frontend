import i18n, { type InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'

import deCommon from '../locales/de/common.json'
import enCommon from '../locales/en/common.json'
import frCommon from '../locales/fr/common.json'

const isBrowser = typeof window !== 'undefined'

const initOptions: InitOptions = {
  resources: {
    en: {
      common: enCommon,
    },
    de: {
      common: deCommon,
    },
    fr: {
      common: frCommon,
    },
  },
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
}

if (isBrowser) {
  const { default: LanguageDetector } = await import(
    'i18next-browser-languagedetector'
  )
  initOptions.detection = {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  }
  i18n.use(LanguageDetector)
} else {
  initOptions.lng = 'en'
}

await i18n.use(initReactI18next).init(initOptions)

export default i18n
