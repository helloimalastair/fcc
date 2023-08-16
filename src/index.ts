import ts from "./ts";
import ls from "./ls";
import hpm from "./hpm";
import fonts from "./fonts";
import { Hono } from "hono";

const app = new Hono<Environment>();

app.get("/", ctx => ctx.text("My solutions for the FreeCodeCamp.org Back End Development and APIs Projects."));
app.route("/fonts", fonts);
app.route("/ts", ts);
app.route("/hpm", hpm);
app.route("/ls", ls);

export default <ExportedHandler>{
	fetch: app.fetch,
};