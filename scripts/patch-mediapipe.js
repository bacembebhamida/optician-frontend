const fs = require('fs');
const path = require('path');

const targetFiles = [
  'node_modules/@mediapipe/tasks-vision/vision_bundle.cjs',
  'node_modules/@mediapipe/tasks-vision/vision_bundle.js',
  'node_modules/@mediapipe/tasks-vision/vision_bundle.mjs'
];

targetFiles.forEach((relPath) => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes('import(t.toString())') || content.includes('import(t2.toString())')) {
      content = content.replace(/import\((t2?\.toString\(\))\)/g, 'import(/* @vite-ignore */ $1)');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`[patch-mediapipe] Patched ${relPath} with /* @vite-ignore */`);
    }
  }
});
