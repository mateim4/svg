import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Play, Eye, Grid3X3, Plus } from 'lucide-react';
import { IconConfig } from '../types/IconConfig';
import './PreviewPanel.css';

interface PreviewPanelProps {
  config: IconConfig;
  uploadedFiles: File[];
  processedIcons: string[];
  onProcessedIcons: (icons: string[]) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  config,
  uploadedFiles,
  processedIcons,
  onProcessedIcons,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'grid' | 'single'>('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 10;

  // Calculate which files to show and process
  const { currentFiles, hasMore, totalPages } = useMemo(() => {
    const totalProcessed = (currentPage + 1) * itemsPerPage;
    const filesToProcess = uploadedFiles.slice(0, totalProcessed);
    const hasMoreFiles = uploadedFiles.length > totalProcessed;
    const pages = Math.ceil(uploadedFiles.length / itemsPerPage);
    
    return {
      currentFiles: filesToProcess,
      hasMore: hasMoreFiles,
      totalPages: pages
    };
  }, [uploadedFiles, currentPage, itemsPerPage]);

  // Reset pagination when uploadedFiles change
  useEffect(() => {
    setCurrentPage(0);
    onProcessedIcons([]); // Clear existing previews
  }, [uploadedFiles.length, onProcessedIcons]);

  const generatePreview = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      // This would call the backend API to process icons
      const formData = new FormData();
      currentFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });
      formData.append('config', JSON.stringify(config));
      
      const response = await fetch('/api/process-icons', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        onProcessedIcons(result.processedIcons);
      }
    } catch (error) {
      console.error('Error processing icons:', error);
      // For demo purposes, generate mock SVGs
      generateMockPreviews();
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockPreviews = () => {
    // Generate mock SVGs for preview - only for current files
    const mockSvgs = currentFiles.map((file, index) => {
      const style = config.style;
      const filters = style === 'neumorphism' 
        ? `<filter id="shadow"><feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.12)"/></filter>`
        : style === 'glassmorphism' 
        ? `<filter id="blur"><feGaussianBlur stdDeviation="2"/></filter>`
        : `<filter id="frost"><feGaussianBlur stdDeviation="8"/></filter>`;
      
      const rectStyle = style === 'neumorphism'
        ? `fill="var(--text-quaternary)" filter="url(#shadow)"`
        : style === 'glassmorphism'
        ? `fill="white" fill-opacity="0.2" stroke="rgba(255,255,255,0.3)"`
        : `fill="white" fill-opacity="0.1" filter="url(#frost)"`;

      return `<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>${filters}</defs>
        <rect width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" ${rectStyle}/>
        <circle cx="${config.width/2}" cy="${config.height/2}" r="${(config.width - config.padding*2)/4}" fill="${config.iconColor}"/>
      </svg>`;
    });
    
    onProcessedIcons(mockSvgs);
  };

  const loadMorePreviews = async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    
    try {
      // Process the next batch of files
      const nextPage = currentPage + 1;
      const startIndex = nextPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const nextBatchFiles = uploadedFiles.slice(startIndex, endIndex);
      
      // For demo purposes, generate mock SVGs for the new batch
      const newMockSvgs = nextBatchFiles.map((file, index) => {
        const globalIndex = startIndex + index;
        const style = config.style;
        const filters = style === 'neumorphism' 
          ? `<filter id="shadow-${globalIndex}"><feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.12)"/></filter>`
          : style === 'glassmorphism' 
          ? `<filter id="blur-${globalIndex}"><feGaussianBlur stdDeviation="2"/></filter>`
          : `<filter id="frost-${globalIndex}"><feGaussianBlur stdDeviation="8"/></filter>`;
        
        const rectStyle = style === 'neumorphism'
          ? `fill="var(--text-quaternary)" filter="url(#shadow-${globalIndex})"`
          : style === 'glassmorphism'
          ? `fill="white" fill-opacity="0.2" stroke="rgba(255,255,255,0.3)"`
          : `fill="white" fill-opacity="0.1" filter="url(#frost-${globalIndex})"`;

        return `<svg width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
          <defs>${filters}</defs>
          <rect width="${config.width}" height="${config.height}" rx="${config.cornerRadius}" ${rectStyle}/>
          <circle cx="${config.width/2}" cy="${config.height/2}" r="${(config.width - config.padding*2)/4}" fill="${config.iconColor}"/>
        </svg>`;
      });
      
      // Append new previews to existing ones
      onProcessedIcons([...processedIcons, ...newMockSvgs]);
      
    } catch (error) {
      console.error('Error loading more previews:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const downloadAll = () => {
    processedIcons.forEach((svg, index) => {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = currentFiles[index]?.name?.replace('.svg', '') || `icon-${index}`;
      a.download = `${fileName}-${config.style}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="preview-panel">
      <div className="preview-header">
        <h3>
          <Eye size={20} />
          Preview & Export
        </h3>
        
        <div className="preview-controls">
          <motion.button
            className={`view-mode ${previewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setPreviewMode('grid')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Grid3X3 size={16} />
          </motion.button>
        </div>
      </div>

      {uploadedFiles.length === 0 ? (
        <div className="empty-state">
          <p>Upload SVG files to see preview</p>
        </div>
      ) : (
        <>
          <motion.button
            className="generate-button"
            onClick={generatePreview}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play size={20} />
            {isProcessing 
              ? `Processing ${currentFiles.length} files...` 
              : `Generate Preview (${currentFiles.length}/${uploadedFiles.length})`
            }
          </motion.button>

          {processedIcons.length > 0 && (
            <motion.div
              className="preview-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="preview-actions">
                <motion.button
                  className="download-all-button"
                  onClick={downloadAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={20} />
                  Download All
                </motion.button>
              </div>

              <div className={`icons-grid ${previewMode}`}>
                {processedIcons.map((svg, index) => (
                  <motion.div
                    key={index}
                    className="preview-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div 
                      className="svg-preview"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                    <p className="file-name">
                      {currentFiles[index]?.name?.replace('.svg', '') || `icon-${index}`}-{config.style}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <motion.div
                  className="load-more-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.button
                    className="load-more-button"
                    onClick={loadMorePreviews}
                    disabled={isLoadingMore}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={20} />
                    {isLoadingMore 
                      ? `Loading ${Math.min(itemsPerPage, uploadedFiles.length - processedIcons.length)} more...`
                      : `Load ${Math.min(itemsPerPage, uploadedFiles.length - processedIcons.length)} More`
                    }
                  </motion.button>
                  <p className="progress-text">
                    Showing {processedIcons.length} of {uploadedFiles.length} files
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default PreviewPanel;