import { Handlers, PageProps } from "$fresh/server.ts";

import PlatformMint from "../../islands/PlatformMint.tsx";
import { Header } from "../../components/Header.tsx";
import { env } from "../../config.ts";

import { readValidators, Validators } from "../../utils.ts";

interface Data {
  validators: Validators;
}

export const handler: Handlers<Data> = {
  GET(_req, ctx) {
    const validators = readValidators();

    return ctx.render({ validators });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { validators } = data;

  const blockfrost = env["BLOCKFROST"] || Deno.env.get("BLOCKFROST");

  return (
    <div>
      <Header blockfrost={blockfrost} />
      <div class="h-[calc(100vh-68px)] bg-base-200">
        <div class="mx-auto max-w-screen-xl px-4 lg:flex lg:items-center">
          <div class="prose prose-sm md:prose-base w-full max-w-4xl flex-grow pt-10">
            <div class="">
              <h1 class="">Admin Interface</h1>
              <p>Platform NFT Compiled Code</p>
              <div className="">
                <pre class="whitespace-pre-wrap break-words">{validators.platformNFT.script}</pre>
              </div>
              <PlatformMint blockfrost={blockfrost} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
