const db = require('../database/db');

exports.atualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { novoStatus } = req.body;
    const alteradoPor = req.usuario.id; // Pegamos do Token via Middleware

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Recupera status anterior
        const [rows] = await conn.query('SELECT status FROM chamados WHERE id = ?', [id]);
        const statusAnterior = rows[0].status;

        // Atualiza status do chamado
        await conn.query('UPDATE chamados SET status = ? WHERE id = ?', [novoStatus, id]);

        // GRAVA AUDITORIA (Data e hora são automáticas via MySQL NOW())
        await conn.query(
            'INSERT INTO historico_chamados (chamado_id, status_anterior, status_novo, alterado_por) VALUES (?, ?, ?, ?)',
            [id, statusAnterior, novoStatus, alteradoPor]
        );

        await conn.commit();
        res.json({ message: "Status atualizado com registro de auditoria!" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: "Erro na transação de auditoria" });
    } finally {
        conn.release();
    }
};