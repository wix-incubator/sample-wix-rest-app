const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const config = require('./config');
const credentials = require('./credentials')

const APP_ID = config.APP_ID;
const APP_SECRET = credentials.APP_SECRET;
const PUBLIC_KEY = config.PUBLIC_KEY;
const AUTH_PROVIDER_BASE_URL = 'https://www.wix.com/oauth';
const INSTANCE_API_URL = 'https://dev.wix.com/api/v1';
const STORE_CATALOG_API_URL = 'https://www.wix.com/_api/catalog-server/api/v1';
const STORE_ORDERS_API_URL = 'https://www.wix.com/_api/orders-server/v2/';
const PAYMENS_API_URL = 'https://cashier.wix.com/_api/payment-services-web/merchant/v2/';

const app = express();
const port = process.env.PORT || 3000;
const incomingWebhooks = [];

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'statics')));

function getTokensFromWix (authCode) {
  return axios.post(`${AUTH_PROVIDER_BASE_URL}/access`, {
    code: authCode,
    client_secret: APP_SECRET,
    client_id: APP_ID,
    grant_type: "authorization_code",
  }).then((resp) => resp.data);
}

function getAccessToken (refreshToken) {
  return axios.post(`${AUTH_PROVIDER_BASE_URL}/access`, {
    refresh_token: refreshToken,
    client_secret: APP_SECRET,
    client_id: APP_ID,
    grant_type: "refresh_token",
  }).then((resp) => resp.data);
}


app.post('/webhook-callback', (req, res) => {
  console.log('got webhook event from Wix!', req.body);
  console.log("===========================");
  const data = jwt.verify(req.body, PUBLIC_KEY);
  const parsedData =  JSON.parse(data.data);
  const prettyData = {...data, data: {...parsedData, data: JSON.parse(parsedData.data)}};
  console.log('webhook event data after verification:', prettyData);
  incomingWebhooks.push({body: prettyData, headers: req.headers});
  res.send(req.body);
});

app.get('/signup', (req, res) => {
  // This route route is called before the user is asked for a consent - usually your application page will ask him to signup/login to your application
  // The `Redirect URL` in the Wix Developers should be configured to point here
  // *** PUT YOUR SIGNUP CODE HERE *** ///
  console.log("got a call from Wix for signup");
  console.log("==============================");

  const permissionRequestUrl = 'https://www.wix.com/app-oauth-installation/consent';
  const appId = APP_ID;
  const redirectUrl = `https://${req.get('host')}/login`;
  const token = req.query.token;
  var url = `${permissionRequestUrl}?token=${token}&appId=${appId}&redirectUrl=${redirectUrl}`

  console.log("redirecting to " + url);
  console.log("=============================");
  res.redirect(url);
});

app.get('/login',async (req, res) => {
  // This route route is called once the user finished installing your application and Wix redirecting him to your Application's site (here).
  // The `App URL` in the Wix Developers should be configured to point here
  // *** PUT YOUR LOGIN CODE HERE *** ///
  console.log("got a call from Wix for login");
  console.log("=============================");

  const authorizationCode = req.query.code;

  console.log("authorizationCode = " + authorizationCode);

  let refreshToken, accessToken;
  try {
    console.log("getting Tokens From Wix ");
    console.log("=======================");
    const data = await getTokensFromWix(authorizationCode);

    refreshToken = data.refresh_token;
    accessToken = data.access_token;

    console.log("refreshToken = " + refreshToken);
    console.log("accessToken = " + accessToken);
    console.log("=============================");

    instance = await getAppInstance(refreshToken);

    console.log("api call to instance returned: ");
    console.log(instance);

    // TODO: save instaceId and the tokens for future API calls
    console.log("=============================");
    console.log(`User's site instanceId: ${instance.instance.instanceId}`);
    console.log("=============================");

    res.status(200).send(
      `<html>
      <head>
        <title>Wix Application</title>
      </head>
      <body>
        <h1>Your app ${APP_ID} has been successfully intalled on a user's site: ${instance.site.siteDisplayName}<h1>
        <h3>Your user's site instance ID is: ${instance.instance.instanceId}<h3>
        <p>
        The user has granted you the following permissions: ${instance.instance.permissions}<br>
        Request more permissions for your app in <a href="https://dev.wix.com/dc3/my-apps/${APP_ID}/workspace/permissions" target="_blank">Wix Developers</a>
        <p>
        Get your user's site data with the <a href="https://dev.wix.com/docs/api/app-instance/guides/Introduction" target="_blank">App Instance API</a>
        - <a href="/instance?token=${refreshToken}">test</a>
        <p>
        Access your user's store catalog with the <a href="https://dev.wix.com/docs/api/stores-catalog/guides/Introduction" target="_blank">Wix Stores Catalog API</a>
        - <a href="/products?token=${refreshToken}">test</a>
        <p>
        Access your user's store orders with the <a href="https://dev.wix.com/docs/api/stores-orders/guides/Introduction" target="_blank">Wix Stores Orders API</a>
        - <a href="/orders?token=${refreshToken}">test</a>
        <p>
        Access your user's paid transactions with the <a href="https://dev.wix.com/docs/api/payments/guides/Introduction" target="_blank">Wix Payments API</a>
        - <a href="/payments?token=${refreshToken}">test</a>
        <p>
        View the latest webhooks sent to your app from Wix <a href="/webhooks">here</a><br>
        Register for webhooks to receive event data from Wix in <a href="https://dev.wix.com/dc3/my-apps/${APP_ID}/workspace/webhooks" target="_blank">Wix Developers</a></br>
      </body>
      </html>`);

  } catch (wixError) {
    console.log("Error getting token from Wix");
    console.log({wixError});
    res.status(500);
    return;
  }});

