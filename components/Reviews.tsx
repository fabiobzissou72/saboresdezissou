'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { supabase, Review } from '@/lib/supabase'

interface ReviewForm {
  customer_name: string
  rating: number
  comment: string
  photo: FileList
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ReviewForm>()

  const rating = watch('rating')

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    // Auto-scroll reviews
    const interval = setInterval(() => {
      if (reviews.length > 1) {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [reviews.length])

  const loadReviews = async () => {
    try {
      // Buscar avaliações aprovadas do Supabase
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(4) // Apenas 4 para o carousel da home

      if (error) throw error

      if (data && data.length > 0) {
        setReviews(data)

        // Calcular média das avaliações
        const sum = data.reduce((acc: number, review: any) => acc + review.rating, 0)
        setAverageRating(sum / data.length)
      } else {
        // Fallback para dados de demonstração se não houver avaliações no banco
        const demoReviews: Review[] = [
          {
            id: 'demo-1',
            customer_name: 'Maria Silva',
            rating: 5,
            comment: 'Simplesmente perfeito! O bolo de chocolate estava uma delícia e chegou no horário combinado.',
            photo_url: undefined,
            is_approved: true,
            display_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            customer_name: 'João Santos',
            rating: 5,
            comment: 'A torta de limão é incrível! Sabor equilibrado e massa crocante. Já virei cliente fiel.',
            photo_url: undefined,
            is_approved: true,
            display_order: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-3',
            customer_name: 'Ana Costa',
            rating: 4,
            comment: 'Produtos artesanais de qualidade excepcional. O atendimento também é muito bom.',
            photo_url: undefined,
            is_approved: true,
            display_order: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'demo-4',
            customer_name: 'Carlos Oliveira',
            rating: 5,
            comment: 'Fiz uma encomenda para aniversário da minha filha e foi um sucesso! O bolo ficou lindo.',
            photo_url: undefined,
            is_approved: true,
            display_order: 4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]

        setReviews(demoReviews)

        // Calcular média das avaliações
        const sum = demoReviews.reduce((acc: number, review: Review) => acc + review.rating, 0)
        setAverageRating(sum / demoReviews.length)
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      setReviews([])
    }
  }

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `reviews/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      return null
    }
  }

  const onSubmit = async (data: ReviewForm) => {
    setIsSubmitting(true)

    try {
      let photoUrl: string | null = null

      // Upload da foto se fornecida
      if (data.photo && data.photo.length > 0) {
        photoUrl = await uploadPhoto(data.photo[0])
      }

      const { error } = await supabase
        .from('reviews')
        .insert([{
          customer_name: data.customer_name,
          rating: data.rating,
          comment: data.comment,
          photo_url: photoUrl,
          is_approved: false // Aguarda aprovação
        }])

      if (error) throw error

      toast.success('Avaliação enviada! Será analisada e publicada em breve.')
      setShowModal(false)
      reset()
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      toast.error('Erro ao enviar avaliação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'text-2xl' : 'text-lg'
    return (
      <div className={`stars ${sizeClass}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'star' : 'star empty'}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const renderStarInput = (value: number) => {
    return (
      <button
        type="button"
        onClick={() => setValue('rating', value)}
        className={`text-3xl transition-colors hover:scale-110 ${
          rating >= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
        }`}
      >
        ★
      </button>
    )
  }

  return (
    <div className="space-y-8">
      {/* Seção de Avaliações Exibidas */}
      {reviews.length > 0 && (
        <div className="bg-white border-2 border-pink-soft rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <h2 className="text-2xl font-bold text-wine mb-2">
              O que nossos clientes dizem
            </h2>
            <div className="flex items-center justify-center gap-2">
              {renderStars(Math.round(averageRating), 'lg')}
              <span className="text-xl font-bold text-wine ml-2">
                {averageRating.toFixed(1)} ({reviews.length} avaliações)
              </span>
            </div>
          </div>

          {/* Carousel de Avaliações */}
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
            >
              {reviews.map((review, index) => (
                <div key={review.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gray-50 rounded-xl p-6 text-center max-w-2xl mx-auto">
                    {review.photo_url && (
                      <div className="w-20 h-20 relative rounded-full mx-auto mb-4 overflow-hidden">
                        <Image
                          src={review.photo_url}
                          alt={`Foto de ${review.customer_name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-wine mb-2">
                      {review.customer_name}
                    </h3>
                    {renderStars(review.rating)}
                    <p className="text-gray-700 mt-4 text-lg italic">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicadores */}
            {reviews.length > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReviewIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentReviewIndex ? 'bg-wine' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Link para ver todas as avaliações */}
            <div className="text-center mt-6">
              <Link
                href="/avaliacoes"
                className="text-wine hover:text-wine-light font-medium underline text-lg"
              >
                Ver todas as avaliações →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="text-center">
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          ⭐ Deixe sua Avaliação
        </button>
      </div>

      {/* Modal de Avaliação */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-wine">Deixe sua Avaliação</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    {...register('customer_name', { required: 'Nome é obrigatório' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                    placeholder="Seu nome"
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Sua Avaliação *
                  </label>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => renderStarInput(star))}
                  </div>
                  <input
                    type="hidden"
                    {...register('rating', {
                      required: 'Avaliação é obrigatória',
                      min: { value: 1, message: 'Selecione ao menos 1 estrela' }
                    })}
                  />
                  {errors.rating && (
                    <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Seu Depoimento *
                  </label>
                  <textarea
                    {...register('comment', { required: 'Depoimento é obrigatório' })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                    placeholder="Conte sua experiência conosco..."
                  />
                  {errors.comment && (
                    <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Foto (opcional)
                  </label>
                  <input
                    type="file"
                    {...register('photo')}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Compartilhe uma foto do produto ou da sua experiência
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Avaliação'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}