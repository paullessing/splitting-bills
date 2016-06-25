import {database} from "./database.service";
import {UserId} from "../entities";
import {User, IUser} from "../entities/user";

const USERS_TABLE_NAME = 'user';

function mapUserFromRow(row: IUser) {
  return User.fromData(row);
}

export class UserRepository {
  public setup(): Promise<void> {
    return Promise.resolve()
      .then(() => database.doesTableExist(USERS_TABLE_NAME))
      .then((exists: boolean) => {
        if (!exists) {
          return database.execute(`
CREATE TABLE ${USERS_TABLE_NAME} (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL
);
`)
        }
      });
  }

  public findById(userId: UserId): Promise<User> {
    let query = `
SELECT
  u.id,
  u.name
FROM
  ${USERS_TABLE_NAME} u
WHERE
  u.id = ?
`;
    return database.queryOne(query, userId)
      .then(mapUserFromRow);
  }

  public getAll(): Promise<User[]> {
    let query = `
SELECT
  u.id,
  u.name
FROM
  ${USERS_TABLE_NAME} u
ORDER BY u.id ASC
`;
    return database.query(query)
      .then((users: IUser[]) => users.map(mapUserFromRow));
  }

  public create(user: User): Promise<User> {
    return database.insert(USERS_TABLE_NAME, ['name'], user)
      .then((id: number) => {
        user.id = id;
        return user;
      });
  }
}

export const userRepository = new UserRepository();
