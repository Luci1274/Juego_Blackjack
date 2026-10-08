// =========================================================================
// 1. CLASES DEL JUEGO (MODELOS)
// =========================================================================

class Carta {
  constructor(palo, valor) {
    this.palo = palo;
    this.valor = valor;
  }

  obtenerPuntos() {
    if (this.valor === "A") {
      return 11;
    }
    if (["J", "Q", "K"].includes(this.valor)) {
      return 10;
    }
    return parseInt(this.valor);
  }

  descripcion() {
    return `${this.valor} de ${this.palo}`;
  }

  // Genera el nodo HTML de la carta
  crearElementoHTML(esOculta = false) {
    const cartaDiv = document.createElement("div");
    cartaDiv.classList.add("carta");

    if (esOculta) {
      cartaDiv.classList.add("oculta");
      cartaDiv.textContent = "";
      return cartaDiv;
    }

    if (this.palo === "Corazones" || this.palo === "Diamantes") {
      cartaDiv.classList.add("roja");
    } else {
      cartaDiv.classList.add("negra");
    }

    const valorSuperior = document.createElement("span");
    valorSuperior.classList.add("carta-valor", "top");
    valorSuperior.textContent = this.valor;

    const paloCentro = document.createElement("span");
    paloCentro.classList.add("carta-palo");
    paloCentro.textContent = this.obtenerSimboloPalo();

    const valorInferior = document.createElement("span");
    valorInferior.classList.add("carta-valor", "bottom");
    valorInferior.textContent = this.valor;

    cartaDiv.appendChild(valorSuperior);
    cartaDiv.appendChild(paloCentro);
    cartaDiv.appendChild(valorInferior);

    return cartaDiv;
  }

  obtenerSimboloPalo() {
    switch (this.palo) {
      case "Corazones": return "♥";
      case "Diamantes": return "♦";
      case "Tréboles":  return "♣";
      case "Picas":     return "♠";
      default:          return "";
    }
  }
}

class Mazo {
  constructor() {
    this.cartas = [];
    this.crearMazo();
  }

  crearMazo() {
    this.cartas = [];
    const palos = ["Corazones", "Diamantes", "Tréboles", "Picas"];
    const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    for (const palo of palos) {
      for (const valor of valores) {
        this.cartas.push(new Carta(palo, valor));
      }
    }
  }

  barajar() {
    for (let i = this.cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
    }
  }

  repartir() {
    if (this.cartas.length === 0) {
      this.crearMazo();
      this.barajar();
    }
    return this.cartas.pop();
  }

  cartasRestantes() {
    return this.cartas.length;
  }
}

class Jugador {
  constructor(nombre, fichasIniciales = 1000) {
    this.nombre = nombre;
    this.fichas = fichasIniciales;
    this.mano = [];
    this.apuestaActual = 0;
  }

  recibirCarta(carta) {
    this.mano.push(carta);
  }

  calcularPuntos() {
    let puntos = 0;
    let ases = 0;

    for (const carta of this.mano) {
      if (carta.valor === "A") {
        ases++;
      }
      puntos += carta.obtenerPuntos();
    }

    while (puntos > 21 && ases > 0) {
      puntos -= 10;
      ases--;
    }

    return puntos;
  }

  realizarApuesta(monto) {
    if (monto <= 0 || monto > this.fichas) return false;

    this.apuestaActual = monto;
    this.fichas -= monto;
    return true;
  }

  ganarApuesta(multiplicador = 2) {
    const ganancia = Math.floor(this.apuestaActual * multiplicador);
    this.fichas += ganancia;
    const premioNeto = ganancia - this.apuestaActual;
    this.apuestaActual = 0;
    return premioNeto;
  }

  empatarApuesta() {
    this.fichas += this.apuestaActual;
    this.apuestaActual = 0;
  }

  perderApuesta() {
    const perdida = this.apuestaActual;
    this.apuestaActual = 0;
    return perdida;
  }

  limpiarMano() {
    this.mano = [];
  }
}

class Crupier extends Jugador {
  constructor() {
    super("Crupier", 0);
  }

  debePedir() {
    return this.calcularPuntos() < 17;
  }

  calcularPuntosVisibles() {
    if (this.mano.length === 0) return 0;
    return this.mano[0].obtenerPuntos();
  }
}


