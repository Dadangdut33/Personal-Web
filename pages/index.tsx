import type { NextPage } from "next";
import { Home } from "../src/components/Home";

const index: NextPage = (props) => {
	return <Home {...props} />;
};

export default index;
