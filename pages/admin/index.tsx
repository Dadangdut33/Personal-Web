import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { resetServerContext } from "react-beautiful-dnd";
import { Wrapper } from "../../src/components/Admin/Nav/Wrapper";
import { DashboardHome } from "../../src/components/Admin/Home";
import { IDashboardProps } from "../../src/interfaces/props";
import { SERVER_V1 } from "../../src/helper";

const dashboardHome: NextPage<IDashboardProps> = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Dashboard | Dadangdut33 Personal Web</title>
			</Head>
			<Wrapper {...props}>
				<DashboardHome {...props} />
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

	resetServerContext();
	return {
		props: {
			pathname: context.resolvedUrl,
			user: parsed.data,
			token: context.req.cookies["connect.sid"],
		},
	};
};

export default dashboardHome;
