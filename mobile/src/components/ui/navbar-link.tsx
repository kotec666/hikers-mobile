import { FC } from "react";
import { NavLink, To } from "react-router-dom";
import { cn } from "@/lib/utils.ts";

interface NavbarLinkProps {
  to: To;
  children?: React.ReactNode;
}

const NavbarLink: FC<NavbarLinkProps> = ({ to, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        return cn(
          " w-11 flex flex-col items-center gap-1 text-[0.6875rem] leading-[0.83125rem] text-neutral-400",
          isActive && " !text-main-green"
        );
      }}
    >
      {children}
    </NavLink>
  );
};

export default NavbarLink;
