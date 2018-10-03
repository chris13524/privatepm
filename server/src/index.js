let redis = require("redis");
let redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
let client = redis.createClient(redisUrl);

let express = require("express");
let app = express();
let cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
	res.send("Everything seems A-OK!");
});

app.get("/:key", (req, res) => {
	let key = req.params.key;
	client.get(key, (err, reply) => {
		if (reply != null) {
			res.send(reply);
		} else {
			res.sendStatus(404);
		}
	});
});

app.put("/:key", (req, res) => {
	let key = req.params.key;
	const max = 604800; // 7 days
	let expire = Math.max(Math.min(req.query.expire || max, max), 0);
	let body = "";
	req.on("data", chunk => body += chunk);
	req.on("end", () => {
		if (expire > 0) {
			client.set(key, body, "EX", expire);
		}
		res.sendStatus(200);
	});
});

let listen = process.env.LISTEN || 8181;
app.listen(listen);