// =========================================================================
// 2. VARIABLES DE ESTADO GLOBALES Y REFERENCIAS A LA INTERFAZ
// =========================================================================

let mazo;
let jugador;
let crupier;
let gananciaSesion = 0;

// Referencias del Cartel Emergente
let cartelEmergente;
let cartelTitulo;
let cartelMensaje;
let timerNotificacion;

// Objeto UI para almacenar elementos del DOM
const UI = {
  textoFichas: null,
  textoApuesta: null,
  textoGananciaSesion: null,
  puntosCrupier: null,
  cartasCrupier: null,
  puntosJugador: null,
  cartasJugador: null,
  tituloJugador: null,
  contenedorApuestas: null,
  inputApuesta: null,
  btnApostar: null,
  contenedorJuego: null,
  btnPedir: null,
  btnPlantarse: null,
  btnVerRanking: null,
  modalRanking: null,
  cuerpoTablaRanking: null,
  btnCerrarRanking: null
};


// =========================================================================
// 3. COMPONENTE DE NOTIFICACIONES Y CARTEL EMERGENTE
// =========================================================================

function crearCartelUI(contenedorPadre) {
  cartelEmergente = document.createElement("div");
  cartelEmergente.classList.add("cartel-emergente", "oculto");

  cartelTitulo = document.createElement("h3");
  cartelTitulo.classList.add("cartel-titulo");

  cartelMensaje = document.createElement("p");
  cartelMensaje.classList.add("cartel-mensaje");

  cartelEmergente.appendChild(cartelTitulo);
  cartelEmergente.appendChild(cartelMensaje);

  contenedorPadre.appendChild(cartelEmergente);
}

function limpiarBotonesCartel() {
  const contenedorBotones = cartelEmergente.querySelector(".cartel-acciones");
  if (contenedorBotones) {
    contenedorBotones.remove();
  }
}

function limpiarInputCartel() {
  const contenedorInput = cartelEmergente.querySelector(".cartel-input");
  if (contenedorInput) {
    contenedorInput.remove();
  }
}

function mostrarNotificacion(titulo, mensaje, tiempo = 3000) {
  clearTimeout(timerNotificacion);
  limpiarBotonesCartel();

  cartelTitulo.textContent = titulo;
  cartelMensaje.textContent = mensaje;
  cartelEmergente.classList.remove("oculto");

  if (tiempo > 0) {
    timerNotificacion = setTimeout(() => {
      ocultarNotificacion();
    }, tiempo);
  }
}

function ocultarNotificacion() {
  cartelEmergente.classList.add("oculto");
  limpiarBotonesCartel();
}

function mostrarReglasIniciales() {
  const textoReglas = 
    "• Objetivo: Sumar 21 o ganar al Crupier sin pasarte.\n" +
    "• Figuras (J, Q, K): Valen 10 pts | As: Vale 11 o 1.\n" +
    "• Pedir: Pides otra carta | Plantarse: Te quedas con tus puntos.\n" +
    "• Crupier: Pide cartas hasta sumar 17 o más.\n" +
    "• Pagos: Victoria 2x | Blackjack 2.5x.";

  mostrarNotificacion("🂠 Reglas Básicas", textoReglas, 6000);
}

function pedirNombre(titulo, mensaje) {
  return new Promise((resolve) => {
    clearTimeout(timerNotificacion);
    
    cartelTitulo.textContent = titulo;
    cartelMensaje.textContent = mensaje;
    
    const contenedorInput = document.createElement("div");
    contenedorInput.classList.add("cartel-input");

    const inputNombre = document.createElement("input");
    inputNombre.type = "text";
    inputNombre.name = "input-nombre";
    inputNombre.id = "input-nombre";
    inputNombre.required = true;
    inputNombre.placeholder = "EJ: Nacho";

    const botonAceptar = document.createElement("button");
    botonAceptar.classList.add("btn-accion", "confirmar");
    botonAceptar.textContent = "Confirmar";
    
    contenedorInput.appendChild(inputNombre);
    contenedorInput.appendChild(botonAceptar);
    cartelEmergente.appendChild(contenedorInput);
    
    cartelEmergente.classList.remove("oculto");
    
    inputNombre.focus()

    
    botonAceptar.onclick = () => {
      const nombreIngresado = inputNombre.value.trim();
      const nombreFinal = nombreIngresado !== "" ? nombreIngresado : "Jugador 1";
      
      ocultarNotificacion();
      resolve(nombreFinal);
      limpiarInputCartel();
    };
  }) 
}

