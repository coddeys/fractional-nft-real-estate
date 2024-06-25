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

  const propertyToken = (blueprint as Blueprint).validators.find((v) =>
    v.title === "property_funds.property_token"
  );

  if (!propertyToken) {
    throw new Error("Property Token validator not found");
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
    propertyToken: {
      type: "PlutusV2",
      script: propertyToken.compiledCode,
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

// PROPERTY LOGIC

export type AppliedValidatorsProperty = {
  propertyToken: MintingPolicy;
  propertyFunds: SpendingValidator;
  propertyPolicyId: string;
  propertyScriptAddress: string;
};

export function applyParamsProperty(
  manager: ByteArray,
  lockUntil: BigInt,
  price: BigInt,
  size: BigInt,
  address: string,
  outputReference: OutRef,
  validators: Validators,
  lucid: Lucid,
): AppliedValidators {
  const outRef = new Constr(0, [
    new Constr(0, [outputReference.txHash]),
    BigInt(outputReference.outputIndex),
  ]);

  const propertyToken = applyParamsToScript(validators.propertyToken.script, [
    manager,
    size,
    fromText(address.substring(0, 7)),
    outRef,
  ]);

  const propertyPolicyId = lucid.utils.validatorToScriptHash({
    type: "PlutusV2",
    script: propertyToken,
  });

  const propertyFunds = applyParamsToScript(validators.propertyFunds.script, [
    manager,
    lockUntil,
    price,
    size,
    fromText(address.substring(0, 7)),
  ]);

  const propertyScriptAddress = lucid.utils.validatorToAddress({
    type: "PlutusV2",
    script: propertyFunds,
  });

  return {
    propertyToken: {
      type: "PlutusV2",
      script: applyDoubleCborEncoding(propertyToken),
    },
    propertyFunds: {
      type: "PlutusV2",
      script: applyDoubleCborEncoding(propertyFunds),
    },
    propertyPolicyId,
    propertyScriptAddress,
  };
}

export async function lock(lovelace, { into, datum, lucid }): Promise<TxHash> {
  const contractAddress = lucid.utils.validatorToAddress(into);

  const tx = await lucid
    .newTx()
    .payToContract(contractAddress, { inline: datum }, { lovelace })
    .complete();

  const signedTx = await tx.sign().complete();

  return signedTx.submit();
}
1;
