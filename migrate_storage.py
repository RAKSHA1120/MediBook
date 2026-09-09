import os
import re

src_dir = r"C:\Users\hp\MediBook\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find import statement for storage
    storage_import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+["\']../utils/storage["\'];?', content)
    if not storage_import_match:
        storage_import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+["\']\.\./utils/storage["\'];?', content)
        
    if storage_import_match:
        imports_str = storage_import_match.group(1)
        imports = [i.strip() for i in imports_str.split(',')]
        
        auth_imports = [i for i in imports if i in ['getCurrentUser', 'setCurrentUser', 'clearCurrentUser']]
        other_imports = [i for i in imports if i not in auth_imports]
        
        replacement = ""
        if auth_imports:
            replacement += f'import {{ {", ".join(auth_imports)} }} from "../utils/auth";\n'
        
        if other_imports:
            # We don't want to keep other mock imports, because we are deleting storage.js!
            # Let's just comment them out so we know they were removed, or just omit them.
            pass
            
        content = content[:storage_import_match.start()] + replacement + content[storage_import_match.end():]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Processed {filepath}")

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))

print("Done.")
