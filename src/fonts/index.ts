import { Hono } from "hono";
import CSS from "./roboto.css";
import Woff from "./roboto.woff";
import Woff2 from "./roboto.woff2";

const app = new Hono();

app.get("/roboto.css", () => new Response(CSS, {
	headers: {
		"content-type": "text/css"
	}
}));

app.get("/roboto.woff", () => new Response(Woff, {
	headers: {
		"content-type": "font/woff"
		}
}));

app.get("/roboto.woff2", () => new Response(Woff2, {
	headers: {
		"content-type": "font/woff2"
	}	
}));

export default app;