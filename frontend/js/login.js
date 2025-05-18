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
            let response = await fetch('/api/common-users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                response = await fetch('/api/companies/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Credenciais inválidas.');
                }

                const companyData = await response.json();
                localStorage.setItem('token', companyData.token);
                console.log(companyData.data);
                window.location.href = '../views/event.html';
                
            } else {
                const userData = await response.json();
                localStorage.setItem('token', userData.token);
                window.location.href = '../views/event.html';
            }

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            showToast(error.message || 'Credenciais inválida.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });
});