// ==================================================================
// DATOS Y ESTADO DE LA APLICACIÓN
// ==================================================================
let voices = [];

// ELIMINADAS TODAS LAS CASAS PREEXISTENTES - SOLO SE MOSTRARÁN LAS PUBLICADAS POR PROVEEDORES
const properties = {};

// ESTRUCTURA DE USUARIO AMPLIADA PARA SUPABASE
let currentUser = { id: null, email: null, name: null, phone: null, role: null };
let favorites = new Set();
let currentFilters = { searchTerm: '', minPrice: null, maxPrice: null, minBedrooms: null, minBathrooms: null, sortBy: null };
let isFavoritesViewActive = false;
let userPreferences = { name: null, theme: 'light', profilePic: null };
let recognition = null;
let isListening = false;

// Objeto que contendrá las referencias a los elementos del DOM.
// Se inicializa vacío y se llenará en aplicacion-principal.js
let DOMElements = {};