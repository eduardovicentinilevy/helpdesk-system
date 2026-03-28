// 1. Função de Login 
async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('pass').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.nome);
            window.location.reload(); 
        } else {
            alert(data.error || "Erro ao logar");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

// 2. Função para Listar Chamados (O coração do Dashboard)
async function carregarChamados() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api', { // Rota definida no router.get('/')
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const chamados = await response.json();
        const lista = document.getElementById('lista-chamados');
        lista.innerHTML = ''; 

        chamados.forEach(c => {
            lista.innerHTML += `
                <div class="ticket-card">
                    <div>
                        <strong>#${c.id} - ${c.titulo}</strong>
                        <p>Status: <span class="status-badge">${c.status}</span></p>
                    </div>
                    ${localStorage.getItem('userRole') === 'tecnico' ? 
                        `<button onclick="atualizarStatus(${c.id}, 'Em Andamento')" style="width:auto">Atender</button>` : ''}
                </div>
            `;
        });
    } catch (err) {
        console.error("Erro ao carregar chamados:", err);
    }
}

// 3. Lógica de Inicialização
window.onload = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const nome = localStorage.getItem('userName');

    if (token) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('bem-vindo').innerText = `Olá, ${nome}`;
        
        if (role === 'tecnico') {
            document.getElementById('area-tecnico').style.display = 'block';
            carregarChamados();
        } else {
            document.getElementById('area-cliente').style.display = 'block';
        }
    }
};

function logout() {
    localStorage.clear();
    window.location.reload();
}