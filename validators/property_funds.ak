use aiken/hash.{Blake2b_224, Hash}
use aiken/interval.{Finite}
use aiken/list
use aiken/transaction.{Input, ScriptContext, Spend, Transaction, ValidityRange}
use aiken/transaction/credential.{VerificationKey}
use aiken/transaction/value.{lovelace_of}

type Datum {
  // Investor's credentials 
  investor: VerificationKeyHash,
}

type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

type POSIXTime =
  Int

validator(
  manager: VerificationKeyHash,
  lock_until: POSIXTime,
  price: Int,
  size: Int,
  address: ByteArray,
  // _policy_id: ByteArray,
  // _asset: ByteArray,
) {
  fn property_funds(datum: Datum, _redeemer: Void, ctx: ScriptContext) {
    // let amount_nft = price / size
    let two_weeks = 2 * 7 * 24 * 60 * 60 * 1000
    let two_weeks_after = lock_until + two_weeks

    let ScriptContext { transaction, .. } = ctx
    let Transaction { inputs, .. } = transaction

    when ctx.purpose is {
      Spend(_) -> or {
          and {
            must_be_signed_by(ctx.transaction, datum.investor),
            must_start_after(ctx.transaction.validity_range, two_weeks_after),
          },
          and {
            must_be_signed_by(ctx.transaction, manager),
            and {
              must_start_after(ctx.transaction.validity_range, lock_until),
              must_be_funded(inputs, price),
            },
          },
        }
      _ -> False
    }
  }
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
