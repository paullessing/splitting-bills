import {DebtId, BillId, UserId} from "./ids";

export const DEBTS_TABLE_NAME = 'debt';
export const DEBTS_TABLE_DEFINITION = `
CREATE TABLE ${DEBTS_TABLE_NAME} (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  billId INT NOT NULL,
  debtorId INT NOT NULL,
  creditorId INT NOT NULL,
  amount NUMERIC NOT NULL,
  createdAt TIMESTAMP NOT NULL,

  UNIQUE KEY (billId, creditorId, debtorId),
  FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (debtorId) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (creditorId) REFERENCES users(id) ON DELETE RESTRICT
);`;

export interface IDebt {
  id: DebtId;
  billId: BillId;
  debtorId: UserId;
  creditorId: UserId;

  amount: number;
  createdAt: Date;
  paidAt?: Date;
}

export class Debt implements IDebt {
  public id: DebtId;
  public paidAt: Date;

  constructor(
    public billId: BillId,
    public amount: number,
    public debtorId: UserId,
    public creditorId: UserId,
    public createdAt: Date
  ) {}

  public static fromData(data: IDebt): Debt {
    let debt = new Debt(
      data.billId,
      data.amount,
      data.debtorId,
      data.creditorId,
      data.createdAt
    );
    debt.id = data.id;
    debt.paidAt = data.paidAt;
    return debt;
  }
}
