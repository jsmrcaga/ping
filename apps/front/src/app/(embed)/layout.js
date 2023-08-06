import '../globals.css';

import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '700'] })

export const generateMetadata = () => {
  return  {
    title: 'Control - Status Page',
    description: 'Status for different control services and apps',
  };
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        { children }
      </body>
    </html>
  );
}
