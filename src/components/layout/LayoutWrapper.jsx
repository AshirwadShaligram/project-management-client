"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export const LayoutWrapper = ({ children }) => {
  const pathname = usePathname();
  const noLayoutRoutes = [
    "/login",
    "/register",
    "/",
    "/forgot-password",
    "/reset-password",
  ];
  // Check if the path starts with any of the noLayoutRoutes
  const showLayout = !noLayoutRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

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
