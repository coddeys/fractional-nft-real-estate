import { Handlers, PageProps } from "$fresh/server.ts";

import ManagerMint from "../../islands/ManagerMint.tsx";
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
              <h1 class="">Property Managment Company Interface</h1>
              <h3 class="text-xl">
                Create a Real Estate Property Bid Proposal
              </h3>
              <ManagerMint
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
