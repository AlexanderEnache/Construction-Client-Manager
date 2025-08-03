const fs = require("fs");
const jwt = require("jsonwebtoken");
const https = require("https");

async function getAccessToken() {
  const privateKey = fs.readFileSync(process.env.DOCUSIGN_PRIVATE_KEY_PATH);

  const jwtPayload = {
    iss: process.env.DOCUSIGN_INTEGRATOR_KEY,
    sub: process.env.DOCUSIGN_USER_ID,
    aud: process.env.DOCUSIGN_OAUTH_BASE_PATH,
    scope: "signature",
  };

  const token = jwt.sign(jwtPayload, privateKey, {
    algorithm: "RS256",
    expiresIn: "10m",
    header: {
      kid: "your-integration-key-guid",
      alg: "RS256"
    },
  });

  const postData = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: token,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.DOCUSIGN_OAUTH_BASE_PATH,
      path: "/oauth/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.toString().length,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        const json = JSON.parse(body);
        if (json.access_token) {
          resolve(json.access_token);
        } else {
          reject(json);
        }
      });
    });

    req.on("error", reject);
    req.write(postData.toString());
    req.end();
  });
}

async function sendEnvelope() {
  const accessToken = await getAccessToken();
  console.log("✅ Access Token:", accessToken);

  // Use `accessToken` to call DocuSign REST API (e.g., envelopes)
  // For example, call https://demo.docusign.net/restapi/v2.1/accounts/:accountId/envelopes
}

module.exports = { sendEnvelope };
