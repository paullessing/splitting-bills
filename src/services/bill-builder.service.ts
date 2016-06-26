import {BillId, Bill, BillAmount, UserId} from "../entities";
import {BillRepository} from "./bill.repository";
export class BillBuilder {
  private amount: number;
  private amountPaidByOwner: number;
  private payerId: UserId;
  private dateCreated: Date;
  private description: string;

  private amounts: BillAmount[] = [];

  private isBuilt: boolean = false;

  constructor(payerId: UserId, amount: number) {
    if (!payerId) {
      throw new Error('ID of paying user is required');
    }
    if (!amount || amount <= 0) {
      throw new Error('Non-negative amount required');
    }

    this.payerId = payerId;
    this.amount = amount;
  }

  public addDebtor(debtorId: UserId, amountOwed: number): BillBuilder {


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
