document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('formLogin');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  function showToast(message, duration = 5000) {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const submitButton = loginForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Entrando...';

    try {
      // Tenta login usuário comum
      let response = await fetch('/api/common-users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data = await response.json();

      if (!response.ok) {
        response = await fetch('/api/companies/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Credenciais inválidas.');
        }

        console.log('Token recebido (empresa):', data.token);
        const payloadEmpresa = JSON.parse(atob(data.token.split('.')[1]));
        console.log('Payload decodificado (empresa):', payloadEmpresa);

        // Login empresa 
        localStorage.setItem('token', data.token);
        localStorage.setItem('accountType', 'company');

      } else {
        // Login comum 
        localStorage.setItem('token', data.token);
        localStorage.setItem('accountType', 'common');
      }

      // Decodifica token para pegar userId ou companyId
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      if (payload.commonUserId) {
        localStorage.setItem('userId', payload.commonUserId);
      } else if (payload.companyId) {
        localStorage.setItem('userId', payload.companyId);
      }

      window.location.href = '../views/home.html';

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      showToast(error.message || 'Credenciais inválidas.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Entrar';
    }
  });
});
