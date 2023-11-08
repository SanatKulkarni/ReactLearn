import React, { useState } from 'react';
import Web3 from 'web3';


const WalletConnect = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('');

  // Define Mumbai Testnet RPC URL
  const mumbaiTestnetRPC = "https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78";
  const web3 = new Web3(new Web3.providers.HttpProvider(mumbaiTestnetRPC));

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      try {
        const newAccounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        if (newAccounts.length > 0) {
          const address = newAccounts[0];
          setWalletAddress(address);

          // Fetching the balance from Mumbai Testnet
          const balanceWei = await web3.eth.getBalance(address);
          const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
          setBalance(balanceEther);
        } else {
          alert('No accounts found. Please connect to your wallet.');
        }
      } catch (error) {
        console.error("An error occurred: ", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div>
      <button onClick={connectWalletHandler}>
        {walletAddress ? (
          `${walletAddress.substring(0, 5)}... | Balance: ${parseFloat(balance).toFixed(4)} MATIC`
        ) : (
          "Connect Wallet"
        )}
      </button>
    </div>
  );
};

export default WalletConnect;
