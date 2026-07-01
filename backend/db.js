const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Fallback JSON DB Configuration
const dbPath = path.join(__dirname, 'db.json');

// Initialize database file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  const initialDb = {
    users: [],
    products: [],
    cart: [],
    wishlist: [],
    addresses: [],
    orders: [],
    reviews: []
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), 'utf8');
}

let firestore = null;
let isFirebaseEnabled = false;

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
      } catch (err) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT environment variable:', err);
      }
    }
  } else {
    const keyPath = path.join(__dirname, 'firebase-key.json');
    if (fs.existsSync(keyPath)) {
      serviceAccount = require(keyPath);
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firestore = admin.firestore();
    isFirebaseEnabled = true;
    console.log('=============================================');
    console.log('Firebase Firestore Connected Successfully!');
    console.log('=============================================');
  } else {
    console.log('=============================================');
    console.log('Using Local File DB Fallback (db.json)');
    console.log('=============================================');
  }
} catch (error) {
  console.error('Failed to initialize Firebase, falling back to local JSON:', error);
}

// Local JSON file database helper methods (wrapping in promises to match async style)
const jsonDb = {
  read() {
    try {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      console.error('Error reading JSON DB, resetting...', e);
      return { users: [], products: [], cart: [], wishlist: [], addresses: [], orders: [], reviews: [] };
    }
  },

  write(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  },

  async getCollection(name) {
    return this.read()[name] || [];
  },

  async saveCollection(name, items) {
    const data = this.read();
    data[name] = items;
    this.write(data);
  },

  async find(collectionName, query = {}) {
    const items = await this.getCollection(collectionName);
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  async findOne(collectionName, query = {}) {
    const items = await this.getCollection(collectionName);
    return items.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  async insert(collectionName, item) {
    const items = await this.getCollection(collectionName);
    const newItem = { 
      _id: item._id || (Math.random().toString(36).substring(2, 11) + Date.now().toString(36)), 
      ...item, 
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    };
    items.push(newItem);
    await this.saveCollection(collectionName, items);
    return newItem;
  },

  async update(collectionName, query, updates) {
    const items = await this.getCollection(collectionName);
    let updatedItem = null;
    const newItems = items.map(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedItem = { ...item, ...updates, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });
    if (updatedItem) {
      await this.saveCollection(collectionName, newItems);
    }
    return updatedItem;
  },

  async delete(collectionName, query) {
    const items = await this.getCollection(collectionName);
    const filteredItems = items.filter(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      return !matches;
    });
    await this.saveCollection(collectionName, filteredItems);
    return true;
  }
};

// Firestore helper methods
const firestoreDb = {
  async getCollection(name) {
    const snapshot = await firestore.collection(name).get();
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
  },

  async find(collectionName, query = {}) {
    let ref = firestore.collection(collectionName);
    for (let key in query) {
      ref = ref.where(key, '==', query[key]);
    }
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
  },

  async findOne(collectionName, query = {}) {
    let ref = firestore.collection(collectionName);
    for (let key in query) {
      ref = ref.where(key, '==', query[key]);
    }
    const snapshot = await ref.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { _id: doc.id, ...doc.data() };
  },

  async insert(collectionName, item) {
    const id = item._id || firestore.collection(collectionName).doc().id;
    const data = {
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString()
    };
    delete data._id; // Store _id as Firestore document ID instead of inside data
    await firestore.collection(collectionName).doc(id).set(data);
    return { _id: id, ...data };
  },

  async update(collectionName, query, updates) {
    if (query._id) {
      const data = { ...updates, updatedAt: new Date().toISOString() };
      await firestore.collection(collectionName).doc(query._id).update(data);
      const doc = await firestore.collection(collectionName).doc(query._id).get();
      return { _id: doc.id, ...doc.data() };
    } else {
      const matched = await this.find(collectionName, query);
      if (matched.length === 0) return null;
      const batch = firestore.batch();
      const data = { ...updates, updatedAt: new Date().toISOString() };
      matched.forEach(doc => {
        const docRef = firestore.collection(collectionName).doc(doc._id);
        batch.update(docRef, data);
      });
      await batch.commit();
      return { ...matched[0], ...updates, updatedAt: data.updatedAt };
    }
  },

  async delete(collectionName, query) {
    if (query._id) {
      await firestore.collection(collectionName).doc(query._id).delete();
    } else {
      const matched = await this.find(collectionName, query);
      if (matched.length > 0) {
        const batch = firestore.batch();
        matched.forEach(doc => {
          const docRef = firestore.collection(collectionName).doc(doc._id);
          batch.delete(docRef);
        });
        await batch.commit();
      }
    }
    return true;
  }
};

// Export the active database manager
module.exports = {
  find(coll, query) {
    return isFirebaseEnabled ? firestoreDb.find(coll, query) : jsonDb.find(coll, query);
  },
  findOne(coll, query) {
    return isFirebaseEnabled ? firestoreDb.findOne(coll, query) : jsonDb.findOne(coll, query);
  },
  insert(coll, item) {
    return isFirebaseEnabled ? firestoreDb.insert(coll, item) : jsonDb.insert(coll, item);
  },
  update(coll, query, updates) {
    return isFirebaseEnabled ? firestoreDb.update(coll, query, updates) : jsonDb.update(coll, query, updates);
  },
  delete(coll, query) {
    return isFirebaseEnabled ? firestoreDb.delete(coll, query) : jsonDb.delete(coll, query);
  },
  getCollection(coll) {
    return isFirebaseEnabled ? firestoreDb.getCollection(coll) : jsonDb.getCollection(coll);
  },
  isFirebaseEnabled() {
    return isFirebaseEnabled;
  }
};
