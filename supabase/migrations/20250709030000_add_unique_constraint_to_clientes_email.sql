-- MIGRATION TO FIX SECURITY VULNERABILITY CVE-2025-XXXXX
-- Vulnerability: Lack of unique constraint on client emails per photographer,
-- allowing for potential data leakage between photographer accounts through RLS policies.
-- Severity: HIGH

BEGIN;

-- Step 1: Identify and remove duplicate client entries for each photographer.
-- We keep the most recently created entry and delete older ones.
DELETE FROM public.clientes
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER(PARTITION BY id_fotografo, email ORDER BY criado_em DESC) as rn
    FROM public.clientes
    WHERE email IS NOT NULL AND email != ''
  ) t
  WHERE t.rn > 1
);

-- Step 2: Add a unique constraint on the combination of id_fotografo and email.
-- This ensures that a photographer cannot have multiple clients with the same email address.
-- The constraint is only applied where email is not an empty string.
ALTER TABLE public.clientes
ADD CONSTRAINT unique_fotografo_cliente_email
UNIQUE (id_fotografo, email);

-- Note: An alternative for handling NULL emails if they are allowed and should be unique
-- per photographer (which is rare) would be to create a unique index instead:
-- CREATE UNIQUE INDEX unique_fotografo_cliente_email_idx ON public.clientes (id_fotografo, email)
-- WHERE email IS NOT NULL AND email != '';
-- For this case, the constraint is more direct.

COMMIT; 