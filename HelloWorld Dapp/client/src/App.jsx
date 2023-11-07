import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { helloWorldContractAddress, helloWorldContractABI } from './HelloWorldContract';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [helloWorldContract, setHelloWorldContract] = useState(null);
  const [currentGreeting, setCurrentGreeting] = useState('');  // Holds the current greeting from the blockchain
  const [newGreeting, setNewGreeting] = useState('');  // Holds the new greeting to be sent to the blockchain
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);

        const accounts = await web3.eth.requestAccounts();
        setAccount(accounts[0]);

        const helloWorldInstance = new web3.eth.Contract(helloWorldContractABI, helloWorldContractAddress);
        setHelloWorldContract(helloWorldInstance);

        const greetingFromContract = await helloWorldInstance.methods.sayHello().call();
        setCurrentGreeting(greetingFromContract);
      } else {
        console.log('Ethereum object not found, install MetaMask.');
        alert('Ethereum object not found, install MetaMask.');
      }
    };

    loadBlockchainData();
  }, []);

  const updateGreeting = async () => {
    if (!helloWorldContract) return;

    helloWorldContract.methods.setGreeting(newGreeting).send({ from: account })
      .on('receipt', () => {
        setCurrentGreeting(newGreeting);  // Update the current greeting with the new one
        setNewGreeting('');  // Clear the input field after updating
      })
      .on('error', (error) => {
        console.error('Error updating greeting:', error);
        alert('Error updating greeting.');
      });
  };

  return (
    <div>
      <h1>Hello World DApp</h1>
      <p>Current Greeting: {currentGreeting}</p>
      <input
        type="text"
        value={newGreeting}
        onChange={(e) => setNewGreeting(e.target.value)}
        placeholder="Enter new greeting"
      />
      <button onClick={updateGreeting}>Update Greeting</button>
    </div>
  );
};

export default App;
