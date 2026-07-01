const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'db.json');

// Ensure db.json exists
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

const db = {
  read() {
    try {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (e) {
      console.error('Error reading database file, resetting...', e);
      return { users: [], products: [], cart: [], wishlist: [], addresses: [], orders: [], reviews: [] };
    }
  },

  write(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  },

  getCollection(name) {
    return this.read()[name] || [];
  },

  saveCollection(name, items) {
    const data = this.read();
    data[name] = items;
    this.write(data);
  },

  find(collectionName, query = {}) {
    const items = this.getCollection(collectionName);
    return items.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne(collectionName, query = {}) {
    const items = this.getCollection(collectionName);
    return items.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  insert(collectionName, item) {
    const items = this.getCollection(collectionName);
    const newItem = { 
      _id: item._id || (Math.random().toString(36).substring(2, 11) + Date.now().toString(36)), 
      ...item, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.saveCollection(collectionName, items);
    return newItem;
  },

  update(collectionName, query, updates) {
    const items = this.getCollection(collectionName);
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
      this.saveCollection(collectionName, newItems);
    }
    return updatedItem;
  },

  delete(collectionName, query) {
    const items = this.getCollection(collectionName);
    const initialLength = items.length;
    const newItems = items.filter(item => {
      let matches = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      return !matches;
    });
    if (newItems.length !== initialLength) {
      this.saveCollection(collectionName, newItems);
    }
    return initialLength - newItems.length;
  }
};

module.exports = db;
