-- Add referral slip number tracking to referrals table
ALTER TABLE referrals ADD COLUMN referral_slip_number TEXT UNIQUE;

-- Add peso_officer_name and peso_officer_designation for tracking who issued the slip
ALTER TABLE referrals ADD COLUMN peso_officer_name TEXT;
ALTER TABLE referrals ADD COLUMN peso_officer_designation TEXT;

-- Create index for quick lookup by slip number
CREATE INDEX idx_referrals_slip_number ON referrals(referral_slip_number);
