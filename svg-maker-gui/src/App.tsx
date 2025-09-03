import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Github, FolderOpen, Palette, Download } from 'lucide-react';

// Components
import DashboardOverview from './components/DashboardOverview';
import NavigationHeader from './components/NavigationHeader';
import WorkflowWizard, { WizardStep } from './components/WorkflowWizard';
import PreviewComparison from './components/PreviewComparison';
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
import iconRepositoryService, { RepositorySource } from './services/iconRepositoryService';
import './styles/design-system.css';

// Services and Types
import githubService, { RepoInfo, FolderTree, GitHubFile, SVGFile } from './services/githubService';
import { fluentUIService, FluentUIIcon as FluentUIServiceIcon } from './services/fluentUIService';
import { IconConfig } from './types/IconConfig';

import './App.css';

type AppMode = 'local' | 'github' | 'dashboard';

interface FluentUIIcon {
  name: string;
  svgFiles: File[];
  metadata?: any;
  sizes: number[];
  variants: string[];
}

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('dashboard');
  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [showWizard, setShowWizard] = useState(false);
  
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

  // Local files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [localProcessedIcons, setLocalProcessedIcons] = useState<string[]>([]);
  const [fluentUIIcons, setFluentUIIcons] = useState<FluentUIIcon[]>([]);

  // GitHub integration
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const [repoError, setRepoError] = useState('');
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

  // Mock processing function for GitHub files
  const processGitHubFiles = useCallback(async (
    filesToProcess: SVGFile[], 
    iconConfig: IconConfig
  ): Promise<ProcessedFile[]> => {
    const processed: ProcessedFile[] = [];
    
    for (const file of filesToProcess) {
      const startTime = Date.now();
      
      let processedSvg: string;
      
      if (iconConfig.style === 'fluentui') {
        // Use FluentUI-specific processing
        try {
          processedSvg = fluentUIService.convertToThemedSvg(file.content, iconConfig.style, {
            width: iconConfig.width,
            height: iconConfig.height,
            cornerRadius: iconConfig.cornerRadius,
            padding: iconConfig.padding,
            iconColor: iconConfig.iconColor,
            gradient: iconConfig.gradient
          });
        } catch (error) {
          console.warn('FluentUI processing failed, using fallback:', error);
          processedSvg = file.content; // Fallback to original
        }
      } else {
        // Standard processing for other styles
        processedSvg = `<svg width="${iconConfig.width}" height="${iconConfig.height}" viewBox="0 0 ${iconConfig.width} ${iconConfig.height}" xmlns="http://www.w3.org/2000/svg">
  <defs></defs>
  <rect width="${iconConfig.width}" height="${iconConfig.height}" rx="${iconConfig.cornerRadius}" fill="#e0e0e0"/>
  <g transform="translate(${iconConfig.padding}, ${iconConfig.padding})">
    ${file.content.match(/<path[^>]*d="[^"]*"/)?.[0] || '<circle cx="32" cy="32" r="16" fill="' + iconConfig.iconColor + '"/>'}
  </g>
</svg>`;
      }

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
    
    try {
      // Download selected files if not already downloaded
      const selectedSvgFiles = svgFiles.filter(f => selectedFiles.has(f.path));
      
      if (downloadedFiles.length === 0) {
        const downloaded = await githubService.downloadSvgFiles(
          selectedSvgFiles,
          (completed, total, currentFile) => {
            // Progress callback could be used here
            console.log(`Downloading: ${completed}/${total} - ${currentFile}`);
          }
        );
        setDownloadedFiles(downloaded);
      }
      
      const result = await processGitHubFiles(downloadedFiles, iconConfig);
      setProcessedFiles(result);
      return result;
      
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
      canProceed: selectedFiles.size > 0
    },
    {
      id: 'style-configuration',
      title: 'Style Configuration',
      description: 'Choose style preset and customize appearance',
      icon: <Palette size={20} />,
      component: (
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '2rem' }}>
          <StyleControls
            config={config}
            onConfigChange={setConfig}
          />
          <div>
            <h3>Preview</h3>
            {downloadedFiles.length > 0 && (
              <PreviewComparison
                items={downloadedFiles.slice(0, 3).map(file => ({
                  id: file.relativePath,
                  name: file.name,
                  originalSvg: file.content,
                  processedSvg: undefined // Will be generated in real-time
                }))}
                config={config}
                onConfigChange={setConfig}
              />
            )}
          </div>
        </div>
      ),
      isComplete: true, // Style can always be configured
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
          files={downloadedFiles}
          config={config}
          onProcess={handleBatchProcess}
          onDownloadAll={handleDownloadAll}
        />
      ),
      isComplete: processedFiles.length > 0,
      isActive: currentWizardStep === 3,
      canProceed: processedFiles.length > 0
    }
  ];

  // Mode Change Handlers
  const handleModeSelect = (newMode: AppMode) => {
    setMode(newMode);
    if (newMode === 'github') {
      setShowWizard(true);
      setCurrentWizardStep(0);
    } else {
      setShowWizard(false);
    }
  };

  const handleGetStarted = () => {
    // Show both modes for user to choose
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

  // Auto-load FluentUI icons when FluentUI preset is selected
  React.useEffect(() => {
    if (config.style === 'fluentui') {
      // Auto-populate with popular FluentUI icons
      fluentUIService.getAvailableIcons()
        .then(icons => {
          if (icons.length > 0) {
            setFluentUIIcons(icons);
          }
        })
        .catch(error => {
          console.warn('Could not load FluentUI icons:', error);
          // Fallback to mock icons
          setFluentUIIcons([]);
        });
    }
  }, [config.style]);

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <NavigationHeader
        mode={mode}
        title={mode === 'local' ? 'Local File Processing' : 'GitHub Repository Processing'}
        onBackToDashboard={() => setMode('dashboard')}
      />

      {/* Main Content */}
      <div className="app-content">
        {/* Dashboard Overview - Landing Page */}
        {mode === 'dashboard' && (
          <DashboardOverview
            onModeSelect={handleModeSelect}
            onGetStarted={handleGetStarted}
          />
        )}

        {/* GitHub Workflow with Wizard */}
        {mode === 'github' && showWizard && (
          <WorkflowWizard
            steps={githubWizardSteps}
            currentStep={currentWizardStep}
            onStepChange={handleWizardStepChange}
            onNext={handleWizardNext}
            onPrevious={handleWizardPrevious}
            onFinish={handleWizardFinish}
            isLoading={isLoadingRepo}
            error={repoError}
          />
        )}

        {/* Local Mode - Clean Layout */}
        {mode === 'local' && (
          <div className="local-mode">
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

            <div className="content-wrapper">
              <div className="workspace-grid">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                >
                  <FileUploadNew
                    onFilesUploaded={setUploadedFiles}
                    uploadedFiles={uploadedFiles}
                    onFluentUIIcons={handleFluentUIIcons}
                  />
                </motion.div>

                {/* FluentUI Icon Browser */}
                {fluentUIIcons.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6 }}
                  >
                    <FluentUIIconBrowser
                      icons={fluentUIIcons}
                      onIconSelect={handleFluentUIIconSelect}
                      onBulkSelect={handleFluentUIBulkSelect}
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <StyleControls
                    config={config}
                    onConfigChange={setConfig}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <PreviewPanel
                    config={config}
                    uploadedFiles={uploadedFiles}
                    processedIcons={localProcessedIcons}
                    onProcessedIcons={setLocalProcessedIcons}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;