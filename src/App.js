import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot, Snackbar, Avatar } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { Icon24Error } from '@vkontakte/icons';

import Blank from './panels/Blank';
import Intro from './panels/Intro';
import CheckCity from './panels/CheckCity';
import SelectCity from './panels/SelectCity';
import Home from './panels/Home';
import Route from './panels/Route';
import SavedRoutes from './panels/SavedRoutes';

const ROUTES = {
	BLANK: 'blank',
	INTRO: 'intro',
	CHECKCITY: 'checkCity',
	SELECTCITY: 'selectCity',
	HOME: 'home',
	ROUTE: 'route',
	SAVEDROUTES: 'savedRoutes'
}

const STORAGE_KEYS = {
	STATUS: 'status',
}

let chosenPlaces = new Map();
let routeName = null;
let routeType = 'auto';

const App = () => {
	const [scheme, setScheme] = useState('bright_light');
	const [activePanel, setActivePanel] = useState(ROUTES.BLANK);
	const [fetchedUser, setUser] = useState(null);
	const [userCity, setCity] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [userSelectedCity, setUserSelectedCity] = useState(false);
	const [snackbar, setSnackbar] = useState(false);

	useEffect(() => {
		bridge.subscribe(({ detail: { type, data }}) => {
			if (type === 'VKWebAppUpdateConfig') {
				setScheme(data.scheme);
			}
		});
		async function fetchData() {
			const user = await bridge.send('VKWebAppGetUserInfo');
			const storageData = await bridge.send('VKWebAppStorageGet', {
				keys: Object.values(STORAGE_KEYS)
			});
			const data = {};
			storageData.keys.forEach(({key, value}) => {
				try {
					data[key] = value ? JSON.parse(value) : {};
					switch (key) {
						case STORAGE_KEYS.STATUS:
							if (data[key].citySelected) {
								setActivePanel(ROUTES.HOME);
								setUserSelectedCity(true);
								setCity(data[key].userCity);
							} else {
								setActivePanel(ROUTES.INTRO);
							}
							break;
						default:
							break;
					}
				} catch(error) {
					setSnackbar(<Snackbar
						layout='vertical'
						onClose={() => setSnackbar(null)}
						before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic-red)'}}
						><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
						duration={900}
					>
						Проблема с получением данных из Storage
					</Snackbar>);
				}
			})
			setUser(user);
			setPopout(null);
		}
		fetchData();
	}, []);

	const go = (e, places) => {
		if (routeName != null) {
			chosenPlaces = new Map();
		} else {
			chosenPlaces = places;
		}
		routeName = null;
		setActivePanel(e.currentTarget.dataset.to);
	};

	const goToPanel = (e) => {
		setActivePanel(e.currentTarget.dataset.to);
	}

	const selectCity = () => {
		setActivePanel(ROUTES.SELECTCITY);
	}

	const showSavedRoute = (e, route) => {
		chosenPlaces = new Map();
		for (let i = 0; i < route.points.length; i++) {
			chosenPlaces.set(route.points[i].name, route.points[i].coords);
		}
		routeName = route.name;
		routeType = route.type;
		setActivePanel(ROUTES.ROUTE);
	}

	const confirmCity = async function (e, city) {
		try {
			await bridge.send('VKWebAppStorageSet', {
				key: STORAGE_KEYS.STATUS,
				value: JSON.stringify({
					citySelected: true,
					userCity: city
				})
			});
			await bridge.send('VKWebAppStorageSet', {
				key: 'userRoutes',
				value: JSON.stringify({
					"routes": []
				})
			});
			setCity(city);
			setActivePanel(ROUTES.HOME);
		} catch(error) {
			setSnackbar(<Snackbar
				layout='vertical'
				onClose={() => setSnackbar(null)}
				before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic-red)'}}
				><Icon24Error fill='#fff' width='14' height='14'/></Avatar>}
				duration={900}
			>
				Проблема с отправкой данных в Storage
			</Snackbar>);
		}
	}

	return (
		<AdaptivityProvider>
			<AppRoot>
				<View activePanel={activePanel} popout={popout}>
					<Blank id={ROUTES.BLANK} />
					<Intro id={ROUTES.INTRO} go={goToPanel} />
					<SelectCity id={ROUTES.SELECTCITY} confirmCity={confirmCity} />
					<CheckCity id={ROUTES.CHECKCITY} confirmCity={confirmCity} selectCity={selectCity} />
					<Home id={ROUTES.HOME} go={go} goToPanel={goToPanel} places={chosenPlaces} city={userCity} />
					<Route id={ROUTES.ROUTE} places={chosenPlaces} go={go} routeName={routeName} routeType={routeType} />
					<SavedRoutes id={ROUTES.SAVEDROUTES} go={go} showSavedRoute={showSavedRoute} />
				</View>
			</AppRoot>
		</AdaptivityProvider>
	);
}

export default App;