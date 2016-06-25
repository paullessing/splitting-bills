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
    let query = `
SELECT
  b.id,
  b.amount,
  b.amountOutstanding,
  b.payerId,
  b.dateCreated,
  b.description,
  ba.id AS amountId,
  ba.billId,
  ba.userId,
  ba.amount AS splitAmount,
  ba.amountRemaining
FROM
  ${BILLS_TABLE_NAME} b
JOIN ${AMOUNTS_TABLE_NAME} ba
ON (b.id = ba.billId)
WHERE b.payerId = ?
ORDER BY b.id ASC
`;
    return database.query<any>(query, userId)
      .then((rows: any[]) => {
        let bills: {[id: number]: [IBill, BillAmount[]] } = {};
        rows.forEach((row: any) => {
          let amount = new BillAmount(
            row.amountId,
            row.billId,
            row.userId,
            row.splitAmount,
            row.amountRemaining
          );
          let bill = bills[row.id];
          if (!bill) {
            bills[row.id] = bill = [
              {
                id: row.id,
                amount: row.amount,
                amountOutstanding: row.amountOutstanding,
                payerId: row.payerId,
                dateCreated: row.dateCreated,
                description: row.description
              },
              []
            ];
          }
          bill[1].push(amount);
        });
        return Object.keys(bills).map(key => {
          let data: [IBill, BillAmount[]] = bills[key];
          let bill = new Bill(data[0], data[1]);
          return bill;
        });
      });
  }
}

export const billRepository = new BillRepository();
