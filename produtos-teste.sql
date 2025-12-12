pedi-- Execute cada comando separadamente no Supabase

-- 1. Primeiro, inserir um produto de teste simples
INSERT INTO products (
    name,
    description,
    price,
    is_daily_product,
    is_special_order,
    is_active
) VALUES (
    'Bolo de Chocolate com Morango',
    'Delicioso bolo de chocolate artesanal coberto com chantilly e morangos frescos.',
    45.90,
    true,
    false,
    true
);

-- 2. Inserir mais um produto do dia
INSERT INTO products (name, description, price, is_daily_product, is_special_order, is_active)
VALUES ('Torta de Limão Cremosa', 'Torta artesanal com massa crocante e recheio cremoso de limão.', 38.50, true, false, true);

-- 3. Inserir um produto de encomenda
INSERT INTO products (name, description, price, is_daily_product, is_special_order, is_active)
VALUES ('Bolo Personalizado 2kg', 'Bolo sob medida para sua ocasião especial.', 85.00, false, true, true);

-- 4. Inserir uma avaliação
INSERT INTO reviews (customer_name, rating, comment, is_approved)
VALUES ('Maria Silva', 5, 'Simplesmente perfeito! O bolo estava delicioso.', true);

-- 5. Verificar se os dados foram inseridos
SELECT * FROM products;
SELECT * FROM reviews;