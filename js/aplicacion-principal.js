// ==================================================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN Y MANEJADORES DE EVENTOS
// ==================================================================
let propertyImageBase64 = ''; // Variable global para guardar la imagen cargada

// Variable de estado para el modo de formulario
let isRegisterMode = false;

// ----------------------------------------------------
// FUNCIONES DE UTILIDAD Y CORE
// ----------------------------------------------------

function generateTimeOptions() {
    let options = '<option value="">-- Hora --</option>';
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            let displayHour = h % 12 || 12;
            let ampm = h < 12 ? 'AM' : 'PM';
            const displayTime = `${displayHour}:${String(m).padStart(2, '0')} ${ampm}`;
            options += `<option value="${time24}">${displayTime}</option>`;
        }
    }
    return options;
}

function initializeTimeSelectors() {
    const timeOptions = generateTimeOptions();
    document.getElementById('preferred-time-select').innerHTML = timeOptions;
    document.getElementById('prop-start-time').innerHTML = timeOptions;
    document.getElementById('prop-end-time').innerHTML = timeOptions;
}

// HACEMOS initializeApp GLOBALMENTE ACCESIBLE PARA EL HTML
window.initializeApp = function() {
    initializeDOMElements();
    initializeEventListeners(); // Los listeners están seguros de que el DOM existe
    initializeTimeSelectors();
    loadUserPreferences();
    loadFavorites();
    renderProperties();
    checkLoginStatus(); 
    showLoginMode(); 
};


