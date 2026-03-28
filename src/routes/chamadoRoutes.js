const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const authController = require('../controllers/authController'); // Vamos criar este já já
const { verificarToken, apenasTecnico } = require('../middlewares/auth');

// --- ROTAS PÚBLICAS ---
// Rota para o usuário se autenticar e receber o Token JWT
router.post('/login', authController.login);

// --- ROTAS PROTEGIDAS (Precisa de Token) ---

// 1. Ver todos os chamados (Técnico vê todos, Cliente vê os dele)
router.get('/', verificarToken, chamadoController.listarChamados);

// 2. Criar um novo chamado (Apenas clientes ou técnicos)
router.post('/', verificarToken, chamadoController.criarChamado);

// 3. O DESAFIO: Atualizar status com Auditoria (APENAS TÉCNICOS)
// O middleware 'apenasTecnico' garante que o cliente não mude o status
router.put('/:id/status', verificarToken, apenasTecnico, chamadoController.atualizarStatus);

// 4. Ver histórico de auditoria de um chamado específico
router.get('/:id/historico', verificarToken, apenasTecnico, chamadoController.verHistorico);

module.exports = router;