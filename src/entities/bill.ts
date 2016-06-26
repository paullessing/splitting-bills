import {UserId, BillId} from "./ids";

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

export interface IBillAmount {
  id?: number;
  billId: BillId;
  userId: UserId;
  isCredit: boolean;
  amount: number;
  amountOutstanding: number;
}

export class BillAmount implements IBillAmount {
  public id: number;

  constructor(
    public billId: BillId,
    public userId: UserId,
    public amount: number,
    public amountOutstanding: number,
    public isCredit: boolean = false
  ){}

  public static fromData(data: IBillAmount): BillAmount {
    let amount = new BillAmount(
      data.billId,
      data.userId,
      data.amount,
      data.amountOutstanding,
      data.isCredit
    );
    amount.id = data.id;
    return amount;
  }
}
