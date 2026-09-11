-- ====================================================================
-- DAY 4 MIGRATION: PAYMENT GATEWAY SECURITY & RAZORPAY INTEGRATION
-- ====================================================================

-- 1. Non-destructive Column Additions to public.payments
ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255);

ALTER TABLE public.payments 
  ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100);

-- 2. Receipt Number Generator Function & Sequence
CREATE SEQUENCE IF NOT EXISTS public.receipt_no_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ICARET27-REC-' || LPAD(NEXTVAL('public.receipt_no_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. Indexes for payment lookups and verification queries
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON public.payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_user_conf ON public.registrations(user_id, conference_id);

-- 4. RLS Policy Hardening for public.registrations
-- Drop permissive FOR ALL policy that allowed direct status manipulation
DROP POLICY IF EXISTS "User manage own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users and admins view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users insert own registration" ON public.registrations;
DROP POLICY IF EXISTS "Admins update registrations" ON public.registrations;

-- Participants can only read their own registration; Admins can read all
CREATE POLICY "Users and admins view registrations" 
  ON public.registrations FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Participants can insert their own registration
CREATE POLICY "Users insert own registration" 
  ON public.registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Only Admins or service-role can update registrations (prevents client setting is_paid = true)
CREATE POLICY "Admins update registrations" 
  ON public.registrations FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 5. RLS Policy Hardening for public.payments
-- Drop permissive FOR ALL policy that allowed direct status manipulation
DROP POLICY IF EXISTS "User manage own payments" ON public.payments;
DROP POLICY IF EXISTS "Users and admins view payments" ON public.payments;
DROP POLICY IF EXISTS "Users insert own payments" ON public.payments;
DROP POLICY IF EXISTS "Admins update payments" ON public.payments;

-- Participants can read their own payment records; Admins can read all
CREATE POLICY "Users and admins view payments" 
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Participants can insert pending payments initiated for their own user_id
CREATE POLICY "Users insert own payments" 
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Only Admins or service-role can update payments (prevents client setting status = 'SUCCESSFUL')
CREATE POLICY "Admins update payments" 
  ON public.payments FOR UPDATE
  USING (public.is_admin(auth.uid()));
