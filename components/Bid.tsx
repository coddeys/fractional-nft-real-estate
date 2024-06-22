import { JSX } from "preact";
import { Bid } from "../types.ts";

export function BidsView({ bids }: JSX.HTMLAttributes<HTMLButtonElement>) {
  const listBids = bids.map((bid) => (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          {bid.price}₳ | {bid.size / 100}㎡
        </h2>
        <p>{bid.address}</p>
        <a
          href={`https://preview.cexplorer.io/address/${bid.contractAddress}`}
          class="link"
        >
          {bid.contractAddress}
        </a>
        <div className="card-actions justify-end">
          <a href={`/bids/${bid.contractAddress}`} className="btn btn-primary">
            Invest Now
          </a>
        </div>
      </div>
    </div>
  ));
  return (
    <div class="flex flex-col my-8 gap-8">
      {listBids}
    </div>
  );
}

export function BidView({ bid }: Bid) {
  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          Property Price: {bid.price}₳ | Size: {bid.size / 100}㎡
        </h2>
        <p>Address: {bid.address}</p>
        <p>
          Script Address:{" "}
          <a
            href={`https://preview.cexplorer.io/address/${bid.contractAddress}`}
            class="link"
          >
            {bid.contractAddress}
          </a>
        </p>
        <div class="mockup-code pl-4">
          <pre class="whitespace-pre-wrap break-words">{bid.contract.script}</pre>
        </div>
      </div>
    </div>
  );
}
