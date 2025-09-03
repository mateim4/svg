import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Github,
  FolderOpen,
  Palette,
  Download,
  AlertCircle,
  Info
} from 'lucide-react';
import './WorkflowWizard.css';

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isComplete: boolean;
  isActive: boolean;
  canProceed: boolean;
}

interface WorkflowWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
  isLoading?: boolean;
  error?: string;
}

const WorkflowWizard: React.FC<WorkflowWizardProps> = ({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onFinish,
  isLoading = false,
  error
}) => {
  const [showStepDetails, setShowStepDetails] = useState(false);

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed steps or the current step
    if (stepIndex <= currentStep || steps[stepIndex].isComplete) {
      onStepChange(stepIndex);
    }
  };

  return (
    <div className="workflow-wizard">
      {/* Progress Header */}
      <div className="wizard-header">
        <div className="progress-bar">
          <div className="progress-track">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="steps-navigation">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`step-indicator ${
                index === currentStep ? 'active' : ''
              } ${step.isComplete ? 'completed' : ''} ${
                index < currentStep ? 'clickable' : ''
              }`}
              onClick={() => handleStepClick(index)}
              whileHover={index <= currentStep ? { scale: 1.05 } : {}}
              whileTap={index <= currentStep ? { scale: 0.95 } : {}}
            >
              <div className="step-circle">
                {step.isComplete ? (
                  <Check size={16} />
                ) : (
                  <span className="step-number">{index + 1}</span>
                )}
              </div>
              
              <div className="step-info">
                <div className="step-title">{step.title}</div>
                <div className="step-description">{step.description}</div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="step-connector" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Help Toggle */}
        <button
          className="help-toggle"
          onClick={() => setShowStepDetails(!showStepDetails)}
          title="Show step details"
        >
          <Info size={20} />
        </button>
      </div>

      {/* Step Details Panel (Collapsible) */}
      <AnimatePresence>
        {showStepDetails && (
          <motion.div
            className="step-details-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="step-details-content">
              <div className="current-step-info">
                <div className="step-icon">
                  {currentStepData.icon}
                </div>
                <div>
                  <h3>{currentStepData.title}</h3>
                  <p>{currentStepData.description}</p>
                </div>
              </div>
              
              <div className="step-tips">
                <h4>💡 Tips for this step:</h4>
                <ul>
                  {currentStep === 0 && (
                    <>
                      <li>Enter a complete GitHub repository URL (e.g., https://github.com/microsoft/fluentui-system-icons)</li>
                      <li>Make sure the repository is public or you have access to it</li>
                      <li>The tool will automatically analyze the repository structure</li>
                    </>
                  )}
                  {currentStep === 1 && (
                    <>
                      <li>Use the file tree to browse and select the icons you want to process</li>
                      <li>Click "Select All" to choose all SVG files at once</li>
                      <li>Preview individual icons by clicking on them</li>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <li>Experiment with different style presets to see what works best</li>
                      <li>Adjust colors and gradients to match your brand</li>
                      <li>Use the import palette feature for consistent color schemes</li>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <li>Batch processing will apply your settings to all selected files</li>
                      <li>Large icon sets may take a few minutes to process</li>
                      <li>You can download individual files or the complete ZIP archive</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          className="wizard-error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="wizard-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="step-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {currentStepData.component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="wizard-footer">
        <div className="step-counter">
          Step {currentStep + 1} of {steps.length}
        </div>

        <div className="navigation-buttons">
          <motion.button
            className="nav-button secondary"
            onClick={onPrevious}
            disabled={isFirstStep || isLoading}
            whileHover={!isFirstStep ? { scale: 1.02 } : {}}
            whileTap={!isFirstStep ? { scale: 0.98 } : {}}
          >
            <ChevronLeft size={20} />
            Previous
          </motion.button>

          {isLastStep ? (
            <motion.button
              className="nav-button primary finish-button"
              onClick={onFinish}
              disabled={!currentStepData.canProceed || isLoading}
              whileHover={currentStepData.canProceed ? { scale: 1.02 } : {}}
              whileTap={currentStepData.canProceed ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="loading-spinner" />
              ) : (
                <>
                  <Download size={20} />
                  Finish & Download
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              className="nav-button primary"
              onClick={onNext}
              disabled={!currentStepData.canProceed || isLoading}
              whileHover={currentStepData.canProceed ? { scale: 1.02 } : {}}
              whileTap={currentStepData.canProceed ? { scale: 0.98 } : {}}
            >
              Next
              <ChevronRight size={20} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowWizard;