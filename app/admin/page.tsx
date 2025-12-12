'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabase = createClient(
  'https://bzelizubsanqvsqbvzdx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZWxpenVic2FucXZzcWJ2emR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgwMTIwMywiZXhwIjoyMDc0Mzc3MjAzfQ.CcdfjbBJVtbbKrtItyc201Xo1aA6AUFfMuOzX1Aj74c'
)

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isInitializing, setIsInitializing] = useState(true)

  // Estados dos dados
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [newsletter, setNewsletter] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])

  // Estados dos modais
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState<any>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showEditOrder, setShowEditOrder] = useState<any>(null)

  // Estados para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [compactView, setCompactView] = useState(false)

  // Estados para avaliações
  const [reviewsCurrentPage, setReviewsCurrentPage] = useState(1)
  const [reviewsPerPage] = useState(10)
  const [reviewsStatusFilter, setReviewsStatusFilter] = useState('all')
  const [reviewsSearchTerm, setReviewsSearchTerm] = useState('')
  const [reviewsCompactView, setReviewsCompactView] = useState(false)

  // Estados para newsletter
  const [newsletterCurrentPage, setNewsletterCurrentPage] = useState(1)
  const [newsletterPerPage] = useState(15)
  const [newsletterSearchTerm, setNewsletterSearchTerm] = useState('')
  const [newsletterCompactView, setNewsletterCompactView] = useState(false)
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])
  const [campaignSubSection, setCampaignSubSection] = useState('subscribers')

  // Estados para clientes
  const [clientsCurrentPage, setClientsCurrentPage] = useState(1)
  const [clientsPerPage] = useState(15)
  const [clientsSearchTerm, setClientsSearchTerm] = useState('')
  const [clientsCompactView, setClientsCompactView] = useState(false)

  // Estados de upload
  const [uploading1, setUploading1] = useState(false)
  const [uploading2, setUploading2] = useState(false)
  const [uploading3, setUploading3] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingPwaLogo, setUploadingPwaLogo] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState<any>({})

  // Verificar se já está logado ao inicializar
  useEffect(() => {
    const savedAuth = localStorage.getItem('sabores-admin-auth')
    const savedExpiry = localStorage.getItem('sabores-admin-auth-expiry')

    if (savedAuth && savedExpiry) {
      const now = new Date().getTime()
      const expiryTime = parseInt(savedExpiry)

      if (now < expiryTime) {
        setIsLoggedIn(true)
      } else {
        // Login expirado, limpar
        localStorage.removeItem('sabores-admin-auth')
        localStorage.removeItem('sabores-admin-auth-expiry')
      }
    }

    setIsInitializing(false)
  }, [])

  // Carregar dados
  const loadAllData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes, ordersRes, reviewsRes, newsletterRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
        supabase.from('system_settings').select('*')
      ])

      setProducts(productsRes.data || [])
      setCategories(categoriesRes.data || [])
      setOrders(ordersRes.data || [])
      setReviews(reviewsRes.data || [])
      setNewsletter(newsletterRes.data || [])

      // Extrair clientes únicos dos pedidos
      const ordersData = ordersRes.data || []
      const uniqueClients = ordersData.reduce((clients: any[], order: any) => {
        const existingClient = clients.find(c => c.whatsapp === order.customer_whatsapp)

        if (!existingClient) {
          clients.push({
            id: order.customer_whatsapp,
            name: order.customer_name,
            whatsapp: order.customer_whatsapp,
            delivery_address: order.delivery_address,
            total_orders: 1,
            total_spent: order.product_price || 0,
            last_order: order.created_at,
            created_at: order.created_at
          })
        } else {
          existingClient.total_orders += 1
          existingClient.total_spent += (order.product_price || 0)
          if (new Date(order.created_at) > new Date(existingClient.last_order)) {
            existingClient.last_order = order.created_at
            existingClient.delivery_address = order.delivery_address
          }
        }

        return clients
      }, [])

      setClients(uniqueClients)

      // Garantir que as configurações necessárias existem
      let currentSettings = settingsRes.data || []
      const hasNewsletterWebhook = currentSettings.some(s => s.key === 'webhook_newsletter_url')
      const hasPwaLogo = currentSettings.some(s => s.key === 'pwa_logo_url')

      const missingConfigs = []
      if (!hasNewsletterWebhook) {
        missingConfigs.push({
          key: 'webhook_newsletter_url',
          value: '',
          description: 'URL do webhook para campanhas de newsletter'
        })
      }
      if (!hasPwaLogo) {
        missingConfigs.push({
          key: 'pwa_logo_url',
          value: '',
          description: 'URL do logo para PWA'
        })
      }

      if (missingConfigs.length > 0) {
        try {
          await supabase.from('system_settings').insert(missingConfigs)
          // Recarregar configurações
          const { data: newSettings } = await supabase.from('system_settings').select('*')
          currentSettings = newSettings || currentSettings
        } catch (error) {
          console.warn('Erro ao adicionar configurações:', error)
        }
      }

      setSettings(currentSettings)

      console.log('Produtos carregados:', productsRes.data?.length)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setMessage('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn && !isInitializing) {
      loadAllData()
    }
  }, [isLoggedIn, isInitializing])

  // LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if ((username === 'sofiazissou' && password === 'Sjz10041973@') ||
        (username === 'fabiozissou' && password === 'Fbz12061972@')) {

      // Salvar autenticação no localStorage com expiração de 24 horas
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000) // 24 horas
      localStorage.setItem('sabores-admin-auth', 'true')
      localStorage.setItem('sabores-admin-auth-expiry', expiryTime.toString())

      setIsLoggedIn(true)
      setMessage('✅ Login realizado com sucesso!')
    } else {
      setMessage('❌ Usuário ou senha incorretos!')
    }
  }

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('sabores-admin-auth')
    localStorage.removeItem('sabores-admin-auth-expiry')
    setIsLoggedIn(false)
    setMessage('Logout realizado com sucesso!')
  }

  // UPLOAD DE LOGO
  const uploadLogo = async (file: File, logoType: 'site' | 'pwa'): Promise<string | null> => {
    if (logoType === 'site') setUploadingLogo(true)
    if (logoType === 'pwa') setUploadingPwaLogo(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${logoType}-${Date.now()}.${fileExt}`

      // Criar bucket se não existir
      await supabase.storage.createBucket('logos', { public: true }).catch(() => {})

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      // Atualizar configuração automaticamente
      const settingKey = logoType === 'site' ? 'site_logo_url' : 'pwa_logo_url'
      await updateSetting(settingKey, publicUrl)

      setMessage(`✅ Logo ${logoType === 'site' ? 'do site' : 'PWA'} enviado com sucesso!`)
      return publicUrl
    } catch (error: any) {
      console.error('Erro no upload do logo:', error)
      setMessage(`❌ Erro no upload: ${error.message}`)
      return null
    } finally {
      if (logoType === 'site') setUploadingLogo(false)
      if (logoType === 'pwa') setUploadingPwaLogo(false)
    }
  }

  // UPLOAD DE IMAGEM
  const uploadImage = async (file: File, photoNumber: number): Promise<string | null> => {
    if (photoNumber === 1) setUploading1(true)
    if (photoNumber === 2) setUploading2(true)
    if (photoNumber === 3) setUploading3(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      // Criar bucket se não existir
      await supabase.storage.createBucket('product-images', { public: true }).catch(() => {})

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      const publicUrl = publicUrlData.publicUrl

      // Atualizar estado local
      setUploadedUrls((prev: any) => ({
        ...prev,
        [`photo${photoNumber}_url`]: publicUrl
      }))

      setMessage(`✅ Foto ${photoNumber} enviada com sucesso!`)
      return publicUrl

    } catch (error: any) {
      console.error('Erro no upload:', error)
      setMessage(`❌ Erro no upload: ${error.message}`)
      return null
    } finally {
      if (photoNumber === 1) setUploading1(false)
      if (photoNumber === 2) setUploading2(false)
      if (photoNumber === 3) setUploading3(false)
    }
  }

  // HANDLE UPLOAD LOGO
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, logoType: 'site' | 'pwa') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage('❌ Logo muito grande. Máximo 2MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('❌ Apenas imagens são permitidas.')
      return
    }

    await uploadLogo(file, logoType)
  }

  // HANDLE UPLOAD
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, photoNumber: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Arquivo muito grande. Máximo 5MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setMessage('❌ Apenas imagens são permitidas.')
      return
    }

    await uploadImage(file, photoNumber)
  }

  // ADICIONAR PRODUTO
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('⏳ Salvando produto...')

    try {
      const formData = new FormData(e.target as HTMLFormElement)

      const productData = {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || '',
        observations: (formData.get('observations') as string) || '',
        price: parseFloat(formData.get('price') as string),
        category_id: (formData.get('category_id') as string) || null,
        is_daily_product: formData.get('type') === 'daily',
        is_special_order: formData.get('type') === 'special',
        photo1_url: uploadedUrls.photo1_url || '',
        photo2_url: uploadedUrls.photo2_url || '',
        photo3_url: uploadedUrls.photo3_url || '',
        youtube_embed_url: (formData.get('youtube_embed_url') as string) || '',
        is_active: true
      }

      console.log('Salvando produto:', productData)

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()

      if (error) throw error

      console.log('Produto salvo:', data)
      setMessage('✅ Produto adicionado com sucesso!')
      setShowAddProduct(false)
      setUploadedUrls({})

      // Recarregar produtos
      await loadAllData()

    } catch (error: any) {
      console.error('Erro:', error)
      setMessage(`❌ Erro ao salvar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // EDITAR PRODUTO
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditProduct) return

    setLoading(true)
    setMessage('⏳ Atualizando produto...')

    try {
      const formData = new FormData(e.target as HTMLFormElement)

      const productData = {
        name: formData.get('name') as string,
        description: (formData.get('description') as string) || '',
        observations: (formData.get('observations') as string) || '',
        price: parseFloat(formData.get('price') as string),
        category_id: (formData.get('category_id') as string) || null,
        is_daily_product: formData.get('type') === 'daily',
        is_special_order: formData.get('type') === 'special',
        photo1_url: uploadedUrls.photo1_url || showEditProduct.photo1_url || '',
        photo2_url: uploadedUrls.photo2_url || showEditProduct.photo2_url || '',
        photo3_url: uploadedUrls.photo3_url || showEditProduct.photo3_url || '',
        youtube_embed_url: (formData.get('youtube_embed_url') as string) || '',
        is_active: formData.get('is_active') === 'true'
      }

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', showEditProduct.id)

      if (error) throw error

      setMessage('✅ Produto atualizado com sucesso!')
      setShowEditProduct(null)
      setUploadedUrls({})
      await loadAllData()

    } catch (error: any) {
      console.error('Erro:', error)
      setMessage(`❌ Erro ao atualizar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // DELETAR PRODUTO
  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage('✅ Produto excluído com sucesso!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro ao excluir: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ADICIONAR CATEGORIA
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const name = formData.get('name') as string
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      const { error } = await supabase
        .from('categories')
        .insert([{
          name,
          slug,
          description: (formData.get('description') as string) || '',
          is_active: true
        }])

      if (error) throw error

      setMessage('✅ Categoria adicionada!')
      setShowAddCategory(false)
      await loadAllData()

    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ATUALIZAR STATUS
  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      setMessage('✅ Status atualizado!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`)
    }
  }

  // DELETAR PEDIDO
  const deleteOrder = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage('✅ Pedido excluído com sucesso!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro ao excluir: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // EDITAR PEDIDO
  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showEditOrder) return

    setLoading(true)
    setMessage('⏳ Atualizando pedido...')

    try {
      const formData = new FormData(e.target as HTMLFormElement)

      const orderData = {
        customer_name: formData.get('customer_name') as string,
        customer_whatsapp: formData.get('customer_whatsapp') as string,
        delivery_address: formData.get('delivery_address') as string,
        product_price: parseFloat(formData.get('product_price') as string),
        status: formData.get('status') as string,
        extra_observations: (formData.get('extra_observations') as string) || ''
      }

      const { error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', showEditOrder.id)

      if (error) throw error

      setMessage('✅ Pedido atualizado com sucesso!')
      setShowEditOrder(null)
      await loadAllData()

    } catch (error: any) {
      console.error('Erro:', error)
      setMessage(`❌ Erro ao atualizar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // CALCULAR ESTATÍSTICAS DO CLIENTE
  const getClientStats = (clientWhatsApp: string) => {
    const clientOrders = orders.filter(order => order.customer_whatsapp === clientWhatsApp)
    const totalOrders = clientOrders.length
    const lastOrder = clientOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    const totalSpent = clientOrders.reduce((sum: number, order: any) => sum + (order.product_price || 0), 0)

    return {
      totalOrders,
      lastOrder,
      totalSpent
    }
  }

  // FORMATAR NÚMERO WHATSAPP
  const formatWhatsAppLink = (whatsapp: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, '')
    return `https://wa.me/55${cleanNumber}`
  }

  // FILTRAR E PAGINAR PEDIDOS
  const getFilteredOrders = () => {
    let filtered = orders

    // Filtrar por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filtrar por busca (nome do cliente ou produto)
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_whatsapp.includes(searchTerm)
      )
    }

    return filtered
  }

  const getPaginatedOrders = () => {
    const filtered = getFilteredOrders()
    const startIndex = (currentPage - 1) * ordersPerPage
    const endIndex = startIndex + ordersPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalPages = () => {
    const filtered = getFilteredOrders()
    return Math.ceil(filtered.length / ordersPerPage)
  }

  // Reset página quando filtros mudam
  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter)
    setCurrentPage(1)
  }

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch)
    setCurrentPage(1)
  }

  // FILTRAR E PAGINAR AVALIAÇÕES
  const getFilteredReviews = () => {
    let filtered = reviews

    // Filtrar por status de aprovação
    if (reviewsStatusFilter === 'approved') {
      filtered = filtered.filter(review => review.is_approved === true)
    } else if (reviewsStatusFilter === 'pending') {
      filtered = filtered.filter(review => review.is_approved === false)
    }

    // Filtrar por busca (nome do cliente ou comentário)
    if (reviewsSearchTerm) {
      filtered = filtered.filter(review =>
        review.customer_name.toLowerCase().includes(reviewsSearchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(reviewsSearchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const getPaginatedReviews = () => {
    const filtered = getFilteredReviews()
    const startIndex = (reviewsCurrentPage - 1) * reviewsPerPage
    const endIndex = startIndex + reviewsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getReviewsTotalPages = () => {
    const filtered = getFilteredReviews()
    return Math.ceil(filtered.length / reviewsPerPage)
  }

  const handleReviewsFilterChange = (newFilter: string) => {
    setReviewsStatusFilter(newFilter)
    setReviewsCurrentPage(1)
  }

  const handleReviewsSearchChange = (newSearch: string) => {
    setReviewsSearchTerm(newSearch)
    setReviewsCurrentPage(1)
  }

  // FILTRAR E PAGINAR NEWSLETTER
  const getFilteredNewsletter = () => {
    let filtered = newsletter

    // Filtrar por busca (nome ou whatsapp)
    if (newsletterSearchTerm) {
      filtered = filtered.filter(subscriber =>
        subscriber.name.toLowerCase().includes(newsletterSearchTerm.toLowerCase()) ||
        subscriber.whatsapp.includes(newsletterSearchTerm)
      )
    }

    return filtered
  }

  const getPaginatedNewsletter = () => {
    const filtered = getFilteredNewsletter()
    const startIndex = (newsletterCurrentPage - 1) * newsletterPerPage
    const endIndex = startIndex + newsletterPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getNewsletterTotalPages = () => {
    const filtered = getFilteredNewsletter()
    return Math.ceil(filtered.length / newsletterPerPage)
  }

  const handleNewsletterSearchChange = (newSearch: string) => {
    setNewsletterSearchTerm(newSearch)
    setNewsletterCurrentPage(1)
  }

  // FILTRAR E PAGINAR CLIENTES
  const getFilteredClients = () => {
    let filtered = clients

    // Filtrar por busca (nome, whatsapp ou endereço)
    if (clientsSearchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(clientsSearchTerm.toLowerCase()) ||
        client.whatsapp.includes(clientsSearchTerm) ||
        (client.delivery_address && client.delivery_address.toLowerCase().includes(clientsSearchTerm.toLowerCase()))
      )
    }

    return filtered.sort((a, b) => new Date(b.last_order).getTime() - new Date(a.last_order).getTime())
  }

  const getPaginatedClients = () => {
    const filtered = getFilteredClients()
    const startIndex = (clientsCurrentPage - 1) * clientsPerPage
    const endIndex = startIndex + clientsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const getClientsTotalPages = () => {
    const filtered = getFilteredClients()
    return Math.ceil(filtered.length / clientsPerPage)
  }

  const handleClientsSearchChange = (newSearch: string) => {
    setClientsSearchTerm(newSearch)
    setClientsCurrentPage(1)
  }

  // DELETAR SUBSCRIBER
  const deleteSubscriber = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este assinante?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage('✅ Assinante removido com sucesso!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro ao remover: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ENVIAR CAMPANHA VIA WEBHOOK
  const sendCampaign = async (campaignData: any) => {
    setLoading(true)
    setMessage('⏳ Preparando campanha...')

    try {
      const recipients = selectedSubscribers.length > 0
        ? newsletter.filter(sub => selectedSubscribers.includes(sub.id))
        : newsletter

      // Personalizar mensagens com variáveis
      const personalizedMessages = recipients.map(recipient => {
        let personalizedMessage = campaignData.message
          .replace(/\{\{nome\}\}/g, recipient.name)
          .replace(/\{\{whatsapp\}\}/g, '(11) 99999-9999') // Número da confeitaria
          .replace(/\{\{link_produtos\}\}/g, window.location.origin)

        return {
          to: `55${recipient.whatsapp.replace(/\D/g, '')}`, // Formato internacional
          message: personalizedMessage,
          recipient_name: recipient.name
        }
      })

      setMessage('📤 Enviando mensagens via webhook...')

      // Usar configuração específica para newsletter
      const webhookSetting = settings.find(s => s.key === 'webhook_newsletter_url')
      const webhookUrl = webhookSetting?.value

      if (!webhookUrl) {
        throw new Error('URL do webhook newsletter não configurada. Configure em Configurações > webhook_newsletter_url')
      }

      // Enviar para webhook configurado
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'newsletter_campaign',
          campaign_title: campaignData.title,
          message_template: campaignData.message,
          recipients: personalizedMessages,
          total_recipients: personalizedMessages.length,
          batch_size: 10,
          delay_between_messages: 2000,
          timestamp: new Date().toISOString()
        })
      })

      if (!webhookResponse.ok) {
        throw new Error('Falha na comunicação com webhook WhatsApp')
      }

      const webhookResult = await webhookResponse.json()

      // Salvar campanha no histórico
      const campaign = {
        id: Date.now().toString(),
        title: campaignData.title,
        message: campaignData.message,
        recipients_count: recipients.length,
        sent_at: new Date().toISOString(),
        status: webhookResult.success ? 'sent' : 'failed',
        webhook_response: webhookResult,
        success_count: webhookResult.success_count || 0,
        failed_count: webhookResult.failed_count || 0
      }

      // Salvar campanha no Supabase (se tabela existir)
      try {
        const { error: insertError } = await supabase.from('newsletter_campaigns').insert([{
          title: campaign.title,
          message: campaign.message,
          recipients_count: campaign.recipients_count,
          status: campaign.status,
          success_count: campaign.success_count,
          failed_count: campaign.failed_count,
          webhook_response: campaign.webhook_response
        }])

        if (insertError && !insertError.message.includes('does not exist')) {
          console.warn('Erro ao salvar campanha:', insertError)
        }
      } catch (dbError) {
        // Tabela pode não existir ainda, ignorar erro
        console.log('Newsletter campaigns table não existe ainda')
      }

      setCampaigns(prev => [campaign, ...prev])

      if (webhookResult.success) {
        setMessage(`✅ Campanha enviada com sucesso! ${campaign.success_count}/${recipients.length} mensagens entregues.`)
      } else {
        setMessage(`⚠️ Campanha processada com problemas. ${campaign.success_count} sucessos, ${campaign.failed_count} falhas.`)
      }

      setShowCampaignModal(false)
      setSelectedSubscribers([])
    } catch (error: any) {
      console.error('Erro ao enviar campanha:', error)
      setMessage(`❌ Erro ao enviar campanha: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // TEMPLATES DE MENSAGENS
  const messageTemplates = [
    {
      id: 'promo',
      title: '🎉 Promoção Especial',
      template: 'Olá {{nome}}! 🍰\n\nTemos uma promoção especial só para você!\n\n🎯 [DESCRIÇÃO DA PROMOÇÃO]\n💰 Desconto de [X]% em todos os produtos\n⏰ Válido até [DATA]\n\nFaça já seu pedido: {{link_produtos}}\n\nSabores de Zissou - Confeitaria Artesanal 💝'
    },
    {
      id: 'novidade',
      title: '✨ Novo Produto',
      template: 'Oi {{nome}}! 🌟\n\nTemos uma novidade deliciosa para você!\n\n🆕 [NOME DO PRODUTO]\n📝 [DESCRIÇÃO]\n💲 Por apenas R$ [PREÇO]\n\nVenha experimentar: {{link_produtos}}\n\nSabores de Zissou - Sempre inovando para você! 🍰'
    },
    {
      id: 'sazonal',
      title: '🎃 Produto Sazonal',
      template: 'Olá {{nome}}! 🎊\n\n[ÉPOCA/EVENTO] chegou e trouxe sabores especiais!\n\n🌟 [PRODUTO SAZONAL]\n🎯 Disponível por tempo limitado\n📞 Faça sua encomenda já!\n\nPedidos: {{whatsapp}}\n\nSabores de Zissou - Sabores únicos para momentos especiais! 💖'
    }
  ]

  // APROVAR AVALIAÇÃO
  const approveReview = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id)

      if (error) throw error
      setMessage('✅ Avaliação aprovada!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`)
    }
  }

  // DESAPROVAR AVALIAÇÃO
  const unapproveReview = async (id: string) => {
    if (!confirm('Tem certeza que deseja desaprovar esta avaliação? Ela não aparecerá mais na home.')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', id)

      if (error) throw error
      setMessage('✅ Avaliação desaprovada!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`)
    }
  }

  // DELETAR AVALIAÇÃO
  const deleteReview = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir permanentemente esta avaliação?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMessage('✅ Avaliação excluída permanentemente!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ATUALIZAR CONFIGURAÇÃO
  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ value })
        .eq('key', key)

      if (error) throw error
      setMessage('✅ Configuração salva!')
      await loadAllData()
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`)
    }
  }

  // TELA DE LOADING INICIAL
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-rose-600 mx-auto mb-4"></div>
          <p className="text-rose-800 text-lg font-semibold">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // TELA DE LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-rose-800 mb-2">🍰 Sabores de Zissou</h1>
            <p className="text-rose-600 font-medium">Painel Administrativo</p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-rose-700 text-sm font-semibold mb-2">Usuário</label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-3 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-500"
                placeholder="Digite seu usuário"
              />
            </div>
            <div>
              <label className="block text-rose-700 text-sm font-semibold mb-2">Senha</label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-rose-300 rounded-md focus:ring-2 focus:ring-rose-500"
                placeholder="Digite sua senha"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-3 px-4 rounded-lg hover:bg-rose-700 font-semibold"
            >
              ENTRAR
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ADMIN PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-rose-800">🍰 Sabores de Zissou</h1>
              <span className="ml-3 px-3 py-1 bg-rose-100 text-rose-800 text-sm font-medium rounded-full">Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              {loading && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Carregando...
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 text-sm"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MENSAGEM */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
            <button onClick={() => setMessage('')} className="ml-4 underline">✖</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* MENU LATERAL */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu</h2>
              <nav className="space-y-2">
                {[
                  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
                  { key: 'products', label: 'Produtos', icon: '🍰', count: products.length },
                  { key: 'categories', label: 'Categorias', icon: '📁', count: categories.length },
                  { key: 'orders', label: 'Pedidos', icon: '📦', count: orders.length },
                  { key: 'reviews', label: 'Avaliações', icon: '⭐', count: reviews.length },
                  { key: 'clients', label: 'Clientes', icon: '👥', count: clients.length },
                  { key: 'newsletter', label: 'Newsletter', icon: '📧', count: newsletter.length },
                  { key: 'settings', label: 'Configurações', icon: '⚙️' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                      activeSection === item.key
                        ? 'bg-rose-100 text-rose-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center">
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </span>
                    {item.count !== undefined && (
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-4">

              {/* DASHBOARD */}
              {activeSection === 'dashboard' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Dashboard</h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-xl font-bold text-blue-700">{products.length}</div>
                      <div className="text-blue-600 font-medium">Produtos</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-xl font-bold text-green-700">{orders.length}</div>
                      <div className="text-green-600 font-medium">Pedidos</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="text-xl font-bold text-yellow-700">{reviews.length}</div>
                      <div className="text-yellow-600 font-medium">Avaliações</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-xl font-bold text-purple-700">{newsletter.length}</div>
                      <div className="text-purple-600 font-medium">Newsletter</div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="text-green-800 font-bold text-lg mb-2">
                      ✅ Sistema 100% FUNCIONAL!
                    </div>
                    <div className="text-green-700">
                      Upload de imagens ✅ | CRUD completo ✅ | Todas tabelas conectadas ✅
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUTOS */}
              {activeSection === 'products' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg font-bold text-gray-900">🍰 Produtos ({products.length})</h2>
                    <button
                      onClick={() => setShowAddProduct(true)}
                      className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 font-medium text-sm"
                    >
                      ➕ ADICIONAR PRODUTO
                    </button>
                  </div>

                  <div className="space-y-6">
                    {products.map((product) => (
                      <div key={product.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{product.name}</h3>
                            {product.description && (
                              <p className="text-gray-600 mb-2">{product.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mb-3">
                              <span className="font-bold text-green-600 text-lg">💰 R$ {product.price?.toFixed(2)}</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                product.is_daily_product ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {product.is_daily_product ? '🍰 Produto do Dia' : '🎂 Encomenda'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.is_active ? '✅ Ativo' : '❌ Inativo'}
                              </span>
                            </div>

                            {/* IMAGENS */}
                            {(product.photo1_url || product.photo2_url || product.photo3_url) && (
                              <div className="flex gap-3 mt-4">
                                {product.photo1_url && (
                                  <div className="relative">
                                    <Image
                                      src={product.photo1_url}
                                      alt="Foto 1"
                                      width={120}
                                      height={120}
                                      className="rounded-lg object-cover border-2 border-green-200"
                                    />
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">1</span>
                                  </div>
                                )}
                                {product.photo2_url && (
                                  <div className="relative">
                                    <Image
                                      src={product.photo2_url}
                                      alt="Foto 2"
                                      width={120}
                                      height={120}
                                      className="rounded-lg object-cover border-2 border-blue-200"
                                    />
                                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">2</span>
                                  </div>
                                )}
                                {product.photo3_url && (
                                  <div className="relative">
                                    <Image
                                      src={product.photo3_url}
                                      alt="Foto 3"
                                      width={120}
                                      height={120}
                                      className="rounded-lg object-cover border-2 border-purple-200"
                                    />
                                    <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-bold">3</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col space-y-2 ml-6">
                            <button
                              onClick={() => setShowEditProduct(product)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 font-medium text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 font-medium text-sm"
                            >
                              🗑️ Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {products.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">🍰</div>
                        <div className="text-lg font-bold">Nenhum produto cadastrado.</div>
                        <div className="text-lg">Clique em "ADICIONAR PRODUTO" para começar!</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CATEGORIAS */}
              {activeSection === 'categories' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg font-bold text-gray-900">📁 Categorias</h2>
                    <button
                      onClick={() => setShowAddCategory(true)}
                      className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 font-medium text-sm"
                    >
                      ➕ ADICIONAR CATEGORIA
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border-2 border-gray-200 rounded-lg p-4">
                        <h3 className="font-bold text-gray-900">{category.name}</h3>
                        <p className="text-gray-600 text-sm">Slug: {category.slug}</p>
                        {category.description && (
                          <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PEDIDOS */}
              {activeSection === 'orders' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-lg font-bold text-gray-900">📦 Pedidos ({getFilteredOrders().length} de {orders.length})</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCompactView(!compactView)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          compactView
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {compactView ? '📋 Compacto' : '📄 Detalhado'}
                      </button>
                    </div>
                  </div>

                  {/* FILTROS E BUSCA */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          placeholder="Nome, produto ou WhatsApp..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => handleFilterChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Todos os Status</option>
                          <option value="pending">⏳ Pendentes</option>
                          <option value="completed">✅ Concluídos</option>
                          <option value="cancelled">❌ Cancelados</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setCurrentPage(1)
                          }}
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                        >
                          🔄 Limpar Filtros
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LISTA DE PEDIDOS */}
                  <div className={compactView ? "space-y-3" : "space-y-6"}>
                    {getPaginatedOrders().map((order) => {
                      const clientStats = getClientStats(order.customer_whatsapp)

                      if (compactView) {
                        // VISUALIZAÇÃO COMPACTA
                        return (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <div className="font-bold text-gray-900">{order.customer_name}</div>
                                  <div className="text-gray-600">{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                                </div>
                                <div>
                                  <div className="text-gray-800">{order.product_name}</div>
                                  <div className="text-green-600 font-bold">R$ {order.product_price?.toFixed(2)}</div>
                                </div>
                                <div>
                                  <a
                                    href={formatWhatsAppLink(order.customer_whatsapp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-700 font-medium underline"
                                  >
                                    {order.customer_whatsapp}
                                  </a>
                                  <div className="text-blue-600 text-xs">{clientStats.totalOrders} pedidos</div>
                                </div>
                                <div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {order.status === 'completed' ? '✅ Concluído' :
                                     order.status === 'pending' ? '⏳ Pendente' :
                                     '❌ Cancelado'}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setShowEditOrder(order)}
                                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                  >
                                    ✏️
                                  </button>
                                  {order.status === 'pending' && (
                                    <button
                                      onClick={() => updateOrderStatus(order.id, 'completed')}
                                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                    >
                                      ✅
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteOrder(order.id)}
                                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      } else {
                        // VISUALIZAÇÃO DETALHADA (original)
                        return (
                          <div key={order.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                              {/* INFORMAÇÕES PRINCIPAIS */}
                              <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{order.customer_name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {order.status === 'completed' ? '✅ Concluído' :
                                       order.status === 'pending' ? '⏳ Pendente' :
                                       '❌ Cancelado'}
                                    </span>
                                  </div>
                                  <div className="text-right text-sm text-gray-500">
                                    <div>📅 {new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                                    {order.updated_at && order.updated_at !== order.created_at && (
                                      <div className="text-blue-600 font-medium">
                                        🔄 {new Date(order.updated_at).toLocaleDateString('pt-BR')}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-gray-800 font-medium">🍰 {order.product_name}</p>
                                  <p className="text-green-600 font-bold text-lg">💰 R$ {order.product_price?.toFixed(2)}</p>
                                  <p className="text-gray-600">📱
                                    <a
                                      href={formatWhatsAppLink(order.customer_whatsapp)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:text-green-700 ml-2 font-medium underline"
                                    >
                                      {order.customer_whatsapp}
                                    </a>
                                  </p>
                                  <p className="text-gray-600">🏠 {order.delivery_address}</p>
                                  <p className="text-gray-600">💳 {order.payment_method}</p>
                                  {order.extra_observations && (
                                    <p className="text-gray-600 italic">📝 {order.extra_observations}</p>
                                  )}
                                </div>
                              </div>

                              {/* ESTATÍSTICAS DO CLIENTE */}
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h4 className="font-bold text-blue-800 mb-3">📊 Histórico</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Pedidos:</span>
                                    <span className="font-bold text-blue-900">{clientStats.totalOrders}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Total:</span>
                                    <span className="font-bold text-blue-900">R$ {clientStats.totalSpent.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* AÇÕES */}
                            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-200">
                              <button
                                onClick={() => setShowEditOrder(order)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-bold text-sm"
                              >
                                ✏️ Editar
                              </button>

                              {order.status === 'pending' && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 font-bold text-sm"
                                >
                                  ✅ Concluir
                                </button>
                              )}

                              <button
                                onClick={() => deleteOrder(order.id)}
                                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 font-bold text-sm"
                              >
                                🗑️ Excluir
                              </button>
                            </div>
                          </div>
                        )
                      }
                    })}

                    {getFilteredOrders().length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">📦</div>
                        <div className="text-lg font-bold">Nenhum pedido encontrado.</div>
                        <div className="text-lg">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Os pedidos aparecerão aqui quando os clientes fizerem compras!'
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
                        ({getFilteredOrders().length} pedidos)
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
                                    ? 'bg-blue-600 text-white'
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
                </div>
              )}

              {/* AVALIAÇÕES */}
              {activeSection === 'reviews' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-base font-bold text-gray-900">⭐ Avaliações ({getFilteredReviews().length} de {reviews.length})</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setReviewsCompactView(!reviewsCompactView)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          reviewsCompactView
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {reviewsCompactView ? '📋 Compacto' : '📄 Detalhado'}
                      </button>
                    </div>
                  </div>

                  {/* FILTROS E BUSCA */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                        <input
                          type="text"
                          value={reviewsSearchTerm}
                          onChange={(e) => handleReviewsSearchChange(e.target.value)}
                          placeholder="Nome ou comentário..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select
                          value={reviewsStatusFilter}
                          onChange={(e) => handleReviewsFilterChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Todas</option>
                          <option value="pending">⏳ Pendentes</option>
                          <option value="approved">✅ Aprovadas</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setReviewsSearchTerm('')
                            setReviewsStatusFilter('all')
                            setReviewsCurrentPage(1)
                          }}
                          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                        >
                          🔄 Limpar Filtros
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LISTA DE AVALIAÇÕES */}
                  <div className={reviewsCompactView ? "space-y-3" : "space-y-6"}>
                    {getPaginatedReviews().map((review) => {

                      if (reviewsCompactView) {
                        // VISUALIZAÇÃO COMPACTA
                        return (
                          <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                                <div>
                                  <div className="font-bold text-gray-900">{review.customer_name}</div>
                                  <div className="text-yellow-400">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <div className="text-gray-800 line-clamp-2">{review.comment}</div>
                                </div>
                                <div>
                                  <div className="text-gray-600 text-xs">
                                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                                  </div>
                                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                                    review.is_approved
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {review.is_approved ? '✅ Aprovada' : '⏳ Pendente'}
                                  </span>
                                </div>
                                <div className="flex gap-2">
                                  {!review.is_approved ? (
                                    <button
                                      onClick={() => approveReview(review.id)}
                                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                    >
                                      ✅
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => unapproveReview(review.id)}
                                      className="bg-orange-600 text-white px-2 py-1 rounded text-xs hover:bg-orange-700"
                                    >
                                      ❌
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteReview(review.id)}
                                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      } else {
                        // VISUALIZAÇÃO DETALHADA
                        return (
                          <div key={review.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                  <h3 className="text-sm font-bold text-gray-900">{review.customer_name}</h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    review.is_approved
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {review.is_approved ? '✅ Aprovada' : '⏳ Pendente'}
                                  </span>
                                </div>

                                <div className="text-yellow-400 text-lg mb-2">
                                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                  <span className="text-gray-600 text-base ml-2">({review.rating}/5 estrelas)</span>
                                </div>

                                <p className="text-gray-700 text-lg italic mb-3">"{review.comment}"</p>

                                {review.photo_url && (
                                  <div className="mb-3">
                                    <img
                                      src={review.photo_url}
                                      alt="Foto da avaliação"
                                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                    />
                                  </div>
                                )}

                                <div className="text-sm text-gray-500">
                                  📅 {new Date(review.created_at).toLocaleDateString('pt-BR')} às {new Date(review.created_at).toLocaleTimeString('pt-BR')}
                                </div>
                              </div>
                            </div>

                            {/* AÇÕES */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                              {!review.is_approved ? (
                                <button
                                  onClick={() => approveReview(review.id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold text-sm"
                                >
                                  ✅ Aprovar
                                </button>
                              ) : (
                                <button
                                  onClick={() => unapproveReview(review.id)}
                                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-bold text-sm"
                                >
                                  ❌ Desaprovar
                                </button>
                              )}

                              <button
                                onClick={() => deleteReview(review.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold text-sm"
                              >
                                🗑️ Excluir Permanentemente
                              </button>
                            </div>
                          </div>
                        )
                      }
                    })}

                    {getFilteredReviews().length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">⭐</div>
                        <div className="text-sm font-bold">Nenhuma avaliação encontrada.</div>
                        <div className="text-lg">
                          {reviewsSearchTerm || reviewsStatusFilter !== 'all'
                            ? 'Tente ajustar os filtros de busca.'
                            : 'As avaliações dos clientes aparecerão aqui!'
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PAGINAÇÃO */}
                  {getReviewsTotalPages() > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Página {reviewsCurrentPage} de {getReviewsTotalPages()}
                        ({getFilteredReviews().length} avaliações)
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setReviewsCurrentPage(Math.max(1, reviewsCurrentPage - 1))}
                          disabled={reviewsCurrentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Anterior
                        </button>

                        {/* Páginas numeradas */}
                        {Array.from({ length: getReviewsTotalPages() }, (_, i) => i + 1)
                          .filter(page =>
                            page === 1 ||
                            page === getReviewsTotalPages() ||
                            Math.abs(page - reviewsCurrentPage) <= 2
                          )
                          .map((page, index, array) => (
                            <span key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => setReviewsCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                  reviewsCurrentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            </span>
                          ))
                        }

                        <button
                          onClick={() => setReviewsCurrentPage(Math.min(getReviewsTotalPages(), reviewsCurrentPage + 1))}
                          disabled={reviewsCurrentPage === getReviewsTotalPages()}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próxima →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* NEWSLETTER */}
              {activeSection === 'newsletter' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-base font-bold text-gray-900">📧 Newsletter ({getFilteredNewsletter().length} assinantes)</h2>
                    <div className="flex items-center gap-3">
                      <div className="flex bg-gray-200 rounded-lg p-1">
                        <button
                          onClick={() => setCampaignSubSection('subscribers')}
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            campaignSubSection === 'subscribers'
                              ? 'bg-white text-gray-900 shadow'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          👥 Assinantes
                        </button>
                        <button
                          onClick={() => setCampaignSubSection('campaigns')}
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            campaignSubSection === 'campaigns'
                              ? 'bg-white text-gray-900 shadow'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          📨 Campanhas
                        </button>
                      </div>
                      <button
                        onClick={() => setNewsletterCompactView(!newsletterCompactView)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          newsletterCompactView
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {newsletterCompactView ? '📋' : '📄'}
                      </button>
                      <button
                        onClick={() => setShowCampaignModal(true)}
                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 font-medium text-sm"
                      >
                        ✉️ Nova Campanha
                      </button>
                    </div>
                  </div>

                  {campaignSubSection === 'subscribers' ? (
                    <div>
                      {/* FILTROS E BUSCA */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Assinantes</label>
                            <input
                              type="text"
                              value={newsletterSearchTerm}
                              onChange={(e) => handleNewsletterSearchChange(e.target.value)}
                              placeholder="Nome ou WhatsApp..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                setNewsletterSearchTerm('')
                                setNewsletterCurrentPage(1)
                                setSelectedSubscribers([])
                              }}
                              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-medium"
                            >
                              🔄 Limpar
                            </button>
                          </div>

                          <div className="flex items-end">
                            <div className="text-sm text-gray-700">
                              {selectedSubscribers.length > 0 && (
                                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
                                  📋 {selectedSubscribers.length} selecionados
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LISTA DE ASSINANTES */}
                      <div className={newsletterCompactView ? "space-y-3" : "space-y-4"}>
                        {/* Checkbox para selecionar todos */}
                        <div className="bg-gray-100 rounded-lg p-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSubscribers.length === getFilteredNewsletter().length && getFilteredNewsletter().length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubscribers(getFilteredNewsletter().map(sub => sub.id))
                                } else {
                                  setSelectedSubscribers([])
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="font-medium text-gray-700">
                              {selectedSubscribers.length === getFilteredNewsletter().length && getFilteredNewsletter().length > 0
                                ? 'Desmarcar todos'
                                : 'Selecionar todos'}
                            </span>
                          </label>
                        </div>

                        {getPaginatedNewsletter().map((subscriber) => {
                          if (newsletterCompactView) {
                            // VISUALIZAÇÃO COMPACTA
                            return (
                              <div key={subscriber.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubscribers.includes(subscriber.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedSubscribers(prev => [...prev, subscriber.id])
                                        } else {
                                          setSelectedSubscribers(prev => prev.filter(id => id !== subscriber.id))
                                        }
                                      }}
                                      className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                      <div>
                                        <div className="font-bold text-gray-900">{subscriber.name}</div>
                                      </div>
                                      <div>
                                        <a
                                          href={`https://wa.me/55${subscriber.whatsapp.replace(/\D/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-600 hover:text-green-700 font-medium"
                                        >
                                          📱 {subscriber.whatsapp}
                                        </a>
                                      </div>
                                      <div className="text-right">
                                        <button
                                          onClick={() => deleteSubscriber(subscriber.id)}
                                          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          } else {
                            // VISUALIZAÇÃO DETALHADA
                            return (
                              <div key={subscriber.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-4 flex-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedSubscribers.includes(subscriber.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedSubscribers(prev => [...prev, subscriber.id])
                                        } else {
                                          setSelectedSubscribers(prev => prev.filter(id => id !== subscriber.id))
                                        }
                                      }}
                                      className="w-5 h-5 text-blue-600 rounded mt-1"
                                    />
                                    <div className="flex-1">
                                      <h3 className="text-sm font-bold text-gray-900 mb-1">{subscriber.name}</h3>
                                      <p className="text-gray-600 mb-2">
                                        <a
                                          href={`https://wa.me/55${subscriber.whatsapp.replace(/\D/g, '')}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-green-600 hover:text-green-700 font-medium underline"
                                        >
                                          📱 {subscriber.whatsapp}
                                        </a>
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        📅 Cadastrado em: {new Date(subscriber.created_at).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => deleteSubscriber(subscriber.id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold text-sm"
                                  >
                                    🗑️ Remover
                                  </button>
                                </div>
                              </div>
                            )
                          }
                        })}

                        {getFilteredNewsletter().length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">📧</div>
                            <div className="text-sm font-bold">Nenhum assinante encontrado.</div>
                            <div className="text-lg">
                              {newsletterSearchTerm
                                ? 'Tente ajustar os filtros de busca.'
                                : 'Os assinantes da newsletter aparecerão aqui!'
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PAGINAÇÃO */}
                      {getNewsletterTotalPages() > 1 && (
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                          <div className="text-sm text-gray-700">
                            Página {newsletterCurrentPage} de {getNewsletterTotalPages()}
                            ({getFilteredNewsletter().length} assinantes)
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setNewsletterCurrentPage(Math.max(1, newsletterCurrentPage - 1))}
                              disabled={newsletterCurrentPage === 1}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ← Anterior
                            </button>

                            {Array.from({ length: getNewsletterTotalPages() }, (_, i) => i + 1)
                              .filter(page =>
                                page === 1 ||
                                page === getNewsletterTotalPages() ||
                                Math.abs(page - newsletterCurrentPage) <= 2
                              )
                              .map((page, index, array) => (
                                <span key={page}>
                                  {index > 0 && array[index - 1] !== page - 1 && (
                                    <span className="px-2 text-gray-400">...</span>
                                  )}
                                  <button
                                    onClick={() => setNewsletterCurrentPage(page)}
                                    className={`px-4 py-2 rounded-lg font-medium ${
                                      newsletterCurrentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                </span>
                              ))
                            }

                            <button
                              onClick={() => setNewsletterCurrentPage(Math.min(getNewsletterTotalPages(), newsletterCurrentPage + 1))}
                              disabled={newsletterCurrentPage === getNewsletterTotalPages()}
                              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Próxima →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* SEÇÃO DE CAMPANHAS */
                    <div>
                      <div className="space-y-4">
                        {campaigns.length > 0 ? (
                          campaigns.map((campaign, index) => (
                            <div key={campaign.id || index} className="border-2 border-gray-200 rounded-xl p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-sm font-bold text-gray-900">{campaign.title}</h3>
                                  <p className="text-sm text-gray-600">
                                    📅 {new Date(campaign.sent_at).toLocaleString('pt-BR')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                    campaign.status === 'failed' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {campaign.status === 'sent' ? '✅ Enviada' :
                                     campaign.status === 'failed' ? '❌ Falhou' :
                                     '⏳ Processando'}
                                  </span>
                                  <div className="text-sm text-gray-600 mt-2">
                                    <p>👥 {campaign.recipients_count} destinatários</p>
                                    {campaign.success_count !== undefined && (
                                      <div className="mt-1">
                                        <p className="text-green-600">✅ {campaign.success_count} sucessos</p>
                                        {campaign.failed_count > 0 && (
                                          <p className="text-red-600">❌ {campaign.failed_count} falhas</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* DETALHES DO WEBHOOK */}
                              {campaign.webhook_response && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                  <h4 className="font-medium text-blue-800 mb-2">🔗 Detalhes do Webhook:</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-blue-700 font-medium">Taxa de Sucesso:</span>
                                      <span className="ml-2 text-blue-900">
                                        {Math.round((campaign.success_count / campaign.recipients_count) * 100)}%
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-blue-700 font-medium">Tempo de Processamento:</span>
                                      <span className="ml-2 text-blue-900">
                                        {campaign.webhook_response.processing_time || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-700 mb-2">📝 Mensagem Template:</h4>
                                <p className="text-gray-700 whitespace-pre-line text-sm">{campaign.message}</p>
                              </div>

                              {/* AÇÕES DA CAMPANHA */}
                              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => {
                                    // Reenviar campanha falhada
                                    if (campaign.failed_count > 0) {
                                      const retry = confirm(`Reenviar para os ${campaign.failed_count} contatos que falharam?`)
                                      if (retry) {
                                        setMessage('🔄 Funcionalidade de reenvio em desenvolvimento...')
                                      }
                                    }
                                  }}
                                  disabled={!campaign.failed_count || campaign.failed_count === 0}
                                  className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  🔄 Reenviar Falhas
                                </button>

                                <button
                                  onClick={() => {
                                    // Duplicar campanha
                                    const messageTextarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement
                                    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement

                                    if (messageTextarea && titleInput) {
                                      titleInput.value = `${campaign.title} (Cópia)`
                                      messageTextarea.value = campaign.message
                                      setShowCampaignModal(true)
                                    }
                                  }}
                                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
                                >
                                  📋 Duplicar
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">📨</div>
                            <div className="text-sm font-bold">Nenhuma campanha enviada ainda.</div>
                            <div className="text-lg">Clique em "Nova Campanha" para começar!</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CLIENTES */}
              {activeSection === 'clients' && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                    <h2 className="text-base font-bold text-gray-900">👥 Clientes ({getFilteredClients().length} total)</h2>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setClientsCompactView(!clientsCompactView)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          clientsCompactView
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {clientsCompactView ? '📋' : '📄'}
                      </button>
                    </div>
                  </div>

                  {/* FILTROS E BUSCA */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Clientes</label>
                        <input
                          type="text"
                          value={clientsSearchTerm}
                          onChange={(e) => handleClientsSearchChange(e.target.value)}
                          placeholder="Nome, WhatsApp ou endereço..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setClientsSearchTerm('')
                            setClientsCurrentPage(1)
                          }}
                          className="w-full bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 font-medium text-sm"
                        >
                          🔄 Limpar Filtros
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LISTA DE CLIENTES */}
                  <div className="space-y-4">
                    {getPaginatedClients().map((client) => (
                      <div key={client.id} className="bg-white border-2 border-gray-200 rounded-lg">
                        {clientsCompactView ? (
                          /* VISÃO COMPACTA */
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900">{client.name}</h3>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <p>📱 {client.whatsapp}</p>
                                  {client.delivery_address && <p>📍 {client.delivery_address}</p>}
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 text-xs">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                  {client.total_orders} pedidos
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                  R$ {client.total_spent.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* VISÃO DETALHADA */
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900 mb-2">{client.name}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                                  <div>
                                    <span className="font-medium">📱 WhatsApp:</span>
                                    <a href={`https://wa.me/55${client.whatsapp.replace(/\D/g, '')}`}
                                       target="_blank"
                                       className="ml-2 text-green-600 hover:text-green-700 font-medium">
                                      {client.whatsapp}
                                    </a>
                                  </div>
                                  {client.delivery_address && (
                                    <div>
                                      <span className="font-medium">📍 Endereço:</span>
                                      <span className="ml-2">{client.delivery_address}</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-medium">📦 Total Pedidos:</span>
                                    <span className="ml-2 text-green-600 font-bold">{client.total_orders}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">💰 Total Gasto:</span>
                                    <span className="ml-2 text-blue-600 font-bold">R$ {client.total_spent.toFixed(2)}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">📅 Último Pedido:</span>
                                    <span className="ml-2">{new Date(client.last_order).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">👤 Cliente desde:</span>
                                    <span className="ml-2">{new Date(client.created_at).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {getFilteredClients().length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">👥</div>
                        <div className="text-sm font-bold">Nenhum cliente encontrado.</div>
                        <div className="text-lg">
                          {clientsSearchTerm
                            ? 'Tente ajustar os filtros de busca.'
                            : 'Os clientes aparecerão aqui quando fizerem pedidos.'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PAGINAÇÃO */}
                  {getClientsTotalPages() > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Página {clientsCurrentPage} de {getClientsTotalPages()}
                        ({getFilteredClients().length} clientes)
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setClientsCurrentPage(Math.max(1, clientsCurrentPage - 1))}
                          disabled={clientsCurrentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Anterior
                        </button>

                        {Array.from({ length: getClientsTotalPages() }, (_, i) => i + 1)
                          .filter(page => {
                            const current = clientsCurrentPage
                            return page === 1 || page === getClientsTotalPages() || (page >= current - 1 && page <= current + 1)
                          })
                          .map((page, index, array) => (
                            <span key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && <span className="px-2">...</span>}
                              <button
                                onClick={() => setClientsCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg ${
                                  page === clientsCurrentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            </span>
                          ))
                        }

                        <button
                          onClick={() => setClientsCurrentPage(Math.min(getClientsTotalPages(), clientsCurrentPage + 1))}
                          disabled={clientsCurrentPage === getClientsTotalPages()}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Próxima →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CONFIGURAÇÕES */}
              {activeSection === 'settings' && (
                <div>
                  <h2 className="text-base font-bold text-gray-900 mb-4">⚙️ Configurações</h2>
                  <div className="space-y-6">
                    {settings.map((setting) => {
                      // Campos especiais para logos com upload
                      if (setting.key === 'site_logo_url' || setting.key === 'pwa_logo_url') {
                        const logoType = setting.key === 'site_logo_url' ? 'site' : 'pwa'
                        const isUploading = logoType === 'site' ? uploadingLogo : uploadingPwaLogo

                        return (
                          <div key={setting.key} className="border-2 border-rose-200 rounded-lg p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              🖼️ {logoType === 'site' ? 'Logo do Site' : 'Logo PWA'} (máx. 2MB)
                            </label>

                            {/* Preview do logo atual */}
                            {setting.value && (
                              <div className="mb-4">
                                <img
                                  src={setting.value}
                                  alt={`Logo ${logoType}`}
                                  className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg bg-white p-2"
                                />
                                <div className="text-sm text-gray-600 mt-2">Logo atual</div>
                              </div>
                            )}

                            {/* Upload de novo logo */}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleLogoUpload(e, logoType)}
                              className="mb-4 w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                            />

                            {isUploading && (
                              <div className="flex items-center mb-4 text-blue-600 font-bold">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                                Enviando logo...
                              </div>
                            )}

                            {/* Campo URL manual (opcional) */}
                            <div className="border-t pt-4">
                              <label className="block text-sm font-medium text-gray-600 mb-2">
                                Ou insira URL manualmente:
                              </label>
                              <input
                                type="text"
                                defaultValue={setting.value}
                                placeholder="https://exemplo.com/logo.png"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                onBlur={(e) => {
                                  if (e.target.value !== setting.value) {
                                    updateSetting(setting.key, e.target.value)
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )
                      }

                      // Campos normais para outras configurações
                      return (
                        <div key={setting.key} className="border-2 border-gray-200 rounded-lg p-4">
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              defaultValue={setting.value}
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                              onBlur={(e) => {
                                if (e.target.value !== setting.value) {
                                  updateSetting(setting.key, e.target.value)
                                }
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* MODAL ADICIONAR PRODUTO */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🍰 ADICIONAR PRODUTO</h3>

            <form onSubmit={handleAddProduct}>
              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    placeholder="Ex: Bolo de Chocolate Delicioso"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                      placeholder="45.90"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select
                      name="type"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="daily">🍰 Produto do Dia</option>
                      <option value="special">🎂 Encomenda Especial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    placeholder="Descrição deliciosa do produto que vai atrair os clientes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="observations"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    placeholder="Ingredientes, alergias, tempo de preparo, etc..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    name="category_id"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* UPLOAD DE FOTOS */}
                <div className="border-t-4 border-rose-200 pt-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">📸 FOTOS DO PRODUTO (máx. 5MB cada)</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* FOTO 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foto 1</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 1)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                      {uploading1 && (
                        <div className="flex items-center mt-3 text-blue-600 font-bold">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Enviando foto 1...
                        </div>
                      )}
                      {uploadedUrls.photo1_url && (
                        <div className="mt-3">
                          <Image
                            src={uploadedUrls.photo1_url}
                            alt="Preview 1"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-4 border-green-200"
                          />
                          <div className="text-green-600 font-bold mt-2">✅ Foto 1 enviada!</div>
                        </div>
                      )}
                    </div>

                    {/* FOTO 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foto 2</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 2)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                      {uploading2 && (
                        <div className="flex items-center mt-3 text-blue-600 font-bold">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Enviando foto 2...
                        </div>
                      )}
                      {uploadedUrls.photo2_url && (
                        <div className="mt-3">
                          <Image
                            src={uploadedUrls.photo2_url}
                            alt="Preview 2"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-4 border-blue-200"
                          />
                          <div className="text-blue-600 font-bold mt-2">✅ Foto 2 enviada!</div>
                        </div>
                      )}
                    </div>

                    {/* FOTO 3 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foto 3</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 3)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                      {uploading3 && (
                        <div className="flex items-center mt-3 text-blue-600 font-bold">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Enviando foto 3...
                        </div>
                      )}
                      {uploadedUrls.photo3_url && (
                        <div className="mt-3">
                          <Image
                            src={uploadedUrls.photo3_url}
                            alt="Preview 3"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-4 border-purple-200"
                          />
                          <div className="text-purple-600 font-bold mt-2">✅ Foto 3 enviada!</div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📺 YouTube Embed URL</label>
                  <input
                    type="url"
                    name="youtube_embed_url"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                  />
                </div>

              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProduct(false)
                    setUploadedUrls({})
                  }}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm"
                >
                  ❌ CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading1 || uploading2 || uploading3}
                  className="flex-1 bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 font-medium text-sm disabled:opacity-50"
                >
                  {loading ? '⏳ SALVANDO...' : '✅ SALVAR PRODUTO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PRODUTO */}
      {showEditProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">✏️ EDITAR PRODUTO</h3>

            <form onSubmit={handleEditProduct}>
              <div className="space-y-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={showEditProduct.name}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                    <input
                      type="number"
                      name="price"
                      defaultValue={showEditProduct.price}
                      step="0.01"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select
                      name="type"
                      defaultValue={showEditProduct.is_daily_product ? 'daily' : 'special'}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="daily">🍰 Produto do Dia</option>
                      <option value="special">🎂 Encomenda Especial</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="is_active"
                    defaultValue={showEditProduct.is_active ? 'true' : 'false'}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="true">✅ Ativo</option>
                    <option value="false">❌ Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="description"
                    defaultValue={showEditProduct.description || ''}
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                  <textarea
                    name="observations"
                    defaultValue={showEditProduct.observations || ''}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* FOTOS ATUAIS E UPLOAD */}
                <div className="border-t-4 border-rose-200 pt-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">📸 FOTOS ATUAIS E NOVAS</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* FOTO 1 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foto 1</label>
                      {showEditProduct.photo1_url && !uploadedUrls.photo1_url && (
                        <div className="mb-3">
                          <Image
                            src={showEditProduct.photo1_url}
                            alt="Foto atual 1"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-2 border-gray-200"
                          />
                          <div className="text-gray-600 text-sm mt-1">Foto atual 1</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 1)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                      {uploading1 && (
                        <div className="flex items-center mt-3 text-blue-600 font-bold">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Enviando...
                        </div>
                      )}
                      {uploadedUrls.photo1_url && (
                        <div className="mt-3">
                          <Image
                            src={uploadedUrls.photo1_url}
                            alt="Nova foto 1"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-4 border-green-200"
                          />
                          <div className="text-green-600 font-bold mt-2">✅ Nova foto 1!</div>
                        </div>
                      )}
                    </div>

                    {/* FOTO 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foto 2</label>
                      {showEditProduct.photo2_url && !uploadedUrls.photo2_url && (
                        <div className="mb-3">
                          <Image
                            src={showEditProduct.photo2_url}
                            alt="Foto atual 2"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-2 border-gray-200"
                          />
                          <div className="text-gray-600 text-sm mt-1">Foto atual 2</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 2)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                      {uploading2 && (
                        <div className="flex items-center mt-3 text-blue-600 font-bold">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Enviando...
                        </div>
                      )}
                      {uploadedUrls.photo2_url && (
                        <div className="mt-3">
                          <Image
                            src={uploadedUrls.photo2_url}
                            alt="Nova foto 2"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-4 border-blue-200"
                          />
                          <div className="text-blue-600 font-bold mt-2">✅ Nova foto 2!</div>
                        </div>
                      )}
                    </div>

                    {/* FOTO 3 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Foto 3</label>
                      {showEditProduct.photo3_url && !uploadedUrls.photo3_url && (
                        <div className="mb-3">
                          <Image
                            src={showEditProduct.photo3_url}
                            alt="Foto atual 3"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-2 border-gray-200"
                          />
                          <div className="text-gray-600 text-sm mt-1">Foto atual 3</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 3)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                      />
                      {uploading3 && (
                        <div className="flex items-center mt-3 text-blue-600 font-bold">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                          Enviando...
                        </div>
                      )}
                      {uploadedUrls.photo3_url && (
                        <div className="mt-3">
                          <Image
                            src={uploadedUrls.photo3_url}
                            alt="Nova foto 3"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover border-4 border-purple-200"
                          />
                          <div className="text-purple-600 font-bold mt-2">✅ Nova foto 3!</div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">📺 YouTube Embed URL</label>
                  <input
                    type="url"
                    name="youtube_embed_url"
                    defaultValue={showEditProduct.youtube_embed_url || ''}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                </div>

              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProduct(null)
                    setUploadedUrls({})
                  }}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm"
                >
                  ❌ CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading1 || uploading2 || uploading3}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
                >
                  {loading ? '⏳ SALVANDO...' : '✅ ATUALIZAR PRODUTO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR CATEGORIA */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📁 ADICIONAR CATEGORIA</h3>

            <form onSubmit={handleAddCategory}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    placeholder="Ex: Doces, Salgados, Bolos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500"
                    placeholder="Descrição da categoria..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm"
                >
                  ❌ CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 font-medium text-sm disabled:opacity-50"
                >
                  {loading ? '⏳ SALVANDO...' : '✅ SALVAR CATEGORIA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PEDIDO */}
      {showEditOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">✏️ EDITAR PEDIDO</h3>

            <form onSubmit={handleEditOrder}>
              <div className="space-y-6">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente *</label>
                    <input
                      type="text"
                      name="customer_name"
                      defaultValue={showEditOrder.customer_name}
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                    <input
                      type="text"
                      name="customer_whatsapp"
                      defaultValue={showEditOrder.customer_whatsapp}
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Entrega *</label>
                  <textarea
                    name="delivery_address"
                    defaultValue={showEditOrder.delivery_address}
                    required
                    rows={3}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
                    <input
                      type="number"
                      name="product_price"
                      defaultValue={showEditOrder.product_price}
                      step="0.01"
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      name="status"
                      defaultValue={showEditOrder.status}
                      required
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">⏳ Pendente</option>
                      <option value="completed">✅ Concluído</option>
                      <option value="cancelled">❌ Cancelado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Cliente</label>
                  <textarea
                    name="extra_observations"
                    defaultValue={showEditOrder.extra_observations || ''}
                    rows={3}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Observações especiais do cliente sobre o pedido..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-700 mb-2">Informações do Produto:</h4>
                  <p className="text-gray-600">🍰 {showEditOrder.product_name}</p>
                  <p className="text-gray-600">📅 Pedido feito em: {new Date(showEditOrder.created_at).toLocaleString('pt-BR')}</p>
                </div>

              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowEditOrder(null)}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm"
                >
                  ❌ CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
                >
                  {loading ? '⏳ SALVANDO...' : '✅ ATUALIZAR PEDIDO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVA CAMPANHA */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">✉️ NOVA CAMPANHA PROMOCIONAL</h3>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const campaignData = {
                title: formData.get('title') as string,
                message: formData.get('message') as string
              }
              sendCampaign(campaignData)
            }}>
              <div className="space-y-6">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CONFIGURAÇÕES DA CAMPANHA */}
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título da Campanha *</label>
                        <input
                          type="text"
                          name="title"
                          required
                          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: Promoção Especial de Inverno"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destinatários ({selectedSubscribers.length > 0 ? selectedSubscribers.length + ' selecionados' : 'todos os ' + newsletter.length + ' assinantes'})
                        </label>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          {selectedSubscribers.length > 0 ? (
                            <div>
                              <p className="text-blue-800 font-medium">📋 Campanha direcionada</p>
                              <p className="text-blue-600 text-sm">Será enviada apenas para os {selectedSubscribers.length} contatos selecionados.</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-blue-800 font-medium">📢 Campanha geral</p>
                              <p className="text-blue-600 text-sm">Será enviada para todos os {newsletter.length} assinantes da newsletter.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Templates Prontos</label>
                        <div className="space-y-2">
                          {messageTemplates.map((template) => (
                            <button
                              key={template.id}
                              type="button"
                              onClick={() => {
                                const messageTextarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement
                                if (messageTextarea) {
                                  messageTextarea.value = template.template
                                }
                              }}
                              className="w-full text-left bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors"
                            >
                              <div className="font-medium text-gray-900">{template.title}</div>
                              <div className="text-sm text-gray-600 line-clamp-2">{template.template.slice(0, 100)}...</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EDITOR DE MENSAGEM */}
                  <div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
                      <textarea
                        name="message"
                        required
                        rows={8}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                        placeholder="Digite sua mensagem promocional aqui...

Dicas:
- Use emojis para chamar atenção
- Seja claro sobre a oferta
- Inclua call-to-action"
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        <p><strong>💡 Variáveis disponíveis:</strong></p>
                        <p>• <code>{'{{nome}}'}</code> - Nome do cliente</p>
                        <p>• <code>{'{{whatsapp}}'}</code> - Número WhatsApp da confeitaria</p>
                        <p>• <code>{'{{link_produtos}}'}</code> - Link para produtos</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PREVIEW DA MENSAGEM */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-bold text-green-800 mb-2 text-sm">📱 Preview WhatsApp</h4>
                  <div className="bg-white rounded-lg p-3 border border-green-300 max-h-32 overflow-y-auto">
                    <div className="text-xs text-gray-800 whitespace-pre-line">
                      <div className="text-gray-500">
                        Exemplo: Olá Maria Silva! 🍰

                        Temos uma promoção especial só para você!

                        Acesse: https://sabores-zissou.com
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-md hover:bg-gray-50 font-medium text-sm"
                >
                  ❌ CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                >
                  {loading ? '⏳ ENVIANDO...' : '✉️ ENVIAR CAMPANHA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  )
}