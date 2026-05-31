module.exports = {
  root: false, // Permet de merger avec la config racine
  extends: ["../../.eslintrc.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // Désactiver les règles React/Tailwind qui ne s'appliquent pas au backend
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unknown-property": "off",
    "tailwindcss/no-custom-classname": "off",
    "tailwindcss/classnames-order": "off",
    "import/no-unresolved": "off", // NestJS dynamic imports
    "import/no-extraneous-dependencies": "off",
    "@typescript-eslint/no-explicit-any": "warn", // Warn instead of error for flexibility
  },
};
