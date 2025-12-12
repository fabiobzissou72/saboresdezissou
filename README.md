# Sabores de Zissou - Confeitaria e Panificadora Artesanal

Sistema PWA (Progressive Web App) completo para catálogo de produtos e pedidos online.

## 🚀 Características

- ✅ **PWA Completo** - Instalável em dispositivos móveis e desktop
- ✅ **Design Responsivo** - Interface otimizada para idosos com fontes grandes
- ✅ **Sistema de Pedidos** - Modal com formulário completo e integração webhook
- ✅ **Produtos do Dia** e **Encomendas Especiais**
- ✅ **Sistema de Avaliações** - Com aprovação administrativa
- ✅ **Newsletter** - Cadastro via WhatsApp
- ✅ **Painel Administrativo** - Controle total do sistema
- ✅ **Integração Supabase** - Banco de dados robusto
- ✅ **Upload de Imagens** - Até 3 fotos por produto + vídeo YouTube

## 🎨 Paleta de Cores

- **Creme**: `#F5F5DC`
- **Vinho**: `#722F37`
- **Vinho Claro**: `#8B4C58`
- **Rosa Suave**: `#F4C2C2`
- **Chocolate**: `#7B3F00`

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Vercel CLI (para deploy)

## ⚙️ Configuração

### 1. Clone e instale dependências

```bash
git clone [seu-repositorio]
cd sabores-de-zissou
npm install
```

### 2. Configure o Supabase

1. Acesse seu projeto Supabase: https://bzelizubsanqvsqbvzdx.supabase.co
2. Vá em SQL Editor
3. Execute o script `supabase-schema.sql` para criar todas as tabelas
4. Configure as políticas RLS conforme necessário

### 3. Configure as variáveis de ambiente

O arquivo `.env.local` já está configurado com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bzelizubsanqvsqbvzdx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Execute o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🏗️ Deploy na Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Configurações na Vercel:

1. **Environment Variables**: Configure as mesmas variáveis do `.env.local`
2. **Build Command**: `npm run build`
3. **Framework Preset**: `Next.js`

## 👥 Credenciais do Painel Admin

Acesse: `/admin`

**Usuários:**
- `sofiazissou` / `Sjz10041973@`
- `fabiozissou` / `Fbz12061972@`

## 📊 Estrutura do Banco

### Tabelas principais:

- `admin_users` - Usuários administrativos
- `categories` - Categorias de produtos
- `products` - Produtos (com 3 fotos + YouTube)
- `orders` - Pedidos dos clientes
- `reviews` - Avaliações (com aprovação)
- `newsletter_subscribers` - Inscritos no WhatsApp
- `system_settings` - Configurações do sistema

## 🔧 Configurações do Sistema

Através do painel admin ou diretamente no Supabase, configure:

- `webhook_url` - URL para envio de pedidos
- `pix_key` - Chave PIX para pagamentos
- `site_logo_url` - URL do logotipo
- `whatsapp_contact` - WhatsApp para contato (5511981047422)

## 📱 Funcionalidades PWA

### Instalação Automática:
- **Android**: Botão de instalação automática
- **iOS**: Instruções detalhadas para adicionar à tela inicial

### Recursos Offline:
- Cache automático de páginas visitadas
- Página offline customizada
- Service Worker otimizado

## 🛍️ Fluxo de Pedidos

1. Cliente clica em "Fazer Pedido"
2. Modal abre com foto do produto e preço
3. Cliente preenche dados (nome, WhatsApp, endereço, pagamento)
4. Para PIX: exibe chave com botão copiar
5. Para cartão: informa que levará maquininha
6. Pedido salvo no banco + enviado para webhook

## ⭐ Sistema de Avaliações

1. Cliente deixa avaliação (nome, estrelas, comentário, foto)
2. Avaliação fica pendente no admin
3. Admin aprova/rejeita
4. Avaliações aprovadas aparecem no site
5. Carousel automático com média de estrelas

## 📧 Newsletter WhatsApp

- Formulário simples: Nome + WhatsApp
- Validação de formato brasileiro
- Armazenamento para campanhas futuras
- Prevenção de duplicatas

## 🎯 SEO e Performance

- Metadata otimizada
- Open Graph tags
- Sitemap automático
- Imagens otimizadas (Next.js Image)
- Fonts pré-carregadas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **PWA**: next-pwa
- **Forms**: react-hook-form
- **Notifications**: react-hot-toast
- **Icons**: react-icons

## 📁 Estrutura de Arquivos

```
/
├── app/                 # App Router do Next.js
│   ├── admin/          # Painel administrativo
│   ├── globals.css     # Estilos globais
│   └── page.tsx        # Página principal
├── components/         # Componentes React
├── lib/               # Configurações e utilitários
├── public/            # Arquivos estáticos + PWA
└── types/             # Tipos TypeScript
```

## 🐛 Troubleshooting

### Problemas comuns:

1. **Erro de CORS**: Verifique as configurações do Supabase
2. **PWA não instala**: Certifique-se que está em HTTPS
3. **Imagens não carregam**: Configure domínios no next.config.js
4. **Webhook não funciona**: Teste a URL manualmente

## 📞 Contato WhatsApp

Link configurado: https://wa.me/5511981047422

## 🎉 Recursos Extras

- 🖼️ **Galeria**: Até 3 fotos por produto com navegação
- 📹 **YouTube**: Embed de vídeos dos produtos
- 🎨 **Tema**: Cores pastéis inspiradas em confeitaria
- 👵 **Acessibilidade**: Interface amigável para idosos
- 📱 **Mobile First**: Design otimizado para celular
- ⚡ **Performance**: Carregamento otimizado

---

**Desenvolvido para Sabores de Zissou - Confeitaria e Panificadora Artesanal**

*Delícias artesanais preparadas com carinho todos os dias!*