const API_URL = 'http://localhost:3000/api/events';
const eventsContainer = document.getElementById("eventsContainer");
const searchInput = document.getElementById("search");
const dateInput = document.getElementById("data");
const orderSelect = document.getElementById("ordem");

let allEvents = [];

// Decodifica o token JWT para extrair dados do payload
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Verifica se o usuário está logado e redireciona para perfil
function goToProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Você precisa estar logado para acessar o perfil.");
    window.location.href = "/login.html";
    return;
  }
  window.location.href = "/profile.html";
}

// Buscar eventos ativos do backend
async function fetchActiveEvents() {
  const res = await fetch(API_URL);
  const events = await res.json();
  return events.filter(event => event.is_activated);
}

// Renderiza eventos (sem botão inscrever)
function renderActiveEvents(events) {
  eventsContainer.innerHTML = "";

  if (events.length === 0) {
    eventsContainer.innerHTML = "<p>Nenhum evento encontrado.</p>";
    return;
  }

  events.forEach(event => {
    const card = document.createElement("div");
    card.classList.add("event-card");

    const title = document.createElement("h2");
    title.classList.add("event-title");
    title.textContent = event.title;

    const date = document.createElement("p");
    date.classList.add("event-date");
    date.innerHTML = `<strong>Data:</strong> ${new Date(event.occasion_date).toLocaleDateString("pt-BR")}`;

    const location = document.createElement("p");
    location.classList.add("event-location");
    location.innerHTML = `<strong>Local:</strong> ${event.location}`;

    const description = document.createElement("p");
    description.classList.add("event-description");
    description.innerHTML = `<strong>Descrição:</strong> ${event.event_description}`;

    const commentsButton = document.createElement("button");
    commentsButton.classList.add("comments-button");
    commentsButton.innerHTML = `
        <svg fill="currentColor" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M8.35078106,18 L3.62469505,21.7808688 C2.9699317,22.3046795 2,21.8385062 2,21 L2,5 C2,3.34314575 3.34314575,2 5,2 L19,2 C20.6568542,2 22,3.34314575 22,5 L22,15 C22,16.6568542 20.6568542,18 19,18 L8.35078106,18 Z M4,18.9193752 L7.37530495,16.2191312 C7.552618,16.0772808 7.7729285,16 8,16 L19,16 C19.5522847,16 20,15.5522847 20,15 L20,5 C20,4.44771525 19.5522847,4 19,4 L5,4 C4.44771525,4 4,4.44771525 4,5 L4,18.9193752 Z"/>
        </svg>
    `;
    
    commentsButton.onclick = () => {
        window.location.href = `../views/comment.html?eventId=${event.id}`; 
    };

    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(location);
    card.appendChild(description);
    card.appendChild(commentsButton);

    eventsContainer.appendChild(card);
  });
}

// Busca o perfil do usuário logado (comum ou empresa) e atualiza nome no DOM
async function fetchAndDisplayUserName() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const payload = parseJwt(token);
  if (!payload || !payload.type) return;

  console.log('Tipo usuário:', payload.type);

  let url = '';

  if (payload.type === 'common_user') {
    url = 'http://localhost:3000/api/common-users/profile';
  } else if (payload.type === 'company') {
    url = 'http://localhost:3000/api/companies/profile';
  } else {
    return;
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar perfil');

    const data = await res.json();
    const userNameElem = document.getElementById('userName');
    if (userNameElem) {
      userNameElem.textContent = data.full_name || data.company_name || 'Usuário';
    }

  } catch (err) {
    console.error('Erro ao carregar nome do usuário:', err);
  }
}

function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedDate = dateInput.value;
  const selectedOrder = orderSelect.value;

  let filtered = [...allEvents];

  if (searchTerm) {
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedDate) {
    filtered = filtered.filter(event =>
      new Date(event.occasion_date).toISOString().split('T')[0] === selectedDate
    );
  }

  if (selectedOrder === 'asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (selectedOrder === 'desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  } else {
     filtered.sort((a, b) => {  
      const dateA = new Date(a.occasion_date);
      const dateB = new Date(b.occasion_date);
      
      // Adicione uma verificação para datas inválidas para evitar NaN
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        console.warn("Data inválida encontrada na ordenação:", a.occasion_date, b.occasion_date);
        return 0;
        } return dateA.getTime() - dateB.getTime();
     });
  }
  renderActiveEvents(filtered);
}

async function loadHomePageEvents() {
  allEvents = await fetchActiveEvents();
  applyFilters();
}

// Inicialização quando o DOM está pronto
document.addEventListener("DOMContentLoaded", () => {
  let informacoes = localStorage.getItem('token')
  const payload = parseJwt(informacoes);
  console.log('Payload do token:', payload);
  loadHomePageEvents();
  fetchAndDisplayUserName();
});

// Filtros em tempo real
searchInput.addEventListener("input", applyFilters);
dateInput.addEventListener("change", applyFilters);
orderSelect.addEventListener("change", applyFilters);

// Menu do perfil

function toggleMenu() {
  const dropdown = document.getElementById('profileDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', function (event) {
  const dropdown = document.getElementById('profileDropdown');
  const profileIcon = document.querySelector('.profile-icon');
  if (!dropdown.contains(event.target) && event.target !== profileIcon) {
    dropdown.style.display = 'none';
  }
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = '../views/login.html';
}
