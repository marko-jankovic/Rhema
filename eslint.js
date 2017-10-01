'use strict';

// https://github.com/vast-engineering/eslint-config-vast
module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 8,
        ecmaFeatures: {
            jsx: true,
            experimentalObjectRestSpread: true
        }
    },
    env: {
        node: true,
        es6: true
    },
    globals: {
        logger: false,
        metrics: false,
        timer: true
    },
    extends: 'eslint:recommended',
    rules: {
        // Possible Errors
        'no-console': [1, { allow: ['warn', 'error'] }], // Overrides eslint:recommended config (2).
        'no-await-in-loop': 2, // In case await was used in a loop intentionally, it is recommended to disable the rule via a standard ESLint disable comment.

        // Best Practices
        'class-methods-use-this': 1,
        curly: 2,
        'dot-notation': 2,
        eqeqeq: 2,
        'guard-for-in': 2,
        'no-caller': 2,
        'no-eval': 2,
        'no-extend-native': 2,
        'no-extra-bind': 2,
        'no-floating-decimal': 2,
        'no-implied-eval': 2,
        'no-loop-func': 2,
        'no-new-wrappers': 2,
        'no-return-assign': 2,
        'no-script-url': 2,
        'no-self-compare': 2,
        'no-sequences': 2,
        'no-throw-literal': 2,
        'no-unused-expressions': [2, { allowShortCircuit: true, allowTernary: true }],
        'no-useless-call': 2,
        'no-useless-concat': 2,
        'no-useless-escape': 2,
        'no-useless-return': 2,
        'no-return-await': 2,
        'no-void': 2,
        'require-await': 2,
        yoda: 2,

        // Strict Mode
        strict: 2,

        // Variables
        'no-label-var': 2,
        'no-unused-vars': [2, { args: 'none' }],
        'no-shadow-restricted-names': 2,
        'no-undef-init': 2,
        'no-use-before-define': 2,

        // Node.js and CommonJS
        'global-require': 0,
        'no-new-require': 2,
        'no-path-concat': 2,
        'handle-callback-err': 1,

        // Stylistic Issues
        'array-bracket-spacing': [2, 'never'],
        'brace-style': 2,
        camelcase: [2, { properties: 'never' }],
        'comma-dangle': 2,
        'comma-spacing': 2,
        'comma-style': 2,
        'consistent-this': 2,
        'eol-last': 2,
        indent: [2, 4, { SwitchCase: 1 }],
        'jsx-quotes': 2,
        'key-spacing': 2,
        'keyword-spacing': 2,
        'lines-around-directive': 2,
        'max-nested-callbacks': [1, { max: 4 }],
        'max-statements-per-line': [2, { max: 1 }],
        'new-cap': 2,
        'new-parens': 2,
        'no-array-constructor': 2,
        'no-extra-parens': [2, 'functions'],
        'no-bitwise': 2,
        'no-lonely-if': 2,
        'no-mixed-operators': 2,
        'no-multi-spaces': 2,
        'no-multi-str': 2,
        'no-multiple-empty-lines': [2, { max: 1 }],
        'no-nested-ternary': 2,
        'no-negated-condition': 2,
        'no-new-object': 2,
        'no-spaced-func': 2,
        'no-tabs': 2,
        'no-trailing-spaces': 2,
        'no-underscore-dangle': 2,
        'no-whitespace-before-property': 2,
        'object-curly-spacing': [2, 'always'],
        'one-var': [2, 'never'],
        'one-var-declaration-per-line': 2,
        'padded-blocks': [2, 'never'], // TODO: add `requirePaddingNewLinesAfterBlocks` once it's implemented https://github.com/eslint/eslint/issues/7356
        'quote-props': [2, 'as-needed'],
        quotes: [2, 'single'],
        semi: 2,
        'semi-spacing': 2,
        'space-before-blocks': 2,
        'space-before-function-paren': 2,
        'space-in-parens': [2, 'never'],
        'space-infix-ops': 2,
        'space-unary-ops': [2, { words: true, nonwords: false }],
        'spaced-comment': 2,
        'template-tag-spacing': [2, 'always'],
        'wrap-iife': 2,

        // ECMAScript 6 (only warn for now)
        'arrow-body-style': 1,
        'arrow-parens': [1, 'as-needed', { requireForBlockBody: true }],
        'arrow-spacing': 1,
        'generator-star-spacing': [1, { before: false, after: true }],
        'no-confusing-arrow': [1, { allowParens: true }],
        'no-duplicate-imports': [1, { includeExports: true }],
        'no-useless-computed-key': 1,
        'no-useless-constructor': 1,
        'no-useless-rename': 1,
        'no-var': 1,
        'object-shorthand': [1, 'consistent-as-needed'],
        'prefer-arrow-callback': 1,
        'prefer-const': [1, { destructuring: 'any', ignoreReadBeforeAssign: true }],
        'prefer-rest-params': 1,
        'prefer-spread': 1,
        'prefer-template': 1,
        'rest-spread-spacing': 1,
        'symbol-description': 1,
        'template-curly-spacing': 1,
        'yield-star-spacing': 1
    }
};
