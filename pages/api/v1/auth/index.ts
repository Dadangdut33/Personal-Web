import type { NextApiRequest, NextApiResponse } from "next";
import { SERVER_V1 } from "../../../../src/helper";
type Data = {
	message: string;
	success: boolean;
	data?: any;
};
const login = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	// must be a POST request
	if (req.method !== "POST") {
		res.status(405).json({
			message: "Method not allowed",
			success: false,
		});
		return;
	}

	const { username, password } = req.body;
	const loginFetch = await fetch(`${SERVER_V1}/auth`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username,
			password,
		}),
	});

	const setCookie = loginFetch.headers.get("set-cookie");
	if (setCookie) res.setHeader("set-cookie", setCookie);

	const loginData = await loginFetch.json();
	return res.status(loginFetch.status).json(loginData);
};

export default login;
