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


//######################################################################
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