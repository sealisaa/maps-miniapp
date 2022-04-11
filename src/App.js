import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import YandexMap from './panels/YandexMap';
import ResultRoute from './panels/ResultRoute';

const ROUTES = {
	YANDEXMAP: 'yandexMap',
	RESULTROUTE: 'resultRoute'
}

var chosenPlaces = new Map();

const App = () => {
	const [activePanel, setActivePanel] = useState(ROUTES.YANDEXMAP);
	const [fetchedUser, setUser] = useState(null);

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});
	}, []);

	const go = (e, places) => {
	    chosenPlaces = places;
		setActivePanel(e.currentTarget.dataset.to);
	};

	return (
		<AdaptivityProvider>
			<AppRoot>
				<View activePanel={activePanel}>
					<YandexMap id={ROUTES.YANDEXMAP} go={go} />
					<ResultRoute id={ROUTES.RESULTROUTE} places={chosenPlaces} />
				</View>
			</AppRoot>
		</AdaptivityProvider>
	);
}

export default App;
