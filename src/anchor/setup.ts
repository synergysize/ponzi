import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { IDL, DoubleSystem } from "./idl";
import { Connection, PublicKey } from "@solana/web3.js";
import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

const programId = new PublicKey("EaSeqPTvkvcxoF8W9BJ1taJp1kBPt3ZNzFnnF2qFDPoj"); 

export const rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_API_KEY}`;
export const connection = new Connection(rpcEndpoint);

// Initialize the program interface with the IDL, program ID, and connection.
// This setup allows us to interact with the on-chain program using the defined interface.
export const program = new Program<DoubleSystem>(IDL, programId, {
  connection,
});

// Derive a PDA for the counter account, using "counter" as the seed.
// We'll use this to update the counter on-chain.
export const [globalState] = PublicKey.findProgramAddressSync(
  [Buffer.from("GLOBAL_STATE_SEED")],
  program.programId
);

// Define a TypeScript type for the Counter data structure based on the IDL.
// This ensures type safety when interacting with the "counter" account, facilitating development and maintenance.
export type GlobalStateData = IdlAccounts<DoubleSystem>["globalState"];
export type TokenStateData = IdlAccounts<DoubleSystem>["tokenState"];
