import cors from "../cors";
import { Hono } from "hono";
import css from "./style.css";
import { nanoid } from "nanoid";
import index from "./index.html";
import favicon from "./favicon.png";

const app = new Hono<Environment>();

app.use("/*", cors);

app.get("/", ({ req }) => new Response(index.replaceAll("[project_url]", req.url), {
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

app.post("/api/shorturl", async ({ req, status, env, json }) => {
	const data = await req.parseBody<{ url: string }>();
	if(!(data.url && typeof data.url === "string" && URL.canParse(data.url) && new URL(data.url).protocol.startsWith("http"))) {
    return json({ error: "invalid url" });
  }
	const id = nanoid();
	await env.KV.put("ls-" + id, data.url);
	return json({
		original_url: data.url,
		short_url: id
	});
});

app.get("/api/shorturl/:id", cors, async ({ req, env, status, json, redirect }) => {
	const id = req.param("id");
	const url = await env.KV.get("ls-" + id);
	if(!url) {
		status(404);
		return json({
			redirect: "not found"
		});
	}
	return redirect(url, 302);
});


export default app;