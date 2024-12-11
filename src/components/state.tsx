import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { program, globalState, GlobalStateData, TokenStateData } from "../anchor/setup";
import { PublicKey } from "@solana/web3.js";

export default function ContractState() {
  const { connection } = useConnection();
  const [globalStateData, setGlobalStateData] = useState<GlobalStateData | null>(null);
  const [tokenStateData, setTokenStateData] = useState<TokenStateData | null>(null);

  useEffect(() => {
    // Fetch initial account data
    program.account.globalState.fetch(globalState).then((data) => {
      setGlobalStateData(data);
    });

    // Subscribe to account change
    const subscriptionId = connection.onAccountChange(
      globalState,
      (accountInfo) => {
        setGlobalStateData(
          program.coder.accounts.decode("globalState", accountInfo.data)
        );
      }
    );

    return () => {
      // Unsubscribe from account change
      connection.removeAccountChangeListener(subscriptionId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  useEffect(() => {
    const getTokenStateData = async() => {
      if(!globalStateData) return;

      const currentTokenAddress = globalStateData.currentDoubleToken;
      const [tokenState] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("TOKEN_STATE_SEED"),
          currentTokenAddress.toBuffer()
        ],
        program.programId
      );

      const data = await program.account.tokenState.fetch(tokenState);
      if(data) setTokenStateData(data);
    }
    if(globalStateData) {
      getTokenStateData()
    }
  }, [globalStateData])

  return(
    <div style={{"display":"flex", "flexDirection":"column","textAlign":"left"}}>
      <p className="text-lg">Token Mint: {globalStateData?.currentDoubleToken?.toString() || "The contract has not been initialized yet."}</p>
      <p className="text-lg">Current Token Amount on Pool: {tokenStateData?.tokenAmount / 1000000 || "The contract has not been initialized yet."}</p>

      <p className="text-lg">Token Max Amount: {(tokenStateData?.maxAmount/ 10 ** 6).toString()}</p>
      <p className="text-lg">Current Ponzify: {(tokenStateData?.ponzify ? 'Ture': 'False')}</p>
      <p className="text-lg">Current Owner: {globalStateData?.owner?.toString() || "The contract has not been initialized yet."}</p>
    </div>
  ) 
}
