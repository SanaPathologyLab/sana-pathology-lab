import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const directoryPath = path.join(process.cwd(), 'public/assets/packages');

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  } 
  
  files.forEach(file => {
    if (file.endsWith('.png')) {
      const inputPath = path.join(directoryPath, file);
      const outputFilename = file.replace('.png', '.webp');
      const outputPath = path.join(directoryPath, outputFilename);
      
      console.log(`Compressing ${file}...`);
      
      sharp(inputPath)
        .webp({ quality: 60 }) // compress significantly
        .toFile(outputPath, (err, info) => {
          if (err) {
            console.error(`Error processing ${file}:`, err);
          } else {
            console.log(`Successfully compressed ${file} -> ${outputFilename}. Original Size: ${fs.statSync(inputPath).size / 1024}KB, New Size: ${info.size / 1024}KB`);
          }
        });
    }
  });
});
