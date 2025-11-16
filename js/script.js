// Candidatos predefinidos con fotos (imágenes locales)
const candidatos = [
    { 
        nombre: "Franco parisi", 
        foto: "images/pari.jpg" 
    },
    { 
        nombre: "Jeannette Jara", 
        foto: "images/jara.jpg" 
    },
    { 
        nombre: "MEO", 
        foto: "images/meo.jpg" 
    },
    { 
        nombre: "Johannes Kaiser", 
        foto: "images/kai.jpg" 
    },
    { 
        nombre: "Jose Kast", 
        foto: "images/kakas.jpg" 
    },
    { 
        nombre: "Eduardo Artes", 
        foto: "images/arte.jpg" 
    },
    { 
        nombre: "Evelyn Matthei", 
        foto: "images/mate.jpg" 
    },
    { 
        nombre: "Maicol", 
        foto: "images/haro.jpg" 
    }
];

// ✅ CONFIGURACIÓN AIRTABLE - REEMPLAZA CON TUS DATOS
const AIRTABLE_CONFIG = {
    BASE_ID: 'appsQFN6YZHx5OAxHI', // Reemplaza con tu Base ID
    API_KEY: 'patfW1kdjbenRsNH1.0f41e6c98e0609e6b877762c64dffbcc43ddbb4e2188f6891c80004ef3fcbcf3', // Reemplaza con tu API Key
    TABLE_NAME: 'Table 1' // Normalmente es "Tabla 1" por defecto
};

