export const handler: Handlers<Bid | null> = {
  async GET(_req, ctx) {
    const kv = await Deno.openKv(
      "https://api.deno.com/databases/824bd08c-5681-4772-947f-b1ef806f3747/connect",
    );
    // const kv = await Deno.openKv();
    const id = ctx.params.id;
    const key = ["bid", id];
    const bid = (await kv.get<Bid>(key)).value!;
    return new Response(JSON.stringify(bid));
  },
};
