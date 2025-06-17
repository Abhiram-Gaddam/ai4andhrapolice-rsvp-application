-- Insert sample invitees for testing
INSERT INTO invitees (name, unique_token) VALUES
  ('John Doe', 'abc123'),
  ('Jane Smith', 'def456'),
  ('Mike Johnson', 'ghi789'),
  ('Sarah Wilson', 'jkl012'),
  ('David Brown', 'mno345')
ON CONFLICT (unique_token) DO NOTHING;
