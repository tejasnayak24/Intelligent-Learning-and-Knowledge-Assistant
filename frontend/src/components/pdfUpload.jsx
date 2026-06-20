import { useState, useRef } from 'react';
import { documentService } from '../services/documentService';

export default function PdfUpload() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (selectedFile) => {
    setError('');
    setSuccessMessage('');
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF documents are supported!');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    console.log(`Preparing to send ${file.name} via POST /upload`);

    try {
      const resultMessage = await documentService.uploadPdf(file, (progress) => {
        setUploadProgress(progress);
      });

      console.log('Backend resolution response:', resultMessage);
      setSuccessMessage('File parsed and vectorized successfully into your knowledge base!');
      
    } catch (err) {
      console.error('Document ingestion engine processing exception:', err);

      const errMsg = err.response?.data?.detail || 'Failed to connect to the document ingestion node.';
      setError(typeof errMsg === 'string' ? errMsg : 'Validation error processing file boundaries.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span>📁</span> Document Ingestion Engine
      </h3>

      {error && (
        <div className="mb-4 rounded-lg bg-red-950/40 p-3 text-sm text-red-400 border border-red-900/50">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg bg-emerald-950/40 p-3 text-sm text-emerald-400 border border-emerald-900/50">
          {successMessage}
        </div>
      )}

      {/* Drop Zone Box */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleChange}
          />
          <div className="text-4xl mb-3 animate-pulse">📄</div>
          <p className="text-sm font-medium text-slate-200">
            Drag and drop your study material here, or{' '}
            <span className="text-indigo-400 font-semibold hover:underline">browse</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Accepts PDF files up to 25MB</p>
        </div>
      ) : (
        /* File Info & Upload Action Panel */
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 truncate">
              <span className="text-2xl">⚡</span>
              <div className="truncate">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={clearSelection}
                className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                title="Remove file"
              >
                ❌
              </button>
            )}
          </div>

          {/* Progress Section */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>
                  {uploadProgress === 100 
                    ? 'Processing vector embeddings...' 
                    : 'Streaming binary partitions to server...'}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!isUploading && !successMessage && (
            <button
              onClick={handleUploadSubmit}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
            >
              Analyze & Initialize RAG Engine
            </button>
          )}
          
          {successMessage && (
            <button
              onClick={clearSelection}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl transition-all cursor-pointer border border-slate-700"
            >
              Upload Another Document
            </button>
          )}
        </div>
      )}
    </div>
  );
}