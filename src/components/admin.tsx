import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { program } from "../anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import "../styles/admin.css";
import ContractState from "./state";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { connection } from "../anchor/setup";
export default function Admin() {
  const { publicKey, sendTransaction } = useWallet();
  const [_isLoading, setIsLoading] = useState(false);
  const [amount, setMaxAmount] = useState<number>(0);
  const [WithdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [owner, setOwnerAddress] = useState<string>("");
  const [doubleToken, setDoubleToken] = useState<string>("");
  const [initToken, setInitToken] = useState<string>("");

  const handleDepositAmount = (e: any) => {
    setMaxAmount(Number(e.target.value));
  }
  const handleWithdrawAmount = (e: any) => {
    setWithdrawAmount(Number(e.target.value));
  }

  const handleInitTokenAddress = (e: any) => {
    setInitToken(e.target.value);
  }
  
  const handleDoubleTokenAddress = (e: any) => {
    setDoubleToken(e.target.value);
  }

  const handleOwnerDepositAmount = (e: any) => {
    setDepositAmount(Number(e.target.value));
  }

  const handleInit = async() => {
    try {
      if (!publicKey) return;
      // Create a transaction to invoke the increment function 
      const tokenMint = new PublicKey(initToken); // replace this token address with another as you want
      const [globalState, _globalStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("GLOBAL_STATE_SEED")
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

      const [tokenVaultAccount, _tokenVaultAccountBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("TOKEN_VAULT_SEED"),
          tokenMint.toBuffer()
        ],
        program.programId
      );
 

      const initTx = await program.methods
        .globalInitialize() // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState,
          tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .transaction();

      const initTxSignature = await sendTransaction(initTx, connection);
      console.log(`View on explorer: https://solana.fm/tx/${initTxSignature}?cluster=mainnet-alpha`);
    
      const tokenInitTx = await program.methods
        .tokenInitialize() // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState,
          tokenState,
          tokenMint,
          tokenVaultAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .transaction();


      const transactionSignature = await sendTransaction(tokenInitTx, connection);
      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);
    } catch (error) {
      console.log(error);
    }
  }

  const handleMaxAmount = async () => {
    if (!publicKey) return;

    setIsLoading(true);

    try {
      // Create a transaction to invoke the increment function 
      const [globalState, _globalStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("GLOBAL_STATE_SEED")
        ],
        program.programId
      );

      const globalStateData = await program.account.globalState.fetch(globalState);
      const tokenMint = globalStateData.currentDoubleToken;

      const [tokenState, _tokenStateBump] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from("TOKEN_STATE_SEED"),
          tokenMint.toBuffer()
        ],
        program.programId
      );
      
      const transaction = await program.methods
        .setMaxAmount(new BN(amount * 10 ** 6)) // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState,
          tokenState,
          tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);

    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePonzify = async () => {
    if (!publicKey) return;

    try {
      // Create a transaction to invoke the increment function 
      const [globalState, _globalStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("GLOBAL_STATE_SEED")
        ],
        program.programId
      );
      const globalStateData = await program.account.globalState.fetch(globalState);
      const tokenMint = globalStateData.currentDoubleToken;

      const [tokenState, _tokenStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("TOKEN_STATE_SEED"),
          tokenMint.toBuffer()
        ],
        program.programId
      );
      const tokenStateData = await program.account.tokenState.fetch(tokenState);

      const currentPonzify = tokenStateData.ponzify;

      const transaction = await program.methods
        .setPonzify(!currentPonzify) // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState,
          tokenState,
          tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);

    } catch (error) {
      console.log(error);
    } 
  };

  const handleDoubleToken = async () => {
    if (!publicKey) return;

    try {
      if(!doubleToken) return;
      // Create a transaction to invoke the increment function 
      const [globalState, _globalStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("GLOBAL_STATE_SEED")
        ],
        program.programId
      );
      const newToken = new PublicKey(doubleToken); // use your token address
      const [tokenState, _tokenStateBump] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from("TOKEN_STATE_SEED"),
          newToken.toBuffer()
        ],
        program.programId
      );

      const [tokenVaultAccount, _tokenVaultAccountBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("TOKEN_VAULT_SEED"),
          newToken.toBuffer()
        ],
        program.programId
      );
 

      const transaction = await program.methods
        .setDoubleToken(newToken) // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);

      const tokenInitializetransaction = await program.methods
        .tokenInitialize() // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState,
          tokenState,
          tokenMint: newToken,
          tokenVaultAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .transaction();

      const tokenInitializeSignature = await sendTransaction(
        tokenInitializetransaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${tokenInitializeSignature}?cluster=mainnet-alpha`);
    } catch (error) {
      console.log(error);
    } 
  };

  const handleTransferOwnerShip = async () => {
    if (!publicKey) return;

    try {
      // Create a transaction to invoke the increment function 
      const [globalState, _globalStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("GLOBAL_STATE_SEED")
        ],
        program.programId
      );
      const newOwner = new PublicKey(owner);


      const transaction = await program.methods
        .transferOwnership(newOwner) // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState
        })
        .transaction();

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);

    } catch (error) {
      console.log(error);
    } 
  };

  const handleDepositToken = async() => {
    if (!publicKey) return;

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

      const userTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        publicKey
      );

      const transaction = await program.methods
      .ownerDeposit(new BN(depositAmount * 10 ** 6))
      .accounts({
        owner: publicKey,
        globalState,
        tokenState,
        tokenMint,
        tokenAccount: userTokenAccount,
        tokenVaultAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
      
      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);
    } catch (error) {
      console.log(error);
    }
  }

  const handleWithdrawToken = async() => {
    try {
      if(!publicKey) return;
      const [globalState, _globalStateBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("GLOBAL_STATE_SEED")
        ],
        program.programId
      );

      const globalStateData = await program.account.globalState.fetch(globalState);
      const tokenMint = globalStateData.currentDoubleToken;
      const owner = globalStateData.owner;

      const [tokenState, _tokenStateBump] = await PublicKey.findProgramAddressSync(
        [
          Buffer.from("TOKEN_STATE_SEED"),
          tokenMint.toBuffer()
        ],
        program.programId
      );

      const tokenOwnerAccount = await getAssociatedTokenAddress(
        tokenMint,
        owner
      );

      const [tokenVaultAccount, _tokenVaultAccountBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("TOKEN_VAULT_SEED"),
          tokenMint.toBuffer()
        ],
        program.programId
      );


      const withdrawAmount = new BN(WithdrawAmount * 10 ** 6);
      
      const transaction = await program.methods
        .withdrawToken(withdrawAmount) // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: owner,
          globalState,
          tokenState,
          tokenMint,
          tokenOwnerAccount,
          tokenVaultAccount,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .transaction();

      transaction.feePayer = publicKey;
      transaction.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;
      const result = await connection.simulateTransaction(transaction);
      console.log(result);

      const transactionSignature = await sendTransaction(
        transaction,
        connection
      );

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=mainnet-alpha`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <WalletMultiButton/>
      <div className="admin">
        <div className="item">
            <button
              className="w-24"
              onClick={handleInit}
              disabled={!publicKey}
            >
              Initialize the contract
            </button>
            <input type="text" onChange={(e) => handleInitTokenAddress(e)} placeholder="Token Mint Address"/>
        </div>
        <div className="item">
          <button
            className="w-24"
            onClick={handleMaxAmount}
            disabled={!publicKey}
          >
            Set Max Amount
          </button>
          <input type="number" min={0} onChange={(e) => handleDepositAmount(e)} placeholder="Max Amount"/>
        </div>
        <div className="item">
          <button
            className="w-24"
            onClick={handleTransferOwnerShip}
            disabled={!publicKey}
          >
            Transfer Ownership
          </button>
          <input type="text" onChange={(e) => setOwnerAddress(e.target.value)} placeholder="Transfer Ownership"/>
        </div>
        <div className="item">
          <button
            className="w-24"
            onClick={handleDepositToken}
            disabled={!publicKey}
          >
            Deposit
          </button>
          <input type="number" min={0} onChange={(e) => handleOwnerDepositAmount(e)} placeholder="Owner Deposit Amount"/>
        </div>
        <div className="item">
          <button
            className="w-24"
            onClick={handleWithdrawToken}
            disabled={!publicKey}
          >
            Withdraw
          </button>
          <input type="number" min={0} onChange={(e) => handleWithdrawAmount(e)} placeholder="Withdraw Amount"/>
        </div>
        <div className="item">
          <button
            className="w-24"
            onClick={handleDoubleToken}
            disabled={!publicKey}
          >
            Set CA
          </button>
          <input type="text" onChange={(e) => handleDoubleTokenAddress(e)} placeholder="Token Mint Address"/>
        </div>
        <div className="item">
          <button
            className="w-24"
            onClick={handlePonzify}
            disabled={!publicKey}
          >
            Toggle Ponzify
          </button>
        </div>
        <ContractState />
      </div>
    </>
   
  );
}
