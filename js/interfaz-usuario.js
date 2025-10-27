// ==================================================================
// MANIPULACIÓN DEL DOM Y RENDERIZADO DE UI
// ==================================================================

function loadVoices() { voices = speechSynthesis.getVoices(); }

function updateActiveTab(activeTabId) {
    document.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
    const activeTab = document.getElementById(activeTabId);
    if (activeTab) activeTab.classList.add('active');
}

function closeUserMenu() {
    DOMElements.userMenuOverlay.querySelector('.user-menu').classList.add('closing');
    setTimeout(() => {
        DOMElements.userMenuOverlay.style.display = 'none';
        DOMElements.userMenuOverlay.querySelector('.user-menu').classList.remove('closing');
    }, 300);
    updateActiveTab(isFavoritesViewActive ? 'tab-favorites' : 'tab-home');
}

function openEditProfileModal() {
    if (!currentUser) return;
    // Usar userPreferences.name para el asistente (puede ser distinto a currentUser.name si fue ajustado por Boli)
    // El menú de usuario muestra userPreferences.name || currentUser.name (ver updateUserMenu)
    DOMElements.profileNameInput.value = userPreferences.name || currentUser.name; 
    DOMElements.profileEmailInput.value = currentUser.email;
    DOMElements.profilePicPreview.src = userPreferences.profilePic || '';
    
    // Asegurarse de que el avatar por defecto se muestre si no hay imagen
    if (!userPreferences.profilePic) {
        document.getElementById('profile-pic-preview').style.display = 'none';
    } else {
        document.getElementById('profile-pic-preview').style.display = 'block';
    }
    
    DOMElements.themeToggle.checked = userPreferences.theme === 'dark';
    
    // Abrir el modal
    DOMElements.editProfileModal.style.display = 'flex'; // Usar flex para centrar
    DOMElements.editProfileModal.classList.remove('closing');
    closeUserMenu();
}

function closeEditProfileModal() {
    DOMElements.editProfileModal.classList.add('closing');
    setTimeout(() => {
        DOMElements.editProfileModal.style.display = 'none';
        DOMElements.editProfileModal.classList.remove('closing');
    }, 300);
}

function openContactModal(propertyId) {
    const property = properties[propertyId];
    if (!property) return;

    document.getElementById('contact-property-title').textContent = property.title;
    
    // MOSTRAR DISPONIBILIDAD DEL PROVEEDOR EN EL MODAL DE CONTACTO
    const disponibilidadInfo = formatDisponibilidad(property.availableDays, property.availableHours);
    document.getElementById('property-disponibility-info').textContent = `Disponibilidad: ${disponibilidadInfo}`;
    
    DOMElements.contactModal.dataset.propertyId = propertyId;
    
    if (currentUser) {
        document.getElementById('contact-name').value = userPreferences.name || currentUser.name;
        document.getElementById('contact-email').value = currentUser.email;
        document.getElementById('contact-phone').value = currentUser.phone || '';
    }

    DOMElements.contactModal.style.display = 'block';
    DOMElements.contactModal.classList.remove('closing');
}

function closeContactModal() {
    DOMElements.contactModal.classList.add('closing');
    setTimeout(() => {
        DOMElements.contactModal.style.display = 'none';
        DOMElements.contactModal.classList.remove('closing');
    }, 300);
}

// FUNCIÓN PARA FORMATEAR LA DISPONIBILIDAD EN TEXTO LEGIBLE
function formatDisponibilidad(days, hours) {
    if (!days || !hours || days === 'N/A' || hours === 'N/A') {
        return 'No especificada';
    }
    
    const dayNames = {
        'lun': 'Lunes',
        'mar': 'Martes', 
        'mie': 'Miércoles',
        'jue': 'Jueves',
        'vie': 'Viernes',
        'sab': 'Sábado',
        'dom': 'Domingo'
    };
    
    const daysArray = days.split(',');
    const formattedDays = daysArray.map(day => dayNames[day] || day).join(', ');
    
    return `${formattedDays} de ${hours}`;
}

function applyTheme(theme) {
    DOMElements.phoneFrame.classList.toggle('dark-mode', theme === 'dark');
    DOMElements.themeToggle.checked = theme === 'dark';
}

