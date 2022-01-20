import './App.css';
import React, {Component} from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
// import { Unit } from '@harmony-js/utils';
// import { ChainID, ChainType } from '@harmony-js/utils';
// import { HttpProvider, Messenger } from '@harmony-js/network';
// import HDWalletProvider from '@truffle/hdwallet-provider';


import {BankProtocolContractAddr, MichaelCoinAddr} from './contractAssets/config'

import BankProtocol from './contractAssets/BankProtocol.json';
import MichaelCoin from './contractAssets/MichaelCoin.json';
// import { HarmonyExtension, Harmony } from '@harmony-js/core';

class App extends Component {

  state = {
    amount: 0,
    reward: 0,
    lastCalculated: 0,
    stakedBal: 0
  }
  
  componentDidMount = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    this.getCurrentReward(connection);
    this.stakedBalance(connection);
    this.contBalanceETH();
  }
  
  stakedBalance = async (connection) => {
    const provider = new ethers.providers.Web3Provider(connection);
    let contract = new ethers.Contract(BankProtocolContractAddr, BankProtocol.abi, provider);
    const eth = ethers.utils.formatUnits((await contract.stakingBalance(connection.selectedAddress)).toString(), 'ether');
    this.setState({stakedBal: eth});
  }

  contBalanceETH = async () => {
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    let contract = new ethers.Contract(BankProtocolContractAddr, BankProtocol.abi, provider);
    const contBal = ethers.utils.formatUnits((await contract.contBalance()).toString(), 'ether');
    this.setState({contBal: contBal});
  }

  getCurrentReward = async (connection) => {
    if (connection.selectedAddress) {
      const provider = new ethers.providers.Web3Provider(connection);
      /* next, create the item */
      let contract = new ethers.Contract(BankProtocolContractAddr, BankProtocol.abi, provider);
      const rewardBalance = await contract.rewardBalance(connection.selectedAddress);
      const lastCalculated = await contract.lastCalc(connection.selectedAddress);
      this.setState({reward: (rewardBalance/1000000000/1000000000000000000).toFixed(5), lastCalculated: (lastCalculated + "" === "0" ? "N/A" : (new Date(lastCalculated.toString() * 1000)).toString())})
    }
  }

  stake = async () => {
    if (!(parseFloat(this.state.amount) > 0)) return
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    /* next, create the item */
    let contract = new ethers.Contract(BankProtocolContractAddr, BankProtocol.abi, signer);
    const price = ethers.utils.parseUnits(this.state.amount.toString(), 'ether');
    let transaction = await contract.stakeTokens({value: price.toString(), gasLimit: 1000000});
    await transaction.wait();
    this.getCurrentReward(connection);
    this.stakedBalance(connection);
    this.contBalanceETH();
  }

  unstake = async () => {
    if (!(parseFloat(this.state.amount) > 0)) return
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    /* next, create the item */
    let contract = new ethers.Contract(BankProtocolContractAddr, BankProtocol.abi, signer);
    const price = ethers.utils.parseUnits(this.state.amount.toString(), 'ether');
    let transaction = await contract.unstakeTokens(price.toString(), {gasLimit: 1000000});
    await transaction.wait();
    this.getCurrentReward(connection);
    this.stakedBalance(connection);
    this.contBalanceETH();
  }

  calcReward = async () => {
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    /* next, create the item */
    let contract = new ethers.Contract(BankProtocolContractAddr, BankProtocol.abi, signer);
    const calcExecution = await contract.calculateReward(connection.selectedAddress, {gasLimit: 1000000});
    await calcExecution.wait();
    this.getCurrentReward(connection);
  }

  withdrawInterest = async () => {
    const web3Modal = new Web3Modal({});
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    let contract = new ethers.Contract(BankProtocolContractAddr, BankProtocol.abi, signer);
    const calcExecution = await contract.calculateReward(connection.selectedAddress)
    await calcExecution.wait();
    const rewardBalance = await contract.rewardBalance(connection.selectedAddress);
    const lastCalculated = await contract.lastCalc(connection.selectedAddress);
    this.setState({reward: (rewardBalance/1000000000/1000000000000000000).toFixed(5), lastCalculated: (lastCalculated + "" === "0" ? "N/A" : (new Date(lastCalculated.toString() * 1000)).toString())})
    const payout = await contract.withdrawRewardToken({gasLimit: 1000000})
    await payout.wait();
    this.getCurrentReward(connection);
    this.stakedBalance(connection);
  }

  render() {
    return (<div>
      <h2>Basic staking Dapp - <a href="https://github.com/MichaelC1999/staking-reward-token">GitHub Repo/Contract Info</a></h2>
      <p>This application is a minimalist approach to allowing users to lock in ETH to stake and receive interest in an ERC-20 token. As an example, in this case the reward token is MichaelCoin, my own ERC-20. Value locked in can be unstaked at any time.</p>
      <p>This is a concept Dapp that can be used for projects needing a transparent way to receive investment funding in return for tokens that will have use in the project. All contracts and transactions for this project are on the <b><i>RINKEBY TESTNET</i></b></p>
      <p>The interest rate is 9 tokens per ETH per year.</p>
      <p>The accumulated interest is calculated when a staking/unstaking action is taken or the user opts to calculate the current interest and provide gas to do so.</p>

      <input step="any" min="0" onChange={(e) => this.setState({...this.state, amount: e.target.value})} placeholder="Amount of ETH" type="number" style={{display: "block", margin: "1%", border: "red 1px solid"}} />
      <button onClick={() => this.stake()} style={{border: "red 1px solid", padding: "4px", width: "31%", margin: "1%"}}>STAKE ETH</button>
      <button onClick={() => this.unstake()} style={{border: "red 1px solid", padding: "4px", width: "31%", margin: "1%"}}>UNSTAKE ETH</button>
      <button onClick={() => this.calcReward()} style={{border: "red 1px solid", padding: "4px", width: "31%", margin: "1%"}}>CALCULATE CURRENT INTEREST</button>
      
      <h2>CURRENT STAKED BALANCE ---   {this.state.stakedBal ? this.state.stakedBal : "N/A"}</h2>
      <h2>REWARD AT LAST CALCULATION ---   {(this.state.reward ? this.state.reward : "N/A")}</h2>
      <h2>CALCULATED ON ---   {this.state.lastCalculated ? this.state.lastCalculated : "N/A"}</h2>

      <h2 onClick={() => this.contBalanceETH()}>TOTAL CONTRACT ETH BALANCE ---   {this.state.contBal ? this.state.contBal : "N/A"}</h2>
      <h2 onClick={() => this.withdrawInterest()}>WITHDRAW REWARD</h2>

    </div>)
  }
}

export default App;
