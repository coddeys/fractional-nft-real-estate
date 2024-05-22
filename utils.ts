// import
//   Lucid,
//   MintingPolicy,
//   OutRef,
//   SpendingValidator,
// } from "lucid-cardano";

import { Blueprint } from "./blueprint.ts";
import blueprint from "./plutus.json" assert { type: "json" };

export type Validators = {
  platformNFT: MintingPolicy;
};

export function readValidators(): Validators {
  const platformNFT = (blueprint as Blueprint).validators.find((v) =>
    v.title === "platform_nft.platform_nft"
  );

  if (!platformNFT) {
    throw new Error("Platform NFT validator not found");
  }

  return {
    platformNFT: {
      type: "PlutusV2",
      script: platformNFT.compiledCode,
    },
  };
}
