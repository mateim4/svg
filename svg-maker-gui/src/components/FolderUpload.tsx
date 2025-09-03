import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Upload, AlertCircle, FileImage, Info } from 'lucide-react';
import './FolderUpload.css';

interface FolderUploadProps {
  onFolderProcessed: (files: File[], folderName: string) => void;
  isLoading?: boolean;
}

const FolderUpload: React.FC<FolderUploadProps> = ({ onFolderProcessed, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFolderFiles = useCallback((files: File[]) => {
    const svgFiles: File[] = [];
    const iconFiles: File[] = [];
    let folderName = 'Imported Repository';

    // Process all files and categorize them
    for (const file of files) {
      const path = file.webkitRelativePath || file.name;
      const fileName = file.name.toLowerCase();
      
      // Extract folder name from first file's path
      if (folderName === 'Imported Repository' && path.includes('/')) {
        folderName = path.split('/')[0];
      }

      // Detect SVG files (including FluentUI structure: assets/IconName/SVG/*.svg)
      if (fileName.endsWith('.svg') || file.type === 'image/svg+xml') {
        svgFiles.push(file);
      }
      // Detect potential icon files (JSON metadata, XML with icon-related names/paths)
      // Special handling for FluentUI metadata.json files
      else if (
        (fileName.endsWith('.json') || fileName.endsWith('.xml')) &&
        (path.toLowerCase().includes('icon') || 
         path.toLowerCase().includes('svg') ||
         path.toLowerCase().includes('fluent') ||
         path.toLowerCase().includes('assets') ||
         fileName.includes('icon') ||
         fileName === 'metadata.json') // FluentUI metadata files
      ) {
        iconFiles.push(file);
      }
    }

    // Enhanced detection for FluentUI structure
    const isFluentUIRepo = files.some(file => {
      const path = file.webkitRelativePath || file.name;
      return path.includes('/assets/') && path.includes('/SVG/') && 
             file.name.startsWith('ic_fluent_');
    });

    if (svgFiles.length === 0 && iconFiles.length === 0) {
      if (isFluentUIRepo) {
        setError('FluentUI repository detected but no processable files found. Please ensure the assets folder contains SVG files and metadata.');
      } else {
        setError('No SVG or icon files found in the uploaded folder. Please ensure the folder contains SVG files or icon data files (JSON/XML).');
      }
      return;
    }

    // Combine SVG files with potential icon files for processing
    const allFiles = [...svgFiles, ...iconFiles];
    
    setError(null);
    onFolderProcessed(allFiles, folderName);
  }, [onFolderProcessed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const items = Array.from(e.dataTransfer.items);
    const filePromises: Promise<File[]>[] = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry?.isDirectory) {
          filePromises.push(getAllFilesFromDirectory(entry as FileSystemDirectoryEntry));
        }
      }
    }

    if (filePromises.length === 0) {
      setError('Please drop a folder/directory, not individual files.');
      return;
    }

    Promise.all(filePromises)
      .then(results => {
        const allFiles = results.flat();
        processFolderFiles(allFiles);
      })
      .catch(err => {
        setError('Failed to read folder contents: ' + err.message);
      });
  }, [processFolderFiles]);

  const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFolderFiles(files);
    }
  }, [processFolderFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  return (
    <div className="folder-upload">
      <div className="folder-upload-header">
        <div className="header-icon">
          <FolderOpen size={24} />
        </div>
        <div className="header-info">
          <h3>Import Repository Folder</h3>
          <p>Upload a downloaded repository folder to bypass GitHub API limits</p>
        </div>
      </div>

      <motion.div
        className={`folder-dropzone ${dragActive ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="dropzone-content">
          <div className="dropzone-icon">
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              <Upload size={48} />
            )}
          </div>
          
          <div className="dropzone-text">
            <h4>Drop a repository folder here</h4>
            <p>Or click to browse for a folder</p>
          </div>

          <input
            type="file"
            id="folder-input"
            {...({ webkitdirectory: "" } as any)}
            multiple
            onChange={handleFolderSelect}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
          
          <motion.label
            htmlFor="folder-input"
            className="browse-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FolderOpen size={20} />
            Select Folder
          </motion.label>
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      <div className="folder-info">
        <div className="info-section">
          <Info size={16} />
          <div>
            <strong>How to use:</strong>
            <ol>
              <li>Download any GitHub repository as ZIP (click "Code" → "Download ZIP")</li>
              <li>Extract the ZIP file to a folder</li>
              <li>Drag the extracted folder here or click "Select Folder"</li>
              <li>Works with FluentUI assets structure, standard SVG folders, and icon JSON data</li>
            </ol>
          </div>
        </div>

        <div className="supported-formats">
          <FileImage size={16} />
          <div>
            <strong>Supported formats:</strong>
<span>SVG files, FluentUI repositories (assets structure), JSON icon data, XML vector files</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to recursively get all files from a directory
async function getAllFilesFromDirectory(dirEntry: FileSystemDirectoryEntry): Promise<File[]> {
  const readDirectory = (entry: FileSystemDirectoryEntry): Promise<File[]> => {
    return new Promise((resolve, reject) => {
      const reader = entry.createReader();
      const allFiles: File[] = [];

      const readEntries = () => {
        reader.readEntries((entries) => {
          if (entries.length === 0) {
            resolve(allFiles);
            return;
          }

          const promises = entries.map((entry) => {
            if (entry.isFile) {
              return new Promise<File>((resolveFile, rejectFile) => {
                (entry as FileSystemFileEntry).file(resolveFile, rejectFile);
              });
            } else if (entry.isDirectory) {
              return readDirectory(entry as FileSystemDirectoryEntry);
            }
            return Promise.resolve([]);
          });

          Promise.all(promises)
            .then((results) => {
              const flatResults = results.flat().filter(Boolean) as File[];
              allFiles.push(...flatResults);
              readEntries(); // Continue reading if there are more entries
            })
            .catch(reject);
        }, reject);
      };

      readEntries();
    });
  };

  return readDirectory(dirEntry);
}

export default FolderUpload;