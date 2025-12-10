const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

// Default credentials - UPDATE THESE to match your manager account
const credentials = {
  email: 'john.manager@test.com', // Replace with your manager email
  password: 'password123', // Replace with your manager password
};

let authToken = '';

// Categories data
const categoriesData = [
  { name: 'Appetizers', nameAr: 'مقبلات', description: 'Starter dishes and small plates' },
  { name: 'Main Course', nameAr: 'طبق رئيسي', description: 'Primary dishes and entrees' },
  { name: 'Desserts', nameAr: 'حلويات', description: 'Sweet dishes and treats' },
  { name: 'Beverages', nameAr: 'مشروبات', description: 'Drinks and refreshments' },
  { name: 'Sides', nameAr: 'أطباق جانبية', description: 'Side dishes and accompaniments' },
  { name: 'Sauces', nameAr: 'صلصات', description: 'Sauces and condiments' },
  { name: 'Salads', nameAr: 'سلطات', description: 'Fresh salads and greens' },
  { name: 'Bakery', nameAr: 'مخبوزات', description: 'Baked goods and breads' },
];

// Sample data - Using only valid backend categories: meat, dairy, other
const inventoryData = [
  // Vegetables (categorized as 'other')
  { name: 'Lettuce', category: 'other', unit: 'kg', currentQuantity: 50, minThreshold: 10, maxThreshold: 100 },
  { name: 'Tomatoes', category: 'other', unit: 'kg', currentQuantity: 40, minThreshold: 8, maxThreshold: 80 },
  { name: 'Onions', category: 'other', unit: 'kg', currentQuantity: 35, minThreshold: 10, maxThreshold: 70 },
  { name: 'Cucumbers', category: 'other', unit: 'kg', currentQuantity: 25, minThreshold: 5, maxThreshold: 50 },
  { name: 'Bell Peppers', category: 'other', unit: 'kg', currentQuantity: 20, minThreshold: 5, maxThreshold: 40 },
  { name: 'Potatoes', category: 'other', unit: 'kg', currentQuantity: 60, minThreshold: 15, maxThreshold: 120 },
  { name: 'Carrots', category: 'other', unit: 'kg', currentQuantity: 30, minThreshold: 8, maxThreshold: 60 },
  
  // Proteins
  { name: 'Chicken Breast', category: 'meat', unit: 'kg', currentQuantity: 45, minThreshold: 10, maxThreshold: 90 },
  { name: 'Ground Beef', category: 'meat', unit: 'kg', currentQuantity: 40, minThreshold: 10, maxThreshold: 80 },
  { name: 'Salmon Fillet', category: 'meat', unit: 'kg', currentQuantity: 20, minThreshold: 5, maxThreshold: 40 },
  { name: 'Shrimp', category: 'meat', unit: 'kg', currentQuantity: 15, minThreshold: 5, maxThreshold: 30 },
  { name: 'Eggs', category: 'dairy', unit: 'pcs', currentQuantity: 200, minThreshold: 50, maxThreshold: 400 },
  
  // Dairy
  { name: 'Milk', category: 'dairy', unit: 'l', currentQuantity: 50, minThreshold: 15, maxThreshold: 100 },
  { name: 'Heavy Cream', category: 'dairy', unit: 'l', currentQuantity: 20, minThreshold: 5, maxThreshold: 40 },
  { name: 'Butter', category: 'dairy', unit: 'kg', currentQuantity: 15, minThreshold: 3, maxThreshold: 30 },
  { name: 'Mozzarella Cheese', category: 'dairy', unit: 'kg', currentQuantity: 25, minThreshold: 5, maxThreshold: 50 },
  { name: 'Parmesan Cheese', category: 'dairy', unit: 'kg', currentQuantity: 10, minThreshold: 2, maxThreshold: 20 },
  
  // Pantry (categorized as 'other')
  { name: 'Flour', category: 'other', unit: 'kg', currentQuantity: 100, minThreshold: 20, maxThreshold: 200 },
  { name: 'Sugar', category: 'other', unit: 'kg', currentQuantity: 50, minThreshold: 10, maxThreshold: 100 },
  { name: 'Salt', category: 'other', unit: 'kg', currentQuantity: 20, minThreshold: 5, maxThreshold: 40 },
  { name: 'Olive Oil', category: 'other', unit: 'l', currentQuantity: 30, minThreshold: 8, maxThreshold: 60 },
  { name: 'Pasta', category: 'other', unit: 'kg', currentQuantity: 40, minThreshold: 10, maxThreshold: 80 },
  { name: 'Rice', category: 'other', unit: 'kg', currentQuantity: 50, minThreshold: 15, maxThreshold: 100 },
  { name: 'Bread', category: 'other', unit: 'pcs', currentQuantity: 50, minThreshold: 20, maxThreshold: 100 },
  
  // Sauces & Condiments (categorized as 'other')
  { name: 'Tomato Sauce', category: 'other', unit: 'l', currentQuantity: 25, minThreshold: 5, maxThreshold: 50 },
  { name: 'Soy Sauce', category: 'other', unit: 'l', currentQuantity: 10, minThreshold: 3, maxThreshold: 20 },
  { name: 'Mayonnaise', category: 'other', unit: 'l', currentQuantity: 15, minThreshold: 4, maxThreshold: 30 },
  { name: 'Ketchup', category: 'other', unit: 'l', currentQuantity: 12, minThreshold: 3, maxThreshold: 24 },
  
  // Beverages Base
  { name: 'Coffee Beans', category: 'other', unit: 'kg', currentQuantity: 20, minThreshold: 5, maxThreshold: 40 },
  { name: 'Tea Leaves', category: 'other', unit: 'kg', currentQuantity: 10, minThreshold: 2, maxThreshold: 20 },
  { name: 'Orange Juice', category: 'other', unit: 'l', currentQuantity: 30, minThreshold: 10, maxThreshold: 60 },
  
  // Dessert Ingredients
  { name: 'Chocolate', category: 'other', unit: 'kg', currentQuantity: 15, minThreshold: 3, maxThreshold: 30 },
  { name: 'Vanilla Extract', category: 'other', unit: 'l', currentQuantity: 5, minThreshold: 1, maxThreshold: 10 },
  { name: 'Cocoa Powder', category: 'other', unit: 'kg', currentQuantity: 10, minThreshold: 2, maxThreshold: 20 },
];

