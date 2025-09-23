module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Сохраняем viewBox для адаптивности
          removeViewBox: false,
          // Сохраняем ID для возможного использования
          cleanupIds: false,
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
