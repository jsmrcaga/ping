// TO READ
// -> THe phoenix prject
// -> managing humans
// -> multilpiers
// -> Deep work
import { Section, MainBanner, Title } from '../../../../components';
import DateParser from '../../../../hooks/time';

const get_page_data = (host, searchParams = {}) => {
	const params = new URLSearchParams();
	if(searchParams.from) {
		params.add('from_date', DateParser.from(searchParams.from).getTime());
	}

	const url = `${process.env.NEXT_PUBLIC_API_URL}/${host}?${params.toString()}`;
	return fetch(url).then(response => {
		if(!response.ok) {
			throw new Error('Impossible to fetch data');
		}

		return response.json();
	});
};

export default function Home({ params, searchParams }) {
	const page_data = get_page_data(params.host, searchParams);

	return page_data.then(({ sections, title, monitors, performance_trackers, incidents, scheduled_maintenance, from, to }) => {
		return (
			<div>
				{
					sections.map((section, index) => {
						return <Section
							borderless
							transparent
							to={to}
							from={from}
							key={section.title || index}
							section={section}
							monitors={monitors}
							performance_trackers={performance_trackers}
						/>
					})
				}
			</div>
		);
	});
}
