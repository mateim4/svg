import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
// Using built-in browser sanitization instead of DOMPurify for now
import { 
  Upload, 
  FileCheck, 
  X, 
  Sparkles,
  FolderOpen,
  Image,
  Download,
  HardDrive,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileX,
  Loader2
} from 'lucide-react';
import '../styles/design-system.css';
import './FileUploadFixed.css';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  uploadedFiles: File[];
  onFluentUIIcons?: (icons: any[]) => void;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedContent?: string;
}

interface ProcessedFile {
  file: File;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  preview?: string;
  progress?: number;
}

const FileUploadFixed: React.FC<FileUploadProps> = ({ 
  onFilesUploaded, 
  uploadedFiles,
  onFluentUIIcons 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<Map<string, ProcessedFile>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const previewsCleanupRef = useRef<Map<string, string>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Proper SVG validation
  const validateSVGContent = async (file: File): Promise<FileValidationResult> => {
    try {
      const text = await file.text();
      
      // Check if it's actually SVG content
      if (!text.includes('<svg') || !text.includes('</svg>')) {
        return { isValid: false, error: 'Invalid SVG: Missing SVG tags' };
      }
      
      // Parse SVG to check for validity
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return { isValid: false, error: 'Invalid SVG: Parsing failed' };
      }
      
      // Sanitize SVG content for XSS prevention using built-in parser
      // Remove any script tags or event handlers
      const sanitized = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
        .replace(/on\w+\s*=\s*'[^']*'/gi, '')
        .replace(/javascript:/gi, '');
      
      // Check if sanitization removed critical content
      if (!sanitized.includes('<svg')) {
        return { isValid: false, error: 'SVG contains potentially malicious content' };
      }
      
      return { isValid: true, sanitizedContent: sanitized };
    } catch (error) {
      return { 
        isValid: false, 
        error: `Failed to validate: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  };

  // Process files with real progress tracking
  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);
    
    const newProcessed = new Map<string, ProcessedFile>();
    const validFiles: File[] = [];
    let errorCount = 0;
    
    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      
      // Check if aborted
      if (abortControllerRef.current.signal.aborted) {
        break;
      }
      
      // Update progress
      newProcessed.set(fileKey, {
        file,
        status: 'processing',
        progress: Math.round((i / files.length) * 100)
      });
      setProcessedFiles(new Map(newProcessed));
      
      // Validate file
      const validation = await validateSVGContent(file);
      
      if (validation.isValid && validation.sanitizedContent) {
        // Create object URL for preview (will be cleaned up)
        const blob = new Blob([validation.sanitizedContent], { type: 'image/svg+xml' });
        const previewUrl = URL.createObjectURL(blob);
        previewsCleanupRef.current.set(fileKey, previewUrl);
        
        newProcessed.set(fileKey, {
          file,
          status: 'success',
          preview: validation.sanitizedContent,
          progress: 100
        });
        validFiles.push(file);
      } else {
        newProcessed.set(fileKey, {
          file,
          status: 'error',
          error: validation.error || 'Unknown validation error',
          progress: 100
        });
        errorCount++;
      }
    }
    
    setProcessedFiles(newProcessed);
    setIsProcessing(false);
    
    // Update parent component with valid files
    if (validFiles.length > 0) {
      onFilesUploaded([...uploadedFiles, ...validFiles]);
      setSuccessMessage(`Successfully uploaded ${validFiles.length} file${validFiles.length !== 1 ? 's' : ''}`);
    }
    
    if (errorCount > 0) {
      setError(`${errorCount} file${errorCount !== 1 ? 's' : ''} failed validation`);
    }
    
    // Clear messages after 5 seconds
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000);
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setError(`${rejectedFiles.length} file${rejectedFiles.length !== 1 ? 's were' : ' was'} rejected. Only SVG files are allowed.`);
      setTimeout(() => setError(null), 5000);
    }
    
    // Process accepted files
    if (acceptedFiles.length > 0) {
      await processFiles(acceptedFiles);
    }
  }, [uploadedFiles, onFilesUploaded]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg']
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
    disabled: isProcessing
  });

  const removeFile = useCallback((index: number) => {
    const file = uploadedFiles[index];
    const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
    
    // Clean up preview URL if exists
    const previewUrl = previewsCleanupRef.current.get(fileKey);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewsCleanupRef.current.delete(fileKey);
    }
    
    // Update processed files
    const newProcessed = new Map(processedFiles);
    newProcessed.delete(fileKey);
    setProcessedFiles(newProcessed);
    
    // Update parent
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesUploaded(newFiles);
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Removed ${file.name}`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  }, [uploadedFiles, processedFiles, onFilesUploaded]);

  const clearAll = useCallback(() => {
    // Clean up all preview URLs
    previewsCleanupRef.current.forEach(url => URL.revokeObjectURL(url));
    previewsCleanupRef.current.clear();
    
    // Clear state
    setProcessedFiles(new Map());
    onFilesUploaded([]);
    setError(null);
    setSuccessMessage(null);
  }, [onFilesUploaded]);

  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setError('Processing cancelled');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all preview URLs
      previewsCleanupRef.current.forEach(url => URL.revokeObjectURL(url));
      
      // Abort any ongoing processing
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    const userLocale = navigator.language || 'en-US';
    return new Intl.DateTimeFormat(userLocale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const downloadSample = () => {
    const sampleSVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 22h20L12 2z" fill="currentColor"/>
    </svg>`;
    
    const blob = new Blob([sampleSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-icon.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="file-upload-fixed" aria-labelledby="upload-title" aria-describedby="upload-desc">
      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="status-message error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="alert"
            aria-live="assertive"
          >
            <XCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            className="status-message success-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="status"
            aria-live="polite"
          >
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <header className="upload-header" aria-label="Upload SVG Files">
        <div className="header-content">
          <Upload size={24} className="header-icon" aria-hidden="true" />
          <div className="header-text">
            <h2 id="upload-title">Upload SVG Files</h2>
            <p id="upload-desc">Drag and drop or click to browse. Only SVG files are accepted.</p>
          </div>
        </div>
        {uploadedFiles.length > 0 && (
          <nav className="header-actions" aria-label="Upload actions">
            <span className="file-counter" aria-live="polite">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
            </span>
            <button 
              onClick={clearAll} 
              className="btn-text"
              aria-label="Clear all uploaded files"
            >
              Clear All
            </button>
          </nav>
        )}
      </header>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`drop-zone ${isDragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''} ${uploadedFiles.length > 0 ? 'compact' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="File upload drop zone"
        aria-disabled={isProcessing}
        aria-describedby="upload-desc"
      >
        <input {...getInputProps()} aria-label="File input" />
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              className="drop-content processing-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="spinner" size={48} aria-hidden="true" />
              <h3>Processing Files...</h3>
              <p>Validating and preparing your SVG files</p>
              <button 
                onClick={cancelProcessing} 
                className="btn-secondary"
                aria-label="Cancel file processing"
              >
                Cancel
              </button>
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              key="drag"
              className="drop-content drag-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <FolderOpen size={64} className="drop-icon" aria-hidden="true" />
              <h3>Drop your files here!</h3>
              <p>Release to upload SVG files</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              className="drop-content default-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Upload size={48} className="upload-icon" aria-hidden="true" />
              <h3>Upload Your SVG Icons</h3>
              <p>Drag & drop files here, or click to select</p>
              <div className="upload-info" aria-label="Upload info">
                <span><FileCheck size={16} aria-hidden="true" /> SVG files only</span>
                <span><Image size={16} aria-hidden="true" /> Multiple files supported</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSample();
                }}
                className="btn-secondary"
                aria-label="Download sample SVG"
              >
                <Download size={16} aria-hidden="true" />
                Download Sample
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <motion.div 
          className="file-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3 className="list-title">Uploaded Files</h3>
          <div className="file-grid" role="list" aria-label="Uploaded SVG files">
            <AnimatePresence>
              {uploadedFiles.map((file, index) => {
                const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
                const processed = processedFiles.get(fileKey);
                const uploadDate = new Date(file.lastModified);
                return (
                  <motion.div
                    key={fileKey}
                    className={`file-card ${processed?.status || 'pending'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    role="listitem"
                    aria-label={`SVG file card for ${file.name}`}
                  >
                    {/* Status Indicator */}
                    <div className="file-status" aria-label={`Status: ${processed?.status || 'pending'}`}> 
                      {processed?.status === 'success' && <CheckCircle size={16} aria-hidden="true" />}
                      {processed?.status === 'error' && <AlertCircle size={16} aria-hidden="true" />}
                      {processed?.status === 'processing' && <Loader2 size={16} className="spinner" aria-hidden="true" />}
                      {!processed && <HardDrive size={16} aria-hidden="true" />}
                    </div>
                    {/* Remove Button */}
                    <button
                      className="file-remove"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                      disabled={isProcessing}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                    {/* File Preview */}
                    <div className="file-preview">
                      {processed?.preview ? (
                        <div 
                          className="svg-preview"
                          dangerouslySetInnerHTML={{ __html: processed.preview }}
                          aria-label={`SVG preview for ${file.name}`}
                        />
                      ) : (
                        <FileX size={24} className="no-preview" aria-hidden="true" />
                      )}
                    </div>
                    {/* File Info */}
                    <div className="file-info">
                      <h4 title={file.name}>{file.name.replace(/\.svg$/i, '')}</h4>
                      <div className="file-meta">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(uploadDate)}</span>
                      </div>
                      {processed?.error && (
                        <div className="file-error" role="alert">
                          {processed.error}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default FileUploadFixed;