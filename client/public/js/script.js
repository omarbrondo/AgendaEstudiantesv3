const API_URL = "http://localhost:3000/materias";
let currentEditId = null;

// Obtiene el valor de "horario" a partir del formulario
function getHorarioFromForm() {
  const dia = document.getElementById("dia").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFin = document.getElementById("horaFin").value;
  return `${dia} ${horaInicio} - ${horaFin}`;
}

// Obtiene los eventos ingresados en el formulario
function getEventosFromForm() {
  const eventos = [];
  document.querySelectorAll("#eventos-container .evento").forEach(div => {
    const tipo = div.querySelector(".evento-tipo").value;
    const numero = div.querySelector(".evento-numero").value;
    const temas = div.querySelector(".evento-temas").value;
    const estado = div.querySelector(".evento-estado").value;
    const fecha = div.querySelector(".evento-fecha").value;
    if (tipo && fecha) {
      eventos.push({
        tipo,
        numero: numero ? parseInt(numero) : null,
        temasAEstudiar: temas || "",
        estado,
        fechaEntrega: fecha
      });
    }
  });
  return eventos;
}

// Renderiza las materias en la tabla
function renderMaterias(materias) {
  const tbody = document.getElementById("materiasTable").querySelector("tbody");
  tbody.innerHTML = "";
  materias.forEach(materia => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${materia.nombre}</td>
      <td>${materia.horario.split(" ")[0]}</td>
      <td>${materia.horario}</td>
      <td>${(materia.eventos && materia.eventos.length > 0) ? materia.eventos[0].fechaEntrega : "N/A"}</td>
      <td>
        <button class="detalles" onclick="showDetails(${materia.id})">Detalles</button>
        <button class="editar" onclick="editMateria(${materia.id})">Editar</button>
        <button class="eliminar" onclick="deleteMateria(${materia.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Carga materias desde el API
function fetchMaterias() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => renderMaterias(data))
    .catch(err => console.error("Error fetching materias:", err));
}

// Limpia y resetea el formulario
function clearForm() {
  document.getElementById("materia").value = "";
  document.getElementById("dia").selectedIndex = 0;
  document.getElementById("horaInicio").value = "";
  document.getElementById("horaFin").value = "";
  document.getElementById("examen").value = "";
  currentEditId = null;
  document.getElementById("modal-title").textContent = "Nuevo Registro";
  // Reinicia el contenedor de eventos
  document.getElementById("eventos-container").innerHTML = "<h3>Eventos</h3>";
}

// Funciones para abrir y cerrar el formulario modal
function openFormModal() {
  document.getElementById("form-modal").style.display = "flex";
}
function closeFormModal() {
  document.getElementById("form-modal").style.display = "none";
  clearForm();
}

// Agrega una nueva materia
function addMateria() {
  const nuevaMateria = {
    nombre: document.getElementById("materia").value,
    horario: getHorarioFromForm(),
    eventos: getEventosFromForm()
  };
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevaMateria)
  })
  .then(() => {
    closeFormModal();
    fetchMaterias();
  })
  .catch(err => console.error("Error adding materia:", err));
}

