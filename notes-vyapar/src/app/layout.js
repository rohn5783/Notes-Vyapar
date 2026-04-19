import "./globals.scss";
import { AuthProvider } from "@/presentation/context/AuthContext";
import { ThemeProvider } from "@/presentation/context/ThemeContext";
import LenisProvider from "@/presentation/components/layout/LenisProvider";

export const metadata = {
  title: "Notes Vyapar",
  description: "A note marketplace built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LenisProvider>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
