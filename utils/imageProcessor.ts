
import { WatermarkSettings } from '../types';

/**
 * Applies a watermark to an image file and returns a Blob
 */
export async function applyWatermark(imageFile: File, settings: WatermarkSettings): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Failed to get canvas context'));

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Setup watermark style
      ctx.font = `${settings.fontSize}px ${settings.fontFamily}`;
      ctx.fillStyle = settings.color;
      ctx.globalAlpha = settings.opacity;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      const metrics = ctx.measureText(settings.text);
      const textWidth = metrics.width;
      const textHeight = settings.fontSize;

      const drawTextAt = (x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((settings.rotation * Math.PI) / 180);
        ctx.fillText(settings.text, 0, 0);
        ctx.restore();
      };

      if (settings.position === 'tile') {
        const spacingX = textWidth * 2;
        const spacingY = textHeight * 4;
        
        ctx.save();
        for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
          for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
            drawTextAt(x, y);
          }
        }
        ctx.restore();
      } else if (settings.position === 'top-bottom') {
        const margin = Math.min(canvas.width, canvas.height) * 0.05;
        // Top Center
        drawTextAt(canvas.width / 2, margin + textHeight / 2);
        // Bottom Center
        drawTextAt(canvas.width / 2, canvas.height - margin - textHeight / 2);
      } else {
        let x = 0;
        let y = 0;
        const margin = Math.min(canvas.width, canvas.height) * 0.05;

        switch (settings.position) {
          case 'top-left':
            x = margin + textWidth / 2;
            y = margin + textHeight / 2;
            break;
          case 'top-right':
            x = canvas.width - margin - textWidth / 2;
            y = margin + textHeight / 2;
            break;
          case 'bottom-left':
            x = margin + textWidth / 2;
            y = canvas.height - margin - textHeight / 2;
            break;
          case 'bottom-right':
            x = canvas.width - margin - textWidth / 2;
            y = canvas.height - margin - textHeight / 2;
            break;
          case 'center':
          default:
            x = canvas.width / 2;
            y = canvas.height / 2;
            break;
        }

        drawTextAt(x, y);
      }

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      }, imageFile.type, 0.95);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
