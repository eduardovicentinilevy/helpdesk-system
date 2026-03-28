const db = require('../database/db');

// Recupera a lista de chamados filtrando por permissão de usuário (Técnico vê tudo, Cliente vê apenas os próprios)
exports.listarChamados = async (req, res) => {
    const { role, id } = req.user;
    try {
        let query = `SELECT c.*, u.nome as cliente_nome FROM chamados c JOIN usuarios u ON c.cliente_id = u.id`;
        let params = [];

        if (role === 'cliente') {
            query += ` WHERE c.cliente_id = ?`;
            params.push(id);
        }
        
        query += ` ORDER BY c.id DESC`;
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: "Erro ao processar listagem de chamados" }); 
    }
};

// Realiza a inserção de um novo chamado no banco de dados com base nos dados fornecidos pelo cliente
exports.criarChamado = async (req, res) => {
    const { titulo, descricao, prioridade } = req.body;
    const cliente_id = req.user.id;
    try {
        await db.query(
            'INSERT INTO chamados (titulo, descricao, prioridade, cliente_id) VALUES (?, ?, ?, ?)', 
            [titulo, descricao, prioridade || 'Baixa', cliente_id]
        );
        res.status(201).json({ message: "Chamado registrado com sucesso" });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: "Erro ao registrar novo chamado" }); 
    }
};
// Atualiza o estado do chamado e registra a transição na tabela de auditoria historico_chamados
exports.atualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { novoStatus } = req.body;
    try {
        const [chamado] = await db.query('SELECT status FROM chamados WHERE id = ?', [id]);
        if (chamado.length === 0) return res.status(404).json({ error: "Chamado inexistente" });

        await db.query('UPDATE chamados SET status = ? WHERE id = ?', [novoStatus, id]);
        await db.query('INSERT INTO historico_chamados (chamado_id, status_anterior, status_novo) VALUES (?, ?, ?)', 
            [id, chamado[0].status, novoStatus]);
        
        res.json({ message: "Status atualizado e auditoria registrada" });
    } catch (err) { 
        res.status(500).json({ error: "Erro na atualização de status" }); 
    }
};

// Consulta o histórico de alterações de status para fins de rastreabilidade
exports.verHistorico = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM historico_chamados WHERE chamado_id = ? ORDER BY data_alteracao DESC', [req.params.id]);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: "Erro ao recuperar histórico de auditoria" }); 
    }
};