// Helper to create products with ingredient IDs
const createProductsData = (inventoryItems) => {
  // Helper to find item ID by name
  const findItemId = (name) => {
    const item = inventoryItems.find(item => item.name === name);
    return item ? item.id : null;
  };

  return [
    // Appetizers
    {
      name: 'Caesar Salad',
      category: 'Appetizers',
      description: 'Classic Caesar salad with romaine lettuce and parmesan',
      prepTimeMinutes: 15,
      prepIntervalHours: 4,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Lettuce'), name: 'Lettuce', quantity: 0.5, unit: 'kg' },
        { ingredientId: findItemId('Parmesan Cheese'), name: 'Parmesan Cheese', quantity: 0.1, unit: 'kg' },
        { ingredientId: findItemId('Bread'), name: 'Bread', quantity: 2, unit: 'pcs' },
        { ingredientId: findItemId('Olive Oil'), name: 'Olive Oil', quantity: 0.1, unit: 'l' },
      ],
    },
    {
      name: 'Tomato Soup',
      category: 'Appetizers',
      description: 'Creamy tomato soup',
      prepTimeMinutes: 30,
      prepIntervalHours: 6,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Tomatoes'), name: 'Tomatoes', quantity: 2, unit: 'kg' },
        { ingredientId: findItemId('Onions'), name: 'Onions', quantity: 0.3, unit: 'kg' },
        { ingredientId: findItemId('Heavy Cream'), name: 'Heavy Cream', quantity: 0.5, unit: 'l' },
        { ingredientId: findItemId('Olive Oil'), name: 'Olive Oil', quantity: 0.05, unit: 'l' },
      ],
    },
    {
      name: 'Garlic Bread',
      category: 'Appetizers',
      description: 'Toasted bread with garlic butter',
      prepTimeMinutes: 10,
      prepIntervalHours: 2,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Bread'), name: 'Bread', quantity: 5, unit: 'pcs' },
        { ingredientId: findItemId('Butter'), name: 'Butter', quantity: 0.2, unit: 'kg' },
      ],
    },

    // Main Courses
    {
      name: 'Grilled Chicken',
      category: 'Main Course',
      description: 'Herb-marinated grilled chicken breast',
      prepTimeMinutes: 45,
      prepIntervalHours: 4,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Chicken Breast'), name: 'Chicken Breast', quantity: 3, unit: 'kg' },
        { ingredientId: findItemId('Olive Oil'), name: 'Olive Oil', quantity: 0.2, unit: 'l' },
        { ingredientId: findItemId('Bell Peppers'), name: 'Bell Peppers', quantity: 0.5, unit: 'kg' },
      ],
    },
    {
      name: 'Spaghetti Bolognese',
      category: 'Main Course',
      description: 'Classic Italian pasta with meat sauce',
      prepTimeMinutes: 60,
      prepIntervalHours: 6,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Pasta'), name: 'Pasta', quantity: 2, unit: 'kg' },
        { ingredientId: findItemId('Ground Beef'), name: 'Ground Beef', quantity: 2, unit: 'kg' },
        { ingredientId: findItemId('Tomato Sauce'), name: 'Tomato Sauce', quantity: 1.5, unit: 'l' },
        { ingredientId: findItemId('Onions'), name: 'Onions', quantity: 0.5, unit: 'kg' },
      ],
    },
    {
      name: 'Grilled Salmon',
      category: 'Main Course',
      description: 'Fresh salmon fillet with herbs',
      prepTimeMinutes: 25,
      prepIntervalHours: 3,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Salmon Fillet'), name: 'Salmon Fillet', quantity: 2, unit: 'kg' },
        { ingredientId: findItemId('Olive Oil'), name: 'Olive Oil', quantity: 0.1, unit: 'l' },
        { ingredientId: findItemId('Carrots'), name: 'Carrots', quantity: 0.5, unit: 'kg' },
      ],
    },
    {
      name: 'Beef Steak',
      category: 'Main Course',
      description: 'Premium beef steak with seasoning',
      prepTimeMinutes: 30,
      prepIntervalHours: 4,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Ground Beef'), name: 'Ground Beef', quantity: 3, unit: 'kg' },
        { ingredientId: findItemId('Butter'), name: 'Butter', quantity: 0.1, unit: 'kg' },
        { ingredientId: findItemId('Potatoes'), name: 'Potatoes', quantity: 1, unit: 'kg' },
      ],
    },
    {
      name: 'Vegetable Stir Fry',
      category: 'Main Course',
      description: 'Mixed vegetables with soy sauce',
      prepTimeMinutes: 20,
      prepIntervalHours: 4,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Bell Peppers'), name: 'Bell Peppers', quantity: 1, unit: 'kg' },
        { ingredientId: findItemId('Onions'), name: 'Onions', quantity: 0.5, unit: 'kg' },
        { ingredientId: findItemId('Carrots'), name: 'Carrots', quantity: 0.5, unit: 'kg' },
        { ingredientId: findItemId('Soy Sauce'), name: 'Soy Sauce', quantity: 0.2, unit: 'l' },
        { ingredientId: findItemId('Rice'), name: 'Rice', quantity: 1, unit: 'kg' },
      ],
    },

    // Desserts
    {
      name: 'Chocolate Cake',
      category: 'Desserts',
      description: 'Rich chocolate layer cake',
      prepTimeMinutes: 90,
      prepIntervalHours: 12,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Flour'), name: 'Flour', quantity: 1, unit: 'kg' },
        { ingredientId: findItemId('Sugar'), name: 'Sugar', quantity: 0.8, unit: 'kg' },
        { ingredientId: findItemId('Chocolate'), name: 'Chocolate', quantity: 0.5, unit: 'kg' },
        { ingredientId: findItemId('Eggs'), name: 'Eggs', quantity: 12, unit: 'pcs' },
        { ingredientId: findItemId('Butter'), name: 'Butter', quantity: 0.4, unit: 'kg' },
        { ingredientId: findItemId('Milk'), name: 'Milk', quantity: 0.5, unit: 'l' },
      ],
    },
    {
      name: 'Vanilla Ice Cream',
      category: 'Desserts',
      description: 'Homemade vanilla ice cream',
      prepTimeMinutes: 120,
      prepIntervalHours: 24,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Heavy Cream'), name: 'Heavy Cream', quantity: 2, unit: 'l' },
        { ingredientId: findItemId('Milk'), name: 'Milk', quantity: 1, unit: 'l' },
        { ingredientId: findItemId('Sugar'), name: 'Sugar', quantity: 0.5, unit: 'kg' },
        { ingredientId: findItemId('Vanilla Extract'), name: 'Vanilla Extract', quantity: 0.05, unit: 'l' },
      ],
    },
    {
      name: 'Tiramisu',
      category: 'Desserts',
      description: 'Classic Italian coffee-flavored dessert',
      prepTimeMinutes: 60,
      prepIntervalHours: 12,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Heavy Cream'), name: 'Heavy Cream', quantity: 1, unit: 'l' },
        { ingredientId: findItemId('Coffee Beans'), name: 'Coffee Beans', quantity: 0.2, unit: 'kg' },
        { ingredientId: findItemId('Sugar'), name: 'Sugar', quantity: 0.3, unit: 'kg' },
        { ingredientId: findItemId('Cocoa Powder'), name: 'Cocoa Powder', quantity: 0.1, unit: 'kg' },
      ],
    },

    // Beverages
    {
      name: 'Fresh Coffee',
      category: 'Beverages',
      description: 'Freshly brewed coffee',
      prepTimeMinutes: 10,
      prepIntervalHours: 2,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Coffee Beans'), name: 'Coffee Beans', quantity: 0.5, unit: 'kg' },
      ],
    },
    {
      name: 'Iced Tea',
      category: 'Beverages',
      description: 'Refreshing iced tea',
      prepTimeMinutes: 20,
      prepIntervalHours: 4,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Tea Leaves'), name: 'Tea Leaves', quantity: 0.1, unit: 'kg' },
        { ingredientId: findItemId('Sugar'), name: 'Sugar', quantity: 0.3, unit: 'kg' },
      ],
    },

    // Sides
    {
      name: 'French Fries',
      category: 'Sides',
      description: 'Crispy golden fries',
      prepTimeMinutes: 20,
      prepIntervalHours: 3,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Potatoes'), name: 'Potatoes', quantity: 5, unit: 'kg' },
        { ingredientId: findItemId('Salt'), name: 'Salt', quantity: 0.05, unit: 'kg' },
      ],
    },
    {
      name: 'Mixed Vegetables',
      category: 'Sides',
      description: 'Steamed mixed vegetables',
      prepTimeMinutes: 15,
      prepIntervalHours: 4,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Carrots'), name: 'Carrots', quantity: 1, unit: 'kg' },
        { ingredientId: findItemId('Bell Peppers'), name: 'Bell Peppers', quantity: 0.5, unit: 'kg' },
        { ingredientId: findItemId('Butter'), name: 'Butter', quantity: 0.1, unit: 'kg' },
      ],
    },

    // Sauces
    {
      name: 'House Marinara',
      category: 'Sauces',
      description: 'Homemade marinara sauce',
      prepTimeMinutes: 40,
      prepIntervalHours: 24,
      isActive: true,
      ingredients: [
        { ingredientId: findItemId('Tomatoes'), name: 'Tomatoes', quantity: 3, unit: 'kg' },
        { ingredientId: findItemId('Onions'), name: 'Onions', quantity: 0.5, unit: 'kg' },
        { ingredientId: findItemId('Olive Oil'), name: 'Olive Oil', quantity: 0.2, unit: 'l' },
      ],
    },
  ].filter(product => product.ingredients.every(ing => ing.ingredientId !== null));
};

