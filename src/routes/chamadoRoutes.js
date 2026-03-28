const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const chamadoController = require('../controllers/chamadoController');
const { verificarToken } = require('../middlewares/auth');

// Rotas Livres
router.post('/login', authController.login);

// Rotas Protegidas (Precisam do Token JWT)
router.get('/', verificarToken, chamadoController.listarChamados);
router.post('/', verificarToken, chamadoController.criarChamado); 
router.put('/:id/status', verificarToken, chamadoController.atualizarStatus);
router.get('/:id/historico', verificarToken, chamadoController.verHistorico);

module.exports = router;