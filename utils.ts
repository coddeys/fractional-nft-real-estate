import {
  applyDoubleCborEncoding,
  applyParamsToScript,
  Constr,
  fromText,
  Lucid,
  MintingPolicy,
  OutRef,
  SpendingValidator,
} from "lucid-cardano";

import { Blueprint } from "./blueprint.ts";
import blueprint from "./plutus.json" assert { type: "json" };

export type Validators = {
  platformNFT: MintingPolicy;
  propertyFunds: SpendingValidator;
};

export function readValidators(): Validators {
  const platformNFT = (blueprint as Blueprint).validators.find((v) =>
    v.title === "platform_nft.platform_nft"
  );

  if (!platformNFT) {
    throw new Error("Platform NFT validator not found");
  }

  const propertyFunds = (blueprint as Blueprint).validators.find((v) =>
    v.title === "property_funds.property_funds"
  );

  if (!propertyFunds) {
    throw new Error("Property funds validator not found");
  }

  return {
    platformNFT: {
      type: "PlutusV2",
      script: platformNFT.compiledCode,
    },
    propertyFunds: {
      type: "PlutusV2",
      script: propertyFunds.compiledCode,
    },
  };
}

export type AppliedValidators = {
  platformNFT: MintingPolicy;
  policyId: string;
};

export function applyParams(
  tokenName: string,
  outputReference: OutRef,
  validators: Validators,
  lucid: Lucid,
): AppliedValidators {
  const outRef = new Constr(0, [
    new Constr(0, [outputReference.txHash]),
    BigInt(outputReference.outputIndex),
  ]);

  const platformNFT = applyParamsToScript(validators.platformNFT.script, [
    fromText(tokenName),
    outRef,
  ]);

  const policyId = lucid.utils.validatorToScriptHash({
    type: "PlutusV2",
    script: platformNFT,
  });

  return {
    platformNFT: {
      type: "PlutusV2",
      script: applyDoubleCborEncoding(platformNFT),
    },
    policyId,
  };
}

export type AppliedValidatorsPropertyFunds = {
  platformNFT: SpendingValidator;
};

export function applyParamsPropertyFunds(
  manager: ByteArray,
  lockUntil: BigInt,
  price: BigInt,
  size: BigInt,
  address: string,
  validators: Validators,
  lucid: Lucid,
): AppliedValidators {
  console.log(address);

  const propertyFunds = applyParamsToScript(validators.propertyFunds.script, [
    manager,
    lockUntil,
    price,
    size,
    fromText(address),
  ]);

  const lockAddress = lucid.utils.validatorToAddress({
    type: "PlutusV2",
    script: propertyFunds,
  });

  return {
    propertyFunds: {
      type: "PlutusV2",
      script: applyDoubleCborEncoding(propertyFunds),
    },
  };
}
