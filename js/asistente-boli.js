// ==================================================================
// ASISTENTE IA (Boli)
// ==================================================================

function formatCurrencyChat(value) {
    const number = parseInt(value);
    return `${number.toLocaleString('es-MX')} de pesos`;
}

function setupAssistantListeners() {
    document.getElementById('cute-mascot').addEventListener('click', () => {
        DOMElements.assistantChat.style.display = 'block';
        toggleVoiceRecognition();
    });
    DOMElements.chatCloseBtn.addEventListener('click', () => {
        DOMElements.assistantChat.style.display = 'none';
        if (isListening) recognition.stop();
    });
    DOMElements.sendMessageBtn.addEventListener('click', sendMessage);
    DOMElements.chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
    DOMElements.voiceBtn.addEventListener('click', toggleVoiceRecognition);
}

function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { DOMElements.voiceBtn.style.display = 'none'; return; }
    recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    recognition.onstart = () => { isListening = true; DOMElements.voiceBtn.classList.add('listening'); };
    recognition.onend = () => { isListening = false; DOMElements.voiceBtn.classList.remove('listening'); };
    recognition.onresult = e => { DOMElements.chatInput.value = e.results[0][0].transcript; sendMessage(); };
    recognition.onerror = e => console.error('Error de reconocimiento de voz:', e.error);
}

function toggleVoiceRecognition() { if (recognition) isListening ? recognition.stop() : recognition.start(); }

function sendMessage() {
    const message = DOMElements.chatInput.value.trim();
    if (!message) return;
    addMessage(message, 'user');
    DOMElements.chatInput.value = '';
    setTimeout(() => {
        const response = processAssistantQuery(message);
        addMessage(response, 'agent');
        speakText(response);
    }, 800);
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
    DOMElements.chatMessages.appendChild(msgDiv);
    DOMElements.chatMessages.scrollTop = DOMElements.chatMessages.scrollHeight;
}

function speakText(text) {
    if (!('speechSynthesis'in window)) return;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX'; // Preferimos español de México

    // --- LÓGICA DE SELECCIÓN DE VOZ MASCULINA ---
    const vocesPreferidas = [
        "Juan",         
        "Microsoft Raul - Spanish (Mexico)", 
        "Diego",        
        "Jorge",        
        "Google español de Estados Unidos", 
        "Google español", 
        "Microsoft David - Spanish (Spain)" 
    ];

    let vozEncontrada = null;
    for (const nombreVoz of vocesPreferidas) {
        vozEncontrada = voices.find(v => v.name === nombreVoz);
        if (vozEncontrada) {
            break; 
        }
    }

    if (vozEncontrada) {
        utterance.voice = vozEncontrada;
    }
    speechSynthesis.speak(utterance);
}

