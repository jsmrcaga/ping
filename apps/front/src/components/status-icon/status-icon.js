import React from 'react';

import { classnames } from '../../hooks/classnames';

import Styles from './status-icon.module.css';

import CrossSVG from '../icons/cross.js';
import CheckSVG from '../icons/check.js';
import MaintenanceSVG from '../icons/maintenance.js';

const STATUS_ICONS = {
	down: CrossSVG,
	maintenance: MaintenanceSVG,
	up: CheckSVG,
};

export function Icon({ IconComponent, small=false, button=false, className, ...props }) {
	return (
		<IconComponent
			className={classnames(Styles.icon, className, {
				[Styles.small]: small,
				[Styles.button]: button,
			})}
			{...props}
		/>
	);
}

export function StatusIcon({ status, className='', ...props }) {
	const IconComponent = STATUS_ICONS[status] || STATUS_ICONS.up;
	return (
		<Icon
			className={classnames(className, {
				[Styles.up]: status === 'up',
				[Styles.down]: status === 'down',
				[Styles.maintenance]: status === 'maintenance',
			})}
			IconComponent={IconComponent}
			{...props}
		/>
	);
}
