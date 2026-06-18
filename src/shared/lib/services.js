import { 
  isFirebaseConfigured, 
  auth, 
  db, 
  storage 
} from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// ==========================================
// MOCK DATA PRESETS (For LocalStorage Fallback)
// ==========================================
const DEFAULT_CATEGORIES = [
  { id: 'cat-grocery', name: 'Groceries', description: 'Daily essential grocery items', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat-amul', name: 'Amul Products', description: 'Fresh butter, milk, cheese and ghee', image: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat-icecream', name: 'Ice Cream', description: 'Delicious cold treats', image: 'https://images.unsplash.com/photo-1501443715934-627181fc8e09?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat-water', name: 'Water Bottles', description: 'Purified mineral drinking water', image: 'https://images.unsplash.com/photo-1608889175123-8ec330b86f84?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat-ice', name: 'Ice Cubes', description: 'Food grade crystal ice cubes', image: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=400' },
  { id: 'cat-cigarettes', name: 'Cigarettes', description: 'Standard tobacco brand packs', image: 'https://images.unsplash.com/photo-1556997685-309989c1aa82?auto=format&fit=crop&q=80&w=400' },
];

const DEFAULT_PRODUCTS = [
  { id: 'prod-1', name: 'Basmati Rice (5kg)', category: 'Groceries', price: 450, mrp: 480, unit: '5 Kg', description: 'Premium long-grain basmati rice, perfect for biryani.', status: 'In Stock', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
  { id: 'prod-2', name: 'Toor Dal (1kg)', category: 'Groceries', price: 160, mrp: 180, unit: '1 Kg', description: 'High quality unpolished split pigeon peas.', status: 'In Stock', image: 'https://images.unsplash.com/photo-1585996388964-b816a401c107?auto=format&fit=crop&q=80&w=400' },
  { id: 'prod-3', name: 'Refined Sunflower Oil (1L)', category: 'Groceries', price: 130, mrp: 150, unit: '1 L', description: 'Healthy and light refined sunflower oil for cooking.', status: 'In Stock', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
  { id: 'prod-4', name: 'Amul Gold Milk (500ml)', category: 'Amul Products', price: 33, mrp: 34, unit: '500 ml', description: 'Fresh full cream pasteurized milk.', status: 'In Stock', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400' },
  { id: 'prod-5', name: 'Amul Butter (100g)', category: 'Amul Products', price: 56, mrp: 58, unit: '100 g', description: 'Salted dairy spread made from milk fat.', status: 'In Stock', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400' },
  { id: 'prod-6', name: 'Kwality Walls Vanilla (700ml)', category: 'Ice Cream', price: 150, mrp: 160, unit: '700 ml', description: 'Creamy vanilla ice cream dessert tub.', status: 'In Stock', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=400' },
];

const DEFAULT_ORDERS = [
  {
    id: 'ORD1001',
    customerName: 'Kedar Deshmukh',
    mobile: '9518967710',
    address: 'Masur, Karad',
    products: [
      { name: 'Basmati Rice (5kg)', quantity: 2, price: 450 },
      { name: 'Toor Dal (1kg)', quantity: 1, price: 160 }
    ],
    totalAmount: 1060,
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'ORD1002',
    customerName: 'Amit Patil',
    mobile: '9876543210',
    address: 'Budhwar Peth, Karad',
    products: [
      { name: 'Refined Sunflower Oil (1L)', quantity: 2, price: 130 }
    ],
    totalAmount: 260,
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'ORD1003',
    customerName: 'Sneha Jadhav',
    mobile: '8888888888',
    address: 'Shaniwar Peth, Karad',
    products: [
      { name: 'Amul Gold Milk (500ml)', quantity: 5, price: 33 },
      { name: 'Amul Butter (100g)', quantity: 2, price: 56 }
    ],
    totalAmount: 277,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
  }
];

// Initialize localStorage mock databases if not set
const getLocalDB = (key, fallback) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(data);
};

const setLocalDB = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// 1. AUTH SERVICE
// ==========================================
export const authService = {
  login: async (email, password) => {
    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } else {
      // Mock Auth check
      if (email === 'admin@grocery.com' && password === 'admin123') {
        const mockUser = { email, uid: 'mock-admin-uid' };
        localStorage.setItem('admin_user', JSON.stringify(mockUser));
        return mockUser;
      } else {
        throw new Error('Invalid email or password. Use: admin@grocery.com / admin123');
      }
    }
  },

  logout: async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    } else {
      localStorage.removeItem('admin_user');
    }
  },

  onAuthChange: (callback) => {
    if (isFirebaseConfigured) {
      return onAuthStateChanged(auth, callback);
    } else {
      // Periodic check for local storage
      const checkUser = () => {
        const storedUser = localStorage.getItem('admin_user');
        callback(storedUser ? JSON.parse(storedUser) : null);
      };
      checkUser();
      window.addEventListener('storage', checkUser);
      return () => window.removeEventListener('storage', checkUser);
    }
  }
};

// ==========================================
// 2. CATEGORY SERVICE
// ==========================================
export const categoryService = {
  getCategories: async () => {
    if (isFirebaseConfigured) {
      const snap = await getDocs(query(collection(db, 'categories'), orderBy('createdAt', 'desc')));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return getLocalDB('categories_db', DEFAULT_CATEGORIES);
    }
  },

  addCategory: async (categoryData) => {
    const newCat = {
      ...categoryData,
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'categories'), newCat);
      return docRef.id;
    } else {
      const list = getLocalDB('categories_db', DEFAULT_CATEGORIES);
      const newId = 'cat-' + Math.random().toString(36).substring(2, 9);
      const category = { id: newId, ...newCat };
      list.unshift(category);
      setLocalDB('categories_db', list);
      return newId;
    }
  },

  updateCategory: async (id, categoryData) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, categoryData);
    } else {
      const list = getLocalDB('categories_db', DEFAULT_CATEGORIES);
      const index = list.findIndex(c => c.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...categoryData };
        setLocalDB('categories_db', list);
      }
    }
  },

  deleteCategory: async (id) => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'categories', id));
    } else {
      const list = getLocalDB('categories_db', DEFAULT_CATEGORIES);
      const filtered = list.filter(c => c.id !== id);
      setLocalDB('categories_db', filtered);
    }
  }
};

