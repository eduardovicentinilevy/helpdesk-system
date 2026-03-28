const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const authController = require('../controllers/authController');
const { verificarToken, apenasTecnico } = require('../middlewares/auth');

// Rota de Login (Pública)
router.post('/login', authController.login);

// Rotas de Chamados (Protegidas)
router.get('/', verificarToken, chamadoController.listarChamados);
router.post('/', verificarToken, chamadoController.criarChamado);

// Rotas de Auditoria (Apenas Técnicos)
router.put('/:id/status', verificarToken, apenasTecnico, chamadoController.atualizarStatus);
router.get('/:id/historico', verificarToken, apenasTecnico, chamadoController.verHistorico);

module.exports = router;