function pedirConfirmacion(titulo, mensaje) {
  return new Promise((resolve) => {
    clearTimeout(timerNotificacion);
    limpiarBotonesCartel();

    cartelTitulo.textContent = titulo;
    cartelMensaje.textContent = mensaje;

    const contenedorBotones = document.createElement("div");
    contenedorBotones.classList.add("cartel-acciones");

    const btnConfirmar = document.createElement("button");
    btnConfirmar.id = "btn-confirmar-cartel";
    btnConfirmar.classList.add("btn-accion", "confirmar");
    btnConfirmar.textContent = "Reintentar";

    const btnCancelar = document.createElement("button");
    btnCancelar.id = "btn-cancelar-cartel";
    btnCancelar.classList.add("btn-accion", "borrar");
    btnCancelar.textContent = "Cambiar";

    contenedorBotones.appendChild(btnConfirmar);
    contenedorBotones.appendChild(btnCancelar);
    cartelEmergente.appendChild(contenedorBotones);

    cartelEmergente.classList.remove("oculto");

    btnConfirmar.onclick = () => {
      ocultarNotificacion();
      resolve(true);
    };

    btnCancelar.onclick = () => {
      ocultarNotificacion();
      resolve(false);
    };
  });
}

// =========================================================================
// 4. CONSTRUCCIÓN Y GENERACIÓN DEL DOM (ESTRUCTURA HTML)
// =========================================================================

function inicializarInterfaz(contenedorApp) {
  // 1. Encabezado (Header)
  const header = document.createElement("header");
  header.classList.add("header-juego");

  const titulo = document.createElement("h1");
  titulo.textContent = "♠ ♥ Blackjack 21 ♦ ♣";

  const panelEstadisticas = document.createElement("div");
  panelEstadisticas.classList.add("panel-estadisticas");

  UI.textoFichas = document.createElement("span");
  UI.textoFichas.classList.add("stat-item");
  UI.textoFichas.textContent = "Fichas: $1000";

  UI.textoApuesta = document.createElement("span");
  UI.textoApuesta.classList.add("stat-item");
  UI.textoApuesta.textContent = "Apuesta: $0";

  UI.textoGananciaSesion = document.createElement("span");
  UI.textoGananciaSesion.classList.add("stat-item", "destacado");
  UI.textoGananciaSesion.textContent = "Ganancia Sesión: $0";

  UI.btnVerRanking = document.createElement("button");
  UI.btnVerRanking.classList.add("btn-secundario");
  UI.btnVerRanking.textContent = "🏆 Ranking";

  panelEstadisticas.appendChild(UI.textoFichas);
  panelEstadisticas.appendChild(UI.textoApuesta);
  panelEstadisticas.appendChild(UI.textoGananciaSesion);
  panelEstadisticas.appendChild(UI.btnVerRanking);

  header.appendChild(titulo);
  header.appendChild(panelEstadisticas);

  // 2. Tablero de Juego (Mesa)
  const mesa = document.createElement("main");
  mesa.classList.add("mesa-juego");

  // Zona Crupier
  const zonaCrupier = document.createElement("section");
  zonaCrupier.classList.add("zona-tablero");

  const infoCrupier = document.createElement("div");
  infoCrupier.classList.add("info-zona");

  const tituloCrupier = document.createElement("h2");
  tituloCrupier.textContent = "Crupier";

  UI.puntosCrupier = document.createElement("span");
  UI.puntosCrupier.classList.add("badge-puntos");
  UI.puntosCrupier.textContent = "Puntos: ?";

  infoCrupier.appendChild(tituloCrupier);
  infoCrupier.appendChild(UI.puntosCrupier);

  UI.cartasCrupier = document.createElement("div");
  UI.cartasCrupier.classList.add("contenedor-cartas");

  zonaCrupier.appendChild(infoCrupier);
  zonaCrupier.appendChild(UI.cartasCrupier);

  // Zona Jugador
  const zonaJugador = document.createElement("section");
  zonaJugador.classList.add("zona-tablero");

  const infoJugador = document.createElement("div");
  infoJugador.classList.add("info-zona");

  const tituloJugador = document.createElement("h2");
  tituloJugador.textContent = "Jugador";

  UI.puntosJugador = document.createElement("span");
  UI.puntosJugador.classList.add("badge-puntos");
  UI.puntosJugador.textContent = "Puntos: 0";

  infoJugador.appendChild(tituloJugador);
  infoJugador.appendChild(UI.puntosJugador);

  UI.cartasJugador = document.createElement("div");
  UI.cartasJugador.classList.add("contenedor-cartas");

  zonaJugador.appendChild(infoJugador);
  zonaJugador.appendChild(UI.cartasJugador);

  mesa.appendChild(zonaCrupier);
  mesa.appendChild(zonaJugador);

  // 3. Panel de Controles
  const panelControles = document.createElement("footer");
  panelControles.classList.add("panel-controles");

  // Controles de Apuesta
  UI.contenedorApuestas = document.createElement("div");
  UI.contenedorApuestas.classList.add("grupo-controles");

  const labelApuesta = document.createElement("label");
  labelApuesta.textContent = "Monto a Apostar: $";

  UI.inputApuesta = document.createElement("input");
  UI.inputApuesta.type = "number";
  UI.inputApuesta.min = "10";
  UI.inputApuesta.step = "10";
  UI.inputApuesta.value = "50";
  UI.inputApuesta.classList.add("input-apuesta");

  UI.btnApostar = document.createElement("button");
  UI.btnApostar.classList.add("btn-principal");
  UI.btnApostar.textContent = "Repartir / Apostar";

  UI.contenedorApuestas.appendChild(labelApuesta);
  UI.contenedorApuestas.appendChild(UI.inputApuesta);
  UI.contenedorApuestas.appendChild(UI.btnApostar);

  // Controles de Jugada (Pedir / Plantarse)
  UI.contenedorJuego = document.createElement("div");
  UI.contenedorJuego.classList.add("grupo-controles", "oculto");

  UI.btnPedir = document.createElement("button");
  UI.btnPedir.classList.add("btn-accion", "btn-pedir");
  UI.btnPedir.textContent = "➕ Pedir Carta";

  if (UI.btnPedir.querySelector("button:disabled")) {
    UI.btnPedir.disabled = false;
    UI.btnPlantarse = false;
  }

  UI.btnPlantarse = document.createElement("button");
  UI.btnPlantarse.classList.add("btn-accion", "btn-plantar");
  UI.btnPlantarse.textContent = "✋ Plantarse";

  UI.contenedorJuego.appendChild(UI.btnPedir);
  UI.contenedorJuego.appendChild(UI.btnPlantarse);

  panelControles.appendChild(UI.contenedorApuestas);
  panelControles.appendChild(UI.contenedorJuego);

  // Modales y Notificaciones
  crearModalRanking(contenedorApp);
  crearCartelUI(contenedorApp);

  // Ensamblado final
  contenedorApp.appendChild(header);
  contenedorApp.appendChild(mesa);
  contenedorApp.appendChild(panelControles);
}

