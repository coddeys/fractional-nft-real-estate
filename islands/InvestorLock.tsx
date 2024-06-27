import { useEffect, useState } from "preact/hooks";
import {
  Blockfrost,
  Constr,
  Data,
  fromText,
  Lucid,
  toText,
} from "lucid-cardano";
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
import { Blueprint } from "../blueprint.ts";
import blueprint from "../plutus.json" assert { type: "json" };

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

      const investorWalletAddress = await lucid.wallet.address();

      const investorPublicKeyHash = lucid.utils.getAddressDetails(
        investorWalletAddress,
      ).paymentCredential.hash;

      const utxos = await lucid?.wallet.getUtxos()!;
      const utxo = utxos[0];

      const DatumFundsSchema = (blueprint as Blueprint).validators.find((v) =>
        v.title === "property_funds.property_funds"
      ).datum.schema;
      type DatumFunds = Data.Static<typeof DatumFundsSchema>;
      const DatumFunds = DatumFundsSchema as unknown as DatumFunds;
      const datumFunds = Data.to(
        new Constr(1, [
          fromText(investorPublicKeyHash),
          fromText(investorWalletAddress),
        ]),
        DatumFunds,
      );

      const tx = await lucid!
        .newTx()
        .payToContract(
          props.bid.contract.propertyScriptAddress,
          {
            inline: datumFunds,
          },
          { lovelace: BigInt(lovelace) },
        )
        .complete();

      const txSigned = await tx.sign().complete();

      const txHash = await txSigned.submit();

      const success = await lucid!.awaitTx(txHash);

      setTimeout(() => {
        setWaitingTx(false);

        if (success) {
          console.log(`${lovelace} lovelace locked into the contract
         Tx ID: ${txHash}
        Datum: ${datumFunds}
      `);
        }
      }, 3000);
    } catch (error) {
      setWaitingTx(false);
      console.error("error", error);
    }
  };

  const release = async () => {
    try {
      setWaitingTx(true);

      const assetName = `${props.bid.contract.propertyPolicyId}${
        fromText(props.bid.address.substring(0, 7))
      }`;

      const utxosAll = await lucid!.utxosAt(
        props.bid.contract.propertyScriptAddress,
      );

      const utxos = utxosAll;
      console.log(utxos);

      const datumAddress = utxos[1].datum;
      console.log(datumAddress);

      const DatumFundsSchema = (blueprint as Blueprint).validators.find((v) =>
        v.title === "property_funds.property_funds"
      ).datum.schema;
      type DatumFunds = Data.Static<typeof DatumFundsSchema>;
      const DatumFunds = DatumFundsSchema as unknown as DatumFunds;

      const datumFunds = Data.from(datumAddress, DatumFunds);
      const datumAddress_ = toText(datumFunds.fields[1]);

      // Redeemer
      const RedeemerFundsSchema =
        (blueprint as Blueprint).validators.find((v) =>
          v.title === "property_funds.property_funds"
        ).redeemer.schema;
      type RedeemerFunds = Data.Static<typeof RedeemerFundsSchema>;
      const RedeemerFunds = RedeemerFundsSchema as unknown as RedeemerFunds;
      const redeemerFunds = Data.to(new Constr(0, []), RedeemerFunds);

      const tx = await lucid!
        .newTx()
        // .collectFrom(utxos, Data.to(new Constr(1, [])))
        // .attachSpendingValidator(props.bid.contract.propertyFunds)
        // .payToAddress(
        //   datumAddress_,
        //   { lovelace: BigInt(10n) },
        // )
        .collectFrom(utxos, redeemerFunds)
        .attachSpendingValidator(props.bid.contract.propertyFunds)
        .payToAddress(
          datumAddress_,
          { [assetName]: BigInt(1) },
        )
        .complete();

      console.log(tx);

      const txSigned = await tx.sign().complete();

      const txHash = await txSigned.submit();

      const success = await lucid!.awaitTx(txHash);

      setTimeout(() => {
        setWaitingTx(false);

        if (success) {
          console.log(`success`);
        }
      }, 3000);
    } catch (error) {
      setWaitingTx(false);
      console.error("error", error);
    }
  };

  const getPKHfromDatum = async (datum) => {
    const DatumFundsSchema =
      (blueprint as Blueprint).validators.find((v) =>
        v.title === "property_funds.property_funds"
      ).datum.schema;
    type DatumFunds = Data.Static<typeof DatumFundsSchema>;
    const DatumFunds = DatumFundsSchema as unknown as DatumFunds;

    const datumFunds = Data.from(datum, DatumFunds);
    const pkh = toText(datumFunds.fields[0]);
    return pkh;
  };

  const asyncFilter = async (arr, predicate) => {
    const results = await Promise.all(arr.map(predicate));

    return arr.filter((_v, index) => results[index]);
  };

  const refund = async () => {
    try {
      setWaitingTx(true);

      const assetName = `${props.bid.contract.propertyPolicyId}${
        fromText(props.bid.address.substring(0, 7))
      }`;

      const investorWalletAddress = await lucid.wallet.address();

      const investorPublicKeyHash = lucid.utils.getAddressDetails(
        investorWalletAddress,
      ).paymentCredential.hash;

      const utxosAll = await lucid!.utxosAt(
        props.bid.contract.propertyScriptAddress,
      );

      const utxos = await asyncFilter(utxosAll, async (utxo) => {
        const pkh = await getPKHfromDatum(utxo.datum);
        return pkh === investorPublicKeyHash;
      });

      // Redeemer
      const RedeemerFundsSchema =
        (blueprint as Blueprint).validators.find((v) =>
          v.title === "property_funds.property_funds"
        ).redeemer.schema;
      type RedeemerFunds = Data.Static<typeof RedeemerFundsSchema>;
      const RedeemerFunds = RedeemerFundsSchema as unknown as RedeemerFunds;
      const redeemerFunds = Data.to(new Constr(1, []), RedeemerFunds);

      const tx = await lucid!
        .newTx()
        .collectFrom(utxos, redeemerFunds)
        .attachSpendingValidator(props.bid.contract.propertyFunds)
        .addSigner(await lucid.wallet.address())
        .complete();

      const txSigned = await tx.sign().complete();

      const txHash = await txSigned.submit();

      const success = await lucid!.awaitTx(txHash);

      setTimeout(() => {
        setWaitingTx(false);

        if (success) {
          console.log(`success`);
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
    btn = (
      <InvestForm
        onClick={invest}
        onInput={updateAmount}
        value={amount}
        isLoading={waitingTx}
        onClickRelease={release}
        onClickRefund={refund}
      />
    );
  } else {
    btn = <SetupLucidButton onClick={setupLucid} isLoading={waitingTx} />;
  }

  let txInfo;
  if (txHash) {
    txInfo = <TxInfo txHash={txHash} policyId={policyId} />;
  }

  return (
    <div>
      {btn}
      {Loading}
      {txInfo}
    </div>
  );
}

function Loading(props) {
  return (
    <span className="loading loading-lg text-primary loading-spinner"></span>
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

function InvestForm(props) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-8">
        <input
          type="number"
          onInput={props.onInput}
          value={props.value}
          disabled={props.isLoading}
          placeholder="Price in ADA"
          className="input input-bordered w-full max-w-xs"
        />
        <button
          className="btn btn-primary"
          disabled={props.isLoading}
          onClick={props.onClick}
        >
          Invest Now
        </button>
      </div>

      <div className="flex gap-8">
        <button
          className="btn btn-primary"
          disabled={props.isLoading}
          onClick={props.onClickRelease}
        >
          Release Tokens
        </button>
        <button
          className="btn btn-primary"
          disabled={props.isLoading}
          onClick={props.onClickRefund}
        >
          Refund
        </button>
      </div>
    </div>
  );
}
