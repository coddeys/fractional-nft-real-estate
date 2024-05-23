import { useEffect, useState } from "preact/hooks";
import { Blockfrost, Constr, Data, fromText, Lucid } from "lucid-cardano";
import {
  AppliedValidators,
  applyParams,
  LocalCache,
  Validators,
} from "../utils.ts";

export interface AppProps {
  blockfrost: string;
  validators: Validators;
}

function useLucid(blockfrost: string) {
  const [lucid, setLucid] = useState<Lucid | null>(null);
  const setupLucid = async () => {
    const lucid = await Lucid.new(
      new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0",
        blockfrost,
      ),
      "Preview",
    );

    setLucid(lucid);
  };

  return { lucid, setupLucid };
}

export default function PlatformMint(props: AppProps) {
  const { lucid, setupLucid } = useLucid(props.blockfrost);
  const [waitingTx, setWaitingTx] = useState<boolean>(false);
  const [policyId, setPolicyId] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const tokenName = "EstateClub";

  const mintPlatformNFT = async () => {
    try {
      setWaitingTx(true);

      const lovelace = Number(5) * 1000000;
      const mintRedeemer = Data.to(new Constr(0, []));

      const utxos = await lucid?.wallet.getUtxos()!;
      const utxo = utxos[0];
      const outputReference = {
        txHash: utxo.txHash,
        outputIndex: utxo.outputIndex,
      };

      const contract = applyParams(
        tokenName,
        outputReference,
        props.validators,
        lucid!,
      );

      const assetName = `${contract!.policyId}${fromText(tokenName)}`;

      const wAddr = await lucid.wallet.address();

      const tx = await lucid!
        .newTx()
        .collectFrom([utxo])
        .attachMintingPolicy(contract!.platformNFT)
        .mintAssets(
          { [assetName]: BigInt(1) },
          mintRedeemer,
        )
        .payToAddress(
          wAddr,
          { lovelace: BigInt(lovelace) },
        )
        .complete();

      const signedx = await tx.sign().complete();
      const txHash = await signedx.submit();
      const success = await lucid!.awaitTx(txHash);

      if (success) {
        setWaitingTx(false);
        setPolicyId(contract!.policyId);
        setTxHash(txHash);
      }
    } catch (error) {
      setWaitingTx(false);
      console.error("error", error);
    }
  };

  useEffect(() => {
    if (lucid) {
      window.cardano
        .nami
        .enable()
        .then((wallet) => {
          lucid.selectWallet(wallet);
        });
    }
  }, [lucid]);

  let btn;
  if (lucid) {
    btn = <PlatformMintButton onClick={mintPlatformNFT} />;
  } else {
    btn = <SetupLucidButton onClick={setupLucid} isLoading={waitingTx} />;
  }

  let txInfo;
  if (txHash) {
    txInfo = <TxInfo txHash={txHash} policyId={policyId} />;
  }

  let loading;
  if (waitingTx) {
    loading = <Loading />;
  }

  return (
    <div>
      {btn}
      {loading}
      {txInfo}
    </div>
  );
}

function Loading(props) {
  return (
    <div class="my-8">
      <span className="loading loading-lg text-primary loading-spinner"></span>
    </div>
  );
}
function TxInfo(props) {
  return (
    <div className="">
      <ul>
        <li>Policy ID: {props.policyId}</li>
        <li>Transactions Hash: {props.txHash}</li>
      </ul>
    </div>
  );
}
function SetupLucidButton(props) {
  return (
    <button
      class="btn btn-primary"
      onClick={props.onClick}
    >
      Setup Lucid
    </button>
  );
}

function PlatformMintButton(props) {
  return (
    <button
      class="btn btn-primary"
      onClick={props.onClick}
    >
      Mint
    </button>
  );
}
