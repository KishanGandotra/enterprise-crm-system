exports.verifyAdmin= (req, res, next) => {
    if (req.user.role !== 'ADMIN'){

        return res.status(403).json({
            error: 'Acess denied. Admin Only'
        });
    } 
    next();
};