export type UserId = number;

export interface IUser {
  id?: UserId;
  name: string;
}

export class User implements IUser {
  public id: UserId;
  public name: string;

  constructor(
    name: string
  ) {
    this.name = name;
  }

  static fromData(data: IUser): User {
    let user = new User(data.name);
    user.id = data.id;
    return user;
  }
}
