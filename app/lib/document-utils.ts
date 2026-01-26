import { saveAs } from 'file-saver';
// Heavy libs moved to dynamic imports inside functions to prevent initialization errors
// import { jsPDF } from 'jspdf';
// import { Document, Packer, Paragraph, TextRun } from 'docx';
// import TurndownService from 'turndown';
// import mammoth from 'mammoth';

// --- EXPORT ---

export const exportDocument = async (contentHtml: string, title: string, format: 'pdf' | 'docx' | 'md' | 'txt') => {
    const cleanTitle = title || 'documento-sin-titulo';
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, 'text/html');
    const textContent = doc.body.innerText || '';

    try {
        switch (format) {
            case 'txt': {
                const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
                saveAs(blob, `${cleanTitle}.txt`);
                break;
            }
            case 'md': {
                const TurndownService = (await import('turndown')).default;
                const turndownService = new TurndownService();
                const markdown = turndownService.turndown(contentHtml);
                const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
                saveAs(blob, `${cleanTitle}.md`);
                break;
            }
            case 'pdf': {
                const { jsPDF } = await import('jspdf');
                const pdf = new jsPDF();
                // Simple text wrap for MVP
                const splitText = pdf.splitTextToSize(textContent, 180);
                pdf.text(splitText, 10, 10);
                pdf.save(`${cleanTitle}.pdf`);
                break;
            }
            case 'docx': {
                const { Document, Packer, Paragraph, TextRun } = await import('docx');

                // Convert simplified text to DOCX paragraphs
                const lines = textContent.split('\n');
                const docxChildren = lines.map(line =>
                    new Paragraph({
                        children: [new TextRun(line)],
                        spacing: { after: 120 } // slight spacing
                    })
                );

                const docx = new Document({
                    sections: [{
                        properties: {},
                        children: docxChildren,
                    }],
                });

                const blob = await Packer.toBlob(docx);
                saveAs(blob, `${cleanTitle}.docx`);
                break;
            }
        }
        return true;
    } catch (error) {
        console.error("Export error:", error);
        throw error;
    }
};

// --- IMPORT ---

export const importDocument = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const extension = file.name.split('.').pop()?.toLowerCase();

        if (extension === 'txt' || extension === 'md') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                // Basic Markdown -> HTML could serve here if needed, but Tiptap handles MD pasting well.
                // For now return text wrapped in paragraphs for Tiptap
                const html = text.split('\n').map(line => `<p>${line}</p>`).join('');
                resolve(html);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        }
        else if (extension === 'docx') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const mammoth = (await import('mammoth')).default;
                    // Note: mammoth might export default or named depending on setup, but typically default or * as style.
                    // Let's assume standard import pattern or try catch

                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    if (!mammoth || !mammoth.convertToHtml) {
                        // Fallback if import weirdness
                        throw new Error("Error loading docx converter");
                    }
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    resolve(result.value);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        } else {
            reject(new Error("Formato no soportado"));
        }
    });
};