function initializeDOMElements() {
    DOMElements = {
        phoneFrame: document.getElementById('phone-frame'),
        loginOverlay: document.getElementById('login-overlay'),
        mainContent: document.getElementById('main-content'),
        loginForm: document.getElementById('login-form'),
        loginEmail: document.getElementById('login-email'),
        loginPassword: document.getElementById('login-password'),
        loginSubmit: document.getElementById('login-submit'),
        menuBtn: document.getElementById('menu-btn'),
        profileBtn: document.getElementById('profile-btn'),
        searchInput: document.getElementById('search-input'),
        filterBtn: document.getElementById('filter-btn'),
        propertiesGrid: document.getElementById('properties-grid'),
        propertiesTitle: document.getElementById('properties-title'),
        userMenuOverlay: document.getElementById('user-menu-overlay'),
        userName: document.getElementById('user-name'),
        userEmail: document.getElementById('user-email'),
        logoutBtn: document.getElementById('logout-btn'),
        editProfileModal: document.getElementById('edit-profile-modal'),
        closeEditProfile: document.getElementById('close-edit-profile'),
        profileNameInput: document.getElementById('profile-name'),
        profileEmailInput: document.getElementById('profile-email'),
        profilePicInput: document.getElementById('profile-pic-input'),
        profilePicPreview: document.getElementById('profile-pic-preview'),
        changePicBtn: document.getElementById('change-pic-btn'),
        editProfileForm: document.getElementById('edit-profile-form'),
        themeToggle: document.getElementById('theme-toggle'),
        menuAvatarContainer: document.getElementById('menu-avatar-container'),
        menuAvatarImg: document.getElementById('menu-avatar-img'),
        favoritesCount: document.getElementById('favorites-count'),
        propertyModal: document.getElementById('property-modal'),
        modalContent: document.getElementById('modal-content'),
        closeModal: document.getElementById('close-modal'),
        filtersModal: document.getElementById('filters-modal'),
        filtersClose: document.getElementById('filters-close'),
        filtersReset: document.getElementById('filters-reset'),
        filtersApply: document.getElementById('filters-apply'),
        minPrice: document.getElementById('min-price'),
        maxPrice: document.getElementById('max-price'),
        appliedFilters: document.getElementById('applied-filters'),
        filterTags: document.getElementById('filter-tags'),
        clearFilters: document.getElementById('clear-filters'),
        supplierMenuItem: document.getElementById('supplier-menu-item'),
        supplierModal: document.getElementById('supplier-modal'),
        closeSupplierModal: document.getElementById('close-supplier-modal'),
        addPropertyForm: document.getElementById('add-property-form'),
        submitProperty: document.getElementById('submit-property'),
        supplierPropertiesList: document.getElementById('supplier-properties-list'),
        propImageInput: document.getElementById('prop-image-input'),
        propImagePreview: document.getElementById('prop-image-preview'),
        contactModal: document.getElementById('contact-modal'),
        closeContactModal: document.getElementById('close-contact-modal'),
        contactForm: document.getElementById('contact-form'),
        tabHome: document.getElementById('tab-home'),
        tabSearch: document.getElementById('tab-search'),
        tabFavorites: document.getElementById('tab-favorites'),
        tabProfile: document.getElementById('tab-profile'),
        cuteMascot: document.getElementById('cute-mascot'),
        assistantChat: document.getElementById('assistant-chat'),
        chatClose: document.getElementById('chat-close'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendMessage: document.getElementById('send-message'),
        voiceBtn: document.getElementById('voice-btn'),
        editProfileMenuItem: document.getElementById('edit-profile-menu-item'),
        
        // ELEMENTOS DEL LOGIN/REGISTRO
        adminMenuItem: document.getElementById('admin-menu-item'),
        adminModal: document.getElementById('admin-modal'),
        closeAdminModal: document.getElementById('close-admin-modal'),
        userListContainer: document.getElementById('user-list-container'),
        registerLink: document.getElementById('register-link'),
        loginWelcomeMessage: document.getElementById('login-welcome-message'),
        loginSwitchText: document.getElementById('login-switch-text'),
        phoneInputGroup: document.getElementById('phone-input-group'),
        registerPhone: document.getElementById('register-phone')
    };
}

function initializeEventListeners() {
    // Login
    // Hacemos el listener del formulario ASÍNCRONO
    DOMElements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Llama a la función correcta basada en el modo actual
        if (isRegisterMode) {
            await handleRegistration();
        } else {
            await handleLogin();
        }
    });
    
    // NUEVO LISTENER DE REGISTRO/LOGIN TOGGLE
    if (DOMElements.registerLink) { 
        DOMElements.registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (isRegisterMode) {
                showLoginMode(); // Cambiar a modo Login
            } else {
                showRegisterMode(); // Cambiar a modo Registro
            }
        });
    }
    
    // Navegación principal
    DOMElements.menuBtn.addEventListener('click', () => DOMElements.cuteMascot.style.display = 'flex');
    DOMElements.profileBtn.addEventListener('click', showUserMenu);
    DOMElements.logoutBtn.addEventListener('click', handleLogout);
    
    // Búsqueda y filtros
    DOMElements.searchInput.addEventListener('input', handleSearch);
    DOMElements.filterBtn.addEventListener('click', () => DOMElements.filtersModal.style.display = 'block');
    DOMElements.filtersClose.addEventListener('click', () => DOMElements.filtersModal.style.display = 'none');
    DOMElements.filtersReset.addEventListener('click', resetFilters);
    DOMElements.filtersApply.addEventListener('click', applyFilters);
    DOMElements.clearFilters.addEventListener('click', clearAllFilters);
    
    // Modal de propiedades
    DOMElements.closeModal.addEventListener('click', closePropertyModal);
    
    // Menú de usuario
    DOMElements.userMenuOverlay.addEventListener('click', (e) => { if (e.target === DOMElements.userMenuOverlay) closeUserMenu(); });
    DOMElements.editProfileMenuItem.addEventListener('click', openEditProfileModal);
    
    // Administrador
    if (DOMElements.adminMenuItem) {
        DOMElements.adminMenuItem.addEventListener('click', openAdminModal); // NUEVO LISTENER ADMIN
    }
    if (DOMElements.closeAdminModal) {
        DOMElements.closeAdminModal.addEventListener('click', closeAdminModal);
    }
    
    // Editar perfil
    DOMElements.closeEditProfile.addEventListener('click', closeEditProfileModal);
    DOMElements.editProfileForm.addEventListener('submit', handleEditProfile);
    DOMElements.changePicBtn.addEventListener('click', () => DOMElements.profilePicInput.click());
    DOMElements.profilePicInput.addEventListener('change', handleProfilePicChange);
    DOMElements.themeToggle.addEventListener('change', handleThemeToggle);
    
    // Pestañas inferiores
    DOMElements.tabHome.addEventListener('click', (e) => { e.preventDefault(); showHomeView(); });
    DOMElements.tabSearch.addEventListener('click', (e) => { e.preventDefault(); showSearchView(); });
    DOMElements.tabFavorites.addEventListener('click', (e) => { e.preventDefault(); showFavoritesView(); });
    DOMElements.tabProfile.addEventListener('click', (e) => { e.preventDefault(); showUserMenu(); });
    
    // Proveedor
    DOMElements.supplierMenuItem.addEventListener('click', openSupplierModal);
    DOMElements.closeSupplierModal.addEventListener('click', closeSupplierModal);
    DOMElements.addPropertyForm.addEventListener('submit', handleAddProperty);
    DOMElements.propImageInput.addEventListener('change', handlePropertyImageChange);
    
    // Contacto
    DOMElements.closeContactModal.addEventListener('click', closeContactModal);
    DOMElements.contactForm.addEventListener('submit', handleContactForm);
    
    // Asistente
    DOMElements.cuteMascot.addEventListener('click', openAssistantChat);
    DOMElements.chatClose.addEventListener('click', closeAssistantChat);
    DOMElements.sendMessage.addEventListener('click', handleSendMessage);
    DOMElements.chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSendMessage(); });
    DOMElements.voiceBtn.addEventListener('click', toggleVoiceRecognition);
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target === DOMElements.propertyModal) closePropertyModal();
        if (e.target === DOMElements.editProfileModal) closeEditProfileModal();
        if (e.target === DOMElements.supplierModal) closeSupplierModal();
        if (e.target === DOMElements.contactModal) closeContactModal();
        if (e.target === DOMElements.filtersModal) DOMElements.filtersModal.style.display = 'none';
        if (e.target === DOMElements.assistantChat) closeAssistantChat();
        if (DOMElements.adminModal && e.target === DOMElements.adminModal) closeAdminModal();
    });
}