app.get('/instance',async (req, res) => {
  
  const refreshToken = req.query.token;

  console.log("refreshToken = " + refreshToken);

  try {
    instance = await getAppInstance(refreshToken);

    res.status(200).send(
      `<html>
      <head>
        <title>Wix Application</title>
      </head>
      <body>
        <h1>Application ${APP_ID}</h1>
        <h3>User's site name = ${instance.site.siteDisplayName}<h2>
        <h3>User's site with instanceId = ${instance.instance.instanceId}<h2>
        <pre>${JSON.stringify(instance, null, '\t')}</pre>
      </body>
      </html>`);
  } catch (wixError) {
    console.log("Error getting token from Wix");
    console.log({wixError});
    res.status(500);
    return;
  }
});

app.get('/products',async (req, res) => {
  
  const refreshToken = req.query.token;

  console.log("refreshToken = " + refreshToken);

  try {
    out = await getProducts(refreshToken);
    storeProducts = out.response;
    
    if (storeProducts) {
      res.status(200).send(
        `<html>
        <head>
          <title>Wix Application</title>
        </head>
        <body>
          <h1>Application ${APP_ID}</h1>
          <h3>Number of products in the Store is ${storeProducts.totalResults}<h3>
          <h3>The Wix Store's products:<h3>
          <pre>${JSON.stringify(storeProducts.products, null, "\t")}</pre>
        </body>
        </html>`);
    } else {
      var message;
      switch (out.code) {
        case 401: 
          message = `Got 401 - Are you sure you have a Wix Store in your site?`;
          break;
        case 403: 
          message = `Got 403 - No Permissions for Stores. You can add permissions to your application in <a href="https://dev.wix.com/dc3/my-apps/${APP_ID}/workspace/permissions">Wix Developers</a>.`;
          break;
        case 404: 
          message = 'Got 404 - Check your api route';
          break;
        default:
        message = `Got ${out.code}`;
      }  
      res.status(200).send(`<html><body><pre>${message}</pre></body></html>`);
    }
  } catch (wixError) {
    console.log("Error getting token from Wix");
    console.log({wixError});
    res.status(500);
    return;
  }
});

app.get('/orders',async (req, res) => {
  
  const refreshToken = req.query.token;

  console.log("refreshToken = " + refreshToken);

  try {
    out = await getOrders(refreshToken);  
    storeOrders = out.response;

    if (storeOrders) {
      res.status(200).send(
        `<html>
        <head>
          <title>Wix Application</title>
        </head>
        <body>
          <h1>Application ${APP_ID}</h1>
          <h3>Number of orders in the Store is ${storeOrders.totalResults}<h3>
          <pre>${JSON.stringify(storeOrders, null, "\t")}</pre>
        </body>
        </html>`);
    } else {
      var message;
      switch (out.code) {
        case 401: 
          message = `Got 401 - Are you sure you have a Wix Store in your site?`;
          break;
        case 403: 
          message = `Got 403 - No Permissions for orders. You can add permissions to your application in <a href="https://dev.wix.com/dc3/my-apps/${APP_ID}/workspace/permissions">Wix Developers</a>.`;
          break;
        case 404: 
          message = 'Got 404 - Check your api route';
          break;
        default:
        message = `Got ${out.code}`;
      }  
      res.status(200).send(`<html><body><pre>${message}</pre></body></html>`);
    }
  } catch (wixError) {
    console.log("Error getting token from Wix");
    console.log({wixError});
    res.status(500);
    return;
  }
});

