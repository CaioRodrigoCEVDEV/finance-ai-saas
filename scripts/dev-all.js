const { spawn } = require('node:child_process');
const path = require('node:path');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const projectRoot = path.resolve(__dirname, '..');
const processes = [
  spawn(npmCommand, ['run', 'dev'], {
    cwd: path.join(projectRoot, 'frontend'),
    stdio: 'inherit',
  }),
  spawn(npmCommand, ['run', 'dev'], {
    cwd: path.join(projectRoot, 'backend'),
    stdio: 'inherit',
  }),
];

let shuttingDown = false;

function stopProcesses(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM');
  }

  process.exitCode = exitCode;
}

for (const child of processes) {
  child.on('error', () => stopProcesses(1));
  child.on('exit', (code) => {
    if (!shuttingDown) stopProcesses(code ?? 1);
  });
}

process.on('SIGINT', () => stopProcesses(0));
process.on('SIGTERM', () => stopProcesses(0));
