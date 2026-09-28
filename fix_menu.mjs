import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMenu() {
  console.log("Fetching all menu items...");
  const { data: items, error } = await supabase.from('menu_items').select('*');
  
  if (error) {
    console.error("Error fetching items:", error);
    return;
  }

  console.log(`Found ${items.length} total items in DB.`);

  // 1. Deduplicate by name
  const nameMap = new Map();
  const duplicateIds = [];

  for (const item of items) {
    const name = item.name.trim().toLowerCase();
    if (nameMap.has(name)) {
      duplicateIds.push(item.id);
    } else {
      nameMap.set(name, item);
    }
  }

  if (duplicateIds.length > 0) {
    console.log(`Deleting ${duplicateIds.length} duplicate items...`);
    // Delete in chunks of 50
    for (let i = 0; i < duplicateIds.length; i += 50) {
      const chunk = duplicateIds.slice(i, i + 50);
      const { error: delError } = await supabase.from('menu_items').delete().in('id', chunk);
      if (delError) console.error("Error deleting:", delError);
    }
    console.log("Duplicates deleted.");
  } else {
    console.log("No duplicates found.");
  }

  // 2. Insert missing items that were skipped from Pages 17, 20, 21, 22
  const missingItemsRaw = `
CHINESE RICE AND NOODLES
Chicken Crispy Rice ₹110
Chicken Chopper Rice ₹150
Chicken Chilli Rice ₹150
Chicken Garlic Rice ₹110
Chicken Tiranga Rice ₹150
Sp. Colcat ₹120
Sp. Chicken Sauce Jalapeno Rice ₹120
Chicken Biryani ₹100
Boneless Butter Chicken Rice ₹100
BBC Rice ₹100
Malar Chicken Plate ₹120
Chicken Cordon Bleu ₹150
Malar Pav ₹80
Shishtouk Pav ₹80
Tu Burger Pav ₹80
Lollipop Pav ₹80
Chicken Burn Fried Rice ₹120
Chicken Garlic Fried Rice ₹120
Chicken Chop Rice ₹150
Chicken Spring Roll ₹60
Chicken Schezwan Roll ₹70
Chicken Combo Rice ₹120
Coriander Chicken Chilli Rice ₹150
Chicken Manchow Rice ₹130
Italian Rice ₹130
Malaysian Rice ₹140
Dragon Rice ₹140
Sherpa Rice ₹140
Green Chilly Rice ₹150
Combo Rice ₹130
Senvi Rice ₹140
Masala Rice ₹150
Manisha Cot. Sp. Rice ₹150
Chicken Corenda Chilly ₹130
Lolly Rice ₹150

CHINESE STARTERS
Dragon Chicken ₹160
Lollipop Fry ₹80
Lolly Pop Dry ₹100
Chicken Garlic ₹150
Chicken Chilly ₹90
Chicken Manchurian ₹80
Chicken C. Bhele ₹80
Chicken Chopsuey ₹90
Momo Chilly ₹100
Chicken 65 ₹80
Paneer Chilly ₹90
Paneer Manchurian ₹90

CHINESE DISHES
Veg Hakka Noodles With Gravy ₹80
Veg Hakka Noodles With Manchurian Pakoda ₹90
Egg Hakka Noodles With Gravy ₹90
Chicken Hakka Noodles With Manchurian Pakoda ₹100
Veg Fried Rice With Gravy ₹80
Veg Fried Rice With Manchurian Pakoda ₹90
Egg Fried Rice With Gravy ₹90
Chicken Fried Rice With Manchurian Pakoda ₹100
Veg Schezwan Noodles With Gravy ₹80
Veg Schezwan Noodles With Manchurian Pakoda ₹90
Egg Schezwan Noodles With Gravy ₹100
Chicken Schezwan Noodles With Manchurian Pakoda ₹100
Veg Schezwan Rice With Gravy ₹80
Veg Schezwan Rice With Manchurian Pakoda ₹90
Egg Schezwan Rice With Gravy ₹100
Chicken Schezwan Rice With Manchurian Pakoda ₹100
Veg Manchow Soup ₹60
Chicken Manchow Soup ₹80
Chicken Sweet Corn Soup ₹80
Boneless Butter Chicken with Biryani Rice ₹100
Paneer Butter Masala with Biryani Rice ₹100
`;

  let currentCategory = "General";
  const itemsToInsert = [];

  for (let line of missingItemsRaw.split('\n')) {
    line = line.trim();
    if (!line) continue;
    
    if (line.toUpperCase() === line && !line.includes('₹')) {
      currentCategory = line;
      continue;
    }

    const match = line.match(/^(.*?)\s+₹?\s*(\d+)(?:\/.*)?$/);
    if (match) {
      const name = match[1].trim();
      const price = parseInt(match[2], 10);
      
      // Check if it already exists to prevent re-adding
      if (!nameMap.has(name.toLowerCase())) {
        itemsToInsert.push({
          name: name,
          price: price,
          category: currentCategory,
          available: true
        });
        nameMap.set(name.toLowerCase(), true);
      }
    }
  }

  if (itemsToInsert.length > 0) {
    console.log(`Inserting ${itemsToInsert.length} missing items...`);
    const { error: insError } = await supabase.from('menu_items').insert(itemsToInsert);
    if (insError) {
      console.error("Error inserting:", insError);
    } else {
      console.log("Successfully inserted missing items!");
    }
  } else {
    console.log("No missing items needed to be inserted.");
  }
}

fixMenu();
