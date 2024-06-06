"use client";

import { onStart } from "@/components/Router/events";
import Button from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import { isString } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaBars } from "react-icons/fa";

const SIDEBAR = [
  "Navigation",
  {
    href: "/",
    text: "About",
  },
  {
    href: "/project",
    text: "Project",
  },
  {
    href: "/blog",
    text: "Blog",
  },
];
import { FiCornerDownRight } from "react-icons/fi";
export default function MobileDrawer() {
  const router = useRouter();
  const [isDrawerActive, setIsDrawerActive] = useState(false);
  const pathName = usePathname();

  const handleLinkClick = (path: string) => {
    setIsDrawerActive(false);
    if (path !== pathName) onStart();
    router.push(path);
  };

  return (
    <>
      <div className="hidden m900:block">
        <Button className="p-2 bg-transparent" onClick={() => setIsDrawerActive(true)}>
          <FaBars className="h-6 w-6 m500:h-4 m500:w-4" />
        </Button>
      </div>

      <Drawer active={isDrawerActive} setActive={setIsDrawerActive}>
        <div className="scrollbar h-full w-full overflow-y-auto">
          {SIDEBAR.map((item, id) => {
            return isString(item) ? (
              <div
                key={id}
                className="block border-b-4 border-r-4 border-black p-4 text-xl font-heading m800:p-4 m800:text-base bg-gray"
              >
                {item}
              </div>
            ) : (
              <button
                key={id}
                onClick={() => {
                  handleLinkClick(item.href);
                }}
                className={`block w-full border-b-4 border-r-4 border-black p-4 pl-7 text-left text-lg font-base hover:bg-main m800:p-4 m800:pl-6
                  m800:text-base ${pathName === item.href ? "bg-main dark:text-black/90" : ""}`}
              >
                <FiCornerDownRight className="inline-block" /> {item.text}
              </button>
            );
          })}
        </div>
      </Drawer>
    </>
  );
}
