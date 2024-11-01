// llamado API
const API_URL = "https://mindicador.cl/api";


//Tazas de cambio
async function obtenerTasasDeCambio() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener las tasas de cambio:", error);
        document.querySelector(".resultados").textContent = "Error al obtener los datos.";
    }
}

// convertir monedas
async function convertirMoneda() {
    const monto = parseFloat(document.querySelector("input").value);
    const moneda = document.querySelector("#moneda-convertir").value;

    if (isNaN(monto) || moneda === "Seleccione moneda") {
        alert("ingresa un monto CLP y moneda a convertir");
        return;
    }

    const tasasDeCambio = await obtenerTasasDeCambio();

    if (tasasDeCambio && tasasDeCambio[moneda]) {
        const tasa = tasasDeCambio[moneda].valor;
        const resultado = (monto / tasa).toFixed(2);
        document.querySelector(".resultados").textContent = `Resultado: ${resultado} ${moneda.toUpperCase()}`;
    } else {
        document.querySelector(".resultados").textContent = "Tasa de cambio no disponible.";
    }
}

// tipo de cambio

async function TipoDeMoneda() {
    const tasasDeCambio = await obtenerTasasDeCambio();
    const selectMoneda = document.querySelector("#moneda-convertir");

    if (tasasDeCambio) {
        const monedas = ["dolar", "uf", "utm"];
        monedas.forEach(moneda => {
            const option = document.createElement("option");
            option.value = moneda;
            option.textContent = moneda.toUpperCase();
            selectMoneda.appendChild(option);
        });
    }
}

document.querySelector("button").addEventListener("click", convertirMoneda);
TipoDeMoneda();


// GRAFICO
async function getAndCreateDataToChart(moneda) {
    const res = await fetch(`https://mindicador.cl/api/${moneda}`);
    const data = await res.json();

    // fechas y valores de los ultimos 10 dias
    const labels = data.serie.slice(0, 10).map((item) => item.fecha.split("T")[0]).reverse();
    const valores = data.serie.slice(0, 10).map((item) => item.valor).reverse();

    // Chart.js
    const datasets = [
        {
            label: `Historial de Conversión (CLP a ${moneda.toUpperCase()})`,
            borderColor: "rgb(75, 192, 192)",
            data: valores
        }
    ];

    return { labels, datasets };
}

async function renderGrafica() {
    const moneda = document.getElementById("moneda-convertir").value;
    const data = await getAndCreateDataToChart(moneda);

    const config = {
        type: "line",
        data
    };

    const myChart = document.getElementById("myChart");
    myChart.style.backgroundColor = "white";

    if (window.chart) {
        window.chart.destroy();
    }
    window.chart = new Chart(myChart, config);
}

document.getElementById("moneda-convertir").addEventListener("change", renderGrafica);

renderGrafica();
