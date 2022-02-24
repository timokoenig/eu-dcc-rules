import https from "https";
import fs from "fs";

const agent = new https.Agent({ keepAlive: true });

const host = "distribution.dcc-rules.de";
const filename = "eu-dcc-rules.json";

type Rules = {
  updatedAt: Date;
  rules: Rule[];
};

type RuleSimple = {
  identifier: string;
  version: string;
  country?: string;
  hash: string;
};

type Language = {
  lang: string;
  desc: string;
};

type Rule = {
  Identifier: string;
  Hash?: string | null;
  Type: string;
  Country: string;
  Version: string;
  SchemaVersion: string;
  Engine: string;
  EngineVersion: string;
  CertificateType: string;
  Description: Language[];
  ValidFrom: string;
  ValidTo: string;
  AffectedFields: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Logic: any;
};

function getJSON<T>(path: string, retryCount = 0): Promise<T> {
  console.log(`https://${host}${path}`);
  return new Promise((resolve, reject) => {
    const req = https.get(`https://${host}${path}`, { agent }, (res) => {
      let json = "";
      res.on("data", function (chunk) {
        json += chunk;
      });
      res.on("end", function () {
        if (res.statusCode === 200) {
          resolve(JSON.parse(json));
        } else {
          reject(
            JSON.parse(json).problem !== undefined ??
              "Request failed with unknown error"
          );
        }
      });
    });
    req.on("error", function (err) {
      if (req.reusedSocket && err.name === "ECONNRESET") {
        if (retryCount < 3) {
          getJSON(path, retryCount++)
            .then(resolve)
            .catch(reject);
          return;
        }
      }
      reject(err);
    });
  });
}

function saveJSON(data: Rules): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, JSON.stringify(data), function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function getRuleURL(rule: RuleSimple): string {
  if (!rule.country || rule.country.length == 0) return null;
  return `/rules/${rule.country.toUpperCase()}/${rule.hash}`;
}

async function getRule(simpleRule: RuleSimple): Promise<Rule> {
  const ruleURL = getRuleURL(simpleRule);
  if (ruleURL === null) return null;
  const rule = await getJSON<Rule>(ruleURL);
  rule.Hash = simpleRule.hash;
  return rule;
}

getJSON<RuleSimple[]>("/rules")
  .then(async (data) => {
    const arr: Rule[] = [];
    for (let i = 0; i < data.length; i++) {
      const rulePromise = await getRule(data[i]);
      if (rulePromise !== null) {
        arr.push(rulePromise);
      }
    }
    return arr;
  })
  .then((data) => {
    return { updatedAt: new Date(), rules: data.flatMap((data) => data) };
  })
  .then((data) => saveJSON(data))
  .catch((error) => console.error(error));
