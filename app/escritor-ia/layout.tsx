import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Escritor IA | Red Creativa Pro",
    description: "Asistente de redacción inteligente con auto-corrección",
};

export default function EscritorIALayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
