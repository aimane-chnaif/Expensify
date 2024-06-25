import React, {useState} from 'react';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {removePolicyConnection} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import AccountingConnectionConfirmationModal from '@components/AccountingConnectionConfirmationModal';
import type {ConnectToNetSuiteButtonProps} from './types';


function ConnectToNetSuiteButton({policyID, shouldDisconnectIntegrationBeforeConnecting, integrationToDisconnect}: ConnectToNetSuiteButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    return (
        <>
            <Button
                onPress={() => {
                    if (shouldDisconnectIntegrationBeforeConnecting && integrationToDisconnect) {
                        setIsDisconnectModalOpen(true);
                        return;
                    }

                    // Will be updated to new token input page
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policyID));
                }}
                text={translate('workspace.accounting.setup')}
                style={styles.justifyContentCenter}
                small
                isDisabled={isOffline}
            />
            {shouldDisconnectIntegrationBeforeConnecting && isDisconnectModalOpen && integrationToDisconnect && (
                <AccountingConnectionConfirmationModal onConfirm={() => {
                    removePolicyConnection(policyID, integrationToDisconnect);
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policyID));
                    setIsDisconnectModalOpen(false);
                }}  integrationToConnect={CONST.POLICY.CONNECTIONS.NAME.NETSUITE} onCancel={() => setIsDisconnectModalOpen(false)} isModalVisible={isDisconnectModalOpen} integrationToDisconnect={integrationToDisconnect} />
            )}
        </>
    );
}

export default ConnectToNetSuiteButton;
