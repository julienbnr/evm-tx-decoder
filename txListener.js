const txIdentifier = require('./txIdentifier');
const txAlert = require('./alert');


const startConnection = (provider, params, network, externalAlertConfig) => {
  let pingTimeout = null;
  let keepAliveInterval = null;
  provider._websocket.on("open", () => {

    console.log(`Listening transaction with params ${params.to ? 'to:' + params.to : 'from:' + params.from} and provider: ${network.provider}!`);

    keepAliveInterval = setInterval(() => {
      provider._websocket.ping();
      // Use `WebSocket#terminate()`, which immediately destroys the connection,
      // instead of `WebSocket#close()`, which waits for the close timer.
      // Delay should be equal to the interval at which your server
      // sends out pings plus a conservative assumption of the latency.
      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, 30000);
    }, 15000);

    provider.on('pending', async (txHash) => {
      provider.getTransaction(txHash).then(async (tx) => {

        const msg = await txIdentifier.handleTx(params, tx, provider);

        if (msg) {
          txAlert.handleAlert(msg, externalAlertConfig);
        }

      });
    });

    provider._websocket.on("close", () => {
      console.log("WebSocket Closed...Reconnecting...");
      clearInterval(keepAliveInterval);
      clearTimeout(pingTimeout);
      startConnection();
    });

    provider._websocket.on("error", () => {
      console.log("Error. Attemptiing to Reconnect...");
      clearInterval(keepAliveInterval);
      clearTimeout(pingTimeout);
      startConnection();
    });

    provider._websocket.on("pong", () => {
      clearInterval(pingTimeout);
    });
  });
};

exports.startConnection = startConnection;
