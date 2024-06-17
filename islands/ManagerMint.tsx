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
    btn = <PlatformMintButton />;
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
