import http from "node:http";
import {
	error404Controller,
	homeController,
	detailsController,
	formController,
} from "./controller.js";

const hostname = "localhost";
const port = "8080";

const server = http.createServer((req, res) => {
	const url = req.url.replace("/", "");

	if (url.match(/details\/.+/)) {
		const args = url.split("/");
		if (args.length !== 2) {
			error404Controller(req, res);
			return;
		}

		const name = args[1];
		detailsController(req, res, name);
		return;
	}

	if (url === "" && req.method === "GET") {
		homeController(req, res);
		return;
	}

	if (url === "new") {
		formController(req, res, req.method);
		return;
	}

	error404Controller(req, res);
	return;
});

server.listen(port, hostname, () => {
	console.log(`Server listening at http://${hostname}:${port}`);
});
