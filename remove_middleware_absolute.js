const fs = require('fs');
const files = [
    'C:/Users/programar/Documents/GitHub/redcreativapro2/middleware.ts',
    'C:/Users/programar/Documents/GitHub/redcreativapro2/middleware.backup.ts',
    'C:/Users/programar/Documents/GitHub/redcreativapro2/middleware.ts.backup'
];
files.forEach(f => {
    if (fs.existsSync(f)) {
        try {
            fs.unlinkSync(f);
            console.log(`Deleted: ${f}`);
        } catch (e) {
            console.log(`Error deleting ${f}: ${e.message}`);
        }
    } else {
        console.log(`Not found: ${f}`);
    }
});
