import { blogPosts } from '../lib/blog-data';

const ids = blogPosts.map(p => p.id);
const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);

if (duplicates.length > 0) {
    console.error('ERROR: Duplicate IDs found in blog-data.ts:');
    duplicates.forEach(d => console.error(`- ${d}`));
    process.exit(1);
} else {
    console.log('SUCCESS: No duplicate IDs found. Blog data is healthy.');
}