// ----------------------------------------------------
// LÓGICA DE LOGIN Y REGISTRO (CONMUTADA)
// ----------------------------------------------------

function showRegisterMode() {
    isRegisterMode = true;
    DOMElements.loginWelcomeMessage.textContent = 'Crea tu Cuenta';
    DOMElements.loginSubmit.textContent = 'Registrarse';
    DOMElements.loginSwitchText.textContent = '¿Ya tienes cuenta?';
    DOMElements.registerLink.textContent = 'Inicia sesión aquí';
    DOMElements.phoneInputGroup.style.display = 'flex'; // Mostrar campo de teléfono
    DOMElements.loginForm.reset();
}

function showLoginMode() {
    isRegisterMode = false;
    DOMElements.loginWelcomeMessage.textContent = 'Bienvenido';
    DOMElements.loginSubmit.textContent = 'Iniciar Sesión';
    DOMElements.loginSwitchText.textContent = '¿No tienes cuenta?';
    DOMElements.registerLink.textContent = 'Regístrate aquí';
    DOMElements.phoneInputGroup.style.display = 'none'; // Ocultar campo de teléfono
    DOMElements.loginForm.reset();
}

async function handleRegistration() {
    // Usamos window.supabase para asegurarnos de que la variable esté en el alcance global
    const supabaseClient = window.supabase; 
    
    if (!supabaseClient || !supabaseClient.auth) {
        console.error('ERROR: El módulo supabase.auth no está cargado. Esto es una falla de conexión/inicialización.');
        showNotification('Error de conexión con el servidor de autenticación.', 'error');
        return;
    }

    const email = DOMElements.loginEmail.value;
    const password = DOMElements.loginPassword.value;
    const phone = DOMElements.registerPhone.value; // Recoger teléfono
    
    if (!email || !password || email.includes('@') === false || password.length < 6) {
        showNotification('Email válido y contraseña de 6+ caracteres son requeridos.', 'error');
        return;
    }
    if (phone && phone.length < 10) {
         showNotification('El teléfono debe tener 10 dígitos (opcional).', 'error');
        return;
    }

    const namePart = email.split('@')[0];

    // Llamada de registro a Supabase
    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { 
                user_name: namePart, 
                phone: phone || null 
            } 
        }
    });

    if (error) {
        // Mostrar el error específico de Supabase en la consola para depuración
        console.error('Error de registro de Supabase:', error); 
        showNotification(`Error al registrar: ${error.message}`, 'error');
    } else if (data.user) {
        showNotification('Registro exitoso. Iniciando sesión...', 'success');
        await setAuthenticatedUser(data.user);
    } else if (data.session === null) {
         showNotification('Registro exitoso. Revisa tu correo para confirmar la cuenta y luego inicia sesión.', 'info');
         showLoginMode(); 
    }
}

