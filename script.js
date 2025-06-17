// Función para generar un número aleatorio de Poisson
function poissonRandom(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

// Variables para animación
let cajasAnimadas = [];
let animando = false;

// Manejo del formulario
document.getElementById('formulario').addEventListener('submit', function(e) {
    e.preventDefault();
    const lambda = parseFloat(document.getElementById('lambda').value);
    const dias = parseInt(document.getElementById('dias').value);
    simularDefectos(lambda, dias);
});

function simularDefectos(lambda, dias) {
    // Generar resultados de Poisson
    let resultados = [];
    for (let i = 0; i < dias; i++) {
        resultados.push(poissonRandom(lambda));
    }
    mostrarResultados(resultados);
    animarCinta(resultados);
}

function mostrarResultados(resultados) {
    // Mostrar tabla
    const tabla = document.getElementById('tabla-resultados');
    tabla.innerHTML = '';
    resultados.forEach((defectos, i) => {
        tabla.innerHTML += `<tr><td>${i+1}</td><td>${defectos}</td></tr>`;
    });

    // Estadísticas
    const suma = resultados.reduce((a,b) => a+b, 0);
    const promedio = (suma / resultados.length).toFixed(2);
    const max = Math.max(...resultados);
    const min = Math.min(...resultados);
    document.getElementById('estadisticas').innerHTML = `
        <strong>Estadísticas del periodo simulado:</strong><br>
        Promedio de defectos por día: <b>${promedio}</b><br>
        Máximo de defectos en un día: <b>${max}</b><br>
        Mínimo de defectos en un día: <b>${min}</b>
    `;

    // Mostrar gráfico
    dibujarGrafico(resultados);

    // Mostrar resultados
    document.getElementById('resultados').style.display = 'block';
}

function dibujarGrafico(resultados) {
    const canvas = document.getElementById('grafico');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dimensiones
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    const margen = 30;
    const anchoBarra = (w - 2*margen) / resultados.length;
    const max = Math.max(...resultados, 1);

    // Ejes
    ctx.strokeStyle = "#2d3e50";
    ctx.beginPath();
    ctx.moveTo(margen, margen);
    ctx.lineTo(margen, h - margen);
    ctx.lineTo(w - margen, h - margen);
    ctx.stroke();

    // Barras
    for (let i = 0; i < resultados.length; i++) {
        const x = margen + i * anchoBarra + anchoBarra*0.1;
        const y = h - margen;
        const alto = (resultados[i] / max) * (h - 2*margen);
        ctx.fillStyle = "#7ed957";
        ctx.fillRect(x, y - alto, anchoBarra*0.8, alto);
        // Etiqueta
        ctx.fillStyle = "#2d3e50";
        ctx.font = "12px Arial";
        ctx.fillText(resultados[i], x + anchoBarra*0.3, y - alto - 5);
    }
    // Etiquetas de días
    ctx.font = "12px Arial";
    for (let i = 0; i < resultados.length; i++) {
        const x = margen + i * anchoBarra + anchoBarra*0.3;
        ctx.fillText(i+1, x, h - margen + 15);
    }
}

// Animación de la cinta transportadora
function animarCinta(resultados) {
    const cajasDiv = document.getElementById('cajas');
    cajasDiv.innerHTML = '';
    cajasAnimadas = [];
    animando = false;

    // Generar cajas para el primer día
    let diaActual = 0;
    function crearCajasParaDia(dia) {
        cajasDiv.innerHTML = '';
        cajasAnimadas = [];
        const totalCajas = 8;
        let defectuosas = [];
        // Seleccionar aleatoriamente cuáles serán defectuosas
        if (resultados[dia] > 0) {
            let indices = [];
            while (indices.length < resultados[dia]) {
                let idx = Math.floor(Math.random() * totalCajas);
                if (!indices.includes(idx)) indices.push(idx);
            }
            defectuosas = indices;
        }
        for (let i = 0; i < totalCajas; i++) {
            const caja = document.createElement('div');
            caja.className = 'caja' + (defectuosas.includes(i) ? ' defecto' : '');
            if (defectuosas.includes(i)) caja.innerHTML = '!';
            cajasDiv.appendChild(caja);
            cajasAnimadas.push({el: caja, x: -50 - i*60});
        }
    }

    crearCajasParaDia(diaActual);

    // Animar cajas
    animando = true;
    function animar() {
        if (!animando) return;
        let terminado = true;
        for (let c of cajasAnimadas) {
            c.x += 2.5;
            if (c.x < 900) terminado = false;
            c.el.style.left = c.x + 'px';
        }
        if (!terminado) {
            requestAnimationFrame(animar);
        } else {
            // Esperar y pasar al siguiente día
            setTimeout(() => {
                diaActual++;
                if (diaActual < resultados.length) {
                    crearCajasParaDia(diaActual);
                    animar();
                } else {
                    animando = false;
                }
            }, 700);
        }
    }
    animar();
}

// Simulación inicial
window.onload = () => {
    simularDefectos(3, 7);
};