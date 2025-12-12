INSERT INTO system_settings (key, value, description) VALUES ('webhook_newsletter_url', '', 'URL do webhook para envio de campanhas newsletter') ON CONFLICT (key) DO NOTHING;
