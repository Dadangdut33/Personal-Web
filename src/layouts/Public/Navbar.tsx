"use client";

import { Link } from "@/components/Router";
import Button, { BtnActiveClass } from "@/components/ui/Button";
import { usePathname } from "next/navigation";
import { Image } from "@mantine/core";

import MobileDrawer from "./MobileDrawer";
import { BtnToggleColor } from "@/components/Button/BtnToggleColor";

function Navbar() {
  const pathName = usePathname();
  return (
    <nav
      className="fixed left-0 top-0 z-20 mx-auto flex h-[88px] w-full items-center border-b-4 border-black px-5 m500:h-16 bg-white
        dark:bg-gray-700"
    >
      <div className="mx-auto flex w-[1300px] max-w-full items-center justify-between">
        <MobileDrawer />

        <div className="flex items-center gap-10 m400:flex-1 m400:pl-5">
          <Link className="text-4xl font-heading m500:text-xl" href={"/"}>
            <Image src={"/assets/logo-transparent.png"} alt="Logo" className="w-[80px]" />
          </Link>
        </div>

        <div className="flex gap-5 justify-end">
          <div className="flex w-[160px] items-center justify-end gap-5 m900:hidden m400:gap-3">
            <Button className={pathName === "/" ? BtnActiveClass : "bg-transparent"} component={Link} href="/">
              <p className="text-xl font-base">About</p>
            </Button>
            <Button
              className={pathName === "/project" ? BtnActiveClass : "bg-transparent"}
              component={Link}
              href="/project"
            >
              <p className="text-xl font-base">Project</p>
            </Button>
            <Button className={pathName === "/blog" ? BtnActiveClass : "bg-transparent"} component={Link} href="/blog">
              <p className="text-xl font-base">Blog</p>
            </Button>
          </div>
          <div>
            <BtnToggleColor />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
