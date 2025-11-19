.PHONY: all install build dev serve clean fclean re css

all: install css build

install:
	@npm install

css:
	@npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify

css-watch:
	@npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

build:
	@npx tsc

dev:
	@npx tsc --watch & npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch

serve: css build
	@npx http-server . -p 8080

run: css build
	@npx http-server . -p 8080 -o

clean:
	@rm -rf dist

fclean: clean
	@rm -rf node_modules package-lock.json

re: fclean all
