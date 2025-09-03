import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { users } from "./data/user.js";

const cwd = process.cwd();
const viewPath = path.join(cwd, "view");
const headerPath = path.join(viewPath, "fragments", "header.html");
const footerPath = path.join(viewPath, "fragments", "footer.html");
const header = fsSync.readFileSync(headerPath, "utf8");
const footer = fsSync.readFileSync(footerPath, "utf8");

export const formController = (req, res, method) => {
	if (method === "GET") {
		res.setHeader("Content-Type", "text/html; charset=utf8");
		const formPath = path.join(viewPath, "form.html");

		fs.readFile(formPath, "utf8")
			.then((contents) => {
				res.writeHead(200);
				res.end(`
                    ${header}
                    ${contents}
                    ${footer}
                `);
			})
			.catch((err) => {
				console.error(err);
				res.writeHead(500);
				res.end("Erreur interne du serveur");
			});
	} else if (method === "POST") {
		let body = "";
		req.on("data", (chunk) => {
			body += chunk.toString();
		});

		req.on("end", () => {
			console.log(body);
			const params = new URLSearchParams(body);
			const name = params.get("name");
			const email = params.get("email");

			if (!name || name.trim() === "" || !email || email.trim() === "") {
				res.writeHead(401, {
					"Content-Type": "text/plain",
				});
				res.end("Un des champs est vide !");
				return;
			}

			users.push({
				nom: name,
				email: email || "",
				role: "utilisateur",
			});
			res.writeHead(301, {
				Location: "/",
			});
			res.end();
		});
	}
};

export const detailsController = (req, res, name) => {
	const user = users.find(
		(user) => user.nom.toLowerCase() === name.toLowerCase()
	);

	res.setHeader("Content-Type", "text/html; charset=utf8");

	if (!user) {
		res.writeHead(404);
		res.end(`
            ${header}
            <h1>Utilisateur non trouvé</h1>
            <p>L'utilisateur avec le nom "${name}" n'existe pas.</p>
            ${footer}
        `);
		return;
	}

	res.writeHead(200);
	res.end(`
        ${header}
        <h1>Détails de l'utilisateur</h1>
        <ul>
            <li><strong>Nom:</strong> ${user.nom}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Rôle:</strong> ${user.role}</li>
        </ul>
        <a href="/">Retour à l'accueil</a>
        ${footer}
    `);
};

export const error404Controller = (req, res) => {
	res.setHeader("Content-Type", "text/html; charset=utf8");
	res.writeHead(404);
	res.end(`
        ${header}
        <h1>Erreur 404</h1>
        <p>La page que vous recherchez n'existe pas.</p>
        ${footer}
    `);
};

export const homeController = (req, res) => {
	const homePath = path.join(viewPath, "index.html");

	fs.readFile(homePath, "utf8")
		.then((contents) => {
			res.setHeader("Content-Type", "text/html; charset=utf8");
			res.writeHead(200);
			res.end(`
                ${header}
                ${contents}
                ${
					users.length === 0
						? "<p>Aucun utilisateur trouvé.</p>"
						: `
                <ul>
                    ${users
						.map(
							(user) =>
								`<li><a href="/details/${user.nom.toLowerCase()}">${
									user.nom
								}</a> - ${user.email} (${user.role})</li>`
						)
						.join("")}
                </ul>
                `
				}
                ${footer}
            `);
		})
		.catch((err) => {
			console.error(err);
			res.writeHead(500);
			res.end("Erreur interne du serveur");
		});
};
