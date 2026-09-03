import { defineRule } from "@oxlint/plugins";

/** Ban conditional object spreads that add optional properties. */
export const noConditionalObjectSpreadRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow conditional object spreads; assign directly or use an if.",
		},
		messages: {
			noConditionalObjectSpread:
				"Avoid conditional object spreads; assign directly or add the property with an if.",
		},
	},
	createOnce(context) {
		return {
			SpreadElement(node) {
				if (node.parent.type !== "ObjectExpression") return;

				let argument = node.argument;
				while (argument.type === "ParenthesizedExpression") argument = argument.expression;

				if (argument.type === "LogicalExpression" && argument.operator === "&&") {
					context.report({ node, messageId: "noConditionalObjectSpread" });
					return;
				}

				if (argument.type !== "ConditionalExpression") return;

				let consequent = argument.consequent;
				while (consequent.type === "ParenthesizedExpression") consequent = consequent.expression;
				let alternate = argument.alternate;
				while (alternate.type === "ParenthesizedExpression") alternate = alternate.expression;

				const hasEmptyObjectBranch =
					(consequent.type === "ObjectExpression" && consequent.properties.length === 0) ||
					(alternate.type === "ObjectExpression" && alternate.properties.length === 0);
				if (hasEmptyObjectBranch) {
					context.report({ node, messageId: "noConditionalObjectSpread" });
				}
			},
		};
	},
});
