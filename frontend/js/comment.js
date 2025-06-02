document.addEventListener('DOMContentLoaded', () => {
    const BASE_API_URL = 'http://localhost:3000/api'; 
    const COMMENTS_API_ENDPOINT = `${BASE_API_URL}/comments`;
    const COMMON_USERS_API_ENDPOINT = `${BASE_API_URL}/common-users`; 
    const COMPANIES_API_ENDPOINT = `${BASE_API_URL}/companies`;     
    const commentForm = document.getElementById('comment-form');
    const commentContentInput = document.getElementById('comment-content');
    const commentsList = document.getElementById('comments-list');
    const backHomeBtn = document.getElementById('backHomeBtn'); 
    const toastContainer = document.getElementById('toast-container');
    let loggedInUser = null; 

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Erro ao decodificar JWT:", e);
            return null;
        }
    }

    function getAuthToken() {
        return localStorage.getItem('token'); 
    }

    const token = getAuthToken();
    if (!token) {
        showToast('Você precisa estar logado para acessar os comentários deste evento. Redirecionando...', 'error');
        setTimeout(() => {
            window.location.href = '../views/login.html'; 
        }, 2000);
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const EVENT_ID = urlParams.get('eventId'); 
    if (!EVENT_ID) {
        showToast('Não foi possível identificar o evento. Você será redirecionado para a página inicial.', 'error');
        setTimeout(() => {
            window.location.href = '../views/home.html'; 
        }, 2000);
        return;
    }

    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainer) { 
            console.warn("Toast container not found. Cannot display toast.");
            return;
        }

        const toast = document.createElement('div');
        toast.classList.add('toast');
        if (type) {
            toast.classList.add('toast-' + type);
        }
        toast.textContent = message;

        toastContainer.appendChild(toast);

        void toast.offsetWidth; 
        toast.classList.add('show'); 

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true }); 
        }, duration);
    }
    // --- Cache para armazenar nomes de autores já buscados ---
    const authorNameCache = {}; 

    // --- Função para buscar o nome do autor ---
    async function fetchAuthorName(authorId, authorType) {
        const cacheKey = `${authorType}-${authorId}`;
        if (authorNameCache[cacheKey]) {
            return authorNameCache[cacheKey];
        }

        let url = '';
        const token = getAuthToken(); 
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        if (authorType === 'common_user') {
            url = `${COMMON_USERS_API_ENDPOINT}/${authorId}`;
        } else if (authorType === 'company') {
            url = `${COMPANIES_API_ENDPOINT}/${authorId}`;
        } else {
            return `Autor Desconhecido (ID: ${authorId})`;
        }

        try {
            const response = await fetch(url, { method: 'GET', headers: headers });

            if (!response.ok) {
                console.warn(`Falha ao buscar perfil para ${authorType} com ID ${authorId}:`, await response.json());
                throw new Error('Perfil não encontrado ou erro na API.');
            }

            const data = await response.json();
            const name = data.full_name || data.company_name || `ID: ${authorId}`;
            
            authorNameCache[cacheKey] = name;
            return name;

        } catch (error) {
            console.error(`Erro ao buscar nome para ${authorType} ${authorId}:`, error);
            return `Autor (ID: ${authorId})`;
        }
    }

    // --- Função para lidar com a submissão da edição de comentário ---
    async function submitEditedComment(commentId, newContent, commentItemElement) {
        if (newContent.trim() === '') {
            showToast('O comentário não pode ser vazio.', 'error'); // Usando toast
            return;
        }

        const token = getAuthToken();
        if (!token) {
            showToast('Você precisa estar logado para editar comentários!', 'error'); // Usando toast
            return;
        }

        try {
            const response = await fetch(`${COMMENTS_API_ENDPOINT}/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newContent.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao editar comentário.');
            }

            showToast('Comentário atualizado com sucesso!', 'success');
            fetchComments(); 
        } catch (error) {
            console.error('Erro ao editar comentário:', error);
            showToast(`Erro ao editar comentário: ${error.message}`, 'error');
            fetchComments(); 
        }
    }

    async function deleteComment(commentId) {
        if (!confirm('Tem certeza que deseja apagar este comentário?')) {
            return; 
        }

        const token = getAuthToken();
        if (!token) {
            showToast('Você precisa estar logado para apagar comentários!', 'error');
            return;
        }

        try {
            const response = await fetch(`${COMMENTS_API_ENDPOINT}/${commentId}/deactivate`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao apagar comentário.');
            }

            showToast('Comentário apagado com sucesso!', 'success');
            fetchComments(); 
        } catch (error) {
            console.error('Erro ao apagar comentário:', error);
            showToast(`Erro ao apagar comentário: ${error.message}`, 'error');
        }
    }

    // --- Função principal para buscar e exibir os comentários ---
    async function fetchComments() {
        try {
            const token = getAuthToken();
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`; 
            }

            const response = await fetch(`${COMMENTS_API_ENDPOINT}/event/${EVENT_ID}`, {
                method: 'GET',
                headers: headers 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao carregar comentários.');
            }

            let comments = await response.json(); 
            
            commentsList.innerHTML = ''; 

            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="no-comments">Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
                return;
            }

            if (token) {
                loggedInUser = parseJwt(token);
            } else {
                loggedInUser = null; 
            }

            const commentsWithAuthorNamesPromises = comments.map(async comment => {
                const authorName = await fetchAuthorName(comment.author_id, comment.author_type);
                return { ...comment, author_name: authorName };
            });

            comments = await Promise.all(commentsWithAuthorNamesPromises);

            comments.forEach(comment => {
                const commentItem = document.createElement('div');
                commentItem.classList.add('comment-item');
                commentItem.setAttribute('data-comment-id', comment.id); 

                const displayedAuthorName = comment.author_name || `Autor (ID: ${comment.author_id})`; 

                const commentDate = new Date(comment.created_at).toLocaleString('pt-BR', {
                    year: 'numeric', month: 'long', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit'
                });

                let actionsHtml = '';
                if (loggedInUser && 
                    loggedInUser.id === comment.author_id && 
                    loggedInUser.type === comment.author_type) {
                    
                    actionsHtml = `
                        <div class="comment-actions">
                            <button class="edit-comment-btn" data-comment-id="${comment.id}" data-current-content="${comment.content}">Editar</button>
                            <button class="delete-comment-btn" data-comment-id="${comment.id}">Apagar</button>
                        </div>
                    `;
                }

                commentItem.innerHTML = `
                    <strong>${displayedAuthorName}</strong>
                    <div class="comment-content-display">
                        <p>${comment.content}</p>
                    </div>
                    <div class="meta">
                        Publicado em: ${commentDate}
                        ${actionsHtml}
                    </div>
                `;
                commentsList.appendChild(commentItem); 
            });

            commentsList.querySelectorAll('.edit-comment-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const commentId = e.target.dataset.commentId;
                    const commentItemElement = e.target.closest('.comment-item'); 
                    const currentContent = e.target.dataset.currentContent;
                    
                    const contentDisplay = commentItemElement.querySelector('.comment-content-display');
                    const actions = commentItemElement.querySelector('.comment-actions');
                    if (contentDisplay) contentDisplay.style.display = 'none';
                    if (actions) actions.style.display = 'none';

                    const editArea = document.createElement('textarea');
                    editArea.classList.add('edit-comment-textarea');
                    editArea.value = currentContent;
                    editArea.rows = 4;

                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'Salvar';
                    saveBtn.classList.add('save-edit-btn');

                    const cancelBtn = document.createElement('button');
                    cancelBtn.textContent = 'Cancelar';
                    cancelBtn.classList.add('cancel-edit-btn');

                    const editControls = document.createElement('div');
                    editControls.classList.add('edit-controls');
                    editControls.appendChild(saveBtn);
                    editControls.appendChild(cancelBtn);

                    commentItemElement.querySelector('.meta').insertAdjacentElement('beforebegin', editArea);
                    commentItemElement.querySelector('.meta').insertAdjacentElement('beforebegin', editControls);

                    saveBtn.addEventListener('click', async () => {
                        await submitEditedComment(commentId, editArea.value, commentItemElement);
                    });

                    cancelBtn.addEventListener('click', () => {
                        editArea.remove();
                        editControls.remove();
                        if (contentDisplay) contentDisplay.style.display = '';
                        if (actions) actions.style.display = '';
                    });
                });
            });

            commentsList.querySelectorAll('.delete-comment-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const commentId = e.target.dataset.commentId;
                    deleteComment(commentId);
                });
            });

        } catch (error) {
            console.error('Erro ao carregar comentários:', error);
            showToast(`Erro ao carregar comentários: ${error.message}`, 'error');
            commentsList.innerHTML = `<p class="no-comments" style="color: red;">Erro ao carregar comentários: ${error.message}</p>`;
        }
    }

    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const content = commentContentInput.value.trim(); 

        if (!content) {
            showToast('Por favor, escreva algo no comentário.', 'error');
            return;
        }

        const token = getAuthToken();
        if (!token) {
            showToast('Você precisa estar logado para comentar! Por favor, faça login.', 'error');
            return;
        }

        const commentData = {
            content: content
        };

        try {
            const response = await fetch(`${COMMENTS_API_ENDPOINT}/new/${EVENT_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(commentData) 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao publicar comentário.');
            }

            const result = await response.json();
            showToast(result.message, 'success');
            commentContentInput.value = ''; 
            fetchComments(); 
        } catch (error) {
            console.error('Erro ao publicar comentário:', error);
            showToast(`Erro ao publicar comentário: ${error.message}`, 'error');
        }
    });

    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', () => {
            window.location.href = '../views/home.html'; 
        });
    }
    fetchComments();
});