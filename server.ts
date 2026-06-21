import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { adminAuth } from './src/lib/firebase-admin.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { getUserData, saveUserData } from './src/db/queries.ts';

const app = express();
const PORT = 3000;
const DB_FILE_PATH = path.join(process.cwd(), 'database.json');

app.use(express.json({ limit: '10mb' }));

// API endpoint to read saved invoice DB records
app.get('/api/db', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || '');
      const data = await getUserData(dbUser.id);
      return res.json(data);
    } catch (err) {
      console.error('Authenticated user loading failed. Falling back to file database:', err);
    }
  }

  // Fallback to local sandbox file-based DB
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf8');
      return res.json(JSON.parse(raw));
    }
    return res.json({}); // return empty if not found, frontend defaults will handle
  } catch (err) {
    console.error('Error reading fallback database file:', err);
    res.status(500).json({ error: 'Failed to access persist ledger database' });
  }
});

// API endpoint to write updated states
app.post('/api/db', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || '');
      await saveUserData(dbUser.id, req.body);
      return res.json({ success: true, message: 'Cloud SQL Registry ledger updated' });
    } catch (err) {
      console.error('Authenticated user saving failed. Falling back to file database:', err);
    }
  }

  // Fallback to local sandbox file-based DB
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true, message: 'Local sandbox Registry ledger updated' });
  } catch (err) {
    console.error('Error writing fallback database file:', err);
    res.status(500).json({ error: 'Failed to write persist ledger database' });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with raw hot-module Vite handling middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving from distribution folder assets
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SupaBuyer Invoice server running at http://localhost:${PORT}`);
  });
}

startServer();
