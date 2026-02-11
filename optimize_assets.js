const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'images');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));

async function processImages() {
  console.log('Processing images...');
  const results = {};

  for (const file of files) {
    const inputPath = path.join(imgDir, file);
    const outputName = file.replace('.png', '.webp');
    const outputPath = path.join(imgDir, outputName);

    try {
      // Get metadata of original or processed?
      // Use processed dimensions (should be same unless resized)
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      await image
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      results[file] = {
        webp: outputName,
        width: metadata.width,
        height: metadata.height,
        oldSize: fs.statSync(inputPath).size,
        newSize: fs.statSync(outputPath).size
      };
      
      console.log(`Converted ${file}: ${(results[file].oldSize/1024).toFixed(1)}KB -> ${(results[file].newSize/1024).toFixed(1)}KB`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  // Write results to a file we can read easily
  fs.writeFileSync('image-data.json', JSON.stringify(results, null, 2));
  console.log('Done. Data written to image-data.json');
}

processImages();
