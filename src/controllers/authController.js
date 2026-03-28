const db = require('../database/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);
        if (rows.length === 0) return res.status(401).json({ error: "Credenciais inválidas" });

        const usuario = rows[0];
        const token = jwt.sign(
            { id: usuario.id, role: usuario.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ token, role: usuario.role, nome: usuario.nome });
    } catch (err) {
        res.status(500).json({ error: "Erro no servidor" });
    }
};