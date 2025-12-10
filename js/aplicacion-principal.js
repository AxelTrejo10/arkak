// ==================================================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN Y MANEJADORES DE EVENTOS
// ==================================================================
let propertyImageBase64 = ''; // Variable global para guardar la imagen cargada

// Función auxiliar para generar opciones de hora (HH:MM) cada 30 minutos
function generateTimeOptions() {
    let options = '<option value="">-- Hora --</option>';
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            
            // Formato de visualización 12 horas AM/PM
            let displayHour = h % 12 || 12;
            let ampm = h < 12 ? 'AM' : 'PM';
            const displayTime = `${displayHour}:${String(m).padStart(2, '0')} ${ampm}`;

            options += `<option value="${time24}">${displayTime} (${time24})</option>`;
        }
    }
    return options;
}

document.addEventListener('DOMContentLoaded', () => {
    DOMElements = {
        mainContent: document.getElementById('main-content'),
        loginOverlay: document.getElementById('login-overlay'),
        propertyModal: document.getElementById('property-modal'),
        modalContent: document.getElementById('modal-content'),
        closeModalBtn: document.getElementById('close-modal'),
        loginForm: document.getElementById('login-form'),
        loginSubmitBtn: document.getElementById('login-submit'),
        userMenuOverlay: document.getElementById('user-menu-overlay'),
        userName: document.getElementById('user-name'),
        userEmail: document.getElementById('user-email'),
        favoritesCount: document.getElementById('favorites-count'),
        logoutBtn: document.getElementById('logout-btn'),
        searchInput: document.getElementById('search-input'),
        filterBtn: document.getElementById('filter-btn'),
        filtersModal: document.getElementById('filters-modal'),
        filtersCloseBtn: document.getElementById('filters-close'),
        filtersResetBtn: document.getElementById('filters-reset'),
        filtersApplyBtn: document.getElementById('filters-apply'),
        appliedFilters: document.getElementById('applied-filters'),
        filterTags: document.getElementById('filter-tags'),
        clearFiltersBtn: document.getElementById('clear-filters'),
        propertiesGrid: document.getElementById('properties-grid'),
        propertiesTitle: document.getElementById('properties-title'),
        assistantChat: document.getElementById('assistant-chat'),
        chatCloseBtn: document.getElementById('chat-close'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendMessageBtn: document.getElementById('send-message'),
        voiceBtn: document.getElementById('voice-btn'),
        editProfileModal: document.getElementById('edit-profile-modal'),
        closeEditProfileBtn: document.getElementById('close-edit-profile'),
        editProfileForm: document.getElementById('edit-profile-form'),
        profileNameInput: document.getElementById('profile-name'),
        profileEmailInput: document.getElementById('profile-email'),
        // Referencias a botones de limpieza eliminadas
        tabHome: document.getElementById('tab-home'),
        tabSearch: document.getElementById('tab-search'),
        tabFavorites: document.getElementById('tab-favorites'),
        tabProfile: document.getElementById('tab-profile'),
        phoneFrame: document.getElementById('phone-frame'),
        themeToggle: document.getElementById('theme-toggle'),
        profilePicPreview: document.getElementById('profile-pic-preview'),
        profilePicInput: document.getElementById('profile-pic-input'),
        changePicBtn: document.getElementById('change-pic-btn'),
        menuAvatarImg: document.getElementById('menu-avatar-img'),
        menuAvatarContainer: document.getElementById('menu-avatar-container'),
        profileBtn: document.getElementById('profile-btn'),
        menuBtn: document.getElementById('menu-btn'),
        contactModal: document.getElementById('contact-modal'),
        closeContactModalBtn: document.getElementById('close-contact-modal'),
        contactForm: document.getElementById('contact-form'),
        // Referencias de Proveedor (simuladas)
        supplierMenuItem: document.getElementById('supplier-menu-item'),
        supplierModal: document.getElementById('supplier-modal'),
        closeSupplierModalBtn: document.getElementById('close-supplier-modal'),
        addPropertyForm: document.getElementById('add-property-form'),
        supplierPropertiesList: document.getElementById('supplier-properties-list'),
        supplierPropertiesSection: document.getElementById('supplier-properties-section'),
        propertyFormFields: document.getElementById('property-form-fields'),
        supplierFormTitle: document.getElementById('supplier-form-title'),
        // NUEVOS ELEMENTOS PARA IMAGEN
        propImageInput: document.getElementById('prop-image-input'),
        propImagePreview: document.getElementById('prop-image-preview'),
        propAvailableDays: document.getElementById('prop-available-days-fieldset'),
        propStartHour: document.getElementById('prop-start-time'), 
        propEndHour: document.getElementById('prop-end-time'),     
        preferredDate: document.getElementById('preferred-date'),
        preferredTimeSelect: document.getElementById('preferred-time-select'),
        
        // ELEMENTOS DE ADMIN/REGISTRO YA NO SE USAN EN ESTA VERSIÓN
        // adminMenuItem: document.getElementById('admin-menu-item'), // Se mantiene en HTML pero se ignora aquí.
        // registerForm: document.getElementById('register-form'),
        // showRegisterFormBtn: document.getElementById('show-register-form'),
        // showLoginFormBtn: document.getElementById('show-login-form'),
    };

    // POBLAR SELECTORES DE HORA AL INICIO
    const timeOptions = generateTimeOptions();
    if(DOMElements.propStartHour) DOMElements.propStartHour.innerHTML = timeOptions;
    if(DOMElements.propEndHour) DOMElements.propEndHour.innerHTML = timeOptions;
    if(DOMElements.preferredTimeSelect) DOMElements.preferredTimeSelect.innerHTML = timeOptions;

    initializeApp();
    setupEventListeners();
    
    if ('speechSynthesis' in window) {
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }
    initializeSpeechRecognition();
});

function initializeApp() {
    const savedUser = localStorage.getItem('arcaK_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        // AÑADIDO: Inicializar valores por defecto de contacto del usuario
        currentUser.phone = currentUser.phone || 'N/A';
        
        DOMElements.mainContent.style.display = 'block';
        DOMElements.loginOverlay.style.display = 'none';
        renderProperties();
    } else {
        DOMElements.loginOverlay.style.display = 'flex';
        DOMElements.mainContent.style.display = 'none';
    }

    const savedFavorites = localStorage.getItem('arcaK_favorites');
    if (savedFavorites) favorites = new Set(JSON.parse(savedFavorites));
    
    const savedPreferences = localStorage.getItem('arcaK_preferences');
    if (savedPreferences) {
        userPreferences = JSON.parse(savedPreferences);
        if (currentUser) {
            currentUser.name = userPreferences.name || currentUser.name;
        }
    }
    
    applyTheme(userPreferences.theme);
    updateAvatarDisplay(userPreferences.profilePic);
    if(currentUser) updateUserMenu();
    updateFavoriteButtons();
    updateFavoritesCount();
}

function setupEventListeners() {
    // LOGIN RESTAURADO A LA VERSIÓN SIMPLE (solo pide email)
    DOMElements.loginForm.addEventListener('submit', handleLogin); 
    DOMElements.logoutBtn.addEventListener('click', handleLogout);
    DOMElements.searchInput.addEventListener('input', handleSearch);
    DOMElements.filterBtn.addEventListener('click', () => DOMElements.filtersModal.style.display = 'block');
    DOMElements.filtersCloseBtn.addEventListener('click', () => DOMElements.filtersModal.style.display = 'none');
    DOMElements.filtersResetBtn.addEventListener('click', resetFilters);
    DOMElements.filtersApplyBtn.addEventListener('click', applyFilters);
    DOMElements.clearFiltersBtn.addEventListener('click', clearAllFilters);
    DOMElements.closeModalBtn.addEventListener('click', closePropertyModal);
    
    document.querySelectorAll('.bedroom-option, .bathroom-option, .sort-option').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.active').forEach(b => { if (b !== this) b.classList.remove('active'); });
            this.classList.toggle('active');
        });
    });

    DOMElements.tabHome.addEventListener('click', showHomeView);
    DOMElements.tabSearch.addEventListener('click', focusSearchView);
    DOMElements.tabFavorites.addEventListener('click', showFavoritesView);
    DOMElements.tabProfile.addEventListener('click', showUserMenu);
    DOMElements.profileBtn.addEventListener('click', showUserMenu);
    DOMElements.menuBtn.addEventListener('click', showUserMenu);

    // Conectar el nuevo elemento de menú a la función de proveedor
    if(DOMElements.supplierMenuItem) DOMElements.supplierMenuItem.addEventListener('click', openSupplierModal);
    if(DOMElements.closeSupplierModalBtn) DOMElements.closeSupplierModalBtn.addEventListener('click', closeSupplierModal);
    if(DOMElements.addPropertyForm) DOMElements.addPropertyForm.addEventListener('submit', handleAddProperty);
    
    // ADMINISTRACIÓN Y REGISTRO ELIMINADOS
    
    DOMElements.closeEditProfileBtn.addEventListener('click', closeEditProfileModal);
    DOMElements.editProfileForm.addEventListener('submit', handleProfileUpdate);
    
    // AÑADIDO: Evento para la carga de imágenes de la propiedad
    if(DOMElements.propImageInput) DOMElements.propImageInput.addEventListener('change', handleImageUpload);
    
    DOMElements.changePicBtn.addEventListener('click', () => DOMElements.profilePicInput.click());
    DOMElements.profilePicInput.addEventListener('change', handleProfilePicChange);
    DOMElements.themeToggle.addEventListener('change', handleThemeChange);

    document.querySelectorAll('.menu-item:not(.logout-btn)').forEach(item => item.addEventListener('click', (e) => {
        e.preventDefault();
        handleMenuItemClick(item);
    }));

    DOMElements.userMenuOverlay.addEventListener('click', e => { if (e.target === DOMElements.userMenuOverlay) closeUserMenu(); });
    
    DOMElements.closeContactModalBtn.addEventListener('click', closeContactModal);
    DOMElements.contactForm.addEventListener('submit', handleContactFormSubmit);

    setupAssistantListeners();
}

