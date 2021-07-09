const util = require('../util');

const identifyTransactionAndGetMessage = async (decoded, provider) => {

  const functionName = decoded.name;

  if ('transferOwnership' === functionName) {
    const address = decoded.params[0].value;
    return `Ownership transfer to new owner with address ${address}`;
  } else if ('add' === functionName) {
    const address = decoded.params[1].value;
    const lpContract = util.getContract(address, provider);
    return `Add new LP tokens to the MasterChef ! LP Pair is ${await lpContract.name()} at address ${address}`;
  }

  return 'Unhandled MasterChef transaction';
};

exports.identifyTransactionAndGetMessage = identifyTransactionAndGetMessage;
