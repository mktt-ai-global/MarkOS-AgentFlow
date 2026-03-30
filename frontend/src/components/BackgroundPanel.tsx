import { useRef, useState } from "react";
import type { BackgroundPreset } from "../data/dashboard";
import { UploadIcon } from "./Icons";

type BackgroundPanelProps = {
  open: boolean;
  presets: BackgroundPreset[];
  activePresetKey: string | null;
  overlayValue: number;
  panelValue: number;
  onClose: () => void;
  onSelectPreset: (key: string) => void;
  onUploadFile: (file: File) => void;
  onOverlayChange: (value: number) => void;
  onPanelChange: (value: number) => void;
};

export default function BackgroundPanel({
  open,
  presets,
  activePresetKey,
  overlayValue,
  panelValue,
  onClose,
  onSelectPreset,
  onUploadFile,
  onOverlayChange,
  onPanelChange
}: BackgroundPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div id="bg-panel" className={open ? "open" : ""}>
      <div className="bpp-title">
        背景设置
        <button className="bpp-close" type="button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="bpp-section">预设场景</div>
      <div className="preset-grid">
        {presets.map((preset) => (
          <div
            key={preset.key}
            className={`preset-item${activePresetKey === preset.key ? " active" : ""}`}
            style={{ background: preset.css }}
            onClick={() => onSelectPreset(preset.key)}
          >
            <span>{preset.label}</span>
          </div>
        ))}
      </div>

      <div className="bpp-section">自定义上传</div>
      <div
        className={`upload-zone${isDragOver ? " drag-over" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          const file = event.dataTransfer.files?.[0];
          if (file) {
            onUploadFile(file);
          }
        }}
      >
        <UploadIcon />
        <p>点击上传或拖拽图片</p>
        <span>JPG · PNG · WebP · 建议 1920×1080</span>
      </div>
      <input
        ref={fileInputRef}
        id="bg-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUploadFile(file);
          }
          event.target.value = "";
        }}
      />

      <div className="bpp-section">调节</div>
      <div className="slider-row">
        <div className="slider-label">
          <span>遮罩深度</span>
          <span className="slider-value">{overlayValue}%</span>
        </div>
        <input
          className="sl"
          type="range"
          min="0"
          max="70"
          value={overlayValue}
          onChange={(event) => onOverlayChange(Number(event.target.value))}
        />
      </div>
      <div className="slider-row">
        <div className="slider-label">
          <span>面板透明度</span>
          <span className="slider-value">{panelValue}%</span>
        </div>
        <input
          className="sl"
          type="range"
          min="30"
          max="85"
          value={panelValue}
          onChange={(event) => onPanelChange(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
