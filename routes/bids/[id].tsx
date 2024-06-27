import { Handlers, PageProps } from "$fresh/server.ts";

import InvestorLock from "../../islands/InvestorLock.tsx";
import { Header } from "../../components/Header.tsx";
import { BidView } from "../../components/Bid.tsx";
import { env } from "../../config.ts";
import { Bid } from "../../types.ts";

interface Data {
  bid: Bid;
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const scriptAddress = ctx.params.id;
    const kv = await Deno.openKv();
    const resp = await kv.get(["bid", scriptAddress]);
    const bid = resp.value;
    return ctx.render({ bid });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { bid } = data;

  const blockfrost = env["BLOCKFROST"] || Deno.env.get("BLOCKFROST");

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
