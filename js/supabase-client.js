// ==================================================================
// js/supabase-client.js: CONEXIÓN A SUPABASE
// ==================================================================

// CLAVES PROPORCIONADAS POR EL USUARIO
const SUPABASE_URL = 'https://xnqxnpovnhjapsumdjde.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucXhucG92bmhqYXBzdW1kamRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODc4NzcsImV4cCI6MjA3NjY2Mzg3N30.STBG7_9FpSCPGQN9_JXLA_nrnmcfZGj0LSWvyrzXqzc'; 

/**
 * Inicializa el cliente de Supabase usando el SDK global.
 */
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase;

console.log('Cliente de Supabase inicializado y disponible.');