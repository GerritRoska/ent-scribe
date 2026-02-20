import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ENT Scribe - AI Medical Scribe for ENT Physicians",
  description: "Ambient AI medical scribe for ENT — Record a patient visit, get a structured clinical note. Powered by Whisper + GPT-4o.",
  keywords: ["AI medical scribe", "ENT", "EHR", "clinical documentation", "healthcare", "medical transcription"],
  openGraph: {
    title: "ENT Scribe - Focus on Patients, Not Paperwork",
    description: "The AI-powered medical scribe that listens, transcribes, and generates clinical notes in real-time.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
