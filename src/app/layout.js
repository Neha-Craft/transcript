
import "./globals.css";
import Home from "@/component/home"
import { ReduxProvider } from "@/reduxtoolkit/reduxProvider";
import localFont from 'next/font/local'

// const cursive = localFont({
//   // src: '/font/sora-3/Sora-Bold.ttf',
//   variable: '--font-sora',
// })

export const metadata = {
  title: "Premium Ai",
  description: "Medical assistant application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
        <div className="flex h-screen">
          <Home/>
          <main className="flex-1 overflow-y-auto ">
            {children}
          </main>
        </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
