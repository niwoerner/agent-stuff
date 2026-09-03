import { defineRule } from "@oxlint/plugins";

/** Keep direct database client operations out of configured route files. */
export const noDirectDbOperationsRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow direct operations on conventional db and tx bindings.",
		},
		messages: {
			useDatabaseLayer:
				"Call {{operation}} through a database-layer function instead of using {{binding}} directly.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				const callee = node.callee;
				if (
					callee.type !== "MemberExpression" ||
					callee.computed ||
					callee.object.type !== "Identifier" ||
					!/^(?:db|tx)$/.test(callee.object.name) ||
					callee.property.type !== "Identifier" ||
					!/^(?:delete|execute|insert|select|transaction|update)$/.test(callee.property.name)
				) {
					return;
				}

				context.report({
					node: callee,
					messageId: "useDatabaseLayer",
					data: { binding: callee.object.name, operation: callee.property.name },
				});
			},
		};
	},
});
