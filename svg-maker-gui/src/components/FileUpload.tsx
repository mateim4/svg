import React, { useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, FileImage, Folder, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import './FileUpload.css';

interface FluentUIIcon {
  name: string;
  svgFiles: File[];
  metadata?: any;
  sizes: number[];
  variants: string[];
}

interface FileUploadProps {
  onFilesUploaded: (files: File[]) => void;
  uploadedFiles: File[];
  onFluentUIIcons?: (icons: FluentUIIcon[]) => void;
}

// Memoized file item component to prevent unnecessary re-renders
const FileItem = React.memo(({ 
  file, 
  index, 
  onRemove 
}: { 
  file: File; 
  index: number; 
  onRemove: (index: number) => void; 
}) => (
  <motion.div
    className="file-item"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: Math.min(index * 0.02, 0.5) }} // Reduced delay and capped
    layout={false} // Disable layout animations to prevent stack overflow
  >
    <FileImage size={20} />
    <span className="file-name" title={file.name}>{file.name}</span>
    <span className="file-size">{(file.size / 1024).toFixed(1)}KB</span>
    <motion.button
      className="remove-button"
      onClick={() => onRemove(index)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <X size={16} />
    </motion.button>
  </motion.div>
));

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded, uploadedFiles, onFluentUIIcons }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const itemsPerPage = 50;

  // Process FluentUI icons from folder structure
  const processFluentUIIcons = async (files: File[]): Promise<FluentUIIcon[]> => {
    const fluentIcons: { [key: string]: FluentUIIcon } = {};
    
    for (const file of files) {
      const path = file.webkitRelativePath || file.name;
      
      // Check if it's FluentUI structure: assets/IconName/SVG/*.svg or assets/IconName/metadata.json
      const fluentMatch = path.match(/assets\/([^/]+)\/(SVG\/(.+\.svg)|metadata\.json)$/i);
      if (fluentMatch) {
        const iconName = fluentMatch[1];
        
        if (!fluentIcons[iconName]) {
          fluentIcons[iconName] = {
            name: iconName,
            svgFiles: [],
            sizes: [],
            variants: []
          };
        }
        
        if (fluentMatch[3]) {
          // It's an SVG file
          fluentIcons[iconName].svgFiles.push(file);
          
          // Extract size and variant from filename: ic_fluent_iconname_20_regular.svg
          const svgMatch = fluentMatch[3].match(/ic_fluent_[^_]+_(\d+)_(filled|regular)\.svg$/i);
          if (svgMatch) {
            const size = parseInt(svgMatch[1]);
            const variant = svgMatch[2].toLowerCase();
            
            if (!fluentIcons[iconName].sizes.includes(size)) {
              fluentIcons[iconName].sizes.push(size);
            }
            if (!fluentIcons[iconName].variants.includes(variant)) {
              fluentIcons[iconName].variants.push(variant);
            }
          }
        } else if (path.endsWith('metadata.json')) {
          // Parse metadata
          try {
            const text = await file.text();
            fluentIcons[iconName].metadata = JSON.parse(text);
          } catch (e) {
            console.warn('Failed to parse metadata for', iconName, e);
          }
        }
      }
    }
    
    // Sort sizes and return
    return Object.values(fluentIcons).map(icon => ({
      ...icon,
      sizes: icon.sizes.sort((a, b) => a - b)
    })).filter(icon => icon.svgFiles.length > 0);
  };

  // Helper function to get all files from directory recursively
  const getAllFilesFromDirectory = async (dirEntry: FileSystemDirectoryEntry): Promise<File[]> => {
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
                readEntries();
              })
              .catch(reject);
          }, reject);
        };

        readEntries();
      });
    };

    return readDirectory(dirEntry);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const items = Array.from(e.dataTransfer.items);
    const filePromises: Promise<File[]>[] = [];
    const directFiles: File[] = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry?.isDirectory) {
          filePromises.push(getAllFilesFromDirectory(entry as FileSystemDirectoryEntry));
        } else {
          const file = item.getAsFile();
          if (file) directFiles.push(file);
        }
      }
    }

    try {
      const folderResults = await Promise.all(filePromises);
      const allFiles = [...directFiles, ...folderResults.flat()];
      
      // Enhanced filtering for processable files
      const processableFiles = allFiles.filter(file => {
        const fileName = file.name.toLowerCase();
        const filePath = (file as any).webkitRelativePath?.toLowerCase() || fileName;
        
        // Only include SVG files
        if (!(fileName.endsWith('.svg') || file.type === 'image/svg+xml')) {
          return false;
        }
        
        // Skip common non-icon files
        if (fileName.includes('logo') || fileName.includes('brand') || fileName.includes('header')) {
          return false;
        }
        
        // Skip very large files (likely not icons)
        if (file.size > 500000) { // 500KB limit
          return false;
        }
        
        // Skip files in common non-icon directories
        const skipPaths = ['node_modules', 'dist', 'build', '.git', 'docs', 'examples', 'demo'];
        if (skipPaths.some(path => filePath.includes(path))) {
          return false;
        }
        
        return true;
      });
      
      // Limit the number of files to prevent crashes
      const maxFiles = 100; // Reduced from 1000 to prevent React stack overflow
      const limitedFiles = processableFiles.slice(0, maxFiles);
      
      if (processableFiles.length > maxFiles) {
        console.warn(`Limited to first ${maxFiles} files out of ${processableFiles.length} found`);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
      
      // Reset pagination when new files are loaded
      setCurrentPage(0);
      setIsExpanded(false);
      
      // Check if this is a FluentUI repository and process accordingly
      const isFluentUIRepo = allFiles.some(file => {
        const path = file.webkitRelativePath || file.name;
        return path.includes('/assets/') && path.includes('/SVG/') && 
               file.name.startsWith('ic_fluent_');
      });

      if (isFluentUIRepo && onFluentUIIcons) {
        // Process as FluentUI icons
        processFluentUIIcons(allFiles).then(fluentIcons => {
          onFluentUIIcons(fluentIcons);
        }).catch(error => {
          console.warn('Failed to process FluentUI icons:', error);
        });
      }
      
      onFilesUploaded([...uploadedFiles, ...limitedFiles]);
    } catch (error) {
      console.error('Failed to process dropped folders:', error);
    }
  }, [onFilesUploaded, uploadedFiles, onFluentUIIcons]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Apply the same filtering logic as drag and drop
    const processableFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const filePath = (file as any).webkitRelativePath?.toLowerCase() || fileName;
      
      // Only include SVG files
      if (!(fileName.endsWith('.svg') || file.type === 'image/svg+xml')) {
        return false;
      }
      
      // Skip common non-icon files
      if (fileName.includes('logo') || fileName.includes('brand') || fileName.includes('header')) {
        return false;
      }
      
      // Skip very large files (likely not icons)
      if (file.size > 500000) { // 500KB limit
        return false;
      }
      
      // Skip files in common non-icon directories
      const skipPaths = ['node_modules', 'dist', 'build', '.git', 'docs', 'examples', 'demo'];
      if (skipPaths.some(path => filePath.includes(path))) {
        return false;
      }
      
      return true;
    });
    
    // Limit the number of files
    const maxFiles = 100; // Reduced from 1000 to prevent React stack overflow
    const limitedFiles = processableFiles.slice(0, maxFiles);
    
    if (processableFiles.length > maxFiles) {
      console.warn(`Limited to first ${maxFiles} files out of ${processableFiles.length} found`);
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
    
    // Reset pagination when new files are loaded
    setCurrentPage(0);
    setIsExpanded(false);
    
    // Check if this is a FluentUI repository and process accordingly
    const isFluentUIRepo = files.some(file => {
      const path = file.webkitRelativePath || file.name;
      return path.includes('/assets/') && path.includes('/SVG/') && 
             file.name.startsWith('ic_fluent_');
    });

    if (isFluentUIRepo && onFluentUIIcons) {
      // Process as FluentUI icons
      processFluentUIIcons(files).then(fluentIcons => {
        onFluentUIIcons(fluentIcons);
      }).catch(error => {
        console.warn('Failed to process FluentUI icons:', error);
      });
    }
    
    onFilesUploaded([...uploadedFiles, ...limitedFiles]);
  }, [onFilesUploaded, uploadedFiles, onFluentUIIcons]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const removeFile = useCallback((indexToRemove: number) => {
    onFilesUploaded(uploadedFiles.filter((_, index) => index !== indexToRemove));
  }, [onFilesUploaded, uploadedFiles]);

  // Memoized calculations to prevent unnecessary re-renders
  const { displayFiles, totalPages, shouldShowPagination } = useMemo(() => {
    const shouldExpand = uploadedFiles.length > 10 && isExpanded;
    const files = shouldExpand 
      ? uploadedFiles.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
      : uploadedFiles.length > 10 && !isExpanded 
        ? uploadedFiles.slice(0, 5) 
        : uploadedFiles.slice(0, itemsPerPage);
    
    return {
      displayFiles: files,
      totalPages: Math.ceil(uploadedFiles.length / itemsPerPage),
      shouldShowPagination: isExpanded && uploadedFiles.length > itemsPerPage
    };
  }, [uploadedFiles, isExpanded, currentPage, itemsPerPage]);

  return (
    <div className="file-upload-container">
      <div
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="dropzone-content">
          <Upload className="upload-icon" size={48} />
          <h3>Drop SVG files or folders here</h3>
          <p>or click to browse files/folders</p>
          
          <div className="browse-buttons">
            <input
              type="file"
              id="file-input"
              accept=".svg"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <input
              type="file"
              id="folder-input"
              {...({ webkitdirectory: "" } as any)}
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <motion.label
              htmlFor="file-input"
              className="browse-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileImage size={16} />
              Browse Files
            </motion.label>
            
            <motion.label
              htmlFor="folder-input"
              className="browse-button folder-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Folder size={16} />
              Browse Folders
            </motion.label>
          </div>
          
          {isDragActive && (
            <motion.div
              className="drag-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>Drop files or folders here...</p>
            </motion.div>
          )}
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <motion.div
          className="file-list"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="file-list-header">
            <h4>Uploaded Files ({uploadedFiles.length})</h4>
            {uploadedFiles.length > 10 && (
              <motion.button
                className="expand-button"
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isExpanded ? 'Collapse' : 'Expand'}
              </motion.button>
            )}
          </div>

          {showWarning && (
            <motion.div
              className="warning-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <AlertTriangle size={16} />
              <span>Showing first 100 files only to prevent performance issues</span>
            </motion.div>
          )}

          <>
            {displayFiles.map((file, index) => {
              const actualIndex = uploadedFiles.length > 10 && !isExpanded 
                ? index 
                : currentPage * itemsPerPage + index;
              
              return (
                <FileItem
                  key={`${file.name}-${file.size}-${actualIndex}`} // More stable key
                  file={file}
                  index={index}
                  onRemove={() => removeFile(actualIndex)}
                />
              );
            })}

            {uploadedFiles.length > 10 && !isExpanded && (
              <div className="collapsed-info">
                <span>... and {uploadedFiles.length - 5} more files</span>
              </div>
            )}

            {shouldShowPagination && (
              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="page-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="page-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;