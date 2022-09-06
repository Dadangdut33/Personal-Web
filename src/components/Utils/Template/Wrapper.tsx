import { NextPage } from "next";
import { motion } from "framer-motion";
import { HeaderResponsive, FooterWeb } from ".";
import { MouseHover } from "../Looks/MouseHover";

interface IWrapper {
	children: React.ReactNode;
}

const variants = {
	hidden: { opacity: 0, x: 0, y: 200 },
	enter: { opacity: 1, x: 0, y: 0 },
	exit: { opacity: 0, x: 0, y: 100 },
};

export const Wrapper: NextPage<IWrapper> = (props) => {
	return (
		<>
			<MouseHover />
			<div className="page-container">
				<div className="content-wrap">
					<HeaderResponsive />
					<motion.div
						variants={variants} // Pass the variant object into Framer Motion
						initial="hidden" // Set the initial state to variants.hidden
						animate="enter" // Animated state to variants.enter
						exit="exit" // Exit state (used later) to variants.exit
						transition={{ type: "linear" }} // Set the transition to linear
					>
						{props.children}
					</motion.div>
				</div>
				<FooterWeb />
			</div>
		</>
	);
};
