import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const server = jsonServer.create();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/echo', (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
server.use(jsonServer.bodyParser);

// Add custom auth middleware to simulate authentication
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password, role } = req.body;
    
    // Simple login check (in real app, you'd verify credentials)
    const db = router.db;
    const users = db.get('users').value();
    const user = users.find(u => u.email === email && u.role === role);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.jsonp({
        user: userWithoutPassword,
        token: `fake-jwt-token-${user.id}-${role}`
      });
    } else {
      res.status(400).jsonp({ message: "Invalid credentials" });
    }
    return;
  }
  next();
});

// Cart handling middleware
server.use((req, res, next) => {
  if (req.path.startsWith('/cart')) {
    const db = router.db;
    const userId = req.headers['user-id']; // You should get this from auth token in real app
    
    if (req.method === 'GET') {
      const cart = db.get('cart').find({ userId }).value() || { items: [] };
      return res.jsonp(cart);
    }
    
    if (req.method === 'POST') {
      const cart = db.get('cart').find({ userId }).value() || { userId, items: [] };
      cart.items.push(req.body);
      db.get('cart').upsert(cart).write();
      return res.jsonp(cart);
    }
  }
  next();
});

// Order handling middleware
server.use((req, res, next) => {
  if (req.path.startsWith('/orders')) {
    const db = router.db;
    const userId = req.headers['user-id']; // You should get this from auth token in real app
    
    if (req.method === 'POST') {
      const order = {
        id: Date.now().toString(),
        userId,
        ...req.body,
        createdAt: new Date().toISOString()
      };
      db.get('orders').push(order).write();
      
      // Clear user's cart after successful order
      db.get('cart').remove({ userId }).write();
      
      return res.jsonp(order);
    }
  }
  next();
});

// Use default router
server.use(router);

const port = 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});