import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1].replace(/"/g, '').trim(), keyMatch[1].replace(/"/g, '').trim());

async function testOrder() {
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        status: 'new',
        pickup_type: 'ASAP',
        total_amount: 100,
        items: ["1x Samosa"],
        user_id: null
      }
    ])
    .select();

  console.log("Error:", error);
  console.log("Data:", data);
}

testOrder();
