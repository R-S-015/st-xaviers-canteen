import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalSearchModal from "@/components/GlobalSearchModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XavDash",
  description: "Seamless ordering for St. Xavier's",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative bg-transparent">
        
        {/* Fixed Background Image */}
        <div 
          className="fixed top-0 left-0 w-full h-[100vh] min-h-[100dvh] bg-cover bg-center bg-no-repeat -z-20"
          style={{ backgroundImage: "url('/bg.jpg')" }}
        ></div>

        {/* Translucent Latte Overlay */}
        <div className="fixed top-0 left-0 w-full h-[100vh] min-h-[100dvh] bg-[#E5DCC5]/65 -z-10"></div>
        
        <GlobalSearchModal />

        {/* Main Content Container (This is what scrolls) */}
        <div className="relative z-0 flex flex-col min-h-[100dvh]">
          {children}
        </div>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
