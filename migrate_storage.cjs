const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\hp\\MediBook\\src';

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // Find import statement for storage (handling multiline)
    const regex = /import\s+\{([^}]+)\}\s+from\s+["']\.\.\/utils\/storage["'];?/g;
    let match;
    let modified = false;

    while ((match = regex.exec(content)) !== null) {
        const importsStr = match[1];
        const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
        
        const authImports = imports.filter(i => ['getCurrentUser', 'setCurrentUser', 'clearCurrentUser'].includes(i));
        
        let replacement = '';
        if (authImports.length > 0) {
            replacement += `import { ${authImports.join(', ')} } from "../utils/auth";\n`;
        }
        
        content = content.substring(0, match.index) + replacement + content.substring(match.index + match[0].length);
        modified = true;
        // Reset regex index since we modified the string
        regex.lastIndex = 0;
    }
    
    // Also check for components folder which uses ../../utils/storage maybe?
    const regex2 = /import\s+\{([^}]+)\}\s+from\s+["']\.\.\/\.\.\/utils\/storage["'];?/g;
    while ((match = regex2.exec(content)) !== null) {
        const importsStr = match[1];
        const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
        
        const authImports = imports.filter(i => ['getCurrentUser', 'setCurrentUser', 'clearCurrentUser'].includes(i));
        
        let replacement = '';
        if (authImports.length > 0) {
            replacement += `import { ${authImports.join(', ')} } from "../../utils/auth";\n`;
        }
        
        content = content.substring(0, match.index) + replacement + content.substring(match.index + match[0].length);
        modified = true;
        regex2.lastIndex = 0;
    }

    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Processed ${filepath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walk(filepath);
        } else if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
            processFile(filepath);
        }
    }
}

walk(srcDir);
console.log("Done.");
