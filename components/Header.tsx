'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase, SystemSetting } from '@/lib/supabase'

interface HeaderProps {
  activeSection?: 'produtos-do-dia' | 'encomendas'
  onSectionChange?: (section: 'produtos-do-dia' | 'encomendas') => void
}

export default function Header({ activeSection = 'produtos-do-dia', onSectionChange }: HeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [companyName, setCompanyName] = useState('Sabores de Zissou')
  const [companySlogan, setCompanySlogan] = useState('Confeitaria e Panificadora Artesanal')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['site_logo_url', 'company_name', 'company_slogan'])

      settings?.forEach((setting: { key: string, value: string }) => {
        switch (setting.key) {
          case 'site_logo_url':
            if (setting.value) setLogoUrl(setting.value)
            break
          case 'company_name':
            if (setting.value) setCompanyName(setting.value)
            break
          case 'company_slogan':
            if (setting.value) setCompanySlogan(setting.value)
            break
        }
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container pt-6 pb-4 px-4">
        {/* Logo e Nome da Empresa */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-3">
            {logoUrl && (
              <div className="w-20 h-20 relative">
                <Image
                  src={logoUrl}
                  alt={companyName}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-wine">{companyName}</h1>
              <p className="text-chocolate text-sm font-medium">{companySlogan}</p>
            </div>
          </div>
        </div>

        {/* Navegação */}
        {onSectionChange && (
          <nav className="flex justify-center gap-3 mb-2">
            <button
              onClick={() => onSectionChange('produtos-do-dia')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'produtos-do-dia'
                  ? 'bg-wine text-white'
                  : 'bg-pink-soft text-wine hover:bg-pink-300'
                }`}
            >
              🍰 Produtos do Dia
            </button>
            <button
              onClick={() => onSectionChange('encomendas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeSection === 'encomendas'
                  ? 'bg-wine text-white'
                  : 'bg-pink-soft text-wine hover:bg-pink-300'
                }`}
            >
              🎁 Encomendas
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}