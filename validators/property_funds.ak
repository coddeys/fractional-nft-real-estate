use aiken/hash.{Blake2b_224, Hash}
use aiken/interval.{Finite}
use aiken/list
use aiken/transaction.{ScriptContext, Spend, Transaction, ValidityRange}
use aiken/transaction/credential.{VerificationKey}

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
  // POSIX time in second, e.g. 1672843961000
  _address: ByteArray,
  _price: Int,
  _size: Int,
  _policy_id: ByteArray,
  _asset: ByteArray,
) {
  fn property_funds(datum: Datum, _redeemer: Void, ctx: ScriptContext) {
    // let amount_nft = price / size

    let two_weeks = 2 * 7 * 24 * 60 * 60
    let two_weeks_after = datum.lock_until + two_weeks

    when ctx.purpose is {
      Spend(_) -> or {
          and {
            must_be_signed_by(ctx.transaction, data.investor),
            must_start_after(ctx.transaction.validity_range, two_weeks_after),
          },
          and {
            must_be_signed_by(ctx.transaction, manager),
            must_start_after(ctx.transaction.validity_range, datum.lock_until),
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

test must_start_after_succeed_when_lower_bound_is_after() {
  must_start_after(interval.after(2), 1)
}
