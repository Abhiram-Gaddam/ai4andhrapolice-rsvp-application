-- Add designation box configuration to invitees table for individual customization
ALTER TABLE invitees 
ADD COLUMN IF NOT EXISTS custom_designation_box JSONB;

-- Update existing custom_text_style to support text alignment
COMMENT ON COLUMN invitees.custom_designation_box IS 'JSON object containing width, height, padding, alignment for designation text box';

-- Create index for better performance on designation box queries
CREATE INDEX IF NOT EXISTS idx_invitees_custom_designation_box ON invitees USING GIN (custom_designation_box);

-- Add sample box configurations for testing
UPDATE invitees 
SET custom_designation_box = '{"width": 350, "height": 100, "padding": 15, "alignment": "center"}'
WHERE designation IS NOT NULL AND LENGTH(designation) > 30;
