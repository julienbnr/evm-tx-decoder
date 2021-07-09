const ethers = require('ethers');
const abiDecoder = require('abi-decoder');
const ERC20ABI = require('./json/abis/erc20ABI.json');

const globalAbi = require('./globalAbi');

abiDecoder.addABI(globalAbi.GLOBAL_ABI);

const txIdentifier = require('./txIdentifier');

const getMessage = async (decodingLevel, receipt, provider) => {
  let bodyMsg = '';

  const decoded = abiDecoder.decodeMethod(receipt.data);

  // If no data
  if (!receipt.data || receipt.data === '0x' || !decoded) {
   bodyMsg = `${bodyMsg}Unable to identify the transaction !\n`;
  }

  switch (decodingLevel) {
    case 'dev':
      const params = decoded.params.map(param => param.name).join(', ');
      const values = decoded.params.map(param => param.value).join(', ');
      const fullMessage = `${decoded.name}(${params}) = ${values}`;
      bodyMsg = `${bodyMsg}${fullMessage}\n`;
      break;
    case 'custom':
      bodyMsg = await txIdentifier
        .identifyTransactionByMethodIdAndGetPersonalizedMessage(receipt.data, decoded, provider);
      break;
    default:
      bodyMsg = `${bodyMsg}${decoded.name}\n`;
      break;
  }

  return `${bodyMsg}\n`;
};

const getContract = (address, provider) => {
  return new ethers.Contract(address, ERC20ABI, provider)
};

const getERC20Symbol = async (address, provider) => {
  const contract = new ethers.Contract(address, ERC20ABI, provider);
  return await contract.symbol();
};

exports.getMessage = getMessage;
exports.getContract = getContract;
exports.getERC20Symbol = getERC20Symbol;
