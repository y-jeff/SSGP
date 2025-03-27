let saldo = 0;
let movimientos = [];
let idAEliminar = null;

const ingresoInput = document.getElementById("ingreso");
const nombreGastoInput = document.getElementById("nombreGasto");
const montoGastoInput = document.getElementById("montoGasto");
const saldoSpan = document.getElementById("saldo");
const listaMovimientos = document.getElementById("lista-movimientos");
const btnAgregar = document.querySelector(".btn-info");

// Cargar datos desde localStorage al iniciar
window.addEventListener("DOMContentLoaded", cargarDesdeLocalStorage);

btnAgregar.addEventListener("click", () => {
  const ingreso = parseFloat(ingresoInput.value);
  const nombreGasto = nombreGastoInput.value;
  const montoGasto = parseFloat(montoGastoInput.value);

  if (!isNaN(ingreso) && ingreso > 0) {
    saldo += ingreso;
    movimientos.push({
      tipo: "ingreso",
      descripcion: "Ingreso",
      monto: ingreso
    });
  }

  if (nombreGasto && !isNaN(montoGasto) && montoGasto > 0) {
    saldo -= montoGasto;
    movimientos.push({
      tipo: "gasto",
      descripcion: nombreGasto,
      monto: montoGasto
    });
  }

  ingresoInput.value = "";
  nombreGastoInput.value = "";
  montoGastoInput.value = "";

  renderizarMovimientos();
  guardarEnLocalStorage();
});

function renderizarMovimientos() {
  listaMovimientos.innerHTML = "";
  saldoSpan.textContent = `$${saldo}`;

  movimientos.forEach((mov, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";

    const tipoClase = mov.tipo === "ingreso" ? "text-success" : "text-danger";
    const simbolo = mov.tipo === "ingreso" ? "+" : "-";

    li.innerHTML = `
      ${mov.descripcion} <span class="${tipoClase}">${simbolo}$${mov.monto}</span>
      <button class="btn btn-sm btn-danger btn-eliminar" data-id="${index}" data-bs-toggle="modal" data-bs-target="#modalConfirmarEliminacion">
        🗑
      </button>
    `;

    listaMovimientos.appendChild(li);
  });
}

// Captura de ID al hacer clic en eliminar
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-eliminar") || e.target.closest(".btn-eliminar")) {
    const btn = e.target.closest(".btn-eliminar");
    idAEliminar = parseInt(btn.getAttribute("data-id"));
  }
});

// Confirmar eliminación
document.getElementById("btnConfirmarEliminar").addEventListener("click", function () {
  if (idAEliminar !== null) {
    const movimiento = movimientos[idAEliminar];
    saldo += movimiento.tipo === "gasto" ? movimiento.monto : -movimiento.monto;
    movimientos.splice(idAEliminar, 1);
    idAEliminar = null;
    renderizarMovimientos();
    guardarEnLocalStorage();

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalConfirmarEliminacion'));
    modal.hide();
  }
});

// Guardar en localStorage
function guardarEnLocalStorage() {
  localStorage.setItem("movimientos", JSON.stringify(movimientos));
  localStorage.setItem("saldo", saldo.toString());
}

// Cargar desde localStorage
function cargarDesdeLocalStorage() {
  const data = localStorage.getItem("movimientos");
  const saldoGuardado = localStorage.getItem("saldo");

  if (data) movimientos = JSON.parse(data);
  if (saldoGuardado) saldo = parseFloat(saldoGuardado);

  renderizarMovimientos();
}

// Exportar a CSV
function exportarCSV() {
  if (movimientos.length === 0) {
    alert("No hay movimientos para exportar.");
    return;
  }

  let csv = "Tipo,Descripción,Monto\n";
  movimientos.forEach(mov => {
    csv += `${mov.tipo},${mov.descripcion},${mov.monto}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "movimientos.csv";
  a.click();
  URL.revokeObjectURL(url);
}
function exportarExcel() {
    if (movimientos.length === 0) {
      alert("No hay movimientos para exportar.");
      return;
    }
  
    const data = movimientos.map(mov => ({
      Tipo: mov.tipo,
      Descripción: mov.descripcion,
      Monto: mov.monto
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Movimientos");
  
    XLSX.writeFile(workbook, "movimientos.xlsx");
  }


  