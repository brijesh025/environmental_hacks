import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RouteWell",
  description: "A practical route planner for comparing real route alternatives.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
