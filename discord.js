const Discord = require('discord.js');
const client = new Discord.Client();
const discordConfig = require('./json/config/discordConfig.json');
client.login(discordConfig.token);
const networkConfig = require('./json/network.json');
const txListener = require('./txListener');
const ethers = require('ethers');

let provider = undefined;
let lastConfig = undefined;

const VALID_CMD_PREFIX = [
    '!l-polygon',
    '!l-bsc',
    '!l-close',
    '!l-config'
];

const VALID_ARG_PREFIX = [
    'to',
    'from'
];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}.`);
});

client.on('message', async message => {

  console.log(`Received message : ${message.content}`);

  const messageSplit = message.content.split(' ');

  if (VALID_CMD_PREFIX.includes(messageSplit[0])) {
    const param = getParamObjectFromMessage(message.content);

    if (param.valid) {
      if (param.type === 'config') {
        if (undefined === lastConfig) {
          await sendChannelMessage(message, `Listener not running now !`);
        } else {
          await sendChannelMessage(message, lastConfig.description);
        }
      } else if (param.type === 'close') {
        lastConfig = undefined;
        await sendChannelMessage(message, `Close EVM listener !`);
        if (provider) {
          provider._websocket.terminate();
        }
        process.exit();
      } else {
        console.log('IN CMD ');

        lastConfig = param;
        await closeWssProviderIfExist(message, `Close the last EVM listener`);
        const network = param.command === 'listenPolygon' ? networkConfig['MATIC'] : networkConfig['BSC'];
        provider = new ethers.providers.WebSocketProvider(network.provider);

        console.log('LAUNCH');
        // Start listening event !
        txListener.startConnection(
            provider,
            param.argument,
            network,
            {
              type: 'discord',
              channel: message.channel
            }
        );
      }

    } else {
      await sendChannelMessage(message, `${param.errorMessage}`);
    }

  }
});

const closeWssProviderIfExist = async (discord, message) => {
  if (provider) {
    await sendChannelMessage(discord, message);
    provider._websocket.terminate();
    provider = undefined;
    lastConfig = undefined;
  }
};

const sendChannelMessage = async (discord, message) => {
  await discord.channel.send(message);
};

const getParamObjectFromMessage = (message) => {

  const messageSplit = message.split(" ");

  const commandPrefix = messageSplit[0];

  if (!VALID_CMD_PREFIX.includes(commandPrefix)) {
    return {
      valid: false,
      errorMessage: `Command is not handled ! Should begin with ${VALID_CMD_PREFIX.join(' or ')} !`
    }
  }

  if ('!l-config' === commandPrefix) {
    return {
      valid: true,
      type: 'config'
    };
  }

  if ('!l-close' === commandPrefix) {
    return {
      valid: true,
      type: 'close'
    };
  }

  if (messageSplit.length !== 2) {
    return {
      valid: false,
      errorMessage: `Not enough or to many arguments for command ${message} !`
    }
  }

  const splitArgs = messageSplit[1].split('=')

  if (splitArgs.length !== 2) {
    return {
      valid: false,
      errorMessage: `Mal formatted args for command ${message} !`
    }
  }

  const arg = splitArgs[0];
  if (!VALID_ARG_PREFIX.includes(arg)) {
    return {
      valid: false,
      errorMessage: `Argument prefix ${arg} is not recognized ! Shoud be ${VALID_ARG_PREFIX.join(' or ')} !`
    }
  }

  let argument = {};

  if (arg === 'to') {
    argument.to = splitArgs[1];
  } else {
    argument.from = splitArgs[1];
  }

  return {
    valid: true,
    command: '!l-polygon' === commandPrefix ? 'listenPolygon' : 'listenBsc',
    description: '!l-polygon' === commandPrefix
        ? `Listening Polygon with param ${argument.to ? 'to=' + argument.to : 'from=' + argument.from}`
        : `Listening BSC with param ${argument.to ? 'to=' + argument.to : 'from=' + argument.from}`,
    argument: argument
  }
};
