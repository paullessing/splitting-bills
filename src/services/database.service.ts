import {DATABASE} from '../config';
import {createConnection, IConnection} from "mysql";

export class NoResultsFoundException {
  public toString(): string {
    return `NoResultsFoundException: No results found`;
  }
}

export class TooManyResultsFoundException {
  constructor(
    private resultCount: number
  ) {}

  public toString(): string {
    return `TooManyResultsFoundException: Expected one result, got ${this.resultCount}`;
  }
}

export class SqlException {
  constructor(
    public sqlError: any
  ) {}

  public toString(): string {
    return `SqlException: ${this.sqlError.toString()}`;
  }
}

const debugFunction = (query: string, args: any[]) => {
  console.log('SQL: ', query);
  if (args && args.length) {
    console.log('Args:', args);
  }
};

const returnNothing: () => void = () => {};

export class Database {
  private connection: IConnection;
  private debug: (query: string, args: any[]) => void;

  public init(): void {
    this.connection = createConnection({
      host     : DATABASE.host,
      user     : DATABASE.user,
      password : DATABASE.password,
      database : DATABASE.database
    });
    this.enableDebug(false);
  }

  public enableDebug(enable: boolean = true) {
    if (enable) {
      this.debug = debugFunction;
    } else {
      this.debug = () => {};
    }
  }

  public execute(query: string, ...args: any[]): Promise<void> {
    return this.doQuery<void>(query, args)
      .then(returnNothing);
  }

  /**
   * Insert into the given table.
   * @returns {Promise<number>} Promise which resolves with the ID of the inserted row.
     */
  public insert<T>(tableName: string, columns: string[], ...values: T[]): Promise<number> {
    let query: string = `INSERT INTO ${tableName} (`;
    query += columns.join(', ');
    query += ') VALUES ';
    query += [].concat(values).map((value: T) =>
      columns.map(key => this.connection.escape(value[key])) // TODO noImplicitAny
        .join(', '))
      .map(value => `(${value})`)
      .join(', ');

    return this.doQuery(query)
      .then((result: any) => (result as { insertId: number }).insertId);
  }

  public query<T>(query: string, ...args: any[]): Promise<T[]> {
    return this.doQuery(query, args);
  }

  public queryOne<T>(query: string, ...args: any[]): Promise<T> {
    return this.doQuery<T>(query, args)
      .then((rows: T[]) => {
        if (rows.length === 0) {
          throw new NoResultsFoundException();
        }

        if (rows.length > 1) {
          throw new TooManyResultsFoundException(rows.length);
        }

        return rows[0];
      });
  }

  public doesTableExist(tableName: string): Promise<boolean> {
    return this.queryOne('SHOW TABLES LIKE ?', tableName)
      .then(() => true)
      .catch(err => {
        if (err instanceof NoResultsFoundException) {
          return false;
        } else {
          throw err;
        }
      });
  }

  public ensureTableExists(tableName: string, tableDefinition: string): Promise<void> {
    return this.doesTableExist(tableName)
      .then((exists: boolean) => {
        if (!exists) {
          return this.execute(tableDefinition);
        }
      });
  }

  public dropTable(tableName: string): Promise<void> {
    return this.execute('DROP TABLE IF EXISTS ?', tableName);
  }

  public runInTransaction<T>(actions: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.connection.beginTransaction(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
      .then(actions)
      .then((result: T) => new Promise<T>((resolve, reject) => {
        this.connection.commit(err => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }))
      .catch(err => new Promise<T>((resolve, reject) => {
        this.connection.rollback(() => {
          reject(err);
        });
      }));
  }

  public close(): void {
    this.connection.end();
  }

  private doQuery<T>(query: string, args?: any[]): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      this.debug(query, args);
      this.connection.query(query, args, (err: any, rows: T[]) => {
        if (err) {
          reject(new SqlException(err));
          return;
        }

        resolve(rows);
      });
    });
  }
}

let instance = new Database();
instance.init();

export const database = instance;
