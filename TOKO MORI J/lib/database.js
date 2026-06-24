import * as SQLite from "expo-sqlite";

export const defaultProducts = [
  { id: "prod-burnt-cheesecake", name: "Burnt Cheesecake", price: 50000 },
  { id: "prod-brownies", name: "Brownies", price: 40000 },
  { id: "prod-goguma-ppang", name: "Goguma Ppang", price: 30000 },
  { id: "prod-tiramisu", name: "Tiramisu", price: 45000 },
  { id: "prod-matcha-tart", name: "Matcha Tart", price: 35000 },
];

const DATABASE_NAME = "uts_po.db";

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

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
};

const seedDefaultProducts = async (db) => {
  for (const product of defaultProducts) {
    await db.runAsync(
      "INSERT OR IGNORE INTO products (id, name, price) VALUES (?, ?, ?)",
      product.id,
      product.name,
      product.price,
    );
  }
};

export const initializeDatabase = async () => {
  const db = await getDatabase();
  await ensureSchema(db);

  const productCount = await db.getFirstAsync(
    "SELECT COUNT(*) AS count FROM products",
  );

  if (!productCount || productCount.count === 0) {
    await seedDefaultProducts(db);
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
  const duplicate = await db.getFirstAsync(
    "SELECT id FROM products WHERE LOWER(name) = LOWER(?)",
    cleanName,
  );

  if (duplicate) {
    return null;
  }

  const product = {
    id: `prod-${Date.now()}-${createSlug(cleanName)}`,
    name: cleanName,
    price,
  };

  await db.runAsync(
    "INSERT INTO products (id, name, price) VALUES (?, ?, ?)",
    product.id,
    product.name,
    product.price,
  );

  return product;
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
  const savedOrder = {
    ...order,
    id: order.id || `order-${Date.now()}`,
    total: order.total || 0,
    date: order.date || "Tanpa tanggal",
    status: order.status || "Menunggu",
    isPO: order.isPO !== false,
    createdAt: order.createdAt || Date.now(),
  };

  await db.runAsync(
    `INSERT OR REPLACE INTO orders (id, customer, items, total, date, status, isPO, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    savedOrder.id,
    savedOrder.customer,
    JSON.stringify(savedOrder.items || []),
    savedOrder.total,
    savedOrder.date,
    savedOrder.status,
    savedOrder.isPO ? 1 : 0,
    savedOrder.createdAt,
  );

  return savedOrder;
};

export const updateOrder = async (orderId, data) => {
  const db = await getDatabase();
  const existing = await db.getFirstAsync(
    "SELECT id, customer, items, total, date, status, isPO, createdAt FROM orders WHERE id = ?",
    orderId,
  );

  if (!existing) {
    return null;
  }

  const currentOrder = mapOrderRow(existing);
  const updatedOrder = {
    ...currentOrder,
    ...data,
    id: orderId,
    items: data.items || currentOrder.items,
    total:
      data.total !== undefined
        ? data.total
        : (data.items || currentOrder.items).reduce(
            (sum, item) => sum + (item.total || 0),
            0,
          ),
  };

  await db.runAsync(
    `UPDATE orders
     SET customer = ?, items = ?, total = ?, date = ?, status = ?, isPO = ?, createdAt = ?
     WHERE id = ?`,
    updatedOrder.customer,
    JSON.stringify(updatedOrder.items || []),
    updatedOrder.total,
    updatedOrder.date,
    updatedOrder.status,
    updatedOrder.isPO ? 1 : 0,
    updatedOrder.createdAt,
    orderId,
  );

  return updatedOrder;
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

export const getSetting = async (key) => {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    "SELECT value FROM settings WHERE key = ?",
    key,
  );

  return row?.value ?? null;
};

export const setSetting = async (key, value) => {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
    key,
    value,
  );
};