function crearModalRanking(contenedorPadre) {
  UI.modalRanking = document.createElement("div");
  UI.modalRanking.classList.add("modal-overlay", "oculto");

  const modalContenido = document.createElement("div");
  modalContenido.classList.add("modal-contenido");

  const tituloRanking = document.createElement("h2");
  tituloRanking.textContent = "🏆 Tabla de Mejores Puntajes";

  const tabla = document.createElement("table");
  tabla.classList.add("tabla-ranking");

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");

  ["Posición", "Jugador", "Ganancia Máxima", "Fecha"].forEach(texto => {
    const th = document.createElement("th");
    th.textContent = texto;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);

  UI.cuerpoTablaRanking = document.createElement("tbody");

  tabla.appendChild(thead);
  tabla.appendChild(UI.cuerpoTablaRanking);

  UI.btnCerrarRanking = document.createElement("button");
  UI.btnCerrarRanking.classList.add("btn-secundario");
  UI.btnCerrarRanking.textContent = "Cerrar";

  modalContenido.appendChild(tituloRanking);
  modalContenido.appendChild(tabla);
  modalContenido.appendChild(UI.btnCerrarRanking);

  UI.modalRanking.appendChild(modalContenido);
  contenedorPadre.appendChild(UI.modalRanking);
}


// =========================================================================
// 5. MÓDULO DE PERSISTENCIA Y RANKING (LOCALSTORAGE)
// =========================================================================

const CLAVE_LOCALSTORAGE = "blackjack_ranking_top";

function obtenerRanking() {
  const datos = localStorage.getItem(CLAVE_LOCALSTORAGE);
  return datos ? JSON.parse(datos) : [];
}

function registrarPuntaje(nombreJugador, gananciaTotal) {
  if (gananciaTotal <= 0) return;

  const ranking = obtenerRanking();
  const indiceExistente = ranking.findIndex(r => r.nombre.toLowerCase() === nombreJugador.toLowerCase());

  if (indiceExistente !== -1) {
    if (gananciaTotal > ranking[indiceExistente].puntuacion) {
      ranking[indiceExistente].puntuacion = gananciaTotal;
      ranking[indiceExistente].fecha = new Date().toLocaleDateString();
    }
  } else {
    ranking.push({
      nombre: nombreJugador,
      puntuacion: gananciaTotal,
      fecha: new Date().toLocaleDateString()
    });
  }

  ranking.sort((a, b) => b.puntuacion - a.puntuacion);
  const top5 = ranking.slice(0, 5);

  localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify(top5));
}

