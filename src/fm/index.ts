import cors from "../cors";
import { Hono } from "hono";
import css from "./style.css";
import index from "./index.html";

const app = new Hono<Environment>();

app.get("/", cors, () => new Response(index, {
	headers: {
		"content-type": "text/html; charset=UTF-8"
	}
}));

app.get("/style.css", () => new Response(css, {
	headers: {
		"content-type": "text/css"
	}
}));

app.post("/api/fileanalyse", cors, async ({ req, status, json }) => {
	const body = await req.parseBody<{ upfile: File }>();
	if(!(body && body.upfile instanceof File)) {
		status(400);
		return json({
			error: "Invalid File"
		});
	}
	const { name, type, size } = body.upfile;
	return json({
		name,
		type,
		size,
	});
});

export default app;