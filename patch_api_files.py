import os
import re
import glob

api_dir = 'frontend/src/api'
files = glob.glob(os.path.join(api_dir, '*Api.ts'))

for filepath in files:
    if 'baseApi.ts' in filepath or 'schoolsApi.ts' in filepath:
        continue
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    if 'overrideExisting: true' in content:
        continue
        
    # Replace `  }),\n});` with `  }),\n  overrideExisting: true,\n});`
    # Some might have `overrideExisting: false`
    
    if 'overrideExisting: false' in content:
        content = content.replace('overrideExisting: false', 'overrideExisting: true')
    else:
        # Regex to find the end of injectEndpoints
        # Usually it ends with `  }),\n});` or `  })\n});`
        content = re.sub(r'(\s+})\),\n(.*?)(\s*)\}\);', r'\1),\n\2  overrideExisting: true,\n});', content)
        
    with open(filepath, 'w') as f:
        f.write(content)

print("Patched all API files!")
