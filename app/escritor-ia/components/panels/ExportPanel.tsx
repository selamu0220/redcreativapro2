"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Button } from "@/components/ui/button";
import { Download, FileType, FileImage, FileDown } from "lucide-react";

export function ExportPanel() {
    const { handleExport, isExporting, text } = useEscritor();
    const { t } = useSimpleTranslations();

    return (
        <div className="h-full p-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting || !text.trim()}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                >
                    <FileType className="h-6 w-6 text-red-500" />
                    <span className="text-xs font-medium">PDF</span>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('docx')}
                    disabled={isExporting || !text.trim()}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                >
                    <FileImage className="h-6 w-6 text-blue-500" />
                    <span className="text-xs font-medium">DOCX</span>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('txt')}
                    disabled={isExporting || !text.trim()}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                >
                    <FileDown className="h-6 w-6 text-gray-500" />
                    <span className="text-xs font-medium">TXT</span>
                </Button>
            </div>
            {isExporting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="text-xs">Exportando...</span>
                </div>
            )}
        </div>
    );
}
