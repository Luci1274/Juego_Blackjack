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
