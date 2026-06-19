const pool = require('../config/db');


// CREATE EMPLOYEE


exports.createEmployee= async (req, res) =>{
    const {name, email, role }= req.body;


try{
    const result= await pool.query(

        `INSERT INTO users (name, email, role)
             VALUES ($1, $2, $3)
             RETURNING *`,
        
        [name, email, role]
    );

    res.status(201).json(result.rows[0]);
}

catch  (err) {
    res.status(500).json({
        error: err.message
    });
}

};

// Get all employees


 exports.getAllEmployees= async ( req, res) =>{
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users'
        );
        res.json(result.rows);
    }

    catch (err){
        res.status(500).json({
            error: err.message
        });
    }

 };

// update employee


 exports.updateEmployee = async (req, res) => {
    const {id} = req.params;

    const {name, email, role }= req.body;

    try {
        const result= await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *',
            [name, email, role, id]
        );
        res.json(result.rows[0]);
    }

    catch(err){
        res.status(500).json({
            error: err.message
        });
    }
 };



 // DELETE EMPLOYEE

exports.deleteEmployee = async (req, res) => {

    const { id } = req.params;

    try {

        await pool.query(

            'DELETE FROM users WHERE id = $1',

            [id]

        );

        res.json({
            message: 'Employee deleted successfully'
        });

    }

    catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

