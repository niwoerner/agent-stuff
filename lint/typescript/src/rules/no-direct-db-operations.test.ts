import { RuleTester } from "oxlint/plugins-dev";

import { noDirectDbOperationsRule } from "./no-direct-db-operations.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "useDatabaseLayer" };

tester.run("niwoerner/no-direct-db-operations", noDirectDbOperationsRule, {
	valid: [
		'app.get("/:id", async (c) => getUser(db, c.req.valid("param").id));',
		'app.post("/", async (c) => createUser(c.req.valid("json")));',
		"const rows = await userOperations.select();",
		"const rows = await database.select();",
		"const rows = await db.query.users.findMany();",
		'const rows = await db["select"]();',
		"response.delete();",
	],
	invalid: [
		{
			name: "select",
			code: 'app.get("/", async () => db.select().from(users));',
			errors: [error],
		},
		{
			name: "insert",
			code: 'app.post("/", async () => db.insert(users).values(input));',
			errors: [error],
		},
		{
			name: "update on transaction",
			code: 'app.put("/:id", async () => tx.update(users).set(input));',
			errors: [error],
		},
		{
			name: "delete",
			code: 'app.delete("/:id", async () => db.delete(users));',
			errors: [error],
		},
		{
			name: "execute",
			code: 'app.post("/run", async () => db.execute(statement));',
			errors: [error],
		},
		{
			name: "transaction",
			code: 'app.post("/transfer", async () => db.transaction(runTransfer));',
			errors: [error],
		},
	],
});
