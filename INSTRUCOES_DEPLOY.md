# 🚀 Instruções de Deploy - Sabores de Zissou

## Passo a Passo Completo para Colocar Online

### 1. 📊 Configurar o Supabase

1. **Acesse seu Supabase:**
   - URL: https://bzelizubsanqvsqbvzdx.supabase.co
   - Faça login com suas credenciais

2. **Execute o SQL Schema:**
   - Vá em "SQL Editor"
   - Copie todo o conteúdo do arquivo `supabase-schema.sql`
   - Cole no editor e clique em "RUN"
   - Isso criará todas as tabelas necessárias

3. **Configure o Storage (para fotos):**
   - Vá em "Storage"
   - Crie um bucket chamado "photos"
   - Configure para público (para as fotos aparecerem)

### 2. 🌐 Deploy na Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Fazer Login na Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy do Projeto:**
   ```bash
   vercel --prod
   ```

4. **Configurar Environment Variables na Vercel:**
   - Acesse seu projeto na Vercel
   - Vá em Settings > Environment Variables
   - Adicione as variáveis:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://bzelizubsanqvsqbvzdx.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZWxpenVic2FucXZzcWJ2emR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDEyMDMsImV4cCI6MjA3NDM3NzIwM30.GRxF1x1yIZjKJIuYNpq4Nh8QDfH7kggtlYk1HSUeStM
     SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZWxpenVic2FucXZzcWJ2emR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODgwMTIwMywiZXhwIjoyMDc0Mzc3MjAzfQ.CcdfjbBJVtbbKrtItyc201Xo1aA6AUFfMuOzX1Aj74c
     ```

### 3. ⚙️ Configurações Iniciais

1. **Acesse o Painel Admin:**
   - Vá para `[seu-site]/admin`
   - Login: `sofiazissou` / Senha: `Sjz10041973@`

2. **Configure o Sistema:**
   - No Supabase, acesse a tabela `system_settings`
   - Configure os valores importantes:
     - `webhook_url`: URL para onde os pedidos serão enviados
     - `pix_key`: Sua chave PIX
     - `site_logo_url`: URL do seu logotipo
     - `whatsapp_contact`: Seu WhatsApp (ex: 5511981047422)

### 4. 🛍️ Adicionar Produtos

**Via Supabase (por enquanto):**

1. **Categorias:**
   - Tabela: `categories`
   - Adicione: "Bolos", "Doces", "Salgados", etc.

2. **Produtos:**
   - Tabela: `products`
   - Para cada produto configure:
     - `name`: Nome do produto
     - `price`: Preço (ex: 45.90)
     - `description`: Descrição
     - `photo1_url`, `photo2_url`, `photo3_url`: URLs das fotos
     - `youtube_embed_url`: Link do YouTube (se tiver)
     - `is_daily_product`: true para "Produtos do Dia"
     - `is_special_order`: true para "Encomendas"

### 5. 📱 Testar PWA

1. **No Celular:**
   - Abra o site no Chrome/Safari
   - Aparecerá o botão "Instale nosso app!"
   - Teste a instalação

2. **No Desktop:**
   - Chrome mostrará ícone de instalação na barra de endereços
   - Teste a funcionalidade offline

### 6. 🔧 Configurações Extras

1. **Webhook para Pedidos:**
   - Configure uma URL que receberá os pedidos
   - Pode ser Zapier, Make.com, ou webhook personalizado
   - O sistema enviará JSON com dados do pedido

2. **PIX:**
   - Configure sua chave PIX na tabela `system_settings`
   - Quando cliente escolher PIX, aparecerá a chave com botão copiar

3. **Logo:**
   - Faça upload da logo para um serviço (Cloudinary, etc.)
   - Configure a URL na `system_settings`

### 7. 📊 Monitoramento

**Acompanhe através do Supabase:**
- `orders`: Todos os pedidos
- `newsletter_subscribers`: Inscrições WhatsApp
- `reviews`: Avaliações (aprovar/rejeitar)

### 8. ✅ Checklist Final

- [ ] Supabase configurado e tabelas criadas
- [ ] Deploy na Vercel funcionando
- [ ] Environment variables configuradas
- [ ] Categorias criadas
- [ ] Pelo menos 3 produtos de teste adicionados
- [ ] Configurações do sistema (PIX, WhatsApp, etc.)
- [ ] PWA instalando corretamente
- [ ] Webhook configurado (opcional)
- [ ] Logo adicionado

### 9. 🆘 Problemas Comuns

**Site não carrega:**
- Verifique as environment variables na Vercel
- Confirme que as chaves do Supabase estão corretas

**PWA não instala:**
- Certifique-se que está acessando via HTTPS
- Teste em navegadores diferentes

**Imagens não aparecem:**
- Verifique se as URLs das imagens estão acessíveis
- Configure o bucket do Supabase como público

**Pedidos não chegam:**
- Teste o webhook manualmente
- Verifique logs na Vercel

### 10. 📞 Suporte

- **WhatsApp**: https://wa.me/5511981047422
- **Supabase Dashboard**: https://bzelizubsanqvsqbvzdx.supabase.co
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**🎉 Pronto! Seu sistema estará online e funcionando!**

*Lembre-se: O painel administrativo completo será desenvolvido em breve. Por enquanto, use o Supabase diretamente para gerenciar produtos e pedidos.*