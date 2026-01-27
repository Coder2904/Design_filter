import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Copy, Download, FileText, Code } from 'lucide-react';

const ExportPanel = ({ coefficients, onBack }) => {
  const [exportFormat, setExportFormat] = useState('text');
  const [exportedCode, setExportedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/export-coefficients', {
        coefficients,
        format: exportFormat
      });
      setExportedCode(response.data.exported);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = {
      text: 'txt',
      matlab: 'm',
      python: 'py',
      c: 'c'
    };
    const ext = extensions[exportFormat] || 'txt';
    const blob = new Blob([exportedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filter_coefficients.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Results
        </button>
        <h2>Export Filter Coefficients</h2>
      </div>

      <div className="export-options">
        <div className="format-selector">
          <label>Export Format:</label>
          <div className="format-buttons">
            <button
              className={`format-btn ${exportFormat === 'text' ? 'active' : ''}`}
              onClick={() => setExportFormat('text')}
            >
              <FileText size={18} /> Text
            </button>
            <button
              className={`format-btn ${exportFormat === 'matlab' ? 'active' : ''}`}
              onClick={() => setExportFormat('matlab')}
            >
              <Code size={18} /> MATLAB
            </button>
            <button
              className={`format-btn ${exportFormat === 'python' ? 'active' : ''}`}
              onClick={() => setExportFormat('python')}
            >
              <Code size={18} /> Python
            </button>
            <button
              className={`format-btn ${exportFormat === 'c' ? 'active' : ''}`}
              onClick={() => setExportFormat('c')}
            >
              <Code size={18} /> C/C++
            </button>
          </div>
        </div>

        <button className="btn-primary" onClick={handleExport}>
          Generate Export
        </button>
      </div>

      {exportedCode && (
        <div className="export-result">
          <div className="code-header">
            <h3>Exported Code</h3>
            <div className="code-actions">
              <button className="btn-icon" onClick={handleCopy}>
                <Copy size={18} /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <button className="btn-icon" onClick={handleDownload}>
                <Download size={18} /> Download
              </button>
            </div>
          </div>
          <pre className="code-block">
            <code>{exportedCode}</code>
          </pre>
        </div>
      )}

      <div className="export-info">
        <h3>Export Format Details</h3>
        <ul>
          <li><strong>Text:</strong> Plain text arrays for general use</li>
          <li><strong>MATLAB:</strong> Ready-to-use MATLAB/Octave code with variables b and a</li>
          <li><strong>Python:</strong> NumPy arrays for use with SciPy signal processing</li>
          <li><strong>C/C++:</strong> Float arrays for embedded systems and DSP applications</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportPanel;