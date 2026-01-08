// Sistema inteligente de escritura con IA
export interface TextVersion {
  original: string;
  improved: string;
  cursorPosition: number;
  lastImprovedPosition: number;
}

export interface SmartWriterSettings {
  autoMode: boolean;
  inactivityDelay: number; // ms antes de mejorar
  creativity: number;
  customPrompt: string;
}

export class SmartAIWriter {
  private inactivityTimer: NodeJS.Timeout | null = null;
  private isImproving = false;
  private lastCursorPosition = 0;
  
  constructor(
    private settings: SmartWriterSettings,
    private onImprove: (textBeforeCursor: string) => Promise<string>
  ) {}

  // Detectar cuando el usuario para de escribir
  handleTextChange(
    text: string, 
    cursorPosition: number,
    onTextUpdate: (newText: string, newCursorPos: number) => void
  ) {
    this.lastCursorPosition = cursorPosition;
    
    // Limpiar timer anterior
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    // Si está en modo automático, configurar nuevo timer
    if (this.settings.autoMode && !this.isImproving) {
      this.inactivityTimer = setTimeout(async () => {
        await this.improveTextBeforeCursor(text, cursorPosition, onTextUpdate);
      }, this.settings.inactivityDelay);
    }
  }

  // Mejorar solo el texto antes del cursor
  private async improveTextBeforeCursor(
    fullText: string,
    cursorPosition: number,
    onTextUpdate: (newText: string, newCursorPos: number) => void
  ) {
    if (this.isImproving) return;
    
    this.isImproving = true;
    
    try {
      // Obtener texto antes del cursor
      const textBeforeCursor = fullText.substring(0, cursorPosition);
      const textAfterCursor = fullText.substring(cursorPosition);
      
      // Solo mejorar si hay suficiente texto
      if (textBeforeCursor.trim().split(/\s+/).length < 5) {
        this.isImproving = false;
        return;
      }

      // Llamar a la IA para mejorar
      const improvedTextBefore = await this.onImprove(textBeforeCursor);
      
      // Verificar que cambió
      if (improvedTextBefore.trim() === textBeforeCursor.trim()) {
        this.isImproving = false;
        return;
      }

      // Combinar texto mejorado con texto después del cursor
      const newFullText = improvedTextBefore + textAfterCursor;
      const newCursorPosition = improvedTextBefore.length;
      
      // Actualizar texto manteniendo la posición del cursor relativa
      onTextUpdate(newFullText, newCursorPosition);
      
    } catch (error) {
      console.error('Error improving text:', error);
    } finally {
      this.isImproving = false;
    }
  }

  // Limpiar timers
  cleanup() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  // Verificar si está mejorando
  isCurrentlyImproving() {
    return this.isImproving;
  }

  // Actualizar configuración
  updateSettings(newSettings: Partial<SmartWriterSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

// Gestor de versiones de texto
export class TextVersionManager {
  private versions: Map<string, TextVersion> = new Map();
  
  // Guardar versión original y mejorada
  saveVersion(pageId: string, original: string, improved: string, cursorPos: number) {
    this.versions.set(pageId, {
      original,
      improved,
      cursorPosition: cursorPos,
      lastImprovedPosition: improved.length
    });
  }

  // Obtener versión
  getVersion(pageId: string): TextVersion | null {
    return this.versions.get(pageId) || null;
  }

  // Alternar entre versiones
  toggleVersion(pageId: string, currentlyShowingImproved: boolean): string | null {
    const version = this.versions.get(pageId);
    if (!version) return null;
    
    return currentlyShowingImproved ? version.original : version.improved;
  }

  // Limpiar versión
  clearVersion(pageId: string) {
    this.versions.delete(pageId);
  }

  // Verificar si hay versión mejorada disponible
  hasImprovedVersion(pageId: string): boolean {
    const version = this.versions.get(pageId);
    return version ? version.improved !== version.original : false;
  }
}