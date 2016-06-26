import {UserId} from "./user";
import {BillId} from "./bill";

export interface IDebt {
  id: number;
  billId: BillId;
  debtor: UserId;
  creditor: UserId;
}
