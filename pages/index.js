// 202111019@fit.edu.ph

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState("");
  const [confirmedAmount, setConfirmedAmount] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const confirmAmount = async () => {
    setErrorMessage(""); 
    if (atm && amount > 0) {
      try {
        let tx = await atm.confirmAmount(parseInt(amount));
        await tx.wait();
        setConfirmedAmount(amount); 
      } catch (error) {
        setErrorMessage("An error occurred during confirmation.");
      }
    } else {
      alert("Please enter a valid non-negative amount to confirm.");
    }
  };

  const deposit = async () => {
    setErrorMessage("");
    if (atm && confirmedAmount > 0) {
      try {
        let tx = await atm.deposit();
        await tx.wait();
        getBalance();
        setConfirmedAmount(null);
      } catch (error) {
        setErrorMessage("An error occurred during deposit.");
      }
    } else {
      alert("Please confirm an amount before depositing.");
    }
  };

  const withdraw = async () => {
    setErrorMessage("");
    if (atm && confirmedAmount > 0) {
      try {
        let tx = await atm.withdraw();
        await tx.wait();
        getBalance();
        setConfirmedAmount(null);
      } catch (error) {
        if (error.reason && error.reason.includes("InsufficientBalance")) {
          setErrorMessage("You cannot withdraw more than your current balance.");
        } else {
          setErrorMessage("An error occurred during withdrawal.");
        }
      }
    } else {
      alert("Please confirm an amount before withdrawing.");
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your MetaMask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={confirmAmount}>Confirm</button>
        {confirmedAmount && <p>Confirmed Amount: {confirmedAmount}</p>}
        <button onClick={deposit} disabled={!confirmedAmount}>
          Deposit
        </button>
        <button onClick={withdraw} disabled={!confirmedAmount}>
          Withdraw
        </button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Project Function Frontend Assessment Submission! - Modified ATM Template</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        input {
          margin: 10px;
          padding: 5px;
          font-size: 1rem;
        }
        button {
          margin: 5px;
          padding: 10px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
        p {
          font-size: 1rem;
        }
      `}</style>
    </main>
  );
}
