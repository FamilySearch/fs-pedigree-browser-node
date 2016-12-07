# fs-pedigree-browser-node

__Node.js sample app for using the [FamilySearch JS Lite SDK](https://github.com/FamilySearch/fs-js-lite).__

A live example of this app is available at https://fs-pedigree-browser-node.herokuapp.com/.

The primary purpose of the sample app is to provide working example code for 
using the sdk in Node.js. A secondary purpose of the sample app is to explore 
technical issues that need to be considered when using the sdk in a node app. 
Topics covered include:

* Authentication via OAuth 2
* Storing the access token and other data in a session
* Fetching a person's pedigree
* Fetching a person's portrait
* Configuring the SDK with environment variables
* Error handling

The solutions shown by this sample app are not intented to be canonical. There
is almost always more than one way to address a problem.

The source code if heavily documented. Please read it. This README only addresses
issues that didn't fit anywhere in the source code.

## Running Locally

1. Download and Install

    ```
    git clone https://github.com/FamilySearch/fs-pedigree-browser-node.git
    cd fs-pedigree-browser-node
    npm install
    ```
    
2. Register your app in the [FamilySearch Developer's center](https://grms.force.com/Developer/FSDev_CommunitiesCustomLogin?startURL=%2FFSDev_MyDevHomePage).
3. Update the value of `appKey` in `config/default.json` with the key assigned
to the app you just registered in the developer's center.
4. Run the app.

    ```
    npm run dev
    ```

## SDK Sample Code

The FS JS Lite SDK is used in the following files:

* `middleware/fs-client.js`
* `middleware/fs-session.js`
* `routes/signin.js`
* `routes/oauth-redirect.js`
* `routes/pedigree.js`

## Authentication

Authentication with the FamilySearch API is performed via [OAuth 2](https://familysearch.org/developers/docs/guides/authentication).
It begins when the user clicks the "Sign In" button on the home page or the link
in the header. That sends to user to the `/signin` URL on the app which then 
calls the sdk to generate the URL where the user must be forwarded to on
familysearch.org.

When the user successfully signs in with FamilySearch, they will be redirected
to the `/oauth-redirect` page with a `code` set as a query param. That code
is exchanged for an access token and the access token is stored in the session.
At that point authentication is complete.

## Sessions

This app uses sessions to keep track of a user's authentication and their
user profile (the username is displayed in the header). The sessions are stored
in memory by default for the sake of simplicity since it's a sample (alternatives
require setting up a db and that's a lot of work for sample app). But it's 
___VERY BAD___ idea to do this in production because it's a memory leak. Even if
the sessions are configured to expire, it would be trivial to initiate a bunch
of new sessions which would fill the available memory and crash your app.
[express-session](https://github.com/expressjs/session#compatible-session-stores)
has a large number of available storage adapters. Please use one.

An alternative is to store the FS access token in a cookie. You wouldn't want to
store the entire user profile in a cookie too so you could just store the
username or choose to not display the username in the header.

## Configuration via Environment Variables

The app uses [node-config](https://github.com/lorenwest/node-config) to enable
easy configuration in different environments. Typically you want your development
environments to use the integration FamilySearch system while your production
instance uses the production FamilySearch system. You might even have a staging
environment that uses the beta FamilySearch system.

node-config loads JSON configuration files from the `config` directory and
merges them with overrides occuring in [specific order](https://github.com/lorenwest/node-config/wiki/Configuration-Files).
The default file sets the app key and chooses the integration reference. In
staging we use the beta reference and in production we use the production reference.

You can add other configuration options for you app such as different database
credentials for your deployments.
