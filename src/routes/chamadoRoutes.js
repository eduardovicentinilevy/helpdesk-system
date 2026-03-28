const express = require('express');
const router = express.Router();
const chamadoController = require('../controllers/chamadoController');
const { verificarToken, apenasTecnico } = require('../middlewares/auth');

// Rota: Alterar status do chamado
// Fluxo: Verifica Token -> Verifica se é Técnico -> Executa Auditoria
router.put('/:id/status', verificarToken, apenasTecnico, chamadoController.atualizarStatus);

module.exports = router;