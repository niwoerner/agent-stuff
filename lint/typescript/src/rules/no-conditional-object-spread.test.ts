import { RuleTester } from "oxlint/plugins-dev";

import { noConditionalObjectSpreadRule } from "./no-conditional-object-spread.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });
const error = { messageId: "noConditionalObjectSpread" };

tester.run("niwoerner/no-conditional-object-spread", noConditionalObjectSpreadRule, {
	valid: [
		"const result = { ...defaults };",
		"const result = { key: maybeUndefined };",
		"const result: { key?: string } = {}; if (condition) result.key = value;",
		"const result = [...(condition ? [value] : [])];",
		"const result = { ...(condition ? enabledOptions : disabledOptions) };",
	],
	invalid: [
		{
			name: "logical and with object",
			code: "const result = { ...(condition && { key: value }) };",
			errors: [error],
		},
		{
			name: "logical and with object reference",
			code: "const result = { ...(condition && optionalProperties) };",
			errors: [error],
		},
		{
			name: "empty alternate",
			code: "const result = { ...(condition ? { key: value } : {}) };",
			errors: [error],
		},
		{
			name: "empty consequent",
			code: "const result = { ...(condition ? {} : { key: value }) };",
			errors: [error],
		},
		{
			name: "parenthesized condition",
			code: "const result = { ...((condition && { key: value })) };",
			errors: [error],
		},
	],
});
