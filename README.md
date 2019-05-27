# Tutorial: Create your first Wix application on your machine
In this tutorial we go over how to create a Wix application that interacts with the Wix platform that you will can submit to the Wix App Market, where Wix site owners can deploy it on their sites.   
## 1. Set up your app in a Wix Developers account 
A. Log in (or sign up) to [Wix Developers](https://dev.wix.com/).

B. Click 

![Create New App](images/create-app.png)

You should get this screen:

![New App](images/New-App.png)

C. Go to Workspace > OAuth and copy your `App ID` and `App Secret Key`. You will need them later.
 
![oaurg](images/oauth-settings.png)

## 2. Set up the application to receive inbound HTTPS connections
Since most developers machine are not open for inbound connection and don't have HTTPS certificates, we will describe the process using **ngrok**.
(If you are hosting your application on a server without these restrictions, you can skip this step.)

Install and run [ngrok](https://dashboard.ngrok.com/get-started)

**Note:** Start an HTTP tunnel on the port your app is listening on  (default is 3000)
You should get something like this:

![ngrok screen](images/ngrok.png)

**Don't close the ngrok process** - You will need it running for the entire process.

## 3. Set up your application URLs
A. Go to Workspace > OAuth
B. In **`Redirect URL`** enter: `https://<12345678>.ngrok.io/login`
C. In **`App URL`** enter: `https://<12345678>.ngrok.io/signup`  
**Remember to replace '12345678' with ** your ngrok string you got above.**
for example:

![Listening](images/httpsurl.png)


![update application urls](images/urls.png)

D. Click Save.

![save](images/save.png)

## 4. Register your application to receive your first webhook
A. Go to Workspace > Webhooks and add a new webhook.

![New App](images/new-webhook.png)

B. Select the wix_developers category and the APP_PROVISIONED_WEBHOOK event.

![New webhook](images/add-webhook.png)

C. Set up the webhook callback URL to https://<12345678>.ngrok.io/webhook-callback.

![webhook url](images/webhook-callback.png)  

**Remember to replace '12345678' with ** your ngrok string you got above.**

D. Click Save.
Now you should see your Public key on the bottom of the screen. copy your `Public key`. You will need it later.

![public key](images/get-public-key.png)


## 5. Create and run your app

A. Download and install [npm](https://www.npmjs.com/get-npm)

B. Clone the [Wix Sample Application](https://github.com/shaykewix/sample-wix-rest-app) to your machine

C. In the **config.js file (in the `src` folder)**: 
 - find and replace the APP_ID with the value you copied from Wix Developers:
![Change app id](images/change-config.png)   
 -  find and replace the PUBLIC_KEY with the value you copied from Wix Developers:
![Change public key](images/change-public-key.png)  

D. In the **credentials.js file (in the `src` folder)** find and replace the APP_SECRET  with the value you copied from Wix Developers:
![Change app secret](images/change-credentials.png)

E. Run your app

* Browse to the cloned sample application
* Run `npm install`
* Run `npm build`
* Run `npm start`

You should get something like this:

![Listening](images/listening.png)


Well done! Now it's time to make sure your app works as expected.

## 6. Test your app

A. Click `Test Your App`
![test your app](images/test-button.png)

B. Select a site and click `Test Your App`

![site selector](images/site-selector.png)

C. When prompted, click `Add To Site`:

![site selector](images/add-to-site.png)

D. Provide consent for the app to collect data by clicking `Allow and Install`:

![site selector](images/consent.png)

E. You should get a print into the browser with your application ID and your site instance ID:
![site selector](images/end.png)

# Congrats, you're done!
## Now you can add your Application logic and Other WIX APIs.
