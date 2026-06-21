import os

api_dir = 'src/app/api'
for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file == 'route.ts':
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            if 'export async function GET' in content and 'import { connection }' not in content:
                content = "import { connection } from 'next/server';\n" + content
                content = content.replace("export async function GET(request: Request) {\n  try {", "export async function GET(request: Request) {\n  await connection();\n  try {")
                content = content.replace("export async function GET(req: Request) {\n  try {", "export async function GET(req: Request) {\n  await connection();\n  try {")
                content = content.replace("export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {\n  try {", "export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {\n  await connection();\n  try {")
                content = content.replace("export async function GET() {\n  try {", "export async function GET() {\n  await connection();\n  try {")
                with open(path, 'w') as f:
                    f.write(content)
