export type Bid = {
  address: String;
  price: number;
  size: number;
  contract: Contract;
  contractAddress: String;
};

export type Contract = {
  type: String;
  script: String;
};