function actualizarTablaRankingUI() {
  UI.cuerpoTablaRanking.innerHTML = "";
  const ranking = obtenerRanking();

  if (ranking.length === 0) {
    const filaVacia = document.createElement("tr");
    const celdaVacia = document.createElement("td");
    celdaVacia.setAttribute("colspan", "4");
    celdaVacia.textContent = "Aún no hay puntajes registrados. ¡Sé el primero!";
    celdaVacia.style.textAlign = "center";
    filaVacia.appendChild(celdaVacia);
    UI.cuerpoTablaRanking.appendChild(filaVacia);
    return;
  }

  ranking.forEach((registro, index) => {
    const fila = document.createElement("tr");

    const tdPos = document.createElement("td");
    tdPos.textContent = `#${index + 1}`;

    const tdNombre = document.createElement("td");
    tdNombre.textContent = registro.nombre;

    const tdPuntos = document.createElement("td");
    tdPuntos.textContent = `$${registro.puntuacion}`;

    const tdFecha = document.createElement("td");
    tdFecha.textContent = registro.fecha;

    fila.appendChild(tdPos);
    fila.appendChild(tdNombre);
    fila.appendChild(tdPuntos);
    fila.appendChild(tdFecha);

    UI.cuerpoTablaRanking.appendChild(fila);
  });
}


// =========================================================================
// 6. LÓGICA Y CONTROLADOR DEL JUEGO
// =========================================================================

async function inicializarJuego() {
  mazo = new Mazo();
  mazo.barajar();

  const nombreJugador = await pedirNombre(
    "Bienvenido a Blackjack",
    "Por favor ingrese su nombre de jugador"
  );

  jugador = new Jugador(nombreJugador, 1000);
  crupier = new Crupier();

  UI.tituloJugador = document.querySelector(".zona-tablero:nth-child(2) h2");
  if (UI.tituloJugador) {
    UI.tituloJugador.textContent = jugador.nombre;
  }

  mostrarNotificacion(
    "Nombre registrado",
    "Nombre registrado con exito",
    3000);

  actualizarPantasEstadisticas();
  configurarEventosUI();
}

function actualizarPantasEstadisticas() {
  UI.textoFichas.textContent = `Fichas: $${jugador.fichas}`;
  UI.textoApuesta.textContent = `Apuesta: $${jugador.apuestaActual}`;
  UI.textoGananciaSesion.textContent = `Ganancia Sesión: $${gananciaSesion}`;
}

function procesarApuestaEIniciar() {
  const valorInput = UI.inputApuesta.value.trim();
  const monto = parseInt(valorInput);

  if (valorInput === "" || isNaN(monto)) {
    mostrarNotificacion("Error de Validación", "Por favor, ingresa un monto numérico válido.", 3000);
    return;
  }

  if (monto <= 0) {
    mostrarNotificacion("Apuesta Inválida", "La apuesta debe ser mayor a $0.", 3000);
    return;
  }

  if (monto > jugador.fichas) {
    mostrarNotificacion("Fichas Insuficientes", `No tienes suficientes fichas. Tu balance actual es $${jugador.fichas}.`, 3000);
    return;
  }

  jugador.realizarApuesta(monto);
  actualizarPantasEstadisticas();

  iniciarRonda();
}

