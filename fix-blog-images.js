
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'lib/blog-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replacement for author avatar
content = content.replace(
  /avatar: 'https:\/\/trae-api-us\.mchost\.guru\/api\/ide\/v1\/text_to_image\?prompt=Professional%20headshot%20of%20Selamu%2C%20creative%20professional%20and%20AI%20expert%2C%20modern%20style%2C%20confident%20expression&image_size=square'/g,
  "avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'"
);

const categoryImages = {
  'ia-educacion': 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1000',
  'productividad': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000',
  'tecnologia': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000',
  'creatividad': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
  'negocios': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000'
};

const defaultImage = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000';

// Regex to find blog posts and their category/image
// This is a bit complex since it's a JS object, but we can target the image lines
// that contain the bad domain and look at the nearest category.

// Actually, it might be simpler to just replace all trae-api-us.mchost.guru URLs 
// with a generic high quality AI image first, then refine.

// Let's refine: find each post object and replace its image based on its category.
const postRegex = /\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?category:\s*'([^']+)'[\s\S]*?image:\s*'https:\/\/trae-api-us\.mchost\.guru\/[^']*'[\s\S]*?\}/g;

content = content.replace(postRegex, (match, id, category) => {
  const newImage = categoryImages[category] || defaultImage;
  return match.replace(/image:\s*'https:\/\/trae-api-us\.mchost\.guru\/[^']*'/, `image: '${newImage}'`);
});

// Also catch any remaining ones that might have slightly different format or were missed
content = content.replace(/image:\s*'https:\/\/trae-api-us\.mchost\.guru\/[^']*'/g, `image: '${defaultImage}'`);

fs.writeFileSync(filePath, content);
console.log('Successfully replaced unstable images in lib/blog-data.ts');
