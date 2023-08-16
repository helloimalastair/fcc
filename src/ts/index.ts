import cors from "../cors";
import { Hono } from "hono";
import css from "./style.css";
import index from "./index.html";
import favicon from "./favicon.png";

const app = new Hono();

app.get("/", ({ req }) => new Response(index.replaceAll("[project url]", req.url), {
	headers: {
		"content-type": "text/html; charset=UTF-8"
	}
}));

app.get("/style.css", () => new Response(css, {
	headers: {
		"content-type": "text/css"
	}
}));

app.get("/favicon.png", () => new Response(favicon, {
	headers: {
		"content-type": "image/png"
	}
}));

app.get("/api", cors, ({ json }) => {
	const date = new Date();
	return json({
		unix: date.getTime(),
		utc: date.toUTCString()
	});
});

app.get("/api/:ts", cors, ({ req, status, json }) => {
	const timestamp = req.param("ts");
	const number = Number(timestamp);
	let date: Date;
	if (isNaN(number)) {
		date = new Date(timestamp);
	} else {
		date = new Date(number);
	}
	if(date.toUTCString() === "Invalid Date") {
		status(400)
		return json({
			error: "Invalid Date"
		});
	}
	return json({
		unix: date.getTime(),
		utc: date.toUTCString()
	});
});

export default app;