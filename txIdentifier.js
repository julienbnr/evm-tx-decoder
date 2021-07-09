/** Imported ABIs */
const MASTER_CHEF_ABI = require('./json/abis/masterChefABI.json');
const REFERRAL_ABI = require('./json/abis/referralABI.json');
const ROUTER_ABI = require('./json/abis/routerABI.json');
const TIME_LOCK_ABI = require('./json/abis/timeLockABI.json');
const ERC20_ABI = require('./json/abis/erc20ABI.json');

/** Decoder scripts */
const routerCustomDecoder = require('./decoders/routerDecoder');
const masterChefCustomDecoder = require('./decoders/masterChefDecoder');
const timeLockCustomDecoder = require('./decoders/timeLockDecoder');
const referralCustomDecoder = require('./decoders/referralDecoded');
const erc20CustomDecoder = require('./decoders/erc20Decoder');

const identifyTransactionByMethodIdAndGetPersonalizedMessage = async (data, decoded, provider) => {

  const functionName = decoded.name;

  const routerFunctionNameList = getAbiFunctionNameList(ROUTER_ABI);
  const masterChefFunctionNameList = getAbiFunctionNameList(MASTER_CHEF_ABI);
  const timeLockFunctionNameList = getAbiFunctionNameList(TIME_LOCK_ABI);
  const referralFunctionNameList = getAbiFunctionNameList(REFERRAL_ABI);
  const erc20FunctionNameList = getAbiFunctionNameList(ERC20_ABI);


  // Router function
  if (functionNameInArray(functionName, routerFunctionNameList)) {
    return await routerCustomDecoder.identifyTransactionAndGetMessage(decoded, provider);
  }

  // MasterChef function
  if (functionNameInArray(functionName, masterChefFunctionNameList)) {
    return await masterChefCustomDecoder.identifyTransactionAndGetMessage(decoded, provider);
  }

  // TimeLock function
  if (functionNameInArray(functionName, timeLockFunctionNameList)) {
    return await timeLockCustomDecoder.identifyTransactionAndGetMessage(decoded, provider);
  }

  // Referral function
  if (functionNameInArray(functionName, referralFunctionNameList)) {
    return await referralCustomDecoder.identifyTransactionAndGetMessage(decoded, provider);
  }

  // ERC20 function
  if (functionNameInArray(functionName, erc20FunctionNameList)) {
    return await erc20CustomDecoder.identifyTransactionAndGetMessage(decoded, provider);
  }

  // Cannot identify transaction for custom message
  return undefined;
};

/**
 * Get the ABI
 *
 * @param abi the ABI array
 * @returns array of function name
 */
const getAbiFunctionNameList = (abi) => {
  if (abi && abi.length > 0) {
    return abi
      .filter(abiEntry => abiEntry.type === 'function')
      .map(abiEntry => abiEntry.name);
  }
}

const functionNameInArray = (functionName, functionNameList) => {
  return functionNameList.includes(functionName);
};

exports.identifyTransactionByMethodIdAndGetPersonalizedMessage = identifyTransactionByMethodIdAndGetPersonalizedMessage;
