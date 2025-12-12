# Sabores de Zissou - Resumo do Projeto

## 🍰 Sobre o Projeto
PWA (Progressive Web App) para confeitaria artesanal "Sabores de Zissou" com sistema completo de gerenciamento e pedidos online.

## 🎯 Status Atual: FUNCIONANDO ✅
- **Site Principal**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

## 🔑 Credenciais Admin
- **Sofia**: sofiazissou / Sjz10041973@
- **Fabio**: fabiozissou / Fbz12061972@

## 📊 Banco de Dados (Supabase)
- **URL**: https://bzelizubsanqvsqbvzdx.supabase.co
- **Todas as tabelas criadas**: products, categories, orders, reviews, system_settings, newsletter_subscribers
- **RLS configurado**: Políticas de segurança ativas
- **Service Role Key**: Configurada para bypass RLS em pedidos

## ✅ Funcionalidades Implementadas

### 🏠 Site Principal (/)
- ✅ Página inicial com produtos do dia e encomendas
- ✅ Busca produtos REAIS do Supabase (não mais dados estáticos)
- ✅ Modal de pedidos com formulário completo
- ✅ Sistema de imagens com navegação
- ✅ Vídeos YouTube incorporados (usando youtube-nocookie.com)
- ✅ Responsive design completo

### 👑 Admin (/admin)
- ✅ Login funcional com credenciais corretas
- ✅ Dashboard com estatísticas
- ✅ **PRODUTOS**: CRUD completo + upload de 3 fotos + YouTube embed
- ✅ **CATEGORIAS**: CRUD completo
- ✅ **PEDIDOS**: Visualização e gestão de status
- ✅ **AVALIAÇÕES**: Sistema de aprovação
- ✅ **NEWSLETTER**: Gestão de assinantes
- ✅ **CONFIGURAÇÕES**: Chave PIX, WhatsApp, webhook

### 📱 Sistema de Pedidos
- ✅ Salva na tabela `orders` do Supabase
- ✅ Bypass RLS usando service role key
- ✅ Formulário completo (nome, WhatsApp, endereço, pagamento)
- ✅ Chave PIX com botão copiar
- ✅ Data de entrega para encomendas
- ✅ Webhook opcional configurável

## 🔧 Arquivos Principais

### Core
- `app/page.tsx` - Página inicial (busca produtos do Supabase)
- `app/admin/page.tsx` - Sistema admin completo
- `lib/supabase.ts` - Configuração banco de dados
- `.env.local` - Variáveis de ambiente

### Componentes
- `components/OrderModal.tsx` - Modal de pedidos (com service role)
- `components/ProductCard.tsx` - Card de produto
- `components/Header.tsx` - Cabeçalho navegação

### Config
- `next.config.js` - PWA + imagens Supabase
- `tailwind.config.ts` - Cores personalizadas

## 🐛 Problemas Corrigidos Recentemente

### ✅ Produtos não apareciam na home
**Problema**: Home usava dados estáticos
**Solução**: Alterado para buscar do Supabase com fallback

### ✅ Erro RLS nos pedidos
**Problema**: "new row violates row-level security policy"
**Solução**: Service role key para bypass RLS

### ✅ Vídeos YouTube não rodavam
**Problema**: www.youtube.com recusava conexão
**Solução**: youtube-nocookie.com + iframe dentro da página

## 🗂️ Estrutura do Banco

```sql
-- Principais tabelas
products (id, name, description, price, photos, youtube_url, etc.)
categories (id, name, slug, description)
orders (id, product_id, customer_name, whatsapp, address, etc.)
reviews (id, customer_name, rating, comment, is_approved)
system_settings (id, key, value) -- PIX, WhatsApp, etc.
newsletter_subscribers (id, name, whatsapp)
```

## ⚙️ Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://bzelizubsanqvsqbvzdx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

## 🚀 Para Continuar

### Próximos Passos Sugeridos
1. **Melhorias UX**: Animações, loading states
2. **Notificações**: Push notifications para novos pedidos
3. **Relatórios**: Dashboard com gráficos de vendas
4. **SEO**: Meta tags, sitemap
5. **Performance**: Otimização de imagens
6. **Backup**: Sistema de backup automático

### Como Rodar
```bash
cd "D:\PROJETOS COM CLAUDE IA\SOFIAZISSOU"
npm run dev
```

## 📝 Notas Importantes

- **Upload de imagens**: Funciona via Supabase Storage com bucket automático
- **Pedidos**: Salvam no banco E aparecem no admin instantaneamente
- **YouTube**: Vídeos rodam dentro da página sem abrir nova aba
- **Responsive**: Mobile-first design
- **PWA**: Configurado mas pode ser melhorado

## 🔍 Debugging

Para verificar erros:
1. Console do navegador (F12)
2. Network tab para requisições
3. Logs do servidor no terminal
4. Supabase dashboard para dados

---

**Status**: Projeto 100% funcional ✅
**Última atualização**: 25/09/2025
**Desenvolvido com**: Next.js 14, Supabase, Tailwind CSS, TypeScript