function setupPropertyEventListeners() {
    document.querySelectorAll('.property-card .action-btn, .property-card .property-image').forEach(el => el.addEventListener('click', e => {
        showPropertyDetails(e.target.closest('.property-card').dataset.id);
    }));
    document.querySelectorAll('.property-card .favorite-btn').forEach(btn => btn.addEventListener('click', e => {
        e.stopPropagation();
        toggleFavorite(e.target.closest('.property-card').dataset.id);
    }));
    updateFavoriteButtons();
}

// ==================================================================
// LÓGICA DE NAVEGACIÓN Y EVENTOS
// ==================================================================
function showHomeView(e) {
    if (e) e.preventDefault();
    isFavoritesViewActive = false;
    document.querySelector('.see-all').style.display = 'block';
    clearAllFilters();
    updateActiveTab('tab-home');
}

function focusSearchView(e) {
    e.preventDefault();
    DOMElements.mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    DOMElements.searchInput.focus({ preventScroll: true });
    updateActiveTab('tab-search');
}

function showFavoritesView(e) {
    if (e) e.preventDefault();
    isFavoritesViewActive = true;
    document.querySelector('.see-all').style.display = 'none';
    clearAllFilters();
    renderProperties();
    updateActiveTab('tab-favorites');
    closeUserMenu();
}

