// app.js
const express = require("express");
const dotenv = require("dotenv");
const { Cluster } = require("ioredis");
const app = express();
const port = 3000;

dotenv.config();

const cache = new Cluster([{ host: "redis-cluster", port: 7000 }]);

cache.on("connect", () => {
  console.log("cache connected");
});

cache.on("error", (err) => {
  console.error(err.message);
  process.exit(1);
});

app.get("/", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      const numHits = await cache.get("numHits");

      if (!numHits) {
        await cache.set("numHits", JSON.stringify(1));
        res.send(`hello prod, i've been hit 1 time`);
      }

      let n = JSON.parse(numHits);
      ++n;

      await cache.set("numHits", JSON.stringify(n));

      res.send(`hello prod, i've been hit ${n} time(s)`);
    } else {
      res.send("hello dev");
    }
  } catch (e) {
    console.error(e.message);
    res.send({ msg: e.message });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
