const { spawn } = require('child_process');
const cp = spawn('cmd.exe', ['/c', 'eas', 'build:view', process.argv[2]], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, EAS_NO_VCS: '1' }
});
cp.on('close', (code) => {
  process.exit(code);
});
