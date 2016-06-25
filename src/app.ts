import {userRepository} from "./services/user.repository";
import {database} from "./services/database.service";
import {User} from "./entities/user";

const errorHandler = (err: any) => console.log('Error in MAIN:', err);
const finallyClose = () => database.close();

database.enableDebug();

Promise.resolve()
  .then(() => userRepository.setup())
  .then(() => userRepository.create(new User('Paul Lessing ' + Math.floor(Math.random() * 1000))))
  .then(user => console.log('User', user))
  .then(() => userRepository.getAll()
    .then(users => {
      console.log(users);
    })
  )
  .catch(errorHandler)
  .then(finallyClose);
