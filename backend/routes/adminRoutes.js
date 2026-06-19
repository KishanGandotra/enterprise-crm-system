const express = require('express');
const router = express.Router();

const {
    verifyToken
} = require('../middleware/authMiddleware');

const { verifyAdmin } = require('../middleware/roleMiddleware');

// Admin Protected Route 

router.get(
    '/dashboard',
    verifyToken,
    verifyAdmin,
    (req, res) => {
        res.json({
            message: 'Welcome Admin',
            user: req.user
        });
    }
);

module.exports = router;