const ethers = require('ethers');
const util = require('../util');

const SWAP_FUNCTION_NAMES = [
    'swapExactTokensForTokens',
    'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    'swapETHForExactTokens',
    'swapExactETHForTokensSupportingFeeOnTransferTokens',
    'swapExactTokensForETH',
    'swapExactTokensForETHSupportingFeeOnTransferTokens',
    'swapTokensForExactETH',
    'swapTokensForExactTokens',
    'swapExactETHForTokens'
];

const REMOVE_LIQUIDITY_FUNCTION_NAMES = [
    'removeLiquidity',
    'removeLiquidityWithPermit',
    'removeLiquidityETH',
    'removeLiquidityETHSupportingFeeOnTransferTokens',
    'removeLiquidityETHWithPermit',
    'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens'
];

const ADD_LIQUIDITY_FUNCTION_NAMES = [
    'addLiquidity',
    'addLiquidityETH'
];

const identifyTransactionAndGetMessage = async (decoded, provider) => {
  const functionName = decoded.name;

  if (SWAP_FUNCTION_NAMES.includes(functionName)) {
    return await getSwapMessage(decoded, provider);
  }

  if (REMOVE_LIQUIDITY_FUNCTION_NAMES.includes(functionName)) {
    return await getRemoveLiquidityMessage(decoded, provider);
  }

  if (ADD_LIQUIDITY_FUNCTION_NAMES.includes(functionName)) {
    return await getAddLiquidityMessage(decoded, provider);
  }

  return `Unhandled Router transaction`;
};

/**
 * Get the custom swap message.
 *
 * @param decoded the decoded data
 * @param provider the provider
 * @returns {Promise<string>}
 */
const getSwapMessage = async (decoded, provider) => {

  let msg;
  let tokenA;
  let tokenB;

  const functionName = decoded.name;

  let amount = formatEtherAmount(decoded.params[0].value);
  // const pathIndex = ['swapExactTokensForETH', 'swapExactTokensForETHSupportingFeeOnTransferTokens'].includes(functionName) ? 2 : 1;
  let path;


  if ('swapExactTokensForTokens' === functionName || 'swapExactTokensForTokensSupportingFeeOnTransferTokens' === functionName) {
    path = decoded.params[2].value;
    tokenA = util.getContract(path[0], provider);
    tokenB = util.getContract(path[path.length - 1], provider);
    msg = `Swap ${amount} $${await tokenA.symbol()} for ${await tokenB.symbol()}`;
  } else if ('swapETHForExactTokens' === functionName || 'swapExactETHForTokensSupportingFeeOnTransferTokens' === functionName
      || 'swapExactETHForTokens' === functionName) {
    path = decoded.params[1].value;
    tokenA = util.getContract(path[0], provider);
    tokenB = util.getContract(path[path.length - 1], provider);
    msg = `Swap $${await tokenA.symbol()} for ${amount} $${await tokenB.symbol()}`;
  } else if ('swapExactTokensForETH' === functionName || 'swapExactTokensForETHSupportingFeeOnTransferTokens' === functionName) {
    path = decoded.params[2].value;
    tokenA = util.getContract(path[0], provider);
    tokenB = util.getContract(path[path.length - 1], provider);
    msg = `Swap ${amount} $${await tokenA.symbol()} for $${await tokenB.symbol()}`;
  } else if ('swapTokensForExactETH' === functionName || 'swapTokensForExactTokens' === functionName) {
    path = decoded.params[2].value;
    tokenA = util.getContract(path[0], provider);
    tokenB = util.getContract(path[path.length - 1], provider);
    msg = `Swap $${await tokenA.symbol()} for ${amount} $${await tokenB.symbol()}`;
  }

  if (msg) {
    msg = `${msg}`;
  } else {
    msg = `Can't identify transaction ${decoded.name}`;
  }
  return msg;
};

/**
 * Get the custom remove liquidity message.
 *
 * @param decoded the decoded data
 * @param provider the provider
 * @returns {Promise<string>}
 */
const getRemoveLiquidityMessage = async (decoded, provider) => {

  let msg;
  let amount;
  let tokenA;
  let tokenB;

  if ('removeLiquidity' === decoded.name || 'removeLiquidityWithPermit' === decoded.name) {
    tokenA = util.getContract(decoded.params[0].value, provider);
    tokenB = util.getContract(decoded.params[1].value, provider);
    amount = ethers.utils.formatEther(decoded.params[2].value);
    msg = `Remove liquidity for ${amount} on pair ${await tokenA.symbol()}/${await tokenB.symbol()}`;
  } else if (['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens', 'removeLiquidityETHWithPermit',
    'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']) {
    tokenA = util.getContract(decoded.params[0].value, provider);
    amount = ethers.utils.formatEther(decoded.params[1].value);
    msg = `Remove liquidity for ${amount} on pair ETH/${await tokenA.symbol()}`;
  }

  if (msg) {
    msg = `${msg}`;
  } else {
    msg = `Can't identify transaction ${decoded.name}`;
  }

  return msg;
};

/**
 * Get the custom add liquidity message.
 *
 * @param decoded the decoded data
 * @param provider the provider
 * @returns {Promise<string>}
 */
const getAddLiquidityMessage = async (decoded, provider) => {

  let tokenA;
  let tokenB;
  let msg;

  const functionName = decoded.name;

  if ('addLiquidity' === functionName) {
    tokenA = util.getContract(decoded.params[0].value, provider);
    tokenB = util.getContract(decoded.params[1].value, provider);
    msg = `Add liquidity on pair ${await tokenA.symbol()}/${await tokenB.symbol()}`;
  } else if ('addLiquidityETH' === functionName) {
    tokenA = util.getContract(decoded.params[0].value, provider);
    msg = `Add liquidity on ETH address with token ${await tokenA.symbol()}`;
  }

  if (msg) {
    msg = `${msg}`;
  } else {
    msg = `Can't identify transaction ${decoded.name}`;
  }

  return msg;
};

const formatEtherAmount = (valueInGwei) => {
  return ethers.utils.formatEther(valueInGwei);
};

exports.identifyTransactionAndGetMessage = identifyTransactionAndGetMessage;
