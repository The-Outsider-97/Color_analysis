
/**
 * Mixer View Logic
 */
window.app = window.app || {};

// Mixer State
window.app.mixerState = {
    search: null,
    slots: [],
    saturation: 50,
    paletteMode: 'RAL',
    paletteType: 'Hexad',
    resultColor: { hex: '#000000', rgb: {r:0,g:0,b:0}, hsl: {h:0,s:0,l:0}, hsv: {h:0,s:0,v:0}, cmyk: {c:0,m:0,y:0,k:100} }
};

window.app.handleMixerSearch = (e) => {
    e.preventDefault(); 
    const input = document.getElementById('mixer-search-input').value.trim().toUpperCase();
    window.utils.processSearch(input, (data) => {
        window.app.mixerState.search = data;
        document.getElementById('mixer-res-color').style.backgroundColor = data.hex;
        document.getElementById('mixer-res-hex').innerText = data.hex;
        document.getElementById('mixer-res-rgb').innerText = `RGB ${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}`;
        document.getElementById('mixer-add-btn').disabled = false;
    });
};

// New handler for the color picker input
window.app.handleMixerColorPick = (e) => {
    const hex = e.target.value.toUpperCase();
    window.utils.processSearch(hex, (data) => {
        window.app.mixerState.search = data;
        // Sync the text input for clarity
        document.getElementById('mixer-search-input').value = hex;
        
        document.getElementById('mixer-res-color').style.backgroundColor = data.hex;
        document.getElementById('mixer-res-hex').innerText = data.hex;
        document.getElementById('mixer-res-rgb').innerText = `RGB ${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b}`;
        document.getElementById('mixer-add-btn').disabled = false;
    });
};

window.app.addMixerSlot = () => {
    const s = window.app.mixerState;
    if(!s.search || s.slots.length >= 6) return;
    s.slots.push({ id: Date.now(), color: s.search, parts: 1 });
    window.app.renderMixer();
};

window.app.clearMixer = () => {
    window.app.mixerState.slots = [];
    window.app.renderMixer();
};

window.app.removeMixerSlot = (id) => {
    window.app.mixerState.slots = window.app.mixerState.slots.filter(s => s.id !== id);
    window.app.renderMixer();
};

window.app.updateMixerSlot = (id, delta) => {
    const s = window.app.mixerState;
    const slot = s.slots.find(sl => sl.id === id);
    if(slot) {
        slot.parts = Math.max(0, slot.parts + delta);
        window.app.renderMixer();
    }
};

window.app.updateSaturation = (val) => { window.app.mixerState.saturation = parseInt(val); window.app.renderMixer(); };
window.app.setPaletteMode = (mode) => { window.app.mixerState.paletteMode = mode; window.app.renderMixer(); };
window.app.setPaletteType = (type) => { window.app.mixerState.paletteType = type; window.app.renderMixer(); };

