
import React from 'react';
import { WatermarkSettings, WatermarkPosition } from '../types';

interface Props {
  settings: WatermarkSettings;
  onUpdate: (s: WatermarkSettings) => void;
}

const WatermarkControls: React.FC<Props> = ({ settings, onUpdate }) => {
  const update = (key: keyof WatermarkSettings, val: any) => onUpdate({ ...settings, [key]: val });

  const togglePosition = (pos: WatermarkPosition) => {
    const current = settings.positions;
    if (current.includes(pos)) {
      // 至少保留一个
      if (current.length > 1) {
        update('positions', current.filter(p => p !== pos));
      }
    } else {
      update('positions', [...current, pos]);
    }
  };

  const posLabels: { id: WatermarkPosition; label: string }[] = [
    { id: 'top-left', label: '左上' },
    { id: 'top-right', label: '右上' },
    { id: 'center', label: '居中' },
    { id: 'bottom-left', label: '左下' },
    { id: 'bottom-right', label: '右下' },
    { id: 'top-bottom', label: '头尾' },
    { id: 'tile', label: '平铺' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">水印内容</label>
        <input 
          type="text" 
          value={settings.text}
          onChange={e => update('text', e.target.value)}
          className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            字号 <span>{settings.fontSize}</span>
          </label>
          <input 
            type="range" min="10" max="200" value={settings.fontSize}
            onChange={e => update('fontSize', +e.target.value)}
            className="w-full accent-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            不透明度 <span>{Math.round(settings.opacity * 100)}%</span>
          </label>
          <input 
            type="range" min="0" max="1" step="0.05" value={settings.opacity}
            onChange={e => update('opacity', +e.target.value)}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">颜色</label>
          <div className="flex items-center gap-3">
            <input 
              type="color" value={settings.color}
              onChange={e => update('color', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
            />
            <span className="text-xs font-mono text-slate-400">{settings.color.toUpperCase()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
            旋转 <span>{settings.rotation}°</span>
          </label>
          <input 
            type="range" min="-180" max="180" value={settings.rotation}
            onChange={e => update('rotation', +e.target.value)}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">位置方案 (多选)</label>
        <div className="grid grid-cols-4 gap-2">
          {posLabels.map(p => (
            <button
              key={p.id}
              onClick={() => togglePosition(p.id)}
              className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                settings.positions.includes(p.id) 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-black border-white/10 text-slate-500 hover:border-white/20'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatermarkControls;
