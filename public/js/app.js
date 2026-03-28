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
            // Salva o Token e as infos no navegador
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.nome);

            alert(`Bem-vindo, ${data.user.nome}!`);
            window.location.reload(); // Recarrega para aplicar a lógica de visão
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error("Erro ao logar:", error);
    }
}

// Lógica ao carregar a página
window.onload = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // Se for técnico, mostra o painel de suporte
        if (role === 'tecnico') {
            document.getElementById('area-tecnico').style.display = 'block';
        } else {
            document.getElementById('area-cliente').style.display = 'block';
        }
    }
};

function logout() {
    localStorage.clear();
    window.location.reload();
}