import { useEffect, useState } from "preact/hooks";
import { Bid, Contract } from "../types.ts";
import { Blockfrost, Constr, Data, fromText, Lucid } from "lucid-cardano";
import {
  AppliedValidators,
  applyParamsProperty,
  CreateBid,
  LocalCache,
  lock,
  Validators,
} from "../utils.ts";
import { Blueprint } from "../blueprint.ts";
import blueprint from "../plutus.json" assert { type: "json" };

export interface AppProps {
  blockfrost: string;
  validators: Validators;
  estatPolicyId?: string;
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
  const [address, setAddress] = useState<string | undefined>(
    "Koninginnenhoofd 1, 3072 AD Rotterdam",
  );
  const [contractAddress, setContractAddress] = useState<string | undefined>(
    undefined,
  );
  const [price, setPrice] = useState<number | undefined>(500000); // ada
  const [size, setSize] = useState<number | undefined>(10000); // square decimeters
  const { lucid, setupLucid } = useLucid(props.blockfrost);
  const [waitingTx, setWaitingTx] = useState<boolean>(false);
  const [policyId, setPolicyId] = useState<string | undefined>(undefined);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);

  const [contract, setContract] = useState<Contract | undefined>(undefined);

  const [parameterizedContracts, setParameterizedContracts] = useState<
    AppliedValidators | null
  >(null);

  const updatePrice = (e) => setPrice(e.currentTarget.value);
  const updateSize = (e) => setSize(e.currentTarget.value);
  const updateAddress = (e) => setAddress(e.currentTarget.value);

  const saveBid = async (bid: Bid) => {
    const jsonResponse = await fetch("/api/bids", {
      method: "POST",
      body: JSON.stringify(bid),
    });
  };

  const generateBid = async () => {
    try {
      const managerPublicKeyHash = lucid.utils.getAddressDetails(
        await lucid.wallet.address(),
      ).paymentCredential.hash;

      const utxos = await lucid?.wallet.getUtxos()!;

      const utxo = utxos[0];
      const outputReference = {
        txHash: utxo.txHash,
        outputIndex: utxo.outputIndex,
      };

      const timeNow = Date.now();
      const timeNowPlus2hour = Math.round(timeNow / 10000000) * 10000000;

      const parameterizedValidators: Contract = applyParamsProperty(
        managerPublicKeyHash,
        BigInt(timeNowPlus2hour),
        BigInt(price),
        BigInt(size),
        address,
        outputReference,
        props.validators,
        lucid!,
      );

      setParameterizedContracts(parameterizedValidators);
    } catch (error) {
      console.error("error", error);
    }
  };

  const createBid = async () => {
    setWaitingTx(true);

    try {
      const assetName = `${parameterizedContracts!.propertyPolicyId}${
        fromText(address.substring(0, 7))
      }`;

      // Action::Mint
      const redeemer = Data.to(new Constr(0, []));

      const utxos = await lucid?.wallet.getUtxos()!;
      const utxo = utxos[0];

      const DatumFundsSchema = (blueprint as Blueprint).validators.find((v) =>
        v.title === "property_funds.property_funds"
      ).datum.schema;
      type DatumFunds = Data.Static<typeof DatumFundsSchema>;
      const DatumFunds = DatumFundsSchema as unknown as DatumFunds;
      const datumFunds = Data.to(
        new Constr(0, []),
        DatumFunds,
      );

      const tx = await lucid!
        .newTx()
        .collectFrom([utxo])
        .attachMintingPolicy(parameterizedContracts!.propertyToken)
        .mintAssets(
          { [assetName]: BigInt(10000) },
          redeemer,
        )
        .payToContract(
          parameterizedContracts!.propertyScriptAddress,
          { inline: datumFunds },
          { [assetName]: BigInt(10000) },
        )
        .addSigner(await lucid.wallet.address())
        .complete();

      const txSigned = await tx.sign().complete();

      const txHash = await txSigned.submit();

      const success = await lucid!.awaitTx(txHash);

      setTimeout(() => {
        setWaitingTx(false);

        const bid: Bid = {
          address: address,
          price: price,
          size: size,
          contract: parameterizedContracts,
          txHash: txHash,
        };

        if (success) {
          saveBid(bid);
        }
      }, 3000);
    } catch (error) {
      setWaitingTx(false);
      console.log("error", error);
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

  let warning;
  if (!props.asset && !props.estatePolicyId) {
    warning = <Warning />;
  }

  let btn;
  if (parameterizedContracts) {
    btn = (
      <ScriptPreview onClick={createBid} contracts={parameterizedContracts} />
    );
  } else if (lucid) {
    btn = <CreateBidButton onClick={generateBid} />;
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
      <div className="flex my-4 gap-2 flex-col">
        <input
          type="text"
          onInput={updateAddress}
          value={address}
          placeholder="Property Addres"
          className="input input-bordered w-full max-w-lg"
        />
        <input
          type="number"
          onInput={updatePrice}
          value={price}
          placeholder="Price in ADA"
          className="input input-bordered w-full max-w-xs"
        />
        <input
          type="number"
          onInput={updateSize}
          value={size}
          placeholder="Size in square decimeters"
          className="input input-bordered w-full max-w-xs"
        />
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

function CreateBidButton(props) {
  return (
    <button
      class="btn btn-primary"
      onClick={props.onClick}
    >
      Make a Bid
    </button>
  );
}

function ScriptPreview(props) {
  return (
    <div className="">
      <p>Policy Id</p>
      <p>{props.contracts.propertyPolicyId}</p>
      <p>Property Script Address</p>
      <p>{props.contracts.propertyScriptAddress}</p>
      <p>Policy Script</p>
      <button
        class="btn btn-primary"
        onClick={props.onClick}
      >
        Pay to Address
      </button>
    </div>
  );
}
