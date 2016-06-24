import {Bill, UserId} from "../entities";
import {database, NoResultsFoundException} from "./database.service";
import {IBill} from "../entities/bill";

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
  UNIQUE KEY (billId, userId)
);
          `)
        }
      });
  }

  public getBillsForUser(userId: UserId): Promise<Bill[]> {
    // database.query<any[]>('SELECT * FROM bills WHERE userId = ?', userId)
    //   .then((data: any[]) => {
    //
    //   });

    return Promise.resolve([]);
  }
}

export const billsRepository = new BillsRepository();
