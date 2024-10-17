// babel.config.js
module.exports = {
    presets: ['next/babel'],
    plugins: [
      [
        'import',
        {
          libraryName: 'antd',
          style: 'css', // Automatically import CSS specific to each component
        },
      ],
    ],
  };
  