import aiosqlite
import os

DB_PATH = "smartbreak.db"

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                is_countable INTEGER DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS menu_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                photo_url TEXT,
                available_amount INTEGER DEFAULT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                pickup_time TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                total_price REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                menu_item_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price_at_order REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
            );

            INSERT OR IGNORE INTO categories (name, is_countable) VALUES
                ('Coffee', 0),
                ('Lemonade', 0),
                ('Sandwich', 1),
                ('Macaron', 1),
                ('Snack', 1);
        """)
        await db.commit()

        # Seed admin users with hashed passwords
        import bcrypt
        admins = [
            ("230103148@sdu.edu.kz", "Aruzhan Kaparova", "Admin@1"),
            ("230103256@sdu.edu.kz", "Akbota Zhalgas", "Admin@2"),
            ("230103126@sdu.edu.kz", "Salima Shamshiyeva", "Admin@3"),
            ("230103220@sdu.edu.kz", "Mukhtar Mukhametkali", "Admin@4"),
        ]
        for email, name, pwd in admins:
            hashed = bcrypt.hashpw(pwd.encode(), bcrypt.gensalt()).decode()
            await db.execute(
                "INSERT OR IGNORE INTO users (email, name, password_hash, is_admin) VALUES (?,?,?,1)",
                (email, name, hashed)
            )
        await db.commit()
