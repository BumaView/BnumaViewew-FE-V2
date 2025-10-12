import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "bunaview",
  description: "interview platform for meister highschool students",
};

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKR.className} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
