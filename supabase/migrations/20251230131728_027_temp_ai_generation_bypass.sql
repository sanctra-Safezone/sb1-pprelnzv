/*
  # Temporary AI Generation Bypass for Testing

  1. Changes
    - Creates `can_generate_ai()` function that always returns true
    - Creates `spend_cty()` function that always returns true
  
  2. Purpose
    - Allows testing AI generation without CTY balance requirements
    - TEMPORARY: Remove before production
*/

CREATE OR REPLACE FUNCTION public.can_generate_ai()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true;
$$;

CREATE OR REPLACE FUNCTION public.spend_cty(cost integer)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT true;
$$;