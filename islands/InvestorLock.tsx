import { useEffect, useState } from "preact/hooks";
import { Blockfrost, Constr, Data, fromText, Lucid } from "lucid-cardano";
import { Bid } from "../types.ts";
import { BidView } from "../components/Bid.tsx";
import {
  AppliedValidators,
  applyParams,
  LocalCache,
  lock,
  Vlidators,
} from "../utils.ts";

export interface AppProps {
  blockfrost: string;
  bid: Bid;
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

export default function PlatformLock(props: AppProps) {
  const [amount, setAmount] = useState<number>(10);
  const { lucid, setupLucid } = useLucid(props.blockfrost);
  const [waitingTx, setWaitingTx] = useState<boolean>(false);
  const [policyId, setPolicyId] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const updateAmount = (e) => {
    setAmount(e.currentTarget.value);
  };

  const invest = async () => {
    try {
      setWaitingTx(true);
      const lovelace = Number(amount) * 1000000;

      // const investorPublicKeyHash = lucid.utils.getAddressDetails(
      //   await lucid.wallet.address(),
      // ).paymentCredential.hash;

      // const Datum = Data.Object({
      //   investor: String,
      // });

      // type Datum = Data.Static<typeof Datum>;

      // const datum = Data.to<Datum>(
      //   {
      //     investor: fromText(investorPublicKeyHash),
      //   },
      //   Datum,
      // );

      // const txLock = await lock(lovelace, {
      //   into: props.bid.contract,
      //   datum: datum,
      //   lucid: lucid,
      // });

      const utxos = await lucid?.wallet.getUtxos()!;
      const utxo = utxos[0];

      const tx = await lucid!
        .newTx()
        .payToContract(
          props.bid.contract.propertyScriptAddress,
          {
            inline: Data.void(),
          },
          { lovelace: BigInt(lovelace) },
        )
        .complete();

      const txSigned = await tx.sign().complete();

      const txHash = await txSigned.submit();

      const success = await lucid!.awaitTx(txHash);

      // await lucid.awaitTx(txLock);

      setTimeout(() => {
        setWaitingTx(false);

        if (success) {
          console.log(`${lovelace} lovelace locked into the contract
         Tx ID: ${txLock}
        Datum: ${datum}
      `);
        }
      }, 3000);
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
    btn = <InvestForm onClick={invest} onInput={updateAmount} value={amount} />;
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

function InvestForm(props) {
  return (
    <div className="flex gap-8">
      <input
        type="number"
        onInput={props.onInput}
        value={props.value}
        placeholder="Price in ADA"
        className="input input-bordered w-full max-w-xs"
      />
      <button
        className="btn btn-primary"
        onClick={props.onClick}
      >
        Invest Now
      </button>
    </div>
  );
}
