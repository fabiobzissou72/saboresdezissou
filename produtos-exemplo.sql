-- SQL para inserir produtos de exemplo
-- Execute este script no Supabase depois de executar o supabase-schema.sql

-- Primeiro, obter os IDs das categorias criadas
-- Assumindo que você já executou o schema principal, as categorias devem existir

-- Inserir produtos do dia (produtos regulares)
INSERT INTO products (
    name,
    description,
    observations,
    price,
    category_id,
    is_daily_product,
    is_special_order,
    photo1_url,
    photo2_url,
    photo3_url,
    youtube_embed_url,
    is_active
) VALUES

-- PRODUTOS DO DIA
(
    'Bolo de Chocolate com Morango',
    'Delicioso bolo de chocolate artesanal coberto com chantilly e morangos frescos. Uma explosão de sabores que derrete na boca.',
    'Disponível apenas até esgotar o estoque. Contém glúten e lactose.',
    45.90,
    (SELECT id FROM categories WHERE slug = 'produtos-do-dia' LIMIT 1),
    true,
    false,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500',
    null,
    true
),

(
    'Torta de Limão Cremosa',
    'Torta artesanal com massa crocante, recheio cremoso de limão e merengue dourado. Um equilíbrio perfeito entre doce e azedinho.',
    'Melhor consumir no mesmo dia. Feita com limões orgânicos frescos.',
    38.50,
    (SELECT id FROM categories WHERE slug = 'produtos-do-dia' LIMIT 1),
    true,
    false,
    'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=500',
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500',
    null,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    true
),

(
    'Pão Artesanal Integral',
    'Pão caseiro com grãos integrais, sementes de girassol e linhaça. Perfeito para um café da manhã saudável e saboroso.',
    'Sem conservantes. Validade de 3 dias.',
    12.00,
    (SELECT id FROM categories WHERE slug = 'produtos-do-dia' LIMIT 1),
    true,
    false,
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500',
    null,
    true
),

(
    'Brownie de Chocolate Duplo',
    'Brownie úmido e intenso com pedaços de chocolate belga e nozes. Acompanha calda de chocolate quente.',
    'Pode conter traços de amendoim. Acompanha sorvete de baunilha.',
    28.90,
    (SELECT id FROM categories WHERE slug = 'produtos-do-dia' LIMIT 1),
    true,
    false,
    'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500',
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500',
    null,
    null,
    true
),

(
    'Croissant de Amêndoas',
    'Croissant francês folhado recheado com creme de amêndoas e finalizado com lâminas tostadas.',
    'Feito diariamente pela manhã. Melhor consumir quente.',
    15.50,
    (SELECT id FROM categories WHERE slug = 'produtos-do-dia' LIMIT 1),
    true,
    false,
    'https://images.unsplash.com/photo-1555507036-ab794f27862a?w=500',
    null,
    null,
    null,
    true
),

-- ENCOMENDAS ESPECIAIS
(
    'Bolo Personalizado 2kg',
    'Bolo sob medida para sua ocasião especial. Escolha o sabor, recheio e decoração. Ideal para aniversários e comemorações.',
    'Necessário pedido com antecedência de 48h. Sabor e decoração personalizáveis.',
    85.00,
    (SELECT id FROM categories WHERE slug = 'encomendas-especiais' LIMIT 1),
    false,
    true,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
    'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    true
),

(
    'Kit Docinhos Festa (100 unidades)',
    'Seleção especial com brigadeiros gourmet, beijinhos, cajuzinhos e olho de sogra. Perfeito para festas e eventos.',
    'Pedido mínimo 72h. Embalagem individual personalizada disponível.',
    120.00,
    (SELECT id FROM categories WHERE slug = 'encomendas-especiais' LIMIT 1),
    false,
    true,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    'https://images.unsplash.com/photo-1519869325930-281384150729?w=500',
    null,
    null,
    true
),

(
    'Torta Salgada Grande (8 fatias)',
    'Torta artesanal com massa folhada e recheios variados: frango com catupiry, palmito, ou queijo com presunto.',
    'Especificar sabor no pedido. Serve 6-8 pessoas.',
    55.00,
    (SELECT id FROM categories WHERE slug = 'encomendas-especiais' LIMIT 1),
    false,
    true,
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
    'https://images.unsplash.com/photo-1574085733277-851d9d856a95?w=500',
    null,
    null,
    true
),

(
    'Naked Cake Rústico (1.5kg)',
    'Bolo estilo rústico com camadas expostas, frutas vermelhas e flores comestíveis. Tendência em casamentos.',
    'Ideal para eventos ao ar livre. Antecedência mínima de 5 dias.',
    95.00,
    (SELECT id FROM categories WHERE slug = 'encomendas-especiais' LIMIT 1),
    false,
    true,
    'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    null,
    null,
    true
),

(
    'Mesa de Doces Completa',
    'Mesa completa com variedade de doces finos: bem-casados, cupcakes, macarons, brigadeiros gourmet e mini tortas.',
    'Serve aproximadamente 50 pessoas. Personalização de cores disponível.',
    350.00,
    (SELECT id FROM categories WHERE slug = 'encomendas-especiais' LIMIT 1),
    false,
    true,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    'https://images.unsplash.com/photo-1519869325930-281384150729?w=500',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
    null,
    true
);

-- Inserir algumas avaliações de exemplo (aprovadas)
INSERT INTO reviews (
    customer_name,
    rating,
    comment,
    photo_url,
    is_approved,
    display_order
) VALUES
(
    'Maria Silva',
    5,
    'Simplesmente perfeito! O bolo de chocolate estava uma delícia e chegou no horário combinado. Super recomendo!',
    null,
    true,
    1
),
(
    'João Santos',
    5,
    'A torta de limão é incrível! Sabor equilibrado e massa crocante. Já virei cliente fiel da Sabores de Zissou.',
    null,
    true,
    2
),
(
    'Ana Costa',
    4,
    'Produtos artesanais de qualidade excepcional. O atendimento também é muito bom. Só o preço que poderia ser um pouquinho melhor.',
    null,
    true,
    3
),
(
    'Carlos Oliveira',
    5,
    'Fiz uma encomenda para o aniversário da minha filha e foi um sucesso! O bolo personalizado ficou lindo e delicioso.',
    null,
    true,
    4
);

-- Inserir alguns assinantes de newsletter de exemplo
INSERT INTO newsletter_subscribers (name, whatsapp) VALUES
('Sofia Zissou', '11981047422'),
('Cliente Exemplo 1', '11987654321'),
('Cliente Exemplo 2', '11976543210');

-- Configurações adicionais do sistema
UPDATE system_settings SET value = 'https://wa.me/5511981047422' WHERE key = 'whatsapp_contact';
UPDATE system_settings SET value = 'chave-pix-exemplo@email.com' WHERE key = 'pix_key';
UPDATE system_settings SET value = 'https://webhook-exemplo.com/pedidos' WHERE key = 'webhook_url';