function showUserMenu(e) {
    if (e) e.preventDefault();
    if (!currentUser || !currentUser.email) { DOMElements.loginOverlay.style.display = 'flex'; return; }
    updateUserMenu();
    DOMElements.userMenuOverlay.style.display = 'block';
    updateActiveTab('tab-profile');
}

function handleMenuItemClick(item) {
    const action = item.querySelector('span').textContent.trim();
    switch(action) {
        case 'Editar Perfil': 
        openEditProfileModal();
        break;
        case 'Proveedor': 
            openSupplierModal();
            break;
        // ADMINISTRACIÓN ELIMINADA
        case 'Mis Favoritos':
            showFavoritesView(); 
        break;
        case 'Ayuda': document.getElementById('cute-mascot').click(); closeUserMenu(); break;
        default: showNotification(`${action} no está implementado aún.`); closeUserMenu();
    }
}

// LOGIN RESTAURADO A LA VERSIÓN SIMPLE (solo pide email/contraseña ficticia)
function handleLogin(e) {
    e.preventDefault();
    const email = DOMElements.loginForm.querySelector('#login-email').value;
    const password = DOMElements.loginForm.querySelector('#login-password').value; // Contraseña ficticia
    const phone = Math.floor(Math.random() * 9000000000) + 1000000000; // Simulación de teléfono
    
    // SIMULACIÓN DE VALIDACIÓN (Contraseña ficticia para cualquier email)
    if (password.length < 4) {
        showNotification('Contraseña demasiado corta.', 'error');
        return;
    }

    DOMElements.loginSubmitBtn.disabled = true;
    
    setTimeout(() => {
        currentUser = { email: email, name: email.split('@')[0], phone: phone };
        userPreferences.name = currentUser.name;
        
        if (DOMElements.loginForm.querySelector('#remember-me').checked) {
            localStorage.setItem('arcaK_user', JSON.stringify(currentUser));
        }
        localStorage.setItem('arcaK_preferences', JSON.stringify(userPreferences));
        
        DOMElements.loginOverlay.style.display = 'none';
        DOMElements.mainContent.style.display = 'block';
        showNotification(`¡Bienvenido, ${currentUser.name}!`, 'success');
        updateUserMenu();
        renderProperties();
        DOMElements.loginSubmitBtn.disabled = false;
    }, 1000);
}

