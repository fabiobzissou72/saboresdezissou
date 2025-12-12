-- Adicionar configuração webhook newsletter
INSERT INTO system_settings (key, value, description) 
VALUES ('webhook_newsletter_url', '', 'URL do webhook para campanhas de newsletter')
ON CONFLICT (key) DO UPDATE SET 
    description = EXCLUDED.description;
