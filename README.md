## Description

This project is a sample Wix application that uses oAuth and REST APIs.
Clone/download the project, configure your application, run & have fun!

## Quick start
0. Clone this repo<br/>
    git clone git@github.com:shaykewix/sample-wix-rest-app.git
1. Update APP_ID with your application id
2. Update APP_SECRET with your application seceret
3. Update WEBHOOK_VERIFICATION_ID with your WEBHOOK VERIFICATION ID
4. Run ngrok to get https proxy to your server:
    ngrok http 3000
5. Configure "Redirect URL" in Wix Developpers to https://[Your ngrok identity].ngrok.io/login
6. Configure "App URL" in Wix Developpers to https://[Your ngrok identity].ngrok.io/signup
7. Run your server<br/>
    npm install<br/>
    npm build<br/>
    npm start<br/>
