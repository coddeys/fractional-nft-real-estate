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
  const [amount, setAmount] = useState<number>(100);
  const [bids, setBids] = useState<Bid[]>([]);
  const { lucid, setupLucid } = useLucid(props.blockfrost);
  const [waitingTx, setWaitingTx] = useState<boolean>(false);
  const [policyId, setPolicyId] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const tokenName = "EstateClub";

  const updateAmount = (e) => setAmount(e.currentTarget.value);

  const invest = async (bid, amount) => {
    try {
      setWaitingTx(true);

      console.log("Hello");
      console.log(bid);
      // const lovelace = Number(5) * 1000000;
      // const mintRedeemer = Data.to(new Constr(0, []));

      // const utxos = await lucid?.wallet.getUtxos()!;
      // const utxo = utxos[0];
      // const outputReference = {
      //   txHash: utxo.txHash,
      //   outputIndex: utxo.outputIndex,
      // };

      // const contract = applyParams(
      //   tokenName,
      //   outputReference,
      //   props.validators,
      //   lucid!,
      // );

      // const assetName = `${contract!.policyId}${fromText(tokenName)}`;

      // const wAddr = await lucid.wallet.address();

      // const tx = await lucid!
      //   .newTx()
      //   .collectFrom([utxo])
      //   .attachMintingPolicy(contract!.platformNFT)
      //   .mintAssets(
      //     { [assetName]: BigInt(1) },
      //     mintRedeemer,
      //   )
      //   .payToAddress(
      //     wAddr,
      //     { lovelace: BigInt(lovelace) },
      //   )
      //   .complete();

      // const signedx = await tx.sign().complete();
      // const txHash = await signedx.submit();
      // const success = await lucid!.awaitTx(txHash);

      // if (success) {
      //   setWaitingTx(false);
      //   setPolicyId(contract!.policyId);
      //   setTxHash(txHash);
      // }
    } catch (error) {
      setWaitingTx(false);
      console.error("error", error);
    }
  };

  useEffect(() => {
    fetch("/api/bids").then((res) => {
      return res.json();
    }).then((data) => {
      setBids(data.map((x) => x.value));
    });

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
      <BidsView
        bids={bids}
        onInput={updateAmount}
        value={amount}
        invest={invest}
      />
      {txInfo}
    </div>
  );
}

function BidsView(props) {
  const listBids = props.bids.map((bid) => (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          {bid.price}₳ | {bid.size / 100}㎡
        </h2>
        <p>{bid.address}</p>
        <a
          href={`https://preview.cexplorer.io/address/${bid.contractAddress}`}
          class="link"
        >
          {bid.contractAddress}
        </a>
        <div className="card-actions justify-end">
          <input
            type="number"
            onInput={props.onInpur}
            value={props.value}
            placeholder="Price in ADA"
            className="input input-bordered w-full max-w-xs"
          />
          <button
            className="btn btn-primary"
            onClick={props.invest}
          >
            Invest Now
          </button>
        </div>
      </div>
    </div>
  ));
  return (
    <div class="flex flex-col my-8 gap-8">
      {listBids}
    </div>
  );
}

// <div class="mockup-code pl-4">
//   <pre class="whitespace-pre-wrap break-words">{bid.contract.script}</pre>
// </div>
function Loading(props) {
  <div>
    <span className="loading loading-lg text-primary loading-spinner"></span>
  </div>;
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
