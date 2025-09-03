import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileCheck, 
  X, 
  Sparkles,
  FolderOpen,
  Image,
  Download
} from 'lucide-react';
import '../styles/design-system.css';
import './FileUploadNew.css';

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  uploadedFiles: File[];
  onFluentUIIcons?: (icons: any[]) => void;
}


const FileUploadNew: React.FC<FileUploadProps> = ({ 
  onFilesUploaded, 
  uploadedFiles,
  onFluentUIIcons 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingFiles, setProcessingFiles] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setProcessingFiles(true);
    setUploadProgress(0);
    
    // Simulate file processing with progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessingFiles(false);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    // Filter for SVG files
    const svgFiles = acceptedFiles.filter(file => 
      file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')
    );
    
    if (svgFiles.length > 0) {
      onFilesUploaded([...uploadedFiles, ...svgFiles]);
    }

    // Handle FluentUI icons if needed
    if (onFluentUIIcons && acceptedFiles.some(f => f.name.includes('fluent'))) {
      // Process FluentUI icons
      onFluentUIIcons([]);
    }
  }, [uploadedFiles, onFilesUploaded, onFluentUIIcons]);

  const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg']
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesUploaded(newFiles);
  };

  const clearAll = () => {
    onFilesUploaded([]);
  };

  const downloadSample = () => {
    // Create a sample SVG
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
    <div className="file-upload-new ds-card">
      {/* Header Section */}
      <div className="upload-header">
        <div className="ds-section-header">
          <div className="ds-section-icon">
            <Upload size={24} />
          </div>
          <div>
            <h2 className="ds-section-title">Upload SVG Files</h2>
            <p className="upload-subtitle">
              Drag and drop your SVG files here or click to browse
            </p>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="upload-actions">
            <span className="file-count ds-badge ds-badge-primary">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
            </span>
            <button onClick={clearAll} className="ds-button ds-button-ghost">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`drop-zone ${isDragActive ? 'active' : ''} ${uploadedFiles.length > 0 ? 'has-files' : ''}`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {processingFiles ? (
            <motion.div
              key="processing"
              className="drop-zone-content processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="processing-spinner">
                <div className="ds-spinner" />
              </div>
              <h3>Processing Files...</h3>
              <div className="ds-progress">
                <motion.div 
                  className="ds-progress-fill"
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p>{uploadProgress}% Complete</p>
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              key="drag-active"
              className="drop-zone-content drag-active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <FolderOpen size={64} />
              </motion.div>
              <h3>Drop your files here!</h3>
              <p>Release to upload your SVG files</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              className="drop-zone-content default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="upload-icon-container">
                <motion.div
                  className="upload-icon"
                  animate={{ 
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Upload size={48} />
                </motion.div>
                <div className="sparkle-icons">
                  <Sparkles className="sparkle sparkle-1" size={16} />
                  <Sparkles className="sparkle sparkle-2" size={20} />
                  <Sparkles className="sparkle sparkle-3" size={14} />
                </div>
              </div>
              
              <h3>Upload Your SVG Icons</h3>
              <p>Drag & drop files here, or click to select</p>
              
              <div className="upload-info">
                <div className="info-item">
                  <Image size={16} />
                  <span>SVG files only</span>
                </div>
                <div className="info-item">
                  <FileCheck size={16} />
                  <span>Multiple files supported</span>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  downloadSample();
                }}
                className="ds-button ds-button-secondary sample-button"
              >
                <Download size={16} />
                Download Sample SVG
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <motion.div 
          className="file-list"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <h4 className="file-list-title">Uploaded Files</h4>
          <div className="file-grid">
            <AnimatePresence>
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  className="file-item"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="file-preview">
                    {/* SVG Preview would go here */}
                    <Image size={32} />
                  </div>
                  
                  <div className="file-info">
                    <div className="file-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  
                  <button
                    className="file-remove"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-card">
          <div className="action-icon">
            <FolderOpen size={20} />
          </div>
          <div>
            <h4>Batch Upload</h4>
            <p>Select multiple files at once</p>
          </div>
        </div>
        
        <div className="action-card">
          <div className="action-icon">
            <Image size={20} />
          </div>
          <div>
            <h4>SVG Support</h4>
            <p>All SVG formats accepted</p>
          </div>
        </div>
        
        <div className="action-card">
          <div className="action-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h4>Auto-Process</h4>
            <p>Files ready for styling</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadNew;
