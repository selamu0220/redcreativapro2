import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  title?: string;
  author?: string;
  subject?: string;
}

export class DocumentExporter {
  /**
   * Export text as PDF
   */
  static async exportToPDF(text: string, options: ExportOptions = {}): Promise<void> {
    try {
      const pdf = new jsPDF();
      const { title = 'Documento', author = 'Red Creativa Pro' } = options;

      // Set document properties
      (pdf as any).setProperties({
        title,
        author,
        subject: options.subject || 'Documento generado con IA',
        creator: 'Red Creativa Pro - Escritor IA'
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 20, 30);

      // Add content
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      // Split text into lines that fit the page width
      const lines = pdf.splitTextToSize(text, 170); // 170mm width
      let yPosition = 50;
      const lineHeight = 7;
      const pageHeight = 280; // A4 height minus margins

      lines.forEach((line: string) => {
        if (yPosition > pageHeight) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, 20, yPosition);
        yPosition += lineHeight;
      });

      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          `Página ${i} de ${pageCount} - Generado con Red Creativa Pro`,
          20,
          290
        );
      }

      // Save the PDF
      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Error al exportar a PDF');
    }
  }

  /**
   * Export text as DOCX
   */
  static async exportToDOCX(text: string, options: ExportOptions = {}): Promise<void> {
    try {
      const { title = 'Documento', author = 'Red Creativa Pro' } = options;

      // Split text into paragraphs
      const paragraphs = text.split('\n\n').filter(p => p.trim());

      // Create document
      const doc = new (Document as any)({
        properties: {
          title,
          author,
          subject: options.subject || 'Documento generado con IA',
          creator: 'Red Creativa Pro - Escritor IA'
        },
        sections: [{
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32, // 16pt
                })
              ],
              spacing: {
                after: 400, // 20pt spacing after
              }
            }),
            // Content paragraphs
            ...paragraphs.map(paragraph =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: paragraph.trim(),
                    size: 24, // 12pt
                  })
                ],
                spacing: {
                  after: 200, // 10pt spacing after each paragraph
                }
              })
            ),
            // Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: '\n\nGenerado con Red Creativa Pro - Escritor IA',
                  italics: true,
                  size: 20, // 10pt
                })
              ]
            })
          ]
        }]
      });

      // Generate and save
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer as any], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      throw new Error('Error al exportar a DOCX');
    }
  }

  /**
   * Export text as TXT
   */
  static async exportToTXT(text: string, options: ExportOptions = {}): Promise<void> {
    try {
      const { title = 'Documento', author = 'Red Creativa Pro' } = options;

      // Create formatted text content
      const content = [
        `${title}`,
        `${'='.repeat(title.length)}`,
        '',
        `Autor: ${author}`,
        `Generado: ${new Date().toLocaleDateString('es-ES')}`,
        '',
        '---',
        '',
        text,
        '',
        '---',
        '',
        'Generado con Red Creativa Pro - Escritor IA',
        `${new Date().toLocaleString('es-ES')}`
      ].join('\n');

      // Create and download blob
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        }.txt`);
    } catch (error) {
      console.error('Error exporting to TXT:', error);
      throw new Error('Error al exportar a TXT');
    }
  }

  /**
   * Get file size estimate for different formats
   */
  static getFileSizeEstimate(text: string): {
    pdf: string;
    docx: string;
    txt: string;
  } {
    const textLength = text.length;

    return {
      pdf: `~${Math.ceil(textLength / 1000)} KB`,
      docx: `~${Math.ceil(textLength / 800)} KB`,
      txt: `~${Math.ceil(textLength / 1024)} KB`
    };
  }

  /**
   * Validate text for export
   */
  static validateForExport(text: string): { valid: boolean; message?: string } {
    if (!text.trim()) {
      return { valid: false, message: 'El texto está vacío' };
    }

    if (text.length < 10) {
      return { valid: false, message: 'El texto es demasiado corto para exportar' };
    }

    if (text.length > 100000) {
      return { valid: false, message: 'El texto es demasiado largo (máximo 100,000 caracteres)' };
    }

    return { valid: true };
  }
}