// URLs de Airtable
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_CONFIG.BASE_ID}/${encodeURIComponent(AIRTABLE_CONFIG.TABLE_NAME)}`;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación...');
    inicializarCandidatos();
    actualizarTotal();
    
    // Event listeners
    document.getElementById('submitBtn').addEventListener('click', guardarPronostico);
    document.getElementById('resultsBtn').addEventListener('click', mostrarResultados);
    document.querySelector('.close').addEventListener('click', cerrarModal);
});

function inicializarCandidatos() {
    const container = document.getElementById('candidatesContainer');
    container.innerHTML = '';
    
    candidatos.forEach((candidato, index) => {
        const candidateDiv = document.createElement('div');
        candidateDiv.className = 'candidate-item';
        candidateDiv.innerHTML = `
            <div class="photo-container">
                <img src="${candidato.foto}" alt="${candidato.nombre}" class="candidate-photo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDMTIgMjQgMjggMjQgMzIgMzIiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='">
            </div>
            <div class="candidate-name">${candidato.nombre}</div>
            <div class="slider-container">
                <div class="slider-wrapper">
                    <input type="range" 
                           class="percentage-slider" 
                           min="0" 
                           max="100" 
                           step="0.1" 
                           value="0"
                           oninput="actualizarSlider(this)">
                    <div class="slider-track">
                        <div class="slider-fill"></div>
                    </div>
                </div>
                <div class="input-container">
                    <input type="number" 
                           class="percentage-input" 
                           min="0" 
                           max="100" 
                           step="0.1" 
                           value="0.0"
                           oninput="actualizarDesdeInput(this)"
                           onchange="actualizarDesdeInput(this)">
                    <span class="percent-symbol">%</span>
                </div>
            </div>
        `;
        container.appendChild(candidateDiv);
    });
}

function actualizarSlider(slider) {
    const value = parseFloat(slider.value).toFixed(1);
    const sliderContainer = slider.closest('.slider-container');
    const input = sliderContainer.querySelector('.percentage-input');
    const fill = sliderContainer.querySelector('.slider-fill');
    
    input.value = value;
    fill.style.width = value + '%';
    actualizarTotal();
}

function actualizarDesdeInput(input) {
    let value = parseFloat(input.value) || 0;
    if (value < 0) value = 0;
    if (value > 100) value = 100;
    
    input.value = value.toFixed(1);
    const sliderContainer = input.closest('.slider-container');
    const slider = sliderContainer.querySelector('.percentage-slider');
    const fill = sliderContainer.querySelector('.slider-fill');
    
    slider.value = value;
    fill.style.width = value + '%';
    actualizarTotal();
}

function actualizarTotal() {
    const inputs = document.querySelectorAll('.percentage-input');
    let total = 0;
    
    inputs.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    const totalElement = document.getElementById('totalPercentage');
    const validationMessage = document.getElementById('validationMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    totalElement.textContent = total.toFixed(1) + '%';
    
    if (Math.abs(total - 100) < 0.1) {
        totalElement.className = 'valid';
        validationMessage.textContent = '';
        submitBtn.disabled = false;
    } else {
        totalElement.className = 'invalid';
        validationMessage.textContent = `La suma debe ser 100% (actual: ${total.toFixed(1)}%)`;
        submitBtn.disabled = true;
    }
}

// ✅ FUNCIÓN MEJORADA PARA GUARDAR EN AIRTABLE
async function guardarPronostico() {
    const nombre = document.getElementById('participantName').value.trim();
    
    if (!nombre) {
        alert('Por favor ingresa tu nombre o apodo');
        return;
    }
    
    // Validar que la suma sea 100%
    const inputs = document.querySelectorAll('.percentage-input');
    let total = 0;
    inputs.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    if (Math.abs(total - 100) >= 0.1) {
        alert('La suma de los porcentajes debe ser exactamente 100%');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    
    try {
        // Recolectar datos de candidatos
        const candidatosData = [];
        const candidateItems = document.querySelectorAll('.candidate-item');
        
        candidateItems.forEach((item, index) => {
            const nombreCandidato = item.querySelector('.candidate-name').textContent;
            const porcentaje = parseFloat(item.querySelector('.percentage-input').value) || 0;
            
            candidatosData.push({
                nombre: nombreCandidato,
                porcentaje: porcentaje
            });
        });
        
        // Preparar datos para Airtable
        const recordData = {
            "fields": {
                "Nombre": nombre,
                "Fecha": new Date().toISOString(),
                "Candidatos": JSON.stringify(candidatosData)
            }
        };
        
        // Enviar a Airtable
        const response = await fetch(AIRTABLE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(recordData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error al guardar');
        }
        
        const result = await response.json();
        
        alert('✅ ¡Pronóstico guardado exitosamente en Airtable!');
        limpiarFormulario();
        
        // Mostrar resultados actualizados
        await mostrarResultados();
        
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('❌ Error al guardar el pronóstico: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Pronóstico';
    }
}

// ✅ FUNCIÓN MEJORADA: MOSTRAR RESULTADOS DESDE AIRTABLE
async function mostrarResultados() {
    const resultsList = document.getElementById('resultsList');
    const modal = document.getElementById('resultsModal');
    
    // Mostrar loading
    resultsList.innerHTML = '<div class="loading-message"><p>🔄 Cargando pronósticos...</p></div>';
    modal.style.display = 'block';
    
    try {
        const pronosticos = await cargarResultadosAirtable();
        
        if (!pronosticos || pronosticos.length === 0) {
            resultsList.innerHTML = '<p>📝 Aún no hay pronósticos. ¡Sé el primero en participar!</p>';
            return;
        }
        
        mostrarResultadosEnModal(pronosticos);
        
    } catch (error) {
        console.error('❌ Error cargando resultados:', error);
        resultsList.innerHTML = `
            <div class="error-message">
                <p>❌ Error cargando pronósticos</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">${error.message}</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">Verifica tu conexión e intenta nuevamente.</p>
            </div>
        `;
    }
}

// ✅ FUNCIÓN AUXILIAR: CARGAR RESULTADOS DESDE AIRTABLE
async function cargarResultadosAirtable() {
    try {
        const url = `${AIRTABLE_API_URL}?sort[0][field]=Fecha&sort[0][direction]=desc`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_CONFIG.API_KEY}`,
            },
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convertir datos de Airtable a nuestro formato
        const pronosticos = data.records.map(record => {
            try {
                return {
                    nombre: record.fields.Nombre || 'Anónimo',
                    fecha: formatFecha(record.fields.Fecha),
                    candidatos: JSON.parse(record.fields.Candidatos || '[]')
                };
            } catch (e) {
                return {
                    nombre: record.fields.Nombre || 'Anónimo',
                    fecha: formatFecha(record.fields.Fecha),
                    candidatos: []
                };
            }
        });
        
        return pronosticos;
        
    } catch (error) {
        console.error('Error en cargarResultadosAirtable:', error);
        throw error;
    }
}

