import {Bill, UserId} from "../entities";
import {database, NoResultsFoundException} from "./database.service";
import {IBill, BillAmount} from "../entities/bill";

const ERROR_NO_SUCH_TABLE = 'ER_NO_SUCH_TABLE';
const ERROR_PARSE = 'ER_PARSE_ERROR';

const BILLS_TABLE_NAME = 'bills';
const AMOUNTS_TABLE_NAME = 'bill_amounts';

export class BillsRepository {
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

  public getBillsForPayer(userId: UserId): Promise<Bill[]> {
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
  bills b
JOIN bill_amounts ba
ON (b.id = ba.billId)
WHERE b.payerId = ?
ORDER BY b.id ASC
`;
    let bills: {[id: number]: [IBill, BillAmount[]] } = {};
    return database.query<void>(query, userId, (row: any) => {
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
      return null;
    })
      .then(() => {
        return Object.keys(bills).map(key => {
          let data: [IBill, BillAmount[]] = bills[key];
          let bill = new Bill(data[0], data[1]);
          return bill;
        })
      });
  }
}

export const billsRepository = new BillsRepository();
