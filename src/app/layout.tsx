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
      <body className="bg-[#F8FAFC] text-slate-900 min-h-screen antialiased">
        <AuthProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-w-0 overflow-y-auto">
              <div className="lg:pl-0 pl-0">
                {children}
              </div>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
