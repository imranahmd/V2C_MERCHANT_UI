import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";

const {USER_KEY} = environment;

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {
  }

  clean(): void {
    localStorage.clear()
  }

  public saveUser(user: any): void {

    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  public getUserName(): any {
    const user = localStorage.getItem('user');
    if (user) {
      return user;
    }
    return {};
  }

  public isLoggedIn(): boolean {
    const user = localStorage.getItem(USER_KEY);
    return !!user;

  }

  public getToken(): string {
    const user: any = localStorage.getItem(USER_KEY);
    const userObj = JSON.parse(user);
    return userObj?.access_token || userObj?.token || null
  }

  public saveMenuItems(data:any): any{
    localStorage.setItem('menuItems', JSON.stringify(data));
  }

  public getMenuItems(): any{
    const menuString = localStorage.getItem('menuItems');
    return JSON.parse(menuString || "{}");
  }
}
