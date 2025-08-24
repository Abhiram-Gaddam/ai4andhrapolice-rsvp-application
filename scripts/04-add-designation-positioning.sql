-- Add designation positioning column to invitees table
ALTER TABLE invitees 
ADD COLUMN IF NOT EXISTS custom_designation_position JSONB;

-- Update existing custom_text_style to support separate name and designation styling
-- This is backward compatible - existing records will continue to work
COMMENT ON COLUMN invitees.custom_text_style IS 'JSON object containing nameColor, designationColor, nameFont, designationFont';

-- Create index for better performance on designation positioning queries
CREATE INDEX IF NOT EXISTS idx_invitees_custom_designation_positioning ON invitees USING GIN (custom_designation_position);
