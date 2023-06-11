import { classnames } from '../../hooks';

import Styles from './title.module.css';

export function Title({ as='h1', left, children, className, ...props }) {
	const Component = as;
	return (
		<Component
			className={classnames(className, Styles.title, {
				[Styles.left]: left
			})}
		>
			{ children }
		</Component>
	);
}
