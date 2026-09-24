import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "ONEWORLD — Le monde numérique", description: "Une plateforme mondiale pour rencontrer des talents, apprendre, collaborer et construire.", applicationName: "ONEWORLD" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="fr"><body>{children}</body></html>; }