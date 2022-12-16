import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Contract, providers, utils } from 'ethers';
import Web3Modal from "web3modal";
import React, {useEffect, useRef, useState } from "react";
import { NFT_CONTRACT_ADDRESS, abi } from '../constants';
import { walletconnect } from 'web3modal/dist/providers/connectors';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner,setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMInted] = useState("0");
  const [presaleStated, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const web3ModalRef :any = useRef();

    const presaleMint = async () => {
      try {
        const signer = await getProviderOrSigner(true);
        const nftContract = new Contract (NFT_CONTRACT_ADDRESS,abi, signer);
        const tx = await nftContract.presaleMint({
            valeu: utils.parseEther("0.01"),
        });
        setLoading(true);
        await tx.wait();
        setLoading(false);
        window.alert("You successfully minted a Crypto Dev!");
      }catch (err) {
        console.error(err);
      }
    };

    const publicMint = async () => {
      try { 
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await nftContract.mint({
        value:utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    }catch (err) {
      console.error(err);
    }
  };
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    }catch (err) {
      console.error(err);
    }
  };

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract (NFT_CONTRACT_ADDRESS,abi, signer);
      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await checkIfPresaleStarted();
    }catch (err) {
      console.error(err);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    }catch (err) {
      console.error(err);
      return false;
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract (NFT_CONTRACT_ADDRESS, abi, provider);
      const _presaleEnded = await nftContract.presaleEnded();
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now()/1000));
      if(hasEnded) {
        setPresaleEnded(true);
      }else{
        setPresaleEnded(false);
      }
      return hasEnded;
    }catch (err) {
      console.error(err);
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _owner = await nftContract.owner();
      const signer :any = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }    
    }catch (err:any) {
      console.error (err.message);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIds = await nftContract.tokenIds();
      setTokenIdsMInted(_tokenIds.toString());
    }catch (err) {
      console.error(err);
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();
    if(chainId !==5) {
      window.alert("Change the network to Goerli");
      throw new Error ("Change network to Goerli")
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect (() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network:"goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      const _presaleStarted :any = checkIfPresaleStarted();
      if (_presaleStarted){
        checkIfPresaleEnded();
      }
      getTokenIdsMinted();
      const presaleEndedInterval = setInterval(async function() {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if(_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      },5 * 1000);
      setInterval(async function () {
        await getTokenIdsMinted();  
      },5 * 1000);
    }
  },[walletConnected]);

    const renderButton = () => {
      if (!walletConnected) {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet 
          </button>
        );
      }
      if (loading) {
        return <button className={styles.button}>
          Loading....
      </button>;
      }
      if (isOwner && !presaleStated) {
        return (
          <button className={styles.button} onClick={startPresale} >
            Start Presale!
          </button>
        );
      }
      if (presaleStated && !presaleEnded) {
        return (
          <div>
            <div className={styles.description}>
              Presale has Started!!! If your address is whitelisted, Mint a Crypto Dev 🥳
            </div>
            <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
            </button>
          </div>
        );
      }
      if(presaleStated && presaleEnded) {
        return (
          <button className={styles.button} onClick={publicMint}>
              Public Mint 🚀
           </button>
        );
      }
     };

    return (
      <div>
        <Head>
          <title>Crypto Devs</title>
          <meta name="Description" content="Whitelist-Dapp"/>
          <link rel="icon" href="/favicon.ico"/>
        </Head>
        <div className={styles.main}>
          <div>
            <h1 className={styles.title}>Welcome to Crypto Dev!</h1>
            <div className={styles.description }>
              Its an NFT collection for developers in Crypto.
            </div>
            <div className={styles.description}>
              {tokenIdsMinted}/20 have been minted
            </div>
            {renderButton()}
          </div>
          <div>
            <img className={styles.image}  src="../0.svg" />
          </div>
          </div>
          <footer className={styles.footer}>
            Made with &#10084; by Crypto Devs
          </footer>
      </div>
    );
}
