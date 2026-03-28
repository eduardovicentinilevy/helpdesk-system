const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const chamadoRoutes = require('./routes/chamadoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve os arquivos da pasta 'public' (HTML, CSS, JS do Front)
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api', chamadoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor ON: http://localhost:${PORT}`);
});