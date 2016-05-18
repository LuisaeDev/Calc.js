# Calc.js

### Versión
>1.0.1

Calculadora científica orientada a objetos

---

# Características
- Orientado a objetos
- Soporte para funciones trigonométricas y otras
- No requiere dependencias, no necesita de jQuery
- Soporte para módulos AMD

---

# Primeros pasos
## 1. Instalación
A través bower
```
bower install VoyagerCodes/Calc.js --save
```
O puedes descargar la última versión aquí https://github.com/VoyagerCodes/Calc.js/releases


## 2. Carga la librería
Carga el archivo de javascript **Calc.js** o **Calc.min.js** directamente en tu proyecto
```html
<script src="myVendorPath/Calc.js">
```
Carga la librería como módulo AMD
```javascript
define([ 'myVendorPath/Calc' ], function(Calc) {
    ...
});
```
## 3. Javascript!
Al cargar **Calc.js** se registrará la clase **Calc** en el contexto **window** con la cuál podrás crear múltiples instancias. Si estás cargando módulos AMD puedes acceder a la clase directamente por el argumento en donde se ha cargado el módulo.

```javascript
var calculator = new Calc();
```
---
# Documentación

### Constructor
- **new Calc()**

### Propiedades
- **debug**
- **constant**
- **radians**

### Métodos
- **solve**(exp, vars)
- **checkSyntax**(exp)
- **divide**(operand1, operand2)
- **pow**(base, exponent)
- **cos**(angle)
- **sin**(angle)
- **tan**(angle)
- **asin**(angle)
- **acos**(angle)
- **atan**(angle)
- **csc**(angle)
- **sec**(angle)
- **cot**(angle)
- **e**(value)
- **log**(value)
- **ln**(value)
- **abs**(value)
- **round**(value)
- **floor**(value)
- **ceil**(value)
- **fact**(value)
- **fractionate**(value)

## Realizar operaciones
Para resolver operaciones se debe utilizar el método **solve(exp, vars)**, el cual acepta como primer argumento una expresión aritmética, y el segundo argumento es opcional para definir variables a reemplazar durante la operación.
```javascript
// Construcción de una instancia Calc
var calculator = new Calc();

// Resuelve una expresión
var result = calculator.solve("10*(x/2)/sin(x * 18)", { x: 5 });

// Muestra el resultado
if (result !== false) {
	console.log('Resultado: ' + result);
} else {
	console.log('Error: ' + calculator.error.message);
}
```

## Operadores
| Operadores| Descripción              |
|-----------|--------------------------|
| **+**     | Suma                     |
| **-**     | Resta                    |
| **\***    | Multiplicación           |
| **/**     | División                 |
| **n²**    | Potencia al cuadrado     |
| **n³**    | Potencia al cubo         |
| **^**     | Potencia (ej: 2^4=16)    |
| **√**     | Raiz cuadrada (ej: √64=8)|
| **∛**     | Raiz cúbica              |
| **∜**     | Raiz cuarta              |
| **˟√**    | Raiz (ej: 2˟√64=8)       |
| **˅**     | Raiz (ej: 2˅64=8)        |

## Constantes
| Constantes| Descripción |
|-----------|-------------|
| **e**     | Euler       |
| **pi**    | Pi          |
| **π**     | Pi          |
| **∞**     | Infinito    |

## Funciones
| Funciones     | Descripción               |
|---------------|---------------------------|
| **sin()**     | Seno                      |
| **cos()**     | Coseno                    |
| **tan()**     | Tangente                  |
| **asin()**    | Inversa de seno           |
| **acos()**    | Inversa de coseno         |
| **atan()**    | Inversa de tangente       |
| **sin{-1}()** | Inversa de seno           |
| **cos{-1}()** | Inversa de coseno         |
| **tan{-1}()** | Inversa de tangente       |
| **csc()**     | Cosecante                 |
| **sec()**     | Secante                   |
| **cot()**     | Cotangente                |
| **exp()**     | Exponencial               |
| **log()**     | Logaritmo de base 10      |
| **ln()**      | Logaritmo natural         |
| **abs()**     | Valor absoluto            |
| **round()**   | Redondeo                  |
| **floor()**   | Redondeo a valor inferior |
| **ceil()**    | Redondeo a valor superior |
| **fact()**    | Factorial                 |