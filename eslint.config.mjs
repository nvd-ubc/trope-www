import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
	...nextCoreWebVitals,
	...nextTypescript,
	{
		rules: {
			// Relax some rules for the ported Stellar template
			"react/no-unescaped-entities": "off",
			"@typescript-eslint/no-unused-vars": "warn",
			"@typescript-eslint/no-explicit-any": "warn",
			"react-hooks/rules-of-hooks": "warn",
			"react-hooks/set-state-in-effect": "warn",
			"react-hooks/refs": "warn",
			"react/jsx-key": "warn",
			"react/display-name": "off",
			"@next/next/no-img-element": "warn",
		},
	},
];

export default eslintConfig;
