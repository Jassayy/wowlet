
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
});

const geistMono = Geist_Mono({
     variable: "--font-geist-mono",
     subsets: ["latin"],
});

export const metadata: Metadata = {
     title: "CartoonPort - Crypto Portfolio Tracker",
     description: "Track your crypto portfolio in a fun, cartoonish way!",
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <ClerkProvider
               appearance={{
                    baseTheme: neobrutalism,
               }}
          >
               <html lang="en" suppressHydrationWarning>
                    <body
                         suppressHydrationWarning
                         className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 min-h-screen`}
                    >
                         <Toaster
                              position="top-right"
                              toastOptions={{
                                   duration: 4000,
                                   style: {
                                        background: '#FFE4E6',
                                        color: '#BE185D',
                                        border: '3px solid #EC4899',
                                        borderRadius: '16px',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                   },
                              }}
                         />
                         {children}
                    </body>
               </html>
          </ClerkProvider>
     );
}
