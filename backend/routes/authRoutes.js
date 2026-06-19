const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

router.post('/register', authController.register);
router.post('/login', authController.login);

// TEMP RESET KISHAN PASSWORD
router.get('/reset-kishan', async (req, res) => {

  const hashedPassword = await bcrypt.hash(
    'kishan123',
    10
  );

  await pool.query(
    'UPDATE users SET password=$1 WHERE email=$2',
    [hashedPassword, 'kishan@test.com']
  );

  res.json({
    message: 'Kishan password reset to kishan123'
  });

});

module.exports = router;