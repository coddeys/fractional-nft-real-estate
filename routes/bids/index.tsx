import { Handlers, PageProps } from "$fresh/server.ts";

import { Header } from "../../components/Header.tsx";
import { BidsView } from "../../components/Bid.tsx";
import { env } from "../../config.ts";

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    const kv = await Deno.openKv(
      "https://api.deno.com/databases/824bd08c-5681-4772-947f-b1ef806f3747/connect",
    );
    // const kv = await Deno.openKv();
    const iter = await kv.list({ prefix: ["bid"] });
    // delete all
    // for await (const res of iter) kv.delete(res.key)
    const bids = [];
    for await (const res of iter) bids.push(res.value);

    return ctx.render({ bids });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { bids } = data;

  const blockfrost = env["BLOCKFROST"] || Deno.env.get("BLOCKFROST");

  return (
    <div>
      <Header blockfrost={blockfrost} />
      <div class="h-[calc(100vh-68px)] bg-base-200">
        <div class="mx-auto max-w-screen-xl px-4 lg:flex lg:items-center">
          <div class="w-full max-w-4xl flex-grow pt-10">
            <div class="">
              <h1 class="text-5xl font-bold mb-4">List of Properties</h1>
              <h3 class="text-xl my-4">
                Choose the real estate obejct where do you want to invest
              </h3>
              <BidsView
                bids={bids}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
