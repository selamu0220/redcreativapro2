export interface Author {
    id: string;
    name: string;
    role: string;
    bio: string; // Short bio for cards
    fullBio: string; // Long bio for Author Page
    avatar: string;
    social: {
        twitter?: string;
        linkedin?: string;
        website?: string;
        instagram?: string;
    };
    credentials?: string[]; // E-E-A-T signals (degrees, awards)
    expertise: string[]; // Topics they are authoritative in
}

export const authors: Author[] = [
    {
        id: 'selamu',
        name: 'Sela',
        role: 'Fundador & Estudiante',
        bio: 'Estudiante de Humanidades y creador de Red Creativa Pro. Obsesionado con ahorrar tiempo usando IA.',
        fullBio: `Soy Sela, un estudiante de Humanidades que se cansó de perder tiempo en tareas repetitivas. 

Fundé Red Creativa Pro no como una corporación, sino como una solución personal a un problema real: la necesidad de escribir más rápido sin perder calidad humana. 

Mi enfoque no es técnico, es práctico. Pruebo cada herramienta que recomiendo y mi regla de oro es simple: si no me ahorra al menos una hora de trabajo, no vale la pena.`,
        avatar: 'https://i.ibb.co/bfb1ncN/image.png',
        social: {
            twitter: '@selamu',
            linkedin: 'in/selamu'
        },
        credentials: [
            'Creador de Red Creativa Pro',
            'Investigador de IA para Productividad',
            'Estudiante de Humanidades'
        ],
        expertise: [
            'Inteligencia Artificial',
            'Productividad Académica',
            'Marketing de Contenidos',
            'Automatización'
        ]
    }
];

export function getAuthorById(id: string): Author | undefined {
    return authors.find(author => author.id === id);
}
