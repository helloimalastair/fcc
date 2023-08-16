import cors from "../cors";
import { Hono } from "hono";
import css from "./style.css";
import index from "./index.html";
import favicon from "./favicon.ico";

const app = new Hono();

app.get("/", ({ req }) => new Response(index.replaceAll("[base url]", req.url), {
	headers: {
		"content-type": "text/html; charset=UTF-8"
	}
}));

app.get("/style.css", () => new Response(css, {
	headers: {
		"content-type": "text/css"
	}
}));

app.get("/favicon.ico", () => new Response(favicon, {
	headers: {
		"content-type": "image/x-icon"
	}
}));

app.get("/api/whoami", cors, ({ req, json }) => {
	return json({
		ipaddress: req.headers.get("cf-connecting-ip"),
		language: req.headers.get("accept-language"),
		software: req.headers.get("user-agent")
	});
});

export default app;