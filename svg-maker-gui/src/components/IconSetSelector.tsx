import React, { useState, useEffect } from "react";

interface IconSetSelectorProps {
  iconFolder: string | null;
  onFolderSelect: (folder: string) => void;
  icons: string[];
  onIconSelect: (icon: string) => void;
  selectedIcon: string | null;
}

const IconSetSelector: React.FC<IconSetSelectorProps> = ({
  iconFolder,
  onFolderSelect,
  icons,
  onIconSelect,
  selectedIcon,
}) => {
  const [folderInput, setFolderInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // UI for folder selection and icon browsing
  return (
    <div className="icon-set-selector">
      <h3>Icon Set</h3>
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="icon-folder-input">Icon Folder:</label>
        <input
          id="icon-folder-input"
          type="text"
          value={folderInput}
          onChange={e => setFolderInput(e.target.value)}
          placeholder="/path/to/icons"
          style={{ width: "80%", marginRight: 8 }}
        />
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              // Use browser folder picker
              // @ts-ignore
              if (window.showDirectoryPicker) {
                // @ts-ignore
                const folderHandle = await window.showDirectoryPicker();
                onFolderSelect(folderHandle);
              } else {
                onFolderSelect(folderInput);
              }
            } catch (e) {}
            setIsLoading(false);
          }}
        >Browse</button>
      </div>
      <div className="icon-list" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {isLoading ? (
          <div style={{ color: "var(--brand-primary)", fontWeight: 500 }}>Searching for icons...</div>
        ) : icons.length === 0 ? (
          <div style={{ color: "var(--text-tertiary)" }}>No icons found in folder.</div>
        ) : (
          icons.map(icon => (
            <div
              key={icon}
              className={`icon-thumb${selectedIcon === icon ? " selected" : ""}`}
              style={{
                border: selectedIcon === icon ? "2px solid #6366f1" : "1px solid #e0e7ff",
                borderRadius: 8,
                padding: 6,
                background: "#fff",
                cursor: "pointer",
                boxShadow: selectedIcon === icon ? "0 2px 8px #6366f1" : "0 1px 4px #e0e7ff",
                transition: "box-shadow 0.2s, border 0.2s",
              }}
              onClick={() => onIconSelect(icon)}
              title={icon}
            >
              <img src={icon} alt={icon} style={{ width: 32, height: 32, objectFit: "contain" }} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IconSetSelector;
