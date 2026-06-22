import { 
  isFirebaseConfigured, 
  auth, 
  db 
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
  orderBy,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { uploadToCloudinary } from './cloudinaryUpload';

// ==========================================
// MOCK DATA PRESETS - REMOVED
// ==========================================

// Initialize localStorage mock databases if not set
const getLocalDB = (key) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify([]));
    return [];
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
      return getLocalDB('categories_db');
    }
  },

  addCategory: async (categoryData, imageFile) => {
    let imageUrl = categoryData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';

    if (imageFile) {
      if (isFirebaseConfigured) {
        imageUrl = await uploadToCloudinary(imageFile, 'categories');
      } else {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    const newCat = {
      ...categoryData,
      image: imageUrl,
      createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'categories'), newCat);
      return docRef.id;
    } else {
      const list = getLocalDB('categories_db');
      const newId = 'cat-' + Math.random().toString(36).substring(2, 9);
      const category = { id: newId, ...newCat };
      list.unshift(category);
      setLocalDB('categories_db', list);
      return newId;
    }
  },

  updateCategory: async (id, categoryData, imageFile) => {
    let imageUrl = categoryData.image;

    if (imageFile) {
      if (isFirebaseConfigured) {
        imageUrl = await uploadToCloudinary(imageFile, 'categories');
      } else {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
      }
    }

    const updatedData = {
      ...categoryData,
      image: imageUrl,
      updatedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, updatedData);
    } else {
      const list = getLocalDB('categories_db');
      const index = list.findIndex(c => c.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...updatedData };
        setLocalDB('categories_db', list);
      }
    }
  },

  deleteCategory: async (id) => {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'categories', id));
    } else {
      const list = getLocalDB('categories_db');
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
      return getLocalDB('products_db');
    }
  },

  /**
   * Compression is handled server-side by Cloudinary.
   * Client-side compression is disabled for speed.
   */
  compressImage: async (file) => {
    return file;
  },

  addProduct: async (productData, imageFile) => {
    let imageUrl = productData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';

    if (imageFile) {
      if (isFirebaseConfigured) {
        imageUrl = await uploadToCloudinary(imageFile, 'products');
      } else {
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
      inStock: productData.status === 'In Stock',
      createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'products'), newProd);
      return docRef.id;
    } else {
      const list = getLocalDB('products_db');
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
        imageUrl = await uploadToCloudinary(imageFile, 'products');
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
      image: imageUrl,
      inStock: productData.status === 'In Stock',
      updatedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
    };

    if (isFirebaseConfigured) {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, updatedData);
    } else {
      const list = getLocalDB('products_db');
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
      const list = getLocalDB('products_db');
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
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const q = query(
        collection(db, 'orders'), 
        where('createdAt', '>=', oneMonthAgo),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return getLocalDB('orders_db');
    }
  },

  updateOrderStatus: async (id, status) => {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'orders', id);
      await updateDoc(docRef, { status });
    } else {
      const list = getLocalDB('orders_db');
      const index = list.findIndex(o => o.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], status };
        setLocalDB('orders_db', list);
      }
    }
  }
};
