# Firebase Admin Node.js Session Management Quickstart

This sample app demonstrates how to use Firebase `httpOnly` session cookies
with the Firebase Admin SDK session management API.

## Table of Contents

1. [Developer Setup](#developer-setup)

## Developer Setup

### Dependencies

To set up a development environment to build the sample from source, you must
have the following installed:
- Node.js (>= 6.0.0)
- npm (should be included with Node.js)

Download the sample application source and its dependencies with:

```bash
git clone https://github.com/firebase/quickstart-nodejs.git
cd quickstart-nodejs/auth-sessions
npm install
```

### Configuring the app

In the Firebase Console, make sure Email/Password and Google providers are enabled.

In the root folder `./auth-sessions`, create a `config.js` file:

```javascript
var config = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  storageBucket: "...",
  messagingSenderId: "..."
};
module.exports = config;
```
Copy and paste the Web snippet code configuration found in the console to the `config.js` file.
You can find the snippet either by clicking the "Web setup" button in the Firebase Console
Authentication page.

Ensure the application authorized domain is also whitelisted. `localhost` should already be set
as an authorized OAuth domain.

Since the application is using the Firebase Admin SDK, service account credentials will be
required. In the Firebase Console, go to "Project Settings" and select "SERVICE ACCOUNTS".
Generate a new private key and save it in the root folder `./auth-sessions` as
`serviceAccountKeys.json`.
Make sure to keep these credentials secret and never expose them in public.

### Building Sample app

To build and run the sample app, run:
```bash
npm run demo
```

This will launch a local server using port 3000.
To access the app, go to [http://localhost:3000/](http://localhost:3000)


