import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  Download, 
  FileImage, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap,
  Archive,
  AlertCircle
} from 'lucide-react';
import { IconConfig } from '../types/IconConfig';
import { SVGFile } from '../services/githubService';
import './BatchProcessor.css';

export interface ProcessedFile {
  originalFile: SVGFile;
  processedSvg: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  processingTime?: number;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  currentFile?: string;
  isRunning: boolean;
  isPaused: boolean;
  startTime?: number;
  estimatedTimeRemaining?: number;
}

interface BatchProcessorProps {
  files: SVGFile[];
  config: IconConfig;
  onProcess: (files: SVGFile[], config: IconConfig) => Promise<ProcessedFile[]>;
  onDownloadAll: (processedFiles: ProcessedFile[]) => void;
  onCancel?: () => void;
}

const BatchProcessor: React.FC<BatchProcessorProps> = ({
  files,
  config,
  onProcess,
  onDownloadAll,
  onCancel,
}) => {
  const [progress, setProgress] = useState<BatchProgress>({
    total: files.length,
    completed: 0,
    failed: 0,
    isRunning: false,
    isPaused: false,
  });
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const calculateProgress = useCallback(() => {
    const completed = processedFiles.filter(f => f.status === 'completed').length;
    const failed = processedFiles.filter(f => f.status === 'failed').length;
    const processing = processedFiles.filter(f => f.status === 'processing').length;
    
    return {
      completed,
      failed,
      processing,
      pending: files.length - completed - failed - processing,
      percentage: files.length > 0 ? ((completed + failed) / files.length) * 100 : 0,
    };
  }, [processedFiles, files.length]);

  const startProcessing = async () => {
    setIsProcessing(true);
    setProgress(prev => ({ ...prev, isRunning: true, startTime: Date.now() }));
    
    try {
      // Initialize processed files array
      const initialFiles: ProcessedFile[] = files.map(file => ({
        originalFile: file,
        processedSvg: '',
        status: 'pending' as const,
      }));
      setProcessedFiles(initialFiles);

      // Process files with progress tracking
      const result = await onProcess(files, config);
      setProcessedFiles(result);
      
    } catch (error) {
      console.error('Batch processing failed:', error);
    } finally {
      setIsProcessing(false);
      setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const cancelProcessing = () => {
    setIsProcessing(false);
    setProgress(prev => ({ ...prev, isRunning: false, isPaused: false }));
    onCancel?.();
  };

  const downloadAll = () => {
    const completedFiles = processedFiles.filter(f => f.status === 'completed');
    onDownloadAll(completedFiles);
  };

  const stats = calculateProgress();
  const hasStarted = processedFiles.length > 0;
  const canDownload = stats.completed > 0;
  const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

  if (files.length === 0) {
    return (
      <div className="batch-processor empty">
        <div className="empty-content">
          <FileImage size={48} />
          <h3>No Files Selected</h3>
          <p>Select SVG files from the repository to process them</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-processor">
      {/* Header */}
      <motion.div
        className="processor-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-info">
          <h3>Batch Processing</h3>
          <div className="batch-stats">
            <span className="stat-item">
              <FileImage size={16} />
              {files.length} files
            </span>
            <span className="stat-item">
              <Archive size={16} />
              {formatFileSize(totalSize)}
            </span>
          </div>
        </div>

        <div className="header-actions">
          {!isProcessing && !hasStarted && (
            <motion.button
              className="action-btn start-btn"
              onClick={startProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={18} />
              Start Processing
            </motion.button>
          )}

          {isProcessing && (
            <motion.button
              className="action-btn cancel-btn"
              onClick={cancelProcessing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Square size={18} />
              Cancel
            </motion.button>
          )}

          {hasStarted && !isProcessing && canDownload && (
            <motion.button
              className="action-btn download-btn"
              onClick={downloadAll}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={18} />
              Download All ({stats.completed})
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      {hasStarted && (
        <motion.div
          className="progress-section"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.4 }}
        >
          <div className="progress-info">
            <div className="progress-stats">
              <span className="progress-text">
                {stats.completed} completed, {stats.failed} failed, {stats.pending} pending
              </span>
              <span className="progress-percentage">
                {Math.round(stats.percentage)}%
              </span>
            </div>
          </div>

          <div className="progress-bar">
            <motion.div
              className="progress-fill completed"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.completed / files.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="progress-fill failed"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(stats.failed / files.length) * 100}%`,
                left: `${(stats.completed / files.length) * 100}%`
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {progress.currentFile && isProcessing && (
            <motion.div
              className="current-file"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Zap size={16} className="processing-icon" />
              <span>Processing: {progress.currentFile}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* File List */}
      <motion.div
        className="file-list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {processedFiles.length > 0 ? (
          <div className="processed-files">
            {processedFiles.map((processedFile, index) => (
              <motion.div
                key={processedFile.originalFile.path}
                className={`file-item ${processedFile.status}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="file-icon">
                  {processedFile.status === 'completed' && (
                    <CheckCircle2 size={18} className="status-icon completed" />
                  )}
                  {processedFile.status === 'failed' && (
                    <XCircle size={18} className="status-icon failed" />
                  )}
                  {processedFile.status === 'processing' && (
                    <motion.div
                      className="processing-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {processedFile.status === 'pending' && (
                    <Clock size={18} className="status-icon pending" />
                  )}
                </div>

                <div className="file-info">
                  <div className="file-name">{processedFile.originalFile.name}</div>
                  <div className="file-meta">
                    <span>{processedFile.originalFile.path}</span>
                    {processedFile.originalFile.size && (
                      <span> • {formatFileSize(processedFile.originalFile.size)}</span>
                    )}
                    {processedFile.processingTime && (
                      <span> • {formatTime(processedFile.processingTime / 1000)}</span>
                    )}
                  </div>
                  {processedFile.error && (
                    <div className="error-message">
                      <AlertCircle size={14} />
                      {processedFile.error}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="file-preview">
            <h4>Files to Process</h4>
            <div className="preview-list">
              {files.slice(0, 10).map((file, index) => (
                <motion.div
                  key={file.path}
                  className="preview-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FileImage size={16} />
                  <span className="preview-name">{file.name}</span>
                  <span className="preview-path">{file.path}</span>
                </motion.div>
              ))}
              {files.length > 10 && (
                <div className="preview-more">
                  <span>... and {files.length - 10} more files</span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Summary */}
      {hasStarted && !isProcessing && (
        <motion.div
          className="processing-summary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="summary-stats">
            <div className="stat-card completed">
              <CheckCircle2 size={24} />
              <div>
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            
            {stats.failed > 0 && (
              <div className="stat-card failed">
                <XCircle size={24} />
                <div>
                  <div className="stat-number">{stats.failed}</div>
                  <div className="stat-label">Failed</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BatchProcessor;