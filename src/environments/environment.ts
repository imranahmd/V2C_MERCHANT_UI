// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // API_URL: 'https://pg.payfi.co.in/Api',
  #API_URL: 'https://pg.payfi.co.in/Api',
  #PAY_URL: 'https://pg.payfi.co.in/pay',
  API_URL: 'http://13.235.248.165:8080/Api',  
  PAY_URL: 'http://13.235.248.165:8080/pay', 
  USER_KEY: 'logged-user',
  appSystem: 'af9d1620e1bd350400ca30a793782d21', //'MERCHANT_PORTAL',
  level3_exclude: ['Merchant Master', 'Reseller Onboarding', 'Self Onboarding'],
  defaultPageSize: 10,
  defaultPageSizeArr: [10, 20, 30, 40, 50]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
