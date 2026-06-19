const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // checking existing user

        const existing= await pool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        );
        if (existing.rows.length > 0 ){
            return res.status(400).json({ error: 'User already exists'});
        }

        // hashh password

        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user 
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role , created_at',
            [name, email,hashedPassword,role]
        );

        res.status(201).json(result.rows[0]);
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
};

// Login
exports.login= async (req, res) => {
    const {email, password} = req.body;

    try{
        const result = await pool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        );

        if (result.rows.length ===0){
            return res.status(400).json({error: 'User not found'});
        }

        const user = result.rows[0];

        // compare password

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({error: 'Invalid Password'});
        }

        // create token

        const token= jwt.sign(
            { id: user.id, role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );

        res.json({token});

    }
    catch (err){
        res.status(500).json({error: err.message});
    }
};

exports.resetAdminPassword = async (req, res) => {

    try {

        const bcrypt = require('bcrypt');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await pool.query(
            'UPDATE users SET password=$1 WHERE email=$2',
            [hashedPassword, 'admin@test.com']
        );

        res.json({
            message: 'Admin password reset to admin123'
        });

    }

    catch(err){
        res.status(500).json({
            error: err.message
        });
    }
};