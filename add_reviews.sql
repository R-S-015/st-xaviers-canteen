
-- Add ratings and feedback to the orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Create a view for easy menu rating aggregation
CREATE OR REPLACE VIEW public.menu_ratings AS
SELECT 
    m.name AS item_name,
    COUNT(o.rating) AS total_reviews,
    ROUND(AVG(o.rating), 1) AS average_rating
FROM 
    public.menu_items m
LEFT JOIN LATERAL (
    SELECT rating
    FROM public.orders o,
    jsonb_array_elements_text(o.items::jsonb) AS item_str
    WHERE item_str LIKE '%' || m.name || '%'
    AND o.rating IS NOT NULL
) o ON true
GROUP BY m.name;

