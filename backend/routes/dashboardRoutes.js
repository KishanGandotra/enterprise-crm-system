const express = require('express');

const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');

const {
  getAnalytics
} = require('../controllers/dashboardController');

router.get(
  '/analytics',
  verifyToken,
  getAnalytics
);

module.exports = router;