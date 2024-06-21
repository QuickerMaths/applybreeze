import "~/styles/globals.css";

import { Roboto_Flex } from "next/font/google";

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
    <html lang="en" className={roboto_flex.className}>
      <body>{children}</body>
    </html>
  );
}
