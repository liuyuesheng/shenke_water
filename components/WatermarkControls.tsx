
import React from 'react';
import { WatermarkSettings } from '../types';

interface Props {
  settings: WatermarkSettings;
  onUpdate: (settings: WatermarkSettings) => void;
}

const WatermarkControls: React.FC<Props> = ({ settings, onUpdate }) => {
  const handleChange = (key: keyof WatermarkSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const positions = [
    { id: 'top-left', label: '左上' },
    { id: 'top-right', label: '右上' },
    { id: 'bottom-left', label: '左下' },
    { id: 'bottom-right', label: '右下' },
    { id: 'center', label: '居中' },
    { id: 'top-bottom', label: '头尾' },
    { id: 'tile', label: '平铺' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">水印内容</label>
        <input
          type="text"
          value={settings.text}
          onChange={(e) => handleChange('text', e.target.value)}
          placeholder="请输入水印文字..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">字号 ({settings.fontSize}px)</label>
          <input
            type="range"
            min="10"
            max="150"
            value={settings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">透明度 ({Math.round(settings.opacity * 100)}%)</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.opacity}
            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">颜色</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={settings.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
            <span className="text-xs font-mono uppercase text-slate-500">{settings.color}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">旋转 ({settings.rotation}°)</label>
          <input
            type="range"
            min="-180"
            max="180"
            value={settings.rotation}
            onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">水印位置</label>
        <div className="grid grid-cols-4 gap-2">
          {positions.map((pos) => (
            <button
              key={pos.id}
              onClick={() => handleChange('position', pos.id)}
              className={`px-2 py-2 text-xs rounded-lg border transition-all ${
                settings.position === pos.id 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatermarkControls;
