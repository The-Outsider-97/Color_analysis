/**
 * Color Wheel View Logic
 */
window.app = window.app || {};

// Local state for wheel
window.app.wheelState = {
    mode: 'RGB',
    harmony: 'Complementary',
    ring: 'Primary',
    angle: 0,
    selectedColor: { hex: '#FF0000', rgb: {r:255,g:0,b:0}, hsl:{h:0,s:100,l:50}, hsv:{h:0,s:100,v:100}, cmyk:{c:0,m:100,y:100,k:0} },
    segments: []
};

window.app.setWheelMode = (mode) => {
    window.app.wheelState.mode = mode;
    const btnClass = (active) => `w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${active ? 'border-white bg-gray-200 text-black' : 'border-gray-500 text-gray-500 hover:border-gray-400'}`;
    document.getElementById('wheel-mode-rgb').className = btnClass(mode==='RGB');
    document.getElementById('wheel-mode-ryb').className = btnClass(mode==='RYB');
    window.app.initWheel();
};

window.app.initWheel = () => {
    const utils = window.utils;
    const svg = document.getElementById('color-wheel-svg'); 
    svg.innerHTML = '<circle r="165" fill="#000" /><circle r="160" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.3" pointer-events="none" />';
    
    const p1 = { r: 255, g: 0, b: 0 };
    const p2 = window.app.wheelState.mode === 'RGB' ? { r: 0, g: 255, b: 0 } : { r: 255, g: 255, b: 0 };
    const p3 = { r: 0, g: 0, b: 255 };
    const s1 = utils.mixColors(p1, p2), s2 = utils.mixColors(p2, p3), s3 = utils.mixColors(p3, p1);
    const base12 = [p1, utils.mixColors(p1, s1), s1, utils.mixColors(s1, p2), p2, utils.mixColors(p2, s2), s2, utils.mixColors(s2, p3), p3, utils.mixColors(p3, s3), s3, utils.mixColors(s3, p1)];
    const toRad = (d) => (d - 90) * (Math.PI / 180);
    const v = (a, r) => ({ x: Math.cos(toRad(a)) * r, y: Math.sin(toRad(a)) * r });
    const r1=40, r2=85, r3=85, r4=125, r5=160;
    const segments = [];
    
    segments.push({id:'center', c:{r:30,g:30,b:30}, level:'All', angle:0, path:`M ${v(90,r1).x} ${v(90,r1).y} L ${v(210,r1).x} ${v(210,r1).y} L ${v(330,r1).x} ${v(330,r1).y} Z`});
    segments.push({id:'p-1', c:base12[1], level:'Primary', angle:30, path:`M ${v(330,r1).x} ${v(330,r1).y} L ${v(30,r2).x} ${v(30,r2).y} L ${v(90,r1).x} ${v(90,r1).y} Z`});
    segments.push({id:'p-2', c:base12[5], level:'Primary', angle:150, path:`M ${v(90,r1).x} ${v(90,r1).y} L ${v(150,r2).x} ${v(150,r2).y} L ${v(210,r1).x} ${v(210,r1).y} Z`});
    segments.push({id:'p-3', c:base12[9], level:'Primary', angle:270, path:`M ${v(210,r1).x} ${v(210,r1).y} L ${v(270,r2).x} ${v(270,r2).y} L ${v(330,r1).x} ${v(330,r1).y} Z`});
    segments.push({id:'s-1', c:base12[3], level:'Secondary', angle:90, path:`M ${v(30,r2).x} ${v(30,r2).y} L ${v(90,r1).x} ${v(90,r1).y} L ${v(150,r2).x} ${v(150,r2).y} Z`});
    segments.push({id:'s-2', c:base12[7], level:'Secondary', angle:210, path:`M ${v(150,r2).x} ${v(150,r2).y} L ${v(210,r1).x} ${v(210,r1).y} L ${v(270,r2).x} ${v(270,r2).y} Z`});
    segments.push({id:'s-3', c:base12[11], level:'Secondary', angle:330, path:`M ${v(270,r2).x} ${v(270,r2).y} L ${v(330,r1).x} ${v(330,r1).y} L ${v(30,r2).x} ${v(30,r2).y} Z`});

    for(let i=0; i<12; i++) {
            const a = i*30, start = a-15, end = a+15;
            segments.push({id:`q-${i}`, c:base12[i], level:'Quaternary', angle:a, path:`M ${v(start,r3).x} ${v(start,r3).y} L ${v(end,r3).x} ${v(end,r3).y} L ${v(end,r4).x} ${v(end,r4).y} L ${v(start,r4).x} ${v(start,r4).y} Z`});
    }
    for(let i=0; i<72; i++) {
            const a = i*5, idx = Math.floor(a/30), nextIdx = (idx+1)%12, pct = (a%30)/30;
            const c1 = base12[idx], c2 = base12[nextIdx];
            const mixed = { r:c1.r+(c2.r-c1.r)*pct, g:c1.g+(c2.g-c1.g)*pct, b:c1.b+(c2.b-c1.b)*pct };
            const s = a, e = a+5.5;
            const x1=Math.cos(toRad(s))*r5, y1=Math.sin(toRad(s))*r5, x2=Math.cos(toRad(e))*r5, y2=Math.sin(toRad(e))*r5;
            const x3=Math.cos(toRad(e))*r4, y3=Math.sin(toRad(e))*r4, x4=Math.cos(toRad(s))*r4, y4=Math.sin(toRad(s))*r4;
            segments.push({id:`all-${i}`, c:mixed, level:'All', angle:a+2.5, path:`M ${x1} ${y1} A ${r5} ${r5} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r4} ${r4} 0 0 0 ${x4} ${y4} Z`});
    }
    window.app.wheelState.segments = segments;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    segments.forEach(seg => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", seg.path);
        path.setAttribute("fill", `rgb(${Math.round(seg.c.r)},${Math.round(seg.c.g)},${Math.round(seg.c.b)})`);
        path.setAttribute("stroke", "#1a1a1a");
        path.setAttribute("stroke-width", seg.level === 'All' ? "0" : "1");
        path.setAttribute("class", "cursor-pointer hover:opacity-90 transition-opacity");
        path.onclick = () => { window.app.handleWheelClick(seg); };
        g.appendChild(path);
    });
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "path");
    overlay.setAttribute("d", `M ${v(90,40).x} ${v(90,40).y} L ${v(210,40).x} ${v(210,40).y} L ${v(330,40).x} ${v(330,40).y} Z`);
    overlay.setAttribute("stroke", "white"); overlay.setAttribute("stroke-width", "1"); overlay.setAttribute("fill", "none"); overlay.setAttribute("opacity", "0.5"); overlay.setAttribute("pointer-events", "none");
    g.appendChild(overlay);
    svg.appendChild(g);
    window.app.renderHarmonyButtons();
    window.app.renderWheelData();
};

window.app.handleWheelClick = (seg) => {
    const utils = window.utils;
    const s = window.app.wheelState;
    s.ring = seg.level; s.angle = seg.angle;
    s.selectedColor = { 
        hex: utils.rgbToHex(seg.c.r, seg.c.g, seg.c.b), 
        rgb: seg.c, 
        hsl: utils.rgbToHsl(seg.c.r, seg.c.g, seg.c.b), 
        hsv: utils.rgbToHsv(seg.c.r, seg.c.g, seg.c.b), 
        cmyk: utils.rgbToCmyk(seg.c.r, seg.c.g, seg.c.b) 
    };
    window.app.renderWheelData();
};

window.app.renderWheelData = () => {
    const utils = window.utils;
    const data = window.app.wheelState.selectedColor;
    const gridHtml = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            <div class="flex flex-col">${utils.row('RGB', `${Math.round(data.rgb.r)}, ${Math.round(data.rgb.g)}, ${Math.round(data.rgb.b)}`)}${utils.row('HSL', `${data.hsl.h}, ${data.hsl.s}, ${data.hsl.l}`)}</div>
            <div class="flex flex-col">${utils.row('Hex', data.hex)}${utils.row('Web', utils.getWebSafe(data.hex))}</div>
        </div>`;
    document.getElementById('wheel-data-container').innerHTML = gridHtml;
    window.app.calcWheelHarmonies();
};

window.app.renderHarmonyButtons = () => {
        const types = ['Complementary', 'Monochromatic', 'Split-Complementary', 'Triad', 'Analogous', 'Tetrad'];
        const icons = {
            'Complementary': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><circle cx="12" cy="19" r="3"/><line x1="12" y1="8" x2="12" y2="16"/></svg>',
            'Monochromatic': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>',
            'Split-Complementary': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><line x1="12" y1="7" x2="12" y2="12"/><line x1="12" y1="12" x2="6" y2="17"/><line x1="12" y1="12" x2="18" y2="17"/></svg>',
            'Triad': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 22 22 22 12 2" /></svg>',
            'Analogous': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3"/><path d="M11 12h2"/></svg>',
            'Tetrad': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>'
        };
        const container = document.getElementById('wheel-harmony-buttons'); container.innerHTML = '';
        const lvl = window.app.wheelState.ring;
        const isTertiaryOrAbove = ['Tertiary', 'Quaternary', 'All'].includes(lvl);
        const isQuaternaryOrAbove = ['Quaternary', 'All'].includes(lvl);
        const isAll = lvl === 'All';
        
        types.forEach(t => {
            let disabled = !isTertiaryOrAbove;
            if(t === 'Monochromatic' && !isAll) disabled = true;
            if((t === 'Triad' || t === 'Tetrad') && !isQuaternaryOrAbove) disabled = true;
            const active = window.app.wheelState.harmony === t;
            const btn = document.createElement('button');
            btn.className = `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300 w-full text-left ${disabled ? 'opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-900 text-gray-400' : active ? 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`;
            btn.innerHTML = `<div class="w-8 flex justify-center">${icons[t]}</div><span class="font-serif tracking-wide">${t}</span>`;
            if(!disabled) btn.onclick = () => { window.app.wheelState.harmony = t; window.app.renderHarmonyButtons(); window.app.calcWheelHarmonies(); };
            container.appendChild(btn);
        });
};

window.app.calcWheelHarmonies = () => {
        const utils = window.utils;
        const s = window.app.wheelState;
        const start = s.angle;
        let angles = [];
        switch (s.harmony) {
        case 'Complementary': angles = [start + 180]; break;
        case 'Split-Complementary': angles = [start + 150, start + 210]; break;
        case 'Triad': angles = [start + 120, start + 240]; break;
        case 'Tetrad': angles = [start + 90, start + 180, start + 270]; break;
        case 'Analogous': angles = [start - 30, start + 30]; break;
        case 'Monochromatic': angles = [start]; break;
        }
        const container = document.getElementById('wheel-harmony-grid');
        container.innerHTML = `<div class="h-16 rounded-lg shadow-sm surface-effect border dark:border-gray-700 relative group" style="background-color: ${s.selectedColor.hex}"><span class="absolute bottom-1 right-2 text-[10px] bg-black/50 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Main</span></div>`;
        
        if (s.harmony === 'Monochromatic') {
            if (s.ring !== 'All') return;
            const { h, s: sat, l } = s.selectedColor.hsl;
            const light = utils.hslToRgb(h, sat, Math.min(95, l + 20)); const dark = utils.hslToRgb(h, sat, Math.max(5, l - 20));
            [light, dark].forEach(c => container.innerHTML += `<div class="h-16 rounded-lg shadow-sm surface-effect border dark:border-gray-700" style="background-color: ${utils.rgbToHex(c.r,c.g,c.b)}"></div>`);
        } else {
            angles.forEach(a => {
                let t = a % 360; if (t < 0) t += 360;
                const match = s.segments.find(sg => sg.level === 'All' && Math.abs(sg.angle - t) < 3);
                if(match) container.innerHTML += `<div class="h-16 rounded-lg shadow-sm surface-effect border dark:border-gray-700" style="background-color: ${utils.rgbToHex(match.c.r,match.c.g,match.c.b)}"></div>`;
            });
        }
        document.getElementById('wheel-harmony-results').classList.remove('hidden');
};
