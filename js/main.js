/**
 * Main Application Logic
 */

// Ensure global app object structure
window.app = window.app || {};

// UI Controller
window.ui = {
    isDarkMode: false,
    toggleTheme: () => {
        window.ui.isDarkMode = !window.ui.isDarkMode;
        document.documentElement.classList.toggle('dark');
        const dot = document.getElementById('theme-toggle-dot');
        const sun = dot.nextElementSibling;
        const moon = sun.nextElementSibling;
        if(dot) dot.style.left = window.ui.isDarkMode ? '2.25rem' : '0.25rem';
    }
};

// Router
window.router = {
    currentView: 'home',
    navigate: (viewName) => {
        window.router.currentView = viewName;
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById(`view-${viewName}`);
        if(target) target.classList.remove('hidden');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('bg-black', 'text-white', 'bg-gray-300', 'shadow-inner');
            btn.classList.add('bg-[#EBEBEB]', 'text-gray-800');
        });
        const activeBtn = document.getElementById(`nav-${viewName}`);
        if(activeBtn) {
            activeBtn.classList.remove('bg-[#EBEBEB]', 'text-gray-800');
            activeBtn.classList.add('bg-black', 'text-white');
        }
        
        // Initializers
        if(viewName === 'wheel' && window.app.initWheel) window.app.initWheel();
        if(viewName === 'mixer' && window.app.renderMixer) window.app.renderMixer();
        if(viewName === 'theory' && window.app.initTheory) window.app.initTheory();
    }
};

// Initialization
window.onload = () => {
    try { 
        if (window.app.initLibrary) window.app.initLibrary(); 
    } catch(e) { 
        console.error("Library init failed", e); 
    }
    
    // Set default home view data
    if (window.app.updateHomeDisplay) {
        window.app.updateHomeDisplay({ 
            hex: '#924E7D', 
            rgb: {r:146,g:78,b:125}, 
            hsl: {h:319,s:30,l:44}, 
            hsv: {h:319,s:47,v:57}, 
            cmyk: {c:0,m:47,y:14,k:43} 
        });
    }

    window.router.navigate('home');
};
