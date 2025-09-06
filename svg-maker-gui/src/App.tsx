import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Github, FolderOpen, Palette, Download, AlertCircle, Check, ChevronLeft, ChevronRight } from 'lucide-react';

// Components
import LandingPage from './components/LandingPage';
import DashboardOverview from './components/DashboardOverview';
import WorkflowWizard, { WizardStep } from './components/WorkflowWizard';
import IconPackBrowser from './components/IconPackBrowser';
import PreviewComparison from './components/PreviewComparison';
import { scaleOriginalSvg } from './utils/scaleOriginalSvg';
import FileUpload from './components/FileUpload';
import FileUploadNew from './components/FileUploadNew';
import IconRepositoryBrowser from './components/IconRepositoryBrowser';
import GitHubRepoInput from './components/GitHubRepoInput';
import FolderUpload from './components/FolderUpload';
import FolderTreeBrowser from './components/FolderTreeBrowser';
import FluentUIIconBrowser from './components/FluentUIIconBrowser';
import StyleControls from './components/StyleControls';
import BatchProcessor, { ProcessedFile } from './components/BatchProcessor';
import PreviewPanel from './components/PreviewPanel';
import RepositoryAnalysis from './components/RepositoryAnalysis';
import IconCacheLoader, { IconCacheStatus } from './components/IconCacheLoader';
import iconRepositoryService, { RepositorySource } from './services/iconRepositoryService';
import './styles/design-system.css';

// Services and Types
import githubService, { RepoInfo, FolderTree, GitHubFile, SVGFile } from './services/githubService';
import { fluentUIService, FluentUIIcon as FluentUIServiceIcon } from './services/fluentUIService';
import { IconConfig } from './types/IconConfig';
import { processSvgWithStyle } from './utils/processSvgStyle';

import './App.css';

type AppMode = 'local' | 'github' | 'dashboard' | 'iconpacks';
type IconPack = 'lucide' | 'heroicons' | 'feather' | 'phosphor' | 'tabler' | 'fluent';

