import { useEffect, useState } from "preact/hooks";
import { Blockfrost, Constr, Data, fromText, Lucid } from "lucid-cardano";

export interface AppProps {
  blockfrost: string;
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

  const mintPlatformNFT = async () => {
    try {
      const utxos = await lucid?.wallet.getUtxos()!;
      const utxo = utxos[0];

      console.log(utxo);
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    console.log(lucid);
    if (lucid) {
      window.cardano
        .nami
        .enable()
        .then((wallet) => {
          lucid.selectWallet(wallet);
        });
    }
  }, [lucid]);

  return (
    <div>
      <button
        class="btn btn-primary"
        onClick={setupLucid}
      >
        Setup Lucid
      </button>
      <button
        class="btn btn-primary"
        onClick={mintPlatformNFT}
      >
        Mint
      </button>
    </div>
  );
}