function handleLogout() {
    currentUser = null;
    userPreferences = { name: null, theme: 'light', profilePic: null };
    localStorage.removeItem('arcaK_user');
    localStorage.removeItem('arcaK_preferences');
    localStorage.removeItem('arcaK_favorites');
    favorites.clear();
    showNotification('Sesión cerrada correctamente', 'info');
    closeUserMenu();
    DOMElements.loginOverlay.style.display = 'flex';
    DOMElements.mainContent.style.display = 'none';
    DOMElements.loginForm.reset();
    updateAvatarDisplay(null);
}

function handleProfileUpdate(e) {
    e.preventDefault();
    const newName = DOMElements.profileNameInput.value.trim();
    if (newName) {
        currentUser.name = newName;
        userPreferences.name = newName;
        if (localStorage.getItem('arcaK_user')) localStorage.setItem('arcaK_user', JSON.stringify(currentUser));
        localStorage.setItem('arcaK_preferences', JSON.stringify(userPreferences));
        updateUserMenu();
        showNotification('Perfil actualizado con éxito', 'success');
        closeEditProfileModal();
    } else {
        showNotification('El nombre no puede estar vacío', 'error');
    }
}

function handleProfilePicChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const imageUrl = e.target.result;
        userPreferences.profilePic = imageUrl;
        localStorage.setItem('arcaK_preferences', JSON.stringify(userPreferences));
        updateAvatarDisplay(imageUrl);
    };
    reader.readAsDataURL(file);
}

function handleThemeChange(event) {
    const newTheme = event.target.checked ? 'dark' : 'light';
    userPreferences.theme = newTheme;
    localStorage.setItem('arcaK_preferences', JSON.stringify(userPreferences));
    applyTheme(newTheme);
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;
    const message = document.getElementById('contact-message').value;
    const date = DOMElements.preferredDate.value;
    const time = DOMElements.preferredTimeSelect.value;
    const schedule = `${date} a las ${time}`;
    const propertyId = DOMElements.contactModal.dataset.propertyId;
    const property = properties[propertyId];

    if (!name || !email || !phone || !property || !date || !time) {
        showNotification('Por favor, completa todos los campos y elige una fecha y hora.', 'error');
        return;
    }
    
    // VALIDACIÓN DE HORARIO RIGUROSA
    const valid = validateSchedule(property, date, time);
    if (!valid) {
        showNotification('La fecha u hora seleccionada no está dentro de la disponibilidad del proveedor. Por favor, revisa la disponibilidad.', 'error');
        return;
    }


    const submitButton = DOMElements.contactForm.querySelector('.contact-submit');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    // *** SIMULACIÓN DE GENERACIÓN DE DOCUMENTOS Y ENVÍO ***
    const providerEmail = property.emailProveedor || 'contacto@arcak.com';
    const providerPhone = property.telefonoProveedor || 'N/A';
    
    const minutasCotizacion = `
        ------------------------------------------------
        DOCUMENTOS GENERADOS AUTOMÁTICAMENTE PARA EL CLIENTE:
        ------------------------------------------------
        CLIENTE: ${name} (Tel: ${phone}, Email: ${email})
        PROPIEDAD: ${property.title} (ID: ${propertyId})
        PRECIO: ${formatCurrencyUI(property.price)}
        FECHA DE INTERÉS: ${new Date(date).toLocaleDateString()}
        HORARIO SOLICITADO: ${schedule}
        
        (Estos documentos se han enviado a ${email} para revisión.)
    `;

    console.log(minutasCotizacion);
    
    // Simulación de envío de datos al proveedor
    console.log(`--- Nuevo Cliente en Propiedad ${propertyId} (${property.title}) ---`);
    console.log(`Proveedor Contactado: ${providerEmail}`);
    console.log(`Datos del Cliente: Nombre: ${name}, Teléfono: ${phone}, Horario: ${schedule}`);
    // **********************************************

    setTimeout(() => {
        closeContactModal();
        closePropertyModal(); 
        showNotification(`¡Documentos generados y enviados a tu correo (${email})! El proveedor (${providerEmail}) te contactará pronto.`, 'success');
        
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensaje';
        DOMElements.contactForm.reset();
    }, 1500);
}

