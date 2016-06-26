import {BillId} from "./ids";
import {Debt} from "./debt";

export const BILLS_TABLE_NAME = 'bill';
export const BILLS_TABLE_DEFINITION = `
CREATE TABLE ${BILLS_TABLE_NAME} (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  isPaid TINYINT NOT NULL,
  dateCreated TIMESTAMP NOT NULL,
  description VARCHAR(1000)
);`;

export interface IBill {
  id: BillId;
  amount: number;
  isPaid: boolean;
  dateCreated: Date;
  description: string;
}

export class Bill implements IBill {
  public id: BillId;
  private _debts: Debt[];
  public isPaid: boolean;

  constructor(
    public amount: number,
    public dateCreated: Date,
    public description?: string
  ) {
    this.isPaid = false;
  }

  public get debts(): Debt[] {
    return this._debts.slice();
  }

  public set debts(debts: Debt[]) {
    this._debts = [].concat(debts);
    this.isPaid = this._debts.every((debt: Debt) => !!debt.paidAt);
  }

  public static fromData(data: IBill, debts: Debt[]): Bill {
    let bill = new Bill(
      data.amount,
      data.dateCreated,
      data.description
    );
    bill.id = data.id;
    bill.debts = debts;
    return bill;
  }
}

/*
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
*/