// ✅ FUNCIÓN AUXILIAR: FORMATEAR FECHA
function formatFecha(fechaISO) {
    try {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Fecha no disponible';
    }
}

// ✅ FUNCIÓN AUXILIAR: MOSTRAR RESULTADOS EN MODAL
function mostrarResultadosEnModal(pronosticos) {
    const resultsList = document.getElementById('resultsList');
    
    resultsList.innerHTML = pronosticos.map((pronostico, index) => {
        const fondoClase = index % 2 === 0 ? 'fondo-par' : 'fondo-impar';
        
        const candidatosData = Array.isArray(pronostico.candidatos) ? pronostico.candidatos : [];
        const candidatosOrdenados = [...candidatosData].sort((a, b) => b.porcentaje - a.porcentaje);
        
        return `
        <div class="result-item ${fondoClase}">
            <div class="result-header">
                <h3 class="participant-name">${pronostico.nombre}</h3>
                <div class="vote-info">
                    <span class="vote-date">${pronostico.fecha}</span>
                </div>
            </div>
            <div class="candidate-results">
                ${candidatosOrdenados.map((candidato, index) => {
                    const esSegundaVuelta = index < 2;
                    const claseSegundaVuelta = esSegundaVuelta ? 'segunda-vuelta' : '';
                    const esCompacto = index >= 2;
                    const claseCompacto = esCompacto ? 'candidato-compacto' : '';
                    
                    const candidatoOriginal = candidatos.find(c => c.nombre === candidato.nombre);
                    const foto = candidatoOriginal ? candidatoOriginal.foto : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDMyQzEyIDI0IDI4IDI0IDMyIDMyIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K=';
                    
                    if (esSegundaVuelta) {
                        return `
                        <div class="candidate-result ${claseSegundaVuelta}">
                            <div class="background-rank">${index + 1}</div>
                            <div class="candidate-content">
                                <div class="photo-container">
                                    <img src="${foto}" alt="${candidato.nombre}" class="candidate-photo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NjdlZWEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04IDMzQzEyIDI1IDI4IDI1IDMyIDMzIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K='">
                                </div>
                                <div class="candidate-info">
                                    <div class="candidate-name">${candidato.nombre}</div>
                                    <div class="candidate-percentage">${(candidato.porcentaje || 0).toFixed(1)}%</div>
                                </div>
                            </div>
                            <div class="segunda-vuelta-badge">${index === 0 ? '🥇 2DA VUELTA' : '🥈 2DA VUELTA'}</div>
                        </div>
                        `;
                    } else {
                        return `
                        <div class="candidate-result ${claseCompacto}">
                            <div class="compact-content">
                                <div class="compact-rank">${index + 1}°</div>
                                <div class="compact-name">${candidato.nombre}</div>
                                <div class="compact-percentage">${(candidato.porcentaje || 0).toFixed(1)}%</div>
                            </div>
                        </div>
                        `;
                    }
                }).join('')}
            </div>
        </div>
        `;
    }).join('');
}

function limpiarFormulario() {
    document.getElementById('participantName').value = '';
    document.querySelectorAll('.percentage-slider').forEach(slider => {
        slider.value = 0;
        actualizarSlider(slider);
    });
    actualizarTotal();
}

function cerrarModal() {
    document.getElementById('resultsModal').style.display = 'none';
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('resultsModal');
    if (event.target === modal) {
        cerrarModal();
    }

});
