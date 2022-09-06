import { NextPage } from "next";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { MouseHover } from "../../Utils/Looks/MouseHover";
import { DashboardNav } from "./DashboardNav";

interface Iwrapper extends IDashboardProps {
	children: JSX.Element;
}

export const Wrapper: NextPage<Iwrapper> = (props) => {
	return (
		<>
			<MouseHover />
			<div className="dashboard nav-wrap">
				<DashboardNav {...props} />
				<main className="dashboard content-wrap">{props.children}</main>
			</div>
		</>
	);
};