async function handleLogin() {
    const supabaseClient = window.supabase; 
    
    if (!supabaseClient || !supabaseClient.auth) {
        showNotification('Error: El cliente de autenticación no está listo.', 'error');
        return;
    }
    
    const email = DOMElements.loginEmail.value;
    const password = DOMElements.loginPassword.value;
    
    if (!email || !password) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    // 1. Iniciar sesión con Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) {
        showNotification(`Error de inicio de sesión: ${error.message}`, 'error');
        return;
    }
    
    // 2. Si es exitoso, configurar el usuario global
    await setAuthenticatedUser(data.user);
}

// ----------------------------------------------------
// FUNCIONES CRÍTICAS DE ESTADO Y PERMISOS
// ----------------------------------------------------

function setupPropertyEventListeners() {
    document.querySelectorAll('.property-card .action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.property-card');
            if (card) showPropertyDetails(card.dataset.id);
        });
    });
    
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.property-card');
            if (card) toggleFavorite(card.dataset.id);
        });
    });
}


/**
 * Obtiene el rol del usuario desde la tabla 'usuarios' de Supabase.
 * @param {string} userId - UUID del usuario autenticado.
 */
async function fetchUserRole(userId) {
    const supabaseClient = window.supabase;
    if (!supabaseClient) return 'usuario'; 
    
    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('rol')
        .eq('id', userId)
        .single();
        
    if (error) {
        console.error('Error al obtener el rol:', error.message);
        return 'usuario'; 
    }
    return data.rol;
}

/**
 * Configura el estado global del usuario (currentUser) y actualiza la UI.
 * @param {object} user - Objeto de usuario retornado por Supabase Auth.
 */
async function setAuthenticatedUser(user) {
    const userRole = await fetchUserRole(user.id);
    
    currentUser = { 
        id: user.id, 
        email: user.email, 
        name: user.user_metadata.user_name || user.email.split('@')[0], 
        phone: user.user_metadata.phone || '555-123-4567', 
        role: userRole 
    };
    
    // Guardar el estado en localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    DOMElements.loginOverlay.style.display = 'none';
    DOMElements.mainContent.style.display = 'block';
    updateUserMenu();
    loadSupplierProperties();
    updateMenuVisibility(); // Controla la visibilidad de los menús
    showNotification(`¡Bienvenido ${currentUser.name}! (Rol: ${currentUser.role})`, 'success');
}

/**
 * Controla la visibilidad de los menús "Proveedor" y "Administrador" basado en el rol.
 */
function updateMenuVisibility() {
    // Menú Proveedor
    const canBeSupplier = currentUser && (currentUser.role === 'proveedor' || currentUser.role === 'admin');
    DOMElements.supplierMenuItem.style.display = canBeSupplier ? 'flex' : 'none';

    // Menú Administrador (Nuevo)
    const isAdmin = currentUser && currentUser.role === 'admin';
    if (DOMElements.adminMenuItem) {
         DOMElements.adminMenuItem.style.display = isAdmin ? 'flex' : 'none';
    }
}

async function handleLogout() {
    const supabaseClient = window.supabase;
    // 1. Cerrar sesión en Supabase
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
        console.error("Error al cerrar sesión en Supabase:", error);
    }
    
    // 2. Limpiar estado local
    currentUser = { id: null, email: null, name: null, phone: null, role: null };
    localStorage.removeItem('currentUser'); 
    
    DOMElements.loginOverlay.style.display = 'flex';
    DOMElements.mainContent.style.display = 'none';
    closeUserMenu();
    showLoginMode(); // Asegurar modo Login al cerrar sesión
    showNotification('Sesión cerrada correctamente', 'info');
}

async function checkLoginStatus() {
    const supabaseClient = window.supabase;

    // 1. Obtener sesión actual de Supabase
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const savedPrefs = localStorage.getItem('userPreferences');
    
    if (user) {
        // 2. Usar la función para configurar el estado y la interfaz
        await setAuthenticatedUser(user);
    } else {
        // Si no hay sesión, intentar cargar del localStorage si es que existe
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateMenuVisibility();
        }
    }
    
    if (savedPrefs) {
        userPreferences = JSON.parse(savedPrefs);
        applyTheme(userPreferences.theme);
        updateAvatarDisplay(userPreferences.profilePic);
    }
}

function handleSearch() {
    currentFilters.searchTerm = DOMElements.searchInput.value;
    renderProperties();
    updateAppliedFilters();
}

