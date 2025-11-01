// ==================================================================
// ArkaK - Agendamiento de citas (usar properties[].availableDays / availableHours)
// ==================================================================
(function(){
    const dayNames = ["dom","lun","mar","mie","jue","vie","sab"];
    let selectedProperty = null;

    function openAppointmentModal(propertyId){
        selectedProperty = properties[propertyId];
        if(!selectedProperty){ return; }

        const modal = document.getElementById("appointment-modal");
        const title = document.getElementById("appointment-title");
        const feedback = document.getElementById("appointment-feedback");
        const dateInput = document.getElementById("appointment-date");
        const timeInput = document.getElementById("appointment-time");

        title.textContent = `Agendar cita con ${selectedProperty.title || "proveedor"}`;
        feedback.textContent = "";
        feedback.style.color = "#dc3545";
        dateInput.value = "";
        timeInput.innerHTML = "";

        setupDateRange(dateInput);
        setupTimeOptions(timeInput, selectedProperty.availableHours);

        modal.style.display = "flex";
    }

    function closeAppointmentModal(){
        const modal = document.getElementById("appointment-modal");
        modal.style.display = "none";
    }

    function setupDateRange(input){
        const today = new Date(); today.setHours(0,0,0,0);
        const end = new Date(); end.setDate(today.getDate()+30);
        input.min = today.toISOString().split("T")[0];
        input.max = end.toISOString().split("T")[0];
        input.onchange = validateDateAgainstAvailability;
    }

    function setupTimeOptions(select, hoursRange){
        select.innerHTML = "";
        if(!hoursRange){ return; }
        const [start, end] = hoursRange.split("-");
        const s = parseInt(start.split(":")[0],10);
        const e = parseInt(end.split(":")[0],10);
        for(let h=s; h<=e; h++){
            const v = String(h).padStart(2,"0")+":00";
            const opt = document.createElement("option");
            opt.value = v; opt.textContent = v;
            select.appendChild(opt);
        }
    }

    function validateDateAgainstAvailability(){
        const feedback = document.getElementById("appointment-feedback");
        const dateInput = document.getElementById("appointment-date");
        if(!selectedProperty || !dateInput.value){ return; }
        const d = new Date(dateInput.value+"T00:00:00");
        const weekday = dayNames[d.getDay()];
        const allowed = (selectedProperty.availableDays || "").split(",");
        if(allowed.indexOf(weekday) === -1){
            feedback.textContent = "El proveedor no atiende el día seleccionado.";
        }else{
            feedback.textContent = "";
        }
    }

    function onSubmit(e){
        e.preventDefault();
        const feedback = document.getElementById("appointment-feedback");
        const dateInput = document.getElementById("appointment-date");
        const timeInput = document.getElementById("appointment-time");

        if(!selectedProperty){ feedback.textContent="Proveedor no válido."; return; }
        if(!dateInput.value || !timeInput.value){ feedback.textContent="Selecciona fecha y hora."; return; }

        const d = new Date(dateInput.value+"T00:00:00");
        const weekday = dayNames[d.getDay()];
        const allowedDays = (selectedProperty.availableDays || "").split(",");
        if(allowedDays.indexOf(weekday) === -1){
            feedback.textContent = "El proveedor no atiende ese día.";
            return;
        }

        const [start, end] = (selectedProperty.availableHours || "").split("-");
        if(timeInput.value < start || timeInput.value > end){
            feedback.textContent = "El proveedor no atiende en ese horario.";
            return;
        }

        feedback.style.color = "#198754";
        feedback.textContent = "✅ Cita agendada con éxito. Recibirás confirmación por correo.";
        setTimeout(closeAppointmentModal, 1800);
    }

    // Wire up close button and form
    document.addEventListener("DOMContentLoaded", function(){
        const closeBtn = document.getElementById("close-appointment");
        const form = document.getElementById("appointment-form");
        if(closeBtn){ closeBtn.addEventListener("click", closeAppointmentModal); }
        if(form){ form.addEventListener("submit", onSubmit); }

        // Enhance existing property cards by injecting "Agendar cita" button
        try{
            if(window.DOMElements && DOMElements.propertiesGrid){
                const grid = DOMElements.propertiesGrid;
                // Monkey-patch createPropertyCard to add button, if exists
                if(typeof window.createPropertyCard === "function"){
                    const original = window.createPropertyCard;
                    window.createPropertyCard = function(property){
                        const card = original(property);
                        try{
                            const btn = document.createElement("button");
                            btn.className = "action-button primary";
                            btn.innerHTML = '<i class="far fa-calendar-alt"></i> Agendar cita';
                            btn.addEventListener("click", function(){ openAppointmentModal(property.id); });
                            const actions = card.querySelector(".card-actions, .action-buttons, .property-info");
                            (actions || card).appendChild(btn);
                        }catch(err){ /* ignore */ }
                        return card;
                    };
                }
            }
        }catch(e){ /* ignore */ }
    });

    // Expose opener
    window.openAppointmentModal = openAppointmentModal;
})();
