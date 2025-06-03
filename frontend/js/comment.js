document.addEventListener('DOMContentLoaded', () => {
    const BASE_API_URL = 'http://localhost:3000/api'; 
    const COMMENTS_API_ENDPOINT = `${BASE_API_URL}/comments`;
    const REVIEWS_API_ENDPOINT = `${BASE_API_URL}/reviews`;
    const COMMON_USERS_API_ENDPOINT = `${BASE_API_URL}/common-users`; 
    const COMPANIES_API_ENDPOINT = `${BASE_API_URL}/companies`; 
    const EVENTS_API_ENDPOINT = `${BASE_API_URL}/events`;
    
    const commentForm = document.getElementById('comment-form');
    const commentContentInput = document.getElementById('comment-content');
    const commentsList = document.getElementById('comments-list');
    const backHomeBtn = document.getElementById('backHomeBtn'); 
    const toastContainer = document.getElementById('toast-container'); 

    const averageRatingValueDisplay = document.getElementById('average-rating-value');
    const averageRatingStarsDisplay = document.getElementById('average-rating-stars');
    const totalReviewsCountDisplay = document.getElementById('total-reviews-count');
    const reviewForm = document.getElementById('review-form');
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    const submitReviewBtn = document.getElementById('submit-review-btn');
    const myReviewStatusMessage = document.getElementById('my-review-status');
    const reviewsList = document.getElementById('reviews-list');
    const reviewNotAllowedMessage = document.getElementById('review-not-allowed-message');

    let loggedInUser = null; 
    let hasUserReviewed = false; 
    let userReviewId = null;
    let userCurrentRating = 0;
    let userReviewIsActive = false;  

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
        showToast('Você precisa estar logado para acessar os comentários e avaliações deste evento. Redirecionando...', 'error');
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

    const authorNameCache = {}; 

    async function fetchAuthorName(authorId, authorType) {
        const cacheKey = `${authorType}-${authorId}`;
        if (authorNameCache[cacheKey]) {
            return authorNameCache[cacheKey];
        }

        let url = '';
        const currentToken = getAuthToken(); 
        const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};

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

    function renderStars(rating, maxRating = 5) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = (rating - fullStars) >= 0.5;

        for (let i = 1; i <= fullStars; i++) {
            starsHtml += '<span class="star-full">&#9733;</span>';
        }

        if (hasHalfStar && fullStars < maxRating) {
            starsHtml += '<span class="star-half">&#9733;</span>';
        }

        for (let i = (fullStars + (hasHalfStar ? 1 : 0)) + 1; i <= maxRating; i++) {
            starsHtml += '<span class="star-empty">&#9733;</span>';
        }

        return starsHtml;
    }

    async function fetchEventDetails(eventId) {
        try {
            const currentToken = getAuthToken();
            const headers = currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {};

            const response = await fetch(`${EVENTS_API_ENDPOINT}/${eventId}`, { method: 'GET', headers: headers });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro ao buscar detalhes do evento:', errorData);
                throw new Error(errorData.message || 'Falha ao carregar detalhes do evento.');
            }

            const eventDetails = await response.json();
            console.log('Detalhes do evento:', eventDetails);
            return eventDetails;
        } catch (error) {
            console.error('Erro ao buscar detalhes do evento:', error);
            showToast(`Erro ao carregar detalhes do evento: ${error.message}`, 'error');
            return null;
        }
    }

    async function submitEditedComment(commentId, newContent, commentItemElement) {
        if (newContent.trim() === '') {
            showToast('O comentário não pode ser vazio.', 'error'); 
            return;
        }

        const currentToken = getAuthToken();
        if (!currentToken) {
            showToast('Você precisa estar logado para editar comentários!', 'error'); 
            return;
        }

        try {
            const response = await fetch(`${COMMENTS_API_ENDPOINT}/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
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

        const currentToken = getAuthToken();
        if (!currentToken) {
            showToast('Você precisa estar logado para apagar comentários!', 'error'); 
            return;
        }

        try {
            const response = await fetch(`${COMMENTS_API_ENDPOINT}/${commentId}/deactivate`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentToken}`
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

    async function fetchComments() {
        try {
            const currentToken = getAuthToken(); 
            const headers = {};
            if (currentToken) {
                headers['Authorization'] = `Bearer ${currentToken}`; 
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

            if (currentToken) {
                loggedInUser = parseJwt(currentToken);
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

    async function fetchEventAverageRating() {
        try {
            const currentToken = getAuthToken();
            const headers = {};
            if (currentToken) {
                headers['Authorization'] = `Bearer ${currentToken}`; 
            }
            const response = await fetch(`${REVIEWS_API_ENDPOINT}/average/${EVENT_ID}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao buscar média de avaliações.');
            }

            const apiResponse = await response.json();
            
            const averageRating = parseFloat(apiResponse.average || 0).toFixed(1); 
            
            averageRatingValueDisplay.textContent = averageRating;
            averageRatingStarsDisplay.innerHTML = renderStars(parseFloat(averageRating));
            totalReviewsCountDisplay.textContent = `Média de avaliação dos usuários`; 

        } catch (error) {
            console.error('Erro ao carregar média de avaliações:', error);
            averageRatingValueDisplay.textContent = '--';
            averageRatingStarsDisplay.innerHTML = renderStars(0);
            totalReviewsCountDisplay.textContent = `Não foi possível carregar as avaliações`; 
            showToast(`Erro ao carregar média de avaliações: ${error.message}`, 'error');
        }
    }

    async function submitReview(rating) {
        console.log("SubmitReview: Iniciando submissão de avaliação.");
        if (!rating) {
            showToast('Por favor, selecione uma avaliação.', 'error');
            return;
        }

        const currentToken = getAuthToken();
        if (!currentToken) {
            showToast('Você precisa estar logado para avaliar!', 'error');
            return;
        }

        const reviewData = {
            rating: parseInt(rating),
            is_activated: true
        };

        let method;
        let url;

        if (hasUserReviewed) { 
            method = 'PUT';
            url = `${REVIEWS_API_ENDPOINT}/${userReviewId}`; 
            console.log(`SubmitReview: Usuário já tem avaliação (ID: ${userReviewId}). Tentando ATUALIZAR (PUT).`);
        } else { 
            method = 'POST';
            url = `${REVIEWS_API_ENDPOINT}/new/${EVENT_ID}`; 
            console.log(`SubmitReview: Usuário NÃO tem avaliação. Tentando CRIAR (POST).`);
        }
        console.log("SubmitReview: Dados a enviar:", reviewData);
        console.log("SubmitReview: Método e URL:", method, url);
        
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify(reviewData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("SubmitReview: Erro na resposta da API:", response.status, errorData);
                throw new Error(errorData.message || 'Falha ao enviar avaliação.');
            }

            const result = await response.json();
            console.log("SubmitReview: Resposta da API de submissão/atualização:", result);

            showToast(`Avaliação ${method === 'PUT' ? 'atualizada' : 'enviada'} com sucesso!`, 'success');
            
            console.log("SubmitReview: Chamando fetchEventAverageRating e fetchIndividualReviews para atualizar UI.");
            fetchEventAverageRating();
            fetchIndividualReviews();
            
        } catch (error) {
            console.error('SubmitReview: Erro final ao enviar avaliação:', error);
            showToast(`Erro ao enviar avaliação: ${error.message}`, 'error');
        }
    }

    async function deleteReview(reviewId) {
        console.log("DeleteReview: Iniciando desativação de avaliação com ID:", reviewId);
        if (!confirm('Tem certeza que deseja apagar esta avaliação? Ela será desativada.')) {
            console.log("DeleteReview: Desativação cancelada pelo usuário.");
            return;
        }

        const currentToken = getAuthToken();
        if (!currentToken) {
            showToast('Você precisa estar logado para apagar avaliações!', 'error');
            return;
        }

        try {
            const response = await fetch(`${REVIEWS_API_ENDPOINT}/${reviewId}/deactivate`, { 
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify({ is_activated: false }) 
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("DeleteReview: Erro na resposta da API:", response.status, errorData);
                throw new Error(errorData.message || 'Falha ao desativar avaliação.');
            }

            const result = await response.json();
            console.log("DeleteReview: Resposta da API de desativação:", result);

            showToast('Avaliação desativada com sucesso! Você pode reativá-la avaliando novamente.', 'success');

            console.log("DeleteReview: Chamando fetchEventAverageRating e fetchIndividualReviews para atualizar UI.");
            fetchEventAverageRating();
            fetchIndividualReviews(); 
            
        } catch (error) {
            console.error('DeleteReview: Erro final ao desativar avaliação:', error);
            showToast(`Erro ao desativar avaliação: ${error.message}`, 'error');
        }
    }

    async function fetchIndividualReviews() {
        console.log("Iniciando fetchIndividualReviews...");
        try {
            const currentToken = getAuthToken();
            const headers = {};
            if (currentToken) {
                headers['Authorization'] = `Bearer ${currentToken}`; 
            }
            const eventDetails = await fetchEventDetails(EVENT_ID);
            if (!eventDetails || !eventDetails.occasion_date) { 
                console.log("Detalhes do evento ou occasion_date ausentes. Ocultando formulário de avaliação.");
                reviewForm.classList.add('hidden');
                myReviewStatusMessage.classList.add('hidden-message');
                reviewNotAllowedMessage.classList.remove('hidden-message');
                reviewNotAllowedMessage.textContent = 'Não foi possível verificar a data do evento para avaliação.';
                return;
            }
            const eventEndDateStr = eventDetails.occasion_date.split('T')[0]; 
            const eventDateOnly = new Date(eventEndDateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            eventDateOnly.setHours(0, 0, 0, 0);

            console.log(`Data do Evento (apenas data): ${eventDateOnly.toISOString().split('T')[0]}`);
            console.log(`Data de Hoje (apenas data): ${today.toISOString().split('T')[0]}`);
            console.log(`Evento é futuro? (eventDateOnly > today): ${eventDateOnly > today}`);

            if (eventDateOnly > today) { 
                console.log("Evento ainda não terminou. Ocultando formulário de avaliação.");
                reviewForm.classList.add('hidden');
                myReviewStatusMessage.classList.add('hidden-message');
                reviewNotAllowedMessage.classList.remove('hidden-message');
                reviewNotAllowedMessage.textContent = `A avaliação estará disponível após o dia ${eventDateOnly.toLocaleDateString('pt-BR')}.`;
                return; 
            } else {
                 console.log("Evento já terminou ou é hoje. Exibindo formulário de avaliação (se aplicável).");
                 reviewNotAllowedMessage.classList.add('hidden-message'); 
            }
            console.log("Buscando avaliações individuais para o evento:", EVENT_ID);
            const reviewsResponse = await fetch(`${REVIEWS_API_ENDPOINT}/event/${EVENT_ID}`, {
                method: 'GET',
                headers: headers 
            });

            if (!reviewsResponse.ok) { 
                const errorData = await reviewsResponse.json();
                console.error("Erro na API de avaliações individuais:", errorData);
                throw new Error(errorData.message || 'Falha ao carregar avaliações individuais.');
            }

            let reviews = await reviewsResponse.json();
            console.log("Avaliações individuais recebidas:", reviews);
            reviewsList.innerHTML = ''; 
            hasUserReviewed = false;
            userReviewId = null;
            userCurrentRating = 0;
            userReviewIsActive = false;
            if (loggedInUser) {
                const userReview = reviews.find(review => 
                    review.reviewer_id === loggedInUser.id && 
                    review.reviewer_type === loggedInUser.type
                );
                
                if (userReview) {
                    hasUserReviewed = true;
                    userReviewId = userReview.id;
                    userCurrentRating = userReview.rating;
                    userReviewIsActive = userReview.is_activated;
                    console.log("Avaliação do usuário encontrada:", userReview);
                } else {
                    console.log("Usuário logado não tem avaliação para este evento (ativa ou desativada).");
                }
            } else {
                console.log("Nenhum usuário logado. Não buscando avaliação específica do usuário.");
            }
            if (hasUserReviewed) { 
                if (userReviewIsActive) {
                    console.log("Usuário tem avaliação ATIVA. Ocultando formulário de avaliação, mostrando apenas mensagem de status.");
                    reviewForm.classList.add('hidden');
                    myReviewStatusMessage.classList.remove('hidden-message');
                    myReviewStatusMessage.textContent = 'Você já avaliou este evento. Edite sua avaliação abaixo.';
                } else {
                    console.log("Usuário tem avaliação DESATIVADA. Exibindo formulário para reativação/edição.");
                    reviewForm.classList.remove('hidden');
                    myReviewStatusMessage.classList.remove('hidden-message');
                    myReviewStatusMessage.textContent = 'Sua avaliação anterior foi desativada. Reative-a ou edite-a abaixo.';

                    ratingInputs.forEach(radio => {
                        radio.checked = (parseInt(radio.value) === userCurrentRating);
                    });
                }
            } else { 
                console.log("Usuário não tem avaliação. Exibindo formulário para nova avaliação.");
                reviewForm.classList.remove('hidden');
                myReviewStatusMessage.classList.add('hidden-message');
                reviewForm.reset();
            }
            const activeReviewsToDisplay = reviews.filter(review => review.is_activated === true || review.is_activated === 1); 
            console.log("Avaliações ativas para exibir no feed:", activeReviewsToDisplay);

            if (activeReviewsToDisplay.length === 0) {
                reviewsList.innerHTML = '<p class="no-reviews">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>';
            } else {
                 const reviewsWithReviewerNamesPromises = activeReviewsToDisplay.map(async review => { 
                    const reviewerName = await fetchAuthorName(review.reviewer_id, review.reviewer_type);
                    return { ...review, reviewer_name: reviewerName };
                 });
                 const processedReviews = await Promise.all(reviewsWithReviewerNamesPromises);

                 processedReviews.forEach(review => {
                     const reviewItem = document.createElement('div');
                     reviewItem.classList.add('review-item');
                     reviewItem.setAttribute('data-review-id', review.id); 

                     const displayedReviewerName = review.reviewer_name || `Avaliador (ID: ${review.reviewer_id})`; 

                     const reviewDate = new Date(review.created_at).toLocaleString('pt-BR', {
                         year: 'numeric', month: 'long', day: 'numeric', 
                         hour: '2-digit', minute: '2-digit'
                     });

                     let actionsHtml = '';
                     if (loggedInUser && 
                         loggedInUser.id === review.reviewer_id && 
                         loggedInUser.type === review.reviewer_type &&
                         (review.is_activated === true || review.is_activated === 1)) { 
                         
                         actionsHtml = `
                             <div class="review-actions">
                                 <button class="edit-review-btn" data-review-id="${review.id}" data-current-rating="${review.rating}">Editar Avaliação</button>
                                 <button class="delete-review-btn" data-review-id="${review.id}">Apagar Avaliação</button>
                             </div>
                         `;
                     }

                     reviewItem.innerHTML = `
                         <strong>${displayedReviewerName}</strong>
                         <div class="rating-display">
                             ${renderStars(review.rating)}
                         </div>
                         <div class="meta">
                             Avaliado em: ${reviewDate}
                             ${actionsHtml}
                         </div>
                     `;
                     reviewsList.appendChild(reviewItem); 
                 });

                 reviewsList.querySelectorAll('.edit-review-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const reviewId = e.target.dataset.reviewId;
                        const currentRating = parseInt(e.target.dataset.currentRating);
                        
                        const newRating = parseInt(prompt(`Edite sua avaliação (1-5 estrelas):`, currentRating));
                        if (isNaN(newRating) || newRating < 1 || newRating > 5) {
                            if (newRating !== null) showToast('Avaliação inválida. Use um número entre 1 e 5.', 'error');
                            return;
                        }
                        await submitReview(newRating); 
                    });
                });

                reviewsList.querySelectorAll('.delete-review-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const reviewId = e.target.dataset.reviewId;
                        deleteReview(reviewId); 
                    });
                });
            }

        } catch (error) {
            console.error('Erro ao carregar avaliações individuais:', error);
            reviewsList.innerHTML = `<p class="no-reviews" style="color: red;">Erro ao carregar avaliações: ${error.message}</p>`;
            showToast(`Erro ao carregar avaliações: ${error.message}`, 'error');
        }
    }

    commentForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        const content = commentContentInput.value.trim(); 

        if (!content) {
            showToast('Por favor, escreva algo no comentário.', 'error'); 
            return;
        }

        const currentToken = getAuthToken();
        if (!currentToken) {
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
                    'Authorization': `Bearer ${currentToken}` 
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

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const selectedRating = document.querySelector('input[name="rating"]:checked');
        if (!selectedRating) {
            showToast('Por favor, selecione uma nota de 1 a 5 estrelas.', 'error');
            return;
        }
        submitReview(selectedRating.value);
    });

    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', () => {
            window.location.href = '../views/home.html'; 
        });
    }

    fetchEventAverageRating(); 
    fetchIndividualReviews();  
    fetchComments();           
});