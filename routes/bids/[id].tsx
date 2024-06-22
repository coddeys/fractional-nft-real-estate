import { Handlers, PageProps } from "$fresh/server.ts";

import InvestorLock from "../../islands/InvestorLock.tsx";
import { Header } from "../../components/Header.tsx";
import { BidView } from "../../components/Bid.tsx";
import { env } from "../../config.ts";
import { Bid } from "../../types.ts";

import { readValidators, Validators } from "../../utils.ts";

interface Data {
  validators: Validators;
  bid: Bid;
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const validators = readValidators();

    const scriptAddress = ctx.params.id;
    const kv = await Deno.openKv(
      "https://api.deno.com/databases/824bd08c-5681-4772-947f-b1ef806f3747/connect",
    );
    // const kv = await Deno.openKv();
    const resp = await kv.get(["bid", scriptAddress]);
    const bid = resp.value;
    return ctx.render({ bid, validators });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { bid, validators } = data;

  const blockfrost = env["BLOCKFROST"] || Deno.env.get("BLOCKFROST");
  const policyId = env["POLICY_ID"] || Deno.env.get("POLICY_ID");
  const asset = env["ASSET"] || Deno.env.get("ASSET");

  return (
    <div>
      <Header blockfrost={blockfrost} />
      <div class="h-[calc(100vh-68px)] bg-base-200">
        <div class="mx-auto max-w-screen-xl px-4 lg:flex lg:items-center">
          <div class="w-full max-w-4xl flex-grow pt-10">
            <div class="">
              <h1 class="text-5xl font-bold mb-4">Invest in the Property</h1>
              <h3 class="text-2xl my-4">
                {bid.address}
              </h3>

              <InvestorLock
                blockfrost={blockfrost}
                validators={validators}
                policyId={policyId}
                asset={asset}
                bid={bid}
              />

              <div class="my-4">
                <BidView bid={bid} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
