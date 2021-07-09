const ethers = require('ethers');
const scriptParamsExtractor = require('./scriptParamsExtractor');
const networkConfig = require('./json/network.json');

const scriptParams = scriptParamsExtractor.extractParameters();
const config = networkConfig[scriptParams['chain']];

const provider = new ethers.providers.WebSocketProvider(config.provider);

const util = require('./util');

const { Webhook } = require('discord-webhook-node');
const hook = new Webhook('https://discord.com/api/webhooks/863016275135430678/7XJVkkv8snF24GwJa03096J7BNxbdfqZBskhY12IoT9vadc-QgSySwCoU6gehmfzNJYp');

const startConnection = () => {
  let pingTimeout = null;
  let keepAliveInterval = null;
  provider._websocket.on("open", () => {

    console.log(`Listening transaction with params ${scriptParams.to ? 'to:' + scriptParams.to : 'from:' + scriptParams.from} and provider: ${config.provider}!`);
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

        if (scriptParams.from) {
          if (tx && tx.from && tx.from.toLowerCase() === scriptParams.from.toLowerCase()) {
            let msg = await util.getMessage('custom', tx, provider);
            msg = `Tx Hash : ${txHash}\n${msg}`;
            //hook.send(msg);
            console.log(msg);
          }
        }

        if (scriptParams.to) {
          if (tx && tx.to && tx.to.toLowerCase() === scriptParams.to.toLowerCase()) {
            let msg = await util.getMessage('custom', tx, provider);
            msg = `Tx Hash : ${txHash}\n${msg}`;
            //hook.send(msg);
            console.log(msg);
          }
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

startConnection();
