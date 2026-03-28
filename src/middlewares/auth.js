const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Acesso negado" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fiap');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: "Token inválido" });
    }
};