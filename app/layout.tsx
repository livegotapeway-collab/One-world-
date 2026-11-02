import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ONE WORLD — Les talents d'ici, les opportunités partout", description: "Découvre des produits numériques, partage tes compétences et développe tes revenus avec ONE WORLD.", applicationName: "ONE WORLD", themeColor: "#17291f" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body>{children}</body></html>; }
