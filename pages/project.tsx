import type { NextPage } from "next";
import { Project } from "../src/components/Project";

const index: NextPage = (props) => {
	return <Project {...props} />;
};

export default index;
