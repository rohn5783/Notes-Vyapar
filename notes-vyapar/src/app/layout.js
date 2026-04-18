import "./globals.scss";
import { AuthProvider } from "@/presentation/context/AuthContext";

export const metadata = {
  title: "Notes Vyapar",
  description: "A note marketplace built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
