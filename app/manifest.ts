import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "ONEWORLD — Le monde numérique", short_name: "ONEWORLD", description: "Réseau mondial pour développeurs, créateurs et bâtisseurs du numérique.", start_url: "/", display: "standalone", background_color: "#f6f7f4", theme_color: "#111916", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}