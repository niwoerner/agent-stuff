import { defineRule, type ESTree } from "@oxlint/plugins";

/** Keep raw technical Error messages out of conventional user-visible frontend sinks. */
export const noRawErrorMessageRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Disallow direct error.message reads in conventional user-visible UI sinks.",
		},
		messages: {
			useSafeMessage: "Map the technical {{binding}}.message to safe user-facing copy first.",
		},
	},
	create(context) {
		const sonnerToastBindings = new Set<string>();

		return {
			ImportDeclaration(node) {
				if (node.source.value !== "sonner") return;

				for (const specifier of node.specifiers) {
					if (
						specifier.type === "ImportSpecifier" &&
						specifier.imported.type === "Identifier" &&
						specifier.imported.name === "toast"
					) {
						sonnerToastBindings.add(specifier.local.name);
					}
				}
			},
			MemberExpression(node) {
				if (
					node.computed ||
					node.object.type !== "Identifier" ||
					!/^(?:err|error)$/.test(node.object.name) ||
					node.property.type !== "Identifier" ||
					node.property.name !== "message"
				) {
					return;
				}

				let current: ESTree.Node = node;
				while (current.parent) {
					const parent: ESTree.Node = current.parent;

					if (parent.type === "CallExpression") {
						const callee = parent.callee;
						const isToastCall =
							(callee.type === "Identifier" && sonnerToastBindings.has(callee.name)) ||
							(callee.type === "MemberExpression" &&
								!callee.computed &&
								callee.object.type === "Identifier" &&
								sonnerToastBindings.has(callee.object.name));
						const isVisibleSetter =
							callee.type === "Identifier" &&
							/^set(?:[A-Z][A-Za-z0-9]*)?(?:Error|Message)$/.test(callee.name);

						if (isToastCall || isVisibleSetter) {
							context.report({
								node,
								messageId: "useSafeMessage",
								data: { binding: node.object.name },
							});
						}

						// A nested call is an explicit mapping boundary; do not infer what it returns.
						return;
					}

					if (
						parent.type === "JSXExpressionContainer" &&
						(parent.parent.type === "JSXElement" || parent.parent.type === "JSXFragment")
					) {
						let ancestor: ESTree.Node = parent.parent;
						let mappedMessage = false;
						while (ancestor.parent) {
							ancestor = ancestor.parent;
							if (
								(ancestor.type === "ArrowFunctionExpression" ||
									ancestor.type === "FunctionExpression") &&
								ancestor.parent.type === "CallExpression" &&
								ancestor.parent.callee.type === "MemberExpression" &&
								!ancestor.parent.callee.computed &&
								ancestor.parent.callee.property.type === "Identifier" &&
								ancestor.parent.callee.property.name === "map" &&
								ancestor.parent.arguments.includes(ancestor)
							) {
								mappedMessage = true;
								break;
							}
						}

						if (!mappedMessage) {
							context.report({
								node,
								messageId: "useSafeMessage",
								data: { binding: node.object.name },
							});
						}
						return;
					}

					current = parent;
				}
			},
		};
	},
});
