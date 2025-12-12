-- Execute CADA COMANDO SEPARADAMENTE no Supabase SQL Editor

-- 1. Produto do Dia - Bolo de Chocolate
INSERT INTO products (name, description, price, is_daily_product, is_special_order, is_active)
VALUES ('Bolo de Chocolate com Morango', 'Delicioso bolo artesanal com morangos frescos', 45.90, true, false, true);

-- 2. Produto do Dia - Torta de Limão
INSERT INTO products (name, description, price, is_daily_product, is_special_order, is_active)
VALUES ('Torta de Limão Cremosa', 'Torta artesanal com recheio cremoso de limão', 38.50, true, false, true);

-- 3. Produto do Dia - Pão Integral
INSERT INTO products (name, description, price, is_daily_product, is_special_order, is_active)
VALUES ('Pão Artesanal Integral', 'Pão caseiro com grãos integrais', 12.00, true, false, true);

-- 4. Encomenda - Bolo Personalizado
INSERT INTO products (name, description, price, is_daily_product, is_special_order, is_active)
VALUES ('Bolo Personalizado 2kg', 'Bolo sob medida para ocasões especiais', 85.00, false, true, true);

-- 5. Encomenda - Kit Docinhos
INSERT INTO products (name, description, price, is_daily_product, is_special_order, is_active)
VALUES ('Kit Docinhos Festa', 'Kit com 100 docinhos variados', 120.00, false, true, true);

-- 6. Avaliação 1
INSERT INTO reviews (customer_name, rating, comment, is_approved)
VALUES ('Maria Silva', 5, 'Bolo maravilhoso! Super recomendo!', true);

-- 7. Avaliação 2
INSERT INTO reviews (customer_name, rating, comment, is_approved)
VALUES ('João Santos', 5, 'Qualidade excepcional, virei cliente fiel!', true);

-- 8. Configurar WhatsApp
UPDATE system_settings SET value = '5511981047422' WHERE key = 'whatsapp_contact';

-- 9. Configurar Chave PIX
UPDATE system_settings SET value = 'sua-chave-pix@email.com' WHERE key = 'pix_key';

-- 10. Verificar se funcionou
SELECT * FROM products;
SELECT * FROM reviews;