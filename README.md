https://michaelc1999.github.io/staking-reward-token/

"Bank Protocol" contract (RINKEBY TESTNET) - The contract which handles staking/unstaking ETH, calculating/sending reward tokens.
<a href="https://rinkeby.etherscan.io/address/0x68e339E0d4F0F4CA94ccb42C4d44199A6543b51B">0x68e339E0d4F0F4CA94ccb42C4d44199A6543b51B<a>

"MichaelCoin" contract (RINKEBY TESTNET) - The contract for the ERC-20 token 'MichaelCoin' which is used as the project reward token.
<a href="https://rinkeby.etherscan.io/address/0xEde1c0B0F60acdd58Ac81ae8eb53DC320a252d65">0xEde1c0B0F60acdd58Ac81ae8eb53DC320a252d65<a>


This application is a minimalist approach to allowing users to lock in ETH to stake and receive interest in an ERC-20 token. As an example, in this case the reward token is MichaelCoin, my own ERC-20. Value locked in can be unstaked at any time.

This is a concept Dapp that can be used for projects needing a transparent way to receive investment funding in return for tokens that will have use in the project. All contracts and transactions for this project are on the RINKEBY TESTNET

The interest rate is 9 tokens per ETH per year.

The accumulated interest is calculated when a staking/unstaking action is taken or the user opts to calculate the current interest and provide gas to do so.