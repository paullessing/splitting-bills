import {DATABASE} from '../config';
import {createConnection, IConnection} from "mysql";

export class Database {
  private connection: IConnection;

  public init(): void {
    this.connection = createConnection({
      host     : DATABASE.host,
      user     : DATABASE.user,
      password : DATABASE.password,
      database : DATABASE.database
    });
  }

  public query<T>(query: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      this.connection.query(query, (err: any, rows: T[]) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
    });
  }

  public queryOne<T>(query: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.connection.query(query, (err: any, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        if (rows.length !== 1) {
          reject(`Attempted to query for a single result but got ${rows.length}`);
          return;
        }

        resolve(rows[0]);
      });
    });
  }

  public close(): void {
    this.connection.end();
  }
}

let instance = new Database();
instance.init();

export const database = instance;
