const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputLogo = path.join(__dirname, '../public/temora-logo.png');
const publicDir = path.join(__dirname, '../public');

async function generateFavicons() {
  console.log('Generating favicons from:', inputLogo);

  // Generate different sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);
    await sharp(inputLogo)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${name} (${size}x${size})`);
  }

  // Generate ICO file (use 32x32 as base)
  const icoPath = path.join(publicDir, 'favicon.ico');
  await sharp(inputLogo)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(icoPath.replace('.ico', '-temp.png'));

  // Copy as .ico (browsers accept PNG in .ico)
  fs.copyFileSync(icoPath.replace('.ico', '-temp.png'), icoPath);
  fs.unlinkSync(icoPath.replace('.ico', '-temp.png'));
  console.log('Generated: favicon.ico');

  console.log('\\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
