import {UserId} from "./user";

export type BillId = number;

export interface IBill {
  id: BillId;
  amount: number;
  amountOutstanding: number;
  payerId: UserId;
  dateCreated: Date;
  description: string;
}

export class Bill implements IBill {
  public id: BillId;
  public amount: number;
  public amountOutstanding: number;
  public payerId: UserId;
  public dateCreated: Date;
  public description: string;
  public userAmounts: BillAmount[];

  constructor(data: IBill, amounts: BillAmount[]) {
    this.id = data.id;
    this.amount = data.amount;
    this.amountOutstanding = data.amountOutstanding;
    this.payerId = data.payerId;
    this.dateCreated = data.dateCreated;
    this.description = data.description;
    this.userAmounts = amounts;
  }

  public isPaidInFull(): boolean {
    return this.amountOutstanding >= 0;
  }
}

export class BillAmount {
  constructor(
    public id: number,
    public billId: BillId,
    public userId: UserId,
    public amount: number,
    public amountRemaining: number
  ){}
}