// ==========================================
// 3. PRODUCT SERVICE
// ==========================================
export const productService = {
  getProducts: async () => {
    if (isFirebaseConfigured) {
      const snap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return getLocalDB('products_db', DEFAULT_PRODUCTS);
    }
  },

  addProduct: async (productData, imageFile) => {
    let imageUrl = productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';

    if (imageFile) {
      if (isFirebaseConfigured) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      } else {
        // Mock image file using base64 preview
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    const newProd = {
      ...productData,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'products'), newProd);
      return docRef.id;
    } else {
      const list = getLocalDB('products_db', DEFAULT_PRODUCTS);
      const newId = 'prod-' + Math.random().toString(36).substring(2, 9);
      const product = { id: newId, ...newProd };
      list.unshift(product);
      setLocalDB('products_db', list);
      return newId;
    }
  },

  updateProduct: async (id, productData, imageFile) => {
    let imageUrl = productData.image;

    if (imageFile) {
      if (isFirebaseConfigured) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      } else {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    const updatedData = {
      ...productData,
      image: imageUrl
    };

    if (isFirebaseConfigured) {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedData);
    } else {
      const list = getLocalDB('products_db', DEFAULT_PRODUCTS);
      const index = list.findIndex(p => p.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedData };
        setLocalDB('products_db', list);
      }
    }
  },

  deleteProduct: async (id) => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'products', id));
    } else {
      const list = getLocalDB('products_db', DEFAULT_PRODUCTS);
      const filtered = list.filter(p => p.id !== id);
      setLocalDB('products_db', filtered);
    }
  }
};

// ==========================================
// 4. ORDER SERVICE
// ==========================================
export const orderService = {
  getOrders: async () => {
    if (isFirebaseConfigured) {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return getLocalDB('orders_db', DEFAULT_ORDERS);
    }
  },

  updateOrderStatus: async (id, status) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
    } else {
      const list = getLocalDB('orders_db', DEFAULT_ORDERS);
      const index = list.findIndex(o => o.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], status };
        setLocalDB('orders_db', list);
      }
    }
  }
};
