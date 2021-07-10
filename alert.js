const handleAlert = (msg, alertConfig) => {
  console.log(msg);
  if (alertConfig.type === 'discord') {
    alertConfig.channel.send(msg);
  } else if (alertConfig.type === 'webhook') {
    // handle webhook
  } else if (alertConfig.onlocalcandidate === 'local') {
    console.log(msg);
  }
};

exports.handleAlert = handleAlert;