// Lógica de Validación de Horario (Rigurosa)
function validateSchedule(property, dateStr, timeStr) {
    const rawDays = property.availableDays ? property.availableDays.toLowerCase().replace(/\s/g, '') : '';
    const rawHours = property.availableHours ? property.availableHours.trim() : '';

    if (rawDays.toLowerCase() === 'n/a' || rawHours.toLowerCase() === 'n/a' || !rawDays || !rawHours) {
        // Permitir si la disponibilidad del proveedor no está estructurada
        return true; 
    }
    
    // 1. VALIDACIÓN DEL DÍA DE LA SEMANA
    const dateObj = new Date(dateStr + 'T00:00:00');
    // Nota: Date.getDay() retorna 0 (Domingo) a 6 (Sábado)
    const dayNamesShort = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    const dayOfWeek = dayNamesShort[dateObj.getDay()];

    const daysMatch = rawDays.includes(dayOfWeek);

    if (!daysMatch) {
        return false; // El día de la semana no está disponible.
    }
    
    // 2. VALIDACIÓN DEL RANGO HORARIO
    const [startHourStr, endHourStr] = rawHours.split('-').map(s => s.trim());
    
    if (startHourStr && endHourStr && startHourStr.match(/^\d{2}:\d{2}$/) && endHourStr.match(/^\d{2}:\d{2}$/)) {
        const startTime = startHourStr; // HH:MM
        const endTime = endHourStr;   // HH:MM
        const requestedTime = timeStr; // Formato HH:MM

        // La hora solicitada debe ser MAYOR O IGUAL que la hora de inicio (>=)
        // Y MENOR que la hora de fin (<) para que la cita quepa dentro del rango.
        const timeMatch = requestedTime >= startTime && requestedTime < endTime;
        
        return timeMatch;
    }

    // Si el día coincide pero el formato de hora del proveedor es inválido o incompleto
    return false; 
}


// AÑADIDO: Funciones para la Gestión de Proveedores
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        propertyImageBase64 = e.target.result;
        DOMElements.propImagePreview.src = propertyImageBase64;
        DOMElements.propImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}


function openSupplierModal(e) {
    if (e) e.preventDefault();
    if (!currentUser) { showNotification('Debes iniciar sesión para usar el portal de proveedor.', 'error'); return; }

    closeUserMenu();
    DOMElements.supplierModal.style.display = 'block';
    
    // Al abrir el modal, renderiza la lista de propiedades del usuario actual
    renderSupplierProperties();
    
    // Configura el formulario para añadir por defecto
    setupAddForm();
}

function closeSupplierModal() {
    DOMElements.supplierModal.classList.add('closing');
    setTimeout(() => {
        DOMElements.supplierModal.style.display = 'none';
        DOMElements.supplierModal.classList.remove('closing');
    }, 300);
}

