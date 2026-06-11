CREATE TABLE IF NOT EXISTS announcement_attachments (
  id BIGSERIAL PRIMARY KEY,
  announcement_id BIGINT NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL UNIQUE,
  mime_type VARCHAR(120),
  file_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcement_attachments_announcement_id
  ON announcement_attachments(announcement_id);
