const API_URL = 'http://localhost:3000/api/events';

// Elementos DOM
const showFormBtn = document.getElementById("showFormBtn");
const formSection = document.getElementById("formSection");
const eventForm = document.getElementById("eventForm");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");
const locationInput = document.getElementById("location");
const eventIdInput = document.getElementById("eventId");

const eventsContainer = document.getElementById("eventsContainer");

let editingEventId = null;

// Abrir formulário
showFormBtn.addEventListener("click", () => {
  formTitle.textContent = "Novo Evento";
  formSection.hidden = false;
  eventForm.reset();
  editingEventId = null;
});

// Cancelar
cancelBtn.addEventListener("click", () => {
  formSection.hidden = true;
  eventForm.reset();
  editingEventId = null;
});

// Envio do formulário
eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const eventData = {
    title: titleInput.value,
    event_description: descriptionInput.value,
    occasion_date: dateInput.value,
    location: locationInput.value
  };

  if (editingEventId) {
    await fetch(`${API_URL}/${editingEventId}`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    showToast("Evento alterado com sucesso!", 3000, false, 'success');

  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData)
    });
    showToast("Evento criado com sucesso!", 3000, false, 'success');
  }

  formSection.hidden = true;
  eventForm.reset();
  editingEventId = null;
  loadAndRenderEvents();
});

// Buscar e renderizar eventos
async function fetchEvents() {
  const res = await fetch(API_URL);
  return await res.json();
}

function renderEvents(events) {
  eventsContainer.innerHTML = "";

  // Ordenar eventos por data
  events.sort((a, b) => new Date(b.occasion_date) - new Date(a.occasion_date));

  events.forEach(event => {
    const card = document.createElement("div");
    card.classList.add("event-item");
    card.style.border = "1px solid #ccc";
    card.style.borderRadius = "5px";
    card.style.padding = "15px";
    card.style.marginBottom = "20px";
    card.style.backgroundColor = "#f9f9f9";

    const title = document.createElement("h3");
    title.textContent = event.title;

    const date = document.createElement("p");
    date.innerHTML = `<strong>Data:</strong> ${new Date(event.occasion_date).toLocaleDateString("pt-BR")}`;

    const location = document.createElement("p");
    location.innerHTML = `<strong>Local:</strong> ${event.location}`;

    const description = document.createElement("p");
    description.innerHTML = `<strong>Descrição:</strong> ${event.event_description}`;

    const status = document.createElement("p");
    status.innerHTML = `<strong>Status:</strong> ${event.is_activated ? "Ativo" : "Inativo"}`;

    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("button-group");
    buttonGroup.style.marginTop = "25px";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "Editar";
    editBtn.dataset.id = event.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "Excluir";
    deleteBtn.dataset.id = event.id;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn-toggle";
    toggleBtn.textContent = event.is_activated ? "Desativar" : "Ativar";
    toggleBtn.dataset.id = event.id;
    toggleBtn.dataset.action = event.is_activated ? "deactivate" : "activate";

    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(deleteBtn);
    buttonGroup.appendChild(toggleBtn);

    card.appendChild(title);
    card.appendChild(date);
    card.appendChild(location);
    card.appendChild(description);
    card.appendChild(status);
    card.appendChild(buttonGroup);

    eventsContainer.appendChild(card);
  });

  setupEventButtons();
}

function setupEventButtons() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const res = await fetch(`${API_URL}/${id}`);
      const event = await res.json();

      formTitle.textContent = "Editar Evento";
      formSection.hidden = false;

      eventIdInput.value = event.id;
      titleInput.value = event.title;
      descriptionInput.value = event.event_description;
      dateInput.value = event.occasion_date.slice(0, 16);
      locationInput.value = event.location;

      editingEventId = event.id;
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const confirmed = window.confirm("Tem certeza que deseja excluir este evento?");

      if (confirmed) {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        // Exibindo o toast após a exclusão
        showToast("Evento excluído com sucesso!", 3000, false, 'success');

        loadAndRenderEvents();
      } else {
        return;
      }
    });
  });

  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;

      const confirmMessage = action === "deactivate"
        ? "Tem certeza que deseja DESATIVAR este evento? Ele não será apagado, apenas ficará indisponível."
        : "Tem certeza que deseja ATIVAR este evento novamente?";

      const confirmed = window.confirm(confirmMessage);

      if (!confirmed) return;

      const method = action === 'activate' ? 'PATCH' : 'DELETE';
      await fetch(`${API_URL}/${id}`, { method });

      // Exibindo o toast após a ação
      const actionMessage = action === 'activate'
        ? "Evento ativado com sucesso!"
        : "Evento desativado com sucesso!";
      showToast(actionMessage, 3000, false, 'success');

      loadAndRenderEvents();
    });
  });
}

// Função para mostrar o Toast
function showToast(message, duration = 3000, showLoader = false, type = 'success') {
  const toast = document.getElementById('toastNotification');
  const messageEl = document.getElementById('toastMessage');
  const loader = document.getElementById('toastLoader');

  // Limpa classes antigas
  toast.classList.remove('toast-success', 'toast-error');

  // Adiciona classe correta de acordo com o tipo
  if (type === 'success') {
    toast.classList.add('toast-success');
  } else {
    toast.classList.add('toast-error');
  }

  // Define a mensagem
  messageEl.textContent = message;

  // Exibe ou esconde o loader
  loader.style.display = showLoader ? 'inline-block' : 'none';

  // Exibe o toast
  toast.classList.add('show');

  // Remove o toast após o tempo de duração
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Carregar e renderizar eventos ao carregar a página
async function loadAndRenderEvents() {
  const events = await fetchEvents();
  renderEvents(events);
}

// Inicializar
document.addEventListener("DOMContentLoaded", loadAndRenderEvents);
