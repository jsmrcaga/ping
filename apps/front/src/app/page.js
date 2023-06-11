import { getHost } from '../hooks/host';
import { Section, MainBanner, Title } from '../components';

import Style from './page.module.css';

const get_page_data = () => {
	const host = getHost();
	const url = `${process.env.NEXT_PUBLIC_API_URL}/${host}`;
	return fetch(url).then(response => {
		if(!response.ok) {
			throw new Error('Impossible to fetch data');
		}

		return response.json();
	});
};

export default function Home() {
	const page_data = get_page_data();

	return page_data.then(({ sections, title, monitors, incidents, scheduled_maintenance, from, to }) => {
		return (
			<>
				{ title && <Title>{ title }</Title> }
				<MainBanner
					monitors={monitors}
					incidents={incidents}
					scheduled_maintenance={scheduled_maintenance}
				/>
				<div>
					{
						sections.map((section, index) => {
							return <Section
								to={to}
								from={from}
								key={section.title || index}
								section={section}
								monitors={monitors}
							/>
						})
					}
				</div>
			</>
		);
	});
}
