import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractDetails';

const CrowdFundingComponent = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [image, setImage] = useState('');
  const [donateAmount, setDonateAmount] = useState('');

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);
          const contractAddress = CONTRACT_ADDRESS;
          const crowdFundingContract = new web3Instance.eth.Contract(CONTRACT_ABI, contractAddress);
          setContract(crowdFundingContract);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      } else {
        console.error('Please install MetaMask extension');
      }
    };

    initializeWeb3();
  }, []);

  const loadCampaigns = async () => {
    if (contract) {
      try {
        console.log('Title:', title);
        console.log('Description:', description);
        console.log('Target:', target);
        console.log('Deadline:', deadline);
        console.log('Image:', image);
        const numberOfCampaigns = await contract.methods.numberOfCampaigns().call();
        const allCampaigns = [];
        for (let i = 0; i < numberOfCampaigns; i++) {
          const campaign = await contract.methods.campaigns(i).call();
          allCampaigns.push(campaign);
        }
        setCampaigns(allCampaigns);
        
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
    }
  };

  const createCampaign = async () => {
    if (contract) {
      try {
        const formattedDeadline = Math.floor(new Date(deadline).getTime() / 1000); // Convert deadline to timestamp
        await contract.methods.createCampaign(accounts[0], title, description, target, formattedDeadline, image).send({ from: accounts[0] });
        loadCampaigns();
      } catch (error) {
        console.error('Error creating campaign:', error);
      }
    }
  };

  const donateToCampaign = async (id) => {
    if (contract && donateAmount) {
      try {
        await contract.methods.donateToCampaign(id).send({ from: accounts[0], value: web3.utils.toWei(donateAmount, 'ether') });
        loadCampaigns();
      } catch (error) {
        console.error('Error donating to campaign:', error);
      }
    }
  };

  return (
    <div>
      <button onClick={loadCampaigns}>Load Campaigns</button>
      <button onClick={createCampaign}>Create Campaign</button>
      <ul>
        {campaigns.map((campaign, index) => (
          <li key={index}>
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p>Target: {campaign.target}</p>
            <p>Deadline: {campaign.deadline}</p>
            <p>Amount Collected: {campaign.amountCollected}</p>
            <img src={campaign.image} alt={campaign.title} /> 
            <input
              type="number"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              placeholder="Enter donation amount"
            />
            <button onClick={() => donateToCampaign(index)}>Donate</button>
          </li>
        ))}
      </ul>
      <label>Title:</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <label>Description:</label>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <label>Target (in wei):</label>
      <input
        type="number"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <br />
      <label>Deadline (DD):</label>
      <input
      type="number"
      min="1"
      max="31"
      value={deadline}
      onChange={(e) => setDeadline(e.target.value)}
      />
      <br />
      <label>Image URL:</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <br />
    </div>
  );
};

export default CrowdFundingComponent;
