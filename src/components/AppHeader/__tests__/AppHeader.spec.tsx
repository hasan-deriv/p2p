import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';
import { useActiveAccount } from '@/hooks/api/account';
import { useAuthData } from '@deriv-com/api-hooks';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppHeader from '../AppHeader';

const mockUseAuthData = useAuthData as jest.Mock;
jest.mock('@deriv-com/api-hooks', () => ({
    useAccountList: jest.fn(() => ({
        data: [
            {
                account_category: 'trading',
                account_type: 'binary',
                broker: 'CR',
                currency: 'USD',
                loginid: 'CR90000383',
            },
        ],
    })),
    useAuthData: jest.fn(() => ({ activeLoginid: null, error: null, logout: jest.fn() })),
    useBalance: jest.fn(() => ({
        data: {
            balance: {
                accounts: {
                    CR90000383: {
                        balance: 10302,
                        converted_amount: 10302,
                        currency: 'USD',
                        demo_account: 0,
                        status: 1,
                        type: 'deriv',
                    },
                    VRTC90000221: {
                        balance: 10000,
                        converted_amount: 10000,
                        currency: 'USD',
                        demo_account: 1,
                        status: 1,
                        type: 'deriv',
                    },
                },
                balance: 10302,
                currency: 'USD',
                loginid: 'CR90000383',
                total: {
                    deriv: {
                        amount: 10302,
                        currency: 'USD',
                    },
                    deriv_demo: {
                        amount: 10000,
                        currency: 'USD',
                    },
                    mt5: {
                        amount: 0,
                        currency: 'USD',
                    },
                    mt5_demo: {
                        amount: 0,
                        currency: 'USD',
                    },
                },
            },
        },
    })),
}));

jest.mock('@deriv-com/ui', () => ({
    ...jest.requireActual('@deriv-com/ui'),
    Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
        <button onClick={onClick}>{children}</button>
    ),
    useDevice: jest.fn(() => ({ isDesktop: true })),
}));

const mockUseActiveAccountValues = {
    data: undefined,
} as ReturnType<typeof useActiveAccount>;

jest.mock('@/hooks', () => ({
    ...jest.requireActual('@/hooks'),
    api: {
        account: {
            useActiveAccount: jest.fn(() => ({
                ...mockUseActiveAccountValues,
            })),
        },
    },
}));

let mockCurrentRoute = '';

jest.mock('@/utils', () => ({
    ...jest.requireActual('@/utils'),
    getCurrentRoute: jest.fn(() => mockCurrentRoute),
}));

jest.mock('@deriv-com/auth-client', () => ({
    OAuth2Logout: jest.fn(({ WSLogoutAndRedirect }) => {
        const mockIframe = document.createElement('iframe');
        mockIframe.id = 'logout-iframe';
        document.body.appendChild(mockIframe);
        setTimeout(() => {
            const event = new MessageEvent('message', { data: 'logout_complete' });
            window.dispatchEvent(event);
        }, 100);
        WSLogoutAndRedirect();
    }),
    useIsOAuth2Enabled: jest.fn().mockReturnValue(false),
    useOAuth2: jest.fn().mockReturnValue({ isOAuth2Enabled: false }),
}));

const mockStore = {
    hubEnabledCountryList: [],
    isCheckingOidcTokens: false,
    setHubEnabledCountryList: jest.fn(),
    setIsCheckingOidcTokens: jest.fn(),
};

jest.mock('@/stores', () => ({
    useHubEnabledCountryListStore: jest.fn(selector => (selector ? selector(mockStore) : mockStore)),
    useIsLoadingOidcStore: jest.fn(selector => (selector ? selector(mockStore) : mockStore)),
}));

describe('<AppHeader/>', () => {
    window.open = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should show loader when active account data is not fetched yet', async () => {
        render(
            <BrowserRouter>
                <QueryParamProvider adapter={ReactRouter5Adapter}>
                    <AppHeader isTMBEnabled={false} />
                </QueryParamProvider>
            </BrowserRouter>
        );
        const loaderElement = screen.getByTestId('dt_accounts_info_loader');

        expect(loaderElement).toBeInTheDocument();
    });

    it('should render the desktop header and manage account actions when logged in', async () => {
        mockUseAuthData.mockReturnValue({ activeLoginid: '12345', logout: jest.fn() });
        mockUseActiveAccountValues.data = {
            currency: 'USD',
            is_virtual: 0,
        } as ReturnType<typeof useActiveAccount>['data'];

        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn().mockImplementation(query => ({
                addEventListener: jest.fn(),
                addListener: jest.fn(), // Deprecated
                dispatchEvent: jest.fn(),
                matches: false,
                media: query,
                onchange: null,
                removeEventListener: jest.fn(),
                removeListener: jest.fn(), // Deprecated
            })),
            writable: true,
        });

        Object.defineProperty(document, 'domain', {
            value: 'example.com/endpoint',
            writable: true,
        });

        mockCurrentRoute = 'endpoint';

        render(
            <BrowserRouter>
                <QueryParamProvider adapter={ReactRouter5Adapter}>
                    <AppHeader isTMBEnabled={false} />
                </QueryParamProvider>
            </BrowserRouter>
        );
        const logoutButton = await screen.findByRole('button', { name: 'Logout' });
        const { logout } = mockUseAuthData();
        await waitFor(() => expect(logoutButton).toBeInTheDocument());

        await userEvent.click(logoutButton);
        expect(logout).toHaveBeenCalled();
    });
});
