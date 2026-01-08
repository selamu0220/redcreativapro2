"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  Upload, 
  FileText, 
  File, 
  FileImage,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DocumentManagerProps {
  text: string;
  onTextImport: (importedText: string) => void;
  title?: string;
}

function DocumentManager({ text, onTextImport, title = "documento" }: DocumentManagerProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  };

  // Exportar como TXT
  const exportAsTXT = () => {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showMessage("Archivo TXT descargado exitosamente", "success");
    } catch (error) {
      showMessage("Error al exportar como TXT", "error");
    }
  };

  // Exportar como PDF (usando jsPDF)
  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Configurar fuente
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      
      // Título
      if (title) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, margin + 10);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
      }
      
      // Dividir texto en líneas
      const lines = doc.splitTextToSize(text, maxWidth);
      let yPosition = title ? margin + 30 : margin + 10;
      
      // Agregar texto página por página
      for (let i = 0; i < lines.length; i++) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin + 10;
        }
        doc.text(lines[i], margin, yPosition);
        yPosition += 6;
      }
      
      doc.save(`${title}.pdf`);
      showMessage("PDF generado y descargado exitosamente", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showMessage("Error al generar PDF. Intenta con un texto más corto.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar como DOCX (usando docx)
  const exportAsDOCX = async () => {
    setIsExporting(true);
    try {
      // Importar docx dinámicamente
      const { Document, Packer, Paragraph, TextRun } = await import('docx');
      
      // Dividir texto en párrafos
      const paragraphs = text.split('\n').map(line => 
        new Paragraph({
          children: [new TextRun(line || " ")], // Espacio para líneas vacías
        })
      );
      
      // Crear documento
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Título si existe
            ...(title ? [new Paragraph({
              children: [new TextRun({ text: title, bold: true, size: 32 })],
            })] : []),
            // Párrafos del contenido
            ...paragraphs
          ],
        }],
      });
      
      // Generar y descargar
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showMessage("Documento DOCX generado y descargado exitosamente", "success");
    } catch (error) {
      console.error("Error generating DOCX:", error);
      showMessage("Error al generar DOCX", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Importar archivo
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      switch (fileExtension) {
        case 'txt':
          await importTXT(file);
          break;
        case 'docx':
          await importDOCX(file);
          break;
        case 'pdf':
          await importPDF(file);
          break;
        default:
          showMessage("Formato de archivo no soportado. Use TXT, DOCX o PDF.", "error");
      }
    } catch (error) {
      console.error("Error importing file:", error);
      showMessage("Error al importar el archivo", "error");
    } finally {
      setIsImporting(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Importar TXT
  const importTXT = async (file: File) => {
    const text = await file.text();
    onTextImport(text);
    showMessage("Archivo TXT importado exitosamente", "success");
  };

  // Importar DOCX
  const importDOCX = async (file: File) => {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      onTextImport(result.value);
      showMessage("Documento DOCX importado exitosamente", "success");
    } catch (error) {
      showMessage("Error al leer el archivo DOCX", "error");
    }
  };

  // Importar PDF
  const importPDF = async (file: File) => {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configurar worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extraer texto de todas las páginas
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      onTextImport(fullText.trim());
      showMessage("PDF importado exitosamente", "success");
    } catch (error) {
      showMessage("Error al leer el archivo PDF", "error");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Gestión de Documentos
        </CardTitle>
        <CardDescription>
          Importa y exporta tu contenido en diferentes formatos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mensajes de estado */}
        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-md ${
            messageType === "success" 
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {messageType === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message}
          </div>
        )}

        {/* Sección de Importación */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar Documento
          </h4>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.docx,.pdf"
              onChange={handleFileImport}
              className="hidden"
              id="file-import"
              aria-label="Seleccionar archivo para importar"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isImporting ? "Importando..." : "Seleccionar Archivo"}
            </Button>
            <span className="text-xs text-gray-500">
              Formatos: TXT, DOCX, PDF
            </span>
          </div>
        </div>

        <Separator />

        {/* Sección de Exportación */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Descargar Documento
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Exportar TXT */}
            <Button
              variant="outline"
              onClick={exportAsTXT}
              disabled={!text.trim() || isExporting}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              TXT
            </Button>

            {/* Exportar PDF */}
            <Button
              variant="outline"
              onClick={exportAsPDF}
              disabled={!text.trim() || isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileImage className="h-4 w-4" />
              )}
              PDF
            </Button>

            {/* Exportar DOCX */}
            <Button
              variant="outline"
              onClick={exportAsDOCX}
              disabled={!text.trim() || isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <File className="h-4 w-4" />
              )}
              DOCX
            </Button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• <strong>TXT:</strong> Texto plano sin formato</p>
          <p>• <strong>PDF:</strong> Documento con formato preservado</p>
          <p>• <strong>DOCX:</strong> Compatible con Microsoft Word</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentManager;