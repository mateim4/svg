import React from "react";

interface Node {
  id: string;
  type?: string;
  data?: any;
}

interface MinimapNodeProps {
  node: Node;
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
}

const typeIconMap: Record<string, React.ReactNode> = {
  claudeAgent: <span style={{fontSize:12}}>🤖</span>,
  userProxyAgent: <span style={{fontSize:12}}>🧑‍💻</span>,
  localOllamaAgent: <span style={{fontSize:12}}>🦙</span>,
  localMSTYAgent: <span style={{fontSize:12}}>🧠</span>,
  julesAgent: <span style={{fontSize:12}}>🔵</span>,
  copilotAgent: <span style={{fontSize:12}}>🤝</span>,
  customAgent: <span style={{fontSize:12}}>✨</span>,
};

const typeLabelMap: Record<string, string> = {
  claudeAgent: "Claude",
  userProxyAgent: "User",
  localOllamaAgent: "Ollama",
  localMSTYAgent: "MSTY",
  julesAgent: "Jules",
  copilotAgent: "Copilot",
  customAgent: "Custom",
};

const MinimapNode: React.FC<MinimapNodeProps> = ({ node, x, y, width, height, selected }) => {
  const nodeType = typeof node.type === 'string' ? node.type : 'unknown';
  const icon = typeIconMap[nodeType] || <span style={{fontSize:12}}>🔲</span>;
  const label = typeLabelMap[nodeType] || nodeType;

  return (
    <g transform={`translate(${x},${y})`}>
      <rect
        width={width}
        height={height}
        rx={6}
        ry={6}
        fill={selected ? "#e0e7ff" : "#fff"}
        stroke="#6366f1"
        strokeWidth={selected ? 2.5 : 1.5}
        opacity={selected ? 0.95 : 0.8}
      />
      <foreignObject x={0} y={0} width={width} height={height}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--brand-primary)",
            background: "transparent",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <div style={{fontSize: "14px", marginBottom: 2}}>{icon}</div>
          <div style={{fontSize: "9px", opacity: 0.8}}>{label}</div>
        </div>
      </foreignObject>
    </g>
  );
};

export default MinimapNode;
