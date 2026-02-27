/**
 * Library View Logic
 */
window.app = window.app || {};

window.app.initLibrary = () => {
    const groups = {}; 
    window.RAL_COLORS.forEach(c => { 
        const key = c.code.split(' ')[1].charAt(0) + '000'; 
        if(!groups[key]) groups[key] = []; 
        groups[key].push(c); 
    });
    
    const container = document.getElementById('lib-accordion'); 
    container.innerHTML = '';
    
    Object.keys(groups).sort().forEach(key => {
        const colors = groups[key];
        const section = document.createElement('div');
        section.className = 'rounded-lg shadow-sm overflow-hidden';
        section.innerHTML = `
            <button onclick="window.app.toggleLibGroup('${key}')" class="w-full flex items-center justify-between bg-[#EBEBEB] dark:bg-gray-800 px-8 py-5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10 relative">
                <span class="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">RAL ${key}</span>
                <svg id="icon-${key}" class="w-8 h-8 text-black dark:text-white transition-transform duration-300 ease-out" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <div id="content-${key}" class="accordion-content bg-white dark:bg-gray-900 border-x border-b border-gray-100 dark:border-gray-800"><div class="accordion-inner">
                <div class="py-8 px-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-6">
                    ${colors.map(c => `
                        <div class="flex flex-col gap-2 cursor-pointer group hover:scale-105 transition-transform" onclick="alert('${c.code}: ${c.name}')"> 
                            <div class="w-full aspect-square rounded-2xl shadow-sm surface-effect" style="background-color: ${c.hex}"></div>
                            <div class="flex flex-col px-1">
                                <span class="text-xs font-bold font-sans text-gray-400">${c.code}</span>
                                <span class="text-sm font-serif leading-tight dark:text-gray-200">${c.name}</span>
                                <span class="text-[10px] font-mono text-gray-300 mt-1 uppercase">${c.hex}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div></div>`;
        container.appendChild(section);
    });
    window.app.toggleLibGroup('1000');
};

window.app.toggleLibGroup = (key) => {
    document.querySelectorAll('.accordion-content').forEach(el => el.classList.remove('open'));
    document.querySelectorAll('[id^="icon-"]').forEach(el => el.style.transform = 'rotate(0deg)');
    const content = document.getElementById(`content-${key}`);
    const icon = document.getElementById(`icon-${key}`);
    if(content && !content.classList.contains('open')) {
         content.classList.add('open');
         icon.style.transform = 'rotate(90deg)';
    }
};

window.app.handleLibrarySearch = (e) => {
    e.preventDefault(); 
    const input = document.getElementById('lib-search-input').value.trim().toUpperCase();
    const utils = window.utils;
    
    utils.processSearch(input, (data) => {
         const closest = utils.getClosestRal(data.rgb);
         document.getElementById('lib-res-box').style.backgroundColor = data.hex;
         document.getElementById('lib-res-hex').innerText = `Hex: ${data.hex}`;
         document.getElementById('lib-res-closest-box').style.backgroundColor = closest.hex;
         document.getElementById('lib-res-closest-code').innerText = closest.code;
         document.getElementById('lib-res-closest-name').innerText = closest.name;
         
         const harms = utils.getHarmonies(utils.rgbToHsl(closest.rgb[0],closest.rgb[1],closest.rgb[2]));
         const compRgb = utils.hexToRgb(harms.complementary[0]);
         const compRal = compRgb ? utils.getClosestRal(compRgb) : closest;
         
         document.getElementById('lib-res-comp-box').style.backgroundColor = compRal.hex;
         document.getElementById('lib-res-comp-code').innerText = compRal.code;
         document.getElementById('lib-res-comp-name').innerText = compRal.name;
         document.getElementById('lib-results-container').classList.remove('opacity-50', 'grayscale', 'pointer-events-none');
         window.app.toggleLibGroup(closest.code.split(' ')[1].charAt(0) + '000');
    });
};
