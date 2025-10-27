// ==================================================================
// FUNCIONALIDAD DE AGENDAR CITA
// ==================================================================

function openAppointmentModal(propertyId) {
    const property = properties[propertyId];
    if (!property) return;

    // Configurar título con nombre de la propiedad
    document.getElementById('appointment-title').textContent = `Agendar cita - ${property.title}`;
    
    // Configurar fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointment-date').min = today;
    
    // Generar opciones de hora basadas en la disponibilidad del proveedor
    const timeSelect = document.getElementById('appointment-time');
    timeSelect.innerHTML = '<option value="">Selecciona una hora</option>';
    
    if (property.availableHours && property.availableHours !== 'N/A') {
        const [startTime, endTime] = property.availableHours.split(' - ');
        
        if (startTime && endTime) {
            // Generar slots de 30 minutos dentro del rango disponible
            const slots = generateTimeSlots(startTime, endTime);
            slots.forEach(slot => {
                const option = document.createElement('option');
                option.value = slot.value;
                option.textContent = slot.display;
                timeSelect.appendChild(option);
            });
        }
    }
    
    // Mostrar modal
    document.getElementById('appointment-modal').style.display = 'flex';
}

function generateTimeSlots(startTime, endTime) {
    const slots = [];
    
    // Convertir tiempos a minutos desde medianoche
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    // Generar slots cada 30 minutos
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
        const time24 = minutesToTime(minutes);
        const displayTime = formatTimeDisplay(time24);
        slots.push({ value: time24, display: displayTime });
    }
    
    return slots;
}

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTimeDisplay(time24) {
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

function closeAppointmentModal() {
    document.getElementById('appointment-modal').style.display = 'none';
    document.getElementById('appointment-form').reset();
    document.getElementById('appointment-feedback').textContent = '';
}

// Manejar envío del formulario de cita
document.getElementById('appointment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedDate = document.getElementById('appointment-date').value;
    const selectedTime = document.getElementById('appointment-time').value;
    
    if (!selectedDate || !selectedTime) {
        document.getElementById('appointment-feedback').textContent = 'Por favor selecciona fecha y hora.';
        document.getElementById('appointment-feedback').style.color = 'red';
        return;
    }
    
    // Simular envío exitoso
    document.getElementById('appointment-feedback').textContent = '¡Cita agendada exitosamente! Te hemos enviado un correo de confirmación.';
    document.getElementById('appointment-feedback').style.color = 'green';
    
    // Cerrar modal después de 2 segundos
    setTimeout(() => {
        closeAppointmentModal();
    }, 2000);
});

// Cerrar modal al hacer clic en el botón de cerrar
document.getElementById('close-appointment').addEventListener('click', closeAppointmentModal);

// Cerrar modal al hacer clic fuera del contenido
document.getElementById('appointment-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAppointmentModal();
    }
});

// Hacer función global para abrir modal desde otros archivos
window.openAppointmentModal = openAppointmentModal;