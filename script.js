//######################################################################
// Clase Carta
class Carta {
    constructor(palo, valor) {
        this.palo = palo;
        this.valor = valor;
    }

    obtenerPuntos() {
        if (this.valor === "A") {
            return 11;
        }
        if (["J","Q","K"].includes(this.valor)) {
            return 10;
        }
        return parseInt(this.valor);
    }

    descripcion() {
        return `${this.valor} de ${this.palo}`;
    }

    crearElementos(esOculta = false) {
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
//######################################################################
// Clase Mazo
class Mazo {
  constructor() {
    this.cartas = [];
    this.crearMazo();
  }

  // Genera las 52 cartas
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

  // Algoritmo Fisher-Yates para barajar
  barajar() {
    for (let i = this.cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
    }
  }

  // Reparte (remueve y devuelve) la carta superior
  repartir() {
    if (this.cartas.length === 0) {
      this.crearMazo();
      this.barajar();
    }
    return this.cartas.pop();
  }

  // Devuelve la cantidad de cartas restantes
  cartasRestantes() {
    return this.cartas.length;
  }
}
//######################################################################
// Clase Jugador
class Jugador {
  constructor(nombre, fichasIniciales = 1000) {
    this.nombre = nombre;
    this.fichas = fichasIniciales;
    this.mano = [];
    this.apuestaActual = 0;
  }

  // Recibe una instancia de Carta y la guarda en su mano
  recibirCarta(carta) {
    this.mano.push(carta);
  }

  // Calcula el total de puntos ajustando los Ases dinámicamente
  calcularPuntos() {
    let puntos = 0;
    let ases = 0;

    for (const carta of this.mano) {
      if (carta.valor === "A") {
        ases++;
      }
      puntos += carta.obtenerPuntos();
    }

    // Si nos pasamos de 21 y tenemos Ases (que valen 11), les restamos 10 para que valgan 1
    while (puntos > 21 && ases > 0) {
      puntos -= 10;
      ases--;
    }

    return puntos;
  }

  // Realiza la apuesta si cuenta con las fichas suficientes
  realizarApuesta(monto) {
    if (monto <= 0) return false;
    if (monto > this.fichas) return false;

    this.apuestaActual = monto;
    this.fichas -= monto;
    return true;
  }

  // Se ejecuta al ganar la ronda (multiplicador 2 por defecto, 2.5 para Blackjack)
  ganarApuesta(multiplicador = 2) {
    const ganancia = Math.floor(this.apuestaActual * multiplicador);
    this.fichas += ganancia;
    const premioNeto = ganancia - this.apuestaActual;
    this.apuestaActual = 0;
    return premioNeto;
  }

  // Devuelve la apuesta en caso de empate (Push)
  empatarApuesta() {
    this.fichas += this.apuestaActual;
    this.apuestaActual = 0;
  }

  // Resetea la apuesta cuando se pierde la ronda
  perderApuesta() {
    const perdida = this.apuestaActual;
    this.apuestaActual = 0;
    return perdida;
  }

  // Vacía la mano para iniciar una nueva ronda
  limpiarMano() {
    this.mano = [];
  }
}

//######################################################################
// Clase Crupier
class Crupier extends Jugador {
  constructor() {
    super("Crupier", 0); // Nombre fijo, no requiere fichas
  }

  // Regla del casino: debe pedir carta mientras tenga 16 o menos
  debePedir() {
    return this.calcularPuntos() < 17;
  }

  // Calcula el puntaje considerando solo la primera carta visible
  // (mientras la segunda permanece boca abajo durante el turno del jugador)
  calcularPuntosVisibles() {
    if (this.mano.length === 0) return 0;
    
    // Si la primera carta es un As, vale 11
    return this.mano[0].obtenerPuntos();
  }
}
//######################################################################
// cartel emergente Variables globales
let cartelEmergente;
let cartelTitulo;
let cartelMensaje;
let timerNotificacion;


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

function pedirConfirmacion(titulo, mensaje) {
  return new Promise((resolve) => {
    clearTimeout(timerNotificacion);
    limpiarBotonesCartel();

    cartelTitulo.textContent = titulo;
    cartelMensaje.textContent = mensaje;

    // Creación de contenedor de acciones
    const contenedorBotones = document.createElement("div");
    contenedorBotones.classList.add("cartel-acciones");

    // Botón Confirmar
    const btnConfirmar = document.createElement("button");
    btnConfirmar.id = "btn-confirmar-cartel";
    btnConfirmar.classList.add("btn-accion");
    btnConfirmar.textContent = "Confirmar";

    // Botón Cancelar
    const btnCancelar = document.createElement("button");
    btnCancelar.id = "btn-cancelar-cartel";
    btnCancelar.classList.add("btn-accion", "borrar");
    btnCancelar.textContent = "Cancelar";


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

// ==========================================
// REFERENCIAS GLOBALES DE LA INTERFAZ (UI)
// ==========================================
const UI = {
  // Estadísticas del jugador
  textoFichas: null,
  textoApuesta: null,
  textoGananciaSesion: null,

  // Zona del Crupier
  puntosCrupier: null,
  cartasCrupier: null,

  // Zona del Jugador
  puntosJugador: null,
  cartasJugador: null,

  // Controles de Apuestas
  contenedorApuestas: null,
  inputApuesta: null,
  btnApostar: null,

  // Controles de Jugada
  contenedorJuego: null,
  btnPedir: null,
  btnPlantarse: null,

  // Ranking y Modales
  btnVerRanking: null,
  modalRanking: null,
  cuerpoTablaRanking: null,
  btnCerrarRanking: null
};

// ==========================================
// CREACIÓN DE LA ESTRUCTURA HTML DESDE JS
// ==========================================
function inicializarInterfaz(contenedorApp) {
  // 1. ENCABEZADO (HEADER)
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

  // 2. TABLERO DE JUEGO (MESA)
  const mesa = document.createElement("main");
  mesa.classList.add("mesa-juego");

  // --- Zona Crupier ---
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

  // --- Zona Jugador ---
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

  // 3. PANEL DE CONTROLES
  const panelControles = document.createElement("footer");
  panelControles.classList.add("panel-controles");

  // --- Controles de Apuesta ---
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

  // --- Controles de Jugada (Hit/Stand) ---
  UI.contenedorJuego = document.createElement("div");
  UI.contenedorJuego.classList.add("grupo-controles", "oculto"); // Oculto al inicio

  UI.btnPedir = document.createElement("button");
  UI.btnPedir.classList.add("btn-accion", "btn-pedir");
  UI.btnPedir.textContent = "➕ Pedir Carta";

  UI.btnPlantarse = document.createElement("button");
  UI.btnPlantarse.classList.add("btn-accion", "btn-plantar");
  UI.btnPlantarse.textContent = "✋ Plantarse";

  UI.contenedorJuego.appendChild(UI.btnPedir);
  UI.contenedorJuego.appendChild(UI.btnPlantarse);

  panelControles.appendChild(UI.contenedorApuestas);
  panelControles.appendChild(UI.contenedorJuego);

  // 4. CREAR MODAL DEL RANKING
  crearModalRanking(contenedorApp);

  // 5. CREAR CARTEL EMERGENTE (Notificaciones)
  crearCartelUI(contenedorApp);

  // ENSAMBLAR TODO DENTRO DE <div id="app"></div>
  contenedorApp.appendChild(header);
  contenedorApp.appendChild(mesa);
  contenedorApp.appendChild(panelControles);
}

// Sub-función para armar la ventana Modal del Ranking
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