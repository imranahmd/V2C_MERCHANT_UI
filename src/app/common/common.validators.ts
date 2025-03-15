import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';

// export function userExistsValidator(user: UserService):AsyncValidatorFn  {
//   return (control: AbstractControl) => {
//     return user.findUserByEmail(control.value)
//       .pipe(
//         map(user => user ? {userExists:true} : null)
//       );
//   }
// }
export const PAN_REG = /^[A-Z]{5}\d{4}[A-Z]$/;
export const CONSECUTIVE_SPACES = /^.*\s{2,}.*$/;
export function panCardValidator(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

    const value = control.value;

    if (!value) {
      return null;
    }

    const CHECK = PAN_REG.test(value);

    return !CHECK ? {pancard:true}: null;
  }
}
export function noWhiteSpaceValidator(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

    console.log("======", (control.value as string).indexOf(' '))

    if((control.value as string).indexOf(' ') >= 0){
      return {noWhiteSpace: true}
    }

    return null;
  }
}
export function moreThanOneWhiteSpaceValidator(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

    const value = control.value;

    if (!value) {
      return null;
    }

    const CHECK = CONSECUTIVE_SPACES.test(value);
    console.log(CHECK, "---->")

    return CHECK ? {twoSpaces:true}: null;
  }
}


export const setAllValidty = (form: FormGroup | FormArray, isRequired: boolean) => {
  Object.keys(form.controls).forEach((key) => {
    const control = form.get(key);
    if (control instanceof FormGroup || control instanceof FormArray) {
      setAllValidty(control, isRequired)
    } else {
      if (isRequired) {
        control?.setValidators([Validators.required,])
      } else {
        control?.setValidators(null);
      }
      control?.updateValueAndValidity();
    }
  })
}

export const getAllErrors = (form: FormGroup | FormArray): { [key: string]: any; } | null  =>{
  let hasError = false;
  const result = Object.keys(form.controls).reduce((acc, key) => {
    const control = form.get(key);
    // @ts-ignore
    const errors = (control instanceof FormGroup || control instanceof FormArray)
      ? getAllErrors(control)
      :control?.errors;
    if (errors) {
      acc[key] = errors;
      hasError = true;
    }
    return acc;
  }, {} as { [key: string]: any; });
  return hasError ? result:null;
}
