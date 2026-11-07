import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });
export default defineConfig([...compat.extends("next/core-web-vitals"), { rules: { "@next/next/no-html-link-for-pages": "off" } }, globalIgnores([".next/**", "node_modules/**"])]);
