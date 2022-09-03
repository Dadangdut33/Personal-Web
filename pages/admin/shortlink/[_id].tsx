import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { Wrapper } from "../../../src/components/Admin/Nav/Wrapper";
import { ShortlinkForm } from "../../../src/components/Admin/Shortlink";
import { IDashboardProps } from "../../../src/interfaces/props/Dashboard";
import { SERVER_V1 } from "../../../src/helper";

const edit: NextPage<IDashboardProps> = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Shortlink View/Edit | Dadangdut33 Personal Web</title>
			</Head>
			<Wrapper {...props}>
				<ShortlinkForm {...props} />
			</Wrapper>
		</>
	);
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const checkLoggedIn = await fetch(`${SERVER_V1}/auth`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
		credentials: "include",
	});

	// 404 if not logged in
	if (checkLoggedIn.status !== 200) return { notFound: true };

	// validate role
	const parsed = await checkLoggedIn.json();

	// get group data
	const fetchGroup = await fetch(`${SERVER_V1}/shortlink/${context.params!._id}/admin`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Cookie: "connect.sid=" + context.req.cookies["connect.sid"],
		},
		credentials: "include",
	});

	if (fetchGroup.status !== 200) return { notFound: true };
	const { data } = await fetchGroup.json();

	return {
		props: {
			pathname: context.resolvedUrl,
			user: parsed.data,
			token: context.req.cookies["connect.sid"],
			shortlink: data,
		},
	};
};

export default edit;
