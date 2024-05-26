import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "~/components/NavBar";
import "~/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header className="sticky top-0">
            <NavBar />
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
