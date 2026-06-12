const path = require('path');
const os = require('os');
const fs = require('fs');

const statePath = path.join(os.homedir(), '.expo', 'state.json');

async function main() {
  const https = require('https');
  
  const sessionData = await new Promise((resolve, reject) => {
    const data = JSON.stringify({ username: 'Labsanapathology@gmail.com', password: 'Sambhal@2026' });
    const req = https.request({
      hostname: 'exp.host',
      path: '/--/api/v2/auth/loginAsync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        const parsed = JSON.parse(body);
        resolve(parsed.data.sessionSecret);
      });
    });
    req.write(data);
    req.end();
  });

  console.log('Got session secret, now fetching user info...');

  // Now get user info via GraphQL using the same urql client
  const { createGraphqlClient } = require('C:/Users/mohd6/AppData/Roaming/npm/node_modules/eas-cli/build/commandUtils/context/contextUtils/createGraphqlClient');
  const { withErrorHandlingAsync } = require('C:/Users/mohd6/AppData/Roaming/npm/node_modules/eas-cli/build/graphql/client');
  
  const client = createGraphqlClient({ accessToken: null, sessionSecret: sessionData });

  try {
    const result = await withErrorHandlingAsync(client.query(
      `query MeUserActorQuery { meUserActor { id username } }`,
      {}
    ).toPromise());

    const user = result.meUserActor;
    console.log(`User: ${user.username} (${user.id})`);

    const currentState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    currentState.auth = {
      sessionSecret: sessionData,
      userId: user.id,
      username: user.username,
      currentConnection: 'Username-Password-Authentication'
    };
    fs.writeFileSync(statePath, JSON.stringify(currentState, null, 2));
    console.log('Session saved to ~/.expo/state.json');
    console.log('Login successful!');
  } catch (e) {
    console.error('GraphQL error:', e.message || e);
    // Write session anyway
    const currentState = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
    currentState.auth = {
      sessionSecret: sessionData,
      currentConnection: 'Username-Password-Authentication'
    };
    fs.writeFileSync(statePath, JSON.stringify(currentState, null, 2));
    console.log('Session saved (partial)');
  }
}

main().catch(console.error);
