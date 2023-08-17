import ts from "./ts";
import ls from "./ls";
import et from "./et";
import fm from "./fm";
import hpm from "./hpm";
import fonts from "./fonts";
import { Hono } from "hono";
import favicon from "./favicon.ico";

const app = new Hono<Environment>();

app.get("/", ctx => ctx.text("My solutions for the FreeCodeCamp.org Back End Development and APIs Projects."));
app.get("/favicon.ico", () => new Response(favicon, {
	headers: {
		"content-type": "image/x-icon"
	}
}));
app.route("/fonts", fonts);
app.route("/ts", ts);
app.route("/hpm", hpm);
app.route("/ls", ls);
app.route("/et", et);
app.route("/fm", fm);

export default <ExportedHandler>{
	fetch: app.fetch,
};