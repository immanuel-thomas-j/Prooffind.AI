import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "../components/layout/Sidebar";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "ProofPath AI — Prove What You Know.",
  description: "Evidence-based adaptive learning and genuine competence assessment platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 min-h-screen antialiased overflow-x-hidden">
        <AuthProvider>
          <div className="flex min-h-screen flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 min-w-0 w-full overflow-y-auto pt-14 lg:pt-0">
              <div className="w-full">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
