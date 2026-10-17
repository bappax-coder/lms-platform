// @ts-ignore
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="bn">
      <body className="bg-slate-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}