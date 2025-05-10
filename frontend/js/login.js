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

        try{
            const response = await fetch('/api/common-users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro na requisição');
            }
            const data = await response.json();
            // Armazena o token no localStorage
            localStorage.setItem('token', data.token);
            console.log(data);

            //window.location.href = 'ALTERAR PARA O HOME DO USUÁRIO';

        }catch (error) {
            console.error('Erro ao fazer login:', error);
            showToast(error.message || 'Credenciais inválidas. Tente novamente.');
        }finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Entrar';
        }
    });
});