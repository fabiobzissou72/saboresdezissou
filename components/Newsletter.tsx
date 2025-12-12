'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface NewsletterForm {
  name: string
  whatsapp: string
}

export default function Newsletter() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NewsletterForm>()

  const formatWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const onSubmit = async (data: NewsletterForm) => {
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{
          name: data.name,
          whatsapp: data.whatsapp.replace(/\D/g, ''),
        }])

      if (error) throw error

      toast.success('Cadastrado com sucesso! Você receberá nossas novidades no WhatsApp.')
      reset()
    } catch (error: any) {
      console.error('Erro ao cadastrar newsletter:', error)
      if (error.code === '23505') { // Unique constraint violation
        toast.error('Este WhatsApp já está cadastrado!')
      } else {
        toast.error('Erro ao cadastrar. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border-2 border-pink-soft rounded-xl p-6">
      <div className="text-center mb-4">
        <div className="inline-block p-3 bg-pink-soft rounded-full mb-3">
          <span className="text-2xl">📧</span>
        </div>
        <h2 className="text-xl font-bold text-wine mb-2">
          Fique por Dentro das Novidades
        </h2>
        <p className="text-chocolate text-sm">
          Receba as últimas receitas, promoções especiais e novidades da Sabores de Zissou
          diretamente no seu WhatsApp!
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seu Nome
          </label>
          <input
            type="text"
            {...register('name', { required: 'Nome é obrigatório' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wine focus:border-wine text-sm"
            placeholder="Digite seu nome"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seu WhatsApp
          </label>
          <input
            type="tel"
            {...register('whatsapp', {
              required: 'WhatsApp é obrigatório',
              pattern: {
                value: /^\(\d{2}\)\s\d{5}-\d{4}$/,
                message: 'Formato: (11) 99999-9999'
              }
            })}
            onChange={(e) => {
              e.target.value = formatWhatsApp(e.target.value)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-wine focus:border-wine text-sm"
            placeholder="(11) 99999-9999"
          />
          {errors.whatsapp && (
            <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-wine hover:bg-wine-light text-white font-medium py-2 px-3 rounded-md transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <div className="spinner mr-2" />
              Cadastrando...
            </>
          ) : (
            'Cadastrar'
          )}
        </button>

        <p className="text-xs text-gray-600 text-center mt-3">
          🔒 Sem spam, apenas novidades!
        </p>
      </form>
    </div>
  )
}