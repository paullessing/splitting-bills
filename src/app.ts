import {userRepository} from "./services/user.repository";
import {database} from "./services/database.service";
import {User} from "./entities/user";
import {billRepository} from "./services/bill.repository";

const errorHandler = (err: any) => console.log('Error in MAIN:', err);
const finallyClose = () => database.close();

database.enableDebug();

Promise.resolve()
  .then(() => billRepository.setup())
  .then(() => {
    let builder = billRepository.builder();
    return builder.addCreditor(2, 19)
      .addCreditor(3, 31)
      .addDebtor(4, 13)
      .addDebtor(5, 37)
      .setDescription('Two on two')
      .build();
  })
  .then(bill => console.log(bill))
  .catch(errorHandler)
  .then(finallyClose);
