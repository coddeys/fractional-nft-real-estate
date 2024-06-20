export const handler: Handlers<Bid | null> = {
  async POST(req, _ctx) {
    const bid = (await req.json()) as Bid;
    const kv = await Deno.openKv();
    const bidKey = ["bid", bid.contractAddress];
    const ok = await kv.atomic().set(bidKey, bid).commit();
    if (!ok) throw new Error("Something went wrong.");
    return new Response(JSON.stringify(bid));
  },
};
