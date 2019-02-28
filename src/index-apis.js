const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

// TODO: Update APP_ID with your application ID (can be found in in Wix Developers under Workspace/OAuth)
const APP_ID = '6675f66b-b3ba-4207-9858-d9bf8eca8622';

// TODO: Update APP_SECRET with your application secret key (can be found in Wix Developers under Workspace/OAuth)
const APP_SECRET = '2787a489-c528-4970-8968-988c371d0d9e';

// TODO: Update WEBHOOK_VERIFICATION_ID with your WEBHOOK VERIFICATION ID (can be found under Workspace/Webhooks/Public-Key)
const WEBHOOK_VERIFICATION_ID = '430ba021-fd04-47fe-8f1c-2b8a72331b40';

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
  console.log('got webhook event from Wix:', {data});
  console.log("===========================");
  const data = jwt.verify(req.body, WEBHOOK_VERIFICATION_ID);
  incomingWebhooks.push({body: data, headers: req.headers});
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
  url = `${permissionRequestUrl}?token=${token}&appId=${appId}&redirectUrl=${redirectUrl}`

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
      `<HTML>
      <HEAD>
        <TITLE>Wix Application</TITLE>
      </HEAD>
      <BODY>
        <H1>Application ${APP_ID}</H1>
        <h3>Successfully installed on user's site name = ${instance.site.siteDisplayName}<h2>
        <h3>User's site with instanceId = ${instance.instance.instanceId}<h2>
        <h3><a href="/instance?token=${refreshToken}">Instance API</a> test<h3>
        <h3><a href="/products?token=${refreshToken}">Product API</a> test<h3>
        <h3><a href="/orders?token=${refreshToken}">Orders API</a> test<h3>
        <h3><a href="/payments?token=${refreshToken}">Payments API</a> test<h3>
      </BODY>
      </HTML>`);

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
      `<HTML>
      <HEAD>
        <TITLE>Wix Application</TITLE>
      </HEAD>
      <BODY>
        <H1>Application ${APP_ID}</H1>
        <h3>User's site name = ${instance.site.siteDisplayName}<h2>
        <h3>User's site with instanceId = ${instance.instance.instanceId}<h2>
        <pre>${JSON.stringify(instance, null, '\t')}</pre>
      </BODY>
      </HTML>`);
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
    storeProducts = await getProducts(refreshToken);
    
    res.status(200).send(
      `<HTML>
      <HEAD>
        <TITLE>Wix Application</TITLE>
      </HEAD>
      <BODY>
        <H1>Application ${APP_ID}</H1>
        <h3>Number of products in the Store is ${storeProducts.totalResults}<h3>
        <h3>The Wix Store's products:<h3>
        <pre>${JSON.stringify(storeProducts.products, null, "\t")}</pre>
      </BODY>
      </HTML>`);
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
    storeOrders = await getOrders(refreshToken);
    console.log(storeOrders);
    
    res.status(200).send(
      `<HTML>
      <HEAD>
        <TITLE>Wix Application</TITLE>
      </HEAD>
      <BODY>
        <H1>Application ${APP_ID}</H1>
        <h3>Number of orders in the Store is ${storeOrders.totalResults}<h3>
        <pre>${JSON.stringify(storeOrders, null, "\t")}</pre>
      </BODY>
      </HTML>`);
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
    transactions = await getPayments(refreshToken);
    console.log(transactions);

    res.status(200).send(
      `<HTML>
      <HEAD>
        <TITLE>Wix Application</TITLE>
      </HEAD>
      <BODY>
        <H1>Application ${APP_ID}</H1>
        <h3>Number of payments in the site is ${transactions.pagination.total}<h3>
        <pre>${JSON.stringify(transactions, null, "\t")}</pre>
      </BODY>
      </HTML>`);
  } catch (wixError) {
    console.log({wixError});
    res.status(500);
    return;
  }
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
    return response;
  } catch (e) {
    console.log({e});
    return;
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
    return response;
  } catch (e) {
    console.log({e});
    return;
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
    return response;
  } catch (e) {

    console.log({e});
    return;
  }
};
app.get('/', (_, res) => res.status(200).send('Hello Wix!'));

app.listen(port, () => console.log(`My Wix Application with Store is listening on port ${port}!`));
