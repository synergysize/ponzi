import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "../anchor/setup";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import banner from "../images/banner.png";
import line from "../images/line.png";
import ponzi from "../images/ponzi.png";
import Admin  from "./admin";

import "../styles/deposit.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Deposit() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setDepositAmount] = useState(0);

  const handleDepositAmount = (e: any) => {
    setDepositAmount(Number(e.target.value));
    console.log(Number(e.target.value));
  }
  const onClick = async () => {
    if (!publicKey) return;

    setIsLoading(true);

    try {
      const [globalState, _globalStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("GLOBAL_STATE_SEED")
        ],
        program.programId
      );

      const globalStateData = await program.account.globalState.fetch(globalState);
      const tokenMint = globalStateData.currentDoubleToken;

      const [tokenVaultAccount, _tokenVaultAccountBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("TOKEN_VAULT_SEED"),
          tokenMint.toBuffer()
        ],
        program.programId
      );

      const [tokenState, _tokenStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("TOKEN_STATE_SEED"),
          tokenMint.toBuffer()
        ],
        program.programId
      );
      const tokenStateData = await program.account.tokenState.fetch(tokenState);
      console.log("tokenStateData->", tokenStateData.records);

      const tokenAmount = amount * 10 ** 6; // decimal 6
      const userTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );
      let receiver = null;
      let receiverTokenAccount = null;

      const records = tokenStateData.records;
      if(records.length > 0) {
        const contractAmount = Number(tokenStateData.tokenAmount) + tokenAmount;
        if(contractAmount > records[0].amount * 2) {
          receiver = records[0].address;
          receiverTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            receiver
          );
        } else {
          receiver = publicKey;
          receiverTokenAccount = userTokenAccount;
        }
      } else {
        receiver = publicKey;
        receiverTokenAccount = userTokenAccount;
      }

      const transaction = await program.methods
      .deposit(new BN(tokenAmount))
      .accounts({
        user: publicKey,
        globalState,
        tokenState,
        receiver,
        tokenMint,
        tokenAccount: userTokenAccount,
        receiverTokenAccount,
        tokenVaultAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
      
      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);

    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Admin />
      <div className="banner">
        <img src={banner}/>
      </div>
      <div className="line">
        <img src={line}/>
      </div>
      <div className="content-header">
        <p>
          <strong>Ponzinomics</strong> is a token doubling program launched on Solana as an homage to the legendary pioneer and visionary of finance, Charles Ponzi. Without his work, cryptocurrency wouldn’t exist. 
          He is the Emperor of Early Entry, the Monarch of Market Momentum, and the Grandfather of Groundfloor Gains.
        </p>
      </div>
      <div className="line">
        <img src={line}/>
      </div>
      <div className="content-body">
        <div>
          <img src={ponzi}/>
        </div>
        <div>
          <strong>Ponzinomics</strong> works by sending you the tokens of those who deposit after you.
          <p>
            Simply deposit tokens <span style={{color:"blue"}}>(Up to 1,000,000)</span> and you'll receive double the amount in return.
          </p>
        </div>
      </div>

      <div className="content-contract">
        <div className="content-wallet">
          <WalletMultiButton />
        </div>
        <div className="content-deposit">
          <div
            onClick={onClick}
          >
            {isLoading ? "Loading" : "Deposit"}
          </div>
        </div>

        <div className="content-amount">
          <input type="number" min={0} onChange={(e) => handleDepositAmount(e)} placeholder="# of Tokens"/>
        </div>
        
      </div>
      <div className="warning">
        Please note: It is always advisable to use a fresh wallet when connecting to unknown sources.
      </div>
      <div className="line">
        <img src={line}/>
      </div>
      <div className="bottom">
        "I gave the people what they wanted. I gave them the dream".
      </div>
      <div className="line" style={{marginBottom: "30px"}}>
        <img src={line}/>
      </div>
    </div>
  );
}
