import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";


export const metadata: Metadata = {
  title: "Horizon Finance",
  description: "Digital wealth and banking, simulated frontend",
};

// sets the saved theme before paint so there's no flash of the wrong mode
const themeScript = `(function(){try{var t=localStorage.getItem("horizon:theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}