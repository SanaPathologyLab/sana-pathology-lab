const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.log('Auth: No token provided, header:', authHeader);
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey', (err, decoded) => {
    if (err) {
      console.log('Auth: Token invalid:', err.message);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userType = decoded.userType || 'STAFF';
    next();
  });
};

const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Require elevated role' });
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };
