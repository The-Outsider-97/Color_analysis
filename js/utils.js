
window.utils = {
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    },

    rgbToHex: (r, g, b) => {
        const componentToHex = (c) => { const hex = Math.round(c).toString(16); return hex.length === 1 ? "0" + hex : hex; };
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    },

    rgbToHsl: (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    },

    hslToRgb: (h, s, l) => {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) { r = g = b = l; } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },

    rgbToHsv: (r, g, b) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0; const v = max; const d = max - min; const s = max === 0 ? 0 : d / max;
        if (max !== min) {
            switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
    },

    rgbToCmyk: (r, g, b) => {
        let c = 1 - (r / 255), m = 1 - (g / 255), y = 1 - (b / 255), k = Math.min(c, Math.min(m, y));
        c = (c - k) / (1 - k); m = (m - k) / (1 - k); y = (y - k) / (1 - k);
        if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
        return { c: Math.round((isNaN(c) ? 0 : c) * 100), m: Math.round((isNaN(m) ? 0 : m) * 100), y: Math.round((isNaN(y) ? 0 : y) * 100), k: Math.round(k * 100) };
    },

    getContrastColor: (hex) => {
        const rgb = window.utils.hexToRgb(hex);
        if (!rgb) return '#000000';
        return ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000 >= 128 ? '#000000' : '#FFFFFF';
    },

    getWebSafe: (hex) => {
        const rgb = window.utils.hexToRgb(hex); if (!rgb) return hex;
        const s = (v) => Math.round(v / 51) * 51;
        return window.utils.rgbToHex(s(rgb.r), s(rgb.g), s(rgb.b));
    },

    getClosestRal: (rgb) => {
        let minDistance = Infinity, closest = window.RAL_COLORS[0] || {code:'?', hex:'#000', rgb:[0,0,0], hsl:[0,0,0], name:'?'};
        window.RAL_COLORS.forEach(ral => {
            const dist = Math.sqrt(Math.pow(ral.rgb[0] - rgb.r, 2) + Math.pow(ral.rgb[1] - rgb.g, 2) + Math.pow(ral.rgb[2] - rgb.b, 2));
            if (dist < minDistance) { minDistance = dist; closest = ral; }
        });
        return closest;
    },

    getHarmonies: (hsl) => {
        const shiftHue = (d) => (hsl.h + d) % 360;
        const getHex = (h) => { const fixedH = h < 0 ? h + 360 : h; const rgb = window.utils.hslToRgb(fixedH, hsl.s, hsl.l); return window.utils.rgbToHex(rgb.r, rgb.g, rgb.b); };
        return {
            complementary: [getHex(shiftHue(180))],
            monochromatic: [
                window.utils.rgbToHex(window.utils.hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 20)).r, window.utils.hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 20)).g, window.utils.hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 20)).b),
                window.utils.rgbToHex(window.utils.hslToRgb(hsl.h, hsl.s, Math.min(100, hsl.l + 20)).r, window.utils.hslToRgb(hsl.h, hsl.s, Math.min(100, hsl.l + 20)).g, window.utils.hslToRgb(hsl.h, hsl.s, Math.min(100, hsl.l + 20)).b)
            ],
            splitComplementary: [getHex(shiftHue(150)), getHex(shiftHue(210))],
            triad: [getHex(shiftHue(120)), getHex(shiftHue(240))],
            analogous: [getHex(shiftHue(-30)), getHex(shiftHue(30))],
            tetrad: [getHex(shiftHue(90)), getHex(shiftHue(180)), getHex(shiftHue(270))],
        };
    },

    getAdjacents: (code) => {
        const i = window.RAL_COLORS.findIndex(c => c.code === code);
        return { low: i > 0 ? window.RAL_COLORS[i-1] : null, high: i < window.RAL_COLORS.length - 1 ? window.RAL_COLORS[i+1] : null };
    },

    mixColors: (c1, c2) => ({ r: Math.round((c1.r + c2.r) / 2), g: Math.round((c1.g + c2.g) / 2), b: Math.round((c1.b + c2.b) / 2) }),

    mixColorsWeighted: (items) => {
        let tr = 0, tg = 0, tb = 0, tp = 0;
        items.forEach(({ color, parts }) => { tr += color.r * parts; tg += color.g * parts; tb += color.b * parts; tp += parts; });
        return tp === 0 ? { r: 0, g: 0, b: 0 } : { r: Math.round(tr / tp), g: Math.round(tg / tp), b: Math.round(tb / tp) };
    },

    generatePalette: (hsl, type) => {
        const shift = (h, s, l) => { const rgb = window.utils.hslToRgb((h % 360 + 360) % 360, Math.max(0, Math.min(100, s)), Math.max(0, Math.min(100, l))); return window.utils.rgbToHex(rgb.r, rgb.g, rgb.b); };
        const {h, s, l} = hsl;
        switch (type) {
            case 'Warm': return [shift(h, s, l), shift(h+15, s, l+5), shift(h+30, s+10, l+10), shift(h-15, s, l-5), shift(h-30, s+10, l-10), shift(h+45, s, l+15)];
            case 'Cool': return [shift(h, s, l), shift(h+90, s, l), shift(h+180, s, l), shift(h-90, s, l), shift(h+45, s-20, l+10), shift(h-45, s-20, l-10)];
            case 'Double': return [shift(h, s, l), shift(h+30, s, l), shift(h-30, s, l), shift(h+180, s, l), shift(h+210, s, l), shift(h+150, s, l)];
            case 'Hexad': return [shift(h, s, l), shift(h+60, s, l), shift(h+120, s, l), shift(h+180, s, l), shift(h+240, s, l), shift(h+300, s, l)];
            case 'Mono': return [shift(h, s, l), shift(h, s, l+15), shift(h, s, l+30), shift(h, s, l-15), shift(h, s, l-30), shift(h, s, Math.max(5, l-45))];
            default: return [];
        }
    },

    processSearch: (input, callback) => {
        let r=0,g=0,b=0;
        const hexMatch = window.utils.hexToRgb(input);
        
        // 1. Hex Check
        if (hexMatch) { 
            ({r,g,b} = hexMatch); 
        }
        // 2. RGB Check (comma separated) - Check this BEFORE RAL because "255, 0, 0" contains "255" which looks like a number
        else if (input.includes(',')) {
             const parts = input.split(',').map(n => parseInt(n.trim()));
             if (parts.length === 3 && !parts.some(isNaN)) [r,g,b] = parts; else return;
        }
        // 3. RAL / Single Number (e.g., "1000", "RAL 3000")
        else if (input.includes('RAL') || !isNaN(parseInt(input))) {
             const match = window.RAL_COLORS.find(c => c.code === (input.startsWith('RAL') ? input : `RAL ${input}`));
             if (match) [r,g,b] = match.rgb; else return;
        } else return;
        
        callback({ 
            hex: window.utils.rgbToHex(r,g,b), 
            rgb: {r,g,b}, 
            hsl: window.utils.rgbToHsl(r,g,b), 
            hsv: window.utils.rgbToHsv(r,g,b), 
            cmyk: window.utils.rgbToCmyk(r,g,b) 
        });
    },

    // UI Helpers
    row: (label, value) => `
        <div class="flex w-full mb-4">
            <div class="w-24 bg-black text-white dark:bg-gray-800 dark:text-gray-100 flex items-center justify-center py-4 px-2 text-sm font-serif tracking-wide uppercase transition-colors">${label}</div>
            <div class="flex-1 border-b border-black dark:border-gray-600 flex items-center px-4 font-serif text-lg dark:text-gray-200 transition-colors">${value}</div>
        </div>
    `
};

window.app = window.app || {};
