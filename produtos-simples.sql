-- SQL SIMPLIFICADO para inserir produtos de exemplo
-- Execute este script no Supabase depois de executar o supabase-schema.sql

-- IMPORTANTE: Primeiro verifique se as categorias existem
-- Se não existirem, execute primeiro:
-- INSERT INTO categories (name, slug) VALUES ('Produtos do Dia', 'produtos-do-dia'), ('Encomendas Especiais', 'encomendas-especiais');

-- PRODUTOS DO DIA
INSERT INTO products (name, description, observations, price, is_daily_product, is_special_order, is_active) VALUES
('Bolo de Chocolate com Morango', 'Delicioso bolo de chocolate artesanal coberto com chantilly e morangos frescos.', 'Contém glúten e lactose.', 45.90, true, false, true),
('Torta de Limão Cremosa', 'Torta artesanal com massa crocante, recheio cremoso de limão e merengue dourado.', 'Melhor consumir no mesmo dia.', 38.50, true, false, true),
('Pão Artesanal Integral', 'Pão caseiro com grãos integrais, sementes de girassol e linhaça.', 'Sem conservantes. Validade de 3 dias.', 12.00, true, false, true),
('Brownie de Chocolate', 'Brownie úmido e intenso com pedaços de chocolate belga.', 'Pode conter traços de amendoim.', 28.90, true, false, true),
('Croissant de Amêndoas', 'Croissant francês folhado recheado com creme de amêndoas.', 'Feito diariamente pela manhã.', 15.50, true, false, true);

-- ENCOMENDAS ESPECIAIS
INSERT INTO products (name, description, observations, price, is_daily_product, is_special_order, is_active) VALUES
('Bolo Personalizado 2kg', 'Bolo sob medida para sua ocasião especial. Escolha sabor, recheio e decoração.', 'Antecedência mínima de 48h.', 85.00, false, true, true),
('Kit Docinhos Festa (100 unidades)', 'Seleção especial com brigadeiros gourmet, beijinhos, cajuzinhos e olho de sogra.', 'Pedido mínimo 72h.', 120.00, false, true, true),
('Torta Salgada Grande (8 fatias)', 'Torta artesanal com massa folhada e recheios variados.', 'Especificar sabor no pedido.', 55.00, false, true, true),
('Naked Cake Rústico (1.5kg)', 'Bolo estilo rústico com camadas expostas e frutas vermelhas.', 'Antecedência mínima de 5 dias.', 95.00, false, true, true),
('Mesa de Doces Completa', 'Mesa completa com variedade de doces finos para festas.', 'Serve aproximadamente 50 pessoas.', 350.00, false, true, true);

-- AVALIAÇÕES DE EXEMPLO
INSERT INTO reviews (customer_name, rating, comment, is_approved, display_order) VALUES
('Maria Silva', 5, 'Simplesmente perfeito! O bolo de chocolate estava uma delícia e chegou no horário combinado.', true, 1),
('João Santos', 5, 'A torta de limão é incrível! Sabor equilibrado e massa crocante. Já virei cliente fiel.', true, 2),
('Ana Costa', 4, 'Produtos artesanais de qualidade excepcional. O atendimento também é muito bom.', true, 3),
('Carlos Oliveira', 5, 'Fiz uma encomenda para aniversário da minha filha e foi um sucesso! O bolo ficou lindo.', true, 4);

-- ASSINANTES NEWSLETTER
INSERT INTO newsletter_subscribers (name, whatsapp) VALUES
('Sofia Zissou', '11981047422'),
('Cliente Teste 1', '11987654321'),
('Cliente Teste 2', '11976543210');

-- CONFIGURAÇÕES DO SISTEMA
INSERT INTO system_settings (key, value, description) VALUES
('webhook_url', '', 'URL do webhook para envio de pedidos'),
('pix_key', 'sua-chave-pix@email.com', 'Chave PIX para pagamentos'),
('whatsapp_contact', '5511981047422', 'WhatsApp para contato')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;