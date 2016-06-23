import {database} from "./services/database.service";

database.query('SELECT * FROM users')
  .then(result => console.log('query', result))
  .catch(err => console.log('error', err));
database.queryOne('SELECT * FROM users WHERE id = 1')
  .then(result => console.log('query', result))
  .catch(err => console.log('error', err));
database.queryOne('SELECT * FROM users')
  .then(result => console.log('query', result))
  .catch(err => console.log('error', err));
database.queryOne('SELECT * FROM users WHERE id = 3')
  .then(result => console.log('query', result))
  .catch(err => console.log('error', err));
database.close();
