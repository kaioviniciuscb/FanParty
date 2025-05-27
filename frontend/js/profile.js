document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Você precisa estar logado para ver o perfil.');
    window.location.href = '/login.html';
    return;
  }

  function mascararEmail(email) {
    const [nome, dominio] = email.split("@");
    if (nome.length <= 2) {
      return "*".repeat(nome.length) + "@" + dominio;
    }
    const inicio = nome[0];
    const fim = nome[nome.length - 1];
    const meio = "*".repeat(nome.length - 2);
    return `${inicio}${meio}${fim}@${dominio}`;
  }

  async function carregarPerfil() {
    try {
      const res = await fetch('http://localhost:3000/api/common-users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Erro ao buscar dados do perfil');

      const user = await res.json();

      // Preenche os dados no HTML
      document.getElementById('name').textContent = user.full_name || '';
      document.getElementById('email').textContent = user.email ? mascararEmail(user.email) : 'Email não disponível';
      document.getElementById('birthdate').textContent = user.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString('pt-BR')
        : 'Não informado';

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      alert('Erro ao carregar os dados do perfil.');
    }
  }

  carregarPerfil();

  const form = document.getElementById('updateProfileForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const full_name = document.getElementById('nameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const date_of_birth = document.getElementById('birthdateInput').value;

    if (!full_name || !email || !date_of_birth) {
      alert('Preencha todos os campos antes de atualizar o perfil.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/common-users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ full_name, email, date_of_birth })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao atualizar perfil');
      }

      alert('Perfil atualizado com sucesso!');
      carregarPerfil();

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert(`Erro: ${error.message}`);
    }
  });

    document.getElementById('backHomeBtn').addEventListener('click', () => {
    window.location.href = '../views/home.html';
    });
});
