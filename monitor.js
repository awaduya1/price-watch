import fs from "fs";

async function getPrice(url) {
  const res = await fetch(url);
  const html = await res.text();

  const prices = html.match(/[0-9,]+円/g) || [];

  if (!prices[0]) return null;

  return Number(
    prices[0]
      .replace(/,/g, "")
      .replace("円", "")
  );
}

async function run() {
  const products = {
    hitotose: "https://ojikaya.jp/products/hitotose",
    gift366: "https://ojikaya.jp/products/366",
    maki100: "https://ojikaya.jp/products/mochimaki100",
    maki200: "https://ojikaya.jp/products/mochimaki200",
    maki500: "https://ojikaya.jp/products/mochimaki500",
    maki1000: "https://ojikaya.jp/products/mochimaki1000",
    maki2000: "https://ojikaya.jp/products/mochimaki2000",
    maki3000: "https://ojikaya.jp/products/mochimaki3000"
  };

  let oldPrices = {};

  try {
    oldPrices = JSON.parse(fs.readFileSync("prices.json", "utf8"));
  } catch {
    oldPrices = {};
  }

  const newPrices = {};

  for (const [name, url] of Object.entries(products)) {
    const price = await getPrice(url);

    newPrices[name] = price;

    if (oldPrices[name] && oldPrices[name] !== price) {
      const diff = price - oldPrices[name];

      console.log(
        `価格変更: ${name} ${oldPrices[name]} → ${price} (${diff > 0 ? "+" : ""}${diff}円)`
      );
    } else {
      console.log(`${name}: ${price}`);
    }
  }

  fs.writeFileSync("prices.json", JSON.stringify(newPrices, null, 2));

  console.log("保存完了");
}

run();