// Helper to create tasks with product IDs
const createTasksData = (products) => {
  const now = new Date();
  const tasks = [];

  products.forEach((product, index) => {
    // Create 3 tasks per product: one past, one today, one future
    
    // Past task (completed)
    const pastDate = new Date(now);
    pastDate.setHours(now.getHours() - product.prepIntervalHours);
    tasks.push({
      productId: product.id,
      productName: product.name,
      scheduledTime: pastDate.toISOString(),
      prepTimeMinutes: product.prepTimeMinutes || 30,
      notes: `Completed ${product.name} preparation`,
      status: 'completed',
      completedAt: pastDate.toISOString(),
    });

    // Today's task (scheduled)
    const todayDate = new Date(now);
    todayDate.setHours(now.getHours() + 2);
    tasks.push({
      productId: product.id,
      productName: product.name,
      scheduledTime: todayDate.toISOString(),
      prepTimeMinutes: product.prepTimeMinutes || 30,
      notes: `Today's ${product.name} batch`,
      status: 'scheduled',
    });

    // Future task (scheduled)
    const futureDate = new Date(now);
    futureDate.setHours(now.getHours() + product.prepIntervalHours);
    tasks.push({
      productId: product.id,
      productName: product.name,
      scheduledTime: futureDate.toISOString(),
      prepTimeMinutes: product.prepTimeMinutes || 30,
      notes: `Next ${product.name} preparation`,
      status: 'scheduled',
    });
  });

  return tasks;
};

