import cors from "../cors";
import { Hono } from "hono";
import css from "./style.css";
import { nanoid } from "nanoid";
import index from "./index.html";

const app = new Hono<Environment>();

app.get("/", () => new Response(index, {
	headers: {
		"content-type": "text/html; charset=UTF-8"
	}
}));

app.get("/style.css", () => new Response(css, {
	headers: {
		"content-type": "text/css"
	}
}));

app.get("/api/init", async ({ env, json }) => {
	const usersTable = env.D1.prepare("CREATE TABLE IF NOT EXISTS users (_id TEXT PRIMARY KEY, username NOT NULL) WITHOUT ROWID;");
	const excercisesTable = env.D1.prepare("CREATE TABLE IF NOT EXISTS exercises (_id TEXT PRIMARY KEY, user TEXT NOT NULL, description TEXT NOT NULL, duration INT NOT NULL, date INT NOT NULL, FOREIGN KEY(user) REFERENCES users(_id)) WITHOUT ROWID;");
	const arr = (await env.D1.batch([usersTable, excercisesTable]));
	return json(arr);
});

app.post("/api/users", cors, async ({ req, env, text, status, json }) => {
	const body = await req.parseBody<{ username: string }>();
	if(!(body && typeof body.username === "string")) {
		return text("Invalid Username.");
	}
	const _id = nanoid();
	const { error } = await env.D1.prepare("INSERT INTO users (_id, username) VALUES (?, ?);").bind(_id, body.username).run();
	if(error) {
		status(500);
		console.log(error);
		return json({
			error: "Internal Database Error."
		});
	}
	return json({
		_id,
		username: body.username
	});
});

let getAll: D1PreparedStatement;

app.get("/api/users", cors, async ({ env, status, json }) => {
	if(!getAll) {
		getAll = env.D1.prepare("SELECT * FROM users;");
	}
	const users = await getAll.all();
	if(users.error) {
		status(500);
		console.log(users.error);
		return json({
			error: "Internal Database Error."
		});
	}
	return json(users.results);
});

const getLogs = async (D1: D1Database, userId: string, query: Record<string, string>) => {
	const getUser = D1.prepare("SELECT * FROM users WHERE _id = ?;").bind(userId);
	let excerciseQualifiers: string[] = [];
	let excersiseParams: (string | number)[] = [userId];
	if(query.from) {
		excerciseQualifiers.push("date >= ?");
		excersiseParams.push(new Date(query.from).getTime());
	}
	if(query.to) {
		excerciseQualifiers.push("date <= ?");
		excersiseParams.push(new Date(query.to).getTime());
	}
	let excerciseString = "SELECT description, duration, date FROM exercises WHERE user = ?";
	if(excerciseQualifiers.length > 0) {
		excerciseString += " AND " + excerciseQualifiers.join(" AND ");
	}
	if(query.limit) {
		excerciseString += "LIMIT ?";
		excersiseParams.push(Number(query.limit));
	}
	const getExercises = D1.prepare(excerciseString).bind(...excersiseParams);
	const [userResult, exercises] = await D1.batch([getUser, getExercises]);
	if(userResult.error || exercises.error) {
		console.log(userResult.error || exercises.error);
		return {
			error: "Internal Database Error."
		};
	}
	return {
		...userResult.results[0] as { _id: string, username: string },
		count: exercises.results.length,
		log: (exercises.results as { description: string, duration: number, date: number }[]).map(({ description, duration, date }) => ({
			description,
			duration,
			date: new Date(date).toDateString(),
		}))
	};
}

app.post("/api/users/:_id/exercises", cors, async ({ req, env, status, json }) => {
	const userId = req.param("_id");
	let body = await req.parseBody<{ description: string, duration: string, date?: string }>();
	if(!(body && body.description && body.duration)) {
		status(400);
		return json({
			error: "Malformed Body"
		});
	}
	const duration = Number(body.duration);
	if(isNaN(duration)) {
		status(400);
		return json({
			error: "Duration is not a valid number"
		});
	}
	const date = body.date ? new Date(body.date) : new Date();
	if(date.toUTCString() === "Invalid Date") {
		status(400);
		return json({
			error: "Invalid Date"
		});
	}
	const exerciseId = nanoid();
	const { error } = await env.D1.prepare("INSERT INTO exercises (_id, user, description, duration, date) VALUES (?, ?, ?, ?, ?);").bind(exerciseId, userId, body.description, duration, date.getTime()).run();
	if(error) {
		status(500);
		console.log(error);
		return json({
			error: "Internal Database Error."
		});
	}
	const res = await env.D1.prepare("SELECT * FROM users WHERE _id = ?;").bind(userId).first();
	if(!res) {
		status(500);
		return json({
			error: "Internal Database Error."
		});
	}
	return json({
		username: res.username,
		description: body.description,
		duration,
		date: date.toDateString(),
		_id: userId
	}
	);
});

app.get("/api/users/:_id/logs", cors, async ({ req, env, status, json }) => {
	const userId = req.param("_id");
	const query = req.query();
	const res = await getLogs(env.D1, userId, query);
	if(res.error) {
		status(500);
	}
	return json(res);
});

export default app;