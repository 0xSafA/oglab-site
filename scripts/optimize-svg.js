#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

const svgoConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Сохраняем viewBox для адаптивности
          removeViewBox: false,
        },
      },
    },
    // Удаляем ненужные атрибуты
    'removeXMLNS',
    'removeDoctype',
    'removeXMLProcInst',
    // Оптимизируем пути и трансформации
    'convertTransform',
    'mergePaths',
    // Минифицируем стили
    'minifyStyles',
  ],
};

const imagesDir = path.join(__dirname, '../public/assets/images');
const svgFiles = fs.readdirSync(imagesDir).filter(file => 
  file.endsWith('.svg') && !file.includes('.optimized.')
);

console.log('🔧 Оптимизация SVG файлов для ТВ...\n');

let totalSaved = 0;
let filesOptimized = 0;

svgFiles.forEach(file => {
  const filePath = path.join(imagesDir, file);
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(originalContent, 'utf8');
  
  try {
    const result = optimize(originalContent, svgoConfig);
    const optimizedSize = Buffer.byteLength(result.data, 'utf8');
    const saved = originalSize - optimizedSize;
    const savedPercent = ((saved / originalSize) * 100).toFixed(1);
    
    // Перезаписываем только если есть значительная экономия (>5%)
    if (saved > originalSize * 0.05) {
      fs.writeFileSync(filePath, result.data);
      console.log(`✅ ${file}: ${(originalSize/1024).toFixed(1)}KB → ${(optimizedSize/1024).toFixed(1)}KB (-${savedPercent}%)`);
      totalSaved += saved;
      filesOptimized++;
    } else {
      console.log(`⚪ ${file}: уже оптимизирован`);
    }
  } catch (error) {
    console.log(`❌ ${file}: ошибка оптимизации`);
  }
});

console.log(`\n🎉 Оптимизировано ${filesOptimized} файлов`);
console.log(`💾 Сэкономлено: ${(totalSaved/1024).toFixed(1)}KB`);
console.log(`🚀 Быстрее загрузка на ТВ и медленных устройствах!`);
