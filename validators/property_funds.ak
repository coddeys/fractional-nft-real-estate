use aiken/dict
use aiken/hash.{Blake2b_224, Hash}
// use aiken/interval.{Finite}
use aiken/list
use aiken/math/rational
use aiken/transaction.{
  Input, Output, OutputReference, ScriptContext, Spend, Transaction,
} as tx
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{AssetName, PolicyId, lovelace_of, quantity_of}

type Action {
  Mint
  Burn
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
      Burn ->
        amount == property_size && asset_name == token_name && must_be_signed_by(
          ctx.transaction,
          manager,
        )
    }
  }
}

type ReedemerFunds {
  ReleaseTokens
  Refund
}

type DatumFunds {
  DatumVoid
  Investor { credential: VerificationKeyHash, address: ByteArray }
}

validator(
  manager: VerificationKeyHash,
  lock_until: POSIXTime,
  property_price: Int,
  property_size: Int,
  token_name: ByteArray,
  policy_id: ByteArray,
) {
  fn property_funds(
    datum: DatumFunds,
    redeemer: ReedemerFunds,
    ctx: ScriptContext,
  ) {
    let two_weeks = 2 * 7 * 24 * 60 * 60 * 1000
    let two_weeks_after = lock_until + two_weeks

    expect Some(y) = rational.new(property_price, property_size)
    let token_price = rational.floor(y)

    let ScriptContext { transaction, .. } = ctx
    let Transaction { inputs, outputs, .. } = transaction

    let must_be_after = True

    when ctx.purpose is {
      Spend(_) ->
        when redeemer is {
          ReleaseTokens -> and {
              must_be_after?,
              and {
                must_be_signed_by(ctx.transaction, manager),
                must_send_tokens(
                  inputs,
                  outputs,
                  token_price,
                  policy_id,
                  token_name,
                ),
              },
            }
          Refund -> must_be_signed_by_datum_investor(ctx.transaction, datum)
        }

      _ -> False
    }
  }
}

fn must_be_signed_by_datum_investor(transaction: Transaction, datum: DatumFunds) {
  expect Investor(credential, ..) = datum
  must_be_signed_by(transaction, credential)
}

fn must_send_tokens(
  inputs: List<Input>,
  outputs: List<Output>,
  token_price: Int,
  policy_id: PolicyId,
  token_name: AssetName,
) -> Bool {
  let inputDatumLovelace: List<Int> = list.map(inputs, datumLovelace)
  let outputDatumTokens: List<Int> =
    list.map(outputs, fn(x) { outputAddressTokens(x, policy_id, token_name) })

  let unpaidInputs =
    list.foldr(
      outputDatumTokens,
      inputDatumLovelace,
      fn(x, xs) { list.delete(xs, outputsToDatum(x, token_price)) },
    )

  unpaidInputs == []
}

fn datumLovelace(input: Input) {
  let Input { output, .. } = input
  lovelace_of(output.value)
}

fn outputAddressTokens(
  output: Output,
  policy_id: PolicyId,
  asset_name: AssetName,
) {
  quantity_of(output.value, policy_id, asset_name)
}

fn outputsToDatum(x: Int, price: Int) {
  expect Some(y) = rational.new(x, price)
  rational.floor(y)
}

fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
  list.has(transaction.extra_signatories, vk)
}
// fn must_start_after(range: ValidityRange, lock_expiration_time: POSIXTime) {
//   when range.lower_bound.bound_type is {
//     Finite(tx_earliest_time) -> lock_expiration_time <= tx_earliest_time
//     _ -> False
//   }
// }

// fn must_be_funded(inputs: List<Input>, price: Int) {
//   list.foldl(
//     inputs,
//     0,
//     fn(n, total) { lovelace_of(self: n.output.value) + total },
//   ) > price
// }

// test must_start_after_succeed_when_lower_bound_is_after() {
//   must_start_after(interval.after(2), 1)
// }
