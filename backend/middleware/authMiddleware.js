const jwt = require('jsonwebtoken');
const { User, LoginLog } = require('../models');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const payload = jwt.decode(token);
        if (payload?.tokenId) {
          await LoginLog.update(
            { logoutTime: new Date(), sessionStatus: 'expired' },
            { where: { tokenId: payload.tokenId, sessionStatus: 'active' } }
          );
        }
        return res.status(401).json({ success: false, message: 'Session expired. Please login again.', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.', code: 'ACCOUNT_BLOCKED' });
    }

    const activeSession = await LoginLog.findOne({
      where: {
        tokenId: decoded.tokenId,
        sessionStatus: 'active'
      }
    });

    if (!activeSession) {
      return res.status(401).json({ success: false, message: 'Session is no longer active. Please login again.', code: 'SESSION_INVALID' });
    }

    req.user = user;
    req.tokenId = decoded.tokenId;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ success: false, message: 'Authentication error.' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
    }
  } catch (err) {
    // silent fail for optional auth
  }
  next();
};

module.exports = { protect, adminOnly, optionalAuth };
