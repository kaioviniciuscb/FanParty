document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const isUser = this.value === 'comum';
            const isCompany = this.value === 'empresa';
        
            document.getElementById('userFields').style.display = isUser ? 'block' : 'none';
            document.getElementById('promoterFields').style.display = isCompany ? 'block' : 'none';
        
            clearAllErrors();

            if (isUser) {
                document.getElementById('company_name').value = '';
                document.getElementById('cnpj').value = '';
                document.getElementById('branch_of_activity').value = '';
            } else if (isCompany) {
                document.getElementById('full_name').value = '';
                document.getElementById('date_of_birth').value = '';
            }
        });
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        return cnpj.length === 14;
    }

    function clearError(errorElement) {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.previousElementSibling?.classList.remove('error');
        }
    }

    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(clearError);
    }

    function showError(input, message) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
            input.classList.add('error');
        }
    }

    function setupFieldValidation(input) {
        input.addEventListener('input', function () {
            validateField(this);
        });

        input.addEventListener('blur', function () {
            validateField(this);
        });
    }

    function validateField(input) {
        const value = input.value.trim();
        const accountType = document.querySelector('input[name="type"]:checked').value;
        const errorElement = input.nextElementSibling;

        switch (input.id) {
            case 'emailInput':
                if (!value) {
                    showError(input, 'Insira um Email!');
                } else if (!isValidEmail(value)) {
                    showError(input, 'Insira um Email válido!');
                } else {
                    clearError(errorElement);
                }
                break;

            case 'passwordInput':
                if (!value) {
                    showError(input, 'Insira uma senha!');
                } else if (value.length < 8) {
                    showError(input, 'Sua senha deve conter no mínimo 8 caracteres!');
                } else {
                    clearError(errorElement);
                }
                break;

            case 'full_name':
                if (accountType === 'comum') {
                    if (!value) {
                        showError(input, 'Insira um nome!');
                    } else if (value.length < 3) {
                        showError(input, 'O nome deve conter no mínimo 3 letras!');
                    } else {
                        clearError(errorElement);
                    }
                }
                break;

            case 'date_of_birth':
                if (accountType === 'comum' && !value) {
                    showError(input, 'Insira sua data de nascimento!');
                } else {
                    clearError(errorElement);
                }
                break;

            case 'company_name':
                if (accountType === 'empresa') {
                    if (!value) {
                        showError(input, 'Insira um nome para empresa!');
                    } else if (value.length < 3) {
                        showError(input, 'O nome da empresa deve conter no mínimo 3 caracteres!');
                    } else {
                        clearError(errorElement);
                    }
                }
                break;

            case 'cnpj':
                if (accountType === 'empresa') {
                    if (!value) {
                        showError(input, 'Insira o CNPJ da empresa!');
                    } else if (!isValidCNPJ(value)) {
                        showError(input, 'Insira um CNPJ válido!');
                    } else {
                        clearError(errorElement);
                    }
                }
                break;

            case 'branch_of_activity':
                if (accountType === 'empresa' && !value) {
                    showError(input, 'Especifique o ramo de atuação da empresa!');
                } else {
                    clearError(errorElement);
                }
                break;
        }
    }

    function showToast(message, duration = 3000, showLoader = false, type) {
        const toast = document.getElementById('toastNotification');
        const messageEl = document.getElementById('toastMessage');
        const loader = document.getElementById('toastLoader');
        type = type || 'success';

         // Limpa classes antigas
        toast.classList.remove('toast-success', 'toast-error');

        // Adiciona classe correta
        if (type === 'success') {
            toast.classList.add('toast-success');
        } else {
            toast.classList.add('toast-error');
        }
        
        messageEl.textContent = message;
        loader.style.display = showLoader ? 'inline-block' : 'none';
        toast.classList.add('show');
        
        if (duration) {
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }
    }

    document.querySelectorAll('#cadastroForm input').forEach(setupFieldValidation);

    const form = document.getElementById('cadastroForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        let isValid = true;

        document.querySelectorAll('#cadastroForm input').forEach(input => {
            if (window.getComputedStyle(input).display !== 'none') {
                validateField(input);
                if (input.classList.contains('error')) {
                    isValid = false;
                }
            }
        });

        if (isValid) {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.type = document.querySelector('input[name="type"]:checked')?.value;

            if (data.type === 'empresa') {
                delete data.full_name;
                delete data.date_of_birth;
            } else if (data.type === 'comum') {
                delete data.company_name;
                delete data.cnpj;
                delete data.branch_of_activity;
            }

            const endpoint = data.type === 'comum' 
                ? '/api/common-users/register' 
                : '/api/companies/register';

            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Erro no cadastro');
                    });
                }
                return response.json();
            })
            .then(result => {
                showToast('Cadastro realizado com sucesso!', 3000, true, 'success');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            })
            .catch(error => {
                showToast('Erro ao cadastrar : ' + error.message, 3000, true, 'error');	
            });
        } else {
            const firstError = document.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 14) value = value.substring(0, 14);

            value = value.replace(/(\d{2})(\d)/, '$1.$2')
                         .replace(/(\d{3})(\d)/, '$1.$2')
                         .replace(/(\d{3})(\d)/, '$1/$2')
                         .replace(/(\d{4})(\d)/, '$1-$2');
            e.target.value = value;
            validateField(e.target);
        });
    }
});
