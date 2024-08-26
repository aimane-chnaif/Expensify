import React, {useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';

function EnabledStep() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const {setStep} = useTwoFactorAuthContext();

    const {translate} = useLocalize();

    return (
        <StepWrapper title={translate('twoFactorAuth.headerTitle')}>
            <ScrollView>
                <Section
                    title={translate('twoFactorAuth.twoFactorAuthEnabled')}
                    icon={Illustrations.ShieldYellow}
                    menuItems={[
                        {
                            title: translate('twoFactorAuth.disableTwoFactorAuth'),
                            onPress: () => {
                                setStep(CONST.TWO_FACTOR_AUTH_STEPS.GETCODE);
                                // setIsConfirmModalVisible(true);
                            },
                            icon: Expensicons.Close,
                            iconFill: theme.danger,
                            wrapperStyle: [styles.cardMenuItem],
                        },
                    ]}
                    containerStyles={[styles.twoFactorAuthSection]}
                >
                    <View style={styles.mv3}>
                        <Text style={styles.textLabel}>{translate('twoFactorAuth.whatIsTwoFactorAuth')}</Text>
                    </View>
                </Section>
            </ScrollView>
        </StepWrapper>
    );
}

EnabledStep.displayName = 'EnabledStep';

export default EnabledStep;
