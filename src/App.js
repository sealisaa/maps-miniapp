import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, ConfigProvider, AdaptivityProvider, AppRoot, SplitLayout, SplitCol, Snackbar, Avatar } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';
import { Icon24Error } from '@vkontakte/icons';

import MainMap from './panels/MainMap';
import ResultRoute from './panels/ResultRoute';
import ChooseCity from './panels/ChooseCity';
import CheckCity from './panels/CheckCity';
import Intro from './panels/Intro';

const ROUTES = {
	MAINMAP: 'mainMap',
	RESULTROUTE: 'resultRoute',
	CHECKCITY: 'checkCity',
	CHOOSECITY: 'chooseCity',
	INTRO: 'intro'
}

const STORAGE_KEYS = {
	STATUS: 'status',
}

var chosenPlaces = new Map();
var city;

const App = () => {
    const [scheme, setScheme] = useState('bright_light');
	const [activePanel, setActivePanel] = useState(ROUTES.INTRO);
	const [fetchedUser, setUser] = useState(null);
	const [userCity, setCity] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
    const [userChoseCity, setUserChoseCity] = useState(false);
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
                        if (data[key].cityChosen) {
                            setActivePanel(ROUTES.MAINMAP);
                            setUserChoseCity(true);
                            setCity(data[key].userCity);
                        } else {
                            setActivePanel(ROUTES.CHECKCITY);
                        }
                        //setActivePanel(ROUTES.CHECKCITY);
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

	const chooseCity = (e) => {
        setActivePanel(ROUTES.CHOOSECITY);
    }

    const confirmCity = async function (e, city) {
        console.log(city);
        try {
            await bridge.send('VKWebAppStorageSet', {
                key: STORAGE_KEYS.STATUS,
                value: JSON.stringify({
                    cityChosen: true,
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
                    <Intro id={ROUTES.INTRO} />
                    <ChooseCity id={ROUTES.CHOOSECITY} confirmCity={confirmCity} />
                    <CheckCity id={ROUTES.CHECKCITY} confirmCity={confirmCity} chooseCity={chooseCity} userChoseCity={userChoseCity} />
                    <MainMap id={ROUTES.MAINMAP} go={go} places={chosenPlaces} city={userCity} />
                    <ResultRoute id={ROUTES.RESULTROUTE} places={chosenPlaces} go={go} />
                </View>
            </AppRoot>
        </AdaptivityProvider>
	);
}

export default App;
