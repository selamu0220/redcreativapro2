export function getStockImage(category: string): string {
    const map: Record<string, string> = {
        'AI': 'https://images.unsplash.com/photo-1677442136019-3c7d0d9703f6?q=80&w=1600&auto=format&fit=crop',
        'Marketing': 'https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=1600&auto=format&fit=crop',
        'SEO': 'https://images.unsplash.com/photo-1571786256017-aee7a0c006b6?q=80&w=1600&auto=format&fit=crop',
        'Copywriting': 'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?q=80&w=1600&auto=format&fit=crop',
        'Design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1600&auto=format&fit=crop',
    };
    return map[category] || 'https://images.unsplash.com/photo-1499750310159-5b600cdf0a7c?q=80&w=1600&auto=format&fit=crop';
}

export function formatDate(dateString: string | Date, locale: string = 'en'): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}
