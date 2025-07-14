const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// Image extensions that can be converted to WebP
const CONVERTIBLE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif'
];

// File extensions to search for image references
const CODE_EXTENSIONS = [
  '**/*.html', '**/*.css', '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx', 
  '**/*.vue', '**/*.svelte', '**/*.md', '**/*.json', '**/*.xml'
];

async function analyzeImages(directory, options) {
  try {
    console.log(`\n🔍 Processing images in: ${path.resolve(directory)}`);
    
    // Check if directory exists
    if (!await fs.pathExists(directory)) {
      console.error(`❌ Directory "${directory}" does not exist.`);
      process.exit(1);
    }
    
    // Find all convertible images
    const imageFiles = await findImages(directory);
    
    if (imageFiles.length === 0) {
      console.log('📂 No convertible image files found in this directory.');
      return;
    }
    
    console.log(`\n📸 Found ${imageFiles.length} convertible image file(s):`);
    console.log('─'.repeat(60));
    
    // Process each image
    for (const imageFile of imageFiles) {
      await processImage(imageFile, directory, options);
    }
    
    // Update references in code files if write mode is enabled
    if (options.write) {
      console.log('\n🔄 Updating image references in code files...');
      await updateReferences(directory, imageFiles, options);
    }
    
    console.log('\n✅ Processing complete!');
    if (!options.write) {
      console.log('💡 Run with --write flag to actually perform the conversion');
    }
    
  } catch (error) {
    console.error('❌ Error processing images:', error.message);
    process.exit(1);
  }
}

async function findImages(directory) {
  const imageFiles = [];
  
  for (const ext of CONVERTIBLE_EXTENSIONS) {
    const pattern = path.join(directory, `**/*${ext}`);
    const files = glob.sync(pattern, { ignore: ['**/node_modules/**'] });
    imageFiles.push(...files);
  }
  
  return imageFiles;
}

async function processImage(imagePath, baseDir, options) {
  try {
    const stats = await fs.stat(imagePath);
    const originalSize = stats.size;
    const relativePath = path.relative(baseDir, imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    
    // Generate WebP filename
    const webpPath = imagePath.replace(ext, '.webp');
    const webpRelativePath = relativePath.replace(ext, '.webp');
    
    console.log(`📄 ${relativePath}`);
    console.log(`   Original size: ${formatFileSize(originalSize)}`);
    console.log(`   Type: ${ext}`);
    
    if (options.write) {
      // Convert to WebP
      await sharp(imagePath)
        .webp({ quality: 85 })
        .toFile(webpPath);
      
      const webpStats = await fs.stat(webpPath);
      const webpSize = webpStats.size;
      const savings = Math.round((1 - webpSize / originalSize) * 100);
      
      console.log(`   WebP size: ${formatFileSize(webpSize)} (${savings}% smaller)`);
      console.log(`   ✅ Converted to: ${webpRelativePath}`);
      
      // Remove original file if replace flag is set
      if (options.replace) {
        await fs.remove(imagePath);
        console.log(`   🗑️  Removed original file`);
      }
    } else {
      console.log(`   → Would convert to: ${webpRelativePath}`);
    }
    
    console.log('');
  } catch (error) {
    console.error(`   ❌ Error processing ${imagePath}:`, error.message);
  }
}

async function updateReferences(directory, imageFiles, options) {
  const codeFiles = [];
  
  // Find all code files
  for (const pattern of CODE_EXTENSIONS) {
    const files = glob.sync(path.join(directory, pattern), { 
      ignore: ['**/node_modules/**', '**/.git/**'] 
    });
    codeFiles.push(...files);
  }
  
  console.log(`📋 Found ${codeFiles.length} code files to check for references`);
  
  let totalReferences = 0;
  
  for (const codeFile of codeFiles) {
    try {
      let content = await fs.readFile(codeFile, 'utf8');
      let fileUpdated = false;
      let fileReferences = 0;
      
      // Update references for each image
      for (const imagePath of imageFiles) {
        const originalName = path.basename(imagePath);
        const ext = path.extname(imagePath);
        const webpName = originalName.replace(ext, '.webp');
        
        // Create regex to find image references
        const imageRegex = new RegExp(escapeRegExp(originalName), 'g');
        
        if (imageRegex.test(content)) {
          content = content.replace(imageRegex, webpName);
          fileUpdated = true;
          fileReferences++;
        }
      }
      
      if (fileUpdated) {
        await fs.writeFile(codeFile, content);
        console.log(`   ✅ Updated ${fileReferences} reference(s) in ${path.relative(directory, codeFile)}`);
        totalReferences += fileReferences;
      }
      
    } catch (error) {
      console.error(`   ❌ Error updating ${codeFile}:`, error.message);
    }
  }
  
  console.log(`\n📊 Total references updated: ${totalReferences}`);
}

function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  analyzeImages
}; 