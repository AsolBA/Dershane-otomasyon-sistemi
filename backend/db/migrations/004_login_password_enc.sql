ALTER TABLE users
  ADD COLUMN IF NOT EXISTS login_password_enc TEXT;
