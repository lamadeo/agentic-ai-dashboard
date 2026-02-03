import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Image, Share2, Mail } from 'lucide-react';

export interface ExportOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  handler: () => void | Promise<void>;
  disabled?: boolean;
}

export interface ExportMenuProps {
  onExportPDF?: () => void | Promise<void>;
  onExportCSV?: () => void | Promise<void>;
  onExportPNG?: () => void | Promise<void>;
  onShare?: () => void | Promise<void>;
  onEmail?: () => void | Promise<void>;
  customOptions?: ExportOption[];
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  onExportPDF,
  onExportCSV,
  onExportPNG,
  onShare,
  onEmail,
  customOptions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (id: string, handler: () => void | Promise<void>) => {
    setExporting(id);
    try {
      await handler();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(null);
      setIsOpen(false);
    }
  };

  const defaultOptions: ExportOption[] = [
    onExportPDF && {
      id: 'pdf',
      label: 'Export as PDF',
      icon: <FileText className="h-4 w-4" />,
      handler: onExportPDF
    },
    onExportCSV && {
      id: 'csv',
      label: 'Download Data (CSV)',
      icon: <Download className="h-4 w-4" />,
      handler: onExportCSV
    },
    onExportPNG && {
      id: 'png',
      label: 'Save as Image',
      icon: <Image className="h-4 w-4" />,
      handler: onExportPNG
    },
    onShare && {
      id: 'share',
      label: 'Share Link',
      icon: <Share2 className="h-4 w-4" />,
      handler: onShare
    },
    onEmail && {
      id: 'email',
      label: 'Schedule Email',
      icon: <Mail className="h-4 w-4" />,
      handler: onEmail
    }
  ].filter(Boolean) as ExportOption[];

  const allOptions = [...defaultOptions, ...customOptions];

  if (allOptions.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {allOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleExport(option.id, option.handler)}
                disabled={option.disabled || exporting === option.id}
                className={`flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 transition-colors ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${exporting === option.id ? 'opacity-50' : ''}`}
                role="menuitem"
              >
                <span className="mr-3">{option.icon}</span>
                {exporting === option.id ? 'Exporting...' : option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
