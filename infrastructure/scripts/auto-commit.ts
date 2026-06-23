import chokidar from 'chokidar';
import { execSync } from 'child_process';
import path from 'path';

const rootDir = path.resolve(__dirname, '../../');
const watchPaths = [
  path.join(rootDir, 'apps'),
  path.join(rootDir, 'packages'),
  path.join(rootDir, 'infrastructure'),
];

console.log(`Watching for changes in: ${watchPaths.join(', ')}`);

const watcher = chokidar.watch(watchPaths, {
  ignored: /(^|[\/\\])\..|node_modules|dist|\.next|out/,
  persistent: true,
  ignoreInitial: true,
});

let timeout: NodeJS.Timeout | null = null;
const changedFiles = new Set<string>();

watcher.on('all', (event, filePath) => {
  const relativePath = path.relative(rootDir, filePath);
  // Don't track changes to the script itself or its package.json to avoid loops
  if (relativePath.startsWith('infrastructure/scripts/')) return;
  
  changedFiles.add(relativePath);

  if (timeout) clearTimeout(timeout);

  timeout = setTimeout(() => {
    commitChanges();
  }, 10000); // Wait 10 seconds after the last change to commit
});

function getScope(files: string[]): string {
  const scopes = new Set<string>();
  for (const file of files) {
    if (file.startsWith('apps/')) {
      scopes.add(file.split('/')[1]);
    } else if (file.startsWith('packages/')) {
      scopes.add(file.split('/')[1]);
    } else if (file.startsWith('infrastructure/')) {
      scopes.add('infra');
    } else {
      scopes.add('root');
    }
  }
  
  if (scopes.size === 1) {
    return Array.from(scopes)[0];
  }
  return 'multiple';
}

function commitChanges() {
  if (changedFiles.size === 0) return;

  try {
    const files = Array.from(changedFiles);
    const scope = getScope(files);
    const summary = `chore(${scope}): auto-commit changes to ${files.length} files`;
    const details = files.join('\n');
    const message = `${summary}\n\nFiles changed:\n${details}`;
    
    // Check if there are actual changes to commit
    const status = execSync('git status --porcelain', { cwd: rootDir }).toString();
    if (!status) {
      changedFiles.clear();
      return;
    }

    console.log('Staging changes...');
    execSync('git add .', { cwd: rootDir });
    
    console.log(`Committing: ${summary}`);
    execSync(`git commit -m "${message}"`, { cwd: rootDir });
    
    changedFiles.clear();
    console.log('Changes committed successfully.');
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
        changedFiles.clear();
    } else {
        console.error('Failed to commit changes:', error.message);
    }
  }
}
