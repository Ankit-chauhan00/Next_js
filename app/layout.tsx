import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";


const inter = localFont({
  src: "./fonts/interVf.ttf",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

const space = localFont({
  src: "./fonts/spaceGrostek.ttf",
  variable: "--font-space",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevFlow",
  description: "A community-driven platform  for asking and answering programming questions. Get help, share knowledge, and collaborate with the developers around the world. Explore topics in web developement, mobile app developement, and more",
};

const RootLayout =  async ({
  children,
}: {
  children: React.ReactNode;
})=> {
// thsis auth is not built in
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider session={session}>
      <body
        className={`${inter.variable} ${space.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
           {children}
        </ThemeProvider>

       <Toaster/>
      </body>
      </SessionProvider>
    </html>
  );
}

export default RootLayout;
