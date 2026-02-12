export function hexToHsl(hex: string): { h: number, s: number, l: number } {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;

    let h = 0, s = 0, l = 0;

    if (delta === 0)
        h = 0;
    else if (cmax === r)
        h = ((g - b) / delta) % 6;
    else if (cmax === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
}

export function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }

    let rStr = Math.round((r + m) * 255).toString(16);
    let gStr = Math.round((g + m) * 255).toString(16);
    let bStr = Math.round((b + m) * 255).toString(16);

    if (rStr.length === 1) rStr = "0" + rStr;
    if (gStr.length === 1) gStr = "0" + gStr;
    if (bStr.length === 1) bStr = "0" + bStr;

    return "#" + rStr + gStr + bStr;
}

export function generateColorPalette(baseColor: string, count: number = 5): string[] {
    const hsl = hexToHsl(baseColor);
    const colors: string[] = [];

    colors.push(baseColor);

    // Distribute remaining count between lighter and darker
    const remaining = count - 1;
    const lighterCount = Math.ceil(remaining / 2);
    const darkerCount = Math.floor(remaining / 2);

    // Generate Lighter
    let l = hsl.l;
    for (let i = 1; i <= lighterCount; i++) {
        let newL = Math.min(95, l + (i * 10));
        colors.push(hslToHex(hsl.h, hsl.s, newL));
    }

    // Generate Darker
    for (let i = 1; i <= darkerCount; i++) {
        let newL = Math.max(10, l - (i * 10));
        colors.push(hslToHex(hsl.h, hsl.s, newL));
    }

    return [...new Set(colors)];
}
