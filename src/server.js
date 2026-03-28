const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const chamadoRoutes = require('./routes/chamadoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve o Front-end da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Prefixo das rotas da API
app.use('/api', chamadoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n🚀 Sistema HelpDesk Rodando!`);
    console.log(`🔗 Acesse: http://localhost:${PORT}`);
});