function handleAddProperty(e) {
    e.preventDefault();
    
    const form = DOMElements.addPropertyForm;
    const propertyId = form.dataset.editingId;

    // Verificar si estamos en modo edición y si la imagen no se cambió
    let imageSource = propertyImageBase64;
    if (propertyId && !imageSource) {
        imageSource = properties[propertyId].image;
    }
    
    // Si estamos en modo ADD y no hay imagen, mostrar error
    if (!propertyId && !imageSource) {
        showNotification('Por favor, selecciona una imagen para la propiedad.', 'error');
        return;
    }

    // 1. Recoger datos del formulario
    // LECTURA CORREGIDA: Recoger valores de los checkboxes
    const selectedDays = Array.from(DOMElements.propAvailableDays.querySelectorAll('input[name="prop_day"]:checked'))
        .map(checkbox => checkbox.value)
        .join(',');
    
    const newProperty = {
        title: document.getElementById('prop-title').value,
        location: document.getElementById('prop-location').value,
        price: document.getElementById('prop-price').value,
        bedrooms: parseInt(document.getElementById('prop-bedrooms').value),
        bathrooms: parseInt(document.getElementById('prop-bathrooms').value),
        area: parseInt(document.getElementById('prop-area').value),
        availableDays: selectedDays, // Campo estructurado (lun,mar,mie)
        availableHours: DOMElements.propStartHour.value + '-' + DOMElements.propEndHour.value, // Campo estructurado (HH:MM-HH:MM)
        description: document.getElementById('prop-description').value,
        features: document.getElementById('prop-features').value.split(',').map(f => f.trim()).filter(f => f.length > 0),
        image: imageSource, // Usar la imagen Base64
        emailProveedor: currentUser.email,
        telefonoProveedor: currentUser.phone || 'N/A', 
    };
    
    // 2. Simular carga
    const submitButton = form.querySelector('#submit-property');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    
    setTimeout(() => {
        if(propertyId) {
            // Modo Edición
            Object.assign(properties[propertyId], newProperty);
            showNotification('Propiedad actualizada con éxito.', 'success');
        } else {
            // Modo Adición
            const newId = Math.max(...Object.keys(properties).map(Number)) + 1;
            properties[newId] = newProperty;
            showNotification('Propiedad publicada con éxito. ID: ' + newId, 'success');
        }
        
        // 3. Resetear y cerrar
        form.reset();
        setupAddForm(); // Volver al modo Añadir
        renderProperties(); // Actualiza la vista principal
        renderSupplierProperties(); // Actualiza la lista de proveedor
        
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-plus-circle"></i> Publicar Propiedad';
        propertyImageBase64 = ''; // Limpiar Base64 global
    }, 1500);
}

function renderSupplierProperties() {
    if (!currentUser) return;

    // Filtrar solo las propiedades publicadas por el usuario actual
    const myProperties = Object.entries(properties).filter(([, p]) => p.emailProveedor === currentUser.email);

    let html = '';
    if (myProperties.length === 0) {
        html = '<p class="no-results" style="padding-top: 10px;">Aún no has publicado ninguna propiedad.</p>';
    } else {
        myProperties.forEach(([id, p]) => {
            html += `
                <div class="supplier-property-item">
                    <span class="supplier-prop-title">${p.title}</span>
                    <span class="supplier-prop-details">Precio: ${formatCurrencyUI(p.price)}</span>
                    <button class="edit-prop-btn" data-id="${id}" onclick="setupEditForm(${id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            `;
        });
    }
    DOMElements.supplierPropertiesList.innerHTML = html;
}

function setupAddForm() {
    DOMElements.supplierFormTitle.textContent = "Añadir Nueva Propiedad";
    DOMElements.addPropertyForm.reset();
    DOMElements.addPropertyForm.dataset.editingId = '';
    DOMElements.addPropertyForm.querySelector('#submit-property').innerHTML = '<i class="fas fa-plus-circle"></i> Publicar Propiedad';
    
    // Limpiar previsualización y selectores
    propertyImageBase64 = '';
    DOMElements.propImagePreview.src = '';
    DOMElements.propImagePreview.style.display = 'none';
    
    // Deseleccionar todos los días
    Array.from(DOMElements.propAvailableDays.querySelectorAll('input[name="prop_day"]')).forEach(checkbox => {
        checkbox.checked = false;
    });
    DOMElements.propStartHour.value = '';
    DOMElements.propEndHour.value = '';
}

