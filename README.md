## Quick start

0. clone this repo<br/>
    git clone git@github.com:shaykewix/sample-wix-rest-app.git
1. update APP_ID with your application id
2. update APP_SECRET with your application seceret
3. update WEBHOOK_VERIFICATION_ID with your WEBHOOK VERIFICATION ID
4. run ngrok to get https proxy to your server:
    ngrok http 3000
5. configure "Redirect URL" in Wix Developpers to https://[Your ngrok identity].ngrok.io/login
6. configure "App URL" in Wix Developpers to https://[Your ngrok identity].ngrok.io/signup
7. Run your server<br/>
    npm install<br/>
    npm build<br/>
    npm start<br/>
