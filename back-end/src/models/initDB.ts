import { pool } from '../config/db';
import bcrypt from 'bcrypt';

const createTables = async () => {
    const client = await pool.connect();
    try {
        // สร้างตาราง users
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR UNIQUE NOT NULL,
                password VARCHAR NOT NULL,
                role VARCHAR NOT NULL,
                first_name VARCHAR NOT NULL,
                last_name VARCHAR NOT NULL,
                email VARCHAR UNIQUE,
                phone VARCHAR,
                status VARCHAR,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        // สร้างตาราง categories
        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR UNIQUE NOT NULL,
                status VARCHAR NOT NULL,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        // สร้างตาราง menus
        await client.query(`
            CREATE TABLE IF NOT EXISTS menus (
                id SERIAL PRIMARY KEY,
                category_id INT REFERENCES categories(id),
                image_url VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                status VARCHAR, 
                created_at TIMESTAMP DEFAULT NOW(),  
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // สร้างตาราง zones
        await client.query(`
            CREATE TABLE IF NOT EXISTS zones (
                id SERIAL PRIMARY KEY,
                name VARCHAR UNIQUE NOT NULL,
                status VARCHAR NOT NULL,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        // สร้างตาราง tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS tables (
                id SERIAL PRIMARY KEY,
                zone_id INT REFERENCES zones(id),
                table_number VARCHAR UNIQUE NOT NULL,
                status VARCHAR NOT NULL,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        // สร้างตาราง orders
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                table_id INT REFERENCES tables(id),
                user_id INT REFERENCES users(id),  
                status VARCHAR NOT NULL,
                order_time TIMESTAMP,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        // สร้างตาราง order_items
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INT REFERENCES orders(id),
                menu_id INT REFERENCES menus(id),
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        // สร้างตาราง bills
        await client.query(`
            CREATE TABLE IF NOT EXISTS bills (
                id SERIAL PRIMARY KEY,
                order_id INT REFERENCES orders(id),
                total_amount DECIMAL(12,2) NOT NULL,
                payment_status VARCHAR NOT NULL,
                payment_time TIMESTAMP,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        `);

        // สร้างตาราง sales_summary
        await client.query(`
            CREATE TABLE IF NOT EXISTS sales_summary (
                id SERIAL PRIMARY KEY,
                total_sales DECIMAL(12,2) NOT NULL,
                total_bills INT NOT NULL,
                total_items INT NOT NULL,
                total_tables INT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('All tables created successfully.');

        const adminUsername = 'admin';
        const adminPasswordPlain = 'admin123';
        const adminRole = 'admin';

        const res = await client.query('SELECT * FROM users WHERE username = $1', [adminUsername]);
        if (res.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(adminPasswordPlain, 10);
            await client.query(
                `INSERT INTO users (username, password, role, first_name, last_name, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [adminUsername, hashedPassword, adminRole, 'Admin', 'User']
            );
            console.log(`Default admin user created. Username: ${adminUsername}, Password: ${adminPasswordPlain}`);
        } else {
            console.log('Admin user already exists.');
        }

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        client.release();
    }
};

createTables();
