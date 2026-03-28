let chamadosCache = [];

// Realiza a autenticação do usuário e gerencia a persistência da sessão via LocalStorage
async function fazerLogin() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('pass').value;

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.user.nome);
            localStorage.setItem('userRole', data.user.role);
            window.location.reload();
        } else { alert(data.error); }
    } catch (err) { alert("Erro de conexão com o servidor"); }
}

// Coordena o carregamento inicial de dados para popular métricas e listas
async function carregarDados() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api', { headers: { 'Authorization': `Bearer ${token}` } });
    chamadosCache = await res.json();
    
    processarMetricas();
    renderizarLista(chamadosCache);
}

// Analisa o array de chamados para calcular os totais por status
function processarMetricas() {
    document.getElementById('count-aberto').innerText = chamadosCache.filter(c => c.status === 'Aberto').length;
    document.getElementById('count-progresso').innerText = chamadosCache.filter(c => c.status === 'Em Andamento').length;
    document.getElementById('count-resolvido').innerText = chamadosCache.filter(c => c.status === 'Resolvido').length;
}

// Gera dinamicamente o HTML para a listagem de chamados conforme o perfil do usuário
function renderizarLista(lista) {
    const role = localStorage.getItem('userRole');
    const containerId = role === 'tecnico' ? 'lista-chamados' : 'meus-chamados';
    const div = document.getElementById(containerId);
    div.innerHTML = '';

    lista.forEach(c => {
        let corTag = '#6c757d'; 
        if (c.prioridade === 'Baixa') corTag = '#28a745'; 
        if (c.prioridade === 'Média') corTag = '#ffc107'; 
        if (c.prioridade === 'Alta') corTag = '#dc3545';  

        let bordaCard = c.prioridade === 'Alta' ? `border-left: 5px solid ${corTag};` : 'border-left: 5px solid var(--detalhe-dourado);';

        div.innerHTML += `
            <div class="card" style="${bordaCard}">
                <div>
                    <strong>#${c.id} - ${c.titulo}</strong>
                    <span style="background:${corTag}; color:${c.prioridade === 'Média' ? '#000' : '#fff'}; padding:2px 8px; border-radius:12px; font-size:0.7rem; font-weight:bold; margin-left:8px; vertical-align:middle;">
                        ${c.prioridade || 'Baixa'}
                    </span>
                    <br>
                    <small>Cliente: ${c.cliente_nome} | Status: ${c.status}</small>
                </div>
                <div style="display:flex; gap:10px;">
                    <button onclick="exibirHistorico(${c.id})"><i class="fas fa-history"></i></button>
                    ${role === 'tecnico' && c.status !== 'Resolvido' ? 
                        `<button onclick="mudarStatus(${c.id}, 'Resolvido')"><i class="fas fa-check"></i></button>` : ''}
                </div>
            </div>
            <div id="hist-${c.id}" style="display:none; padding:15px; background:rgba(0,0,0,0.05); font-size:0.8rem; border-radius:8px; margin-bottom:10px;"></div>`;
    });
}

// Filtra a exibição de chamados em tempo real com base no título inserido na busca
function filtrarDados() {
    const termo = document.getElementById('busca').value.toLowerCase();
    const filtrados = chamadosCache.filter(c => c.titulo.toLowerCase().includes(termo));
    renderizarLista(filtrados);
}

// Consulta a API para exibir o registro de auditoria detalhado de um chamado
async function exibirHistorico(id) {
    const div = document.getElementById(`hist-${id}`);
    if (div.style.display === 'block') { div.style.display = 'none'; return; }
    
    const res = await fetch(`/api/${id}/historico`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    const hist = await res.json();
    div.innerHTML = hist.map(h => `<div style="margin-bottom:5px; border-bottom:1px solid #ddd; padding:5px;">${new Date(h.data_alteracao).toLocaleString()}: ${h.status_anterior} -> ${h.status_novo}</div>`).join('') || 'Sem histórico registrado.';
    div.style.display = 'block';
}

// Envia uma nova solicitação de suporte para persistência no banco de dados validando a resposta do servidor
async function abrirChamado() {
    const titulo = document.getElementById('novo-titulo').value;
    const descricao = document.getElementById('novo-desc').value;
    const prioridade = document.getElementById('nova-prioridade').value; 
    
    if(!titulo || !descricao) {
        return alert("Por favor, preencha o título e a descrição");
    }

    try {
        const response = await fetch('/api', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ titulo, descricao, prioridade }) 
        });

        if (response.ok) {
            alert("Chamado aberto com sucesso!");
            document.getElementById('novo-titulo').value = '';
            document.getElementById('novo-desc').value = '';
            carregarDados();
        } else {
            const errorData = await response.json();
            alert("Erro do Servidor: " + errorData.error);
            console.error("Erro na API:", errorData);
        }
    } catch (err) {
        alert("Erro de conexão. Verifique se o servidor está rodando.");
        console.error("Falha no fetch:", err);
    }
}

// Realiza a mudança de status e aciona a gravação automática de auditoria
async function mudarStatus(id, novoStatus) {
    if(!confirm("Deseja marcar este chamado como resolvido?")) return;
    const token = localStorage.getItem('token');
    await fetch(`/api/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoStatus })
    });
    carregarDados();
}

// Gerencia a configuração inicial da interface baseada no estado de autenticação
window.onload = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('bem-vindo').innerText = `Olá, ${localStorage.getItem('userName')}`;
        document.getElementById(role === 'tecnico' ? 'area-tecnico' : 'area-cliente').style.display = 'block';
        carregarDados();
    }
};

// Limpa os dados de sessão e redireciona para a tela inicial
function logout() { localStorage.clear(); window.location.reload(); }