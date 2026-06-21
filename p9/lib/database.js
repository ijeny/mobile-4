import * as SQLite from "expo-sqlite";

export const defaultProducts = [
  { id: "prod-burnt-cheesecake", name: "Burnt Cheesecake", price: 50000 },
  { id: "prod-brownies", name: "Brownies", price: 40000 },
  { id: "prod-goguma-ppang", name: "Goguma Ppang", price: 30000 },
  { id: "prod-tiramisu", name: "Tiramisu", price: 45000 },
  { id: "prod-matcha-tart", name: "Matcha Tart", price: 35000 },
];

const DATABASE_NAME = "apk_po.db";

let databasePromise = null;

const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
};

const createSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const mapProductRow = (row) => ({
  id: row.id,
  name: row.name,
  price: Number(row.price),
});

const mapOrderRow = (row) => ({
  id: row.id,
  customer: row.customer,
  items: JSON.parse(row.items || "[]"),
  total: Number(row.total),
  date: row.date,
  status: row.status,
  isPO: row.isPO === 1,
  createdAt: Number(row.createdAt),
});

const ensureSchema = async (db) => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      price INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      customer TEXT NOT NULL,
      items TEXT NOT NULL,
      total INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      isPO INTEGER NOT NULL DEFAULT 1,
      createdAt INTEGER NOT NULL
    );
  `);
};

const seedProducts = async (db, products) => {
  for (const product of products) {
    await db.runAsync(
      "INSERT OR IGNORE INTO products (id, name, price) VALUES (?, ?, ?)",
      product.id,
      product.name,
      product.price,
    );
  }
};

const seedOrders = async (db, orders) => {
  for (const order of orders) {
    await db.runAsync(
      `INSERT OR IGNORE INTO orders (id, customer, items, total, date, status, isPO, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      order.id,
      order.customer,
      JSON.stringify(order.items || []),
      order.total || 0,
      order.date || "Tanpa tanggal",
      order.status || "Menunggu",
      order.isPO === false ? 0 : 1,
      order.createdAt || Date.now(),
    );
  }
};

export const updateOrder = async (orderId, order) => {
  const db = await getDatabase();

  await db.runAsync(
    `UPDATE orders
     SET customer = ?, items = ?, total = ?, date = ?, status = ?, isPO = ?
     WHERE id = ?`,
    order.customer,
    JSON.stringify(order.items || []),
    order.total || 0,
    order.date || "Tanpa tanggal",
    order.status || "Menunggu",
    order.isPO === false ? 0 : 1,
    orderId,
  );

  return { ...order, id: orderId };
};

export const initializeDatabase = async ({
  legacyProducts = [],
  legacyOrders = [],
} = {}) => {
  const db = await getDatabase();
  await ensureSchema(db);

  const productCount = await db.getFirstAsync(
    "SELECT COUNT(*) AS count FROM products",
  );

  if (!productCount || productCount.count === 0) {
    if (legacyProducts.length > 0) {
      await seedProducts(db, legacyProducts);
    } else {
      await seedProducts(db, defaultProducts);
    }
  }

  const orderCount = await db.getFirstAsync(
    "SELECT COUNT(*) AS count FROM orders",
  );

  if (!orderCount || orderCount.count === 0) {
    await seedOrders(db, legacyOrders);
  }
};

export const fetchProducts = async () => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    "SELECT id, name, price FROM products ORDER BY rowid ASC",
  );

  return rows.map(mapProductRow);
};

export const fetchOrders = async () => {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    "SELECT id, customer, items, total, date, status, isPO, createdAt FROM orders ORDER BY createdAt DESC, rowid DESC",
  );

  return rows.map(mapOrderRow);
};

export const createProduct = async ({ name, price }) => {
  const db = await getDatabase();
  const cleanName = name.trim();
  const existing = await db.getFirstAsync(
    "SELECT id FROM products WHERE LOWER(name) = LOWER(?)",
    cleanName,
  );

  if (existing) {
    return null;
  }

  const id = `prod-${Date.now()}-${createSlug(cleanName)}`;

  await db.runAsync(
    "INSERT INTO products (id, name, price) VALUES (?, ?, ?)",
    id,
    cleanName,
    price,
  );

  return { id, name: cleanName, price };
};

export const updateProduct = async (productId, { name, price }) => {
  const db = await getDatabase();
  const cleanName = name.trim();
  const duplicate = await db.getFirstAsync(
    "SELECT id FROM products WHERE LOWER(name) = LOWER(?) AND id != ?",
    cleanName,
    productId,
  );

  if (duplicate) {
    return null;
  }

  await db.runAsync(
    "UPDATE products SET name = ?, price = ? WHERE id = ?",
    cleanName,
    price,
    productId,
  );

  return { id: productId, name: cleanName, price };
};

export const deleteProduct = async (productId) => {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM products WHERE id = ?", productId);
};

export const createOrder = async (order) => {
  const db = await getDatabase();
  const id = order.id || `order-${Date.now()}`;
  const createdAt = order.createdAt || Date.now();

  await db.runAsync(
    `INSERT OR REPLACE INTO orders (id, customer, items, total, date, status, isPO, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    order.customer,
    JSON.stringify(order.items || []),
    order.total || 0,
    order.date || "Tanpa tanggal",
    order.status || "Menunggu",
    order.isPO === false ? 0 : 1,
    createdAt,
  );

  return { ...order, id, createdAt, isPO: order.isPO !== false };
};

export const markOrderAsCompleted = async (orderId) => {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE orders SET status = ? WHERE id = ?",
    "Selesai",
    orderId,
  );
};

export const deleteOrder = async (orderId) => {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM orders WHERE id = ?", orderId);
};
