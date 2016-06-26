import {Bill, UserId} from "../entities";
import {BillRepository} from "./bill.repository";

interface Payment {
  userId: UserId;
  amount: number;
}

export class BillBuilder {
  private description: string;

  private creditors: Payment[] = [];
  private debtors: Payment[] = [];

  private isBuilt: boolean = false;

  public setDescription(description: string): BillBuilder {
    this.description = description;
    return this;
  }

  public addCreditor(creditorId: UserId, amount: number): BillBuilder {
    if (amount <= 0) {
      throw new Error('Amount must be positive!');
    }
    this.creditors.push({ userId: creditorId, amount });
    return this;
  }

  public addDebtor(debtorId: UserId, amount: number): BillBuilder {
    if (amount <= 0) {
      throw new Error('Amount must be positive!');
    }
    this.debtors.push({ userId: debtorId, amount });
    return this;
  }

  public build(billRepository: BillRepository): Bill {
    if (this.isBuilt) {
      throw new Error('Already built this bill');
    }
    this.isBuilt = true;

    return null;
  }
}
