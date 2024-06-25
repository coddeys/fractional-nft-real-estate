use aiken/dict
use aiken/hash.{Blake2b_224, Hash}
use aiken/interval.{Finite}
use aiken/list
use aiken/transaction.{
  Input, Output, OutputReference, ScriptContext, Spend, Transaction,
  ValidityRange,
} as tx
use aiken/transaction/credential.{Address, VerificationKey}
use aiken/transaction/value.{lovelace_of}

type Action {
  Mint
  Burn
}

type Datum =
  List<Investor>

type Manager {
  address: Address,
}

type Redeemer =
  Manager

type Investor {
  // Investor's credentials 
  signature: VerificationKeyHash,
  address: Address,
}

type Reedemer {
  investors: List<Investor>,
  manager: Manager,
}

type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

type POSIXTime =
  Int

validator(
  manager: VerificationKeyHash,
  property_size: Int,
  token_name: ByteArray,
  utxo_ref: OutputReference,
) {
  fn property_token(rdmr: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = ctx

    expect tx.Mint(policy_id) = purpose

    let Transaction { inputs, mint, .. } = transaction

    expect [(asset_name, amount)] =
      mint
        |> value.from_minted_value
        |> value.tokens(policy_id)
        |> dict.to_list()

    when rdmr is {
      Mint -> {
        expect Some(_input) =
          list.find(inputs, fn(input) { input.output_reference == utxo_ref })
        amount == property_size && asset_name == token_name && must_be_signed_by(
          ctx.transaction,
          manager,
        )
      }
      Burn -> amount == property_size && asset_name == token_name
    }
  }
}

validator(
  manager: VerificationKeyHash,
  lock_until: POSIXTime,
  property_price: Int,
  property_size: Int,
  token_name: ByteArray,
) {
  fn property_funds(_datum: Datum, redeemer: Redeemer, ctx: ScriptContext) {
    // let amount_nft = price / size
    let two_weeks = 2 * 7 * 24 * 60 * 60 * 1000
    let two_weeks_after = lock_until + two_weeks

    let ScriptContext { transaction, .. } = ctx
    let Transaction { inputs, outputs, .. } = transaction

    when ctx.purpose is {
      Spend(_) -> or {
          // must_be_signed_by_investor(ctx.transaction, datum),
          must_be_signed_by(ctx.transaction, manager),
          must_send_tokens(outputs),
          and {
            must_be_signed_by(ctx.transaction, manager),
            must_send_tokens(outputs),
          },
        }
      // and {
      //   must_start_after(ctx.transaction.validity_range, lock_until),
      //   must_be_funded(inputs, price),
      // },
      _ -> False
    }
  }
}

// fn inlineDatum(input: Input) -> PaymentCredential {
//   let Input { output, .. } = input
//   let Output { address, .. } = output
//   address.payment_credential 
// }

fn must_send_tokens(ouputs: List<Output>) -> Bool {
  // let Output { address, .. } = output
  True
}

fn must_be_signed_by_investor(
  transaction: Transaction,
  datum: List<Investor>,
) -> Bool {
  let signatures =
    list.map(datum, fn(x: Investor) -> VerificationKeyHash { x.signature })

  list.all(signatures, fn(x) { must_be_signed_by(transaction, x) })
}

fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
  list.has(transaction.extra_signatories, vk)
}

fn must_start_after(range: ValidityRange, lock_expiration_time: POSIXTime) {
  when range.lower_bound.bound_type is {
    Finite(tx_earliest_time) -> lock_expiration_time <= tx_earliest_time
    _ -> False
  }
}

fn must_be_funded(inputs: List<Input>, price: Int) {
  list.foldl(
    inputs,
    0,
    fn(n, total) { lovelace_of(self: n.output.value) + total },
  ) > price
}

test must_start_after_succeed_when_lower_bound_is_after() {
  must_start_after(interval.after(2), 1)
}
