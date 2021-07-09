const ethers = require('ethers');
const provider = new ethers.providers.WebSocketProvider('wss://ws-matic-mainnet.chainstacklabs.com');

const util = require('./util');

const ROUTER_ADDRESS = '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff';

const { Webhook } = require('discord-webhook-node');
const hook = new Webhook('https://discord.com/api/webhooks/863016275135430678/7XJVkkv8snF24GwJa03096J7BNxbdfqZBskhY12IoT9vadc-QgSySwCoU6gehmfzNJYp');

const startConnection = () => {
  let pingTimeout = null;
  let keepAliveInterval = null;
  provider._websocket.on("open", () => {
    //console.log(`Sniping on contract ${tokens.tokenOutput} has begun !`);
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
        if (tx && tx.to && tx.to.toLowerCase() === ROUTER_ADDRESS.toLowerCase()) {
          let msg = await util.getMessage('custom', tx, provider);
          msg = `Tx Hash : ${txHash}\n${msg}`;
          //hook.send(msg);
          console.log(msg);
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
