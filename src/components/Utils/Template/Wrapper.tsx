import { NextPage } from "next";
import { HeaderResponsive, FooterWeb } from ".";
import MouseHover from "../Looks/MouseHover";

interface IWrapper {
	children: React.ReactNode;
}

export const Wrapper: NextPage<IWrapper> = (props) => {
	return (
		<>
			<MouseHover />
			<div className="page-container">
				<div className="content-wrap">
					<HeaderResponsive />
					{props.children}
				</div>
				<FooterWeb />
			</div>
		</>
	);
};
