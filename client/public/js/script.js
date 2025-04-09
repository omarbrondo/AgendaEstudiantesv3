// Variable global para saber si se está editando una materia
let editingMateriaId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadMaterias();

  const btnOpenForm = document.getElementById("btnOpenForm");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnAgregarEvento = document.getElementById("btnAgregarEvento");

  btnOpenForm.addEventListener("click", () => {
    openFormModal();
  });

  btnCancelar.addEventListener("click", () => {
    closeFormModal();
    // Si se cancela la edición, se reinicia la variable global
    editingMateriaId = null;
  });

  btnGuardar.addEventListener("click", () => {
    saveMateria();
  });

  btnAgregarEvento.addEventListener("click", () => {
    agregarEvento();
  });
});

function loadMaterias() {
  fetch("/materias")
    .then((res) => res.json())
    .then((data) => {
      renderMaterias(data);
    })
    .catch((err) => console.error(err));
}

function renderMaterias(materias) {
  const table = document.getElementById("materiasTable");
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  tbody.innerHTML = "";

  materias.forEach((materia) => {
    const nombre = materia.nombre || "N/A";
    const anioDeCarrera =
      materia.anioDeCarrera !== undefined && materia.anioDeCarrera !== null
        ? materia.anioDeCarrera
        : "N/A";
    const anio = materia.anio || "N/A";
    const horario = materia.horario || "N/A";
    const modalidad = materia.modalidad || "N/A";
    const correlativas =
      Array.isArray(materia.correlativas) &&
      materia.correlativas.length > 0 &&
      materia.correlativas[0] !== ""
        ? materia.correlativas.join(", ")
        : "N/A";
    const examenFecha = materia.examen || "N/A";
    const notasResumen = materia.notas
      ? `P1: ${
          materia.notas.parcial1 !== undefined && materia.notas.parcial1 !== null
            ? materia.notas.parcial1
            : "N/A"
        }, P2: ${
          materia.notas.parcial2 !== undefined && materia.notas.parcial2 !== null
            ? materia.notas.parcial2
            : "N/A"
        }, Final: ${
          materia.notas.final !== undefined && materia.notas.final !== null
            ? materia.notas.final
            : "N/A"
        }`
      : "N/A";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${anioDeCarrera}</td>
      <td>${anio}</td>
      <td>${horario}</td>
      <td>${modalidad}</td>
      <td>${correlativas}</td>
      <td>${examenFecha}</td>
      <td>${notasResumen}</td>
      <td>
        <button class="detalles" onclick="showDetails(${materia.id})">Detalles</button>
        <button class="editar" onclick="editMateria(${materia.id})">Editar</button>
        <button class="eliminar" onclick="deleteMateria(${materia.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openFormModal() {
  document.getElementById("form-modal").style.display = "flex";
}

function closeFormModal() {
  document.getElementById("form-modal").style.display = "none";
  clearForm();
  editingMateriaId = null;
}

function clearForm() {
  document.getElementById("materia").value = "";
  document.getElementById("anioDeCarrera").value = "";
  document.getElementById("anio").value = "";
  document.getElementById("modalidad").value = "Presencial";
  document.getElementById("correlativas").value = "";
  document.getElementById("dia").value = "Lunes";
  document.getElementById("horaInicio").value = "";
  document.getElementById("horaFin").value = "";
  document.getElementById("examen").value = "";
  document.getElementById("notaParcial1").value = "";
  document.getElementById("notaParcial2").value = "";
  document.getElementById("notaFinal").value = "";
  document.getElementById("eventos-container").innerHTML = `<h3>Eventos</h3>`;
}

function getMateriaFromForm() {
  const nombre = document.getElementById("materia").value;
  const anioDeCarrera = document.getElementById("anioDeCarrera").value;
  const anio = document.getElementById("anio").value;
  const modalidad = document.getElementById("modalidad").value;
  const correlativasStr = document.getElementById("correlativas").value;
  const correlativas = correlativasStr ? correlativasStr.split(",").map((s) => s.trim()) : [];

  const dia = document.getElementById("dia").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFin = document.getElementById("horaFin").value;
  const horario = dia && horaInicio && horaFin ? `${dia} ${horaInicio} - ${horaFin}` : "N/A";

  const examen = document.getElementById("examen").value;

  const notaParcial1 = document.getElementById("notaParcial1").value;
  const notaParcial2 = document.getElementById("notaParcial2").value;
  const notaFinal = document.getElementById("notaFinal").value;

  // Recolecta los eventos agregados dinámicamente
  const eventos = [];
  document.querySelectorAll(".evento").forEach((eventoDiv) => {
    const tipo = eventoDiv.querySelector(".tipo").value;
    const numero = parseInt(eventoDiv.querySelector(".numero").value);
    const temasAEstudiar = eventoDiv.querySelector(".temasAEstudiar").value;
    const estado = eventoDiv.querySelector(".estado").value;
    const fechaEntrega = eventoDiv.querySelector(".fechaEntrega").value;
    eventos.push({ tipo, numero, temasAEstudiar, estado, fechaEntrega });
  });

  return {
    nombre,
    anioDeCarrera: anioDeCarrera ? parseInt(anioDeCarrera) : null,
    anio,
    horario,
    modalidad,
    correlativas,
    examen,
    notas: {
      parcial1: notaParcial1 ? parseFloat(notaParcial1) : null,
      parcial2: notaParcial2 ? parseFloat(notaParcial2) : null,
      final: notaFinal ? parseFloat(notaFinal) : null,
    },
    eventos,
  };
}

function saveMateria() {
  const materiaData = getMateriaFromForm();

  if (!editingMateriaId) {
    // Creación de una nueva materia (POST)
    fetch("/materias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materiaData),
    })
      .then((response) => response.json())
      .then(() => {
        loadMaterias();
        closeFormModal();
      })
      .catch((err) => console.error(err));
  } else {
    // Edición de una materia existente (PUT)
    fetch(`/materias/${editingMateriaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materiaData),
    })
      .then((response) => response.json())
      .then(() => {
        loadMaterias();
        closeFormModal();
        editingMateriaId = null;
      })
      .catch((err) => console.error(err));
  }
}

function agregarEvento() {
  const eventosContainer = document.getElementById("eventos-container");
  const eventoDiv = document.createElement("div");
  eventoDiv.classList.add("evento");
  eventoDiv.innerHTML = `
    <label>Tipo: <input type="text" class="tipo" placeholder="Tipo de evento"></label>
    <label>Número: <input type="number" class="numero" placeholder="Número"></label>
    <label>Temas a Estudiar: <input type="text" class="temasAEstudiar" placeholder="Temas"></label>
    <label>Estado: <input type="text" class="estado" placeholder="Estado"></label>
    <label>Fecha de Entrega: <input type="date" class="fechaEntrega"></label>
    <button type="button" onclick="eliminarEvento(this)">Eliminar Evento</button>
  `;
  eventosContainer.appendChild(eventoDiv);
}

function eliminarEvento(button) {
  button.parentElement.remove();
}

function showDetails(id) {
  fetch(`/materias/${id}`)
    .then((res) => res.json())
    .then((materia) => {
      const detailsContent = document.getElementById("details-content");
      detailsContent.innerHTML = `
        <p><strong>Materia:</strong> ${materia.nombre || "N/A"}</p>
        <p><strong>Año de Carrera:</strong> ${materia.anioDeCarrera || "N/A"}</p>
        <p><strong>Año:</strong> ${materia.anio || "N/A"}</p>
        <p><strong>Horario:</strong> ${materia.horario || "N/A"}</p>
        <p><strong>Modalidad:</strong> ${materia.modalidad || "N/A"}</p>
        <p><strong>Correlativas:</strong> ${Array.isArray(materia.correlativas) ? materia.correlativas.join(", ") : "N/A"}</p>
        <p><strong>Fecha de Examen:</strong> ${materia.examen || "N/A"}</p>
        <p><strong>Notas:</strong> ${
          materia.notas
            ? `P1: ${materia.notas.parcial1}, P2: ${materia.notas.parcial2}, Final: ${materia.notas.final}`
            : "N/A"
        }</p>
        <p><strong>Eventos:</strong></p>
      `;
      if (materia.eventos && materia.eventos.length > 0) {
        materia.eventos.forEach((ev) => {
          detailsContent.innerHTML += `<p>${ev.tipo} ${ev.numero}: ${ev.temasAEstudiar} - ${ev.estado} (Entrega: ${ev.fechaEntrega})</p>`;
        });
      } else {
        detailsContent.innerHTML += `<p>N/A</p>`;
      }
      document.getElementById("details-modal").style.display = "flex";
    })
    .catch((err) => console.error(err));
}

function closeDetailsModal() {
  document.getElementById("details-modal").style.display = "none";
}

function editMateria(id) {
  // Se guarda el id en la variable global para saber que se edita
  editingMateriaId = id;
  // Se modifica el título del modal para indicar edición
  document.getElementById("modal-title").innerText = "Editar Registro";
  
  // Se obtiene la materia a editar y se precargan sus datos en el formulario
  fetch(`/materias/${id}`)
    .then((res) => res.json())
    .then((materia) => {
      document.getElementById("materia").value = materia.nombre || "";
      document.getElementById("anioDeCarrera").value = materia.anioDeCarrera || "";
      document.getElementById("anio").value = materia.anio || "";
      document.getElementById("modalidad").value = materia.modalidad || "Presencial";
      document.getElementById("correlativas").value = Array.isArray(materia.correlativas)
        ? materia.correlativas.join(", ")
        : "";
      
      // Procesa el campo "horario", que tiene formato "Día HH:MM - HH:MM"
      if (materia.horario && materia.horario !== "N/A") {
        const parts = materia.horario.split(" ");
        document.getElementById("dia").value = parts[0] || "Lunes";
        document.getElementById("horaInicio").value = parts[1] || "";
        document.getElementById("horaFin").value = parts[3] || "";
      } else {
        document.getElementById("dia").value = "Lunes";
        document.getElementById("horaInicio").value = "";
        document.getElementById("horaFin").value = "";
      }
      
      document.getElementById("examen").value = materia.examen || "";
      document.getElementById("notaParcial1").value = materia.notas && materia.notas.parcial1 ? materia.notas.parcial1 : "";
      document.getElementById("notaParcial2").value = materia.notas && materia.notas.parcial2 ? materia.notas.parcial2 : "";
      document.getElementById("notaFinal").value = materia.notas && materia.notas.final ? materia.notas.final : "";
      
      // Rellena el contenedor de eventos con la información existente
      const eventosContainer = document.getElementById("eventos-container");
      eventosContainer.innerHTML = `<h3>Eventos</h3>`;
      if (materia.eventos && materia.eventos.length > 0) {
        materia.eventos.forEach((ev) => {
          const eventoDiv = document.createElement("div");
          eventoDiv.classList.add("evento");
          eventoDiv.innerHTML = `
            <label>Tipo: <input type="text" class="tipo" value="${ev.tipo}" placeholder="Tipo de evento"></label>
            <label>Número: <input type="number" class="numero" value="${ev.numero}" placeholder="Número"></label>
            <label>Temas a Estudiar: <input type="text" class="temasAEstudiar" value="${ev.temasAEstudiar}" placeholder="Temas"></label>
            <label>Estado: <input type="text" class="estado" value="${ev.estado}" placeholder="Estado"></label>
            <label>Fecha de Entrega: <input type="date" class="fechaEntrega" value="${ev.fechaEntrega}" placeholder="Fecha"></label>
            <button type="button" onclick="eliminarEvento(this)">Eliminar Evento</button>
          `;
          eventosContainer.appendChild(eventoDiv);
        });
      }
      
      openFormModal();
    })
    .catch((err) => console.error(err));
}