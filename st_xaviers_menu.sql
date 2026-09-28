-- First, let's clear the old dummy data
DELETE FROM menu_items;

-- Now insert the official St. Xavier's Canteen Menu (Excluding Annexe Building)!
INSERT INTO menu_items (name, price, category, available) VALUES
-- SOUTH INDIAN CORNER
('Sada Dosa', 40, 'South Indian', true),
('Masala Dosa', 55, 'South Indian', true),
('Mysore Masala Dosa', 70, 'South Indian', true),
('Cheese Sada Dosa', 60, 'South Indian', true),
('Idli Sambar', 40, 'South Indian', true),
('Idli Vada', 45, 'South Indian', true),
('Medu Vada', 50, 'South Indian', true),
('Tomato Onion Uttapam', 60, 'South Indian', true),
('Chole Bature', 75, 'South Indian', true),
('Usal Misal Pav', 40, 'South Indian', true),

-- SANDWICHES
('Veg Sandwich', 40, 'Sandwich', true),
('Veg Toast Sandwich', 50, 'Sandwich', true),
('Veg Cheese Sandwich', 70, 'Sandwich', true),
('Veg Grill Sandwich', 70, 'Sandwich', true),
('Cheese Garlic Toast', 60, 'Sandwich', true),
('Nutella Chocolate Toast Sandwich', 100, 'Sandwich', true),
('Chicken Mayo Toast', 70, 'Sandwich', true),
('Chicken Grill Sandwich', 90, 'Sandwich', true),

-- BREAKFAST & CHAI ADDA
('Poha', 30, 'Breakfast', true),
('Upma', 30, 'Breakfast', true),
('Sheera', 35, 'Breakfast', true),
('Double Omlet Pav', 50, 'Breakfast', true),
('Bun Maska/Jam', 20, 'Breakfast', true),
('Hyderabadi Tea Full', 20, 'Chai Adda', true),
('Masala Tea Cutting', 10, 'Chai Adda', true),
('Filter Coffee Full', 20, 'Chai Adda', true),

-- LUNCH COUNTER
('Veg Lunch', 80, 'Lunch', true),
('Non-Veg Lunch', 140, 'Lunch', true),
('½ Veg Biryani', 60, 'Lunch', true),
('Chicken Biryani', 140, 'Lunch', true),
('Butter Chicken', 75, 'Lunch', true),
('Rajma Rice', 60, 'Lunch', true),

-- CHINESE & FRANKIE
('Veg Hakka Noodles', 80, 'Chinese', true),
('Chicken Hakka Noodles', 100, 'Chinese', true),
('Veg Fried Rice', 80, 'Chinese', true),
('Chicken Fried Rice', 100, 'Chinese', true),
('Veg Frankie', 50, 'Frankie', true),
('Veg Cheese Frankie', 80, 'Frankie', true),
('Chicken Frankie', 70, 'Frankie', true),
('Chicken Cheese Frankie', 90, 'Frankie', true),

-- JUICES & MILKSHAKES
('Lemon Juice', 20, 'Beverages', true),
('Mosambi Juice', 50, 'Beverages', true),
('Watermelon Juice', 50, 'Beverages', true),
('Cold Coffee', 40, 'Beverages', true),
('Chocolate Milkshake', 70, 'Beverages', true),
('Oreo Milkshake', 100, 'Beverages', true),

-- CHAAT & PAV BHAJI
('Bhel Puri', 35, 'Chaat', true),
('Pani Puri', 30, 'Chaat', true),
('Sev Puri', 35, 'Chaat', true),
('Dahi Puri', 50, 'Chaat', true),
('Pav Bhaji', 70, 'Pav Bhaji', true),
('Butter Pav Bhaji', 80, 'Pav Bhaji', true),
('Cheese Pav Bhaji', 90, 'Pav Bhaji', true),

-- PIZZAS & PASTAS
('Veg Cheese Pizza', 100, 'Pizza & Pasta', true),
('Chicken Cheese Pizza', 120, 'Pizza & Pasta', true),
('Mac N Cheese', 120, 'Pizza & Pasta', true),
('Alfredo Pasta', 100, 'Pizza & Pasta', true);