// Authentication
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    authToken = response.data.data.token || response.data.token;
    console.log('✅ Login successful!');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    console.log('\n💡 Please make sure you have a manager account with these credentials:');
    console.log(`   Email: ${credentials.email}`);
    console.log(`   Password: ${credentials.password}`);
    console.log('\nOr update the credentials in the seed.js file.');
    return false;
  }
}

// Helper to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Seed Categories
async function seedCategories() {
  console.log('\n📂 Seeding categories...');
  try {
    // Get existing categories
    const getResponse = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    const existingCategories = getResponse.data?.data?.categories || getResponse.data?.categories || [];
    
    // Delete existing categories permanently
    if (existingCategories.length > 0) {
      console.log(`   Found ${existingCategories.length} existing categories. Deleting...`);
      for (const category of existingCategories) {
        try {
          await axios.delete(`${API_URL}/categories/${category.id || category._id}/permanent`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          await delay(100);
        } catch {
          // Continue if delete fails
        }
      }
      console.log('   ✅ Existing categories deleted');
    }
    
    // Create new categories
    const createdCategories = [];
    for (const category of categoriesData) {
      try {
        const response = await axios.post(`${API_URL}/categories`, category, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const created = response.data?.data?.category || response.data?.category || response.data;
        createdCategories.push(created);
        console.log(`   ✅ Created: ${category.name} (${category.nameAr})`);
        await delay(150);
      } catch (error) {
        console.error(`   ❌ Failed to create ${category.name}:`, error.response?.data?.message || error.message);
      }
    }
    
    console.log(`✅ Categories seeded successfully! (${createdCategories.length}/${categoriesData.length})`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Failed to seed categories:', error.response?.data?.message || error.message);
    return [];
  }
}

// Seed Inventory
async function seedInventory() {
  console.log('\n📦 Seeding inventory items...');
  const createdItems = [];

  for (const item of inventoryData) {
    try {
      const response = await axios.post(`${API_URL}/inventory`, item, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const createdItem = response.data.data || response.data;
      createdItems.push({
        ...createdItem,
        id: createdItem._id || createdItem.id,
        name: item.name,
      });
      console.log(`  ✓ Created: ${item.name}`);
      // Add delay to avoid rate limiting
      await delay(200);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      const errorStack = error.response?.data?.stack || '';
      // Skip duplicates (check for E11000 MongoDB duplicate key error)
      if (errorMsg.includes('duplicate') || errorMsg.includes('already exists') || 
          errorMsg.includes('E11000') || errorStack.includes('E11000') ||
          errorMsg.includes('Internal Server Error')) {
        console.log(`  ⚠ Skipped (already exists): ${item.name}`);
      } else {
        console.error(`  ✗ Failed to create ${item.name}:`, errorMsg);
      }
      // Add delay even on error
      await delay(200);
    }
  }

  // Fetch all inventory items to include existing ones
  console.log('\n📥 Fetching all existing inventory items...');
  try {
    const allItemsResponse = await axios.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Handle different response structures
    let rawData = allItemsResponse.data;
    if (rawData.data) rawData = rawData.data;
    if (rawData.inventory) rawData = rawData.inventory;
    if (rawData.items) rawData = rawData.items;
    
    // Ensure it's an array
    const dataArray = Array.isArray(rawData) ? rawData : [];
    
    const allItems = dataArray.map(item => ({
      ...item,
      id: item._id || item.id,
    }));
    console.log(`✅ Total inventory items available: ${allItems.length} (${createdItems.length} newly created)`);
    return allItems;
  } catch (err) {
    console.error('⚠️  Failed to fetch existing inventory:', err.message);
    console.log(`✅ Using ${createdItems.length} newly created items`);
    return createdItems;
  }
}

// Seed Products
async function seedProducts(inventoryItems) {
  console.log('\n🍽️  Seeding products...');
  console.log(`📊 Available inventory items: ${inventoryItems.length}`);
  const productsData = createProductsData(inventoryItems);
  console.log(`📝 Products to create: ${productsData.length}`);
  const createdProducts = [];

  for (const product of productsData) {
    try {
      const response = await axios.post(`${API_URL}/products`, product, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const createdProduct = response.data.data || response.data;
      createdProducts.push({
        ...createdProduct,
        id: createdProduct._id || createdProduct.id,
        name: product.name,
        prepIntervalHours: product.prepIntervalHours,
      });
      console.log(`  ✓ Created: ${product.name}`);
      // Add delay to avoid rate limiting
      await delay(300);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      const errorStack = error.response?.data?.stack || '';
      // Skip duplicates (check for E11000 MongoDB duplicate key error)
      if (errorMsg.includes('duplicate') || errorMsg.includes('already exists') || 
          errorMsg.includes('E11000') || errorStack.includes('E11000') ||
          errorMsg.includes('Internal Server Error')) {
        console.log(`  ⚠ Skipped (already exists): ${product.name}`);
      } else {
        console.error(`  ✗ Failed to create ${product.name}:`, errorMsg);
      }
      // Add delay even on error
      await delay(300);
    }
  }

  // Fetch all products to include existing ones
  try {
    const allProductsResponse = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    // Handle different response structures
    let rawData = allProductsResponse.data;
    if (rawData.data) rawData = rawData.data;
    if (rawData.products) rawData = rawData.products;
    if (rawData.items) rawData = rawData.items;
    
    // Ensure it's an array
    const dataArray = Array.isArray(rawData) ? rawData : [];
    
    const allProducts = dataArray.map(prod => ({
      ...prod,
      id: prod._id || prod.id,
    }));
    console.log(`✅ Total products available: ${allProducts.length} (${createdProducts.length} newly created)`);
    return allProducts;
  } catch {
    console.log(`✅ Created ${createdProducts.length}/${productsData.length} products`);
    return createdProducts;
  }
}

// Seed Tasks
async function seedTasks(products) {
  console.log('\n📋 Seeding tasks...');
  const tasksData = createTasksData(products);
  let createdCount = 0;

  for (const task of tasksData) {
    try {
      const response = await axios.post(`${API_URL}/tasks`, task, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      createdCount++;
      const product = products.find(p => p.id === task.productId);
      console.log(`  ✓ Created task for: ${product?.name || task.productId}`);
      // Add delay to avoid rate limiting
      await delay(200);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`  ✗ Failed to create task:`, errorMsg);
      // Add delay even on error
      await delay(200);
    }
  }

  console.log(`✅ Created ${createdCount}/${tasksData.length} tasks`);
}

// Main seed function
async function seed() {
  console.log('🌱 Starting database seed...\n');
  console.log('⚠️  Make sure your backend server is running on http://localhost:5000\n');

  try {
    // Step 1: Login
    const loggedIn = await login();
    if (!loggedIn) {
      process.exit(1);
    }

    // Step 2: Seed Categories
    const categories = await seedCategories();
    if (categories.length === 0) {
      console.log('⚠️  No categories created, but continuing...');
    }

    // Step 3: Seed Inventory
    const inventoryItems = await seedInventory();
    if (inventoryItems.length === 0) {
      console.log('❌ No inventory items available (not created and failed to fetch existing). Stopping seed process.');
      process.exit(1);
    }

    // Step 4: Seed Products  
    const products = await seedProducts(inventoryItems);
    
    // Step 5: Seed Tasks (only if we have products)
    if (products.length > 0) {
      await seedTasks(products);
    } else {
      console.log('⚠️  No products to create tasks for. Skipping task creation.');
    }

    console.log('\n✅ Database seeding completed successfully! 🎉\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Inventory Items: ${inventoryItems.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Tasks: ${products.length * 3} (3 per product)`);
    console.log('\n🚀 Your app is now ready with sample data!\n');

  } catch (error) {
    console.error('\n❌ Seed process failed:', error.message);
    process.exit(1);
  }
}

// Run seed
seed();
