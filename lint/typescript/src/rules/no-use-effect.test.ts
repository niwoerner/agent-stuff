import { RuleTester } from "oxlint/plugins-dev";

import { noUseEffectRule } from "./no-use-effect.ts";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "tsx" } } });
const error = { messageId: "noUseEffect" };

tester.run("niwoerner/no-use-effect", noUseEffectRule, {
	valid: [
		"useMemo(() => 1, []);",
		"const value = useEffectValue;",
		"React.useLayoutEffect(() => {}, []);",
		"obj['useEffect'](() => {});",
	],
	invalid: [
		{ name: "bare call", code: "useEffect(() => {}, []);", errors: [error] },
		{ name: "member call", code: "React.useEffect(() => {}, []);", errors: [error] },
	],
});
