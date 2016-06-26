import {Bill, UserId} from "../entities";
import {BillRepository} from "./bill.repository";
import {Debt} from "../entities/debt";

interface Payment {
  userId: UserId;
  amount: number;
}

export interface BillBuilderFunctions {
  runInTransaction<T>(actions: () => Promise<T>): Promise<Bill>;
  saveBill(bill: Bill): Promise<Bill>;
  saveDebts(debts: Debt[]): Promise<Debt[]>;
}

export class BillBuilder {
  private description: string;

  private creditors: Payment[] = [];
  private debtors: Payment[] = [];

  private isBuilt: boolean = false;

  constructor(private functions: BillBuilderFunctions) {
  }

  public setDescription(description: string): BillBuilder {
    this.description = description;
    return this;
  }

  public addCreditor(creditorId: UserId, amount: number): BillBuilder {
    if (amount <= 0) {
      throw new Error('Amount must be positive!');
    }
    let creditor = this.creditors.find(creditor => creditor.userId === creditorId);
    if (creditor) {
      creditor.amount += amount;
    } else {
      this.creditors.push({ userId: creditorId, amount });
    }
    return this;
  }

  public addDebtor(debtorId: UserId, amount: number): BillBuilder {
    if (amount <= 0) {
      throw new Error('Amount must be positive!');
    }
    let debtor = this.debtors.find(debtor => debtor.userId === debtorId);
    if (debtor) {
      debtor.amount += amount;
    } else {
      this.debtors.push({ userId: debtorId, amount });
    }
    return this;
  }

  public build(): Promise<Bill> {
    if (this.isBuilt) {
      throw new Error('Already built this bill');
    }
    this.isBuilt = true;

    let totalAmountPaid = this.sumAmounts(this.creditors);
    let totalAmountOwed = this.sumAmounts(this.debtors);

    if (!Number.isFinite(totalAmountPaid)) {
      throw new Error(`Total amount paid ${totalAmountPaid} is not a finite number!`);
    }
    if (!Number.isFinite(totalAmountOwed)) {
      throw new Error(`Total amount owed ${totalAmountOwed} is not a finite number!`);
    }

    if (totalAmountPaid !== totalAmountOwed) {
      throw new Error(`Total amount paid (${totalAmountPaid}) does not match amount owed (${totalAmountOwed})`);
    }

    let bill = new Bill(
      totalAmountPaid,
      new Date(),
      this.description
    );

    let creditAmounts = this.creditors.map(creditor => creditor.amount);
    console.log('credit amounts', creditAmounts);

    return this.functions.runInTransaction<Bill>(() =>
      this.functions.saveBill(bill)
        .then(newBill => {
          let debts: Debt[] = this.debtors.map(debtor => {
            let debtAmounts = this.splitAcross(debtor.amount, creditAmounts);
            console.log('Split debt amounts', debtor.amount, creditAmounts, debtAmounts);
            return this.creditors.map((creditor, index) => {
              let newDebt = new Debt(newBill.id, debtAmounts[index], debtor.userId, creditor.userId, newBill.dateCreated);
              if (debtor.userId === creditor.userId) {
                newDebt.paidAt = newBill.dateCreated;
              }
              return newDebt;
            });
          }).reduce((acc, current) => acc.concat(current), []);

          return this.functions.saveDebts(debts)
            .then(debts => newBill.debts = debts)
            .then(() => newBill);
        })
    );
  }

  private splitAcross(totalValue: number, weights: number[]): number[] {
    let totalWeight: number = this.sum(weights);
    let currentTotal: number = 0;
    return weights.map((weight, index) => {
      if (index < this.creditors.length - 1) {
        let thisValue = Math.floor(totalValue * (weight / totalWeight) * 100000) / 100000;
        currentTotal += thisValue;
        return thisValue;
      } else {
        return totalValue - currentTotal;
      }
    });
  }

  private sumAmounts(payments: Payment[]): number {
    return this.sum(payments.map(payment => payment.amount));
  }

  private sum(values: number[]): number {
    return values.reduce((a, b) => a + b, 0);
  }
}
