import {
  Bill,
  IBill,
  UserId,
  DEBTS_TABLE_NAME,
  DEBTS_TABLE_DEFINITION,
  BILLS_TABLE_NAME,
  BILLS_TABLE_DEFINITION
} from "../entities";
import {database} from "./database.service";

export class BillRepository {

  public setup(): Promise<void> {
    return Promise.resolve()
      .then(() => database.doesTableExist(BILLS_TABLE_NAME))
      .then((exists: boolean) => {
        if (!exists) {
          return database.execute(BILLS_TABLE_DEFINITION, BILLS_TABLE_NAME)
        }
      })
      .then(() => database.doesTableExist(DEBTS_TABLE_NAME))
      .then((exists: boolean) => {
        if (!exists) {
          return database.execute(DEBTS_TABLE_DEFINITION);
        }
      });
  }

  // public findByPayerId(userId: UserId): Promise<Bill[]> {
  //   return this.findWhere(`b.payerId = ?`, userId);
  // }

  private findWhere(whereClause: string, ...args: any[]): Promise<Bill[]> {
    return null;
//     let query = `
// SELECT
//   b.id,
//   b.amount,
//   b.isPaid,
//   b.dateCreated,
//   b.description
// FROM
//   ${BILLS_TABLE_NAME} b
// ORDER BY b.id ASC
// `;
//     return database.query<any>(query, ...args)
//       .then((rows: any[]) => {
//         let bills: {[id: number]: [IBill, BillAmount[]] } = {};
//         rows.forEach((row: any) => {
//           let billAmount = this.getBillAmount(row);
//           let bill = bills[row.id];
//           if (!bill) {
//             bills[row.id] = bill = [
//               row,
//               []
//             ];
//           }
//           bill[1].push(billAmount);
//         });
//         return Object.keys(bills).map(key => {
//           let data: [IBill, BillAmount[]] = bills[key];
//           return new Bill(data[0], data[1]);
//         });
//       });
  }

  // private getBillAmount(row: any): BillAmount {
  //   let data = {
  //     id: row.amount_id,
  //     billId: row.amount_billId,
  //     userId: row.amount_userId,
  //     amount: row.amount_amount,
  //     amountOutstanding: row.amount_amountOutstanding,
  //     isCredit: row.amount_isCredit
  //   }
  //   return BillAmount.fromData(data);
  // }
}

export const billRepository = new BillRepository();
