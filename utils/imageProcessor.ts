
import { WatermarkSettings } from '../types';

export async function applyWatermark(imageFile: File, settings: WatermarkSettings): Promise<Blob> {
  // 确保字体已加载
  await document.fonts.ready;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      // 设置画布尺寸为图片原始尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. 绘制底图
      ctx.drawImage(img, 0, 0);

      // 2. 配置水印样式
      // 根据图片尺寸计算动态字号
      const baseScale = Math.min(canvas.width, canvas.height) / 1000;
      const responsiveFontSize = settings.fontSize * (canvas.width > 1500 ? baseScale : 1);
      
      ctx.font = `bold ${responsiveFontSize}px ${settings.fontFamily}`;
      ctx.fillStyle = settings.color;
      ctx.globalAlpha = settings.opacity;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // 阴影配置：增强对比度，确保在任何背景下可见
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = responsiveFontSize * 0.15;
      ctx.shadowOffsetX = responsiveFontSize * 0.05;
      ctx.shadowOffsetY = responsiveFontSize * 0.05;

      const metrics = ctx.measureText(settings.text);
      const textWidth = metrics.width;
      const textHeight = responsiveFontSize;

      const drawText = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.fillText(settings.text, 0, 0);
        ctx.restore();
      };

      // 统一边距：图片短边的 8%
      const margin = Math.min(canvas.width, canvas.height) * 0.08;

      // 3. 核心：遍历 settings.positions 数组，依次绘制每个选中的水印
      settings.positions.forEach((pos) => {
        if (pos === 'tile') {
          const spacingX = textWidth * 2.5;
          const spacingY = textHeight * 4;
          // 平铺覆盖全图
          for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
            for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
              drawText(x, y);
            }
          }
        } else if (pos === 'top-bottom') {
          // 渲染顶部和底部
          drawText(canvas.width / 2, margin);
          drawText(canvas.width / 2, canvas.height - margin);
        } else {
          // 单点位置计算
          let posX = canvas.width / 2;
          let posY = canvas.height / 2;

          switch (pos) {
            case 'top-left':
              posX = margin + textWidth / 2;
              posY = margin;
              break;
            case 'top-right':
              posX = canvas.width - margin - textWidth / 2;
              posY = margin;
              break;
            case 'bottom-left':
              posX = margin + textWidth / 2;
              posY = canvas.height - margin;
              break;
            case 'bottom-right':
              posX = canvas.width - margin - textWidth / 2;
              posY = canvas.height - margin;
              break;
            case 'center':
              posX = canvas.width / 2;
              posY = canvas.height / 2;
              break;
          }
          drawText(posX, posY);
        }
      });

      // 4. 将 Canvas 转回 Blob
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Conversion to blob failed'));
      }, imageFile.type, 0.92);
    };

    img.onerror = () => reject(new Error('Image loading error'));
    img.src = url;
  });
}
