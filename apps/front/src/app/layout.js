import './globals.css';

import Link from 'next/link';

import { Manrope } from 'next/font/google';

import { Header } from '../components';
import { classnames } from '../hooks';

import Styles from './layout.module.css';

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
				<div className={Styles.container}>
					<Header/>
					<main className={Styles.main}>
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
