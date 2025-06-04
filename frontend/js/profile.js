document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const updateProfileForm = document.getElementById('updateProfileForm');
    const commonFieldsDiv = document.getElementById('commonFields');
    const companyFieldsDiv = document.getElementById('companyFields');
    const backHomeBtn = document.getElementById('backHomeBtn');

    // Campos de input do formulário 
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const confirmPasswordInput = document.getElementById('confirmPasswordInput');
    const fullNameInput = document.getElementById('fullNameInput');
    const dateOfBirthInput = document.getElementById('dateOfBirthInput');
    const companyNameInput = document.getElementById('companyNameInput');
    const cnpjInput = document.getElementById('cnpjInput');
    const branchInput = document.getElementById('branchInput');

    // Elementos de exibição de dados do perfil no cabeçalho
    const nameDisplay = document.getElementById('name');
    const emailDisplay = document.getElementById('email');

    let currentAccountType = null;
    let authToken = null;

    function showToast(message, type = 'info', duration = 5000) {
        const toast = document.getElementById('toastNotification');
        const toastMessage = document.getElementById('toastMessage');

        if (!toast || !toastMessage) {
            console.error('Elementos do toast notification não encontrados no HTML.');
            alert(message);
            return;
        }

        toastMessage.textContent = message;

        toast.classList.remove('toast-success', 'toast-error', 'toast-info');

        if (type === 'success') {
            toast.classList.add('toast-success');
        } else if (type === 'error') {
            toast.classList.add('toast-error');
        } else {
            toast.classList.add('toast-info');
        }

        toast.classList.add('show');

        // Esconde o toast após a duração especificada
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    //Funções Auxiliares para Habilitar/Desabilitar Campos
    function disableFieldsInDiv(divElement) {
        divElement.querySelectorAll('input').forEach(input => {
            input.setAttribute('disabled', 'disabled');
            input.removeAttribute('required');
        });
    }

    function enableFieldsInDiv(divElement) {
        divElement.querySelectorAll('input').forEach(input => {
            input.removeAttribute('disabled');
            if (input.id === 'fullNameInput' || input.id === 'dateOfBirthInput' ||
                input.id === 'companyNameInput' || input.id === 'cnpjInput' || input.id === 'branchInput') {
                input.setAttribute('required', 'required');
            }
        });
    }

    // --- Função Principal: Carregar Dados do Perfil ---
    async function fetchUserProfile() {
        currentAccountType = localStorage.getItem('accountType');
        authToken = localStorage.getItem('token');
        console.log('Tipo de conta atual:', currentAccountType);
        console.log('Token de autenticação:', authToken);

        if (!currentAccountType || !authToken) {
            showToast('Sessão expirada ou informações incompletas. Faça login novamente.', 'error');
            setTimeout(() => {
                window.location.href = '../views/login.html';
            }, 2000);
            return;
        }

        let apiUrl = '';
        if (currentAccountType === 'common') {
            apiUrl = `http://localhost:3000/api/common-users/profile`;
        } else if (currentAccountType === 'company') {
            apiUrl = `http://localhost:3000/api/companies/profile`;
        } else {
            showToast('Tipo de conta desconhecido. Redirecionando para o login...', 'error');
            setTimeout(() => {
                window.location.href = '../views/login.html';
            }, 2000);
            return;
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                showToast(`Erro ao buscar dados do perfil: ${errorData.message || 'Erro desconhecido.'}`, 'error');
                throw new Error(errorData.message || 'Erro ao buscar dados do perfil.');
            }

            const userData = await response.json();
            console.log('Dados do perfil recebidos:', userData);

            nameDisplay.textContent = userData.full_name || userData.company_name || 'N/A';
            emailDisplay.textContent = userData.email || 'N/A';
            emailInput.value = userData.email || '';

            if (currentAccountType === 'common') {
                commonFieldsDiv.style.display = 'block';
                companyFieldsDiv.style.display = 'none';
                enableFieldsInDiv(commonFieldsDiv);
                disableFieldsInDiv(companyFieldsDiv);

                fullNameInput.value = userData.full_name || '';
                dateOfBirthInput.value = userData.date_of_birth ? new Date(userData.date_of_birth).toISOString().split('T')[0] : '';
            } else if (currentAccountType === 'company') {
                companyFieldsDiv.style.display = 'block';
                commonFieldsDiv.style.display = 'none';
                enableFieldsInDiv(companyFieldsDiv);
                disableFieldsInDiv(commonFieldsDiv);

                companyNameInput.value = userData.company_name || '';
                cnpjInput.value = '';
                branchInput.value = userData.branch_of_activity || '';
            }

            passwordInput.value = '';
            confirmPasswordInput.value = '';
            updateProfileForm.style.display = 'block';

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            showToast(`Não foi possível carregar o perfil: ${error.message}.`, 'error');
            updateProfileForm.style.display = 'none';
        }
    }

    // --- Lógica de Submissão do Formulário de Atualização do Perfil ---
    updateProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if(cnpjInput && cnpjInput.value.length !== 14) {
            showToast('CNPJ inválido! Deve conter 14 números.', 'error');
            return
        }
        if (password && password !== confirmPassword) {
            showToast('As senhas não coincidem!', 'error');
            return;
        }
        if(password && password.length < 8) {
            showToast('A senha deve ter pelo menos 8 caracteres!', 'error');
            return
        }

        const submitButton = updateProfileForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Atualizando...';

        const dataToSend = {
            email: email,
            user_type: currentAccountType
        };

        if (currentAccountType === 'common') {
            dataToSend.full_name = fullNameInput.value.trim();
            dataToSend.date_of_birth = dateOfBirthInput.value;
        } else if (currentAccountType === 'company') {
            dataToSend.company_name = companyNameInput.value.trim();
            dataToSend.cnpj = cnpjInput.value.trim();
            dataToSend.branch_of_activity = branchInput.value.trim();
        }

        let updateApiUrl = '';
        let updatePasswordApiUrl = '';

        if (currentAccountType === 'common') {
            updateApiUrl = `http://localhost:3000/api/common-users/profile`;
            updatePasswordApiUrl = `http://localhost:3000/api/common-users/change-password`;
        } else if (currentAccountType === 'company') {
            updateApiUrl = `http://localhost:3000/api/companies/profile`;
            updatePasswordApiUrl = `http://localhost:3000/api/companies/change-password`;
        }

        try {
            const response = await fetch(updateApiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                showToast(`Erro ao atualizar perfil: ${errorData.message || 'Erro desconhecido.'}`, 'error');
                throw new Error(errorData.message || 'Erro ao atualizar perfil.');
            }

            let sucessMessage = 'Perfil atualizado com sucesso!';

            if (password) {
                console.log({new_password: password});
                try {
                    const passwordResponse = await fetch(updatePasswordApiUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ newPassword: password }),
                    });

                    if (!passwordResponse.ok) {
                        const passwordErrorData = await passwordResponse.json();
                        showToast(`Erro ao atualizar senha: ${passwordErrorData.message || 'Erro desconhecido.'}`, 'error');
                        throw new Error(passwordErrorData.message || 'Erro ao atualizar senha.');
                    }else {
                        sucessMessage = ('Perfil e senha atualizados com sucesso!');
                    }
                } catch (passwordError) {
                    console.error('Erro ao atualizar senha:', passwordError);
                    showToast(`Não foi possível atualizar a senha: ${passwordError.message}`, 'error');
                }
            }
            showToast(sucessMessage, 'success');
            fetchUserProfile();

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            showToast(`Não foi possível atualizar o perfil: ${error.message}`, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Atualizar Perfil';
        }
    });

    backHomeBtn.addEventListener('click', () => {
        window.location.href = '../views/home.html';
    });
    // --- Inicialização ---
    fetchUserProfile();
});
