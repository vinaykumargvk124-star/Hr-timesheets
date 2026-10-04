import type { ReactNode } from "react";
import "@timenod/shared/styles.css";

export const metadata = { title: "TimeNod - Approver" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
