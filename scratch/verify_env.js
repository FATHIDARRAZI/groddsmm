const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('File Content Found');
  const lines = content.split('\n');
  lines.forEach(line => {
    if (line.trim().startsWith('NEXT_PUBLIC_')) {
      const [key, val] = line.split('=');
      console.log(`Found variable: ${key} (Length: ${val?.trim().length || 0})`);
    }
  });
} else {
  console.log('File NOT found');
}
