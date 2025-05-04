const fs = require('fs');
const path = require('path');

const projectDir = './'; // ou substitua pelo caminho exato do seu projeto
const targetString = 'InputGroupAddon';

function searchInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(targetString)) {
    console.log(`⚠ Encontrado em: ${filePath}`);
  }
}

function scanDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      searchInFile(fullPath);
    }
  });
}

console.log(`🔍 Procurando por '${targetString}' no projeto...`);
scanDirectory(projectDir);
console.log('✅ Busca concluída.');
