import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@navigation/Navigation';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import withFullTransactionOrNotFound, {type WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import withWritableReportOrNotFound, {type WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestCompanyInfoForm';

type IOURequestStepCompanyInfoProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO>;

function IOURequestStepCompanyInfo({route, transaction}: IOURequestStepCompanyInfoProps) {
    const {backTo} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const formattedAmount = CurrencyUtils.convertToDisplayString(Math.abs(transaction?.amount ?? 0), transaction?.currency);

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.companyInfo')}
            onBackButtonPress={() => Navigation.goBack(backTo)}
            shouldShowWrapper
            testID={IOURequestStepCompanyInfo.displayName}
        >
            <Text style={[styles.textNormalThemeText, styles.ph5]}>{translate('iou.companyInfoDescription')}</Text>
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM}
                onSubmit={() => {}}
                validate={() => {
                    return {};
                }}
                submitButtonText={translate('iou.sendInvoice', {amount: formattedAmount})}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.COMPANY_NAME}
                    name={INPUT_IDS.COMPANY_NAME}
                    label={translate('iou.yourCompanyName')}
                    accessibilityLabel={translate('iou.yourCompanyName')}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                    containerStyles={styles.mv4}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.COMPANY_WEBSITE}
                    name={INPUT_IDS.COMPANY_WEBSITE}
                    inputMode={CONST.INPUT_MODE.URL}
                    label={translate('iou.yourCompanyWebsite')}
                    accessibilityLabel={translate('iou.yourCompanyWebsite')}
                    role={CONST.ROLE.PRESENTATION}
                    hint={translate('iou.yourCompanyWebsiteNote')}
                />
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepCompanyInfo.displayName = 'IOURequestStepCompanyInfo';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepCompanyInfo));
