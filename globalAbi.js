const ROUTER_ABI = require('./json/abis/routerABI.json');
const ERC_20_ABI = require('./json/abis/erc20ABI.json');
const MASTER_CHEF_ABI = require('./json/abis/masterChefABI.json');
const TIME_LOCK_ABI = require('./json/abis/timeLockABI.json');
const REFERRAL_ABI = require('./json/abis/referralABI.json');

const GLOBAL_ABI = ROUTER_ABI
  .concat(ERC_20_ABI)
  .concat(MASTER_CHEF_ABI)
  .concat(TIME_LOCK_ABI)
  .concat(REFERRAL_ABI);

exports.GLOBAL_ABI = GLOBAL_ABI;
