import {Bill, IBill, BillAmount, UserId} from "../entities";
import {database} from "./database.service";

const BILLS_TABLE_NAME = 'bill';
const AMOUNTS_TABLE_NAME = 'bill_amount';

export class BillRepository {

  public setup(): Promise<void> {
    return Promise.resolve()
      .then(() => database.doesTableExist(BILLS_TABLE_NAME))
      .then((exists: boolean) => {
        if (!exists) {
          return database.execute(`
CREATE TABLE ${BILLS_TABLE_NAME} (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  amount NUMERIC NOT NULL,
  amountOutstanding NUMERIC NOT NULL,
  payerId INT NOT NULL,
  dateCreated TIMESTAMP NOT NULL,
  description VARCHAR(1000)
);
`, BILLS_TABLE_NAME)
        }
      })
      .then(() => database.doesTableExist(AMOUNTS_TABLE_NAME))
      .then((exists: boolean) => {
        if (!exists) {
          return database.execute(`
CREATE TABLE ${AMOUNTS_TABLE_NAME} (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  billId INT NOT NULL,
  userId INT NOT NULL,
  amount NUMERIC NOT NULL,
  amountRemaining NUMERIC NOT NULL,
  UNIQUE KEY (billId, userId),
  FOREIGN KEY (billId) REFERENCES bills(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT
);
          `)
        }
      });
  }

  public findByPayerId(userId: UserId): Promise<Bill[]> {
    return this.findWhere(`b.payerId = ?`, userId);
  }

  private findWhere(whereClause: string, ...args: any[]): Promise<Bill[]> {
    let query = `
SELECT
  b.id,
  b.amount,
  b.amountOutstanding,
  b.payerId,
  b.dateCreated,
  b.description,
  ba.id AS amount_id,
  ba.billId AS amount_billId,
  ba.userId AS amount_userId,
  ba.amount AS amount_amount,
  ba.amountOutstanding AS amount_amountOutstanding,
  ba.isCredit AS amount_isCredit
FROM
  ${BILLS_TABLE_NAME} b
JOIN ${AMOUNTS_TABLE_NAME} ba
ON (b.id = ba.billId)
WHERE (${whereClause})
ORDER BY b.id ASC
`;
    return database.query<any>(query, ...args)
      .then((rows: any[]) => {
        let bills: {[id: number]: [IBill, BillAmount[]] } = {};
        rows.forEach((row: any) => {
          let billAmount = this.getBillAmount(row);
          let bill = bills[row.id];
          if (!bill) {
            bills[row.id] = bill = [
              row,
              []
            ];
          }
          bill[1].push(billAmount);
        });
        return Object.keys(bills).map(key => {
          let data: [IBill, BillAmount[]] = bills[key];
          return new Bill(data[0], data[1]);
        });
      });
  }

  private getBillAmount(row: any): BillAmount {
    let data = {
      id: row.amount_id,
      billId: row.amount_billId,
      userId: row.amount_userId,
      amount: row.amount_amount,
      amountOutstanding: row.amount_amountOutstanding,
      isCredit: row.amount_isCredit
    }
    return BillAmount.fromData(data);
  }
}

export const billRepository = new BillRepository();
