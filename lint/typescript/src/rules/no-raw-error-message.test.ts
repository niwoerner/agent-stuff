import { RuleTester } from "oxlint/plugins-dev";

import { noRawErrorMessageRule } from "./no-raw-error-message.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "useSafeMessage" };

tester.run("niwoerner/no-raw-error-message", noRawErrorMessageRule, {
	valid: [
		'console.error("Saving invoice failed", error.message);',
		`function toUserMessage(error: Error) {
			if (error.message.includes("duplicate key value violates unique constraint")) {
				return "That email address is already in use.";
			}
			return "We could not save your account.";
		}`,
		`import { toast } from "sonner";
		toast.error(toUserMessage(error));`,
		`const fieldErrors = [{ message: "Enter a valid postal code." }];
		const list = <ul>{fieldErrors.map((error) => <li>{error.message}</li>)}</ul>;`,
		`const domainMessages = [{ message: "This invitation has expired." }];
		const list = <>{domainMessages.map(function (err) { return <p>{err.message}</p>; })}</>;`,
		"const detail = failure.message;",
		'const technical = error["message"];',
		"const node = <Status message={error.message} />;",
	],
	invalid: [
		{
			name: "JSX child",
			code: "const node = <p>{error.message}</p>;",
			errors: [error],
		},
		{
			name: "JSX template text",
			code: "const node = <Alert>{`Payment failed: ${err.message}`}</Alert>;",
			errors: [error],
		},
		{
			name: "aliased Sonner toast import",
			code: `import { toast as notify } from "sonner";
			notify.error(error.message);`,
			errors: [error],
		},
		{
			name: "direct Sonner toast call",
			code: `import { toast as notify } from "sonner";
			notify(err.message);`,
			errors: [error],
		},
		{
			name: "Sonner toast callback copy",
			code: `import { toast } from "sonner";
			toast.promise(request, { error: (err) => err.message });`,
			errors: [error],
		},
		{
			name: "visible error setter",
			code: "setCheckoutError(error.message);",
			errors: [error],
		},
		{
			name: "visible message setter template",
			code: "setStatusMessage(`Upload failed: ${err.message}`);",
			errors: [error],
		},
	],
});
