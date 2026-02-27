/**
 * Home View Logic
 */
window.app = window.app || {};

window.app.updateHomeDisplay = (colorData) => {
    const utils = window.utils;
    const gridHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mt-8">
            <div class="flex flex-col">
                ${utils.row('RGB', `${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b}`)}
                ${utils.row('HSL', `${colorData.hsl.h}, ${colorData.hsl.s}, ${colorData.hsl.l}`)}
                ${utils.row('HSB', `${colorData.hsv.h}, ${colorData.hsv.s}, ${colorData.hsv.v}`)}
                ${utils.row('CMYK', `${colorData.cmyk.c}, ${colorData.cmyk.m}, ${colorData.cmyk.y}, ${colorData.cmyk.k}`)}
            </div>
            <div class="flex flex-col">
                ${utils.row('CSS', `rgb(${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b});`)}
                ${utils.row('CSS', `hsl(${colorData.hsl.h}, ${colorData.hsl.s}%, ${colorData.hsl.l}%);`)}
                ${utils.row('Hex', colorData.hex)}
                ${utils.row('Web', utils.getWebSafe(colorData.hex))}
            </div>
        </div>`;
    document.getElementById('home-data-grid').innerHTML = gridHtml;

    const closest = utils.getClosestRal(colorData.rgb);
    document.getElementById('home-closest-code').innerText = closest.code;
    const closestCard = document.getElementById('home-closest-card');
    closestCard.style.backgroundColor = closest.hex;
    closestCard.style.color = utils.getContrastColor(closest.hex);
    document.getElementById('home-closest-name').innerText = closest.name;
    document.getElementById('home-closest-family').innerText = closest.family + ' Family';

    const harmonies = utils.getHarmonies(colorData.hsl);
    const adjacents = utils.getAdjacents(closest.code);

    const compHex = harmonies.complementary[0];
    const compBar = document.getElementById('home-viz-comp');
    compBar.style.backgroundColor = compHex;
    const compText = document.getElementById('home-viz-comp-text');
    compText.innerText = compHex;
    compText.style.color = utils.getContrastColor(compHex);

    const resBar = document.getElementById('home-viz-result');
    resBar.style.backgroundColor = colorData.hex;
    document.getElementById('home-viz-result-hex').innerText = colorData.hex;
    document.getElementById('home-viz-result-hex').style.color = utils.getContrastColor(colorData.hex);
    document.getElementById('home-viz-result-rgb').innerText = `RGB: ${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b}`;
    document.getElementById('home-viz-result-rgb').style.color = utils.getContrastColor(colorData.hex);

    const low = adjacents.low || { hex: '#eee', name: '' };
    const high = adjacents.high || { hex: '#eee', name: '' };
    const lowBar = document.getElementById('home-viz-adj-low');
    lowBar.style.backgroundColor = low.hex;
    lowBar.innerHTML = adjacents.low ? `<div class="absolute inset-0 flex items-center justify-center opacity-80 whitespace-nowrap px-1" style="writing-mode: vertical-rl; transform: rotate(180deg); color: ${utils.getContrastColor(low.hex)}"><span class="font-sans font-semibold text-sm tracking-wide">${low.name}</span></div>` : '';
    const highBar = document.getElementById('home-viz-adj-high');
    highBar.style.backgroundColor = high.hex;
    highBar.innerHTML = adjacents.high ? `<div class="absolute inset-0 flex items-center justify-center opacity-80 whitespace-nowrap px-1" style="writing-mode: vertical-rl; transform: rotate(180deg); color: ${utils.getContrastColor(high.hex)}"><span class="font-sans font-semibold text-sm tracking-wide">${high.name}</span></div>` : '';

    const harmContainer = document.getElementById('home-harmonies');
    harmContainer.innerHTML = '';
    const types = ['Complementary', 'Monochromatic', 'Split-Complementary', 'Triad', 'Analogous', 'Tetrad'];
    
    // Hardcoded descriptions for tooltip
    const DESCRIPTIONS = {
        "Complementary": "Colors that are opposite each other on the color wheel. This creates a high contrast and high impact color scheme.",
        "Monochromatic": "Different shades, tones, and tints of a single base color. Provides a cohesive, clean, and elegant look.",
        "Split-Complementary": "Uses a base color and the two colors adjacent to its complement. Offers high contrast like complementary but with less tension.",
        "Triad": "Three colors evenly spaced on the color wheel. This scheme creates a vibrant and balanced look.",
        "Analogous": "Colors that are next to each other on the color wheel. They usually match well and create serene and comfortable designs.",
        "Tetrad": "Four colors arranged into two complementary pairs. A rich color scheme that offers many possibilities for variation."
    };

    types.forEach(t => {
        const keyMap = { 'Complementary': 'complementary', 'Monochromatic': 'monochromatic', 'Split-Complementary': 'splitComplementary', 'Triad': 'triad', 'Analogous': 'analogous', 'Tetrad': 'tetrad'};
        const list = harmonies[keyMap[t]];
        let html = `
        <div class="mb-6">
            <div class="flex items-center gap-2 mb-2">
                <h3 class="font-serif text-lg text-gray-800 dark:text-gray-200">${t}</h3>
                <div class="relative group flex items-center">
                    <svg class="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600 dark:hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 hidden group-hover:block z-50 pointer-events-none">
                        <div class="bg-gray-900 dark:bg-black text-white text-xs rounded-lg py-3 px-4 shadow-xl relative text-center leading-relaxed">
                            ${DESCRIPTIONS[t]}
                            <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900 dark:border-t-black"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <div class="w-20 h-12 rounded-lg shadow-sm transition-colors duration-500" style="background-color: ${colorData.hex}"></div>
                ${list.map(c => `<div class="w-20 h-12 rounded-lg shadow-sm transition-colors duration-500" style="background-color: ${c}"></div>`).join('')}
            </div>
        </div>`;
        harmContainer.innerHTML += html;
    });
};

window.app.handleHomeSearch = (e) => {
    e.preventDefault();
    const input = document.getElementById('home-search-input').value.trim().toUpperCase();
    window.utils.processSearch(input, (data) => window.app.updateHomeDisplay(data));
};
