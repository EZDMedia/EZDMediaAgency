import * as dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import { createServer as createViteServer } from "vite";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
import multer from "multer";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Pool is now imported from @neondatabase/serverless

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // ==========================================
  // Neon PostgreSQL Database Setup
  // ==========================================
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // Initialize DB Tables
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        plain_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255);
      
      CREATE TABLE IF NOT EXISTS portfolio (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        category VARCHAR(255) NOT NULL,
        category_ar VARCHAR(255),
        features TEXT,
        features_ar TEXT,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS features TEXT;
      ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
      ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS category_ar VARCHAR(255);
      ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS features_ar TEXT;
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        agency_type VARCHAR(100),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Auto-create default admin if no users exist
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCount.rows[0].count) === 0) {
      const defaultPassword = await bcrypt.hash("admin123", 10);
      await pool.query(
        "INSERT INTO users (email, password_hash, role, plain_password) VALUES ($1, $2, $3, $4)",
        ["admin@ezdmedia.com", defaultPassword, "super_admin", "admin123"]
      );
      console.log("Default admin created: admin@ezdmedia.com / admin123");
    } else {
      // Ensure the first user is a super_admin if upgrading
      await pool.query("UPDATE users SET role = 'super_admin' WHERE id = (SELECT id FROM users ORDER BY id ASC LIMIT 1)");
    }
    
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }

  // ==========================================
  // Cloudflare R2 Storage Setup
  // ==========================================
  const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });

  const upload = multer({ storage: multer.memoryStorage() });

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const requireSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: "Forbidden: Super Admin only" });
    }
    next();
  };

  // ==========================================
  // API Routes
  // ==========================================

  // Health Check
  app.get("/api/health", async (req, res) => {
    try {
      const dbRes = await pool.query("SELECT NOW()");
      res.json({ status: "ok", dbTime: dbRes.rows[0].now });
    } catch (err) {
      res.status(500).json({ status: "error", error: String(err) });
    }
  });

  // User Management: Get All Users (Super Admin)
  app.get("/api/users", authenticate, requireSuperAdmin, async (req, res) => {
    try {
      const result = await pool.query("SELECT id, email, role, plain_password, created_at FROM users ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // User Management: Create User (Super Admin)
  app.post("/api/users", authenticate, requireSuperAdmin, async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role === 'super_admin' ? 'super_admin' : 'admin';
      const result = await pool.query(
        "INSERT INTO users (email, password_hash, role, plain_password) VALUES ($1, $2, $3, $4) RETURNING id, email, role",
        [email, hashedPassword, userRole, password]
      );
      res.json({ user: result.rows[0] });
    } catch (err: any) {
      if (err.code === "23505") return res.status(400).json({ error: "Email already exists" });
      res.status(500).json({ error: String(err) });
    }
  });

  // User Management: Delete User (Super Admin)
  app.delete("/api/users/:id", authenticate, requireSuperAdmin, async (req: any, res: any) => {
    const { id } = req.params;
    try {
      // Prevent deleting oneself
      if (parseInt(id) === req.user.userId) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      await pool.query("DELETE FROM users WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1d" });
      res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
      console.error("Login route error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // Portfolio Routes
  app.get("/api/portfolio", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM portfolio ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/portfolio", authenticate, async (req, res) => {
    const { name, name_ar, category, category_ar, features, features_ar, image_url } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO portfolio (name, name_ar, category, category_ar, features, features_ar, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [name, name_ar, category, category_ar, features, features_ar, image_url]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.put("/api/portfolio/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    const { name, name_ar, category, category_ar, features, features_ar, image_url } = req.body;
    try {
      const result = await pool.query(
        "UPDATE portfolio SET name = $1, name_ar = $2, category = $3, category_ar = $4, features = $5, features_ar = $6, image_url = $7 WHERE id = $8 RETURNING *",
        [name, name_ar, category, category_ar, features, features_ar, image_url, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.delete("/api/portfolio/:id", authenticate, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM portfolio WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Contact Routes
  app.post("/api/contact", async (req, res) => {
    const { name, email, agency_type, message } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO contacts (name, email, agency_type, message) VALUES ($1, $2, $3, $4) RETURNING id",
        [name, email, agency_type, message]
      );
      res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/contact", authenticate, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM contacts ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Storage: Upload File to Cloudflare R2
  app.post("/api/upload", authenticate, upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const key = `${Date.now()}-${req.file.originalname}`;
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME || "ezdmedia",
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      
      // Generate a signed URL for immediate access (optional)
      const url = await getSignedUrl(s3, new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || "ezdmedia",
        Key: key,
      }), { expiresIn: 3600 * 24 * 7 }); // 7 days

      res.json({ success: true, key, url });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: String(err) });
    }
  });

  // ==========================================
  // Vite Middleware for Frontend
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
