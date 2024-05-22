import { Header } from "../components/Header.tsx";
import { env } from "../config.ts";

export default function Home() {
  const blockfrost = env["BLOCKFROST"] || Deno.env.get("BLOCKFROST");

  return (
    <div>
      <Header blockfrost={blockfrost} />
      <Hero />
    </div>
  );
}

function Hero() {
  return (
    <div className="hero h-[calc(100vh-68px)] bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Estate Club</h1>
          <p className="py-6">
            Take part in the EU real estate market by investing in fractional,
            tokenized ownership, powered by Cardano.
          </p>
          <button className="btn btn-primary">Get Started</button>
        </div>
      </div>
    </div>
  );
}