function iniciarRonda() {
  jugador.limpiarMano();
  crupier.limpiarMano();
  UI.cartasJugador.innerHTML = "";
  UI.cartasCrupier.innerHTML = "";

  UI.contenedorApuestas.classList.add("oculto");
  UI.contenedorJuego.classList.remove("oculto");

  jugador.recibirCarta(mazo.repartir());
  crupier.recibirCarta(mazo.repartir());
  jugador.recibirCarta(mazo.repartir());
  crupier.recibirCarta(mazo.repartir());

  renderizarManoJugador();
  renderizarManoCrupier(true);

  // Dentro de la función iniciarRonda():
  if (jugador.calcularPuntos() === 21) {
    mostrarNotificacion("¡BLACKJACK!", "¡Sumaste 21 en la repartición inicial!", 2500);
    setTimeout(() => finalizarRonda("blackjack"), 1500);
  }
}

function renderizarManoJugador() {
  UI.cartasJugador.innerHTML = "";
  jugador.mano.forEach(carta => {
    UI.cartasJugador.appendChild(carta.crearElementoHTML(false));
  });
  UI.puntosJugador.textContent = `Puntos: ${jugador.calcularPuntos()}`;
}

function renderizarManoCrupier(ocultarSegunda = false) {
  UI.cartasCrupier.innerHTML = "";

  crupier.mano.forEach((carta, index) => {
    const esOculta = ocultarSegunda && index === 1;
    UI.cartasCrupier.appendChild(carta.crearElementoHTML(esOculta));
  });

  if (ocultarSegunda) {
    UI.puntosCrupier.textContent = `Puntos: ${crupier.calcularPuntosVisibles()} + ?`;
  } else {
    UI.puntosCrupier.textContent = `Puntos: ${crupier.calcularPuntos()}`;
  }
}

function configurarEventosUI() {
  // Botón de apostar
  UI.btnApostar.onclick = () => procesarApuestaEIniciar();

  // Botones de juego
  UI.btnPedir.onclick = () => pedirCarta();
  UI.btnPlantarse.onclick = () => plantarse();

  // Abrir y cerrar ranking
  UI.btnVerRanking.onclick = () => {
    actualizarTablaRankingUI();
    UI.modalRanking.classList.remove("oculto");
  };

  UI.btnCerrarRanking.onclick = () => {
    UI.modalRanking.classList.add("oculto");
  };
}

// Acción del botón "Pedir Carta"
function pedirCarta() {
  const nuevaCarta = mazo.repartir();
  jugador.recibirCarta(nuevaCarta);
  renderizarManoJugador();

  // Si el jugador se pasa de 21, pierde la mano inmediatamente
  if (jugador.calcularPuntos() > 21) {
    mostrarNotificacion("¡Te pasaste!", `Sumaste ${jugador.calcularPuntos()} puntos. Has perdido esta mano.`, 2500);
    setTimeout(() => finalizarRonda("se_paso"), 1500);
  }
}

// Acción del botón "Plantarse"
function plantarse() {
  // Deshabilitar botones durante el turno del crupier para evitar múltiples clics
  desactivarBotones();

  turnoCrupier();
}

// Lógica automatizada del Crupier
function turnoCrupier() {
  // Revelar la segunda carta que estaba oculta
  renderizarManoCrupier(false);

  // El Crupier debe pedir carta mientras tenga 16 o menos

  const intervaloCrupier = setInterval(() => {
    if (crupier.debePedir()) {
      crupier.recibirCarta(mazo.repartir());
      renderizarManoCrupier(false);
    } else {
      clearInterval(intervaloCrupier);
      evaluarGanador();
    }
  }, 800); // 800ms de intervalo entre carta y carta
}

// Compara las puntuaciones cuando el Crupier termina de jugar
function evaluarGanador() {
  desactivarBotones();
  const puntosJugador = jugador.calcularPuntos();
  const puntosCrupier = crupier.calcularPuntos();

  if (puntosCrupier > 21) {
    finalizarRonda("crupier_se_paso");
  } else if (puntosJugador > puntosCrupier) {
    finalizarRonda("gana_jugador");
  } else if (puntosCrupier > puntosJugador) {
    finalizarRonda("gana_crupier");
  } else {
    finalizarRonda("empate");
  }
}

