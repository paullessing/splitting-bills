import {BillsRepository} from "./services/bills.repository";

let repository = new BillsRepository();
repository.getBillsForUser(null).then(() => {
  console.log('resolved');
});
