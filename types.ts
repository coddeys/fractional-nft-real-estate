import { AppliedValidators } from "./utils.ts";

export type Bid = {
  address: String;
  price: number;
  size: number;
  contract: AppliedValidators;
  txHash: String;
};

export type Contract = {
  type: String;
  script: String;
};