function processAssistantQuery(msg) {
    const m = msg.toLowerCase().trim();
    const name = userPreferences.name ? `, ${userPreferences.name}` : '';
    
    // Simplificamos la detección para capturar "de que trata" y "que es"
    if (m.includes('que trata la aplicacion') || 
        m.includes('que es esta app') ||
        m.includes('para que sirve') || 
        m.includes('explicame')) 
    {
        return "Nuestra aplicación ArcaK se encarga de encontrar tu casa ideal al presupuesto que mejor se acomode a ti. También estoy yo, Boli, que te ayudaré a navegar en nuestra aplicación.";
    }

    if (m.match(/^(cómo estás|cómo te va|qué tal estás)/)) {
        return `¡Muy bien, gracias por preguntar${name}! Estoy aquí, listo para ayudarte a encontrar la casa de tus sueños. ¿Qué tienes en mente?`;
    }
    
    if (m.match(/^(hola|buen día|buenos días|buenas tardes|qué tal)/)) {
        return `¡Hola${name}! Es un gusto ayudarte. ¿Qué tipo de casa buscas hoy?`;
    }

    const nameMatch = m.match(/(?:me llamo|mi nombre es)\s*(\w+)/);
    if (nameMatch && nameMatch[1]) {
        const newName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
        userPreferences.name = newName;
        if(currentUser) currentUser.name = newName;
        localStorage.setItem('arcaK_preferences', JSON.stringify(userPreferences));
        updateUserMenu();
        return `¡Entendido, ${newName}! Mucho gusto en conocerte.`;
    }

    if (m.includes('gracias')) {
        return `¡De nada${name}! Si necesitas algo más, solo dime.`;
    }

    let filters = {};
    let responseParts = [];

    // ===== LÓGICA DE PRESUPUESTO (EXISTENTE) =====
    let budgetFound = false;
    if (m.includes('medio millon') || m.includes('medio millón')) {
        filters.maxPrice = 500000;
        responseParts.push(`con un presupuesto de hasta ${formatCurrencyChat(500000)}`);
        budgetFound = true;
    }
    if (!budgetFound) {
        const budgetMatch = m.match(/(?:tengo|presupuesto de|con|hasta|de|por)\s*\$?([\d,.\s]+)/) || m.match(/([\d,.\s]+)\s*(?:pesos|mxn)/);
        if (budgetMatch && budgetMatch[1]) {
            const cleanNumberString = budgetMatch[1].replace(/[,|\s]/g, '');
            let budget = parseFloat(cleanNumberString);
            if (m.includes('millon') || m.includes('millones')) {
                if (!isNaN(budget)) budget *= 1000000;
            }
            if (!isNaN(budget)) {
                filters.maxPrice = budget;
                responseParts.push(`con un presupuesto de hasta ${formatCurrencyChat(budget)}`);
            }
        }
    }

    // ===== LÓGICA DE UBICACIÓN (EXISTENTE) =====
    if (m.includes('zihuatanejo') || m.includes('ixtapa')) {
        filters.searchTerm = 'zihuatanejo';
        responseParts.push('en Zihuatanejo');
    } else if (m.includes('pantla')) {
        filters.searchTerm = 'pantla';
        responseParts.push('en Pantla');
    } else if (m.includes('san jose') || m.includes('san josé')) {
        filters.searchTerm = 'san jose ixtapa';
        responseParts.push('en San José Ixtapa');
    } else if (m.includes('barrio viejo')) {
        filters.searchTerm = 'barrio viejo';
        responseParts.push('en Barrio Viejo');
    }

    // ===== LÓGICA DE CARACTERÍSTICAS (EXISTENTE) =====
    if (m.match(/caras|lujo|costosas|de lujo|más altas/)) {
        filters.sortBy = 'price-desc';
        responseParts.push('las más lujosas');
    } else if (m.match(/baratas|económicas|económico|barato|más bajas/)) {
        filters.sortBy = 'price-asc';
        responseParts.push('las más económicas');
    }

    if (m.includes('vista al mar') || m.includes('vista a la bahia')) {
        filters.searchTerm = 'vista a'; // Busca "vista a la bahía" y "vista al mar"
        responseParts.push('con vista al mar o a la bahía');
    } else if (m.includes('jardín')) {
        filters.searchTerm = 'jardín';
        responseParts.push('con jardín');
    } else if (m.includes('piscina') || m.includes('alberca')) {
        filters.searchTerm = 'alberca';
        responseParts.push('con alberca');
    }
    
    const roomsMatch = m.match(/(\d+)\s*(?:habitaciones|cuartos|recámaras)/);
    if (roomsMatch && roomsMatch[1]) {
        filters.minBedrooms = parseInt(roomsMatch[1]);
        responseParts.push(`con al menos ${roomsMatch[1]} habitaciones`);
    }

    if (Object.keys(filters).length > 0) {
        applyAssistantFilter(filters);
        let finalResponse = "¡Claro! ";
        if(responseParts.length > 0) {
            finalResponse += `Buscando casas ${responseParts.join(' y ')}.`;
        } else {
            finalResponse += "Aplicando los filtros que mencionaste.";
        }
        return finalResponse;
    }

    return `Lo siento${name}, no entendí muy bien. Puedes repetirlo.`;
}


function applyAssistantFilter(filters) {
    clearAllFilters();
    Object.assign(currentFilters, filters);
    DOMElements.searchInput.value = filters.searchTerm || '';
    DOMElements.assistantChat.style.display = 'none';
    showNotification('Boli ha ajustado los filtros por ti', 'info');
    renderProperties();
}