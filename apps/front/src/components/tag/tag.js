import { classnames } from '../../hooks';
import Styles from './tag.module.css';

export function Tag({ children, className }) {
	return (
		<div className={classnames(Styles.tag, className)}>
			{ children }
		</div>
	);
}
