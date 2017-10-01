# Contributing

These are the steps that you should follow if you're working on new feature:
- talk with people
- create pull request
- update docs
- update changelog

## Node/OS Target

Framework is supposed to run fine on all major OS platforms and targets `Node.js >=8.0`

## Development
Make sure you write tests for all the changes/bug fixes.
Run the following command to see list of available npm scripts.

```
npm run
```

## Eslint
All files are linted via Eslint. Configuration for the Eslint is available on [github](https://github.com/vast-engineering/eslint-config-vast).

## Tests
We are using mocha and chai for unit testing.
To run all tests run `npm run test`.

## Pre-commit
You won't be able to commit your changes if npm throws linting errors or if tests fails.
