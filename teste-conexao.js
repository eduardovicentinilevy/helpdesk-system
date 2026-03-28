const db = require('./src/database/db');

async function testar() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS resultado');
        console.log('✅ CONEXÃO COM MYSQL ESTABELECIDA!');
        console.log('Resultado do teste:', rows[0].resultado);
        process.exit(0);
    } catch (err) {
        console.error('❌ FALHA NA CONEXÃO COM O BANCO:');
        console.error(err.message);
        process.exit(1);
    }
}

testar();