function setupEditForm(id) {
    const p = properties[id];
    if (!p) return;

    DOMElements.supplierFormTitle.textContent = `Editar Propiedad ID: ${id}`;
    DOMElements.addPropertyForm.dataset.editingId = id;

    // Rellenar formulario con datos de la propiedad
    document.getElementById('prop-title').value = p.title;
    document.getElementById('prop-location').value = p.location;
    document.getElementById('prop-price').value = p.price;
    document.getElementById('prop-bedrooms').value = p.bedrooms;
    document.getElementById('prop-bathrooms').value = p.bathrooms;
    document.getElementById('prop-area').value = p.area;
    document.getElementById('prop-description').value = p.description;
    document.getElementById('prop-features').value = p.features.join(', ');
    
    // Rellenar selectores de disponibilidad
    const daysArray = p.availableDays ? p.availableDays.split(',') : [];
    Array.from(DOMElements.propAvailableDays.querySelectorAll('input[name="prop_day"]')).forEach(checkbox => {
        checkbox.checked = daysArray.includes(checkbox.value);
    });

    // Horas
    const [startHour = '', endHour = ''] = p.availableHours ? p.availableHours.split('-').map(s => s.trim()) : ['', ''];
    DOMElements.propStartHour.value = startHour;
    DOMElements.propEndHour.value = endHour;

    // Mostrar imagen actual
    propertyImageBase64 = p.image;
    DOMElements.propImagePreview.src = p.image;
    DOMElements.propImagePreview.style.display = 'block';
    
    // Cambiar texto del botón
    DOMElements.addPropertyForm.querySelector('#submit-property').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    
    showNotification(`Editando: ${p.title}`, 'info');
    
    // Desplazar a la parte superior del formulario de edición
    DOMElements.supplierModal.querySelector('.modal-content').scrollTop = 0;
}

function toggleFavorite(propertyId) {
    const id = String(propertyId);
    if (favorites.has(id)) {
        favorites.delete(id);
        showNotification('Eliminado de favoritos');
    } else {
        favorites.add(id);
        showNotification('Agregado a favoritos');
    }
    localStorage.setItem('arcaK_favorites', JSON.stringify([...favorites]));
    updateFavoriteButtons();
    updateFavoritesCount();
    if(isFavoritesViewActive) renderProperties();
}

function applyFilters() {
    currentFilters.minPrice = parseInt(document.getElementById('min-price').value) || null;
    currentFilters.maxPrice = parseInt(document.getElementById('max-price').value) || null;
    const activeBed = document.querySelector('.bedroom-option.active');
    currentFilters.minBedrooms = activeBed ? parseInt(activeBed.dataset.beds) : null;
    const activeBath = document.querySelector('.bathroom-option.active');
    currentFilters.minBedrooms = activeBath ? parseInt(activeBath.dataset.baths) : null;
    const activeSort = document.querySelector('.sort-option.active');
    currentFilters.sortBy = activeSort ? activeSort.dataset.sort : null;
    
    DOMElements.filtersModal.style.display = 'none';
    isFavoritesViewActive = false;
    updateActiveTab('tab-home');
    renderProperties();
}

function handleSearch() {
    currentFilters.searchTerm = DOMElements.searchInput.value;
    isFavoritesViewActive = false;
    updateActiveTab('tab-home');
    renderProperties();
}

function clearAllFilters() {
    Object.keys(currentFilters).forEach(key => currentFilters[key] = null);
    currentFilters.searchTerm = '';
    DOMElements.searchInput.value = '';
    resetFilters();
    renderProperties();
}

function resetFilters() {
    document.querySelectorAll('#filters-modal input').forEach(i => i.value = '');
    document.querySelectorAll('.bedroom-option, .bathroom-option, .sort-option').forEach(b => b.classList.remove('active'));
    document.querySelector('.bedroom-option[data-beds="3"]').classList.add('active');
    document.querySelector('.bathroom-option[data-baths="2"]').classList.add('active');
}