function applyFilters() {
    const minPrice = DOMElements.minPrice.value ? parseInt(DOMElements.minPrice.value) : null;
    const maxPrice = DOMElements.maxPrice.value ? parseInt(DOMElements.maxPrice.value) : null;
    
    currentFilters.minPrice = minPrice;
    currentFilters.maxPrice = maxPrice;
    
    const activeBedOption = document.querySelector('.bedroom-option.active');
    currentFilters.minBedrooms = activeBedOption ? parseInt(activeBedOption.dataset.beds) : null;
    
    const activeBathOption = document.querySelector('.bathroom-option.active');
    currentFilters.minBathrooms = activeBathOption ? parseInt(activeBathOption.dataset.baths) : null;
    
    const activeSortOption = document.querySelector('.sort-option.active');
    currentFilters.sortBy = activeSortOption ? activeSortOption.dataset.sort : null;
    
    DOMElements.filtersModal.style.display = 'none';
    renderProperties();
    updateAppliedFilters();
}

function resetFilters() {
    document.querySelectorAll('.bedroom-option, .bathroom-option').forEach(btn => {
        if (btn.classList.contains('bedroom-option') && btn.dataset.beds === '3') {
            btn.classList.add('active');
        } else if (btn.classList.contains('bathroom-option') && btn.dataset.baths === '2') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    document.querySelectorAll('.sort-option').forEach(btn => btn.classList.remove('active'));
    
    DOMElements.minPrice.value = '';
    DOMElements.maxPrice.value = '';
}

function clearAllFilters() {
    currentFilters = { searchTerm: '', minPrice: null, maxPrice: null, minBedrooms: null, minBathrooms: null, sortBy: null };
    DOMElements.searchInput.value = '';
    resetFilters();
    renderProperties();
    updateAppliedFilters();
}

function updateAppliedFilters() {
    const activeFilters = [];
    if (currentFilters.searchTerm) activeFilters.push(`Búsqueda: "${currentFilters.searchTerm}"`);
    if (currentFilters.minPrice) activeFilters.push(`Precio min: $${currentFilters.minPrice.toLocaleString()}`);
    if (currentFilters.maxPrice) activeFilters.push(`Precio max: $${currentFilters.maxPrice.toLocaleString()}`);
    if (currentFilters.minBedrooms) activeFilters.push(`${currentFilters.minBedrooms}+ hab.`);
    if (currentFilters.minBathrooms) activeFilters.push(`${currentFilters.minBathoms}+ baños`);
    if (currentFilters.sortBy) {
        const sortTexts = { 'price-asc': 'Precio menor', 'price-desc': 'Precio mayor', 'bedrooms': 'Más habitaciones', 'area': 'Mayor superficie' };
        activeFilters.push(`Orden: ${sortTexts[currentFilters.sortBy]}`);
    }
    
    if (activeFilters.length > 0) {
        DOMElements.appliedFilters.style.display = 'block';
        DOMElements.filterTags.innerHTML = activeFilters.map(f => `<span class="filter-tag">${f}</span>`).join('');
    } else {
        DOMElements.appliedFilters.style.display = 'none';
    }
}

function showUserMenu() {
    if (!currentUser) return;
    updateUserMenu();
    updateMenuVisibility(); // Asegura la visibilidad al abrir el menú
    DOMElements.userMenuOverlay.style.display = 'block';
    DOMElements.userMenuOverlay.querySelector('.user-menu').classList.remove('closing');
    updateActiveTab('tab-profile');
}

function toggleFavorite(id) {
    if (favorites.has(id)) {
        favorites.delete(id);
        showNotification('Removido de favoritos', 'info');
    } else {
        favorites.add(id);
        showNotification('Agregado a favoritos', 'success');
    }
    updateFavoritesCount();
    updateFavoriteButtons();
    saveFavorites();
    if (isFavoritesViewActive) renderProperties();
}

function handleEditProfile(e) {
    e.preventDefault();
    const newName = DOMElements.profileNameInput.value.trim();
    if (!newName) {
        showNotification('El nombre no puede estar vacío', 'error');
        return;
    }
    
    // Actualizar nombre en currentUser para que el asistente y el login lo usen si se reabre
    currentUser.name = newName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    userPreferences.name = newName;
    userPreferences.theme = DOMElements.themeToggle.checked ? 'dark' : 'light';
    applyTheme(userPreferences.theme);
    updateUserMenu();
    closeEditProfileModal();
    saveUserPreferences();
    showNotification('Perfil actualizado correctamente', 'success');
}

function handleProfilePicChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userPreferences.profilePic = event.target.result;
            updateAvatarDisplay(userPreferences.profilePic);
            saveUserPreferences();
        };
        reader.readAsDataURL(file);
    }
}

