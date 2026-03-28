const db = require('../database/db');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, senha]);
        if (rows.length === 0) return res.status(401).json({ error: "E-mail ou senha incorretos" });

        const user = rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_fiap', { expiresIn: '2h' });

        res.json({ token, user: { nome: user.nome, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: "Erro no login" });
    }
};