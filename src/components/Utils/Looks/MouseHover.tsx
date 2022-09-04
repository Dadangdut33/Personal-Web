import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useDeviceSelectors } from "react-device-detect";
import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
	cursor: {
		position: "fixed",
		left: 0,
		top: 0,
		marginLeft: "3px",
		marginTop: "3px",
		width: "26px",
		height: "26px",
		borderRadius: "16px",
		backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.violet[7],
		mixBlendMode: "difference",
		zIndex: 999,
		pointerEvents: "none",
	},
}));

export default function MouseHover() {
	const { classes } = useStyles();
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);

	const springConfig = { damping: 25, stiffness: 252 };
	const cursorXSpring = useSpring(cursorX, springConfig);
	const cursorYSpring = useSpring(cursorY, springConfig);

	useEffect(() => {
		const [selectors] = useDeviceSelectors(window.navigator.userAgent);
		const { isMobile } = selectors;

		if (!isMobile) {
			const moveCursor = (e: MouseEvent) => {
				cursorX.set(e.clientX - 16);
				cursorY.set(e.clientY - 16);
			};

			window.addEventListener("mousemove", moveCursor);

			return () => {
				window.removeEventListener("mousemove", moveCursor);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<motion.div
			className={classes.cursor}
			style={{
				translateX: cursorXSpring,
				translateY: cursorYSpring,
			}}
		/>
	);
}
