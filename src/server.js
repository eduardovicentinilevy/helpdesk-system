const express = require('express');
const cors = require('cors');
require('dotenv').config();

const chamadoRoutes = require('./routes/chamadoRoutes');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve o front-end estático

// Definição das Rotas
app.use('/api/chamados', chamadoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});