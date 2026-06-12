/*
  Color API Service

  Uses a local color name→hex lookup for autocomplete,
  then calls thecolorapi.com to generate a palette from that hex.
*/

const colorNameToHex = {
    // reds & pinks
    red: "FF0000", crimson: "DC143C", scarlet: "FF2400", ruby: "9B111E",
    rose: "FF007F", rosewood: "65000B", blush: "DE5D83", hotpink: "FF69B4",
    pink: "FFC0CB", babypink: "F4C2C2", dustyrose: "DCAE96", magenta: "FF00FF",
    fuchsia: "FF00FF", raspberry: "E30B5C", watermelon: "FC6C85",

    // oranges & corals
    orange: "FFA500", darkorange: "FF8C00", coral: "FF6B6B", salmon: "FA8072",
    peach: "FFCBA4", apricot: "FBCEB1", tangerine: "F28500", amber: "FFBF00",
    terracotta: "E2725B", sienna: "A0522D",

    // yellows & golds
    yellow: "FFFF00", gold: "FFD700", lemon: "FFF44F", cream: "FFFDD0",
    butter: "FFFBA0", champagne: "F7E7CE", mustard: "FFDB58", sunflower: "FFDA00",
    vanilla: "F3E5AB", straw: "E4D96F",

    // greens
    green: "008000", lime: "00FF00", mint: "98FF98", sage: "B2AC88",
    olive: "808000", forest: "228B22", emerald: "50C878", hunter: "355E3B",
    pistachio: "93C572", moss: "8A9A5B", fern: "4F7942", jade: "00A86B",
    matcha: "849A4A", avocado: "568203",

    // blues & teals
    blue: "0000FF", navy: "000080", sky: "87CEEB", cobalt: "0047AB",
    royal: "4169E1", steel: "4682B4", baby: "89CFF0", powder: "B0E0E6",
    cerulean: "2A52BE", denim: "1560BD", midnight: "191970", ocean: "006994",
    teal: "008080", turquoise: "40E0D0", aqua: "00FFFF", cyan: "00FFFF",
    seafoam: "93E9BE", aquamarine: "7FFFD4",

    // purples & violets
    purple: "800080", violet: "EE82EE", lavender: "E6E6FA", lilac: "C8A2C8",
    plum: "DDA0DD", orchid: "DA70D6", mauve: "E0B0FF", wisteria: "C9A0DC",
    indigo: "4B0082", periwinkle: "CCCCFF", amethyst: "9966CC", grape: "6F2DA8",
    eggplant: "614051", mulberry: "C54B8C",

    // browns & neutrals
    brown: "A52A2A", chocolate: "7B3F00", tan: "D2B48C", beige: "F5F5DC",
    caramel: "C68642", coffee: "6F4E37", mocha: "967969", walnut: "773F1A",
    sand: "C2B280", taupe: "483C32", latte: "C0A882", nude: "E3BC9A",
    wheat: "F5DEB3", clay: "B66A50",

    // whites, grays & blacks
    white: "FFFFFF", ivory: "FFFFF0", snow: "FFFAFA", pearl: "F0EAD6",
    linen: "FAF0E6", alabaster: "F2F0EB", eggshell: "F0EAD6",
    gray: "808080", grey: "808080", silver: "C0C0C0", ash: "B2BEB5",
    charcoal: "36454F", slate: "708090", smoke: "848884",
    black: "000000", onyx: "353935", jet: "343434",

    // cake-specific
    fondant: "F5E6CC", buttercream: "FFF8DC", ganache: "3B1F0A",
    marzipan: "E8C98A", caramelized: "C67C3A"
};

export class ColorApiService {
    get colorNameToHex() { return colorNameToHex; }

    getAutocompleteSuggestions(query) {
        const typed = query.trim().toLowerCase();
        if (typed.length < 2) return [];

        return Object.entries(colorNameToHex)
            .filter(([name]) => name.startsWith(typed))
            .slice(0, 8)
            .map(([name, hex]) => ({ name, hex: `#${hex}` }));
    }

    async getSuggestedPalette(colorName) {
        const normalized = colorName.trim().toLowerCase();
        const hex = colorNameToHex[normalized];

        if (!hex) {
            throw new Error(`Color "${colorName}" not found. Try: pink, rose, blush, lavender, sage, mint, teal, navy, gold, champagne...`);
        }

        const response = await fetch(
            `https://www.thecolorapi.com/scheme?hex=${hex}&mode=analogic&count=5&format=json`
        );

        if (!response.ok) {
            throw new Error("Could not reach the color palette service.");
        }

        const data = await response.json();

        return {
            baseColor: { name: colorName, hex: `#${hex}` },
            palette: data.colors.map(color => ({
                name: color.name.value,
                hex: color.hex.value
            }))
        };
    }
}