function updateAvatarDisplay(imageUrl) {
    const defaultIcon = DOMElements.menuAvatarContainer.querySelector('.default-avatar-icon');
    
    if (imageUrl) {
        DOMElements.menuAvatarImg.src = imageUrl;
        DOMElements.profilePicPreview.src = imageUrl;
        DOMElements.menuAvatarImg.style.display = 'block';
        DOMElements.profilePicPreview.style.display = 'block';
        if (defaultIcon) defaultIcon.style.display = 'none';
    } else {
        DOMElements.menuAvatarImg.src = '';
        DOMElements.profilePicPreview.src = '';
        DOMElements.menuAvatarImg.style.display = 'none';
        DOMElements.profilePicPreview.style.display = 'none';
        if (defaultIcon) defaultIcon.style.display = 'flex';
    }
}

function updateUserMenu() {
    if (currentUser) {
        // Muestra el nombre de las preferencias (ajustado por Boli) o el nombre por defecto del login
        DOMElements.userName.textContent = userPreferences.name || currentUser.name; 
        DOMElements.userEmail.textContent = currentUser.email;
        updateFavoritesCount();
        updateAvatarDisplay(userPreferences.profilePic);
    }
}

function updateFavoritesCount() { DOMElements.favoritesCount.textContent = favorites.size; }

function updateFavoriteButtons() {
    document.querySelectorAll('.property-card').forEach(card => {
        const btn = card.querySelector('.favorite-btn i');
        const isFav = favorites.has(card.dataset.id);
        btn.className = `fa-heart ${isFav ? 'fas' : 'far'}`;
        btn.style.color = isFav ? '#e74c3c' : '';
    });
}

function formatCurrencyUI(value) {
    const number = parseInt(value);
    return `$${number.toLocaleString('es-MX')} MXN`;
}

function renderProperties() {
    let propertiesToShow = Object.entries(properties);
    if (isFavoritesViewActive) {
        propertiesToShow = propertiesToShow.filter(([id]) => favorites.has(id));
        if (propertiesToShow.length === 0) {
            DOMElements.propertiesGrid.innerHTML = `<div class="no-results"><i class="fas fa-heart-broken"></i><h3>No tienes favoritos</h3><p>Toca el corazón en una casa para guardarla aquí.</p></div>`;
            DOMElements.propertiesTitle.textContent = 'Mis Favoritos (0)';
            return;
        }
    }
    
    let filtered = propertiesToShow.filter(([, p]) => {
        const price = parseInt(p.price);
        const term = currentFilters.searchTerm.toLowerCase();
        const searchMatch = !term || p.title.toLowerCase().includes(term) || p.location.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
        const priceMatch = (!currentFilters.minPrice || price >= currentFilters.minPrice) && (!currentFilters.maxPrice || price <= currentFilters.maxPrice);
        const bedsMatch = !currentFilters.minBedrooms || p.bedrooms >= currentFilters.minBedrooms;
        const bathsMatch = !currentFilters.minBathrooms || p.bathrooms >= currentFilters.minBathrooms;
        return searchMatch && priceMatch && bedsMatch && bathsMatch;
    }).map(([id, prop]) => ({ ...prop, id }));

    if (currentFilters.sortBy) {
        filtered.sort((a, b) => {
            const priceA = parseInt(a.price);
            const priceB = parseInt(b.price);
            switch (currentFilters.sortBy) {
                case 'price-asc': return priceA - priceB;
                case 'price-desc': return priceB - priceA;
                case 'bedrooms': return b.bedrooms - a.bedrooms;
                case 'area': return b.area - a.area;
                default: return 0;
            }
        });
    }

    DOMElements.propertiesGrid.innerHTML = '';
    const hasActiveFilters = Object.values(currentFilters).some(v => v !== null && v !== '');
    
    if (filtered.length === 0) {
        if (!isFavoritesViewActive) {
            DOMElements.propertiesGrid.innerHTML = `<div class="no-results"><i class="fas fa-home"></i><h3>No hay propiedades disponibles</h3><p>Los proveedores aún no han publicado casas.</p></div>`;
            DOMElements.propertiesTitle.textContent = 'No hay propiedades';
        }
    } else {
        filtered.forEach(p => DOMElements.propertiesGrid.appendChild(createPropertyCard(p)));
        if (isFavoritesViewActive) {
            DOMElements.propertiesTitle.textContent = `Mis Favoritos (${filtered.length})`;
        } else if (hasActiveFilters) {
            DOMElements.propertiesTitle.textContent = `${filtered.length} casa${filtered.length > 1 ? 's' : ''} encontrada${filtered.length > 1 ? 's' : ''}`;
        } else {
            DOMElements.propertiesTitle.textContent = 'Casas Disponibles';
        }
    }
    setupPropertyEventListeners();
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    const id = property.id;
    card.className = 'property-card';
    card.dataset.id = id;
    const isFavorite = favorites.has(id);
    card.innerHTML = `
        <div class="card-header">
            <span class="property-badge ${id % 2 === 0 ? 'nuevo' : 'oferta'}">${id % 2 === 0 ? 'Nuevo' : 'Oferta'}</span>
            <button class="favorite-btn"><i class="fa-heart ${isFavorite ? 'fas' : 'far'}" style="${isFavorite ? 'color:#e74c3c;' : ''}"></i></button>
        </div>
        <div class="property-image"><img src="${property.image}" alt="${property.title}"></div>
        <div class="property-info">
            <h3 class="property-title">${property.title}</h3>
            <p class="property-price">${formatCurrencyUI(property.price)}</p>
            <div class="property-details">
                <span><i class="fas fa-bed"></i> ${property.bedrooms}</span>
                <span><i class="fas fa-bath"></i> ${property.bathrooms}</span>
                <span><i class="fas fa-vector-square"></i> ${property.area}m²</span>
            </div>
            <p class="property-address"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
            <button class="action-btn">Ver Detalles</button>
        </div>`;
    return card;
}

