import { defineRule } from "@oxlint/plugins";

/** Ban `useEffect(...)` and `React.useEffect(...)`. */
export const noUseEffectRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description:
				"Disallow useEffect. Prefer derived state, event handlers, or framework data APIs.",
		},
		messages: {
			noUseEffect:
				"Do not use useEffect. Prefer derived state, event handlers, or framework data APIs.",
		},
	},
	createOnce(context) {
		return {
			CallExpression(node) {
				const callee = node.callee;
				const isBare = callee.type === "Identifier" && callee.name === "useEffect";
				const isMember =
					callee.type === "MemberExpression" &&
					!callee.computed &&
					callee.property.type === "Identifier" &&
					callee.property.name === "useEffect";
				if (isBare || isMember) context.report({ node: callee, messageId: "noUseEffect" });
			},
		};
	},
});