interface FluentUIIcon {
  name: string;
  svgFiles: File[];
  metadata?: any;
  sizes: number[];
  variants: string[];
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('dashboard');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedIconPack, setSelectedIconPack] = useState<IconPack | null>(null);
  
  // Configuration
  const [config, setConfig] = useState<IconConfig>({
    style: 'neumorphism',
    width: 128,
    height: 128,
    cornerRadius: 25,
    padding: 16,
    iconColor: '#333333',
    gradient: null,
  });
  const [isStyleConfigured, setIsStyleConfigured] = useState<boolean>(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number>(0);

  // Handle config changes and mark styling as configured
  const handleConfigChange = (newConfig: IconConfig) => {
    setConfig(newConfig);
    if (!isStyleConfigured) {
      setIsStyleConfigured(true);
    }
  };

  // Reset all state when switching modes
  const resetApplicationState = () => {
    // GitHub workflow state
    setSvgFiles([]);
    setSelectedFiles(new Set());
    setDownloadedFiles([]);
    setPreviewFile(null);
    setRepoAnalysis({ hasDirectSvgs: false, hasPackageJsons: false, hasAssetsFolders: false, hasIconManifests: false, suggestedFormat: 'unknown', iconFiles: [] });
    setRepoTree([]);
    setIsLoadingRepo(false);
    
    // Local workflow state
    setUploadedFiles([]);
    setLocalProcessedIcons([]);
    setConvertedLocalFiles([]);
    
    // FluentUI state
    setFluentUIIcons([]);
    
    // Common state
    setProcessedFiles([]);
    setIsStyleConfigured(false);
    
    // Wizard state
    setCurrentWizardStep(0);
  };

  // Convert File objects to SVGFile objects by reading their content
  const convertFilesToSVGFiles = async (files: File[]): Promise<SVGFile[]> => {
    const svgFiles: SVGFile[] = [];
    
    for (const file of files) {
      try {
        const content = await file.text();
        svgFiles.push({
          name: file.name,
          path: file.name,
          content: content,
          download_url: '', // Not needed for local files
          relativePath: file.name,
          size: file.size
        });
      } catch (error) {
        console.error(`Failed to read file ${file.name}:`, error);
      }
    }
    
    return svgFiles;
  };

  // Local files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [localProcessedIcons, setLocalProcessedIcons] = useState<string[]>([]);
  const [convertedLocalFiles, setConvertedLocalFiles] = useState<SVGFile[]>([]);
  const [fluentUIIcons, setFluentUIIcons] = useState<FluentUIIcon[]>([]);

  // Convert uploaded files to SVGFiles when they change
  React.useEffect(() => {
    if (uploadedFiles.length > 0) {
      setFileConversionError(null);
      convertFilesToSVGFiles(uploadedFiles)
        .then(converted => {
          setConvertedLocalFiles(converted);
          if (converted.length === 0 && uploadedFiles.length > 0) {
            setFileConversionError('No valid SVG files could be processed');
          }
        })
        .catch(error => {
          console.error('File conversion error:', error);
          setFileConversionError(`Failed to process files: ${error.message}`);
          setConvertedLocalFiles([]);
        });
    } else {
      setConvertedLocalFiles([]);
      setFileConversionError(null);
    }
  }, [uploadedFiles]);

  // GitHub integration
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const [repoError, setRepoError] = useState('');
  
  // Error handling
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fileConversionError, setFileConversionError] = useState<string | null>(null);
  const [repoTree, setRepoTree] = useState<FolderTree[]>([]);
  const [svgFiles, setSvgFiles] = useState<GitHubFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [downloadedFiles, setDownloadedFiles] = useState<SVGFile[]>([]);
  const [previewFile, setPreviewFile] = useState<GitHubFile | null>(null);
  const [repoAnalysis, setRepoAnalysis] = useState<{
    hasDirectSvgs: boolean;
    hasPackageJsons: boolean;
    hasAssetsFolders: boolean;
    hasIconManifests: boolean;
    suggestedFormat: 'svg' | 'fluent-package' | 'assets-based' | 'unknown';
    iconFiles: GitHubFile[];
  } | null>(null);

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  // Icon Cache
  const [showCacheLoader, setShowCacheLoader] = useState(false);
  const [isCacheComplete, setIsCacheComplete] = useState(false);

  // Handle GitHub repository loading
  const handleRepoLoad = async (repoInfo: RepoInfo) => {
    setIsLoadingRepo(true);
    setRepoError('');
    
    try {
      // Load repository tree
      const tree = await githubService.getRepoTree(repoInfo);
      setRepoTree(tree);
      
      // Analyze repository structure
      const analysis = githubService.analyzeIconStructure(tree);
      setRepoAnalysis(analysis);
      
      // Find all SVG files (or attempt extraction from other formats)
      let svgFileList: GitHubFile[];
      
      if (analysis.hasDirectSvgs) {
        svgFileList = githubService.findSvgFiles(tree);
      } else if (analysis.suggestedFormat === 'fluent-package' || analysis.suggestedFormat === 'assets-based') {
        // Try to get enhanced icon files for special repositories
        console.log('Attempting to extract icons from non-SVG formats...');
        try {
          svgFileList = await githubService.getEnhancedIconFiles(tree, analysis);
        } catch (error) {
          console.warn('Failed to extract enhanced icon files:', error);
          svgFileList = analysis.iconFiles.filter(f => f.name.toLowerCase().endsWith('.svg'));
        }
      } else {
        svgFileList = analysis.iconFiles.filter(f => f.name.toLowerCase().endsWith('.svg'));
      }
      
      setSvgFiles(svgFileList);
      
      // Clear previous selections
      setSelectedFiles(new Set());
      setDownloadedFiles([]);
      setProcessedFiles([]);
      
    } catch (error) {
      setRepoError(error instanceof Error ? error.message : 'Failed to load repository');
    } finally {
      setIsLoadingRepo(false);
    }
  };

  // Handle file selection in GitHub mode
  const handleFileSelect = (path: string, selected: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (selected) {
      newSelected.add(path);
    } else {
      newSelected.delete(path);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedFiles(new Set(svgFiles.map(f => f.path)));
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
  };

  const handlePreviewFile = (file: GitHubFile) => {
    setPreviewFile(file);
  };

  // Handle folder upload
  const handleFolderUpload = async (files: File[], folderName: string) => {
    setIsLoadingRepo(true);
    setRepoError('');
    
    try {
      // Process the uploaded files similar to GitHub repo processing
      const svgFileList: GitHubFile[] = [];
      
      for (const file of files) {
        const fileName = file.name;
        const path = file.webkitRelativePath || fileName;
        
        // Create a URL for the file content
        const url = URL.createObjectURL(file);
        
        svgFileList.push({
          name: fileName,
          path: path,
          type: 'file',
          download_url: url,
          size: file.size,
          sha: Math.random().toString(36).substr(2, 9) // Generate a dummy SHA
        });
      }
      
      setSvgFiles(svgFileList);
      
      // Create a simple tree structure for the folder
      const tree: FolderTree[] = [{
        name: folderName,
        path: folderName,
        type: 'dir',
        children: svgFileList.map(f => ({
          name: f.name,
          path: f.path,
          type: 'file' as const,
          download_url: f.download_url,
          size: f.size,
          sha: f.sha
        })),
        sha: Math.random().toString(36).substr(2, 9)
      }];
      
      setRepoTree(tree);
      
      // Create a basic analysis
      const analysis = {
        hasDirectSvgs: svgFileList.some(f => f.name.toLowerCase().endsWith('.svg')),
        hasPackageJsons: files.some(f => f.name === 'package.json'),
        hasAssetsFolders: files.some(f => f.webkitRelativePath?.toLowerCase().includes('asset')),
        hasIconManifests: files.some(f => f.name.includes('manifest') || f.name.includes('metadata')),
        suggestedFormat: 'svg' as const,
        iconFiles: svgFileList
      };
      
      setRepoAnalysis(analysis);
      setSelectedFiles(new Set());
      setDownloadedFiles([]);
      setProcessedFiles([]);
      
    } catch (error) {
      setRepoError(error instanceof Error ? error.message : 'Failed to process folder');
    } finally {
      setIsLoadingRepo(false);
    }
  };

  // Handle direct export of selected files (raw SVGs without processing)
  const handleExportSelected = async () => {
    if (selectedFiles.size === 0) return;

    const selectedSvgFiles = svgFiles.filter(f => selectedFiles.has(f.path));
    
    try {
      // Download the selected SVG files
      const downloadedSvgs = await githubService.downloadSvgFiles(
        selectedSvgFiles,
        (completed, total, currentFile) => {
          console.log(`Downloading: ${completed}/${total} - ${currentFile}`);
        }
      );

      // Create ZIP with original SVG files
      const zip = new JSZip();
      
      for (const svgFile of downloadedSvgs) {
        const pathParts = svgFile.relativePath.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const folderPath = pathParts.slice(0, -1).join('/');
        const fullPath = folderPath ? `${folderPath}/${fileName}` : fileName;
        
        zip.file(fullPath, svgFile.content);
      }
      
      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(content, `svg-files-export-${timestamp}.zip`);
      
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Download selected files for processing (not exporting)
  const handleDownloadForProcessing = async () => {
    if (selectedFiles.size === 0) return;

    const selectedSvgFiles = svgFiles.filter(f => selectedFiles.has(f.path));
    
    try {
      console.log(`Downloading ${selectedSvgFiles.length} files for processing...`);
      // Download the selected SVG files
      const downloadedSvgs = await githubService.downloadSvgFiles(
        selectedSvgFiles,
        (completed, total, currentFile) => {
          console.log(`Downloading: ${completed}/${total} - ${currentFile}`);
        }
      );
      
      // Store downloaded files for processing
      setDownloadedFiles(downloadedSvgs);
      console.log(`Successfully downloaded ${downloadedSvgs.length} files for processing`);
      
    } catch (error) {
      console.error('Download for processing failed:', error);
      setGlobalError('Failed to download selected files for processing');
    }
  };

  // Mock processing function for GitHub files
  const processGitHubFiles = useCallback(async (
    filesToProcess: SVGFile[], 
    iconConfig: IconConfig
  ): Promise<ProcessedFile[]> => {
    const processed: ProcessedFile[] = [];
    
    for (const file of filesToProcess) {
      const startTime = Date.now();
      
      let processedSvg: string;
      
      // Standard processing for all styles
      processedSvg = `<svg width="${iconConfig.width}" height="${iconConfig.height}" viewBox="0 0 ${iconConfig.width} ${iconConfig.height}" xmlns="http://www.w3.org/2000/svg">
  <defs></defs>
  <rect width="${iconConfig.width}" height="${iconConfig.height}" rx="${iconConfig.cornerRadius}" fill="#e0e0e0"/>
  <g transform="translate(${iconConfig.padding}, ${iconConfig.padding})">
    ${file.content.match(/<path[^>]*d="[^"]*"/)?.[0] || '<circle cx="32" cy="32" r="16" fill="' + iconConfig.iconColor + '"/>'}
  </g>
</svg>`;

      const processingTime = Date.now() - startTime;
      
      processed.push({
        originalFile: file,
        processedSvg,
        status: 'completed',
        processingTime,
      });
      
      // Small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return processed;
  }, []);

  // Handle batch processing
  const handleBatchProcess = async (files: SVGFile[], iconConfig: IconConfig): Promise<ProcessedFile[]> => {
    setIsProcessing(true);
    setGlobalError(null);
    
    try {
      // Validate input files
      if (!files || files.length === 0) {
        throw new Error('No files selected for processing');
      }

      // For GitHub workflow: Download selected files if not already downloaded
      let filesToProcess = files;
      if (downloadedFiles.length === 0 && svgFiles.length > 0) {
        const selectedSvgFiles = svgFiles.filter(f => selectedFiles.has(f.path));
        
        if (selectedSvgFiles.length === 0) {
          throw new Error('No files selected from repository');
        }

        const downloaded = await githubService.downloadSvgFiles(
          selectedSvgFiles,
          (completed, total, currentFile) => {
            console.log(`Downloading: ${completed}/${total} - ${currentFile}`);
          }
        );
        setDownloadedFiles(downloaded);
        filesToProcess = downloaded;
      }

      // Validate files have content
      const filesWithoutContent = filesToProcess.filter(f => !f.content || f.content.trim() === '');
      if (filesWithoutContent.length > 0) {
        console.warn(`${filesWithoutContent.length} files have no content and will be skipped`);
      }

      const validFiles = filesToProcess.filter(f => f.content && f.content.trim() !== '');
      if (validFiles.length === 0) {
        throw new Error('No valid files with content to process');
      }
      
      const result = await processGitHubFiles(validFiles, iconConfig);
      setProcessedFiles(result);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during processing';
      setGlobalError(errorMessage);
      console.error('Batch processing failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle ZIP download
  const handleDownloadAll = async (processedFileList: ProcessedFile[]) => {
    const zip = new JSZip();
    
    // Create folder structure
    for (const processedFile of processedFileList) {
      const originalPath = processedFile.originalFile.relativePath;
      const pathParts = originalPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folderPath = pathParts.slice(0, -1).join('/');
      
      // Create the processed filename
      const processedFileName = fileName.replace('.svg', `-${config.style}.svg`);
      const fullPath = folderPath ? `${folderPath}/${processedFileName}` : processedFileName;
      
      zip.file(fullPath, processedFile.processedSvg);
    }
    
    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `svg-icons-${config.style}-processed.zip`);
  };

  // Handle FluentUI icons
  const handleFluentUIIcons = (icons: FluentUIIcon[]) => {
    setFluentUIIcons(icons);
  };

  const handleFluentUIIconSelect = (icon: FluentUIIcon, selectedFiles: File[]) => {
    // Add selected FluentUI icon files to uploaded files
    const currentFiles = [...uploadedFiles];
    selectedFiles.forEach(file => {
      if (!currentFiles.some(existing => existing.name === file.name && existing.size === file.size)) {
        currentFiles.push(file);
      }
    });
    setUploadedFiles(currentFiles);
  };

  const handleFluentUIBulkSelect = (selectedFiles: File[]) => {
    // Add all selected FluentUI files to uploaded files
    const currentFiles = [...uploadedFiles];
    selectedFiles.forEach(file => {
      if (!currentFiles.some(existing => existing.name === file.name && existing.size === file.size)) {
        currentFiles.push(file);
      }
    });
    setUploadedFiles(currentFiles);
  };

  // Handle repository selection from browser
  const handleRepositorySelect = async (repository: RepositorySource) => {
    setIsLoadingRepo(true);
    setRepoError('');
    
    try {
      if (repository.type === 'local') {
        // Load from local repository instantly
        const result = await iconRepositoryService.loadRepositoryIcons(repository.id);
        
        // Convert to existing format for compatibility - create files from real GitHub icons
        const mockFiles: GitHubFile[] = [];
        result.icons.forEach(icon => {
          mockFiles.push({
            name: icon.fileName,
            path: icon.path,
            type: 'file' as const,
            download_url: icon.downloadUrl,
            size: icon.size,
            sha: icon.id
          });
        });
        
        setSvgFiles(mockFiles);
        
        // Create mock tree structure
        const mockTree: FolderTree[] = [{
          name: repository.repository.name,
          path: repository.repository.name,
          type: 'dir',
          children: mockFiles,
          sha: `repo-${repository.id}`
        }];
        
        setRepoTree(mockTree);
        
        // Create mock analysis
        setRepoAnalysis({
          hasDirectSvgs: true,
          hasPackageJsons: false,
          hasAssetsFolders: false,
          hasIconManifests: true,
          suggestedFormat: 'svg',
          iconFiles: mockFiles
        });
        
        // Auto-advance to next step
        setCurrentWizardStep(1);
      } else {
        // Handle external repositories (existing logic)
        // For now, show error since external repos need URL input
        setRepoError('External repositories require manual URL input for now');
      }
    } catch (error) {
      setRepoError(error instanceof Error ? error.message : 'Failed to load repository');
    } finally {
      setIsLoadingRepo(false);
    }
  };

  // GitHub Workflow Wizard Steps
  const githubWizardSteps: WizardStep[] = [
    {
      id: 'repo-browser',
      title: 'Select Repository',
      description: 'Choose from local collections or add external repositories',
      icon: <Github size={20} />,
      component: (
        <div>
          <IconRepositoryBrowser onRepositorySelect={handleRepositorySelect} />
          
          {/* Alternative: Manual Input */}
          <div style={{ margin: '2rem 0', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 1rem', color: '#374151' }}>External Repository</h4>
            <GitHubRepoInput
              onRepoLoad={handleRepoLoad}
              isLoading={isLoadingRepo}
            />
            <div style={{ margin: '1rem 0', textAlign: 'center', color: '#64748b' }}>
              — or —
            </div>
            <FolderUpload
              onFolderProcessed={handleFolderUpload}
              isLoading={isLoadingRepo}
            />
          </div>
          
          {repoError && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef2f2', color: '#dc2626', borderRadius: '8px' }}>
              {repoError}
            </div>
          )}
        </div>
      ),
      isComplete: repoTree.length > 0,
      isActive: currentWizardStep === 0,
      canProceed: repoTree.length > 0 && !isLoadingRepo
    },
    {
      id: 'file-selection',
      title: 'File Selection',
      description: 'Browse and select SVG files to process',
      icon: <FolderOpen size={20} />,
      component: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 420px)', minHeight: '450px', width: '100%', maxWidth: 'none' }}>
          {repoTree.length > 0 && (
            <>
              <div style={{ flex: 1, minHeight: 0 }}>
                <FolderTreeBrowser
                  tree={repoTree}
                  svgFiles={svgFiles}
                  selectedFiles={selectedFiles}
                  onFileSelect={handleFileSelect}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onPreviewFile={handlePreviewFile}
                  onExportSelected={handleExportSelected}
                  isLoading={isLoadingRepo}
                />
              </div>
              {repoAnalysis && (
                <div style={{ flexShrink: 0 }}>
                  <RepositoryAnalysis 
                    analysis={repoAnalysis} 
                    svgCount={svgFiles.length}
                  />
                </div>
              )}
            </>
          )}
        </div>
      ),
      isComplete: selectedFiles.size > 0,
      isActive: currentWizardStep === 1,
      canProceed: selectedFiles.size > 0,
      onProceed: async () => {
        // Download selected files for processing when proceeding to next step
        await handleDownloadForProcessing();
        setCurrentWizardStep(2);
      }
    },
    {
      id: 'style-configuration',
      title: 'Style Configuration',
      description: 'Choose style preset and customize appearance',
      icon: <Palette size={20} />,
      component: (
        <div className="workspace-cards-grid" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>
          {/* Style & Options Card - Full Width */}
          <div className="workspace-card controls-card">
            
            <StyleControls
              config={config}
              onConfigChange={handleConfigChange}
            />
          </div>

          {/* Preview Card - Takes more space */}
          <div className="workspace-card preview-card">
            {(downloadedFiles.length > 0 || convertedLocalFiles.length > 0) && (() => {
              const files = downloadedFiles.length > 0 ? downloadedFiles : convertedLocalFiles;
              const previewItems = files.map(file => ({
                id: file.relativePath,
                name: file.name,
                originalSvg: scaleOriginalSvg(file.content, config.width, config.height, config.padding), // Scale to match processed size
                processedSvg: processSvgWithStyle(file.content, config) // Generate processed SVG
              }));
              const selectedItem = previewItems[selectedPreviewIndex] || previewItems[0];
              
              return (
                <PreviewComparison
                  items={previewItems}
                  config={config}
                  onConfigChange={handleConfigChange}
                  selectedItem={selectedItem}
                  onItemSelect={(item) => {
                    const index = previewItems.findIndex(i => i.id === item.id);
                    if (index !== -1) {
                      setSelectedPreviewIndex(index);
                    }
                  }}
                />
              );
            })()}
          </div>
        </div>
      ),
      isComplete: isStyleConfigured, // Complete after user configures styling
      isActive: currentWizardStep === 2,
      canProceed: true
    },
    {
      id: 'batch-processing',
      title: 'Process & Export',
      description: 'Generate styled icons and download results',
      icon: <Download size={20} />,
      component: (
        <BatchProcessor
          files={downloadedFiles.length > 0 ? downloadedFiles : convertedLocalFiles}
          config={config}
          onProcess={handleBatchProcess}
          onDownloadAll={handleDownloadAll}
        />
      ),
      isComplete: processedFiles.length > 0,
      isActive: currentWizardStep === 3,
      canProceed: downloadedFiles.length > 0 || convertedLocalFiles.length > 0
    }
  ];

  // Handle icon pack selection
  const handleIconPackSelect = (iconPack: IconPack) => {
    setSelectedIconPack(iconPack);
    setMode('iconpacks');
  };

  // Handle icon selection from pack browser
  const handleIconSelectFromPack = (iconName: string, svgContent: string) => {
    // Convert the selected icon to a File object and add to uploaded files
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], `${iconName}.svg`, { type: 'image/svg+xml' });
    
    const currentFiles = [...uploadedFiles];
    if (!currentFiles.some(existing => existing.name === file.name)) {
      currentFiles.push(file);
      setUploadedFiles(currentFiles);
    }
    
    // Switch to local mode for processing
    setMode('local');
  };

  // Mode Change Handlers
  const handleModeSelect = (newMode: AppMode) => {
    // Reset all state when switching modes to prevent data leakage
    resetApplicationState();
    
    setMode(newMode);
    if (newMode === 'github') {
      setShowWizard(true);
      setCurrentWizardStep(0);
    } else if (newMode === 'iconpacks') {
      setShowWizard(false);
      // Don't reset icon pack selection when going to iconpacks mode
    } else {
      setShowWizard(false);
    }
  };

  const handleGetStarted = () => {
    // Hide landing page and show dashboard with mode selection
    setShowLandingPage(false);
    setMode('dashboard');
  };

  const handleWizardStepChange = (stepIndex: number) => {
    setCurrentWizardStep(stepIndex);
  };

  const handleWizardNext = () => {
    if (currentWizardStep < githubWizardSteps.length - 1) {
      setCurrentWizardStep(currentWizardStep + 1);
    }
  };

  const handleWizardPrevious = () => {
    if (currentWizardStep > 0) {
      setCurrentWizardStep(currentWizardStep - 1);
    }
  };

  const handleWizardFinish = () => {
    // Download all processed files and optionally return to dashboard
    if (processedFiles.length > 0) {
      handleDownloadAll(processedFiles);
    }
    setMode('dashboard');
    setShowWizard(false);
    setCurrentWizardStep(0);
  };


  return (
    <div className="app-container">

      {/* Error Notifications */}
      {globalError && (
        <motion.div
          className="error-notification global-error"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="error-content">
            <AlertCircle size={20} />
            <span>{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="error-dismiss">×</button>
          </div>
        </motion.div>
      )}
      
      {fileConversionError && (
        <motion.div
          className="error-notification file-error"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="error-content">
            <AlertCircle size={20} />
            <span>{fileConversionError}</span>
            <button onClick={() => setFileConversionError(null)} className="error-dismiss">×</button>
          </div>
        </motion.div>
      )}

      {/* Icon Cache Loader */}
      <IconCacheLoader
        autoStart={false} // Disable auto-start to prevent overwhelming GitHub API
        showProgress={showCacheLoader}
        onComplete={() => {
          setIsCacheComplete(true);
          setShowCacheLoader(false);
        }}
      />

      {/* Main Content */}
      <div className="app-content">
        {/* Landing Page */}
        {showLandingPage && (
          <LandingPage
            onGetStarted={handleGetStarted}
          />
        )}

        {/* Dashboard Overview - Mode Selection */}
        {!showLandingPage && mode === 'dashboard' && (
          <DashboardOverview
            onModeSelect={handleModeSelect}
            onIconPackSelect={handleIconPackSelect}
            onGetStarted={handleGetStarted}
          />
        )}

        {/* GitHub Workflow with Sidebar */}
        {!showLandingPage && mode === 'github' && showWizard && (
          <div className="github-workflow-container">
            {/* Sidebar Navigation */}
            <div className="workflow-sidebar">
              <div className="sidebar-header">
                <h2>GitHub Workflow</h2>
                <div className="overall-progress">
                  <div className="progress-track">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(currentWizardStep / (githubWizardSteps.length - 1)) * 100}%` }}
                    />
                  </div>
                  <span className="progress-text">Step {currentWizardStep + 1} of {githubWizardSteps.length}</span>
                </div>
              </div>

              <nav className="sidebar-steps">
                {githubWizardSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`sidebar-step ${
                      index === currentWizardStep ? 'active' : ''
                    } ${step.isComplete ? 'completed' : ''} ${
                      index < currentWizardStep || step.isComplete ? 'clickable' : 'disabled'
                    }`}
                    onClick={() => (index <= currentWizardStep || step.isComplete) ? handleWizardStepChange(index) : undefined}
                  >
                    <div className="step-indicator">
                      <div className="step-number">
                        {step.isComplete ? <Check size={16} /> : index + 1}
                      </div>
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.title}</div>
                      <div className="step-description">{step.description}</div>
                      {index === currentWizardStep && (
                        <div className="step-status">Current</div>
                      )}
                      {step.isComplete && index !== currentWizardStep && (
                        <div className="step-status completed">Completed</div>
                      )}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Navigation Controls */}
              <div className="sidebar-controls">
                <button
                  className="nav-btn secondary"
                  onClick={handleWizardPrevious}
                  disabled={currentWizardStep === 0}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                
                {currentWizardStep < githubWizardSteps.length - 1 ? (
                  <button
                    className="nav-btn primary"
                    onClick={async () => {
                      const currentStep = githubWizardSteps[currentWizardStep];
                      if (currentStep.onProceed) {
                        await currentStep.onProceed();
                      } else {
                        handleWizardNext();
                      }
                    }}
                    disabled={!githubWizardSteps[currentWizardStep]?.canProceed || isLoadingRepo}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    className="nav-btn primary"
                    onClick={handleWizardFinish}
                    disabled={!githubWizardSteps[currentWizardStep]?.canProceed}
                  >
                    Finish
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="workflow-main-content">
              {/* Error Display */}
              {repoError && (
                <div className="workflow-error">
                  <AlertCircle size={20} />
                  <span>{repoError}</span>
                </div>
              )}

              {/* Current Step Content */}
              <div className="step-content-area">
                {githubWizardSteps[currentWizardStep]?.component}
              </div>
            </div>
          </div>
        )}

        {/* Local Mode - Responsive Card Layout */}
        {!showLandingPage && mode === 'local' && (
          <div className="local-mode-responsive">
            
            {/* Animated background */}
            <div className="bg-animation">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="floating-shape"
                  animate={{
                    y: [-15, 15, -15],
                    x: [-8, 8, -8],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 10 + i * 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${30 + i * 20}%`,
                    top: `${20 + i * 25}%`,
                  }}
                />
              ))}
            </div>

            <div className="responsive-workspace">
              <div className="workspace-cards-grid">
                {/* Style & Options Card - Full Width */}
                <motion.div
                  className="workspace-card controls-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  {/* Complete Progress Tracker Inside Card */}
                  {convertedLocalFiles.length > 0 && processedFiles.length > 0 && (
                    <div className="card-progress-section">
                      <div className="progress-summary">
                        <span className="progress-text">
                          {processedFiles.filter(f => f.status === 'completed').length} of {convertedLocalFiles.length} files processed
                        </span>
                        <span className="progress-percentage">
                          {Math.round((processedFiles.filter(f => f.status === 'completed').length / convertedLocalFiles.length) * 100)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill completed"
                          style={{ 
                            width: `${(processedFiles.filter(f => f.status === 'completed').length / convertedLocalFiles.length) * 100}%` 
                          }}
                        />
                        <div
                          className="progress-fill failed"
                          style={{ 
                            width: `${(processedFiles.filter(f => f.status === 'failed').length / convertedLocalFiles.length) * 100}%`,
                            left: `${(processedFiles.filter(f => f.status === 'completed').length / convertedLocalFiles.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="controls-layout">
                    <div className="upload-section">
                      <FileUploadNew
                        onFilesUploaded={setUploadedFiles}
                        uploadedFiles={uploadedFiles}
                        onFluentUIIcons={handleFluentUIIcons}
                      />
                      {fluentUIIcons.length > 0 && (
                        <FluentUIIconBrowser
                          icons={fluentUIIcons}
                          config={config}
                          onIconSelect={handleFluentUIIconSelect}
                          onBulkSelect={handleFluentUIBulkSelect}
                        />
                      )}
                    </div>
                    <div className="style-section">
                      <StyleControls
                        config={config}
                        onConfigChange={handleConfigChange}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Preview Card - Takes more space */}
                <motion.div
                  className="workspace-card preview-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {(downloadedFiles.length > 0 || convertedLocalFiles.length > 0) ? (() => {
                    const files = downloadedFiles.length > 0 ? downloadedFiles : convertedLocalFiles;
                    const previewItems = files.map(file => ({
                      id: file.relativePath,
                      name: file.name,
                      originalSvg: scaleOriginalSvg(file.content, config.width, config.height, config.padding), // Scale to match processed size
                      processedSvg: processSvgWithStyle(file.content, config)
                    }));
                    const selectedItem = previewItems[selectedPreviewIndex] || previewItems[0];
                    
                    return (
                      <PreviewComparison
                        items={previewItems}
                        config={config}
                        onConfigChange={handleConfigChange}
                        selectedItem={selectedItem}
                        onItemSelect={(item) => {
                          const index = previewItems.findIndex(i => i.id === item.id);
                          if (index !== -1) {
                            setSelectedPreviewIndex(index);
                          }
                        }}
                      />
                    );
                  })() : (
                    <PreviewPanel
                      config={config}
                      uploadedFiles={uploadedFiles}
                      processedIcons={localProcessedIcons}
                      onProcessedIcons={setLocalProcessedIcons}
                    />
                  )}
                </motion.div>

                {/* Batch Processing Card */}
                {convertedLocalFiles.length > 0 && (
                  <motion.div
                    className="workspace-card batch-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <BatchProcessor
                      files={convertedLocalFiles}
                      config={config}
                      onProcess={handleBatchProcess}
                      onDownloadAll={handleDownloadAll}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Icon Pack Browser */}
        {!showLandingPage && mode === 'iconpacks' && selectedIconPack && (
          <IconPackBrowser
            iconPack={selectedIconPack}
            onBack={() => setMode('dashboard')}
            onIconSelect={handleIconSelectFromPack}
          />
        )}
      </div>
    </div>
  );
};

export default App;