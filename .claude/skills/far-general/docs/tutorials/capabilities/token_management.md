# Token Management

To use our SDK in your project, you need to have an SDK token. The FAQ below explains our token management process and guides you on how to store and update tokens after their expiration. Please, read all the information carefully.

## What is an SDK token?[​](#what-is-an-sdk-token "Direct link to What is an SDK token?")

An SDK token is an automatically generated set of characters in .txt format unique to each client. It activates the licenced SDK functionality in the client app. There are two types of tokens:

* A demo token is provided to start the SDK trial. It's *valid for 14 days*, our standard trial period. The token activates all SDK features for you to assess the SDK performance in your project.
* A commercial token is provided after you make payment. It’s *valid throughout the prepaid period*. The token activates the SDK features defined by your software licence.

note

Once the token expires, the Banuba watermark and screen blur will appear automatically in your app.

Therefore, please:

* Don’t use demo tokens in live apps.
* Observe payments of your SDK license and renew the commercial token on time.

## Why do we use tokens?[​](#why-do-we-use-tokens "Direct link to Why do we use tokens?")

The token system helps us to manage billing, as well as protects our software from frauds, inappropriate and unconditioned usage that violates the SDK licensing terms.

## How do I get one?[​](#how-do-i-get-one "Direct link to How do I get one?")

* To get the demo token and start the SDK trial, please contact your sales manager or [send us a request](https://www.banuba.com/facear-sdk/face-filters#form) via the website form.
* The commercial token is generated and sent out by your account manager who guides your project within our company.

## How does it work?[​](#how-does-it-work "Direct link to How does it work?")

**Token storage**

We recommend storing your token on the server as it drastically speeds up the process of token renewal.

caution

If you store the token in the app, you will have to to upload its newest version to the App Store or Play Market after you renew the token.

**Expiry and renewal**

Tokens are valid only throughout the predefined period of time. For one month after the expiration date, you can still use the SDK in your app, but it will display Banuba watermark. After that, the SDK will stop working entirely, though the app will otherwise work normally. Extending the existing token’s life will be impossible. You will have to receive a new one. See the explanation of token expiration below:

| Token expired?                  | What happens with Face AR SDK    |
| ------------------------------- | -------------------------------- |
| No                              | Works as expected                |
| Yes, <!-- --><=<!-- --> 1 month | Works but watermark is displayed |
| Yes, > 1 month                  | Functionality won't work         |

To restore the access, you need to request a new token and renew it in your app.

* **Demo tokens** may be renewed per client’s request in case the client hasn’t had enough time to evaluate the SDK.
* **Commercial tokens** are renewed by an account manager only after the client’s pre-payment for an agreed period.

**Other questions left?**

Please, read all the information carefully and feel free to [contact us](/support/.md) if you have more questions.
