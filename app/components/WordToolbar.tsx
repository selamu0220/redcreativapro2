"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Palette,
  Type
} from "lucide-react";

export interface TextFormat {
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  listType: 'none' | 'bullet' | 'numbered';
}

interface WordToolbarProps {
  format: TextFormat;
  onFormatChange: (format: Partial<TextFormat>) => void;
  disabled?: boolean;
}

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

const TEXT_COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080',
  '#808000', '#800080', '#008080', '#C0C0C0', '#808080'
];

export default function WordToolbar({ format, onFormatChange, disabled = false }: WordToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-wrap">
      
      {/* Font Family */}
      <Select
        value={format.fontFamily}
        onValueChange={(value) => onFormatChange({ fontFamily: value })}
        disabled={disabled}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span style={{ fontFamily: font.value }}>{font.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size */}
      <Select
        value={format.fontSize.toString()}
        onValueChange={(value) => onFormatChange({ fontSize: parseInt(value) })}
        disabled={disabled}
      >
        <SelectTrigger className="w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <Button
          variant={format.bold ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ bold: !format.bold })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant={format.italic ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ italic: !format.italic })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant={format.underline ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ underline: !format.underline })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Color */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowColorPicker(!showColorPicker)}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <div className="flex flex-col items-center">
            <Type className="h-3 w-3" />
            <div 
              className="w-4 h-1 mt-0.5" 
              style={{ backgroundColor: format.textColor }}
            />
          </div>
        </Button>

        {showColorPicker && (
          <div className="absolute top-10 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg">
            <div className="grid grid-cols-5 gap-1">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onFormatChange({ textColor: color });
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <div className="flex items-center gap-1">
        <Button
          variant={format.textAlign === 'left' ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ textAlign: 'left' })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>

        <Button
          variant={format.textAlign === 'center' ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ textAlign: 'center' })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>

        <Button
          variant={format.textAlign === 'right' ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ textAlign: 'right' })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Button
          variant={format.textAlign === 'justify' ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ textAlign: 'justify' })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <Button
          variant={format.listType === 'bullet' ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ 
            listType: format.listType === 'bullet' ? 'none' : 'bullet' 
          })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant={format.listType === 'numbered' ? "default" : "outline"}
          size="sm"
          onClick={() => onFormatChange({ 
            listType: format.listType === 'numbered' ? 'none' : 'numbered' 
          })}
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* Click outside to close color picker */}
      {showColorPicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
}