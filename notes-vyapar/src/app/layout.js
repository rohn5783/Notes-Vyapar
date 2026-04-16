import "./globals.scss";

export const metadata = {
  title: "Notes Vyapar",
  description: "A note marketplace built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
