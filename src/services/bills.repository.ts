import {Bill, UserId} from "../entities";

export class BillsRepository {

  public getBillsForUser(userId: UserId): Promise<Bill[]> {
    return Promise.resolve([]);
  }
}
