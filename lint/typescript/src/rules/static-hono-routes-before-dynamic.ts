import { defineRule, type ESTree } from "@oxlint/plugins";

/** Prevent dynamic Hono routes from shadowing later static routes. */
export const staticHonoRoutesBeforeDynamicRule = defineRule({
	meta: {
		type: "problem",
		docs: {
			description: "Require static Hono routes before overlapping parameter or wildcard routes.",
		},
		messages: {
			staticBeforeDynamic: "Register static route {{path}} before this dynamic route.",
		},
	},
	create(context) {
		const routes: Array<{
			method: string;
			node: ESTree.StringLiteral;
			path: string;
			pattern: RegExp | null;
			router: string;
			scope: number;
		}> = [];

		return {
			CallExpression(node) {
				const callee = node.callee;
				if (
					callee.type !== "MemberExpression" ||
					callee.computed ||
					callee.property.type !== "Identifier" ||
					!/^(?:delete|get|head|options|patch|post|put)$/.test(callee.property.name)
				) {
					return;
				}

				const pathNode = node.arguments[0];
				if (
					node.arguments.length < 2 ||
					pathNode?.type !== "Literal" ||
					typeof pathNode.value !== "string" ||
					(pathNode.value !== "*" && !pathNode.value.startsWith("/"))
				) {
					return;
				}

				let receiver = callee.object;
				while (receiver.type === "CallExpression") {
					const chainedCallee = receiver.callee;
					if (
						chainedCallee.type !== "MemberExpression" ||
						chainedCallee.computed ||
						chainedCallee.property.type !== "Identifier" ||
						!/^(?:delete|get|head|options|patch|post|put)$/.test(chainedCallee.property.name)
					) {
						return;
					}
					receiver = chainedCallee.object;
				}
				if (receiver.type !== "Identifier") return;

				const path = pathNode.value;
				const isStatic = !path.includes(":") && !path.includes("*");
				let pattern: RegExp | null = null;
				if (!isStatic) {
					if (path === "*") {
						pattern = /^\/.*$/;
					} else {
						let source = "^";
						let supported = true;
						for (const segment of path.slice(1).split("/")) {
							if (segment === "*") {
								source += "/.*";
							} else if (/^:[A-Za-z_][A-Za-z0-9_]*$/.test(segment)) {
								source += "/[^/]+";
							} else if (/^:[A-Za-z_][A-Za-z0-9_]*\?$/.test(segment)) {
								source += "(?:/[^/]+)?";
							} else if (segment.includes(":") || segment.includes("*")) {
								supported = false;
								break;
							} else {
								source += `/${segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
							}
						}
						if (supported) pattern = new RegExp(`${source}$`);
					}
					if (pattern === null) return;
				}

				let scope: ESTree.Node = node;
				while (
					scope.type !== "Program" &&
					scope.type !== "BlockStatement" &&
					scope.type !== "ArrowFunctionExpression" &&
					scope.type !== "FunctionDeclaration" &&
					scope.type !== "FunctionExpression"
				) {
					scope = scope.parent;
				}

				routes.push({
					method: callee.property.name,
					node: pathNode,
					path,
					pattern,
					router: receiver.name,
					scope: scope.start,
				});
			},
			"Program:exit"() {
				routes.sort((left, right) => left.node.start - right.node.start);
				const reported = new Set<number>();

				for (let laterIndex = 0; laterIndex < routes.length; laterIndex++) {
					const later = routes[laterIndex];
					if (later.pattern !== null) continue;

					for (let earlierIndex = 0; earlierIndex < laterIndex; earlierIndex++) {
						const earlier = routes[earlierIndex];
						if (
							earlier.pattern === null ||
							earlier.method !== later.method ||
							earlier.router !== later.router ||
							earlier.scope !== later.scope ||
							reported.has(earlier.node.start) ||
							!earlier.pattern.test(later.path)
						) {
							continue;
						}

						context.report({
							node: earlier.node,
							messageId: "staticBeforeDynamic",
							data: { path: later.path },
						});
						reported.add(earlier.node.start);
					}
				}
			},
		};
	},
});
