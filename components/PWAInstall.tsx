'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se é iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Verificar se já está instalado
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
    const isInstalled = (window.navigator as any).standalone === true || isInStandaloneMode
    setIsInstalled(isInstalled)

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallButton(true)
    }

    // Listener para quando o app for instalado
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Mostrar botão para iOS mesmo sem o evento beforeinstallprompt
    if (iOS && !isInstalled) {
      setShowInstallButton(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      // Para iOS, mostrar instruções em um modal mais elegante
      const shouldShow = confirm(`📱 Instalar "Sabores de Zissou" no seu iPhone?

✨ Tenha acesso rápido direto da sua tela inicial!

Ver instruções?`)
      
      if (shouldShow) {
        alert(`📱 Como instalar no iPhone:

1️⃣ Toque no botão de compartilhamento (□↗) abaixo
2️⃣ Role para baixo e toque "Adicionar à Tela de Início"
3️⃣ Toque "Adicionar" no canto superior direito

✅ Pronto! O app ficará na sua tela inicial`)
      }
      return
    }

    // Android/Desktop - Instalação automática
    if (deferredPrompt) {
      try {
        // Disparar prompt de instalação automaticamente
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          console.log('✅ PWA instalado com sucesso')
          setIsInstalled(true)
        }

        setDeferredPrompt(null)
        setShowInstallButton(false)
      } catch (error) {
        console.error('Erro durante instalação:', error)
        // Em caso de erro, mostrar instrução simples
        alert(`Para instalar o app:

📱 Procure o ícone "Sabores de Zissou" na sua tela inicial
ou
📱 Toque no menu (⋮) > "Adicionar à tela inicial"`)
      }
    } else {
      // Fallback se não houver deferredPrompt
      alert(`Para instalar o app:

📱 Celular: Menu (⋮) > "Adicionar à tela inicial"
💻 Desktop: Ícone de instalação (⊕) na barra de endereços`)
    }
  }

  // Não mostrar se já estiver instalado
  if (isInstalled) return null

  return (
    <div className="flex justify-center">
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 bg-wine hover:bg-wine-light text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm"
      >
        <span className="text-base">📱</span>
        {isIOS ? 'Como Instalar App' : 'Instalar App'}
      </button>
    </div>
  )
}