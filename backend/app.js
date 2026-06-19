const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/uploads',
  express.static('uploads')
);

// DB import 
const pool= require('./config/db');

const authRoutes = require('./routes/authRoutes');
app.use('/auth',authRoutes);

const employeeRoutes = require('./routes/employeeRoutes');
app.use('/employee', employeeRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

const opportunityRoutes = require('./routes/opportunityRoutes');
app.use('/opportunity', opportunityRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/dashboard', dashboardRoutes);

//test route
app.get('/', (req, res) => {
    res.send ('API is running');
});

//DB test route

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    }
    catch(err){
        res.status(500).json({error: err.message });
    }
});


module.exports = app;