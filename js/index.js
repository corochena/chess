var timeWhite = 0;
var timeBlack = 0;
var playWhite = true;

var moves = [];

var audio = new Audio("tick.wav");
var tablero = [];
var origin, destiny, currPiece;

var timer = setInterval(function() {
  if (playWhite) timeWhite++;
  else timeBlack++;
  document.getElementById("timeWhite").innerHTML = hms(timeWhite / 10);
  document.getElementById("timeBlack").innerHTML = hms(timeBlack / 10);
}, 100);

iniciarTablero();
piezasTabla(tablero);
eventListeners();
printLog(moves);

function hms(seg) {
  // devuelve una cadena con formato 0h:00m:00s.0
  var h = Math.floor(seg / 3600);
  var m = Math.floor((seg - h * 3600) / 60);
  var s = (seg - h * 3600 - m * 60).toFixed(1);
  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;
  return h + ":" + m + ":" + s;
}

function iniciarTablero() {
  // crea un arreglo de dos dimensiones y lo llena con objetos piezas retornados por la funcion piece
  for (var i = 0; i < 8; i++) {
    tablero[i] = [];
    for (var j = 0; j < 8; j++) {
      tablero[i].push(piece(i, j));
    }
  }
}

function piece(i, j) {
  // devuelve un objeto pieza y color segun el orden de las piezas del ajedrez
  var pz, color;
  if (i < 2) color = "black";
  else if (i > 5) color = "white";
  else return null;

  if (i == 0 || i == 7) {
    switch (j) {
      case 0:
      case 7:
        pz = "R";
        break;
      case 1:
      case 6:
        pz = "N";
        break;
      case 2:
      case 5:
        pz = "B";
        break;
      case 4:
        pz = "K";
        break;
      case 3:
        pz = "Q";
        break;
    }
  } else pz = "P";
  return { letter: pz, color: color };
}

function piezasTabla(array) {
  // crea una cadena html <table> y le agrega clases que representan si la casilla es blanca o negra
  // y si tiene o no tiene una pieza segun el contenido del arreglo, ademas le agrega una clase
  // js-casilla y un id para que respondan a eventos de mouse

  var html = "<table>";

  for (var i = 0; i < 8; i++) {
    html += "<tr>";
    for (var j = 0; j < 8; j++) {
      var clss = (i + j) % 2 == 0 ? "cell-white" : "cell-black";
      html += "<td id='" + i + j + "' class='js-casilla " + clss;
      if (array[i][j] != null) {
        html +=
          " pz-" +
          array[i][j].color +
          "' data-id='" +
          array[i][j].letter +
          array[i][j].color +
          "'>" +
          letterGlyph(array[i][j].letter);
      } else html += "'>";
      html += "</td>";
    }
    html += "</tr>";
  }
  html += "</table>";

  document.getElementById("content").innerHTML = html;
}

function pieceUnicode(piece) {
  // devuelve el codigo decimal unicode de la pieza segun su letra y color
  switch (piece.letter) {
    case "K":
      return piece.color == "white" ? "&#9812;" : "&#9818;";
      break;
    case "Q":
      return piece.color == "white" ? "&#9813;" : "&#9819;";
      break;
    case "R":
      return piece.color == "white" ? "&#9814;" : "&#9820;";
      break;
    case "B":
      return piece.color == "white" ? "&#9815;" : "&#9821;";
      break;
    case "N":
      return piece.color == "white" ? "&#9816;" : "&#9822;";
      break;
    case "P":
      return piece.color == "white" ? "&#9817;" : "&#9823;";
      break;
  }
}

function letterGlyph(letter) {
  switch (letter) {
    case "R":
      return "<span class='glyphicon glyphicon-tower'></span>";
    case "N":
      return "<span class='glyphicon glyphicon-knight'></span>";
    case "B":
      return "<span class='glyphicon glyphicon-bishop'></span>";
    case "Q":
      return "<span class='glyphicon glyphicon-queen'></span>";
    case "K":
      return "<span class='glyphicon glyphicon-king'></span>";
    case "P":
      return "<span class='glyphicon glyphicon-pawn'></span>";
  }
}

function movePiece() {
  // quita la pieza de la posicion origin, en la posicion destiny pone la pieza currPiece
  // rehace el tablero de ajedrez con las posiciones actualizadas y establece nuevamente los event listeners
  // guarda la movida en el arreglo moves y lo imprime en el textarea log
  tablero[origin[0]][origin[1]] = null;
  tablero[destiny[0]][destiny[1]] = currPiece;
  piezasTabla(tablero);
  audio.play();
  // si es enroque el jugador debe mover su torre (no hay cambio de turno)
  var currMove = { origin: origin, destiny: destiny, piece: currPiece };
  //(Math.abs(destiny[1] - origin[1]) == 2) && (currPiece.letter == 'K')
  if (!esEnroque(currMove)) playWhite = !playWhite;
  //console.log(currMove);
  moves.push(currMove);
  printLog(moves);
  eventListeners();
}

