import { Handlers, PageProps } from "$fresh/server.ts";

import InvestorMint from "../../islands/InvestorMint.tsx";
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
  const policyId = env["POLICY_ID"] || Deno.env.get("POLICY_ID");
  const asset = env["ASSET"] || Deno.env.get("ASSET");

  return (
    <div>
      <Header blockfrost={blockfrost} />
      <div class="h-[calc(100vh-68px)] bg-base-200">
        <div class="mx-auto max-w-screen-xl px-4 lg:flex lg:items-center">
          <div class="prose prose-sm md:prose-base w-full max-w-4xl flex-grow pt-10">
            <div class="">
              <h1 class="">List of Properties</h1>
              <h3 class="text-xl">
                Choose the real estate obejct where do you want to invest 
              </h3>
              <InvestorMint
                blockfrost={blockfrost}
                validators={validators}
                policyId={policyId}
                asset={asset}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
