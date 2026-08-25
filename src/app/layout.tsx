import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "AI SEO Audit Dashboard",
  description: "Professional SEO Analysis & Recommendations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="nav-container">
            <Link href="/" className="logo">
              AI SEO Audit Dashboard
            </Link>

            <nav className="navigation">
              <Link href="/">Dashboard</Link>
              <Link href="/history">History</Link>
              <Link href="/reports">Reports</Link>
              <Link href="/settings">Settings</Link>
              <Link href="/health">Health</Link>
            </nav>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          © 2026 AI SEO Audit Dashboard
        </footer>
      </body>
    </html>
  );
}