import os
import glob
import re

schema_files = glob.glob('frontend/src/**/*.schema.ts', recursive=True)

for filepath in schema_files:
    with open(filepath, 'r') as f:
        content = f.read()

    # If already using IdRegex from school.schema.ts, skip or replace it
    if 'UniversalIdRegex' not in content and ('ObjectIdRegex' in content or '/^[0-9a-fA-F]{24}$/' in content):
        # Find exactly where to import
        # Usually we can just insert the import at the top
        import_stmt = "import { UniversalIdRegex } from '@common/constants/regex';\n"
        
        # Replace the literal regex or ObjectIdRegex with UniversalIdRegex
        content = re.sub(r'const\s+ObjectIdRegex\s*=\s*/\^\[0-9a-fA-F\]\{24\}\$/;', '', content)
        content = re.sub(r'const\s+IdRegex\s*=\s*/\^\(\[0-9a-fA-F\]\{24\}\|\[0-9a-fA-F\]\{8\}-\[0-9a-fA-F\]\{4\}-\[0-9a-fA-F\]\{4\}-\[0-9a-fA-F\]\{4\}-\[0-9a-fA-F\]\{12\}\)\$/i;', '', content)
        
        content = content.replace('ObjectIdRegex', 'UniversalIdRegex')
        content = content.replace('IdRegex', 'UniversalIdRegex')
        content = content.replace('/^[0-9a-fA-F]{24}$/', 'UniversalIdRegex')
        
        content = import_stmt + content.lstrip()
        
        with open(filepath, 'w') as f:
            f.write(content)

print("Regex patched in schema files!")
