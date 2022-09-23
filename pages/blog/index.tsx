import type { GetServerSideProps, NextPage } from "next";
import { Blog, BlogPageProps } from "../../src/components/Blog";
import { SERVER_V1 } from "../../src/helper/global/constants";

const index: NextPage<BlogPageProps> = (props) => {
	return <Blog {...props} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	let success = false,
		data,
		msg;
	try {
		const req = await fetch(SERVER_V1 + "/blog", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		const res = await req.json();

		if (req.status !== 200) {
			msg = res.message;
		} else {
			success = true;
			data = res.data;
			msg = res.message;
		}
	} catch (error: any) {
		msg = error.message;
	}

	return {
		props: {
			success,
			data,
			msg,
		},
	};
};

export default index;
