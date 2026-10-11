import './globals.css';

export const metadata = {
  title: 'Pakistan Air Quality Atlas',
  description: 'Historical Data Dashboard for Air Quality in Pakistan',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
