import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Escritor IA | Red Creativa Pro",
    description: "Asistente de redacción inteligente con auto-corrección",
};

// Force dynamic rendering to avoid SSG issues with pdfjs-dist (DOMMatrix not available in Node.js)
export const dynamic = 'force-dynamic';

export default function EscritorIALayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
