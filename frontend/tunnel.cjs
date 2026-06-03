const localtunnel = require('localtunnel');

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 5173 });
    console.log('TUNNEL_URL=' + tunnel.url);

    tunnel.on('close', () => {
      console.log('TUNNEL_CLOSED_RESTARTING');
      setTimeout(startTunnel, 1000);
    });
  } catch (err) {
    console.error(err);
    setTimeout(startTunnel, 1000);
  }
}

startTunnel();
setInterval(() => {}, 1000 * 60 * 60); // Keep alive
