"use client";

import { useMantineColorScheme } from "@mantine/core";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";

import classes from "./MouseHover.module.css";

export function MouseHover() {
  const { colorScheme } = useMantineColorScheme();

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 252 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
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
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className={classes.cursor}
      style={{
        translateX: cursorXSpring,
        translateY: cursorYSpring,
        backgroundColor: colorScheme === "dark" ? "var(--mantine-color-dark-0)" : "var(--mantine-color-violet-7)",
      }}
    />
  );
}
