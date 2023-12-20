// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  ecmain: true,
  serverUrl: 'https://localhost:5001',
  apiUrl: 'https://localhost:5001/api/',
  ecobankApi: 'https://secure.ecobank.com/source_pages/',
  captcha: '6LcSoA4nAAAAANGe8QlQhRk41u3GD1iSjY6X0j0y',
  captchaV2: '6Ld6H6AcAAAAAMSadRYDB_zVOXAwDAsyAVGwUk9G',
  defaultLang: 'en',
  langs: ['en', 'fr', 'pt'],
  langsFull: [
    {
      name: 'English',
      value: 'en',
    },
    {
      name: 'Français',
      value: 'fr',
    },
    {
      name: 'Português',
      value: 'pt',
    },
  ],
  logoutTime: 3600,
  websocketsUrl: 'https://localhost:5001/applicationsHub',
  domain: 'localhost',
  googleTagManagerCode: 'GTM-TK8HSFH',
  googleAnalyticsCode: 'G-CDMKJ2WLYY',
  dynamicYieldId: '9880533',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