function esEnroque(move) {
  if (move.piece.letter == "K") {
    if (move.origin[1] - move.destiny[1] == 2) {
      return [true, "0-0-0"];
    } else if (move.origin[1] - move.destiny[1] == -2) {
      return [true, "0-0"];
    } else return false;
  } else return false;
}

function printLog(moves) {
  // cada elemento del arreglo moves es un objeto {origin: 43, destiny: 62, piece: {letter: 'K', color:'white'}}
  // imprime el numero de cada jugada (blancas y negras), convierte la posicion de la pieza a notacion algebraica
  // si es enroque imprime 0-0 o 0-0-0
  var log = "";
  var lineNum = 1;
  for (var i = 0; i < moves.length; i++) {
    if (i > 0) {
      if (esEnroque(moves[i - 1])[0]) continue;
    }
    if (lineNum == Math.floor(lineNum)) {
      if (lineNum < 10) log += " ";
      log += lineNum + ". ";
    }
    // si es enroque imprime 0-0 o 0-0-0
    var enroque = esEnroque(moves[i]);
    if (enroque[0]) {
      log += enroque[1];
    } else {
      log += pieceUnicode(moves[i].piece);
      log += String.fromCharCode(Number(moves[i].destiny[1]) + 97);
      log += 8 - Number(moves[i].destiny[0]);
    }

    log += "  ";
    if (lineNum != Math.floor(lineNum)) log += "\r\n";
    lineNum += 0.5;
  }
  document.getElementById("log").innerHTML = log;
  //console.log(log);
}

function eventListeners() {
  // tuve que incluir los event listeners dentro de una funcion porque al rehacer la tabla dejaban de
  // funcionar, por eso despues de llamar piezasTabla llamo a esta funcion eventListeners para que
  // se vuelvan a colocar
  $(".js-casilla").on("mousedown", function(event) {
    // establece las variables globales origin y currPiece
    origin = event.currentTarget.getAttribute("id");
    var letterColor = $(this).data("id");
    currPiece = { letter: letterColor[0], color: letterColor.substring(1) };
  });

  $(".js-casilla").on("mouseup", function(event) {
    // establece la variable global destiny y llama a movePiece si se cumplen las condiciones
    destiny = event.currentTarget.getAttribute("id");
    if (origin != destiny) {
      if (
        (playWhite && currPiece.color == "white") ||
        (!playWhite && currPiece.color == "black")
      )
        movePiece();
    }
  });
}

/*
<!-- COMMENTS 

Cuando hago mousedown en una casilla necesito saber la pieza y la posicion de esa casilla, y cuando hago mouseup
debo poner en la nueva posicion la pieza que tome y eliminar de la primera casilla la pieza que tenia

pieza = { posicion: [0,0], letra: 'K', color: 'white'}

letras = K, Q, R, B, K, P

Algunas Caracteristicas importantes:

Progresadas
1. Un timer que me diga el tiempo total consumido por cada jugador
4. Poner los controles de tiempo en sus respectivos lados: abajo las blancas, arriba las negras
5. Al menos debe forzar que el jugador mueva solo una vez (solo una pieza a menos que sea enroque)
6. Que imprima un log de las jugadas hechas

Pendientes
2. Poder mover una ficha a un area fuera del tablero y traerla de regreso, que las fichas comidas vayan a esa area
3. Hacerlo responsive. Que al reducir el ancho el tablero y sus piezas se acomoden y se hagan mas pequeÃ±os
7. Agregarle un Modal que permita apagar el sonido, cambiar el color de las piezas y tablero, ajustar el tamano, 
   poner limites de tiempo, etc.
8. Seria genial que reprodujera un juego a partir de una serie de jugadas codificadas

function printLog(moves) {
            // cada elemento del arreglo moves es un objeto {origin: 43, destiny: 62, piece: {letter: 'K', color:'white'}}
            // imprime el numero de cada jugada (blancas y negras), convierte la posicion de la pieza a notacion algebraica
            // si es enroque imprime 0-0 o 0-0-0
                var log = "";
                for (var i=moves.length-1; i<moves.length; i++) {
                    if (enroque) {enroque = false; break;}
                    if (i % 2 == 0) {
                        if (i/2 + 1 < 10) log += " ";
                        log += (i/2 + 1) + ". ";
                    }
                    // si es enroque imprime 0-0 o 0-0-0
                    if (moves[i].piece.letter == 'K') {
                        if ( (moves[i].destiny[1] - moves[i].origin[1] == 2) ) {
                            log += '0-0';
                            enroque = true;
                        }
                        else if ( (moves[i].destiny[1] - moves[i].origin[1] == -2) ) {
                            log += '0-0-0';
                            enroque = true;
                        }
                    }
                    else {
                        log += pieceUnicode(moves[i].piece);
                        log += String.fromCharCode(Number(moves[i].destiny[1]) + 97);
                        log += 8 - Number(moves[i].destiny[0]);
                    }
                    
                    log += "  ";
                    if (i % 2 == 1) log += "\r\n";
                }
                document.getElementById("log").innerHTML += log;
                console.log(enroque);
            }

*/