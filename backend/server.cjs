const http = require('http');
const fs = require('fs');
const path = require('path');

// Read database files
const dbPath = path.join(__dirname, 'db.json');
const tempDbPath = path.join(__dirname, 'temp-db.json');

// Load permanent data
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Load or create temporary data
let tempDb = {};
try {
  tempDb = JSON.parse(fs.readFileSync(tempDbPath, 'utf8'));
} catch (err) {
  // Initialize temporary database with empty collections
  tempDb = {
    orders: [],
    cart: [],
    reviews: []
  };
  fs.writeFileSync(tempDbPath, JSON.stringify(tempDb, null, 2));
}

// Save temporary data function
function saveTempDb() {
  fs.writeFileSync(tempDbPath, JSON.stringify(tempDb, null, 2));
}

// Enable CORS middleware
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Simple routing function
function handleRequest(req, res) {
  // Enable CORS
  setCorsHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  
  // Parse URL to get the path and query parameters
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  console.log(`${req.method} ${pathname}`);
  
  // Parse request body for POST/PUT requests
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    let requestBody;
    try {
      requestBody = body ? JSON.parse(body) : {};
    } catch (e) {
      requestBody = {};
    }
    
    // Handle login endpoint - check both /login and /api/login paths
    if (req.method === 'POST' && (pathname === '/login' || pathname === '/api/login')) {
      console.log('Handling login request:', requestBody);
      const { email, password, role } = requestBody;
      
      // Find user by email and role
      const user = db.users.find(u => u.email === email && u.role === role);
      console.log('Found user:', user);
      
      if (user) {
        // In a real app, you'd verify the password here
        // For the demo, we'll accept any password
        const { id, name, email, role, profilePictureUrl } = user;
        const response = {
          user: { id, name, email, role, profilePictureUrl },
          token: `fake-jwt-token-${id}-${role}`
        };
        console.log('Login successful:', response);
        sendJsonResponse(res, 200, response);
      } else {
        console.log('Login failed: Invalid credentials');
        sendJsonResponse(res, 400, { message: "Invalid credentials" });
      }
      return;
    }
    
    // Handle registration endpoint
    if (req.method === 'POST' && (pathname === '/register' || pathname === '/api/register')) {
      const userData = requestBody;
      const { role } = userData;
      
      // Generate new ID based on role
      const prefix = role === 'customer' ? 'c' : role === 'homemaker' ? 'h' : 'd';
      const existingUsers = db.users.filter(u => u.role === role);
      const lastId = existingUsers.length > 0 ? 
        parseInt(existingUsers[existingUsers.length - 1].id.substring(1)) : 0;
      const newId = `${prefix}${lastId + 1}`;
      
      // Create new user
      const newUser = {
        id: newId,
        ...userData,
        createdAt: new Date().toISOString(),
        profilePictureUrl: `https://randomuser.me/api/portraits/${userData.gender || 'men'}/${lastId + 1}.jpg`
      };
      
      // Add user to database
      db.users.push(newUser);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      
      // Return user data without sensitive information
      const { password, ...userWithoutPassword } = newUser;
      const response = {
        user: userWithoutPassword,
        token: `fake-jwt-token-${newId}-${role}`
      };
      
      sendJsonResponse(res, 201, response);
      return;
    }
    
    // Handle API routes
    if (pathname.startsWith('/api/')) {
      const resource = pathname.split('/')[2];
      const resourceId = pathname.split('/')[3];
      
      // Check if resource is temporary
      const isTemp = ['orders', 'cart', 'reviews'].includes(resource);
      const dataSource = isTemp ? tempDb : db;
      
      // GET all resources
      if (req.method === 'GET' && resource && !resourceId) {
        if (dataSource[resource]) {
          sendJsonResponse(res, 200, dataSource[resource]);
        } else {
          sendJsonResponse(res, 404, { message: "Resource not found" });
        }
        return;
      }
      
      // GET single resource by ID
      if (req.method === 'GET' && resource && resourceId) {
        if (dataSource[resource]) {
          const item = dataSource[resource].find(item => item.id === resourceId);
          if (item) {
            sendJsonResponse(res, 200, item);
          } else {
            sendJsonResponse(res, 404, { message: "Item not found" });
          }
        } else {
          sendJsonResponse(res, 404, { message: "Resource not found" });
        }
        return;
      }
      
      // POST to create new resource
      if (req.method === 'POST' && resource && !resourceId) {
        if (dataSource[resource]) {
          const newId = generateId(resource, dataSource);
          const newItem = { id: newId, ...requestBody };
          dataSource[resource].push(newItem);
          
          // Save if it's temporary data
          if (isTemp) {
            saveTempDb();
          }
          
          sendJsonResponse(res, 201, newItem);
        } else {
          sendJsonResponse(res, 404, { message: "Resource not found" });
        }
        return;
      }
      
      // PUT to update resource
      if (req.method === 'PUT' && resource && resourceId) {
        if (dataSource[resource]) {
          const index = dataSource[resource].findIndex(item => item.id === resourceId);
          if (index !== -1) {
            dataSource[resource][index] = { ...dataSource[resource][index], ...requestBody };
            
            // Save if it's temporary data
            if (isTemp) {
              saveTempDb();
            }
            
            sendJsonResponse(res, 200, dataSource[resource][index]);
          } else {
            sendJsonResponse(res, 404, { message: "Item not found" });
          }
        } else {
          sendJsonResponse(res, 404, { message: "Resource not found" });
        }
        return;
      }
      
      // DELETE resource
      if (req.method === 'DELETE' && resource && resourceId) {
        if (dataSource[resource]) {
          const index = dataSource[resource].findIndex(item => item.id === resourceId);
          if (index !== -1) {
            const deleted = dataSource[resource].splice(index, 1)[0];
            
            // Save if it's temporary data
            if (isTemp) {
              saveTempDb();
            }
            
            sendJsonResponse(res, 200, deleted);
          } else {
            sendJsonResponse(res, 404, { message: "Item not found" });
          }
        } else {
          sendJsonResponse(res, 404, { message: "Resource not found" });
        }
        return;
      }
      
      // Default API response
      sendJsonResponse(res, 404, { message: "Endpoint not found" });
      return;
    }
    
    // Default response for unknown routes
    sendJsonResponse(res, 404, { message: "Not found" });
  });
}

function sendJsonResponse(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function generateId(resource, dataSource) {
  const items = dataSource[resource] || [];
  if (items.length === 0) return '1';
  
  const lastId = items[items.length - 1].id;
  if (lastId.startsWith('c') || lastId.startsWith('h') || lastId.startsWith('d') || lastId.startsWith('o') || lastId.startsWith('r')) {
    // If it's a special format ID like "c1", "h2", "o1", etc.
    const prefix = lastId.charAt(0);
    const num = parseInt(lastId.substring(1), 10);
    return `${prefix}${num + 1}`;
  }
  
  return (parseInt(lastId, 10) + 1).toString();
}

// Create and start the server
const server = http.createServer(handleRequest);
const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});