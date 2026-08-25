/**
 * 🎓 APRENDE A PROGRAMAR - ARCHIVO DE UTILIDADES (formatters.js)
 * 
 * En JavaScript, las "Funciones" son bloques de código reutilizables.
 * Usamos "export" para que otros archivos puedan importar y usar estas funciones.
 */

// Formateador oficial de números a Pesos utilizando la API nativa de JavaScript: Intl.NumberFormat
const pesoFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0, // No mostramos centavos para simplificar los valores inmobiliarios
  minimumFractionDigits: 0
});

/**
 * Convierte un número (ej: 5000000) a formato texto de Pesos (ej: "$ 5.000.000")
 * @param {number} value - El valor numérico
 * @returns {string} Texto formateado
 */
export function formatCOP(value) {
  if (isNaN(value) || value === null || value === undefined) return '$ 0';
  // Reemplazamos la sigla COP por el símbolo $ de forma limpia
  return pesoFormatter.format(value).replace('COP', '$').trim();
}

/**
 * Convierte un texto formateado o con puntos (ej: "$ 5.000.000") de vuelta a un número limpio (ej: 5000000)
 * @param {string|number} input - El texto ingresado en el input
 * @returns {number} Número sin formato
 */
export function parseCOP(input) {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  
  // Usamos una Expresión Regular (RegEx) `\D` que elimina todo lo que NO sea un dígito
  const cleaned = input.toString().replace(/\D/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Formatea un input en tiempo real mientras el agente escribe números
 * @param {HTMLInputElement} inputElement - El campo de texto de HTML
 */
export function setupCurrencyInput(inputElement, onChangeCallback) {
  inputElement.addEventListener('input', (e) => {
    // 1. Obtenemos el número puro
    const numericValue = parseCOP(e.target.value);
    
    // 2. Si el valor es mayor a 0, mostramos el formato en pesos
    if (numericValue > 0) {
      e.target.value = formatCOP(numericValue);
    } else if (e.target.value !== '') {
      e.target.value = '$ 0';
    }

    // 3. Ejecutamos la función de actualización si existe
    if (onChangeCallback) {
      onChangeCallback(numericValue);
    }
  });

  // Cuando hace foco en el campo, si es $ 0, lo seleccionamos para facilitar la edición
  inputElement.addEventListener('focus', (e) => {
    if (parseCOP(e.target.value) === 0) {
      e.target.select();
    }
  });
}
