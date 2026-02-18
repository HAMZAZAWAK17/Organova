'use strict';
const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT Bearer token.
 * Attaches decoded payload to req.user.
 */
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;   // { id, email, role }
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Role-based access control guard.
 * Usage: authorize('admin')
 */
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden – insufficient permissions' });
        }
        next();
    };
}

module.exports = { authenticate, authorize };
