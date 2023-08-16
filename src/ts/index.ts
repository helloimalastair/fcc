import { Hono } from "hono";
import css from "./style.css";
import index from "./index.html";
import { cors } from "hono/cors";

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

app.get("/api/:ts", cors({
	origin: "www.freecodecamp.org",
}), ({ req, json }) => {
	const timestamp = req.param("ts");
	const number = Number(timestamp);
	let date: Date;
	if (isNaN(number)) {
		date = new Date(timestamp);
	} else {
		date = new Date(number);
	}
	return json({
		unix: date.getTime(),
		utc: date.toUTCString()
	});
})

export default app;