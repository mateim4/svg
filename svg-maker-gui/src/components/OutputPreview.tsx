import React from "react";

interface OutputPreviewProps {
  icon: string | null;
  width: number;
  height: number;
  iconColor: string;
  gradient?: { angle: number; startColor: string; stopColor: string } | null;
  style: string;
}

const OutputPreview: React.FC<OutputPreviewProps> = ({
  icon,
  width,
  height,
  iconColor,
  gradient,
  style,
}) => {
  // Render SVG preview with current parameters
  return (
    <div className="output-preview" style={{
      width: width + 32,
      height: height + 32,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      borderRadius: 16,
      boxShadow: "0 2px 16px rgba(99,102,241,0.08)",
      margin: 16,
      position: "relative",
    }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ borderRadius: 12, overflow: "visible" }}
      >
        {/* Gradient background if enabled */}
        {gradient && (
          <defs>
            <linearGradient id="preview-gradient" gradientTransform={`rotate(${gradient.angle})`}>
              <stop offset="0%" stopColor={gradient.startColor} />
              <stop offset="100%" stopColor={gradient.stopColor} />
            </linearGradient>
          </defs>
        )}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx={style === "neumorphism" ? 24 : 12}
          fill={gradient ? "url(#preview-gradient)" : "#fff"}
          stroke="#e0e7ff"
          strokeWidth={2}
        />
        {/* Render icon SVG if available */}
        {icon && (
          <image
            href={icon}
            x={width * 0.15}
            y={height * 0.15}
            width={width * 0.7}
            height={height * 0.7}
            style={{ filter: `drop-shadow(0 2px 8px ${iconColor}80)` }}
          />
        )}
      </svg>
    </div>
  );
};

export default OutputPreview;
