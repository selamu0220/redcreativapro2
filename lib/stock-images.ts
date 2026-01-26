export const STOCK_IMAGES = {
    ai: [
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80', // AI Robot Hand
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80', // Neural Network
        'https://images.unsplash.com/photo-1676299081847-824916de030a?auto=format&fit=crop&q=80', // Abstract AI
    ],
    marketing: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80', // Analytics Graph
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80', // Data Dash
        'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&q=80', // Strategy Board
    ],
    design: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80', // Color Palette
        'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80', // Minimalist shapes
        'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&q=80', // Paint/Art
    ],
    coding: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80', // Code Screen
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80', // Coding Keyboard
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80', // Code Matrix
    ],
    writing: [
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80', // Notebook and Pen
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80', // Laptop Work
        'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&q=80', // Typewriter
    ],
    general: [
        'https://images.unsplash.com/photo-1499750310159-5b5f87e8e12b?auto=format&fit=crop&q=80', // Laptop generic
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80', // Tech chips
        'https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&q=80', // Abstract lines
    ]
};

export function getStockImage(category: string): string {
    const normalize = (str: string) => str.toLowerCase().trim();
    const cat = normalize(category);

    if (cat.includes('ia') || cat.includes('ai') || cat.includes('bot') || cat.includes('gpt')) {
        return getRandom(STOCK_IMAGES.ai);
    }
    if (cat.includes('marketing') || cat.includes('seo') || cat.includes('ventas')) {
        return getRandom(STOCK_IMAGES.marketing);
    }
    if (cat.includes('diseño') || cat.includes('design') || cat.includes('ux') || cat.includes('ui')) {
        return getRandom(STOCK_IMAGES.design);
    }
    if (cat.includes('code') || cat.includes('programación') || cat.includes('dev') || cat.includes('software')) {
        return getRandom(STOCK_IMAGES.coding);
    }
    if (cat.includes('copy') || cat.includes('escr') || cat.includes('redac')) {
        return getRandom(STOCK_IMAGES.writing);
    }

    return getRandom(STOCK_IMAGES.general);
}

function getRandom(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}
