const eventsContainer = document.getElementById("eventsContainer");
const showFormBtn = document.getElementById("showFormBtn");
const formSection = document.getElementById("formSection");
const cancelBtn = document.getElementById("cancelBtn");
const eventForm = document.getElementById("eventForm");
const backHomeBtn = document.getElementById("backHomeBtn");
const formTitle = document.getElementById("formTitle");

let editingEventId = null;
let token = null;

const accountType = localStorage.getItem("accountType");
const userType = accountType === "company" ? "companies" : "common-users";

function init() {
  token = localStorage.getItem("token");
  if (!token) {
    showToast("Você precisa estar logado para acessar esta página.", 'error');
    window.location.href = "/login.html";
    return null;
  }
  return token;
}

// Mostrar formulário
showFormBtn.addEventListener("click", () => {
  formSection.hidden = false;
  eventForm.reset();
  editingEventId = null;
  formTitle.textContent = "Novo Evento";
});

// Cancelar formulário
cancelBtn.addEventListener("click", () => {
  formSection.hidden = true;
  eventForm.reset();
  editingEventId = null;
  showFormBtn.disabled = false;
  formTitle.textContent = "Novo Evento";
});

// Submeter (criar ou editar)
eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventData = {
    title: document.getElementById("title").value,
    event_description: document.getElementById("description").value,
    occasion_date: document.getElementById("date").value,
    location: document.getElementById("location").value
  };

  try {
    let response;

    if (editingEventId) {
      // Atualizar evento
      response = await fetch(`/api/events/${editingEventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error("Erro ao atualizar evento");
    } else {
      // Criar evento
      response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error("Erro ao criar evento");

      const createdEvent = await response.json();
      const eventId = createdEvent.event?.id || createdEvent.event?._id;

      // Associar evento ao usuário ou empresa
      const associateResponse = await fetch(`/api/${userType}/events/own/${eventId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!associateResponse.ok) throw new Error("Erro ao associar evento");
    }

    showToast(editingEventId ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!", 'success');
    formSection.hidden = true;
    eventForm.reset();
    editingEventId = null;
    showFormBtn.disabled = false;
    formTitle.textContent = "Novo Evento";
    loadEvents();
  } catch (error) {
    console.error(error);
    showToast("Erro ao salvar evento", 'error');
  }
});

// Carregar eventos do usuário ou empresa autenticado
async function loadEvents() {
  try {
    const response = await fetch(`/api/${userType}/events/my-events`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Erro ao buscar eventos");

    const events = await response.json();
    renderEvents(events);
  } catch (error) {
    console.error(error);
    eventsContainer.textContent = "Erro ao carregar eventos.";
  }
}

// Renderizar eventos
function renderEvents(events) {
  eventsContainer.innerHTML = "";

  if (events.length === 0) {
    eventsContainer.textContent = "Você ainda não criou nenhum evento.";
    return;
  }

  events.sort((a, b) => new Date(b.occasion_date) - new Date(a.occasion_date));

  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";

    card.innerHTML = `
      <h3>${event.title}</h3>
      <p><strong>Data:</strong> ${new Date(event.occasion_date).toLocaleDateString("pt-BR")}</p>
      <p><strong>Local:</strong> ${event.location}</p>
      <p><strong>Descrição:</strong> ${event.event_description}</p>
      <p><strong>Status:</strong> ${event.is_activated ? "Ativo" : "Inativo"}</p>
      <div class="button-group">
        <button class="btn-edit" data-id="${event.id}">Editar</button>
        <button class="btn-delete" data-id="${event.id}">Excluir</button>
      </div>
    `;

    eventsContainer.appendChild(card);
  });

  // Atribuir eventos dos botões editar/excluir
  eventsContainer.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      editEvent(id);
    });
  });

  eventsContainer.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      deleteEvent(id);
    });
  });
}

// Editar evento
async function editEvent(id) {
  try {
    const response = await fetch(`/api/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Erro ao carregar evento para edição");

    const event = await response.json();

    document.getElementById("title").value = event.title;
    document.getElementById("description").value = event.event_description;
    document.getElementById("date").value = event.occasion_date.split('T')[0];
    document.getElementById("location").value = event.location;

    editingEventId = id;
    formSection.hidden = false;
    showFormBtn.disabled = true;
    formTitle.textContent = "Editar Evento";
  } catch (error) {
    console.error(error);
    showToast("Erro ao carregar evento para edição", 'error');
  }
}

// Excluir evento
async function deleteEvent(id) {
  const confirmed = window.confirm("Tem certeza que deseja excluir este evento?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Erro ao excluir evento");

    showToast("Evento excluído com sucesso!", 'success');
    loadEvents();
  } catch (error) {
    console.error(error);
    showToast("Erro ao excluir evento", 'error');
  }
}

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

    // Adiciona a classe de tipo de acordo com o parâmetro 'type'
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

// Botão voltar
backHomeBtn.addEventListener("click", () => {
  window.location.href = "../views/home.html";
});

// Inicializar app
document.addEventListener("DOMContentLoaded", () => {
  init();
  if (!token) return;
  loadEvents();
});
