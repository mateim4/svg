import React, { useState } from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  CardPreview,
  Text,
  Button,
  Input,
  Field,
  Label,
  Spinner,
  Badge,
  Title3,
} from '@fluentui/react-components';
import {
  FolderRegular,
  DocumentRegular,
  CheckmarkCircleRegular,
} from '@fluentui/react-icons';

interface IconSetSelectorProps {
  iconFolder: any;
  onFolderSelect: (folder: any) => void;
  icons: string[];
  onIconSelect: (icon: string) => void;
  selectedIcon: string | null;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalL),
  },
  
  folderSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap(tokens.spacingVerticalS),
  },
  
  folderInput: {
    display: 'flex',
    ...shorthands.gap(tokens.spacingHorizontalS),
  },
  
  iconGrid: {
  display: 'grid',
  // match the min card width used in FluentUIIconBrowser (.icon-card grid min 280px)
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    ...shorthands.gap(tokens.spacingVerticalS),
    maxHeight: '300px',
    ...shorthands.overflow('auto'),
  },
  
  iconCard: {
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    
    ':hover': {
      transform: 'scale(1.02)',
      boxShadow: tokens.shadow4,
    },
  },
  
  iconPreview: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // match preview size to FluentUIIconBrowser (.icon-preview 48px)
  height: '48px',
  width: '48px',
  margin: '0 auto',
  backgroundColor: tokens.colorNeutralBackground2,
  ...shorthands.overflow('hidden'),
  },
  
  iconSvg: {
    // keep SVGs visually consistent with the browser preview (max 32px)
    maxWidth: '32px',
    maxHeight: '32px',
    width: 'auto',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
  },
  
  iconName: {
    fontSize: tokens.fontSizeBase200,
    textAlign: 'center',
    ...shorthands.padding(tokens.spacingVerticalXS),
  // ensure the card fills the grid cell so widths remain consistent
  width: '100%',
  },
  
  selectedBadge: {
    position: 'absolute',
    top: tokens.spacingVerticalXS,
    right: tokens.spacingHorizontalXS,
  },
  
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalXL),
    color: tokens.colorNeutralForeground3,
  },
  
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingVerticalS),
    ...shorthands.padding(tokens.spacingVerticalXL),
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

const IconSetSelectorNew: React.FC<IconSetSelectorProps> = ({
  iconFolder,
  onFolderSelect,
  icons,
  onIconSelect,
  selectedIcon,
}) => {
  const styles = useStyles();
  const [folderInput, setFolderInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFolderSelect = async () => {
    setIsLoading(true);
    try {
      // Use browser folder picker
      if ('showDirectoryPicker' in window) {
        const folderHandle = await (window as any).showDirectoryPicker();
        onFolderSelect(folderHandle);
      } else {
        onFolderSelect(folderInput);
      }
    } catch (e) {
      console.error('Error selecting folder:', e);
    }
    setIsLoading(false);
  };

  const getIconName = (iconPath: string) => {
    return iconPath.split('/').pop()?.replace('.svg', '') || iconPath;
  };

  return (
    <div className={styles.container}>
      <div className={styles.folderSection}>
        <Title3>Icon Set Selection</Title3>
        
        <Field>
          <Label>Choose Icon Folder</Label>
          <div className={styles.folderInput}>
            <Input
              value={folderInput}
              onChange={(_, data) => setFolderInput(data.value)}
              placeholder="/path/to/icons"
              disabled={isLoading}
            />
            <Button
              appearance="primary"
              icon={<FolderRegular />}
              onClick={handleFolderSelect}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Browse'}
            </Button>
          </div>
        </Field>
        
        {iconFolder && (
          <Text>
            Selected folder: {iconFolder.name || folderInput}
          </Text>
        )}
      </div>

      {isLoading && (
        <div className={styles.loadingState}>
          <Spinner size="medium" />
          <Text>Scanning for SVG files...</Text>
        </div>
      )}
      
      {!isLoading && icons.length === 0 && iconFolder && (
        <div className={styles.emptyState}>
          <DocumentRegular style={{ fontSize: '48px' }} />
          <Text>No SVG files found in the selected folder</Text>
          <Text>Make sure the folder contains .svg files</Text>
        </div>
      )}
      
      {!isLoading && icons.length === 0 && !iconFolder && (
        <div className={styles.emptyState}>
          <FolderRegular style={{ fontSize: '48px' }} />
          <Text>Select a folder to browse icons</Text>
          <Text>Choose a folder containing SVG files to get started</Text>
        </div>
      )}

      {!isLoading && icons.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title3>Available Icons</Title3>
            <Badge appearance="filled" color="brand">
              {icons.length} found
            </Badge>
          </div>
          
          <div className={styles.iconGrid}>
            {icons.map((icon, index) => (
              <Card
                key={index}
                className={styles.iconCard}
                onClick={() => onIconSelect(icon)}
                appearance={selectedIcon === icon ? "filled" : "outline"}
              >
                <CardPreview className={styles.iconPreview}>
                  <div className={styles.iconSvg}>
                    <DocumentRegular />
                  </div>
                </CardPreview>
                <Text className={styles.iconName}>
                  {getIconName(icon)}
                </Text>
                {selectedIcon === icon && (
                  <Badge 
                    appearance="filled" 
                    color="success"
                    className={styles.selectedBadge}
                    icon={<CheckmarkCircleRegular />}
                  />
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default IconSetSelectorNew;
