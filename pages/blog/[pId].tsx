import type { NextPage, GetServerSideProps } from "next";
import { BlogView } from "../../src/components/Blog";
import { SERVER_V1 } from "../../src/helper/global/constants";

const read: NextPage = (props) => {
	return <BlogView {...props} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { pId } = context.params!;
	if (!pId || pId === "") return { notFound: true };

	// slug is formatted title-_id (e.g. how-to-eat-_id)
	// get _id only
	let splitted = (pId as string).split("-"),
		id = splitted[splitted.length - 1];

	const getBlog = await fetch(`${SERVER_V1}/blog/${id}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (getBlog.status !== 200) {
		return { notFound: true };
	} else {
		const parsed = await getBlog.json();
		return {
			props: {
				post: parsed.data,
			},
		};
	}
};

export default read;
