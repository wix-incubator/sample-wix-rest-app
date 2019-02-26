# Wix App - oAuth & REST API Demo Application
### **Overview**

This boilerplate will make it easy for you to [start developing](http://dev.wix.com/) your [Wix app](https://www.wix.com/app-market/main).
## Description

This project is a sample Wix application that uses oAuth and REST APIs.
Clone/download the project, configure your application, run & have fun!

## Quick start
1. Create an Application in [Wix Developers](http://dev.wix.com/)
2. Clone this repo<br/>
    `git clone git@github.com:shaykewix/sample-wix-rest-app.git`
3. Update your application data in the index.js file:
    * Update APP_ID with your application id
    * Update APP_SECRET with your application seceret
    * Update WEBHOOK_VERIFICATION_ID with your WEBHOOK VERIFICATION ID
4. In [Wix Developers](http://dev.wix.com/myapps) update your applic ation with the oAuth data:
    * Configure "Redirect URL" in Wix Developpers to https://[Your ngrok identity].ngrok.io/login
    * Configure "App URL" in Wix Developpers to https://[Your ngrok identity].ngrok.io/signup
5. Run ngrok to get https proxy to your server:
    `ngrok http 3000`
6. Run your server<br/>
    `npm install`<br/>
    `npm build`<br/>
    `npm start`<br/>
