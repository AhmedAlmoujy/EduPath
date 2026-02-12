
const SUPABASE_URL = 'https://mwkgbacdufqckayuitgu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13a2diYWNkdWZxY2theXVpdGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDkyOTcsImV4cCI6MjA4NjQyNTI5N30.cwcsEg0niVX-mYW9ibHoeO4nTWEESznn9NtQ9PCBjqc';

// Initialize the Supabase client
// This expects 'supabase' to be available from the CDN script
let supabaseClient;

try {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        // Make it available globally
        window.supabaseClient = supabaseClient;
        console.log('Supabase client initialized');
    } else {
        console.error('Supabase SDK not loaded. Make sure to include the CDN script before this file.');
    }
} catch (error) {
    console.error('Error initializing Supabase client:', error);
}