function handleThemeToggle() {
    userPreferences.theme = DOMElements.themeToggle.checked ? 'dark' : 'light';
    applyTheme(userPreferences.theme);
    saveUserPreferences();
}

function showHomeView() {
    isFavoritesViewActive = false;
    DOMElements.searchInput.value = currentFilters.searchTerm;
    renderProperties();
    updateActiveTab('tab-home');
}

function showSearchView() {
    isFavoritesViewActive = false;
    DOMElements.searchInput.focus();
    updateActiveTab('tab-search');
}

function showFavoritesView() {
    isFavoritesViewActive = true;
    renderProperties();
    updateActiveTab('tab-favorites');
}

function openSupplierModal() {
    // DOBLE VERIFICACIÓN DE PERMISO
    if (!currentUser || (currentUser.role !== 'proveedor' && currentUser.role !== 'admin')) {
        showNotification('No tienes permiso para acceder al panel de Proveedor.', 'error');
        return;
    }
    loadSupplierProperties();
    DOMElements.supplierModal.style.display = 'block';
    DOMElements.supplierModal.classList.remove('closing');
    closeUserMenu();
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
    
    // Omitir lógica de obtención y validación...
    // ... (Tu lógica de obtención de datos de formulario) ...
    
    // Validaciones
    // ...
    
    // Crear nueva propiedad (SIMULACIÓN DE GUARDADO LOCAL)
    const newProperty = {
        id: Date.now().toString(),
        title: document.getElementById('prop-title').value,
        location: document.getElementById('prop-location').value,
        price: document.getElementById('prop-price').value,
        bedrooms: parseInt(document.getElementById('prop-bedrooms').value),
        bathrooms: parseInt(document.getElementById('prop-bathrooms').value),
        area: parseInt(document.getElementById('prop-area').value),
        description: document.getElementById('prop-description').value,
        features: document.getElementById('prop-features').value.split(',').map(f => f.trim()).filter(f => f),
        image: propertyImageBase64,
        availableDays: Array.from(document.querySelectorAll('input[name="prop_day"]:checked')).map(checkbox => checkbox.value).join(','),
        availableHours: `${document.getElementById('prop-start-time').value} - ${document.getElementById('prop-end-time').value}`,
        emailProveedor: currentUser.email,
        timestamp: new Date().toISOString()
    };
    
    // Guardar propiedad
    properties[newProperty.id] = newProperty;
    saveSupplierProperties();
    
    // Limpiar formulario y actualizar interfaz
    DOMElements.addPropertyForm.reset();
    propertyImageBase64 = '';
    DOMElements.propImagePreview.style.display = 'none';
    loadSupplierProperties();
    renderProperties();
    
    showNotification('Propiedad publicada exitosamente', 'success');
}

function handlePropertyImageChange(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userPreferences.profilePic = event.target.result;
            updateAvatarDisplay(userPreferences.profilePic);
            saveUserPreferences();
        };
        reader.readAsDataURL(file);
    }
}

function loadSupplierProperties() {
    const saved = localStorage.getItem(`supplier_properties_${currentUser.email}`);
    if (saved) {
        const supplierProps = JSON.parse(saved);
        Object.keys(supplierProps).forEach(id => {
            properties[id] = supplierProps[id];
        });
    }
    renderSupplierProperties();
}

function saveSupplierProperties() {
    const supplierProps = {};
    Object.keys(properties).forEach(id => {
        if (properties[id].emailProveedor === currentUser.email) {
            supplierProps[id] = properties[id];
        }
    });
    localStorage.setItem(`supplier_properties_${currentUser.email}`, JSON.stringify(supplierProps));
}

