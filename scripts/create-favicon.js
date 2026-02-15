const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const iconPath = path.join(__dirname, '..', 'public', 'icon.png');
const appDir = path.join(__dirname, '..', 'app');

async function convertToFavicon() {
  try {
    // Read the icon.png
    const buffer = fs.readFileSync(iconPath);
    
    // Create 32x32 PNG for favicon (Next.js accepts PNG named as .ico)
    await sharp(buffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(appDir, 'favicon.ico'));
    
    console.log('✅ Created favicon.ico in app/ folder');
    
    // Also create opengraph-image.png (1200x630)
    await sharp(buffer)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(appDir, 'opengraph-image.png'));
    
    console.log('✅ Created opengraph-image.png in app/ folder');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

convertToFavicon();
