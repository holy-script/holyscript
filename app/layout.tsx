import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import './globals.css';

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "Palash Johri's Portfolio",
  description: "Built with Next.js, TypeScript, Tailwind CSS, and Vercel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased bg-[DarkOrange]`}
      >
        {children}
      </body>
    </html>
  );
}
