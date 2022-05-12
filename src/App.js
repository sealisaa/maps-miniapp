import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import MainMap from './panels/Main';
import ResultRoute from './panels/ResultRoute';

const ROUTES = {
	MAINMAP: 'mainMap',
	RESULTROUTE: 'resultRoute'
}

var chosenPlaces = new Map();

const App = () => {
	const [activePanel, setActivePanel] = useState(ROUTES.MAINMAP);

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
					<MainMap id={ROUTES.MAINMAP} go={go} places={chosenPlaces} />
					<ResultRoute id={ROUTES.RESULTROUTE} places={chosenPlaces} go={go} />
				</View>
			</AppRoot>
		</AdaptivityProvider>
	);
}

export default App;
