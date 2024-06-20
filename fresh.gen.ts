// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $admin_index from "./routes/admin/index.tsx";
import * as $api_bids_id_ from "./routes/api/bids/[id].ts";
import * as $api_bids_index from "./routes/api/bids/index.ts";
import * as $greet_name_ from "./routes/greet/[name].tsx";
import * as $index from "./routes/index.tsx";
import * as $investor_index from "./routes/investor/index.tsx";
import * as $manager_index from "./routes/manager/index.tsx";
import * as $Connect from "./islands/Connect.tsx";
import * as $InvestorMint from "./islands/InvestorMint.tsx";
import * as $ManagerMint from "./islands/ManagerMint.tsx";
import * as $PlatformMint from "./islands/PlatformMint.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/admin/index.tsx": $admin_index,
    "./routes/api/bids/[id].ts": $api_bids_id_,
    "./routes/api/bids/index.ts": $api_bids_index,
    "./routes/greet/[name].tsx": $greet_name_,
    "./routes/index.tsx": $index,
    "./routes/investor/index.tsx": $investor_index,
    "./routes/manager/index.tsx": $manager_index,
  },
  islands: {
    "./islands/Connect.tsx": $Connect,
    "./islands/InvestorMint.tsx": $InvestorMint,
    "./islands/ManagerMint.tsx": $ManagerMint,
    "./islands/PlatformMint.tsx": $PlatformMint,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
