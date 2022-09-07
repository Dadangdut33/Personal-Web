import type { NextPage } from "next";
import { Blog } from "../src/components/Blog";

const index: NextPage = (props) => {
	return <Blog {...props} />;
};

export default index;
