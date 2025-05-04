// Authentication middleware for JSON Server
module.exports = (req, res, next) => {
  // Handle login requests
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password, role } = req.body;
    
    // In a real app, you would verify the password here
    // For our prototype, we'll just check if a user with this email and role exists
    const users = require('./db.json').users;
    const user = users.find(u => u.email === email && u.role === role);
    
    if (user) {
      // Simulate successful login
      const { id, name, email, role, profilePictureUrl } = user;
      res.status(200).json({ 
        user: { id, name, email, role, profilePictureUrl },
        token: `fake-jwt-token-${id}-${role}`
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
    return;
  }
  
  // For simplicity, let's allow all other requests to pass through
  // In a real app, you'd verify JWT tokens here for protected routes
  next();
}