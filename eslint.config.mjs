import nextConfig from "eslint-config-next";
import tsParser from "@typescript-eslint/parser";

const config = [
  ...nextConfig,
  {
    // eslint-config-next's default parser (Next's bundled Babel eslint
    // parser) returns a scope manager incompatible with ESLint 10's
    // addGlobals API and crashes on every file. Force the standard
    // TypeScript parser (already used for .ts/.tsx by eslint-config-next)
    // across all JS/TS files instead.
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsParser,
    },
    settings: {
      react: {
        version: "19.2.8",
      },
    },
    rules: {
      // Flags the standard "load data" / "reset state" effect pattern used
      // throughout this codebase (no data-fetching library in use). Not a
      // real bug here.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: ["next-env.d.ts"],
  },
];

export default config;
