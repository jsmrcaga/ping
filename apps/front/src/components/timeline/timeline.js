import Styles from './timeline.module.css';
import { classnames } from '../../hooks';
import { get_date_formatter } from '../../hooks/i18n';

export function TimelineItem({ date, children, className, dateFormatter=null }) {
	const formatter = dateFormatter ?? get_date_formatter();
	return (
		<div className={classnames(Styles['timeline-item'], className)}>
			<div className={Styles.date}>
				<span>{ formatter.format(new Date(date)) }</span>
			</div>

			<div className={Styles.content}>
				{ children }
			</div>
		</div>
	);
}
