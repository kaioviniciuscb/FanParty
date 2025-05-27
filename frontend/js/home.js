const API_URL = 'http://localhost:3000/api/events';
const eventsContainer = document.getElementById("eventsContainer");
const searchInput = document.getElementById("search");
const dateInput = document.getElementById("data");
const orderSelect = document.getElementById("ordem");

let allEvents = [];

// Verifica se o usuário está logado
function goToProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Você precisa estar logado para acessar o perfil.");
    window.location.href = "/login.html";
    return;
  }
  window.location.href = "/profile.html";
}
// Função para buscar eventos ativos
async function fetchActiveEvents() {
  const res = await fetch(API_URL);
  const events = await res.json();
  return events.filter(event => event.is_activated);
}

// Renderiza os eventos filtrados
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

    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(location);
    card.appendChild(description);

    eventsContainer.appendChild(card);
  });
}

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

// Função para buscar perfil do usuário logado e atualizar nome no DOM
async function fetchAndDisplayUserName() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const payload = parseJwt(token);
  if (!payload || !payload.userType) return;

  let url = '';

  if (payload.userType === 'common') {
    url = 'http://localhost:3000/api/common-users/profile';
  } else if (payload.userType === 'company') {
    url = 'http://localhost:3000/api/companies/profile';
  } else {
    return; // Tipo de usuário desconhecido
  }

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar perfil');

    const data = await res.json();

    // Atualiza o nome na página
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

  // Filtrar por nome
  if (searchTerm) {
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(searchTerm)
    );
  }

  // Filtrar por data
  if (selectedDate) {
    filtered = filtered.filter(event =>
      new Date(event.occasion_date).toISOString().split('T')[0] === selectedDate
    );
  }

  // Ordenar
  if (selectedOrder === 'asc') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (selectedOrder === 'desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    // Default: data mais recente primeiro
    filtered.sort((a, b) => new Date(b.occasion_date) - new Date(a.occasion_date));
  }

  renderActiveEvents(filtered);
}

async function loadHomePageEvents() {
  allEvents = await fetchActiveEvents();
  applyFilters();
}

// Inicializa quando o DOM está carregado
document.addEventListener("DOMContentLoaded", () => {
  loadHomePageEvents();
  fetchAndDisplayUserName();
});

// Filtros ao digitar / mudar
searchInput.addEventListener("input", applyFilters);
dateInput.addEventListener("change", applyFilters);
orderSelect.addEventListener("change", applyFilters);

// Menu de perfil
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
}
