import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { View, ScreenSpinner, ConfigProvider, AdaptivityProvider, AppRoot, SplitLayout, SplitCol } from '@vkontakte/vkui';
import '@vkontakte/vkui/dist/vkui.css';

import MainMap from './panels/MainMap';
import ResultRoute from './panels/ResultRoute';
import ChooseCity from './panels/ChooseCity';
import Intro from './panels/Intro';

const ROUTES = {
	MAINMAP: 'mainMap',
	RESULTROUTE: 'resultRoute',
	CHOOSECITY: 'chooseCity',
	INTRO: 'intro'
}

const STORAGE_KEYS = {
	STATUS: 'status',
}

var chosenPlaces = new Map();
var theUser;

const App = () => {
    const [scheme, setScheme] = useState('bright_light');
	const [activePanel, setActivePanel] = useState(ROUTES.CHOOSECITY);
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);

	useEffect(() => {
        bridge.subscribe(({ detail: { type, data }}) => {
            if (type === 'VKWebAppUpdateConfig') {
                setScheme(data.scheme)
            }
        });

        async function fetchData() {
            const user = await bridge.send('VKWebAppGetUserInfo');
            setUser(user);
            theUser = user;
            setPopout(null);
        }
        fetchData();
    }, []);

	const go = (e, places) => {
	    chosenPlaces = places;
		setActivePanel(e.currentTarget.dataset.to);
	};

	return (
	    <ConfigProvider scheme={scheme}>
            <AdaptivityProvider>
                <AppRoot>
                    <SplitLayout popout={popout}>
                        <SplitCol>
                            <View activePanel={activePanel}>
                                <ChooseCity id={ROUTES.CHOOSECITY} fetchedUser={fetchedUser} go={go} />
                                <MainMap id={ROUTES.MAINMAP} go={go} places={chosenPlaces} />
                                <ResultRoute id={ROUTES.RESULTROUTE} places={chosenPlaces} go={go} />
                            </View>
                        </SplitCol>
                    </SplitLayout>
                </AppRoot>
            </AdaptivityProvider>
		</ConfigProvider>
	);
}

export default App;
