export const handler: Handlers<Bid | null> = {
  async POST(req, _ctx) {
    const bid = (await req.json()) as Bid;
    const kv = await Deno.openKv();
    const bidKey = ["bid", bid.contractAddress];
    const ok = await kv.atomic().set(bidKey, bid).commit();
    if (!ok) throw new Error("Something went wrong.");
    return new Response(JSON.stringify(bid));
  },


  async GET(_req, ctx) {
    const kv = await Deno.openKv(
      "https://api.deno.com/databases/824bd08c-5681-4772-947f-b1ef806f3747/connect",
    );
    // const kv = await Deno.openKv();
    const iter = (await kv.list({ prefix: ["bid"]} ));
    const bids = [];
    for await (const res of iter) bids.push(res);
    return new Response(JSON.stringify(bids));
  },
};
