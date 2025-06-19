import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/redux/provider";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/layout/Sidebar";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export const metadata = {
  title: "Create Next App",
};

const inter = Inter({ subsets: ["latin"], weight: "400" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
