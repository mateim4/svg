import React, { useState } from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Button,
  Spinner,
  Badge,
  Title3,
  Divider,
} from '@fluentui/react-components';
import {
  ArrowDownloadRegular,
  CopyRegular,
  ShareRegular,
  CheckmarkRegular,
} from '@fluentui/react-icons';

interface OutputPreviewProps {
  icon: string | null;
  width: number;
  height: number;
  iconColor: string;
  gradient?: { angle: number; startColor: string; stopColor: string } | null;
  style: string;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalL),
  },
  
  previewArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalXL),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border(tokens.strokeWidthThin, 'solid', tokens.colorNeutralStroke2),
  },
  
  previewSvg: {
    ...shorthands.borderRadius(tokens.borderRadiusSmall),
    boxShadow: tokens.shadow8,
    transition: 'all 0.3s ease',
    
    ':hover': {
      transform: 'scale(1.05)',
      boxShadow: tokens.shadow16,
    },
  },
  
  previewInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalXS),
  },
  
  actionsArea: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  
  actionButtons: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalS),
    flexWrap: 'wrap',
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalXXL),
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
  
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalXXL),
  },
});

const OutputPreviewNew: React.FC<OutputPreviewProps> = ({
  icon,
  width,
  height,
  iconColor,
  gradient,
  style,
}) => {
  const styles = useStyles();
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Download logic would go here
    }, 1000);
  };

  const handleCopy = () => {
    setCopied(true);
    // Copy logic would go here
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePreviewSVG = () => {
    if (!icon) return null;

    const gradientId = `preview-gradient-${Date.now()}`;
    
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={styles.previewSvg}
      >
        <defs>
          {gradient && (
            <linearGradient 
              id={gradientId} 
              gradientTransform={`rotate(${gradient.angle})`}
            >
              <stop offset="0%" stopColor={gradient.startColor} />
              <stop offset="100%" stopColor={gradient.stopColor} />
            </linearGradient>
          )}
          
          {/* Style-specific filters */}
          {style === 'neumorphism' && (
            <filter id="neumorphism" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="6" dy="6" stdDeviation="6" floodColor="#00000020"/>
              <feDropShadow dx="-6" dy="-6" stdDeviation="6" floodColor="#ffffff80"/>
            </filter>
          )}
          
          {style === 'glassmorphism' && (
            <filter id="glassmorphism" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
              <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.8 0"/>
            </filter>
          )}
        </defs>
        
        {/* Background */}
        <rect
          x="8"
          y="8"
          width={width - 16}
          height={height - 16}
          rx="12"
          fill={gradient ? `url(#${gradientId})` : iconColor}
          filter={style !== 'frosted-glass' ? `url(#${style})` : undefined}
          opacity={style === 'glassmorphism' ? 0.8 : 1}
        />
        
        {/* Icon placeholder */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r="20"
          fill={gradient ? '#ffffff80' : tokens.colorNeutralForeground2}
        />
      </svg>
    );
  };

  if (!icon) {
    return (
      <div className={styles.container}>
        <Title3>Live Preview</Title3>
        <div className={styles.emptyState}>
          <div style={{ fontSize: '48px' }}>🎨</div>
          <Text>No icon selected</Text>
          <Text>Upload or select an icon to see the live preview</Text>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className={styles.container}>
        <Title3>Live Preview</Title3>
        <div className={styles.loadingState}>
          <Spinner size="large" />
          <Text>Processing your icon...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title3>Live Preview</Title3>
      
      <div className={styles.previewArea}>
        {generatePreviewSVG()}
        
        <div className={styles.previewInfo}>
          <Badge appearance="filled" color="brand">
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </Badge>
          <Text>{width} × {height}px</Text>
        </div>
      </div>

      <Divider />

      <div className={styles.actionsArea}>
        <Text weight="semibold">Export Options</Text>
        
        <div className={styles.actionButtons}>
          <Button
            appearance="primary"
            icon={<ArrowDownloadRegular />}
            onClick={handleDownload}
            disabled={isProcessing}
          >
            Download SVG
          </Button>
          
          <Button
            appearance="secondary"
            icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
          
          <Button
            appearance="subtle"
            icon={<ShareRegular />}
          >
            Share
          </Button>
        </div>
        
        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
          Preview updates automatically as you modify the settings
        </Text>
      </div>
    </div>
  );
};

export default OutputPreviewNew;
