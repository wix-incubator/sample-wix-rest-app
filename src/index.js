const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

// TODO: Update APP_ID with your application ID (can be found in in Wix Developers under Workspace/OAuth)
const APP_ID = 'ce17e149-8f3c-4c4c-a527-e277ac3100a1';

// TODO: Update APP_SECRET with your application secret key (can be found in Wix Developers under Workspace/OAuth)
const APP_SECRET = '008a6dee-e695-49e0-8e88-8a8e510ee76a';

// TODO: Update WEBHOOK_VERIFICATION_ID with your WEBHOOK VERIFICATION ID (can be found under Workspace/Webhooks/Public-Key)
const WEBHOOK_VERIFICATION_ID = '430ba021-fd04-47fe-8f1c-2b8a72331b40';

const AUTH_PROVIDER_BASE_URL = 'https://www.wix.com/oauth';
const INSTANCE_API_URL = 'https://dev.wix.com/api/v1';

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
    console.log("User's site instanceId: = " + instance.instanceId);
    console.log("=============================");
    res.status(200).send("Application " + APP_ID + " was successfully installed on user's site with instanceId = " + instance.instanceId);

  } catch (wixError) {
    console.log("Error getting token from Wix");
    console.log({wixError});
    res.status(500);
    return;
  }});

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
      const {instance} = (await appInstance.get('instance', body)).data;

      return instance;
    } catch (e) {
      console.log('error in getAppInstance');
      console.log({e});
      return;
    }
  };

app.get('/', (_, res) => res.status(200).send('Hello Wix!'));

app.listen(port, () => console.log(`My Wix Application is listening on port ${port}!`));
