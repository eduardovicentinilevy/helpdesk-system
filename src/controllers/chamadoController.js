const db = require('../database/db');

// 1. Listar Chamados
exports.listarChamados = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM chamados');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Erro ao listar chamados" });
    }
};

// 2. Criar Chamado
exports.criarChamado = async (req, res) => {
    const { titulo, descricao } = req.body;
    const cliente_id = req.usuario.id;
    try {
        await db.query('INSERT INTO chamados (titulo, descricao, cliente_id) VALUES (?, ?, ?)', 
        [titulo, descricao, cliente_id]);
        res.status(201).json({ message: "Chamado aberto com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar chamado" });
    }
};

// 3. O DESAFIO: Atualizar Status com Auditoria
exports.atualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { novoStatus } = req.body;
    const alteradoPor = req.usuario.id;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.query('SELECT status FROM chamados WHERE id = ?', [id]);
        const statusAnterior = rows[0].status;

        await conn.query('UPDATE chamados SET status = ? WHERE id = ?', [novoStatus, id]);
        await conn.query(
            'INSERT INTO historico_chamados (chamado_id, status_anterior, status_novo, alterado_por) VALUES (?, ?, ?, ?)',
            [id, statusAnterior, novoStatus, alteradoPor]
        );

        await conn.commit();
        res.json({ message: "Status atualizado e auditado!" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: "Falha na auditoria" });
    } finally {
        conn.release();
    }
};

// 4. Ver Histórico
exports.verHistorico = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM historico_chamados WHERE chamado_id = ?', [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar histórico" });
    }
};