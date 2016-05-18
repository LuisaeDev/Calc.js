/*!
 * Calc.js
 * Version: 1.0.0
 * Copyright (c) 2016 Luis Aguilar
 * https://github.com/VoyagerCodes/Calc.js
 */

(function() {

	/**
	 * Constructor de la clase.
	 * 
	 * @param {Object} options Conjunto de propiedades a definir
	 */
	var Calc = function() {
	};

	/**
	 * Propiedades del prototipo.
	 * 
	 * @type {Object}
	 */
	Calc.prototype = {

		// Modo de depuración
		debug: false,

		// Expresión a operar
		exp: undefined,
		
		// Constantes definidas	
		constant: {
			e: Math.E,
			pi: Math.PI,
			'π': Math.PI,
			'∞': Infinity
		},

		// Modo que define si la calculadora debe manejar valores como radianes o grados
		radians: false
	};

	/**
	 * Resuelve una expresión aritmética.
	 * 
	 * @param  {String} exp  Expresión aritmética a resolver
	 * @param  {Object} vars Variables a sustituir en la expresión
	 * @return {Number}      Resultado de la expresión
	 */
	Calc.prototype.solve = function(exp, vars) {

		try	{

			// Verifica la sintaxis de la expresión
			if (this.checkSyntax(exp)) {

				// Almacena las variables a sustituir
				this.vars = vars;

				// Opera la expresión aritmética
				var result = this._solveExpresion();

				// Trunca el resultado a 12 cifras decimales
				result = Number(result.toFixed(12));

				// Devuelve el resultado obtenido
				return result;

			} else {
				return undefined;
			}

		} catch(e) {

			this.error = { cod: 'execution-error', desc: e };
			this._console( 'execution-error', this.error );
			return undefined;

		}
	};

	/**
	 * Verifica la sintaxis de una expresión aritmética.
	 * 
	 * @param  {String} exp Expresión aritmética a resolver
	 * @return {Boolean}    Indica si la expresión es válida
	 */
	Calc.prototype.checkSyntax = function(exp) {

		this._console('initial-expresion', exp);
		this._console('starting-corrections');

		// Remueve cualquier error previo
		this.error = undefined;

		// Almacena la expresión a resolver
		this.exp = exp;

		// Reemplaza constantes definidas
		this.exp = this._replaceConstant(this.exp);
		this._console('fix-replace-constant', this.exp);

		// Elimina espacios en blanco
		this.exp = this.exp.split(' ').join('');
		this._console('fix-white-spaces', this.exp);

		// Transforma los valores expresados en notación científica
		this.exp = this._scientificNotation(this.exp);
		this._console('fix-scientific-notation', this.exp);

		// Reduce operadores + y -
		this.exp = this._operatorsReduction(this.exp);
		this._console('fix-operators-reduction', this.exp);

		// Reemplaza operadores especiales
		this.exp = this._replaceSpecialOperators(this.exp);
		this._console('fix-replace-special-operators', this.exp);

		// Agrega el operador * en multiplicaciones sin operador
		this.exp = this._multiplicationWithoutOperator(this.exp);
		this._console('fix-multiplication-without-operator', this.exp);

		// Verificación de sintaxis
		try	{

			this._console('starting-syntax-verification');

			// Sintaxis de paréntesis
			this._checkParenthesis(this.exp);
			this._console('syntax-parenthesis');

			// Sintaxis en operadores
			this._checkOperators(this.exp);
			this._console('syntax-operators');

			// Sintaxis de decimales
			this._checkDecimals(this.exp);
			this._console('syntax-decimals');

			// Verifica carácteres inválidos
			this._checkChars(this.exp);
			this._console('syntax-invalid-chars');

			return true;

		} catch(e) {

			this.error = {cod:e[0], desc:e[1]};
			this._console('syntax-error', this.error);
			return false;

		}
	};

	/**
	 * Opera una división.
	 * 
	 * @param  {Number} operand1 Primer operando
	 * @param  {Number} operand2 Segundo operando
	 * @return {Number}          Resultado de la operación
	 */
	Calc.prototype.divide = function(operand1, operand2) {
		if ((operand1 == 0) && (operand2 == 0)) {
			return NaN;
		} else {
			if ((this._isInfinite(operand1)) && (this._isInfinite(operand2))) {
				return NaN;
			} else if ((this._isInfinite(operand1)) && (operand2 == 0)) {
				result = operand1;
			} else if (this._isInfinite(operand2)) {
				result = 0;
			} else {
				result = Number(operand1) / Number(operand2);
			}
		}
		return result;
	};

	/**
	 * Opera una potencia.
	 * 
	 * @param  {Number} base     Base de la potencia
	 * @param  {Number} exponent Exponente de la potencia
	 * @return {Number}          Resultado de la operación
	 */
	Calc.prototype.pow = function(base, exponent) {

		base = Number(base);
		exponent = Number(exponent);

		// Resultado de la potencia
		result = Math.exp(exponent * Math.log(Math.abs(base)));

		// Si la base es negativa y exponente es entero
		if ((base < 0) && (this._isInteger(exponent) == true)) {

			// Si el exponente es impar el resultado es negativo
			if (this._isOdd(exponent)) {
				return -1 * result;
			} else {
				return result;
			}
		} else {

			// Si la base es negativa el resultado es negativo
			if (base < 0) {
				return -1 * result;
			} else {
				return result;
			}
		}
	};

	/**
	 * Opera una función coseno.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.cos = function(angle) {
		return Number(Math.cos(this._radians(angle)).toFixed(15));
	};

	/**
	 * Opera una función seno.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.sin = function(angle) {
		return Number(Math.sin(this._radians(angle)).toFixed(15));
	};

	/**
	 * Opera una función tangente.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.tan = function(angle) {
		return this.sin(angle) / this.cos(angle);
	};

	/**
	 * Opera una función inversa de seno.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.asin = function(angle) {
		var angle = Math.asin(angle);
		if (this.radians == false) {
			angle = angle / (Math.PI/180);
		}
		return Number(angle);
	};

	/**
	 * Opera una función inversa de coseno.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.acos = function(angle) {
		var angle = Math.acos(angle);
		if (this.radians == false) {
			angle = angle/(Math.PI/180);
		}
		return Number(angle);
	};

	/**
	 * Opera una función inversa de tangente.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.atan = function(angle) {
		var angle = Math.atan(angle);
		if (this.radians == false) {
			angle = angle/(Math.PI/180);
		}
		return Number(angle);
	};

	/**
	 * Opera una función cosecante.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.csc = function(angle) {
		return 1 / this.sin(angle);
	};

	/**
	 * Opera una función secante.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.sec = function(angle) {
		return 1 / this.cos(angle);
	};

	/**
	 * Opera una función cotangente.
	 * 
	 * @param  {Number} angle Ángulo
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.cot = function(angle) {
		return 1 / this.tan(angle);
	};

	/**
	 * Opera una función exponencial.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.e = function(value) {
		return Math.exp(value);
	};

	/**
	 * Opera una función logaritmo de base 10.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.log = function(value) {
		return Math.log10(value);
	};

	/**
	 * Opera una función logaritmo natural.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.ln = function(value) {
		return Math.log(value);
	};

	/**
	 * Opera una función de valor absoluto.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.abs = function(value) {
		return Math.abs(value);
	};

	/**
	 * Opera una función de redondeo.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.round = function(value) {
		return Math.round(value);
	};

	/**
	 * Opera una función de redondeo hacia abajo.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.floor = function(value) {
		return Math.floor(value);
	};

	/**
	 * Opera una función de redondeo hacia arriba.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.ceil = function(value) {
		return Math.ceil(value);
	};

	/**
	 * Opera una función factorial.
	 * 
	 * @param  {Number} value Valor
	 * @return {Number}       Resultado de la operación
	 */
	Calc.prototype.fact = function(value) {
		if (value >= 171) {
			return Infinity;
		} else if (value == 0) {
			return 1;
		} else if ((this._isInteger(value)) && (value > 0)) {
			result = value;
			for (var i = 1; i < value; i++) {
				result *= i;
			};
			return result;
		} else {
			return undefined;
		}
	};

	/**
	 * Convierte un decimal a fracción.
	 * 
	 * @param  {Number} decimal Decimal a fraccionar
	 * @return {Object}         Numerador y denominador
	 */
	Calc.prototype.fractionate = function(decimal) {

		decimal = Math.round(decimal * 100000000) / 100000000;

		// Define el numerador, denominador y fracción inicial
		var num = Math.ceil(decimal);
		var den = 1;
		var fraction = num/den;
		var iteration = 1000000;
	 	
	 	// Incrementa el numerador y denominador de la fracción hasta aproximarse o ser igual al decimal
		while ((fraction != decimal) && (iteration > 0)) {
			if (fraction < decimal) {
				num++;
			} else {
				den++;
				num = parseInt(decimal * den, 10);
			}
			fraction = num / den;
			iteration--;
		}

		// Devuelve la fracción
		return {
			num: num,
			den: den
		}
	};

	/**
	 * Reemplaza constantes en la expresión.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {String}     Expresión aritmética con valores reemplazados
	 */
	Calc.prototype._replaceConstant = function(exp) {

		// Se identifica con la siguiente expresión regular, todas las coincidencias de palabras completas y de más de un caracter
		var regex = /([a-z\π\∞]+)/ig;
		var match;
		while (match = regex.exec(exp)) {
			
			// Verifica si la coincidencia encontrada está definida en las constantes
			if ((match[1] in this.constant) && (this.constant[match[1]] != undefined)) {

				// Sustituye la constante en la expresión
				exp = exp.substr(0, match.index) + '(' + this._toString(this.constant[match[1]])+ ')' + exp.substr(match.index + match[1].length);
			}
		}

		// Devuelve la expresión
		return exp
	};

	/**
	 * Transforma los valores expresados en notación científica.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {String}     Expresión aritmética con valores reemplazados
	 */
	Calc.prototype._scientificNotation = function(exp) {
		var regex = /([0-9\.0-9]+)E([\+|\-]?[0-9]+)/;
		var match;
		while (match = regex.exec(exp)) {
			exp = exp.substr(0, match.index) + this._toString(match[0]) + exp.substr(match.index + match[0].length);
		}
		return exp;
	};

	/**
	 * Reducción de operadores '+' y '-'.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {String}     Expresión aritmética con valores reemplazados
	 */
	Calc.prototype._operatorsReduction = function(exp) {

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 0; i < exp.length; i++) {

			// Corta fragmentos de dos en dos caracteres
			var fragment = exp.substr(i, 2);

			// Si el fragmento es -- o ++ se sustituye por +
			if ((fragment == '--') || (fragment == '++')) {
				exp = exp.substr(0, i) + '+' + exp.substr(i + 2);

				// Disminuye una posición al contador del bucle a causa del caracter removido
				i--;

			// Si el fragmento es -+ o +- se sustituye por -
			} else if ((fragment == '-+') || (fragment == '+-')) {
				exp = exp.substr(0, i) + '-' + exp.substr(i + 2);

				// Disminuye una posición al contador del bucle a causa del caracter removido
				i--;
			}
		};
		return exp;
	};

	/**
	 * Reemplaza caracteres especiales de operadores.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {String}     Expresión aritmética con valores reemplazados
	 */
	Calc.prototype._replaceSpecialOperators = function(exp) {

		// Reemplaza caracteres para raices
		exp = exp.replace(/˟√(?![˟√|√|∛|∜])/g, '˅');
		exp = exp.replace(/√(?![√|∛|∜])/g, '(2)˅');
		exp = exp.replace(/∛(?![√|∛|∜])/g, '(3)˅');
		exp = exp.replace(/∜(?![√|∛|∜])/g, '(4)˅');

		// Reemplaza caracteres para potencias
		exp = exp.replace(/²(?![²|³])/g, '^(2)');
		exp = exp.replace(/³(?![²|³])/g, '^(3)');

		// Reemplaza definiciones especiales de funciones
		exp = exp.replace(/sin\{-1\}/g, 'asin');
		exp = exp.replace(/cos\{-1\}/g, 'acos');
		exp = exp.replace(/tan\{-1\}/g, 'atan');

		// Devuelve la expresión
		return exp;
	};

	/**
	 * Agrega el operador * en multiplicaciones sin operador.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {String}     Expresión aritmética con valores reemplazados
	 */
	Calc.prototype._multiplicationWithoutOperator = function(exp) {

		// Reemplaza todas las coincidencias ")(" y agrega el * en el medio ")*("
		exp = exp.split(')(').join(')*(');

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 0; i < exp.length - 1; i++) {
			
			// Obtiene el caracter actual y siguiente relativamente a la iteración del bucle
			var actualChar = exp.substr(i, 1);
			var nextChar = exp.substr(i + 1, 1);

			// Si el caracter siguiente es un "(" o letra y el actual es un número, en ese caso agrega un "*" antes del "("
			if ((this._isNumber(actualChar)) && ((nextChar == '(') || (this._isLetter(nextChar)))) {
				exp = exp.substr(0, i) + actualChar + '*' + exp.substr(i + 1);

				// Aumenta una posición al contador del bucle a causa del caracter añadido
				i++;
			}
		}

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 0; i < exp.length - 1; i++) {

			// Obtiene el caracter actual y siguiente relativamente a la iteración del bucle
			var actualChar = exp.substr(i, 1);
			var nextChar = exp.substr(i + 1, 1);

			// Si el caracter actual es un ")" y el siguiente es un número, en ese caso agrega un "*" después del ")"
			if ((actualChar == ')') && (this._isNumber(nextChar))) {
				exp = exp.substr(0, i + 1) + '*' + exp.substr(i + 1);

				// Aumenta una posición al contador del bucle a causa del caracter añadido
				i++;
			}
		}
		return exp;
	};

	/**
	 * Verifica que todos los paréntesis estén debidamente abiertos y cerrados.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {void}
	 */
	Calc.prototype._checkParenthesis = function(exp) {
		
		// Contador de paréntesis
		var cont = 0;
		var error = false;

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 0; i < exp.length; i++) {
			var char = exp.substr(i, 1);

			// Si el caracter es un paréntesis abierto, aumenta una unidad al contador
			if (char == '(') {
				cont++;
			}

			// Si el caracter es un paréntesis cerrado, disminuye una unidad al contador
			if (char == ')') {
				cont--;
			}

			// Si el contador es 0, significa que se cerró más de un paréntesis antes de ser abierto, ej: (5+7)+3), en este caso el contador daría -1
			if (cont < 0) {
				throw [ 'error-parenthesis', 'Se ha cerrado un paréntesis antes de ser abierto' ];
				break;
			}
		}

		// Verifica con el contador si todos los paréntesis se cerraron adecuadamente, para ser correcto el resultado del contador debe ser cero
		if(cont != 0) {
			throw [ 'error-parenthesis', 'Uno o más paréntesis no han sido cerrados' ];
		}

		// Verifica si hay paréntesis sin contenido
		if (exp.indexOf('()') != -1) {
			throw [ 'error-parenthesis', 'Uno o más paréntesis no tienen contenido' ];
		}
	};

	/**
	 * Verifica sintaxis de operadores.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {void}
	 */
	Calc.prototype._checkOperators = function(exp) {

		// Obtiene el caracter inicial y final de la expresión
		var initialChar = exp.substr(0, 1);
		var finalChar = exp.substr(-1);

		// Error si caracter inicial es uno de los siguientes operadores
		if ((initialChar == '˅') || (initialChar == '^') || (initialChar == '*') || (initialChar == '/')) {
			throw [ 'error-operator', 'La expresión no puede iniciar con el operador "' + initialChar + '"' ];
		}

		// Error si caracter final es uno de los siguientes operadores
		if ((finalChar == '˅') || (finalChar == '^') || (finalChar == '*') || (finalChar == '/') || (finalChar == '+') || (finalChar == '-')) {
			throw [ 'error-operator', 'La expresión no puede finalizar con el operador "' + finalChar + '"' ];
		}

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 1; i < exp.length - 1; i++) {

			// Obtiene el caracter previo, actual y siguiente relativamente a la iteración del bucle
			var prevChar = exp.substr(i - 1, 1);
			var actualChar = exp.substr(i, 1);
			var nextChar = exp.substr(i + 1, 1);

			// Si caracter actual es un operador +, -
			if ((actualChar == '+') || (actualChar == '-')) {

				// Verifica si el caracter previo es distinto a los siguientes casos
				if ((prevChar != '˅') && (prevChar != '^') && (prevChar != '*') && (prevChar != '/') && (prevChar != '(') && (prevChar != ')') && (this._isNumber(prevChar) == false) && (this._isLetter(prevChar) == false)) {
					throw [ 'error-operator', 'Se encontró el caracter inválido "' + prevChar + '" antes del operador "' + actualChar + '"' ];
				}

				// Verifica si el caracter siguiente es distinto a los siguientes casos
				if ((nextChar != '(') && (this._isNumber(nextChar) == false) && (this._isLetter(nextChar) == false)) {
					throw [ 'error-operator', 'Se encontró el caracter inválido "' + nextChar + '" después del operador "' + actualChar + '"' ];
				}
			}

			// Si caracter actual es un operador ˅, ^, *, /
			if ((actualChar == '˅') || (actualChar == '^') || (actualChar == '*') || (actualChar == '/')) {

				// Verifica si el caracter previo es distinto a los siguientes casos
				if ((prevChar != ')') && (this._isNumber(prevChar) == false) && (this._isLetter(prevChar) == false)) {
					throw [ 'error-operator', 'Se encontró el caracter inválido "' + prevChar + '" antes del operador "' + actualChar + '"' ];
				}

				// Verifica si el caracter siguiente es distinto a los siguientes casos
				if ((nextChar != '+') && (nextChar != '-') && (nextChar != '(') && (this._isNumber(nextChar) == false) && (this._isLetter(nextChar) == false)) {
					throw [ 'error-operator', 'Se encontró el caracter inválido "' + nextChar + '" después del operador "' + actualChar + '"' ];
				}
			}
		}
	};

	/**
	 * Verifica sintaxis de decimales.
	 * 
	 * @param  {String} exp Expresión aritmética
	 * @return {void}
	 */
	Calc.prototype._checkDecimals = function(exp) {

		// Obtiene el caracter inicial y final de la expresión
		var initialChar = exp.substr(0, 1);
		var finalChar = exp.substr(-1);

		// Error si el caracter inicial o final es punto
		if (initialChar == '.') {
			throw [ 'error-decimal-syntax', 'Se encontró un pundo decimal inesperado al inicio de la expresión' ];
		}
		if (finalChar == '.') {
			throw [ 'error-decimal-syntax', 'Se encontró un pundo decimal inesperado al final de la expresión' ];
		}

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 1; i < exp.length - 1; i++) {

			// Obtiene el caracter previo, actual y siguiente relativamente a la iteración del bucle
			var prevChar = exp.substr(i - 1, 1);
			var actualChar = exp.substr(i, 1);
			var nextChar = exp.substr(i + 1, 1);

			// Si el caracter es punto, verifica si el caracter previo y siguiente no es número, en ese caso sería error
			if (actualChar == '.') {
				if ((this._isNumber(prevChar) == false) || (this._isNumber(nextChar) == false)) {
					throw [ 'error-decimal-syntax', 'Se encontró un pundo decimal inesperado' ];
				}
			}
		}

		// Variable bandera utilizada en el siguiente bucle para determinar cuando se encuentre un punto
		var dot = false;

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 0; i < exp.length; i++) {

			// Obtiene el caracter actual relativamente a la iteración del bucle
			var actualChar = exp.substr(i, 1);

			// Si ya había sido encontrado un punto
			if (dot) {

				// Verifica si el caracter actual es un operador
				if (this._isOperator(actualChar)) {

					// Define en false la variable bandera para seguir buscando puntos
					dot = false;

				// Si ya se había encontrado un punto, y caracter actual es un nuevo punto, genera un error
				} else if (actualChar == '.') {
					throw [ 'error-decimal-syntax', 'Se definió más de un pundo decimal en un valor' ];
				}

			// Si se ha encontrado ningún punto, y el caracter actual es un punto
			} else if (actualChar == '.') {

				// Define la variable bandera en true indicando que se encontró un punto
				dot = true;
			}
		}
	};

	/**
	 * Verifica carácteres inválidos.
	 * 
	 * @param  {String} exp  Expresión aritmética
	 * @return {void}
	 */
	Calc.prototype._checkChars = function(exp) {

		// Recorre toda la expresión de izquierda a derecha
		for (var i = 0; i < exp.length; i++) {

			// Obtiene el caracter actual relativamente a la iteración del bucle
			var actualChar = exp.substr(i, 1);

			// Verifica si el caracter actual es distinto a los siguientes casos
			if ((actualChar != '.') && (actualChar != '(') && (actualChar != ')') && (this._isNumber(actualChar) == false) && (this._isLetter(actualChar) == false) && (this._isOperator(actualChar) == false)) {
				throw [ 'error-invalid-char', 'Se encontró el caracter inválido "' + actualChar + '"' ];
			}
		}
	};

	/**
	 * Identifica y opera ordenadamente (por segmentos) la expresión.
	 * 
	 * @param  {String} exp Expresión aritmética a resolver
	 * @return {Number}     Resultado de la expresión
	 */
	Calc.prototype._solveExpresion = function() {

		this._console('starting-operation');

		// Variables
		var iLeft, iRight = 0;
		var simpleExp, initialChar, finalChar, actualChar;

		// Agrega parétesis a toda la expresión para determinar la última expresión con paréntesis a operar
		var exp = '(' + this.exp + ')';

		// Obtiene el caracter inicial y final
		var initialChar = exp.substr(0, 1);
		var finalChar = exp.substr(-1);

		// Ciclo while que se ejecuta mientras el caracter inicial y final sean paréntesis
		while ((initialChar == '(') && (finalChar == ')')) {

			this._console('operating-expression', exp);

			// Recorre toda la expresión de izquierda a derecha buscando el primer paréntesis cerrado
			for (var i = 0; i < exp.length; i++) {
				actualChar = exp.substr(i, 1);
				if (actualChar == ')') {

					// Determina la posición iRight de la expresión simple a operar
					iRight = i;
					break;
				}
			}

			// Recorre la expresión de derecha a izquieda, a partir de la posición iRight anteriormente encontrado, hasta encontrar el primer paréntesis abierto
			for (var i = iRight; i >= 0; i--) {
				actualChar = exp.substr(i, 1);
				if (actualChar == '(') {

					// Determina la posición iLeft de la expresión simple a operar
					iLeft = i;
					break;
				}
			}

			// Obtiene el fragmento de expresión simple a operar a partir de la posición iLeft e iRight, el área a recortar se limita un caracter hacia dentro para no considerar los paréntesis
			simpleExp = exp.substr(iLeft + 1, (iRight - iLeft) - 1);

			// Opera la expresión simple
			simpleExp = this._solveSimpleExpresion(simpleExp)

			// Si el resultado de la expresión simple es undefined, finaliza la operación
			if (simpleExp == undefined) {
				return undefined;
			}

			// Concatena nuevamente la expresión con el segmento de expresión simple resuelto
			exp = exp.substr(0, iLeft) + simpleExp + exp.substr(iRight + 1);
	
			// Obtiene nuevamente el caracter inicial y final de la expresión
			initialChar = exp.substr(0, 1);
			finalChar = exp.substr(-1);
		}

		// Remueve llaves del resultado
		exp = exp.replace('{', '');
		exp = exp.replace('}', '');
		
		// Reducción final de operadores
		exp = Number(this._operatorsReduction(exp));

		this._console('expresion-result', exp);

		// Devuelve el resultado
		return exp;
	};

	/**
	 * Opera una expresión simple (sin paréntesis).
	 * 
	 * @param  {String} exp Expresión aritmética a resolver
	 * @return {Number}     Resultado de la expresión
	 */
	Calc.prototype._solveSimpleExpresion = function(exp) {

		this._console('operating-simple-expresion', exp);
		this._console('solving-functions');

		// Variables
		var match, mathFunction, arg;
		var result;

		// Expresión regular para identificar funciones y su parámetro pasado
		var regex = /([a-z]+)((?:\{|\{\-|\{\+)?(?:[0-9\.0-9]|(?:Infinity))+[\}]?)+/i;
		while (match = regex.exec(exp)) {
			
			// Función identificada
			mathFunction = match[1];

			// Valor del parámetro pasado a la función
			arg = match[2];
			if (arg != undefined) {

				// Remueve las llaves del valor y lo convierte en numérico
				arg = arg.replace('{', '');
				arg = arg.replace('}', '');
				arg = Number(arg);
			}

			// Verifica si la variable o función está definida
			var mathFunctions = [ 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'csc', 'sec', 'cot', 'exp', 'log', 'ln', 'abs', 'round', 'floor', 'ceil', 'fact' ];
			if (mathFunctions.indexOf(mathFunction) == -1) {
				throw 'Función "' + mathFunction + '" no reconocida';
			}

			// Error si no se definió ningún argumento para la función
			if (arg == undefined) {
				throw 'No se definió el valor a resolver para la función "' + mathFunction + '"';
			}

			// Resuelve la función
			switch(mathFunction) {
				case 'sin':
					result = this.sin(arg);
					break;

				case 'cos':
					result = this.cos(arg);
					break;

				case 'tan':
					result = this.tan(arg);
					break;

				case 'asin':
					if ((arg < -1) || (arg > 1)) {
						throw 'Argumento inválido para función "asin"';
					}
					result = this.asin(arg);
					break;

				case 'acos':
					if ((arg < -1) || (arg > 1)) {
						throw 'Argumento inválido para función "acos"';
					}
					result = this.acos(arg);
					break;

				case 'atan':
					result = this.atan(arg);
					break;

				case 'csc':
					result = this.csc(arg);
					break;

				case 'sec':
					result = this.sec(arg);
					break;

				case 'cot':
					result = this.cot(arg);
					break;

				case 'exp':
					result = this.e(arg);
					break;

				case 'log':
					if (arg <= 0) {
						throw 'La función "log" no puede resolver un valor negativo o cero';
					}
					result = this.log(arg);
					break;

				case 'ln':
					if (arg <= 0) {
						throw 'La función "ln" no puede resolver un valor negativo o cero';
					}
					result = this.ln(arg);
					break;

				case 'abs':
					result = this.abs(arg);
					break;

				case 'round':
					result = this.round(arg);
					break;

				case 'floor':
					result = this.floor(arg);
					break;

				case 'ceil':
					result = this.ceil(arg);
					break;

				case 'fact':
					if (arg == Infinity) {
						result = Infinity;
					} else if ((this._isInteger(arg) == false) || (arg < 0)) {
						throw 'La función "fact" no puede resolver un valor negativo o decimal';
					} else {
						result = this.fact(arg);
					}
					break;
			}

			// Si el resultado es NaN, finaliza la expresión simple
			if (isNaN(result)) {
				throw 'Resultado indefinido';
			}

			// Reemplaza la función por su resultado en la expresión
			exp = exp.substr(0, match.index) + this._toString(result) + exp.substr(match.index + match[0].length);

			this._console('solving-function', {
				function: match[0],
				result: result,
				exp: exp
			});
		}

		// Se identifica con la siguiente expresión regular, todas las coincidencias de palabras completas y de más de un caracter
		this._console('solved-functions', exp);
		this._console('solving-arithmetic-operations');

		// Ciclo de 3 pasos, al igual como una calculadora resuelve primero las potencias y raices, luego multiplicaciones y divisiones, y por último sumas y restas
		for (var step = 1; step <= 3; step++) {
			
			// De acuerdo al paso del ciclo for, determina la expresión regular para identificar las operaciones por resolver
			switch(step) {
				case 1:
					regex = /((?:\{|\{\-|\{\+)?(?:[0-9\.]|[a-zA-Z])+[}]?)([\˅|\^]{1})([+|-]?[{]?[+|-]?(?:[0-9\.]|[a-zA-Z])+[}]?)/;
					break;

				case 2:
					regex = /((?:\{|\{\-|\{\+)?(?:[0-9\.]|[a-zA-Z])+[}]?)([\*|\/]{1})([+|-]?[{]?[+|-]?(?:[0-9\.]|[a-zA-Z])+[}]?)/;
					break;

				case 3:
					regex = /([\+|\-]?(?:\{|\{\-|\{\+)?(?:[0-9\.]|[a-zA-Z])+[}]?)([\+|\-]{1})([+|-]?[{]?[+|-]?(?:[0-9\.]|[a-zA-Z])+[}]?)/;
					break;
			}

			// Ciclo que identifica las operaciones a resolver de acuerdo al paso del ciclo for
			while (match = regex.exec(exp)) {

				// Define los operandos de la operación
				operand1 = match[1];
				operator = match[2];
				operand2 = match[3];
				
				// Remueve llaves de operandos y reduce sus operadores + y -
				operand1 = operand1.replace('{', '');
				operand1 = operand1.replace('}', '');
				operand2 = operand2.replace('{', '');
				operand2 = operand2.replace('}', '');
				operand1 = this._operatorsReduction(operand1);
				operand2 = this._operatorsReduction(operand2);

				// Si los operandos no son números, verifica si es una variable pasada
				if (isNaN(Number(operand1))) {
					if (this._getVar(operand1) == undefined) {
						throw 'Variable "' + operand1 +'" no reconocida';
					} else {
						operand1 = this._getVar(operand1);
					}
				} else {
					operand1 = Number(operand1);
				}
				if (isNaN(Number(operand2))) {
					if (this._getVar(operand2) == undefined) {
						throw 'Variable "' + operand2 +'" no reconocida';
					} else {
						operand2 = this._getVar(operand2);
					}
				} else {
					operand2 = Number(operand2);
				}

				// Resuelve la operación de acuerdo al operador identificado
				switch(operator) {

					// Resuelve la raiz
					case '˅':

						// Se define el índice y radicando
						index = Number(operand1);
						radicant = Number(operand2);
						
						// Verifica si el índice es cero
						if (index == 0){
							throw 'El índice de una raíz no puede ser cero';

						// Si el radicando es cero se resuelve solo si el índice es positivo
						} else if (radicant == 0) {
							if (index > 0) {
								result = 0;
							} else {
								throw 'Una raíz con radicando cero solo puede tener un índice positivo';
							}

						// Si el radicando e índice no son cero
						} else {

							// Define el exponente
							exponent = 1 / index;

							// Si el exponente es entero o infinito
							if ((this._isInteger(exponent) == true) || (this._isInfinite(exponent))) {
								result = Math.pow(radicant, exponent);

							// Si el exponente es decimal
							} else {

								// Si el radicando es positivo
								if (radicant > 0) {
									result = Math.pow(radicant, exponent);

								// Si el radicando es negativo y el exponente decimal
								} else {
									throw 'No es posible resolver la raiz';
								}
							}
						}
						break;

					// Resuelve la potencia
					case '^':

						// Se define la base y exponente
						base = Number(operand1);
						exponent = Number(operand2);

						// No es posible resolver cero elevado a cero
						if ((base == 0) && (exponent == 0)) {
							throw 'No se puede resolver una potencia con exponente y base igual a cero';

						// Todo número elevado a la cero el resultado es 1
						} else if (exponent == 0){
							result = 1;

						// Se resuelve la operación si la base es cero
						} else if (base == 0){
							if (exponent > 0){
								result = 0;
							} else {
								throw 'Una potencia con base cero solo puede tener un exponente positivo';
							}

						// Se resuelve la operación cuando la base y el exponente no sean cero
						} else {

							// Resuelve si el exponente es entero o infinito
							if ((this._isInteger(exponent) == true) || (Math.abs(exponent) == Infinity)) {
								result = Math.pow(base, exponent);

							// Si el exponente es decimal
							} else {

								// Si la base es positiva
								if (base > 0) {
									result = Math.pow(base, exponent);

								// Si la base es negativa y el exponente decimal
								} else {
									throw 'No es posible resolver una potencia con base negativa y exponente decimal';
								}
							}
						}
						break;

					// Resuelve la multiplicación
					case '*':
						result = Number(operand1) * Number(operand2);
						break;

					// Resuelve la división
					case '/':

						result = this.divide(operand1, operand2);
						break;

					// Resuelve la suma
					case '+':
						result = Number(operand1) + Number(operand2);
						break;

					// Resuelve la resta
					case '-':
						result = Number(operand1) - Number(operand2);
						break;
				}

				// Si el resultado es NaN, finaliza la expresión simple
				if (isNaN(result)) {
					throw 'Resultado indefinido';
				}

				// Se concatena nuevamente la expresión simple con el resultado de la operación resuelta
				exp = exp.substr(0, match.index) + this._toString(result) + exp.substr(match.index + match[0].length);

				this._console('solving-operation', {
					exp:          exp,
					leftOperand:  match[1],
					operator:     operator,
					rightOperand: match[3],
					result:       result
				});

				// Se reducen nuevamente operadores + y -
				exp = this._operatorsReduction(exp);
			}
		}

		// Remueve llaves del resultado
		exp = exp.replace('{', '');
		exp = exp.replace('}', '');

		// Reducción final de operadores
		exp = this._operatorsReduction(exp);

		// Al resolver el ciclo de 3 pasos, se devuelve la expresión simple resuelta. Se agregan las llaves para conservar el signo del resultado de la expresión simple
		return '{' + exp + '}';
	};

	/**
	 * Muestra un mensaje en la consola en modo de depuración.
	 * 
	 * @return {void}
	 */
	Calc.prototype._console = function() {
		if (this.debug) {
			console.log(arguments);
		}
	};

	/**
	 * Devuelve el valor de una variable.
	 * 
	 * @param  {String} varName Nombre de la variable
	 * @return {Number}         Valor de la variable
	 */
	Calc.prototype._getVar = function(varName) {
		if ((typeof this.vars == 'object') && (varName in this.vars)) {
			return this.vars[varName];
		} else {
			return undefined;
		}
	};

	/**
	 * Convierte grados a radianes cuando la propiedad radians es false.
	 * 
	 * @param  {String} varName Nombre de la variable
	 * @return {Number}         Valor de la variable
	 */
	Calc.prototype._radians = function(value) {
		if (this.radians == false) {
			return value * (Math.PI/180);
		} else {
			return value;
		}
	};

	/**
	 * Convierte un valor numérico a string, Nota: se remueve valores en notación científica.
	 * 
	 * @param  {Number} value Valor a convertir
	 * @return {String}       Valor convertido
	 */
	Calc.prototype._toString = function(value){

		// Convierte el valor recibido a Number()
		value = Number(value);

		// Separa el valor por el signo 'e' o 'E' cuando está en notación científica
		value = String(value).split(/[eE]/);
		
		// Verifica si el valor estaba expresado en notación científica, de no estarlo lo devuelve
		if (value.length == 1) {
			return value[0];
		}

		// Si la cantidad de posiciones definidas es cero, el resultado es el mismo que el valor base definido
		if (value[1] == 0) {
			return value[0].toString();
		}

		// Remueve el punto decimal si lo tenía
		value[0] = value[0].replace('.', ''),

		// Determina la cantidad de posiciones que deberá mover el punto
		pos = Number(value[1]);

		// Construye el string a partir de la cantidad de posiciones definidas
		if (pos <= 0) {
			if (value[0] < 0) {
				var str = '-0.';
			} else {
				var str = '0.';
			}
			while (++pos) {
				str += '0';
			}
			return str + value[0].replace(/^\-/,'');
		} else {
			pos -= value[0].length - 1;
			var str = value[0];
			while (pos--) {
				str += '0';
			}
			return str;
		}
	};

	/**
	 * Función de utilería que determina si un valor es impar.
	 * 
	 * @param  {Number}  value Valor a comprobar
	 * @return {Boolean}
	 */
	Calc.prototype._isOdd = function(value) {
		if (Math.abs(value % 2) === 1) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Función de utilería que determina si un valor es entero.
	 * 
	 * @param  {Number}  value Valor a comprobar
	 * @return {Boolean}
	 */
	Calc.prototype._isInteger = function(value) {
		if (value === parseInt(value, 10)) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Función de utilería que determina si un caracter es operador.
	 * 
	 * @param  {String}  char Caracter a comprobar
	 * @return {Boolean}
	 */
	Calc.prototype._isOperator = function(char) {
		var operators = '+-*/˅^';
		if (operators.indexOf(char) == -1) {
			return false;
		} else {
			return true;
		}
	};

	/**
	 * Función de utilería que determina si un caracter es número.
	 * 
	 * @param  {String}  char Caracter a comprobar
	 * @return {Boolean}
	 */
	Calc.prototype._isNumber = function(char) {
		char = Number(char);
		if (isNaN(char)) {
			return false;
		} else if ((char >= 0) && (char <= 9)) {
			return true;
		}
	};

	/**
	 * Función de utilería que determina si un caracter es letra.
	 * 
	 * @param  {String}  char Caracter a comprobar
	 * @return {Boolean}
	 */
	Calc.prototype._isLetter = function(char) {
		if (((char.charCodeAt() >= 65) && (char.charCodeAt() <= 90)) || ((char.charCodeAt() >= 97) && (char.charCodeAt() <= 122))) {
			return true;	
		} else {
			return false;
		}
	};

	/**
	 * Verifica si un valor es infinito.
	 * 
	 * @param  {Number}  value Valor a comprobar
	 * @return {Boolean}
	 */
	Calc.prototype._isInfinite = function(value) {
		if ((value == -Infinity) || (value == Infinity)) {
			return true;
		} else {
			return false;
		}
	};

	/*
	 * Se exporta el módulo
	 */
	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		define(function() {
			return Calc;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Calc;
	}

	/**
	 * Define la clase en el contexto window.
	 */
	window.Calc = Calc;

}());