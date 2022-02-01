import https from "https";
import fs from "fs";

const url = "https://distribution.dcc-rules.de/rules";
const filename = "html/eu-dcc-rules.json";

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

function getJSON<T>(url: string): Promise<T> {
  console.log(url);
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let json = "";
      res.on("data", function (chunk) {
        json += chunk;
      });
      res.on("end", function () {
        resolve(JSON.parse(json));
      });
    });
    req.on("error", function (err) {
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
  return `${url}/${rule.country.toUpperCase()}/${rule.hash}`;
}

async function getRule(simpleRule: RuleSimple): Promise<Rule> {
  const ruleURL = getRuleURL(simpleRule);
  if (ruleURL === null) return null;
  const rule = await getJSON<Rule>(ruleURL);
  rule.Hash = simpleRule.hash;
  return rule;
}

getJSON<RuleSimple[]>(url)
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