window.app.renderMixer = () => {
    const utils = window.utils;
    const s = window.app.mixerState;
    let mixed = { r:0, g:0, b:0 };
    
    if(s.slots.length > 0) {
        mixed = utils.mixColorsWeighted(s.slots.map(sl => ({ color: sl.color.rgb, parts: sl.parts })));
        const hsl = utils.rgbToHsl(mixed.r, mixed.g, mixed.b);
        mixed = utils.hslToRgb(hsl.h, s.saturation, hsl.l);
    }
    const hex = utils.rgbToHex(mixed.r, mixed.g, mixed.b);
    s.resultColor = { hex, rgb: mixed, hsl: utils.rgbToHsl(mixed.r,mixed.g,mixed.b), hsv: utils.rgbToHsv(mixed.r,mixed.g,mixed.b), cmyk: utils.rgbToCmyk(mixed.r,mixed.g,mixed.b) };

    document.getElementById('mixer-final-preview').style.backgroundColor = hex;
    const resData = s.resultColor;
    document.getElementById('mixer-final-data').innerHTML = `
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>RGB</span> <span>${resData.rgb.r}, ${resData.rgb.g}, ${resData.rgb.b}</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>HSL</span> <span>${resData.hsl.h}, ${resData.hsl.s}, ${resData.hsl.l}</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>HSB</span> <span>${resData.hsv.h}, ${resData.hsv.s}, ${resData.hsv.v}</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>CMYK</span> <span>${resData.cmyk.c}, ${resData.cmyk.m}, ${resData.cmyk.y}, ${resData.cmyk.k}</span></div>
        <div class="flex justify-between border-b border-gray-700 pb-1"><span>Hex</span> <span>${hex}</span></div>
        <div class="flex justify-between pb-1"><span>WEB</span> <span>${utils.getWebSafe(hex)}</span></div>`;

    const container = document.getElementById('mixer-slots-container'); container.innerHTML = '';
    const totalParts = s.slots.reduce((a,b) => a + b.parts, 0);
    for(let i=0; i<6; i++) {
        const slot = s.slots[i];
        if(slot) {
            const pct = totalParts > 0 ? Math.round((slot.parts/totalParts)*100) : 0;
            container.innerHTML += `
                <div class="flex-1 flex flex-col h-full relative group">
                    <button onclick="window.app.removeMixerSlot(${slot.id})" class="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10" title="Remove color">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div class="flex-1 w-full border border-black" style="background-color: ${slot.color.hex}"></div>
                    <div class="h-24 bg-black border border-t-0 border-black flex flex-col">
                            <div class="flex-1 flex border-b border-gray-700">
                                <button onclick="window.app.updateMixerSlot(${slot.id}, -1)" class="flex-1 flex items-center justify-center hover:bg-gray-800 text-white border-r border-gray-700"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                                <button onclick="window.app.updateMixerSlot(${slot.id}, 1)" class="flex-1 flex items-center justify-center hover:bg-gray-800 text-white"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                            </div>
                            <div class="h-8 flex items-center justify-center text-white text-sm font-serif">${pct} %</div>
                    </div>
                </div>`;
        } else {
            container.innerHTML += `<div class="flex-1 h-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-4 text-center"><span class="text-gray-400 font-serif text-sm">New color<br/>appears here</span></div>`;
        }
    }
    
    const palTypes = ['Warm', 'Cool', 'Double', 'Hexad', 'Mono'];
    const typeContainer = document.getElementById('pal-types'); typeContainer.innerHTML = '';
    const map = {'Warm':'Warm colors','Cool':'Cool colors','Double':'Double analogous','Hexad':'Hexads colors','Mono':'Mono colors'};
    palTypes.forEach(t => {
        const label = map[t]; const isActive = s.paletteType === t;
        typeContainer.innerHTML += `<button onclick="window.app.setPaletteType('${t}')" class="text-sm font-serif border-b-2 transition-colors pb-1 ${isActive ? 'border-black font-bold dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-black dark:hover:text-gray-300'}">${label}</button>`;
    });
    document.getElementById('pal-mode-ral').className = `px-4 py-1 rounded-full text-sm font-bold transition-all ${s.paletteMode === 'RAL' ? 'bg-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`;
    document.getElementById('pal-mode-code').className = `px-4 py-1 rounded-full text-sm font-bold transition-all ${s.paletteMode === 'CODE' ? 'bg-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`;

    let base = s.resultColor;
    if(s.paletteMode === 'RAL') {
            const c = utils.getClosestRal(mixed);
            const h = utils.rgbToHsl(c.rgb[0], c.rgb[1], c.rgb[2]);
            base.hsl = h;
    }
    const paletteHex = utils.generatePalette(base.hsl, s.paletteType);
    const palGrid = document.getElementById('pal-grid'); palGrid.innerHTML = '';
    
    const usedCodes = new Set();
    
    paletteHex.forEach(h => {
        let display = { hex: h, name: h, code: 'HEX', sub: 'Color' };
        if(s.paletteMode === 'RAL') {
            const rgb = utils.hexToRgb(h); 
            if(rgb) { 
                // Calculate distances to all RAL colors
                const sortedRals = window.RAL_COLORS.map(ral => {
                    const dist = Math.sqrt(Math.pow(ral.rgb[0] - rgb.r, 2) + Math.pow(ral.rgb[1] - rgb.g, 2) + Math.pow(ral.rgb[2] - rgb.b, 2));
                    return { ral, dist };
                }).sort((a, b) => a.dist - b.dist);

                // Find the first unique RAL color
                let match = sortedRals[0].ral;
                for (let k = 0; k < sortedRals.length; k++) {
                    if (!usedCodes.has(sortedRals[k].ral.code)) {
                        match = sortedRals[k].ral;
                        break;
                    }
                }
                usedCodes.add(match.code);
                display = { hex: match.hex, name: match.name, code: match.code, sub: '' }; 
            }
        }
        
        // Use utility to determine best text color for contrast
        const textColor = utils.getContrastColor(display.hex);

        palGrid.innerHTML += `
            <div class="group flex-1 relative transition-all duration-300 hover:flex-[1.5] cursor-pointer">
                <div class="absolute inset-0 flex flex-col justify-end p-4 overflow-hidden" style="background-color: ${display.hex}; color: ${textColor}">
                    <div class="transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p class="font-serif font-bold text-lg leading-tight">${display.name}</p>
                            <p class="font-sans text-xs opacity-80 mt-1">${display.code} ${display.sub}</p>
                            <p class="font-mono text-xs opacity-60 mt-2 uppercase">${display.hex}</p>
                    </div>
                    <div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><svg width="20" height="20" class="drop-shadow-md" style="color: ${textColor}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4.1 12 6"/><path d="m5.1 8-2.9-.8"/><path d="m6 12-1.9 2"/><path d="M7.2 2.2 8 5.1"/><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"/></svg></div>
                </div>
            </div>`;
    });
};
