-- USUÁRIOS DE AUTENTICAÇÃO - Papo Detailer - 2026-07-22

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at, raw_user_meta_data)
VALUES (
  '63bcd7bb-63e6-4b31-a338-cf06831572a1', 'authenticated', 'authenticated', 'lucashorst@hotmail.com', '$2a$10$wo9g8XcSIN6VE3NWUhLmMeu7XvtjGpJJcPqWt00yvGuG9MsmQy0He',
  '2026-07-14T02:58:41.663343+00:00', '2026-07-14T02:58:41.62699+00:00', '2026-07-22T03:08:37.449513+00:00', '2026-07-22T01:41:48.402537+00:00',
  '{"sub":"63bcd7bb-63e6-4b31-a338-cf06831572a1","email":"lucashorst@hotmail.com","display_name":"Lucas Horst","email_verified":true,"phone_verified":false}'::jsonb
);
