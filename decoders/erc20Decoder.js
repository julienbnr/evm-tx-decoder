const ethers = require('ethers');
const util = require('../util');

const identifyTransactionAndGetMessage = async (decoded, provider) => {
  const functionName = decoded.name;

  if ('approve' === functionName) {
    const address = decoded.params[0].value;
    const value = ethers.utils.formatEther(decoded.params[1].value);
    return `Approve ${address} to spend max ${value}`;
  } else if ('transfer' === functionName) {
    const address = decoded.params[0].value;
    const value = ethers.utils.formatEther(decoded.params[1].value);

    // Transfer to dead address (probably burn address)
    if (address.toLowerCase().includes('dead') || address.toLowerCase().includes('0000')) {
      return `Transfer ${value} to ${address} (Probably a burn transaction) !`;
    } else {
      return `Transfer ${value} to ${address}`;
    }
  } else if ('mint' === functionName) {
    // Two different mint function with not the same  args
    const nbParams = decoded.params.length;
    if (nbParams === 1) {
      const value = ethers.utils.formatEther(decoded.params[0].value);
      return `Mint ${value}`;
    } else {
      const token = util.getContract(decoded.params[0].value, provider);
      const value = ethers.utils.formatEther(decoded.params[1].value);
      return `Mint ${value} $${await token.symbol()}`;
    }
  }

  return `Unhandled ERC20 transaction`;
};

exports.identifyTransactionAndGetMessage = identifyTransactionAndGetMessage;