// Actualiza una materia existente
function updateMateria() {
  const updatedMateria = {
    nombre: document.getElementById("materia").value,
    horario: getHorarioFromForm(),
    eventos: getEventosFromForm()
  };
  fetch(`${API_URL}/${currentEditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedMateria)
  })
  .then(() => {
    closeFormModal();
    fetchMaterias();
  })
  .catch(err => console.error("Error updating materia:", err));
}

// Manejador del botón Guardar
document.getElementById("btnGuardar").addEventListener("click", () => {
  if (currentEditId === null) {
    addMateria();
  } else {
    updateMateria();
  }
});

// Manejador del botón Cancelar
document.getElementById("btnCancelar").addEventListener("click", closeFormModal);

// Evento para el botón "Nuevo" en la pantalla principal
document.getElementById("btnOpenForm").addEventListener("click", () => {
  clearForm();
  openFormModal();
});

// Función para editar una materia
function editMateria(id) {
  currentEditId = id;
  fetch(`${API_URL}/${id}`)
    .then(response => {
      if (!response.ok) throw new Error("Materia no encontrada");
      return response.json();
    })
    .then(materia => {
      document.getElementById("materia").value = materia.nombre;
      let partes = materia.horario.split(" ");
      let dia = partes[0];
      let times = partes.slice(1).join(" ").split(" - ");
      let horaInicio = times[0];
      let horaFin = times[1];
      document.getElementById("dia").value = dia;
      document.getElementById("horaInicio").value = horaInicio;
      document.getElementById("horaFin").value = horaFin;
      // Reinicializamos el contenedor de eventos
      const eventosContainer = document.getElementById("eventos-container");
      eventosContainer.innerHTML = "<h3>Eventos</h3>";
      if (materia.eventos && materia.eventos.length > 0) {
        materia.eventos.forEach(ev => {
          agregarEventoHTML(ev);
        });
      }
      // Si se desea, se puede poner el campo "examen" – aquí se deja vacío u opcional
      document.getElementById("examen").value = "";
      document.getElementById("modal-title").textContent = "Editar Registro";
      openFormModal();
    })
    .catch(err => console.error("Error fetching materia for edit:", err));
}

// Función para eliminar una materia
function deleteMateria(id) {
  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => fetchMaterias())
    .catch(err => console.error("Error deleting materia:", err));
}

// Función para agregar un bloque de evento al contenedor de eventos
function agregarEventoHTML(evento = {}) {
  const container = document.getElementById("eventos-container");
  const div = document.createElement("div");
  div.classList.add("evento");
  div.innerHTML = `
    <label>Tipo de Evento:</label>
    <select class="evento-tipo">
      <option value="Parcial" ${evento.tipo === "Parcial" ? "selected" : ""}>Parcial</option>
      <option value="Trabajo Práctico" ${evento.tipo === "Trabajo Práctico" ? "selected" : ""}>Trabajo Práctico</option>
      <option value="Examen Final" ${evento.tipo === "Examen Final" ? "selected" : ""}>Examen Final</option>
    </select>
    <label>Número:</label>
    <input type="number" class="evento-numero" placeholder="Número" value="${evento.numero ? evento.numero : ""}">
    <label>Temas a Estudiar:</label>
    <input type="text" class="evento-temas" placeholder="Temas" value="${evento.temasAEstudiar ? evento.temasAEstudiar : ""}">
    <label>Estado:</label>
    <select class="evento-estado">
      <option value="Pendiente" ${evento.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
      <option value="En curso" ${evento.estado === "En curso" ? "selected" : ""}>En curso</option>
      <option value="Finalizado" ${evento.estado === "Finalizado" ? "selected" : ""}>Finalizado</option>
    </select>
    <label>Fecha de Entrega:</label>
    <input type="date" class="evento-fecha" value="${evento.fechaEntrega ? evento.fechaEntrega : ""}">
    <button type="button" onclick="eliminarEvento(this)">Eliminar Evento</button>
  `;
  container.appendChild(div);
}

// Manejador para el botón "Agregar Evento"
document.getElementById("btnAgregarEvento").addEventListener("click", function() {
  agregarEventoHTML();
});

// Función para eliminar un bloque de evento
function eliminarEvento(btn) {
  btn.parentElement.remove();
}

// Función para mostrar detalles en un modal bonito
function showDetails(id) {
  fetch(`${API_URL}/${id}`)
    .then(response => {
      if (!response.ok) throw new Error("Materia no encontrada");
      return response.json();
    })
    .then(materia => {
      let detallesHtml = `<p><strong>Materia:</strong> ${materia.nombre}</p>`;
      detallesHtml += `<p><strong>Horario:</strong> ${materia.horario}</p>`;
      if (materia.eventos && materia.eventos.length > 0) {
        detallesHtml += "<h3>Eventos</h3>";
        materia.eventos.forEach(ev => {
          detallesHtml += `<p><strong>Tipo:</strong> ${ev.tipo} | <strong>Número:</strong> ${ev.numero || "-"} | <strong>Temas:</strong> ${ev.temasAEstudiar || "-"} | <strong>Estado:</strong> ${ev.estado} | <strong>Fecha de Entrega:</strong> ${ev.fechaEntrega}</p>`;
        });
      }
      document.getElementById("details-content").innerHTML = detallesHtml;
      document.getElementById("details-modal").style.display = "flex";
    })
    .catch(err => console.error("Error fetching materia details:", err));
}

// Función para cerrar el modal de detalles
function closeDetailsModal() {
  document.getElementById("details-modal").style.display = "none";
}

// Inicialización: carga las materias al inicio
fetchMaterias();