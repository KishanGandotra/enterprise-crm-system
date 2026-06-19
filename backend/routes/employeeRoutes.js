const express= require('express');

const router= express.Router();

const{
    verifyToken
} = require('../middleware/authMiddleware');


const {
    createEmployee,
    getAllEmployees,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');


// protected Dashboard route

router.get('/dashboard', verifyToken, (req, res) => {
    res.json({
        message: 'Welcome to Employee DashBoard',
        user: req.user
    });
});

// CREATE EMPLOYEE

router.post(
    '/create',
    verifyToken,
    createEmployee
);


router.get(
    '/all',
    verifyToken,
    getAllEmployees
);

router.put(
    '/update/:id',
    verifyToken,
    updateEmployee
);


router.delete(
    '/delete/:id',
    verifyToken,
    deleteEmployee
);

module.exports= router;