import React from 'react';
import { motion } from 'framer-motion';
import { 
  Info, 
  FileImage, 
  Package, 
  FolderOpen, 
  FileText,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { GitHubFile } from '../services/githubService';
import './RepositoryAnalysis.css';

interface RepositoryAnalysisProps {
  analysis: {
    hasDirectSvgs: boolean;
    hasPackageJsons: boolean;
    hasAssetsFolders: boolean;
    hasIconManifests: boolean;
    suggestedFormat: 'svg' | 'fluent-package' | 'assets-based' | 'unknown';
    iconFiles: GitHubFile[];
  };
  svgCount: number;
}

const RepositoryAnalysis: React.FC<RepositoryAnalysisProps> = ({
  analysis,
  svgCount,
}) => {
  const getFormatInfo = () => {
    switch (analysis.suggestedFormat) {
      case 'svg':
        return {
          title: 'Standard SVG Repository',
          description: 'This repository contains direct SVG files ready for processing.',
          icon: <FileImage size={20} />,
          status: 'success' as const,
          recommendation: 'You can process these SVG files directly using the standard workflow.'
        };
      case 'fluent-package':
        return {
          title: 'FluentUI Package Structure',
          description: 'This appears to be a FluentUI icon package with metadata and build files.',
          icon: <Package size={20} />,
          status: 'warning' as const,
          recommendation: 'SVG files may be in packages/svg-icons or generated from source files.'
        };
      case 'assets-based':
        return {
          title: 'Assets-Based Repository',
          description: 'Icons are organized in assets folders, possibly in multiple formats.',
          icon: <FolderOpen size={20} />,
          status: 'info' as const,
          recommendation: 'Look for SVG files in the assets directory or subfolders.'
        };
      default:
        return {
          title: 'Unknown Icon Format',
          description: 'Unable to determine the icon structure of this repository.',
          icon: <AlertTriangle size={20} />,
          status: 'error' as const,
          recommendation: 'This repository may not contain processable icon files.'
        };
    }
  };

  const formatInfo = getFormatInfo();

  return (
    <motion.div
      className="repository-analysis"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="analysis-header">
        <div className="format-info">
          <div className={`format-icon ${formatInfo.status}`}>
            {formatInfo.icon}
          </div>
          <div className="format-text">
            <h4>{formatInfo.title}</h4>
            <p>{formatInfo.description}</p>
          </div>
        </div>
        
        <div className="svg-count">
          <span className="count-number">{svgCount}</span>
          <span className="count-label">SVG files found</span>
        </div>
      </div>

      <div className="analysis-details">
        <div className="detection-grid">
          <div className={`detection-item ${analysis.hasDirectSvgs ? 'detected' : 'not-detected'}`}>
            <FileImage size={16} />
            <span>Direct SVG Files</span>
            {analysis.hasDirectSvgs ? <CheckCircle2 size={14} /> : null}
          </div>
          
          <div className={`detection-item ${analysis.hasPackageJsons ? 'detected' : 'not-detected'}`}>
            <Package size={16} />
            <span>Package Structure</span>
            {analysis.hasPackageJsons ? <CheckCircle2 size={14} /> : null}
          </div>
          
          <div className={`detection-item ${analysis.hasAssetsFolders ? 'detected' : 'not-detected'}`}>
            <FolderOpen size={16} />
            <span>Assets Folders</span>
            {analysis.hasAssetsFolders ? <CheckCircle2 size={14} /> : null}
          </div>
          
          <div className={`detection-item ${analysis.hasIconManifests ? 'detected' : 'not-detected'}`}>
            <FileText size={16} />
            <span>Metadata Files</span>
            {analysis.hasIconManifests ? <CheckCircle2 size={14} /> : null}
          </div>
        </div>
        
        <div className="recommendation">
          <Info size={16} />
          <span>{formatInfo.recommendation}</span>
        </div>
      </div>

      {analysis.iconFiles.length > svgCount && (
        <div className="additional-files">
          <p>
            Found {analysis.iconFiles.length - svgCount} additional icon-related files 
            (JSON, XML, etc.) that may contain icon data.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RepositoryAnalysis;