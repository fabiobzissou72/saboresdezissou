'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Product } from '@/lib/supabase'

interface ProductCardProps {
  product: Product
  onOrder: (product: Product) => void
}

export default function ProductCard({ product, onOrder }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  // Criar array com as imagens disponíveis
  const images = [
    product.photo1_url,
    product.photo2_url,
    product.photo3_url
  ].filter(Boolean) as string[]

  const hasImages = images.length > 0
  const hasVideo = !!product.youtube_embed_url

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  return (
    <div className="product-card">
      {/* Área de Mídia */}
      <div className="relative h-64 bg-gray-100">
        {showVideo && hasVideo ? (
          <div className="w-full h-full">
            <iframe
              src={getYouTubeEmbedUrl(product.youtube_embed_url!)}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
              aria-label="Fechar vídeo"
            >
              ✕
            </button>
          </div>
        ) : hasImages ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
            />

            {/* Navegação de Imagens */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  aria-label="Imagem anterior"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                  aria-label="Próxima imagem"
                >
                  →
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                      aria-label={`Ir para imagem ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Botão de Vídeo */}
            {hasVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-red-700 transition-all flex items-center gap-1"
              >
                ▶ Vídeo
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🍰</div>
              <p>Sem imagem</p>
            </div>
          </div>
        )}

        {/* Badge do tipo de produto */}
        <div className="absolute top-2 right-2">
          <span className="bg-wine text-white px-3 py-1 rounded-full text-sm font-medium">
            {product.is_daily_product ? 'Produto do Dia' : 'Encomenda'}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-wine line-clamp-2 flex-1">
            {product.name}
          </h3>
        </div>

        {/* Categoria */}
        {(product as any).category?.name && (
          <div className="mb-2">
            <span className="inline-block bg-pink-soft text-wine px-2 py-1 rounded-full text-xs font-medium">
              📁 {(product as any).category.name}
            </span>
          </div>
        )}

        {product.description && (
          <p className="text-gray-700 mb-2 line-clamp-3 text-sm">
            {product.description}
          </p>
        )}

        {product.observations && (
          <p className="text-chocolate text-xs mb-3 italic line-clamp-2">
            {product.observations}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-wine">
            {formatPrice(product.price)}
          </div>

          <button
            onClick={() => onOrder(product)}
            className="btn-primary"
          >
            🛒 Fazer Pedido
          </button>
        </div>
      </div>
    </div>
  )
}