# EU DCC Rules

This is an overview of the currently available EU entry rules, DE Domestic rules, and DE Booster Notification rules.

[timokoenig.github.io/eu-dcc-rules](https://timokoenig.github.io/eu-dcc-rules)

Note: This repository and its content is a community project. It is not an official product from RKI, BMG, or the EU.

## More information

- [EU Digital Covid Certificate Documentation](https://ec.europa.eu/info/live-work-travel-eu/coronavirus-response/safe-covid-19-vaccines-europeans/eu-digital-covid-certificate_en)
- [PDF EU DCC Validation Rules](https://ec.europa.eu/health/system/files/2021-06/eu-dcc_validation-rules_en_0.pdf)
- [Implementation Details](https://github.com/ehn-dcc-development/dgc-business-rules)

## Update Rules

The script downloads the DCC rules from the national backend in Germany and saves them in the following files:

- EU Entry Rules [eu-dcc-rules.json](./eu-dcc-rules.json)
- DE Domestic Rules [de-dcc-rules.json](./de-dcc-rules.json)
- DE Booster Notification Rules [de-bn-rules.json](./de-bn-rules.json)

```sh
npm install
npm start
```

Note: The json files with all rules get automatically updated every 24 hours via Github Action.

## Disclaimer

There is no guarantee that the information published on the web page is accurate, complete and up to date.
