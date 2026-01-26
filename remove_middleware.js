const fs = require('fs');
const path = require('path');
const files = ['middleware.ts', 'middleware.backup.ts', 'middleware.ts.backup'];
files.forEach(f => {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) {
        try {
            fs.unlinkSync(p);
            console.log(`Deleted: ${f}`);
        } catch (e) {
            console.log(`Error deleting ${f}: ${e.message}`);
        }
    } else {
        console.log(`Not found: ${f}`);
    }
});
