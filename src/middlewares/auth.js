const jwt = require('jsonwebtoken');

// Middleware para verificar se o usuário está logado
exports.verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Pega o token após "Bearer"

    if (!token) return res.status(401).json({ error: "Acesso não autorizado!" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Injeta os dados do usuário na requisição
        next();
    } catch (err) {
        res.status(403).json({ error: "Token inválido ou expirado." });
    }
};

// Middleware para verificar se é TÉCNICO (RBAC)
exports.apenasTecnico = (req, res, next) => {
    if (req.usuario.role !== 'tecnico') {
        return res.status(403).json({ error: "Acesso restrito a técnicos." });
    }
    next();
};