import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Spectra | Tokenized Equity Intelligence", description: "Read-only tokenized equity market intelligence prototype" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
