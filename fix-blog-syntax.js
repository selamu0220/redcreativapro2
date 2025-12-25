const fs = require('fs');
const path = require('path');

const blogDir = path.join(process.cwd(), 'app', 'blog');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern 1: The premature close of the prose div.
  // Look for the callout that has 3 closing divs instead of 2.
  // </div> (inner)
  // </div> (callout)
  // </div> (premature prose)
  const pattern1 = /<\/div>\s*<\/div>\s*<\/div>\s*<h2/g;
  if (pattern1.test(content)) {
    console.log(`Fixing premature prose close in ${filePath}`);
    content = content.replace(pattern1, '</div>\n            </div>\n\n            <h2');
    changed = true;
  }

  // Pattern 2: The extra closing div at the end of the file.
  // </div> (prose)
  // </div> (extra)
  // </article>
  const pattern2 = /<\/div>\s*<\/div>\s*<\/div>\s*<\/article>/g;
  if (pattern2.test(content)) {
    console.log(`Fixing extra trailing div in ${filePath}`);
    content = content.replace(pattern2, '</div>\n          </div>\n        </article>');
    changed = true;
  }

  // Special case for some files that might have only 2 but still be broken if prose wasn't opened?
  // No, let's stick to the 3 -> 2 reduction first.

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (file === 'page.tsx') {
      fixFile(fullPath);
    }
  }
}

traverse(blogDir);
console.log('Done!');
