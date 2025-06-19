-- Add individual positioning columns to invitees table
ALTER TABLE invitees 
ADD COLUMN IF NOT EXISTS custom_qr_position JSONB,
ADD COLUMN IF NOT EXISTS custom_name_position JSONB,
ADD COLUMN IF NOT EXISTS custom_text_style JSONB;

-- Create index for better performance on custom positioning queries
CREATE INDEX IF NOT EXISTS idx_invitees_custom_positioning ON invitees USING GIN (custom_qr_position, custom_name_position);
