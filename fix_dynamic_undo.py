import os

api_dir = 'src/app/api'
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file == 'route.ts':
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            if "export const dynamic = 'force-dynamic';\n" in content:
                content = content.replace("export const dynamic = 'force-dynamic';\n", '')
                with open(path, 'w') as f:
                    f.write(content)
