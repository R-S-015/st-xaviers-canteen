
-- Add out_of_stock boolean column to menu_items
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS out_of_stock BOOLEAN DEFAULT FALSE;

