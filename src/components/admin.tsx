import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { program } from "../anchor/setup";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import "../styles/admin.css";
import ContractState from "./state";

export default function Admin() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [_isLoading, setIsLoading] = useState(false);
  const [amount, setMaxAmount] = useState<number>(0);
  const [WithdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [owner, setOwnerAddress] = useState<string>("");
  const [doubleToken, setDoubleToken] = useState<string>("");
  const [initToken, setInitToken] = useState<string>("");
  const [currentOwner, setOwner] = useState<PublicKey>();
  const [flag, setFlag] = useState<boolean>(true);

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

      let transaction = new Transaction();

      try {
        await program.account.globalState.fetch(globalState);
      } catch (error) {
        const initTx = await program.methods
        .globalInitialize() // This takes no arguments so we don't need to pass anything
        .accounts({
          owner: publicKey,
          globalState,
          tokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .instruction();
        transaction = new Transaction().add(initTx);
      }

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
        .instruction();

      transaction.add(tokenInitTx);
      transaction.feePayer = publicKey;
      transaction.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;

      const transactionSignature = await sendTransaction(transaction, connection);
      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);
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

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);

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

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);

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

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);

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

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);

    } catch (error) {
      console.log(error);
    } 
  };

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

      console.log(`View on explorer: https://solana.fm/tx/${transactionSignature}?cluster=devnet-alpha`);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const getInitData = async() => {
      try {
        const [globalState] = await PublicKey.findProgramAddress(
          [
            Buffer.from("GLOBAL_STATE_SEED")
          ],
          program.programId
        );
        const globalStateData = await program.account.globalState.fetch(globalState);
        const owner = globalStateData.owner;
        setOwner(owner);
      } catch (error) {
        console.log(error);
        setFlag(false);
      }
    }
    getInitData()
  }, [])
  return (
    <div className="admin">
      {(currentOwner?.toBase58() == publicKey?.toBase58() || !flag) &&
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
      }
       {(currentOwner?.toBase58() == publicKey?.toBase58() || !flag) &&
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
      }

       {(currentOwner?.toBase58() == publicKey?.toBase58() || !flag) &&
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
      }

       {(currentOwner?.toBase58() == publicKey?.toBase58() || !flag) &&
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
      }

       {(currentOwner?.toBase58() == publicKey?.toBase58() || !flag) &&
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
      }

       {(currentOwner?.toBase58() == publicKey?.toBase58() || !flag) &&
        <div className="item">
          <button
            className="w-24"
            onClick={handlePonzify}
            disabled={!publicKey}
          >
            Toggle Ponzify
          </button>
        </div>
      }

       {(currentOwner?.toBase58() == publicKey?.toBase58() || !flag) &&<ContractState />}
    </div>
  );
}
