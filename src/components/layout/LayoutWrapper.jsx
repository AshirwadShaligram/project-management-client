"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

export const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const noLayoutRoutes = ["/login", "/register", "/"];
  const showLayout = !noLayoutRoutes.includes(pathname);

  return showLayout ? (
    <div className="min-h-screen flex  md:flex-row bg-background">
      <Sidebar />
      <div className="flex-1 flex ">
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  ) : (
    <main>{children}</main>
  );
};
