-- Create invitees table
CREATE TABLE IF NOT EXISTS invitees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  unique_token VARCHAR(255) UNIQUE NOT NULL,
  qr_scanned BOOLEAN DEFAULT FALSE,
  rsvp_response VARCHAR(10) CHECK (rsvp_response IN ('yes', 'no')),
  rsvp_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deletion log table for tracking deletions with reasons
CREATE TABLE IF NOT EXISTS deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitee_name VARCHAR(255) NOT NULL,
  invitee_token VARCHAR(255) NOT NULL,
  deletion_reason TEXT NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitees_unique_token ON invitees(unique_token);
CREATE INDEX IF NOT EXISTS idx_invitees_rsvp_response ON invitees(rsvp_response);
CREATE INDEX IF NOT EXISTS idx_invitees_qr_scanned ON invitees(qr_scanned);
CREATE INDEX IF NOT EXISTS idx_deletion_log_deleted_at ON deletion_log(deleted_at);
