.PHONY: all
all: test compile

compile:
	ncc build ./src/index.js

test:
	npm run test
