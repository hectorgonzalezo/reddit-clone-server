module.exports = {
  root: true,
  extends: 'airbnb-typescript/base',
  plugins: ['import', 'prettier'],
	rules: {
		"@typescript-eslint/quotes": 0,
		"import/extensions": 0,
	},
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
};
