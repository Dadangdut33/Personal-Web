import type { NextPage } from "next";
import Head from "next/head";
import { HeaderResponsive } from "../Utils/Header";

export const Home: NextPage = (props) => {
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Dadangdut33</title>
			</Head>

			<HeaderResponsive />
		</>
	);
};