function renderSupplierProperties() {
    if (!currentUser) return;
    
    const supplierProps = Object.values(properties).filter(p => p.emailProveedor === currentUser.email);
    
    if (supplierProps.length === 0) {
        DOMElements.supplierPropertiesList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No tienes propiedades publicadas aún.</p>';
        return;
    }
    
    DOMElements.supplierPropertiesList.innerHTML = supplierProps.map(p => `
        <div class="supplier-property-item" data-id="${p.id}">
            <div class="supplier-property-image">
                <img src="${p.image}" alt="${p.title}">
            </div>
            <div class="supplier-property-info">
                <h4>${p.title}</h4>
                <p>${formatCurrencyUI(p.price)}</p>
                <p><small>${p.location}</small></p>
                <p><small>Disponibilidad: ${formatDisponibilidad(p.availableDays, p.availableHours)}</small></p>
            </div>
            <button class="edit-property-btn" onclick="setupEditForm('${p.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
        </div>
    `).join('');
}

function setupEditForm(propertyId) {
    const property = properties[propertyId];
    if (!property) return;
    
    // Llenar formulario con datos existentes
    document.getElementById('prop-title').value = property.title;
    document.getElementById('prop-location').value = property.location;
    document.getElementById('prop-price').value = property.price;
    document.getElementById('prop-bedrooms').value = property.bedrooms;
    document.getElementById('prop-bathrooms').value = property.bathrooms;
    document.getElementById('prop-area').value = property.area;
    document.getElementById('prop-description').value = property.description;
    document.getElementById('prop-features').value = property.features.join(', ');
    
    // Llenar disponibilidad
    const days = property.availableDays.split(',');
    document.querySelectorAll('input[name="prop_day"]').forEach(checkbox => {
        checkbox.checked = days.includes(checkbox.value);
    });
    
    const [startTime, endTime] = property.availableHours.split(' - ');
    document.getElementById('prop-start-time').value = startTime;
    document.getElementById('prop-end-time').value = endTime;
    
    // Llenar imagen
    propertyImageBase64 = property.image;
    DOMElements.propImagePreview.src = propertyImageBase64;
    DOMElements.propImagePreview.style.display = 'block';
    
    // Cambiar formulario a modo edición
    document.getElementById('supplier-form-title').textContent = 'Editar Propiedad';
    document.getElementById('submit-property').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    
    // Cambiar el evento del formulario
    DOMElements.addPropertyForm.onsubmit = (e) => handleUpdateProperty(e, propertyId);
    
    // Desplazar al formulario
    document.querySelector('.property-form').scrollIntoView({ behavior: 'smooth' });
}

function handleUpdateProperty(e, propertyId) {
    e.preventDefault();
    
    // Obtener valores actualizados
    const title = document.getElementById('prop-title').value;
    const location = document.getElementById('prop-location').value;
    const price = document.getElementById('prop-price').value;
    const bedrooms = document.getElementById('prop-bedrooms').value;
    const bathrooms = document.getElementById('prop-bathrooms').value;
    const area = document.getElementById('prop-area').value;
    const description = document.getElementById('prop-description').value;
    const features = document.getElementById('prop-features').value.split(',').map(f => f.trim()).filter(f => f);
    
    // Obtener disponibilidad actualizada
    const selectedDays = Array.from(document.querySelectorAll('input[name="prop_day"]:checked'))
        .map(checkbox => checkbox.value);
    const startTime = document.getElementById('prop-start-time').value;
    const endTime = document.getElementById('prop-end-time').value;
    
    // Validaciones
    if (selectedDays.length === 0) {
        showNotification('Selecciona al menos un día de disponibilidad', 'error');
        return;
    }
    
    if (!startTime || !endTime) {
        showNotification('Selecciona horario de inicio y fin', 'error');
        return;
    }
    
    // Actualizar propiedad
    properties[propertyId] = {
        ...properties[propertyId],
        title,
        location,
        price,
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        area: parseInt(area),
        description,
        features,
        image: propertyImageBase64,
        availableDays: selectedDays.join(','),
        availableHours: `${startTime} - ${endTime}`
    };
    
    // Guardar cambios
    saveSupplierProperties();
    
    // Restaurar formulario a modo añadir
    resetSupplierForm();
    
    // Actualizar interfaz
    loadSupplierProperties();
    renderProperties();
    
    showNotification('Propiedad actualizada exitosamente', 'success');
}

function resetSupplierForm() {
    DOMElements.addPropertyForm.reset();
    propertyImageBase64 = '';
    DOMElements.propImagePreview.style.display = 'none';
    document.getElementById('supplier-form-title').textContent = 'Añadir Nueva Propiedad';
    document.getElementById('submit-property').innerHTML = '<i class="fas fa-plus-circle"></i> Publicar Propiedad';
    DOMElements.addPropertyForm.onsubmit = handleAddProperty;
}

