import { defineRule } from "@oxlint/plugins";

/** Require Hono handlers to consume validator-produced request input. */
export const noRawHonoRequestInputRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow raw Hono request input when validated input is available.",
		},
		messages: {
			useValidatedInput: "Use req.valid(...) instead of req.{{method}}(...).",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				const callee = node.callee;
				if (
					callee.type !== "MemberExpression" ||
					callee.computed ||
					callee.property.type !== "Identifier" ||
					!/^(?:json|param|queries|query)$/.test(callee.property.name)
				) {
					return;
				}

				const request = callee.object;
				if (
					request.type !== "MemberExpression" ||
					request.computed ||
					request.object.type !== "Identifier" ||
					request.property.type !== "Identifier" ||
					request.property.name !== "req"
				) {
					return;
				}

				context.report({
					node: callee,
					messageId: "useValidatedInput",
					data: { method: callee.property.name },
				});
			},
		};
	},
});
