# Estate Club

> Emurgo Academy Final Project

## Project Overview

The idea of the project is to fractionalize real estate property. The minimum amount is a square decimeter. The manager creates a bid with the address, size, and price of the property. The bid is a Cardano smart contract, and every contract is unique because the validator uses UTXO-ref as an input. While creating the Plutus Script, the manager mints tokens in an amount equal to the size of the property and locks the tokens on the script address.

Investors then start to lock ADA on the script. If the amount of ADA is equal to or more than the price of the property, the bid is funded, and the manager can distribute tokens between investors and unlock the ADA from the script. If the bid is not funded, investors can request a refund. Every investor can always refund (unlock) their own ADA.

## Developer Guide

### Development Smart Contracts

To build the compiled version code, use the following command:

```
aiken build --trace-level verbose

```

### Development Frontend

Start the frontend project:

```
deno task start
```

This command will monitor the project directory and restart as needed.

### Deployment

The project will be automatically deployed to the Deno Deploy platform using a GitHub workflow.

https://estate-club.deno.dev/


# User Guide

## Mint Platform NFT

1. Visit https://estate-club.deno.dev/admin

2. Connect the Nami Wallet by clicking the "Setup Lucid" button

3. Click the Mint button

Visual guide:

[platform_nft.webm](https://github.com/coddeys/fractional-nft-real-estate/assets/4198294/b360f8d5-7c6c-4614-a221-fa29d70addb8)

## Create a Bid

1. Visit https://estate-club.deno.dev/manager

2. Connect the Nami Wallet by clicking the "Setup Lucid" button

3. Fill in address, price and size fields

4. Click "Make a Bid."

5. Click "Pay to Address."

[scrnli_6_28_2024_1-06-27 AM.webm](https://github.com/coddeys/fractional-nft-real-estate/assets/4198294/ecd09c26-738f-464d-a7cf-e20db4b7f84e)

## Invest in the Property

1. Visit https://estate-club.deno.dev/bids

2. Select the property that you would like to invest in.

4. Click "Invest now."

2. Connect the Nami Wallet by clicking the "Setup Lucid" button

5. Click "Invest now."

[scrnli_6_28_2024_1-15-45 AM.webm](https://github.com/coddeys/fractional-nft-real-estate/assets/4198294/5f145ba9-99b3-4a31-8d1e-f504b5478299)

