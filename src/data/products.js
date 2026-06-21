// src/data/products.js
// Static product data for the grocery shop with fallbacks

const products = [
  // Groceries
  {
    id: 'basmati-rice-5kg',
    name: 'Basmati Rice (5kg)',
    category: 'groceries',
    price: 450,
    unit: '5kg',
    description: 'Premium long-grain basmati rice, aromatic and fluffy. Perfect for special meals.',
    image: 'basmati_rice',
    inStock: true,
  },
  {
    id: 'toor-dal-1kg',
    name: 'Toor Dal (1kg)',
    category: 'groceries',
    price: 160,
    unit: '1kg',
    description: 'Fresh yellow split pigeon peas, rich in protein. Easy to cook and digest.',
    image: 'toor_dal',
    inStock: true,
  },
  {
    id: 'refined-sunflower-oil-1l',
    name: 'Refined Sunflower Oil (1L)',
    category: 'groceries',
    price: 130,
    unit: '1L',
    description: 'Light refined sunflower oil, ideal for everyday healthy cooking.',
    image: 'sunflower_oil',
    inStock: true,
  },
  {
    id: 'aashirvaad-atta-5kg',
    name: 'Aashirvaad Atta (5kg)',
    category: 'groceries',
    price: 270,
    unit: '5kg',
    description: 'Whole wheat flour blend for soft, nutritious rotis and chapatis.',
    image: 'atta_flour',
    inStock: true,
  },

  // Amul Products
  {
    id: 'amul-gold-milk-1l',
    name: 'Amul Gold Milk (1L)',
    category: 'amul_products',
    price: 66,
    unit: '1L',
    description: 'High-fat pasteurized milk from Amul, rich and creamy, perfect for tea, coffee, and sweets.',
    image: 'amul_milk',
    inStock: true,
  },
  {
    id: 'amul-butter-500g',
    name: 'Amul Butter (500g)',
    category: 'amul_products',
    price: 275,
    unit: '500g',
    description: 'Deliciously salted, creamy table butter. Essential for toasts, parathas, and baking.',
    image: 'amul_butter',
    inStock: true,
  },
  {
    id: 'amul-cheese-slices-200g',
    name: 'Amul Cheese Slices (200g)',
    category: 'amul_products',
    price: 150,
    unit: '200g',
    description: 'Creamy cheese slices, perfect for quick sandwiches, burgers, and snacks.',
    image: 'amul_cheese',
    inStock: true,
  },

  // Ice Cream
  {
    id: 'vanilla-gold-tub-700ml',
    name: 'Vanilla Gold Tub (700ml)',
    category: 'ice_cream',
    price: 180,
    unit: '700ml',
    description: 'Premium rich vanilla ice cream tub. Classic, smooth, and delicious.',
    image: 'vanilla_tub',
    inStock: true,
  },
  {
    id: 'chocobar-70ml',
    name: 'Chocolate Chocobar (70ml)',
    category: 'ice_cream',
    price: 25,
    unit: '70ml',
    description: 'Vanilla ice cream bar coated with a thick layer of premium crunchy chocolate.',
    image: 'chocobar',
    inStock: true,
  },

  // Ice Cubes
  {
    id: 'premium-ice-cubes-1kg',
    name: 'Premium Ice Cubes (1kg)',
    category: 'ice_cubes',
    price: 40,
    unit: '1kg bag',
    description: 'Clean, solid, slow-melting ice cubes packaged in a hygienic bag.',
    image: 'ice_bag',
    inStock: true,
  },

  // Water Bottles
  {
    id: 'bisleri-water-bottle-1l',
    name: 'Bisleri Water Bottle (1L)',
    category: 'water_bottles',
    price: 20,
    unit: '1L',
    description: 'Hygienically packaged purified drinking water with added minerals.',
    image: 'water_bottle',
    inStock: true,
  },

  // Cigarettes
  {
    id: 'classic-milds-pack',
    name: 'Classic Milds (Pack of 10)',
    category: 'cigarettes',
    price: 180,
    unit: 'pack of 10',
    description: 'Premium quality cigarette pack. Statutory warning: Smoking is injurious to health.',
    image: 'cigarettes',
    inStock: true,
  },
];

export default products;
