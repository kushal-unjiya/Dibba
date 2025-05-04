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
      // Simulate successful login
      const { id, name, email, role, profilePictureUrl } = user;
      res.json({ 
        user: { id, name, email, role, profilePictureUrl },
        token: `fake-jwt-token-${id}-${role}`
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
    return;
  }
  
  // Continue to JSON Server router
  next();
});

// Use default router
server.use('/api', router);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});