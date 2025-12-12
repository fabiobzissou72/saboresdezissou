'use client'

export const dynamic = 'force-dynamic'

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

export default function AvaliacoesPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)

  // Estados para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [reviewsPerPage] = useState(12)
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [compactView, setCompactView] = useState(false)

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

  const loadReviews = async () => {
    try {
      // Buscar avaliações aprovadas do Supabase
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

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
            comment: 'Simplesmente perfeito! O bolo de chocolate estava uma delícia e chegou no horário combinado. Super recomendo a Sabores de Zissou!',
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
            comment: 'A torta de limão é incrível! Sabor equilibrado e massa crocante. Já virei cliente fiel da confeitaria.',
            photo_url: undefined,
            is_approved: true,
            display_order: 2,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'demo-3',
            customer_name: 'Ana Costa',
            rating: 4,
            comment: 'Produtos artesanais de qualidade excepcional. O atendimento também é muito bom. Vale a pena pela qualidade.',
            photo_url: undefined,
            is_approved: true,
            display_order: 3,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'demo-4',
            customer_name: 'Carlos Oliveira',
            rating: 5,
            comment: 'Fiz uma encomenda para o aniversário da minha filha e foi um sucesso total! O bolo personalizado ficou lindo e delicioso.',
            photo_url: undefined,
            is_approved: true,
            display_order: 4,
            created_at: new Date(Date.now() - 259200000).toISOString(),
            updated_at: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: 'demo-5',
            customer_name: 'Luciana Mendes',
            rating: 5,
            comment: 'Melhor confeitaria da região! Os docinhos são divinos e o atendimento é sempre muito carinhoso. Recomendo de olhos fechados!',
            photo_url: undefined,
            is_approved: true,
            display_order: 5,
            created_at: new Date(Date.now() - 345600000).toISOString(),
            updated_at: new Date(Date.now() - 345600000).toISOString()
          },
          {
            id: 'demo-6',
            customer_name: 'Roberto Silva',
            rating: 4,
            comment: 'Produtos frescos e sabor incrível. O pão artesanal é o melhor que já provei. Recomendo a todos!',
            photo_url: undefined,
            is_approved: true,
            display_order: 6,
            created_at: new Date(Date.now() - 432000000).toISOString(),
            updated_at: new Date(Date.now() - 432000000).toISOString()
          },
          {
            id: 'demo-7',
            customer_name: 'Patricia Alves',
            rating: 5,
            comment: 'Atendimento excepcional e produtos deliciosos. A atenção aos detalhes é incrível, desde a apresentação até o sabor.',
            photo_url: undefined,
            is_approved: true,
            display_order: 7,
            created_at: new Date(Date.now() - 518400000).toISOString(),
            updated_at: new Date(Date.now() - 518400000).toISOString()
          },
          {
            id: 'demo-8',
            customer_name: 'Fernando Costa',
            rating: 4,
            comment: 'Ótima experiência! O brigadeiro gourmet é especialmente delicioso. Preços justos pela qualidade oferecida.',
            photo_url: undefined,
            is_approved: true,
            display_order: 8,
            created_at: new Date(Date.now() - 604800000).toISOString(),
            updated_at: new Date(Date.now() - 604800000).toISOString()
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
    } finally {
      setLoading(false)
    }
  }

  // FILTRAR E PAGINAR AVALIAÇÕES
  const getFilteredReviews = () => {
    let filtered = reviews

    // Filtrar por rating
    if (ratingFilter !== 'all') {
      const targetRating = parseInt(ratingFilter)
      filtered = filtered.filter(review => review.rating === targetRating)
    }

    // Filtrar por busca (nome do cliente ou comentário)
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const getPaginatedReviews = () => {
    const filtered = getFilteredReviews()
    const startIndex = (currentPage - 1) * reviewsPerPage
    const endIndex = startIndex + reviewsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    const filtered = getFilteredReviews()
    return Math.ceil(filtered.length / reviewsPerPage)
  }

  const handleFilterChange = (newFilter: string) => {
    setRatingFilter(newFilter)
    setCurrentPage(1)
  }

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch)
    setCurrentPage(1)
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

      if (data.photo && data.photo.length > 0) {
        photoUrl = await uploadPhoto(data.photo[0])
      }

      const { error } = await supabase.from('reviews').insert([
        {
          customer_name: data.customer_name,
          rating: data.rating,
          comment: data.comment,
          photo_url: photoUrl,
          is_approved: false // Precisa de aprovação do admin
        }
      ])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-wine text-lg">Carregando avaliações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-wine hover:text-wine-light transition-colors">
              ← Voltar
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-wine">Avaliações ({getFilteredReviews().length})</h1>
              <p className="text-chocolate">Sabores de Zissou</p>
            </div>
            <button
              onClick={() => setCompactView(!compactView)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                compactView
                  ? 'bg-wine text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {compactView ? '📋' : '📄'}
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Resumo das Avaliações */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <h2 className="text-2xl font-bold text-wine mb-4">
              O que nossos clientes dizem
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {renderStars(Math.round(averageRating), 'lg')}
              <span className="text-xl font-bold text-wine ml-2">
                {averageRating.toFixed(1)} ({reviews.length} avaliações)
              </span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              ⭐ Deixe sua Avaliação
            </button>
          </div>
        </div>

        {/* FILTROS E BUSCA */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Nome ou comentário..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estrelas</label>
              <select
                value={ratingFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine"
              >
                <option value="all">Todas as Estrelas</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 estrelas)</option>
                <option value="4">⭐⭐⭐⭐ (4 estrelas)</option>
                <option value="3">⭐⭐⭐ (3 estrelas)</option>
                <option value="2">⭐⭐ (2 estrelas)</option>
                <option value="1">⭐ (1 estrela)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setRatingFilter('all')
                  setCurrentPage(1)
                }}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
              >
                🔄 Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Avaliações */}
        <div className={compactView ? "space-y-4" : "space-y-6"}>
          {getPaginatedReviews().map((review) => {
            if (compactView) {
              // VISUALIZAÇÃO COMPACTA
              return (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3">
                        {review.photo_url && (
                          <div className="w-8 h-8 relative rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={review.photo_url}
                              alt={`Foto de ${review.customer_name}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-wine">{review.customer_name}</h3>
                          <p className="text-xs text-gray-600">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-700 text-sm line-clamp-2">"{review.comment}"</p>
                      </div>
                      <div className="flex justify-end">
                        {renderStars(review.rating, 'sm')}
                      </div>
                    </div>
                  </div>
                </div>
              )
            } else {
              // VISUALIZAÇÃO DETALHADA
              return (
                <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {review.photo_url && (
                        <div className="w-12 h-12 relative rounded-full overflow-hidden">
                          <Image
                            src={review.photo_url}
                            alt={`Foto de ${review.customer_name}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-wine">
                          {review.customer_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              )
            }
          })}

          {getFilteredReviews().length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">⭐</div>
              <div className="text-xl font-bold">Nenhuma avaliação encontrada.</div>
              <div className="text-lg">
                {searchTerm || ratingFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Seja o primeiro a avaliar nossos produtos!'
                }
              </div>
            </div>
          )}
        </div>

        {/* PAGINAÇÃO */}
        {getTotalPages() > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Página {currentPage} de {getTotalPages()}
              ({getFilteredReviews().length} avaliações)
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              {/* Páginas numeradas */}
              {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                .filter(page =>
                  page === 1 ||
                  page === getTotalPages() ||
                  Math.abs(page - currentPage) <= 2
                )
                .map((page, index, array) => (
                  <span key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage === page
                          ? 'bg-wine text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                ))
              }

              <button
                onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima →
              </button>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-wine mb-4">
              Experimente nossos produtos!
            </h3>
            <p className="text-chocolate mb-6">
              Faça seu pedido e descubra por que nossos clientes nos recomendam
            </p>
            <Link href="/" className="btn-primary">
              Ver Produtos
            </Link>
          </div>
        </div>
      </main>

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