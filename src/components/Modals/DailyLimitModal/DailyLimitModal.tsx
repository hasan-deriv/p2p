import Modal from 'react-modal';
import { api } from '@/hooks';
import { useDevice } from '@/hooks/custom-hooks';
import { Button, Loader, Text } from '@deriv-com/ui';
import { customStyles } from '../helpers';
import './DailyLimitModal.scss';

type TDailyLimitModalProps = {
    currency: string;
    isModalOpen: boolean;
    onRequestClose: () => void;
};

const DailyLimitModal = ({ currency, isModalOpen, onRequestClose }: TDailyLimitModalProps) => {
    const { data, error, isPending: isLoading, isSuccess, mutate } = api.advertiser.useUpdate();
    const { daily_buy_limit, daily_sell_limit } = data ?? {};
    const { isMobile } = useDevice();

    const getModalContent = () => {
        //TODO: modal header title to be moved out if needed according to implementation, can be moved to a separate getheader, getcontent, getfooter functions
        if (isLoading) {
            return <Loader />;
        } else if (isSuccess) {
            return (
                <>
                    <Text color='prominent' weight='bold'>
                        Success!
                    </Text>
                    <Text as='p' className='daily-limit-modal__text' color='prominent' size='sm'>
                        {`Your daily limits have been increased to ${daily_buy_limit} ${currency} (buy) and ${daily_sell_limit} ${currency} (sell).`}
                    </Text>
                    <div className='daily-limit-modal__footer'>
                        <Button onClick={onRequestClose} size='lg' textSize='sm'>
                            Ok
                        </Button>
                    </div>
                </>
            );
        } else if (error) {
            return (
                <>
                    <Text color='prominent' weight='bold'>
                        An internal error occured
                    </Text>
                    <Text as='p' className='daily-limit-modal__text' color='prominent' size='sm'>
                        {`Sorry, we're unable to increase your limits right now. Please try again in a few minutes.`}
                    </Text>
                    <div className='daily-limit-modal__footer'>
                        <Button onClick={onRequestClose} size='lg' textSize='sm'>
                            Ok
                        </Button>
                    </div>
                </>
            );
        }
        return (
            <>
                <Text color='prominent' weight='bold'>
                    Are you sure?
                </Text>
                <Text as='p' className='daily-limit-modal__text' color='prominent' size={isMobile ? 'md' : 'sm'}>
                    You won’t be able to change your buy and sell limits again after this. Do you want to continue?
                </Text>
                <div className='daily-limit-modal__footer'>
                    <Button onClick={onRequestClose} size='lg' textSize='sm' variant='outlined'>
                        No
                    </Button>
                    <Button onClick={() => mutate({ upgrade_limits: 1 })} size='lg' textSize='sm'>
                        Yes, continue
                    </Button>
                </div>
            </>
        );
    };

    return (
        // TODO: below modal will be rewritten to use @deriv/ui modal
        <Modal
            className='daily-limit-modal'
            isOpen={isModalOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            testId='dt_daily_limit_modal'
        >
            {getModalContent()}
        </Modal>
    );
};

export default DailyLimitModal;
