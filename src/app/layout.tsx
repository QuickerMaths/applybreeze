import "~/styles/globals.css";

import { Roboto_Flex } from "next/font/google";
import Navbar from "~/components/navbar/Navbar";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
    title: "ApplyBreeze",
    description: "Make your application breeze with ApplyBreeze",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const roboto_flex = Roboto_Flex({
    weight: ["200", "400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider>
            <html lang="en" className={roboto_flex.className}>
                <body className="text-white">
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Navbar />
                        {children}
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
