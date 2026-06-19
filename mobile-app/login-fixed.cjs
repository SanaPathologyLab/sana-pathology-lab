const { spawn } = require('child_process');

console.log("Starting EAS login...");
const cp = spawn('npx.cmd', ['eas-cli', 'login'], { 
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

cp.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  if (output.includes('Email') || output.includes('username') || output.includes('Username')) {
    cp.stdin.write('SanaPathologyLab\n');
  } else if (output.includes('Password') || output.includes('password')) {
    cp.stdin.write('Sambhal@2026\n');
  } else if (output.includes('Logged in')) {
    cp.stdin.end();
  }
});

cp.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

cp.on('close', (code) => {
  console.log(`\nChild process exited with code ${code}`);
});
