import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { BUY_SELL_URL } from '@/constants';
import { api } from '@/hooks';
import { AdvertiserInfoStateProvider } from '@/providers/AdvertiserInfoStateProvider';
import { useAuthorize } from '@deriv-com/api-hooks';
import { Loader, Tab, Tabs } from '@deriv-com/ui';
import Router from '../Router';
import { routes } from '../routes-config';
import './index.scss';

const tabRoutesConfiguration = routes.filter(route => route.name !== 'Advertiser');

const AppContent = () => {
    const history = useHistory();
    const location = useLocation();
    const { data: activeAccountData, isLoading: isLoadingActiveAccount } = api.account.useActiveAccount();
    const { isSuccess } = useAuthorize();

    const getActiveTab = (pathname: string) => {
        const match = routes.find(route => pathname.startsWith(route.path));
        return match ? match.name : BUY_SELL_URL;
    };

    const [activeTab, setActiveTab] = useState(() => getActiveTab(location.pathname));
    const [hasCreatedAdvertiser, setHasCreatedAdvertiser] = useState(false);
    const { subscribe: subscribeP2PSettings } = api.settings.useSettings();
    const {
        error,
        isIdle,
        isLoading,
        isActive: isSubscribed,
        subscribe: subscribeAdvertiserInfo,
    } = api.advertiser.useGetInfo();

    useEffect(() => {
        if (activeAccountData) {
            subscribeP2PSettings({});
        }
    }, [activeAccountData, subscribeP2PSettings]);

    useEffect(() => {
        if (isSuccess) {
            subscribeAdvertiserInfo({});
        }
    }, [isSuccess, subscribeAdvertiserInfo]);

    // Need this to subscribe to advertiser info after user has created an advertiser.
    // setHasCreatedAdvertiser is triggered inside of NicknameModal.
    useEffect(() => {
        if (isSuccess && hasCreatedAdvertiser) {
            subscribeAdvertiserInfo({});
        }
    }, [hasCreatedAdvertiser, isSuccess, subscribeAdvertiserInfo]);

    useEffect(() => {
        setActiveTab(getActiveTab(location.pathname));
    }, [location]);

    if (isLoadingActiveAccount || !activeAccountData) return <Loader />;

    // NOTE: Replace this with P2PBlocked component later and a custom hook useIsP2PEnabled, P2P is only available for USD accounts
    if (activeAccountData?.currency !== 'USD') return <h1>P2P is only available for USD accounts.</h1>;

    return (
        <AdvertiserInfoStateProvider
            value={{
                error,
                isIdle,
                isLoading,
                isSubscribed,
                setHasCreatedAdvertiser,
            }}
        >
            <div className='app-content'>
                <Tabs
                    activeTab={activeTab}
                    className='app-content__tabs'
                    onChange={index => {
                        setActiveTab(tabRoutesConfiguration[index].name);
                        history.push(tabRoutesConfiguration[index].path);
                    }}
                    variant='secondary'
                >
                    {tabRoutesConfiguration.map(route => (
                        <Tab key={route.name} title={route.name} />
                    ))}
                </Tabs>
                <Router />
            </div>
        </AdvertiserInfoStateProvider>
    );
};

export default AppContent;
