'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { classnames } from '../../hooks';
import { Button } from '../button/button';

import Styles from './header.module.css';

export function Header() {
	const pathname = usePathname();

	return (
		<div className={Styles.header}>
			<Link href="/">
				<Button
					active={pathname === '/'}
				>
					Status
				</Button>
			</Link>
			<Link href="/incidents">
				<Button
					active={pathname === '/incidents'}
				>
					Incident History
				</Button>
			</Link>
			<Link href="/performance">
				<Button
					active={pathname === '/performance'}
				>
					Performance
				</Button>
			</Link>
		</div>
	);	
}
