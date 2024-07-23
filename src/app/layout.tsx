import { ClerkProvider } from "@clerk/nextjs";
import Provider from "~/_trpc/Provider";
import NavBar from "~/components/NavBar";
import "~/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <Provider>
            <header className="sticky top-0 w-full">
              <NavBar />
            </header>
            <main>{children}</main>
          </Provider>
        </ClerkProvider>
      </body>
    </html>
  );
}