app.get('/payments',async (req, res) => {
  
  const refreshToken = req.query.token;

  console.log("refreshToken = " + refreshToken);

  try {
    out =  await getPayments(refreshToken);
    transactions = out.response;

    if (transactions) {
      res.status(200).send(
        `<html>
        <head>
          <title>Wix Application</title>
        </head>
        <body>
          <h1>Application ${APP_ID}</h1>
          <h3>Number of payments in the site is ${transactions.pagination.total}<h3>
          <pre>${JSON.stringify(transactions, null, "\t")}</pre>
        </body>
        </html>`);
    } else {
      var message;
      switch (out.code) {
        case 403: 
          message = `Got 403 - No Permissions for payments. You can add permissions to your application in <a href="https://dev.wix.com/dc3/my-apps/${APP_ID}/workspace/permissions">Wix Developers</a>.`;
          break;
        case 404: 
          message = 'Got 404 - Check your api route';
          break;
        default:
        message = `Got ${out.code}`;
      }  
      res.status(200).send(`<html><body><pre>${message}</pre></body></html>`);
    }
  } catch (wixError) {
    console.log({wixError});
    res.status(500);
  }
});

app.get('/webhooks',async (req, res) => {
  res.status(200).send(
    `<html>
    <head>
      <title>Wix Application</title>
    </head>
    <body>
      <h1>Application ${APP_ID}</h1>
      <h3>Webhooks received from Wix:<h3>
      <pre>${JSON.stringify(incomingWebhooks, null, 2)}</pre>
    </body>
    </html>`);
});

// this is sample call to Wix instance API - you can find it here: https://dev.wix.com/docs/api/app-instance/guides/Introduction
async function getAppInstance(refreshToken)
{
  try {
    console.log('getAppInstance with refreshToken = '+refreshToken);
    console.log("==============================");
    const {access_token} = await getAccessToken(refreshToken);
    console.log('accessToken = ' + access_token);

    const body = {
      // *** PUT YOUR PARAMS HERE ***
      //query: {limit: 10},
    };
    const options = {
      headers: {
        authorization: access_token,
      },
    };
    const appInstance = axios.create({
      baseURL: INSTANCE_API_URL,
      headers: {authorization: access_token}
    });
    const instance = (await appInstance.get('instance', body)).data;

    return instance;
  } catch (e) {
    console.log('error in getAppInstance');
    console.log({e});
    return;
  }
};

// this is sample call to Wix Product API - you can find it here: https://dev.wix.com/docs/api//stores-catalog/reference/product/query-products
async function getProducts(refreshToken)
{
  try {
    const {access_token} = await getAccessToken(refreshToken);
    const body = {
      // *** PUT YOUR PARAMS HERE ***
    };
    const options = {
      headers: {
        authorization: access_token,
      },
    };
    const appInstance = axios.create({
      baseURL: STORE_CATALOG_API_URL,
      headers: {authorization: access_token}
    });

    const response = (await appInstance.post('products/query', body)).data;
    console.log(response);
    return {response: response, code: 200};
  } catch (e) {
    console.log({e});
    return {code: e.response.status};
  }
};

// this is sample call to Wix Orders API - you can find it here: https://dev.wix.com/docs/api//stores-orders/reference/order--v2/v2-query-orders
async function getOrders(refreshToken)
{
  try {
    const {access_token} = await getAccessToken(refreshToken);
    const body = {
      // *** PUT YOUR PARAMS HERE ***
    };
    const options = {
      headers: {
        authorization: access_token,
      },
    };
    const appInstance = axios.create({
      baseURL: STORE_ORDERS_API_URL,
      headers: {authorization: access_token}
    });

    const response = (await appInstance.post('orders/query', body)).data;
    return {response: response, code: 200};
  } catch (e) {
    console.log({e});
    return {code: e.response.status};
  }
};

// this is sample call to Wix Payments API - you can find it here: https://dev.wix.com/docs/api//payments/reference/transaction/transactions-list
async function getPayments(refreshToken)
{
  try {
    const {access_token} = await getAccessToken(refreshToken);
    const body = {
      // *** PUT YOUR PARAMS HERE ***
    };
    const options = {
      headers: {
        authorization: access_token,
      },
    };
    const appInstance = axios.create({
      baseURL: PAYMENS_API_URL,
      headers: {authorization: access_token}
    });

    const response = (await appInstance.get('transactions', body)).data;
    return {response: response, code: 200};
  } catch (e) {
    console.log({e});
    return {code: e.response.status};
  }
};
app.get('/', (_, res) => res.status(200).send('Hello Wix!'));

app.listen(port, () => console.log(`My Wix Application ${APP_ID} is listening on port ${port}!`));