// Maneja la resolución de la ronda, pagos, mensajes y actualización de estadísticas
function finalizarRonda(resultado) {
  let titulo = "";
  let mensaje = "";

  switch (resultado) {
    case "blackjack":
      const netoBJ = jugador.ganarApuesta(2.5); // Pago 3 a 2 (multiplicador 2.5x)
      gananciaSesion += netoBJ;
      titulo = " $$$ ¡BLACKJACK! $$$ ";
      mensaje = `¡Increíble! Ganaste $${netoBJ}.`;
      mostrarNotificacion(titulo, mensaje, 3000)
      break;

    case "se_paso":
      const perdidaP = jugador.perderApuesta();
      gananciaSesion -= perdidaP;
      titulo = "¡Te pasaste!";
      mensaje = `Superaste los 21 puntos. Perdiste $${perdidaP}.`;
      mostrarNotificacion(titulo, mensaje, 3000)
      break;

    case "crupier_se_paso":
      const netoCSP = jugador.ganarApuesta(2);
      gananciaSesion += netoCSP;
      titulo = "¡El Crupier se pasó!";
      mensaje = `El Crupier sumó ${crupier.calcularPuntos()} puntos. ¡Ganaste $${netoCSP}!`;
      mostrarNotificacion(titulo, mensaje, 3000)
      break;

    case "gana_jugador":
      const netoGana = jugador.ganarApuesta(2);
      gananciaSesion += netoGana;
      titulo = "¡Ganaste la mano!";
      mensaje = `${jugador.calcularPuntos()} pts vs ${crupier.calcularPuntos()} pts del Crupier. Ganaste $${netoGana}.`;
      mostrarNotificacion(titulo, mensaje, 3000)
      break;

    case "gana_crupier":
      const perdidaG = jugador.perderApuesta();
      gananciaSesion -= perdidaG;
      titulo = "Gana la Casa";
      mensaje = `El Crupier gana con ${crupier.calcularPuntos()} pts vs tus ${jugador.calcularPuntos()} pts. Perdiste $${perdidaG}.`;
      mostrarNotificacion(titulo, mensaje, 3000)
      break;

    case "empate":
      jugador.empatarApuesta();
      titulo = "Empate";
      mensaje = `Ambos tienen ${jugador.calcularPuntos()} puntos. Se te devuelve la apuesta.`;
      mostrarNotificacion(titulo, mensaje, 3000)
      break;
  }

  // Actualizar estadísticas visuales
  actualizarPantasEstadisticas();

  // Si hubo ganancia en la sesión, registrar/actualizar el récord en LocalStorage
  if (gananciaSesion > 0) {
    registrarPuntaje(jugador.nombre, gananciaSesion);
  }

  mostrarNotificacion(titulo, mensaje, 3500);
  // Verificar si el jugador se quedó sin fichas (Game Over)
  if (jugador.fichas <= 0) {
    setTimeout(() => {
      pedirConfirmacion("GAME OVER 💸", "Te has quedado sin fichas. ¿Quieres reiniciar con $1000 o quieres cambiar de sesion?").then((reinicio) => {
        if (reinicio) {
          gananciaSesion = 0;
          jugador.fichas = 1000;
          actualizarPantasEstadisticas();
          volverAInterfazApuestas();
        } else {
          gananciaSesion = 0;
          jugador.fichas = 1000;
          actualizarPantasEstadisticas();
          volverAInterfazApuestas();
          inicializarJuego();
        }
      });
    }, 3600);
  } else {
    // Retornar a la interfaz de apuestas para la siguiente mano
    volverAInterfazApuestas();}
}

function desactivarBotones() {
  UI.btnPedir.disabled = true;
  UI.btnPlantarse.disabled = true;
}

function activarBotones() {
// Volver a habilitar los botones para la siguiente ronda
  UI.btnPedir.disabled = false;
  UI.btnPlantarse.disabled = false;
}

function volverAInterfazApuestas() {
  UI.contenedorJuego.classList.add("oculto");
  UI.contenedorApuestas.classList.remove("oculto");
  activarBotones();
}

// =========================================================================
// 7. PUNTO DE ENTRADA (INICIALIZACIÓN)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const contenedorApp = document.getElementById("app");

  if (contenedorApp) {
    inicializarInterfaz(contenedorApp);
    mostrarReglasIniciales();
    inicializarJuego();
    console.log("¡Interfaz y lógica inicializadas correctamente!");
  } else {
    console.error("Error: No se encontró el elemento <div id='app'></div>.");
  }
});