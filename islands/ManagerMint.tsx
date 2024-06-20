import { useEffect, useState } from "preact/hooks";
import { Blockfrost, Constr, Data, fromText, Lucid } from "lucid-cardano";
import {
  AppliedValidators,
  applyParamsPropertyFunds,
  CreateBid,
  LocalCache,
  lock,
  Validators,
} from "../utils.ts";

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

  const [contract, setContract] = useState<string | undefined>(undefined);

  const updatePrice = (e) => setPrice(e.currentTarget.value);
  const updateSize = (e) => setSize(e.currentTarget.value);
  const updateAddress = (e) => setAddress(e.currentTarget.value);

  const createBid = async () => {
    try {
      setWaitingTx(true);

      const managerPublicKeyHash = lucid.utils.getAddressDetails(
        await lucid.wallet.address(),
      ).paymentCredential.hash;

      const timeNow = Date.now();

      const contract = applyParamsPropertyFunds(
        managerPublicKeyHash,
        BigInt(timeNow),
        BigInt(price),
        BigInt(size),
        address,
        props.validators,
        lucid!,
      );

      const contractAddress = lucid.utils.validatorToAddress(contract);
      setContractAddress(contractAddress);

      const propertyBid = {
        address: address,
        price: price,
        size: size,
        contract: contract,
        contractAddress: contractAddress,
      };

      console.log(propertyBid);
      // const Datum = Data.Object({
      //   investor: String,
      // });

      // type Datum = Data.Static<typeof Datum>;

      // const datum = Data.to<Datum>(
      //   {
      //     investor: managerPublicKeyHash,
      //   },
      //   Datum,
      // );

      // const txLock = await lock(1000000, {
      //   into: contract.propertyFunds,
      //   datum: datum,
      //   lucid: lucid,
      // });

      // await lucid.awaitTx(txLock);

      // console.log(`1 tADA locked into the contract
      //    Tx ID: ${txLock}
      //   Datum: ${datum}
      // `);

      setWaitingTx(false);
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
  if (contract) {
    btn = <ScriptPreview onClick={createBid} script={contract} />;
  } else if (lucid) {
    btn = <CreateBidButton onClick={createBid} />;
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
      <pre class="whitespace-pre-wrap break-words">{props.script}</pre>
      <button
        class="btn btn-primary"
        onClick={props.onClick}
      >
        Pay to Address
      </button>
    </div>
  );
}
