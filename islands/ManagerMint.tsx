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
  policyId?: string;
  asset?: string;
  price: number; // ada price
  size: number; // square decimeter
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
  const [price, setPrice] = useState<number | undefined>(500000); // ada
  const [size, setSize] = useState<number | undefined>(10000); // square decimeters
  const { lucid, setupLucid } = useLucid(props.blockfrost);
  const [waitingTx, setWaitingTx] = useState<boolean>(false);
  const [policyId, setPolicyId] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

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

  let warning;
  if (!props.asset && !props.policyId) {
    warning = <Warning />;
  }

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
      {warning}
      <div className="">
        <ul>
          <li>Price: {price}</li>
          <li>Size: {size}</li>
        </ul>
      </div>
      {btn}
      {loading}
      {txInfo}
    </div>
  );
}

function Warning(props) {
  return (
    <div class="my-8">
      <div role="alert" className="alert alert-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>Warning: Please mint and set up the Platform NFT first!</span>
      </div>
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
