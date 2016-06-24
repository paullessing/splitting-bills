import {billsRepository} from "./services/bills.repository";
import {database} from "./services/database.service";
import {User} from "./entities"

database.insert<User>('users', ['id', 'name'], {
  id: 3,
  name: 'Custom user'
}, {
  id: 5,
  name: 'User 5'
})
  .catch(err => console.log('Error', err))
  .then(() => database.close());
