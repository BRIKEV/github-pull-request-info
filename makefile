

ensure-dependencies:
	@echo "Ensuring docker is installed..."
	@docker info

brand:
	@echo "Creating our github-pull-request-info manifest file..."
	@node_modules/make-manifest/bin/make-manifest
	@cat ./manifest.json

package:
	@echo "Building our github-pull-request-info docker image..."
	@docker build --tag github-pull-request-info .
	@docker images

qa:
	@echo "Checking that our github-pull-request-info tests dont fail..."
	@npm run qa