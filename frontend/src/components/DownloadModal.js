import React, { useState } from 'react';
import { Download, FileText, File, Table, X } from 'lucide-react';
import { downloadAsPDF, downloadAsExcel, downloadAsMarkdown } from '../utils/downloadUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DownloadModal = ({ isOpen, onClose, analysisData }) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('markdown');

  if (!isOpen) return null;

  const formats = [
    {
      key: 'markdown',
      label: 'Markdown (.md)',
      icon: FileText,
      description: 'Text format with formatting, good for documentation',
      color: 'text-blue-600'
    },
    {
      key: 'pdf',
      label: 'PDF Document (.pdf)',
      icon: File,
      description: 'Professional report format, good for sharing',
      color: 'text-red-600'
    }
  ];

  const handleDownload = async () => {
    if (!analysisData) return;
    setDownloading(true);
    const safe = (s) => s?.replace(/[^a-zA-Z0-9]/g, '_') || 'analysis';
    const filename = `${safe(analysisData.marketName)}_analysis`;
  
    try {
      switch (selectedFormat) {
        case 'pdf':
          await downloadAsPDF(analysisData, `${filename}.pdf`);
          break;
        case 'excel':
          downloadAsExcel(analysisData, `${filename}.xlsx`);
          break;
        case 'markdown':
        default:
          downloadAsMarkdown(analysisData, `${filename}.md`);
          break;
      }
      onClose();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  
  
  
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Download className="w-5 h-5 text-blue-600 mr-2" />
              Download Analysis
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred format for <strong>{analysisData?.marketName}</strong> analysis:
            </p>

            <div className="space-y-3">
              {formats.map((format) => {
                const Icon = format.icon;
                return (
                  <label
                    key={format.key}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFormat === format.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={format.key}
                      checked={selectedFormat === format.key}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Icon className={`w-4 h-4 mr-2 ${format.color}`} />
                        <span className="font-medium text-gray-900">{format.label}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{format.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DownloadModal;