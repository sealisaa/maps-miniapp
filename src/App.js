import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, AdaptivityProvider, AppRoot, Snackbar, Avatar } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { Icon24Error } from '@vkontakte/icons';

import MainMap from './panels/MainMap';
import ResultRoute from './panels/ResultRoute';
import SelectCity from './panels/SelectCity';
import CheckCity from './panels/CheckCity';
import Blank from './panels/Blank';
import Intro from './panels/Intro';

const ROUTES = {
	MAINMAP: 'mainMap',
	RESULTROUTE: 'resultRoute',
	CHECKCITY: 'checkCity',
	SELECTCITY: 'selectCity',
	BLANK: 'blank',
	INTRO: 'intro'
}

const STORAGE_KEYS = {
	STATUS: 'status',
}

var chosenPlaces = new Map();
var city;

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
                setScheme(data.scheme)
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
                            setActivePanel(ROUTES.MAINMAP);
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
	    chosenPlaces = places;
		setActivePanel(e.currentTarget.dataset.to);
	};

	const selectCity = (e) => {
        setActivePanel(ROUTES.SELECTCITY);
    }

    const closeIntro = (e) => {
        setActivePanel(ROUTES.CHECKCITY);
    }

    const confirmCity = async function (e, city) {
        console.log(city);
        try {
            await bridge.send('VKWebAppStorageSet', {
                key: STORAGE_KEYS.STATUS,
                value: JSON.stringify({
                    citySelected: true,
                    userCity: city
                })
            });
            setCity(city);
            setActivePanel(ROUTES.MAINMAP);
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
                    <Intro id={ROUTES.INTRO} closeIntro={closeIntro} />
                    <SelectCity id={ROUTES.SELECTCITY} confirmCity={confirmCity} />
                    <CheckCity id={ROUTES.CHECKCITY} confirmCity={confirmCity} selectCity={selectCity} />
                    <MainMap id={ROUTES.MAINMAP} go={go} places={chosenPlaces} city={userCity} />
                    <ResultRoute id={ROUTES.RESULTROUTE} places={chosenPlaces} go={go} />
                </View>
            </AppRoot>
        </AdaptivityProvider>
	);
}

export default App;
