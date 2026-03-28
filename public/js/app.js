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
            // SALVANDO OS DADOS CORRETAMENTE
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userName', data.user.nome);

            alert(`Bem-vindo, ${data.user.nome}!`);
            window.location.reload(); 
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Erro na conexão com o servidor.");
    }
}

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
        } else {
            document.getElementById('area-cliente').style.display = 'block';
        }
    }
};

function logout() {
    localStorage.clear();
    window.location.reload();
}