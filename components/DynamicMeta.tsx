'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DynamicMeta() {
  useEffect(() => {
    const updateMetaTags = async () => {
      try {
        // Buscar configurações
        const { data: settings } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['site_logo_url', 'pwa_logo_url', 'company_name', 'company_slogan'])

        const settingsMap = settings?.reduce((acc: any, setting: any) => {
          acc[setting.key] = setting.value
          return acc
        }, {}) || {}

        // Atualizar favicon se logo do site existir
        if (settingsMap.site_logo_url) {
          let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
          if (!favicon) {
            favicon = document.createElement('link')
            favicon.rel = 'icon'
            document.head.appendChild(favicon)
          }
          favicon.href = settingsMap.site_logo_url
        }

        // Atualizar apple-touch-icon se logo PWA existir
        if (settingsMap.pwa_logo_url) {
          let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement
          if (!appleTouchIcon) {
            appleTouchIcon = document.createElement('link')
            appleTouchIcon.rel = 'apple-touch-icon'
            document.head.appendChild(appleTouchIcon)
          }
          appleTouchIcon.href = settingsMap.pwa_logo_url
        }

        // Atualizar título da página se nome da empresa existir
        if (settingsMap.company_name) {
          document.title = settingsMap.company_name

          // Atualizar meta application-name
          let appNameMeta = document.querySelector('meta[name="application-name"]') as HTMLMetaElement
          if (!appNameMeta) {
            appNameMeta = document.createElement('meta')
            appNameMeta.name = 'application-name'
            document.head.appendChild(appNameMeta)
          }
          appNameMeta.content = settingsMap.company_name.split(' - ')[0] || settingsMap.company_name

          // Atualizar meta apple-mobile-web-app-title
          let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement
          if (!appleTitleMeta) {
            appleTitleMeta = document.createElement('meta')
            appleTitleMeta.name = 'apple-mobile-web-app-title'
            document.head.appendChild(appleTitleMeta)
          }
          appleTitleMeta.content = settingsMap.company_name.split(' - ')[0] || settingsMap.company_name
        }

        // Atualizar descrição se slogan da empresa existir
        if (settingsMap.company_slogan) {
          let descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
          if (!descriptionMeta) {
            descriptionMeta = document.createElement('meta')
            descriptionMeta.name = 'description'
            document.head.appendChild(descriptionMeta)
          }
          descriptionMeta.content = settingsMap.company_slogan
        }

      } catch (error) {
        console.error('Erro ao atualizar meta tags:', error)
      }
    }

    updateMetaTags()
  }, [])

  // Este componente não renderiza nada visível
  return null
}