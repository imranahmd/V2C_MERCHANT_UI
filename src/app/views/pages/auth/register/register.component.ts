import {Component, Injector, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../auth.service";
import {StorageService} from "../../../../_services/storage.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  authService: any;
  form: any = {
    username: null,
    email: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private router: Router, private injector: Injector, private storageService: StorageService) {
  }

  ngOnInit(): void {
    this.authService = this.injector.get(AuthService);

  }

  onRegister(e: Event) {
    e.preventDefault();
    const {username, email, password} = this.form;
    this.authService.register(username, email, password).subscribe({
      next: (data: any) => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        this.storageService.saveUser(data);
      },
      error: (err: { error: { message: string; }; }) => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
    // localStorage.setItem('isLoggedin', 'true');

    if (this.storageService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

}
