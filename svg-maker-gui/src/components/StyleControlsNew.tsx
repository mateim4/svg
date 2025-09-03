import React, { useState } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Dropdown,
  Option,
  Slider,
  Field,
  Label,
  Input,
  Switch,
  Button,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogBody,
  Textarea,
  MessageBar,
  MessageBarBody,
  Text,
  Title3,
} from '@fluentui/react-components';
import {
  ColorRegular,
  SettingsRegular,
  LayerRegular,
  ArrowUploadRegular,
} from '@fluentui/react-icons';
import { IconConfig, StylePreset, Gradient } from '../types/IconConfig';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalL),
  },
  
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  
  fieldRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    ...shorthands.gap(tokens.spacingHorizontalM),
  },
  
  gradientControls: {
    ...shorthands.padding(tokens.spacingVerticalM),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  
  colorPreview: {
    width: '24px',
    height: '24px',
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    ...shorthands.border(tokens.strokeWidthThin, 'solid', tokens.colorNeutralStroke1),
  },
  
  colorInputGroup: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
});

interface StyleControlsProps {
  config: IconConfig;
  onConfigChange: (config: IconConfig) => void;
}

const StyleControls: React.FC<StyleControlsProps> = ({ config, onConfigChange }) => {
  const styles = useStyles();
  
  // State for palette import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importValue, setImportValue] = useState("");
  const [importError, setImportError] = useState("");
  const [showDefaultSavedMessage, setShowDefaultSavedMessage] = useState(false);

  const updateConfig = (updates: Partial<IconConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  // Default gradient management
  const getDefaultGradient = (): Gradient => {
    const saved = localStorage.getItem('svgmaker-default-gradient');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved default gradient:', e);
      }
    }
    return {
      angle: 90,
      startColor: '#ff0000',
      stopColor: '#00ff00',
    };
  };

  const saveAsDefaultGradient = () => {
    if (config.gradient) {
      localStorage.setItem('svgmaker-default-gradient', JSON.stringify(config.gradient));
      setShowDefaultSavedMessage(true);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setShowDefaultSavedMessage(false), 3000);
    }
  };

  const updateGradient = (gradientUpdates: Partial<Gradient>) => {
    if (!config.gradient) {
      const defaultGradient = getDefaultGradient();
      updateConfig({
        gradient: {
          ...defaultGradient,
          ...gradientUpdates,
        },
      });
    } else {
      updateConfig({
        gradient: { ...config.gradient, ...gradientUpdates },
      });
    }
  };

  // Parse coolors.co palette string or URL
  const handleImportPalette = () => {
    let colors: string[] = [];
    try {
      // Accept either a coolors.co URL or a comma/space separated string
      if (importValue.includes("coolors.co")) {
        const match = importValue.match(/coolors\.co\/([a-fA-F0-9-]+)/);
        if (match && match[1]) {
          colors = match[1].split("-").map((c: string) => "#" + c);
        }
      } else {
        colors = importValue.split(/[,\s]+/).map((c: string) => c.startsWith("#") ? c : "#" + c);
      }
      
      if (colors.length >= 2) {
        updateConfig({ iconColor: colors[0] });
        if (colors.length >= 2) {
          updateGradient({ startColor: colors[0], stopColor: colors[1] });
        }
      }
      setShowImportModal(false);
      setImportValue("");
      setImportError("");
    } catch (e: any) {
      setImportError(e.message || "Invalid palette format");
    }
  };

  return (
    <div className={styles.container}>
      {/* Success message for default gradient */}
      {showDefaultSavedMessage && (
        <MessageBar intent="success">
          <MessageBarBody>
            <Text>Gradient saved as default! It will be used for new gradients.</Text>
          </MessageBarBody>
        </MessageBar>
      )}
      
      {/* Style Preset Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <LayerRegular />
          <Title3>Style Preset</Title3>
        </div>
        <Field>
          <Label>Effect Style</Label>
          <Dropdown
            value={config.style}
            onOptionSelect={(_, data) => updateConfig({ style: data.optionValue as StylePreset })}
          >
            <Option value="neumorphism">Neumorphism</Option>
            <Option value="glassmorphism">Glassmorphism</Option>
            <Option value="frosted-glass">Frosted Glass</Option>
          </Dropdown>
        </Field>
      </div>

      {/* Dimensions Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <SettingsRegular />
          <Title3>Dimensions</Title3>
        </div>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldRow}>
            <Field>
              <Label>Width</Label>
              <Input
                type="number"
                value={config.width.toString()}
                onChange={(_, data) => updateConfig({ width: parseInt(data.value) || 128 })}
              />
            </Field>
            <Field>
              <Label>Height</Label>
              <Input
                type="number"
                value={config.height.toString()}
                onChange={(_, data) => updateConfig({ height: parseInt(data.value) || 128 })}
              />
            </Field>
          </div>
          <div className={styles.fieldRow}>
            <Field>
              <Label>Corner Radius</Label>
              <Slider
                min={0}
                max={50}
                value={config.cornerRadius}
                onChange={(_, data) => updateConfig({ cornerRadius: data.value })}
              />
            </Field>
            <Field>
              <Label>Padding</Label>
              <Slider
                min={0}
                max={50}
                value={config.padding}
                onChange={(_, data) => updateConfig({ padding: data.value })}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <ColorRegular />
          <Title3>Colors</Title3>
          <Button
            appearance="subtle"
            icon={<ArrowUploadRegular />}
            onClick={() => setShowImportModal(true)}
          >
            Import Palette
          </Button>
        </div>
        <Field>
          <Label>Icon Color</Label>
          <div className={styles.colorInputGroup}>
            <Input
              type="text"
              value={config.iconColor}
              onChange={(_, data) => updateConfig({ iconColor: data.value })}
            />
            <div 
              className={styles.colorPreview}
              style={{ backgroundColor: config.iconColor }}
            />
          </div>
        </Field>
        
        <Field>
          <Label>Enable Gradient</Label>
          <Switch
            checked={!!config.gradient}
            onChange={(_, data) => 
              data.checked 
                ? updateGradient({})
                : updateConfig({ gradient: null })
            }
          />
        </Field>
        
        {config.gradient && (
          <div className={styles.gradientControls}>
            <div className={styles.fieldGroup}>
              <div className={styles.fieldRow}>
                <Field>
                  <Label>Start Color</Label>
                  <Input
                    type="text"
                    value={config.gradient.startColor}
                    onChange={(_, data) => updateGradient({ startColor: data.value })}
                  />
                </Field>
                <Field>
                  <Label>Stop Color</Label>
                  <Input
                    type="text"
                    value={config.gradient.stopColor}
                    onChange={(_, data) => updateGradient({ stopColor: data.value })}
                  />
                </Field>
              </div>
              <Field>
                <Label>Angle: {config.gradient.angle}°</Label>
                <Slider
                  min={0}
                  max={360}
                  value={config.gradient.angle}
                  onChange={(_, data) => updateGradient({ angle: data.value })}
                />
              </Field>
              
              <div className={styles.fieldRow}>
                <Button 
                  appearance="secondary" 
                  icon={<SettingsRegular />}
                  onClick={saveAsDefaultGradient}
                  size="small"
                >
                  Set as Default
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Import Palette Dialog */}
      <Dialog open={showImportModal} onOpenChange={(_, data) => setShowImportModal(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Import Color Palette</DialogTitle>
            <DialogContent>
              <Text>
                Import colors from coolors.co URL or paste comma-separated hex colors:
              </Text>
              <Textarea
                placeholder="https://coolors.co/264653-2a9d8f-e9c46a-f4a261-e76f51 or #264653, #2a9d8f, #e9c46a"
                value={importValue}
                onChange={(_, data) => setImportValue(data.value)}
                rows={3}
              />
              {importError && (
                <MessageBar intent="error">
                  <MessageBarBody>{importError}</MessageBarBody>
                </MessageBar>
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleImportPalette}>
                Import
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default StyleControls;
