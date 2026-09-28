const fs = require('fs');
const path = require('path');

const files = [
  'src/app/page.tsx',
  'src/components/HeaderAuth.tsx',
  'src/components/MenuList.tsx',
  'src/app/cart/page.tsx',
  'src/app/checkout/page.tsx',
  'src/app/success/page.tsx',
  'src/app/kitchen/page.tsx',
  'src/app/kitchen/menu/page.tsx'
];

// Color mapping (from old stark/light pastel to deep creamy latte)
const replacements = [
  // Backgrounds
  { regex: /bg-\[\#F7F5F0\]/g, replace: 'bg-[#E5DCC5]' }, // App background -> Latte
  { regex: /bg-\[\#FDFDFB\]|bg-white/g, replace: 'bg-[#F2EAE0]' }, // Cards -> Soft Cream
  { regex: /bg-\[\#F0EBE1\]|bg-\[\#F5F2EA\]|bg-\[\#E5DFD3\]/g, replace: 'bg-[#DCD0B6]' }, // Headers/Sidebars -> Darker Latte
  
  // Borders
  { regex: /border-\[\#EBE6DD\]|border-\[\#E5DFD3\]|border-\[\#F0EBE1\]|border-gray-100|border-gray-200/g, replace: 'border-[#CFBFA3]' }, 
  
  // Text Colors
  { regex: /text-stone-800|text-stone-900|text-gray-800|text-gray-900/g, replace: 'text-[#4A3C31]' }, // Dark Espresso
  { regex: /text-stone-700|text-gray-700/g, replace: 'text-[#5E4D3F]' },
  { regex: /text-stone-500|text-stone-600|text-gray-500|text-gray-600|text-\[\#A8A296\]/g, replace: 'text-[#8C7A6B]' }, // Muted Mocha
  { regex: /text-stone-400|text-gray-400/g, replace: 'text-[#A6978A]' },

  // Accents - Rose to Terracotta
  { regex: /bg-\[\#E5989B\]|bg-rose-500|bg-rose-600|bg-red-500|bg-red-400/g, replace: 'bg-[#C97A7E]' }, 
  { regex: /text-\[\#E5989B\]|text-rose-500|text-rose-600|text-rose-700|text-rose-800|text-red-500|text-red-600/g, replace: 'text-[#B85C60]' },
  { regex: /bg-rose-50|bg-red-50/g, replace: 'bg-[#C97A7E]/10' },
  { regex: /border-rose-100|border-rose-200|border-rose-400|border-\[\#D58588\]\/50|border-red-100|border-red-400|border-red-500/g, replace: 'border-[#C97A7E]/30' },
  { regex: /hover:bg-\[\#D58588\]|hover:bg-rose-100|hover:bg-rose-200/g, replace: 'hover:bg-[#B85C60] hover:text-white' },

  // Accents - Emerald to Sage
  { regex: /bg-\[\#83C5BE\]|bg-emerald-500|bg-emerald-600|bg-green-500|bg-green-600/g, replace: 'bg-[#769C8A]' },
  { regex: /text-\[\#83C5BE\]|text-emerald-500|text-emerald-600|text-emerald-700|text-emerald-800|text-green-500|text-green-600/g, replace: 'text-[#5C7F6F]' },
  { regex: /bg-emerald-50|bg-green-50/g, replace: 'bg-[#769C8A]/10' },
  { regex: /border-emerald-100|border-emerald-200|border-emerald-500|border-green-100|border-green-200|border-green-500/g, replace: 'border-[#769C8A]/30' },
  { regex: /hover:bg-\[\#72B0A9\]|hover:bg-emerald-100|hover:bg-emerald-50|hover:bg-green-100|hover:bg-green-50/g, replace: 'hover:bg-[#769C8A] hover:text-[#F2EAE0]' },

  // Specific overrides for Kitchen Dashboard column backgrounds
  { regex: /bg-\[\#F0F4F8\]/g, replace: 'bg-[#DCD0B6]' }, // Preparing col
  { regex: /bg-\[\#F2FAF7\]/g, replace: 'bg-[#D5E0D8]' }, // Ready col
  
  // Replace direct white hex references in floating buttons
  { regex: /text-white/g, replace: 'text-[#F2EAE0]' }
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(({ regex, replace }) => {
      content = content.replace(regex, replace);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
