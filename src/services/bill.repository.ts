import {Bill, DEBTS_TABLE_NAME, DEBTS_TABLE_DEFINITION, BILLS_TABLE_NAME, BILLS_TABLE_DEFINITION} from "../entities";
import {Database, database} from "./database.service";
import {BillBuilder} from "./bill-builder.service";
import {Debt, IDebt, DEBTS_TABLE_COLUMNS} from "../entities/debt";
import {BillId} from "../entities/ids";

export class BillRepository {

  constructor(
    private database: Database
  ) {}

  public setup(): Promise<void> {
    return Promise.resolve()
      .then(() => this.database.ensureTableExists(BILLS_TABLE_NAME, BILLS_TABLE_DEFINITION))
      .then(() => this.database.ensureTableExists(DEBTS_TABLE_NAME, DEBTS_TABLE_DEFINITION));
  }

  public builder(): BillBuilder {
    return new BillBuilder({
      runInTransaction: actions => this.database.runInTransaction(actions),
      saveBill: (bill: Bill) => this.saveBill(bill),
      saveDebts: (debts: Debt[]) => this.saveDebts(debts)
    });
  }

  private saveBill(bill: Bill): Promise<Bill> {
    return this.database.insert(BILLS_TABLE_NAME, ['amount' ,'isPaid', 'dateCreated', 'description'], bill)
      .then(billId => {
        bill.id = billId;
        return bill;
      });
  }

  private saveDebts(debts: Debt[]): Promise<Debt[]> {
    if (debts.length === 0) {
      return Promise.resolve([]);
    }
    return this.database.insert(DEBTS_TABLE_NAME, DEBTS_TABLE_COLUMNS, ...debts)
      .then(() => this.getDebtsForBill(debts[0].billId))
  }

  private getDebtsForBill(billId: BillId): Promise<Debt[]> {
    return this.database.query(`
SELECT
  id,
  billId,
  debtorId,
  creditorId,
  amount,
  createdAt,
  paidAt
FROM
  ${DEBTS_TABLE_NAME}
WHERE
  billId = ?
ORDER BY id ASC
`,
    billId)
      .then((data: IDebt[]) =>
        data.map(Debt.fromData)
      );
  }
}

export const billRepository = new BillRepository(database);
