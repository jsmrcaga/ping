import { classnames } from '../../hooks';

import Styles from './button.module.css';

export function Button({ children, active=false, className, ...props }) {
	return (
		<button
			className={classnames(Styles.button, className, {
				[Styles.active]: active
			})}
			{...props}
		>
			{ children }
		</button>
	);
}
