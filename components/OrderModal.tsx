'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Product, supabase } from '@/lib/supabase'

interface OrderModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

interface OrderForm {
  customer_name: string
  customer_whatsapp: string
  delivery_address: string
  payment_method: string
  delivery_date?: string
  extra_observations?: string
}

export default function OrderModal({ product, isOpen, onClose }: OrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pixKey, setPixKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<OrderForm>()

  const paymentMethod = watch('payment_method')

  // Criar array com as imagens disponíveis
  const images = [
    product?.photo1_url,
    product?.photo2_url,
    product?.photo3_url
  ].filter(Boolean) as string[]

  useEffect(() => {
    if (isOpen) {
      loadSettings()
      reset()
      setCurrentImageIndex(0)
      setShowVideo(false)
      setQuantity(1)
    }
  }, [isOpen, reset])

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99))
  const decreaseQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1))
  const totalPrice = product ? product.price * quantity : 0

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

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0` : url
  }

  const openYouTubeVideo = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : url
    window.open(youtubeUrl, '_blank')
  }

  const loadSettings = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['pix_key', 'webhook_url'])

      if (error) {
        console.error('Erro ao buscar configurações:', error)
        // Usar configurações padrão em caso de erro
        setPixKey('sofiazissou@exemplo.com') // Chave PIX padrão
        return
      }

      settings?.forEach((setting: { key: string, value: string }) => {
        if (setting.key === 'pix_key' && setting.value) {
          setPixKey(setting.value)
        }
        if (setting.key === 'webhook_url' && setting.value) {
          setWebhookUrl(setting.value)
        }
      })
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      // Fallback para chave PIX padrão
      setPixKey('sofiazissou@exemplo.com')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(pixKey)
      toast.success('Chave PIX copiada!')
    } catch (error) {
      toast.error('Erro ao copiar chave PIX')
    }
  }

  const sendToWebhook = async (orderData: any) => {
    if (!webhookUrl) return

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        console.log('Webhook enviado com sucesso')
      }
    } catch (error) {
      console.error('Erro ao enviar para webhook:', error)
    }
  }

  const onSubmit = async (data: OrderForm) => {
    if (!product) return

    setIsSubmitting(true)

    try {
      // Incluir quantidade e total nas observações
      const quantityInfo = quantity > 1 ? `\n[Quantidade: ${quantity} | Total: R$ ${totalPrice.toFixed(2)}]` : '';

      const orderData = {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        customer_name: data.customer_name,
        customer_whatsapp: data.customer_whatsapp.replace(/\D/g, ''),
        delivery_address: data.delivery_address,
        payment_method: data.payment_method,
        delivery_date: data.delivery_date || null,
        extra_observations: (data.extra_observations || '') + quantityInfo,
        status: 'pending'
      }

      console.log('Enviando pedido:', orderData)

      // Usar API route para inserir com service role key
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar pedido')
      }

      const order = await response.json()
      console.log('Pedido salvo:', order)

      // Enviar para webhook se configurado
      if (order && webhookUrl) {
        try {
          await sendToWebhook(order)
        } catch (webhookError) {
          console.error('Erro no webhook (não crítico):', webhookError)
        }
      }

      toast.success('Pedido enviado com sucesso!')
      onClose()
      reset()
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      toast.error(`Erro ao enviar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !product) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-wine">Finalizar Pedido</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Product Media */}
        <div className="border-b border-gray-200">
          {/* Área de Mídia */}
          <div className="relative h-96 bg-gray-100">
            {showVideo && product.youtube_embed_url ? (
              <div className="w-full h-full">
                <iframe
                  src={getYouTubeEmbedUrl(product.youtube_embed_url)}
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
            ) : images.length > 0 ? (
              <>
                <div
                  className="w-full h-full relative cursor-grab active:cursor-grabbing"
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    (e.currentTarget as HTMLDivElement).dataset.touchStartX = String(touch.clientX);
                  }}
                  onTouchEnd={(e) => {
                    const startX = Number((e.currentTarget as HTMLDivElement).dataset.touchStartX);
                    const endX = e.changedTouches[0].clientX;
                    const diff = startX - endX;
                    if (Math.abs(diff) > 50) {
                      if (diff > 0) nextImage();
                      else prevImage();
                    }
                  }}
                >
                  <Image
                    src={images[currentImageIndex]}
                    alt={product.name}
                    fill
                    className="object-contain pointer-events-none"
                  />
                </div>

                {/* Indicadores (só mostra se tiver mais de 1 imagem) */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-wine' : 'bg-gray-400'
                          }`}
                        aria-label={`Ir para imagem ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Botão de Vídeo */}
                {product.youtube_embed_url && (
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
                  <div className="text-6xl mb-2">🍰</div>
                  <p>Produto</p>
                </div>

                {/* Botão de Vídeo para produtos sem imagens */}
                {product.youtube_embed_url && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-red-700 transition-all flex items-center gap-1"
                  >
                    ▶ Vídeo
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Informações do Produto e Quantidade */}
          <div className="p-4">
            <h3 className="text-xl font-semibold text-wine mb-2 text-center">{product.name}</h3>
            <p className="text-gray-600 text-sm text-center mb-3">
              Preço unitário: {formatPrice(product.price)}
            </p>

            {/* Seletor de Quantidade */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="text-gray-700 font-medium">Quantidade:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  className="w-10 h-10 rounded-full bg-pink-soft text-wine font-bold text-xl hover:bg-pink-300 transition-all flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-12 text-center text-xl font-bold text-wine">{quantity}</span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  className="w-10 h-10 rounded-full bg-pink-soft text-wine font-bold text-xl hover:bg-pink-300 transition-all flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-pink-soft rounded-lg p-3 text-center">
              <span className="text-gray-700 font-medium">Total: </span>
              <span className="text-2xl font-bold text-wine">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Nome Completo */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                {...register('customer_name', { required: 'Nome é obrigatório' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                placeholder="Seu nome completo"
              />
              {errors.customer_name && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                WhatsApp *
              </label>
              <input
                type="tel"
                {...register('customer_whatsapp', {
                  required: 'WhatsApp é obrigatório',
                  pattern: {
                    value: /^\(\d{2}\)\s\d{5}-\d{4}$/,
                    message: 'Formato: (11) 99999-9999'
                  }
                })}
                onChange={(e) => {
                  e.target.value = formatWhatsApp(e.target.value)
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                placeholder="(11) 99999-9999"
              />
              {errors.customer_whatsapp && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_whatsapp.message}</p>
              )}
            </div>

            {/* Endereço de Entrega */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Endereço de Entrega *
              </label>
              <textarea
                {...register('delivery_address', { required: 'Endereço é obrigatório' })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                placeholder="Rua, número, bairro, cidade"
              />
              {errors.delivery_address && (
                <p className="text-red-500 text-sm mt-1">{errors.delivery_address.message}</p>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Forma de Pagamento *
              </label>
              <select
                {...register('payment_method', { required: 'Selecione a forma de pagamento' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
              >
                <option value="">Selecione a forma de pagamento</option>
                <option value="pix">PIX</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
              {errors.payment_method && (
                <p className="text-red-500 text-sm mt-1">{errors.payment_method.message}</p>
              )}

              {/* PIX Info */}
              {paymentMethod === 'pix' && pixKey && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium mb-2">Chave PIX:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white p-2 rounded border text-green-800 break-all">
                      {pixKey}
                    </code>
                    <button
                      type="button"
                      onClick={copyPixKey}
                      className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {/* Cartão Info */}
              {paymentMethod === 'cartao' && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    💳 Levaremos a maquininha no momento da entrega
                  </p>
                </div>
              )}
            </div>

            {/* Data de Entrega (só para encomendas) */}
            {product.is_special_order && (
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Data de Entrega *
                </label>
                <input
                  type="date"
                  {...register('delivery_date', {
                    required: product.is_special_order ? 'Data de entrega é obrigatória para encomendas' : false
                  })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                />
                {errors.delivery_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.delivery_date.message}</p>
                )}
              </div>
            )}

            {/* Observações Extras */}
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Observações Extras
              </label>
              <textarea
                {...register('extra_observations')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wine focus:border-wine text-lg"
                placeholder="Alguma observação especial sobre o pedido..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
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
                'Finalizar Pedido'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}