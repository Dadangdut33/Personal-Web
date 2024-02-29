"use-client";

import { motion } from "framer-motion";
import { NextPage } from "next";

import { MouseHover } from "../cosmetics/MouseHover";
import { Footer } from "./Footer";
import { HeaderMenu } from "./Header";

interface IWrapper {
  children: React.ReactNode;
  noHeader?: boolean;
  noFooter?: boolean;
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
        {!props.noHeader && <HeaderMenu />}
        <div className="content-wrap">
          <div>{props.children}</div>
        </div>
        {!props.noFooter && <Footer />}
      </div>
    </>
  );
};
