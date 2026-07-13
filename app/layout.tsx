import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "E-Kart Raceway Screening",
    template: "%s | E-Kart Raceway Screening",
  },
  description:
    "Human-reviewed applicant screening for E-Kart Raceway hiring workflows.",
  applicationName: "E-Kart Raceway Screening",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
