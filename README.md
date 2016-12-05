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

## Running Locally

1. Download and Install

    ```
    git clone https://github.com/FamilySearch/fs-pedigree-browser-node.git
    cd fs-pedigree-browser-node
    npm install
    ```
    
2. Register you app in the [FamilySearch Developer's center](https://grms.force.com/Developer/FSDev_CommunitiesCustomLogin?startURL=%2FFSDev_MyDevHomePage).
3. Update the value of `appKey` in `config/default.json` with the key assigned
to the app you just registered in the developer's center.
4. Run the app.

    ```
    npm run dev
    ```
