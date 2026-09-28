import re

raw_text = """
JUICES
Lemon Juice ₹20
Jal Jeera Lemon Juice ₹25
Mosambi Juice ₹50
Orange Juice ₹50
Watermelon Juice ₹50
Pineapple Juice ₹50
Guava Juice ₹50
Mara Mari Juice ₹80
Ganga Yamuna ₹60
Beat Carrot Juice ₹50
Beetroot Carrot Anar Juice ₹80
Beetroot Carrot Apple Juice ₹80
Mosambi Anar Juice ₹80
Pineapple/Mosambi/Anar Juice ₹90
Guava/Pineapple/Mosambi Juice ₹90
Watermelon Pineapple Juice ₹80
Kiwi Juice ₹70
Kiwi Lemon Juice ₹80
Mosambi Guava Juice ₹80
Mosambi/Pineapple/Apple Juice ₹90
Watermelon Anar Juice ₹80
Kiwi Mosambi Juice ₹80
Mosambi/Dragon Fruit Juice ₹90
Mosambi/Dragon Fruit/ Kiwi Juice ₹100
Orange/Pineapple/Strawberry Juice ₹100
Mosambi Apple Juice ₹80
Mosambi Guava Pineapple Juice ₹90
Mosambi Guava Anar Juice. ₹90
Avocado Juice ₹120
Mosambi Kiwi Pineapple Juice ₹100
Mix Fruit Juice ₹100
Fruit Plate ₹50

MILKSHAKES
Banana Milkshake ₹50
Chikoo Milkshake ₹60
Banana Chikoo Milkshake ₹80
Mango Milkshake ₹90
Mango Banana Milkshake ₹100
Apple Milkshake ₹80
Chocolate Milkshake ₹70
Oreo Milkshake ₹100
Kitkat Milkshake ₹100
Snickers Milkshake ₹100
Chikoo Chocolate Milkshake ₹80
Kitkat Banana Milkshake ₹110
Oreo Banana Milkshake ₹110
Papaya Milkshake ₹60
Muskmelon Milkshake ₹60
Chocolate Banana Milkshake ₹80
Chocolate With Ice Cream ₹100
Dragon Milkshake ₹100
Strawberry Milkshake ₹90
Strawberry Banana Milkshake ₹100
Strawberry Mango Milkshake ₹100
Dragon Fruit Banana Milkshake ₹110
Kaju Banana Milkshake ₹120
Chikoo Kaju Milkshake ₹120
Mango Badam Milkshake ₹120
Cold Coffee ₹40
Vanilla Cold Coffee ₹120
Caramel Cold Coffee ₹120
Hazelnut Cold Coffee ₹120
Avocado Milkshake ₹120
Coco Mint Cold Coffee ₹120
Rose Faluda ₹130
Kesar Falooda ₹130
Strawberry Falooda ₹130
Butterscotch Falooda ₹130
Banana Coffee Milkshake ₹70
Rose Milkshake ₹50
Kesar Milkshake ₹50
Butterscotch Milkshake ₹50

SANDWICH
Bread Butter Toast ₹30
Veg Sandwich ₹40
Veg Toast Sandwich ₹50
Veg Cheese Sandwich ₹70
Veg Cheese Toast Sandwich ₹70
Paneer Schezwan Toast ₹70
Cheese Garlic Toast ₹60
Cheese Garlic Corn Toast ₹70
Cheese Garlic Capsicum Toast ₹70
Cheese Toast ₹60
Veg Grill Sandwich ₹70
Veg Cheese Grill Sandwich ₹100
Nutella Chocolate Toast Sandwich ₹100
Masala Toast Sandwich ₹70
Onion Capsicum Cheese Toast ₹60
Cheese Capsicum Toast ₹70
Paneer Garlic Toast ₹70
Cheese Sandwich ₹40
Bread Butter Jam Toast ₹40
Cheese Chilli Toast ₹70
Mayo Corn Capsicum Toast ₹70
Veg Paneer Schezwan Toast ₹80
Paneer Cheese Chilli Toast ₹100
Veg Paneer Cheese Grill Sandwich ₹100
Chicken Toast Sandwich ₹60
Chicken Cheese Toast Sandwich ₹80
Chicken Cheese Garlic Toast ₹70
Chicken Mayo Toast ₹70
Chicken Schezwan Toast ₹90
Chicken Grill Sandwich ₹90
Chicken Junglee Toast Sandwich ₹60
Chicken Cheese Chilli Toast ₹120
Omelet Toast Sandwich ₹50
Chicken Pesto Toast Sandwich ₹100

PIZZAS AND BURGERS
Veg Mushroom Cheese Pizza ₹120
Veg Mushroom Paneer Pizza ₹120
Veg Mushroom Corn Cheese Pizza ₹100
Veg Cheese Pizza ₹100
Veg Schezwan Cheese Pizza ₹120
Cheese Garlic Pizza ₹100
Veg Cheese Roll ₹60
Veg Cheese Burger ₹60
Garlic Corn Cheese Bread (5 pcs) ₹110
Paneer Garlic Cheese Bread (5 pcs) ₹120
Cheese Garlic Bread (5 pcs) ₹100
Chicken Cheese Pizza ₹120
Chicken Cheese Jalapeno Pizza ₹130
Chicken Cheese Garlic Pizza ₹130
Chicken Schezwan Cheese Pizza ₹120
Chicken Roll ₹60
Chicken Cheese Roll ₹80
Chicken Panini Roll ₹70
Chicken Mayo Cheese Pizza ₹130
Chicken Cheese Burger ₹70
Chicken Burger ₹60
Chicken Cheese Garlic Bread (5 pieces) ₹120

CHAAT CHASKA
Perrie Chat ₹50
Bhel Puri ₹35
Sev Puri ₹35
Pani Puri ₹30
Masala Puri ₹30
Ragada Puri ₹40
Dahi Puri ₹50
Dahi Sev Puri ₹50
Cheese Bhel ₹50
Cheese Sev Puri ₹50
Sukha Bhel ₹40
Dahi Bhel Batata Chat ₹50
Delhi Chat ₹50
Papdi Chaat ₹50
Ragda Chaat ₹50
Aloo Tikki Chaat ₹50
Dahi Tikki ₹50
Ragda Pattice ₹50
Dahi Ragda Pattice ₹60
Dahi Kachori ₹50
Ragda Kachori ₹50
Samosa Bhel ₹50
Samosa Chaat ₹50
Cheeseling Chat (with chutney) ₹50
Cheeseling Chat (Cheese) ₹50
Basket Chat ₹50
Chole Tikki ₹60
Chole Samosa ₹60

PASTA
Alfredo ₹100
Rosé ₹100
Pesto ₹120
Arrabiata ₹100
Lasagna ₹120
Mac N Cheese ₹120
Chicken Alfredo ₹120
Chicken Rosé ₹120
Chicken Pesto ₹130
Chicken Arrabiata ₹120
Jambalaya Arancini(Chicken) ₹150
Chicken Lasagna ₹130

SOUTH INDIAN CORNER
Sada Dosa ₹40
Butter Sada Dosa ₹50
Cheese Sada Dosa ₹60
Masala Dosa ₹55
Mysore Masala Dosa ₹70
Mysore Sada Dosa ₹50
Schezwan Sada Dosa ₹50
Spring Dosa ₹80
Pav Bhaji Dosa ₹80
Palak Cheese Dosa ₹80
Palak Sada Dosa ₹60
Schezwan Cheese ₹80
Schezwan Masala ₹65
Cheese Mysore Masala ₹90
Sada Uthappa ₹45
Onion Uthappa ₹55
Tomato Onion Uttapam ₹60
Medu Vada ₹50
Idli Vada ₹45
Idli Sambar ₹40
Idli Butter ₹50
Chole Bature ₹75
Usal Misal Pav ₹40
Paneer Sada Dosa ₹70
Paneer Masala Dosa ₹80
Paneer Capsicum Dosa ₹80
Paneer Schezwan Dosa ₹80
Neer Dosa Chutney ₹60
Tufani Sada Dosa ₹60
Tufani Masala Dosa ₹80
Tufani Cheese Dosa ₹80
Tufani Dancer Dosa ₹90
Ragi Dosa ₹60
Ragi Masala Dosa ₹80
Ragi Mysore Masala Dosa ₹80
Ragi Cheese Mysore Masala Dosa ₹100
Ragi Cheese Dosa ₹80
Pizza DosA ₹100
Jini Dosa ₹100
Noodle Dosa ₹100
Dil Kush Uthappa ₹100
Peri Peri Dosa ₹80
Peri Peri Cheese Dosa ₹100
Peri Peri Masala Dosa ₹100
Sultani Dosa ₹100
Set Dosa ₹100
Rava Sada Dosa ₹60
Rava Masala Dosa ₹80
Rava Cheese Sada Dosa ₹80
Rava Schezwan Masala Dosa ₹100
Chocolate Dosa ₹120
Paneer Sada ₹60
Paneer Cheese Sada ₹80
Paneer Masala Dosa ₹80
Paneer Schezwan Masala Dosa ₹100
Veg Uttapam ₹80
Aloo Parata ₹40
Paneer Parata ₹50
Chicken Paratha ₹50
Chicken Keema Paratha ₹50
Chicken Cutlet Pav ₹40
Chicken Bhature ₹100

CHINESE STARTERS
Honey Chilli Paneer Dry ₹160
Paneer 65 (Dry/Gravy) ₹150
Paneer Schezwan (Dry/Gravy) ₹150
Paneer Chilli (Dry/Gravy) ₹150
Paneer Crispy (Dry) ₹150
Paneer Hot Garlic Sauce ₹150
Paneer Sweet & Sour Sauce ₹150
Paneer Manchurian(Dry/Gravy) ₹140
Mushroom Chilly (Dry) ₹150
Mushroom Manchurian (Dry/Gravy) ₹120
Mushroom Chilly (Gravy) ₹120
Mushroom 65 (Dry) ₹120
Mushroom Schezwan (Dry/Gravy) ₹120
Mushroom Garlic Sauce ₹120
Mushroom Sweet Garlic Dry ₹120
Mushroom Crispy (Dry) ₹120
Mushroom Sweet Sour Sauce ₹120
Mushroom Hot Garlic Sauce ₹120
Corn Golden Dry ₹100
Corn Chilli Dry ₹120
Corn Crispy Dry ₹120
Corn 65 Dry ₹120
Corn Garlic Dry ₹120
Corn Schezwan Dry ₹120
Corn Baby Chilly ₹120
Corn Sweet and Sour ₹120
Veg Manchurian Dry ₹120
Veg Manchurian Schezwan Dry ₹150
Momos Steamed ₹90
Momos Paneer Steamed ₹90
Momo Chilly (Veg) ₹100
Momo Chilly (Non-veg) ₹120
C. Momo Dry (Veg/Non-veg) ₹110
Momo Schezwan (Veg/Non-veg) ₹110
Momo Sauce (Veg/Non-veg) ₹60
Momo Chopsuey (Veg/Non-veg) ₹110
Chicken Schezwan Roll ₹60
Veg Schezwan Roll ₹50
American Chopsuey ₹100
Chinese Chopsuey ₹100
Chicken American Chopsuey ₹100
Chicken Chinese Chopsuey ₹100
Lollipop Fry U.P.S. ₹150
Lollypop Dry U.P.S. ₹120
Lollipop Gravy ₹120
Honey Chilli Chicken ₹200
Chicken Salt & Pepper ₹120
Chicken 65 ₹120
Chicken Crispy ₹120
Chicken Tangdi Fry (per piece) ₹50
Chicken Haddy Chilly ₹120
Chicken Dice Chilly ₹120
Chicken Sweet Garlic ₹120
Prawns Golden Fry ₹150
Prawns Koliwada ₹150
Prawns Chilly ₹150
Prawns Manchurian ₹150
Prawns 65 ₹150
Prawns Schezwan ₹150
Honey Chilli Prawns ₹200
Prawns Hot & Sweet ₹160
Prawns Hot Garlic ₹160
Prawns Sweet & Sour ₹160

CHINESE RICE AND NOODLES
Veg Triple Rice ₹130
Veg Coriander Rice ₹130
Veg Manchurian Rice ₹130
Veg Mushroom Rice ₹100
Veg Singapore Rice ₹100
Veg Hong Kong Rice ₹100
Veg Thousand Rice ₹150
Veg Chopper Rice ₹140
Veg Combination Rice ₹110
Veg Manchow Rice ₹130
Veg Paneer Fried Rice ₹120
Veg Paneer Tikka Rice ₹130
Veg Chilli Rice ₹130
Veg Italian Rice ₹130
Veg Manchurian Dry ₹130
Veg Mushroom Dry ₹130
Paneer Chilli ₹150
Paneer Crispy ₹120
Veg Crispy ₹90
Veg American Chopsy ₹100
Veg Chinese Beal ₹80
Veg Garlic Rice ₹100
Veg Crispy Rice ₹100
Veg Momo Chilli Rice ₹150
Veg Chilli Rice ₹140
Veg Fried Momos ₹100
Veg Mumbai Special ₹100
Veg Chinese Thali ₹140
Veg Italian Rice ₹130
Veg Dragon Rice ₹140
Veg Malaysian Rice ₹140
Veg Sherpa Rice ₹140
Veg Green Chilli Rice ₹140
Veg Senri Rice ₹140
Hong Kong Noodles ₹100
Singapore Noodles ₹100
Mushroom Noodles ₹110
Garlic Noodles ₹100
Crispy Noodles ₹110
Triple Noodles ₹130
Combo Noodles ₹110
Mumbai Special Noodles ₹110
Paneer Schezwan Noodles ₹130
Chopper Noodles ₹140
Momo Chilli ₹130
Paneer chili momos ₹130
Spring roll ₹50
Chinese Ball ₹80
Crispy ₹100
Tu borg Pav ₹60
Veg Crispy Noodles ₹100
Veg Crispy Rice ₹100
Chicken Chinese Thali ₹150
Chicken American Chopsy ₹100
Chicken Chinese Beal ₹90
Chicken Chilli Rice ₹150
Chicken Mumbai Special ₹100
Chicken Triple Rice ₹140
Chicken Hong Kong Rice ₹110
Chicken Singapore Rice ₹110
Chicken Al King Rice ₹150
Chicken Shish Touk Rice ₹120
Chicken Fried Rice BBC ₹120

FRANKIE ROLL
Veg Frankie ₹50
Veg Cheese Frankie (Mayo) ₹80
Veg Szechuan Frankie ₹60
Noodle Frankie ₹60
Noodle Cheese/Mayo Frankie ₹80
Noodle Szechuan Frankie ₹70
Mix Special Frankie ₹90
Paneer Frankie ₹70
Paneer Cheese/Mayo Frankie ₹90
Paneer Szechuan Frankie ₹90
Manchurian Frankie ₹80
Manchurian Cheese/Mayo Frankie ₹90
Manchurian Szechuan Frankie ₹80
Paneer Chilli Frankie ₹90
Paneer Chilli Cheese/Mayo Frankie ₹100
Chinese Bhel Frankie ₹80
Chinese Bhel Cheese/Mayo Frankie ₹100
Mix Special Manchurian Paneer Frankie ₹120
Pizza Frankie ₹90
Pizza Paneer Frankie ₹100
Veg Corn Frankie ₹60
Veg Cheese Corn Frankie ₹80
Veg Corn Paneer Cheese Mayo Szechuan Frankie ₹100
Egg Fring ₹60
Egg Cheese/Mayo Frankie ₹80
Egg Szechuan Frankie ₹70
Egg Paneer Cheese/Mayo Frankie ₹100
Egg Veg Frankie ₹80
Egg Noodle Frankie ₹80
Egg Manchurian Frankie ₹100
Chicken Noodle Frankie ₹90
Chicken Frankie ₹70
Chicken Cheese Frankie ₹90
Chicken Mayo Frankie ₹80
Chicken Szechuan Frankie ₹80
Chicken Dragon Frankie ₹80
Chicken Manchurian Fry ₹110

PAV BHAJI
Pav Bhaji ₹70
Butter Pav Bhaji ₹80
Cheese Pav Bhaji ₹90
Masala Pav ₹70
Cheese Masala Pav ₹90
Butter Masala Pav ₹80
Mushroom Pav Bhaji ₹80
Paneer Pav Bhaji ₹80
Tawa Pulav ₹70
Sada Pulav ₹70
Butter Pulav ₹80
Cheese Pulav ₹90
Butter Cheese Pulav ₹100
Mushroom Pulav ₹80
Paneer Pulav ₹80

CHAI ADDA
Hyderabadi Tea Cutting ₹10
Hyderabadi Tea Full ₹20
Elaichi Tea Cutting ₹10
Elaichi Tea Full ₹20
Masala Tea Cutting ₹10
Masala Tea Full ₹20
Ginger Tea Cutting ₹10
Ginger Tea Full ₹20
Black Tea ₹10
Filter Coffee Cutting ₹15
Green Tea with Honey Mint ₹20
Lemon Tea with Honey Mint ₹20
Kesari Ukala ₹25
Milk ₹25
Badam Milk ₹25
Boost ₹25
Bournvita ₹25
Horlicks ₹25
Hot Chocolate ₹25
Lemon Iced Tea ₹35

BREAKFAST COUNTER
Sheera ₹35
Poha ₹30
Upma ₹30
Double Omlet Pav (2Pcs) ₹50
Double Bhurji Pav (2Pcs) ₹60
Egg Burma ₹60
Aloo Paratha ₹50
French Toast ₹70
Boiled Egg ₹12
Irani Omelette ₹50
Garlic Toast (2ps) ₹30
Maggi ₹40
Cheese Maggi ₹50
Veg Maggi ₹50
Bread Butter Toast ₹20
Bun Maska/Jam ₹20

LUNCH COUNTER
Veg Lunch ₹80
½ Veg Biryani ₹60
½ Veg Pulav ₹60
½ Jeera Rice ₹60
Malabar Parotta ₹20
Rajma Rice ₹60
Non-Veg Lunch ₹140
Chicken Biryani ₹140
½ Chicken Biryani ₹90
Chicken Keema ₹60
Chicken Masala ₹75
Butter Chicken ₹75
Double Egg Rice ₹80
Chana Masala ₹35
Rajma Masala ₹35
Sukha Bhaji ₹30
Paneer Masala ₹50

SNACKS
Peri Peri Masala French Fries ₹85
French Fries ₹70
Cheese French Fries ₹90
Peri Peri & Cheese French Fries ₹100
Wedges ₹80
Chilli Garlic ₹80
Cheese Shotz ₹90
Double Egg Bhurji ₹60
Double Omelette ₹50
Double Egg Fry ₹50
Double Egg Schezwan Omelette ₹60
"""

sql_lines = ["DELETE FROM menu_items;", "INSERT INTO menu_items (name, price, category, available) VALUES"]
values = []

current_category = "General"
for line in raw_text.splitlines():
    line = line.strip()
    if not line:
        continue
    
    # If the line is entirely uppercase and has no ₹, it's a category
    if line.isupper() and '₹' not in line:
        current_category = line.title()
        continue
    
    # Otherwise extract name and price
    match = re.match(r"^(.*?)\s+₹?\s*(\d+)(?:/.*)?$", line)
    if match:
        name = match.group(1).strip().replace("'", "''")
        price = match.group(2)
        values.append(f"  ('{name}', {price}, '{current_category}', true)")

sql_lines.append(",\n".join(values) + ";")

with open('st_xaviers_menu_full.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_lines))

print(f"Generated {len(values)} items in st_xaviers_menu_full.sql")
