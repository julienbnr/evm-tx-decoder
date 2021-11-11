## EVM Transaction decoder

This script is a simple decoder for EVM transaction.

The bot captures real-time transaction from or to a specific address
and interprets it into a human-readable message.

You can setup the bot :
- Locally: Execute the shell script using ``./run.sh``
- Using Discord: Yes, there's a discord integration :)
  Just authenticate the bot to discord using the portal.
  Once done, you can enter the following commands
    - ``!l-polygon`` listen Polygon transactions
    - ``!l-bsc`` listen BSC transactions
    - ``!l-close`` Close current configuration/listener
    - ``!l-config`` Get the current configuration/listener

You must use ``!l-bsc`` and ``!l-polygon`` with from or to arguments, like
``!l-bsc from=0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff`` (listen transaction
from address 0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff)
