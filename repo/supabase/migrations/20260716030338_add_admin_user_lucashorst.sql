-- Add lucashorst@hotmail.com as admin user
INSERT INTO admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'lucashorst@hotmail.com'
ON CONFLICT (user_id) DO NOTHING;
