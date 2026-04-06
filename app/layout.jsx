import Providers from './providers';
export const metadata = { title: 'shashank.app' };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#08070f;color:#e2ddd6}`}</style></head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}