function handleContactForm(e) {
    e.preventDefault();
    const propertyId = DOMElements.contactModal.dataset.propertyId;
    const property = properties[propertyId];
    
    if (!property) {
        showNotification('Error: propiedad no encontrada', 'error');
        return;
    }
    
    showNotification('Mensaje enviado al vendedor. Te contactaremos pronto.', 'success');
    closeContactModal();
}

function openAssistantChat() {
    DOMElements.assistantChat.style.display = 'block';
    DOMElements.assistantChat.classList.remove('closing');
}

function closeAssistantChat() {
    DOMElements.assistantChat.classList.add('closing');
    setTimeout(() => {
        DOMElements.assistantChat.style.display = 'none';
        DOMElements.assistantChat.classList.remove('closing');
    }, 300);
}

function handleSendMessage() {
    const message = DOMElements.chatInput.value.trim();
    if (!message) return;
    
    addMessageToChat('user', message);
    DOMElements.chatInput.value = '';
    
    // Simular respuesta del asistente
    setTimeout(() => {
        const responses = [
            "¡Hola! Soy Boli, tu asistente virtual. ¿En qué puedo ayudarte con las propiedades?",
            "Puedo ayudarte a encontrar propiedades según tus necesidades específicas.",
            "¿Te interesa alguna propiedad en particular? Puedo darte más información.",
            "Recuerda que puedes usar los filtros para refinar tu búsqueda.",
            "¿Necesitas ayuda para contactar a un vendedor?",
            "Puedo mostrarte propiedades similares a las que te han gustado."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToChat('assistant', randomResponse);
    }, 1000);
}

function addMessageToChat(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
    DOMElements.chatMessages.appendChild(msgDiv);
    DOMElements.chatMessages.scrollTop = DOMElements.chatMessages.scrollHeight;
}

function toggleVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        showNotification('El reconocimiento de voz no está disponible en tu navegador', 'error');
        return;
    }
    
    if (!recognition) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        recognition.onstart = () => {
            isListening = true;
            DOMElements.voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            DOMElements.voiceBtn.style.color = '#e74c3c';
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            DOMElements.chatInput.value = transcript;
        };
        
        recognition.onend = () => {
            isListening = false;
            DOMElements.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            DOMElements.voiceBtn.style.color = '';
        };
        
        recognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
            isListening = false;
            DOMElements.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            DOMElements.voiceBtn.style.color = '';
        };
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

async function checkLoginStatus() {
    const supabaseClient = window.supabase;

    // 1. Obtener sesión actual de Supabase
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    const savedPrefs = localStorage.getItem('userPreferences');
    
    if (user) {
        // 2. Usar la función para configurar el estado y la interfaz
        await setAuthenticatedUser(user);
    } else {
        // Si no hay sesión, intentar cargar del localStorage si es que existe
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateMenuVisibility();
        }
    }
    
    if (savedPrefs) {
        userPreferences = JSON.parse(savedPrefs);
        applyTheme(userPreferences.theme);
        updateAvatarDisplay(userPreferences.profilePic);
    }
}

function loadUserPreferences() {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
        userPreferences = JSON.parse(saved);
        applyTheme(userPreferences.theme);
        updateAvatarDisplay(userPreferences.profilePic);
    }
}

function saveUserPreferences() {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
}

function loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
        favorites = new Set(JSON.parse(saved));
        updateFavoritesCount();
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
}

// Event listeners para filtros de habitaciones y baños (SE MANTIENEN AQUÍ POR SI SON GLOBALES)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bedroom-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bedroom-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.querySelectorAll('.bathroom-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.bathroom-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    document.querySelectorAll('.sort-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sort-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// ==================================================================
// CONTROL DE CARGA FINAL (CRÍTICO PARA SOLUCIONAR EL ERROR)
// ==================================================================
// Eliminamos la dependencia de initializeApp en el DOMContentLoaded para eliminar el error.

window.onload = function() {
    // initializeApp se llama aquí, asegurando que todos los DOMElements y el SDK estén listos.
    initializeApp();
};


// Hacer funciones globales
window.setupEditForm = setupEditForm;
window.handleRoleChange = handleRoleChange;