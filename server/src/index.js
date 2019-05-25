function now() {
	return Math.floor(new Date().getTime() / 1000);
}

let sqlite3 = require("sqlite3");
let db = new sqlite3.Database("./database.sqlite3");

db.exec("CREATE TABLE IF NOT EXISTS blobs (`key` varchar(255) primary key, expire integer not null, value varchar(255));");

// note that old S3 blobs won't get deleted if the database is wiped; you should setup a lifecycle policy on the bucket to automatically delete any dangling objects after 7 days (the max expiration)

setInterval(() => {
	db.each("SELECT `key` FROM blobs WHERE expire<?", [now()], (err, row) => {
		if (err) throw err;
		let key = row.key;
		deleteBlob(key);
	});
}, 60000);

const s3Endpoint = process.env.S3_ENDPOINT;
const s3KeyId = process.env.S3_KEY_ID;
const s3KeySecret = process.env.S3_KEY_SECRET;
const s3Bucket = process.env.S3_BUCKET;
const s3Prefix = process.env.S3_PREFIX;
const ENABLE_S3 = s3Endpoint && s3KeyId && s3KeySecret && s3Bucket;

function s3() {
	if (!ENABLE_S3) throw new Error("S3 not enabled");
	const AWS = require("aws-sdk");
	return new AWS.S3({
		endpoint: new AWS.Endpoint(s3Endpoint),
		accessKeyId: s3KeyId,
		secretAccessKey: s3KeySecret
	});
}

let express = require("express");
let app = express();
let cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
	res.send("Everything seems A-OK!");
});

app.get("/serverSide", (req, res) => {
	if (ENABLE_S3) {
		res.sendStatus(204);
	} else {
		res.sendStatus(404);
	}
});

app.get("/:key", (req, res) => {
	res.set("Cache-Control", "private, no-cache, no-store, max-age=0");
	let key = req.params.key;

	db.get("SELECT expire, value FROM blobs WHERE `key`=?", [key], (err, row) => {
		if (err) throw err;
		if (row == null) {
			res.sendStatus(404);
			return;
		}

		let expire = row.expire - now();
		let value = row.value;

		if (expire <= 0) {
			deleteBlob(key);
			res.sendStatus(404);
			return;
		}

		if (value == null) {
			s3().getObject({
				Bucket: s3Bucket,
				Key: s3Prefix + key
			}, (err, data) => {
				if (err) throw err;

				res.send({expiration: expire, key: String(data.Body)});
			});
		} else {
			res.send({expiration: expire, key: value});
		}
	});
});

app.put("/:key", (req, res) => {
	let key = req.params.key;
	if (!/^[A-Za-z0-9]+$/.test(key)) { // need key to be simple to prevent any potential S3 attacks
		res.sendStatus(400);
		return;
	}

	const max = 604800; // 7 days
	let expire = Math.max(Math.min(req.query.expiration || max, max), 0);
	let body = "";
	req.on("data", chunk => body += chunk);
	req.on("end", () => {
		if (expire > 0) {
			const useS3 = body.length > 100;
			if (useS3) {
				if (!ENABLE_S3) {
					res.send(400, "server side storage not supported; keep your body less than 100 bytes");
					return;
				}
				s3().upload({
					Bucket: s3Bucket,
					Body: body,
					Key: s3Prefix + key
				}, err => {
					if (err) throw err;
					db.run("INSERT INTO blobs VALUES (?, ?, NULL)", [key, now() + expire], err => {
						if (err) throw err;
						res.sendStatus(204);
					});
				});
			} else {
				db.run("INSERT INTO blobs VALUES (?, ?, ?)", [key, now() + expire, body], err => {
					if (err) throw err;
					res.sendStatus(204);
				});
			}
		}
	});
});

app.delete("/:key", (req, res) => {
	let key = req.params.key;
	deleteBlob(key);
	res.sendStatus(204);
});

function deleteBlob(key) {
	db.get("SELECT value FROM blobs WHERE `key`=?", [key], (err, row) => {
		if (err) throw err;
		let value = row.value;
		if (value == null) {
			s3().deleteObject({
				Bucket: s3Bucket,
				Key: s3Prefix + key
			}, err => {
				if (err) throw err;
			});
		}

		db.run("DELETE FROM blobs WHERE `key`=?", [key], err => {
			if (err) throw err;
		});
	});
}

let listen = process.env.LISTEN || 8181;
app.listen(listen);
