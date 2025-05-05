// Authentication middleware for JSON Server
module.exports = (req, res, next) => {
  // Handle registration
  if (req.method === 'POST' && req.path === '/register') {
    const { email, password, role, name } = req.body;
    
    const users = require('./db.json').users;
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Validate role
    if (!['customer', 'homemaker', 'delivery'].includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }

    // Create new user with role-specific ID
    const prefix = role.charAt(0);
    const lastId = users.length > 0 ? 
      Math.max(...users.filter(u => u.role === role).map(u => parseInt(u.id.slice(1)))) : 0;
    const newId = `${prefix}${lastId + 1}`;

    const newUser = {
      id: newId,
      email,
      password, // In production, this should be hashed
      name,
      role,
      createdAt: new Date().toISOString(),
      profilePictureUrl: `https://api.dicebear.com/7.x/avatars/svg?seed=${email}`
    };

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      user: userWithoutPassword,
      token: `${newId}-${role}-${Date.now()}`
    });
    return;
  }

  // Handle login
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password, role } = req.body;
    
    const users = require('./db.json').users;
    const user = users.find(u => u.email === email && u.role === role);
    
    if (user && user.password === password) { // In production, compare hashed passwords
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({ 
        user: userWithoutPassword,
        token: `${user.id}-${role}-${Date.now()}`
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
    return;
  }
  
  // Protect routes based on role
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    const [id, role] = token.split('-');
    
    // Add user info to request for downstream middleware
    req.user = { id, role };
    
    // Restrict access based on role and path
    if (req.path.startsWith('/homemaker') && role !== 'homemaker' ||
        req.path.startsWith('/delivery') && role !== 'delivery' ||
        req.path.startsWith('/customer') && role !== 'customer') {
      res.status(403).json({ message: "Access denied" });
      return;
    }
  }

  next();
}