function showPropertyDetails(id) {
    const p = properties[id];
    if (!p) return;
    
    // FORMATEAR DISPONIBILIDAD PARA MOSTRARLA EN DETALLES
    const disponibilidadFormateada = formatDisponibilidad(p.availableDays, p.availableHours);
    
    const providerInfo = `
        <p style="margin-top: 15px; color: #333; font-weight: 600;">
            Proveedor: ${p.emailProveedor || 'No especificado'}
        </p>
    `;

    DOMElements.modalContent.innerHTML = `
        <div class="property-gallery"><img src="${p.image}" alt="${p.title}"></div>
        <div class="detail-content">
            <h1>${p.title}</h1>
            <div class="detail-price">${formatCurrencyUI(p.price)}</div>
            <div class="detail-features">
                <div class="detail-feature"><i class="fas fa-bed"></i> ${p.bedrooms} dorm.</div>
                <div class="detail-feature"><i class="fas fa-bath"></i> ${p.bathrooms} baños</div>
                <div class="detail-feature"><i class="fas fa-vector-square"></i> ${p.area} m²</div>
            </div>
            <div class="detail-location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
            
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 12px; border-left: 4px solid #60B360;">
                <h3 style="margin-bottom: 10px; color: #333; font-size: 1.1rem;">
                    <i class="fas fa-calendar-alt" style="color: #60B360; margin-right: 8px;"></i>
                    Horario Disponible para Visitas
                </h3>
                <p style="color: #555; margin-bottom: 8px; font-weight: 500;">
                    <i class="fas fa-clock" style="color: #60B360; margin-right: 8px;"></i>
                    ${disponibilidadFormateada}
                </p>
                <p style="color: #666; font-size: 0.9rem;">
                    Contacta al proveedor para agendar una cita dentro de este horario.
                </p>
            </div>
            
            <p class="detail-description">${p.description}</p>
            ${p.emailProveedor ? providerInfo : ''} 
            <h3>Características</h3>
            <div class="highlights-grid">${p.features.map(f => `<div class="highlight-item"><i class="fas fa-check"></i> ${f}</div>`).join('')}</div>
        </div>
        <div class="action-buttons">
            <button class="action-button secondary" onclick="toggleFavorite(${id})"><i class="${favorites.has(String(id)) ? 'fas' : 'far'} fa-heart"></i> Favorito</button>
            <button class="action-button primary" onclick="openContactModal(${id})"><i class="fas fa-shopping-cart"></i> Contactar Vendedor</button>
        </div>`;
    DOMElements.propertyModal.style.display = 'block';
}

function closePropertyModal() {
    DOMElements.propertyModal.classList.add('closing');
    setTimeout(() => {
        DOMElements.propertyModal.style.display = 'none';
        DOMElements.propertyModal.classList.remove('closing');
    }, 300);
}

function showNotification(message, type = 'info') {
    const old = document.querySelector('.notification-toast');
    if (old) old.remove();
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Hacer funciones globales accesibles desde el HTML (onclick)
window.showUserMenu = showUserMenu;
window.toggleFavorite = toggleFavorite;
window.openContactModal = openContactModal;
window.setupEditForm = setupEditForm;
window.openEditProfileModal = openEditProfileModal; // HACER FUNCIÓN PÚBLICA