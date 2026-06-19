const { spawn } = require('child_process');

console.log("Starting EAS login...");
const cp = spawn('npx.cmd', ['eas-cli', 'login'], { 
  cwd: __dirname,
  env: process.env,
  shell: true 
});

cp.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);
  
  if (output.includes('Email or username')) {
    cp.stdin.write('SanaPathologyLab\n');
  } else if (output.includes('Password')) {
    cp.stdin.write('Sambhal@2026\n');
  } else if (output.includes('Logged in')) {
    cp.stdin.end();
  }
});

cp.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

cp.on('close', (code) => {
  console.log(`Child process exited with code ${code}`);
});
