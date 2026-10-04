import type { ReactNode } from "react";
import "@timenod/shared/styles.css";

export const metadata = { title: "TimeNod - Employee" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
