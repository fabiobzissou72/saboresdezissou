'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'
import OrderModal from '@/components/OrderModal'
import Newsletter from '@/components/Newsletter'
import Reviews from '@/components/Reviews'
import PWAInstall from '@/components/PWAInstall'
import { supabase, Product, Category, SystemSetting } from '@/lib/supabase'

export default function Home() {
  const [activeSection, setActiveSection] = useState<'produtos-do-dia' | 'encomendas'>('produtos-do-dia')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [whatsappContact, setWhatsappContact] = useState('5511981047422')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [activeSection])

  const loadData = async () => {
    try {
      // Carregar categorias do Supabase
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Carregar configuração do WhatsApp
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'whatsapp_contact')
        .single()

      if (settings?.value) {
        setWhatsappContact(settings.value)
      }

      await loadProducts()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // Fallback para dados de demonstração caso haja erro
      const fallbackCategories: Category[] = [
        {
          id: '1',
          name: 'Bolos Artesanais',
          slug: 'bolos-artesanais',
          description: 'Bolos feitos com amor e ingredientes selecionados',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Doces Especiais',
          slug: 'doces-especiais',
          description: 'Doces únicos para momentos especiais',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setCategories(fallbackCategories)
      await loadProducts()
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      // Buscar produtos do Supabase com categorias usando JOIN
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .eq('is_active', true)

      // Aplicar filtros baseado na seção ativa
      if (activeSection === 'produtos-do-dia') {
        query = query.eq('is_daily_product', true)
      } else if (activeSection === 'encomendas') {
        query = query.eq('is_special_order', true)
      }

      const { data, error } = await query.order('name')

      if (error) {
        console.error('Erro ao carregar produtos do Supabase:', error)
        throw error
      }

      if (data) {
        setProducts(data)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)

      // Fallback para produtos de demonstração em caso de erro
      const demoProducts: Product[] = [
        {
          id: '1',
          name: 'Bolo de Chocolate com Morango',
          description: 'Delicioso bolo de chocolate artesanal coberto com chantilly e morangos frescos. Uma explosão de sabores que derrete na boca.',
          observations: 'Disponível apenas até esgotar o estoque. Contém glúten e lactose.',
          price: 45.90,
          category_id: '1',
          is_daily_product: activeSection === 'produtos-do-dia',
          is_special_order: activeSection === 'encomendas',
          photo1_url: undefined,
          photo2_url: undefined,
          photo3_url: undefined,
          youtube_embed_url: undefined,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Torta de Limão Cremosa',
          description: 'Torta artesanal com massa crocante, recheio cremoso de limão e merengue dourado. Um equilíbrio perfeito entre doce e azedinho.',
          observations: 'Melhor consumir no mesmo dia. Feita com limões orgânicos frescos.',
          price: 38.50,
          category_id: '1',
          is_daily_product: activeSection === 'produtos-do-dia',
          is_special_order: activeSection === 'encomendas',
          photo1_url: undefined,
          photo2_url: undefined,
          photo3_url: undefined,
          youtube_embed_url: undefined,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      if (activeSection === 'encomendas') {
        const specialOrders: Product[] = [
          {
            id: '4',
            name: 'Bolo Personalizado 2kg',
            description: 'Bolo sob medida para sua ocasião especial. Escolha o sabor, recheio e decoração. Ideal para aniversários e comemorações.',
            observations: 'Necessário pedido com antecedência de 48h. Sabor e decoração personalizáveis.',
            price: 85.00,
            category_id: '1',
            is_daily_product: false,
            is_special_order: true,
            photo1_url: undefined,
            photo2_url: undefined,
            photo3_url: undefined,
            youtube_embed_url: undefined,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '5',
            name: 'Kit Docinhos Festa (100 unidades)',
            description: 'Seleção especial com brigadeiros gourmet, beijinhos, cajuzinhos e olho de sogra. Perfeito para festas e eventos.',
            observations: 'Pedido mínimo 72h. Embalagem individual personalizada disponível.',
            price: 120.00,
            category_id: '2',
            is_daily_product: false,
            is_special_order: true,
            photo1_url: undefined,
            photo2_url: undefined,
            photo3_url: undefined,
            youtube_embed_url: undefined,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
        setProducts(specialOrders)
      } else {
        setProducts(demoProducts)
      }
    }
  }

  const handleOrder = (product: Product) => {
    setSelectedProduct(product)
    setShowOrderModal(true)
  }

  const handleCloseModal = () => {
    setShowOrderModal(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-wine text-lg">Carregando delícias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="container py-8">
        {/* Seção Principal */}
        <section className="mb-12 mt-8">
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-pink-soft rounded-full mb-4">
              <span className="text-4xl">
                {activeSection === 'produtos-do-dia' ? '🍰' : '🎁'}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-wine mb-4">
              {activeSection === 'produtos-do-dia' ? 'Produtos do Dia' : 'Sob Encomenda'}
            </h1>
            <p className="text-chocolate text-xl max-w-2xl mx-auto">
              {activeSection === 'produtos-do-dia'
                ? 'Delícias artesanais preparadas com carinho todos os dias, usando os melhores ingredientes para encantar seu paladar'
                : 'Bolos personalizados, doces especiais e delícias sob medida para tornar seus momentos ainda mais doces e memoráveis'
              }
            </p>
          </div>


          {/* Grid de Produtos */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOrder={handleOrder}
                />
              ))}
            </div>
          ) : activeSection === 'produtos-do-dia' ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">☕</div>
              <h3 className="text-xl font-bold text-wine mb-4">
                Ainda não temos produtos do dia hoje
              </h3>
              <p className="text-chocolate text-lg mb-6">
                Mas você pode conferir nossas delícias sob encomenda!
              </p>
              <button
                onClick={() => setActiveSection('encomendas')}
                className="btn-primary text-lg py-3 px-6"
              >
                🎁 Ver Encomendas
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-bold text-wine mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-chocolate text-lg">
                Entre em contato conosco para mais informações!
              </p>
            </div>
          )}
        </section>

        {/* Seção de Avaliações */}
        <section className="mb-12">
          <Reviews />
        </section>

        {/* Newsletter */}
        <section className="mb-12">
          <Newsletter />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-pink-soft">
          <div className="space-y-4">
            {/* Instagram */}
            <div>
              <a
                href="https://instagram.com/saboreszissou"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-wine hover:text-wine-light transition-all duration-200 text-lg font-medium"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
                @saboreszissou
              </a>
            </div>

            {/* Link Fale Conosco */}
            <div>
              <a
                href={`https://wa.me/${whatsappContact}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 text-lg"
              >
                <span className="text-xl">💬</span>
                Fale Conosco
              </a>
            </div>

            {/* Componente de Instalação PWA */}
            <PWAInstall />

            <div className="text-chocolate">
              <p className="text-lg">
                © 2024 Sabores de Zissou - Confeitaria e Panificadora Artesanal
              </p>
              <p className="text-sm mt-2">
                Feito com 💝 para adoçar seus dias
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Modal de Pedido */}
      <OrderModal
        product={selectedProduct}
        isOpen={showOrderModal}
        onClose={handleCloseModal}
      />
    </div>
  )
}