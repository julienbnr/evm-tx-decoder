
const extractParameters = () => {
  const params = {};
  process.argv.map(keyValue => {
    const splitArg = keyValue.split('=');
    if (splitArg && splitArg.length === 2) {
      const keyArg = splitArg[0].replace('--', '');
      params[keyArg] = splitArg[1];
    }
  });

  let hasErr = false;

  if (!params['chain']) {
    console.log('Missing argument: --chain');
    hasErr = true;
  }

  const to = params['to'];
  const from = params['from'];

  if (to && from) {
    console.log(`No parallel argument: Can't handle parallel params --to and --from !`);
    hasErr = true;
  }

  if (!to && !from) {
    console.log(`Missing argument: --to or --from params does not exist !`);
    hasErr = true;
  }

  if (hasErr) {
    process.exit();
  }

  const toOrFromParam = to ? `to: ${to}` : `from: ${from}`;
  console.log(`
    --- Params ---
    chain: ${params.chain}
    ${toOrFromParam}
  `);

  return params;
}

exports.extractParameters = extractParameters;
