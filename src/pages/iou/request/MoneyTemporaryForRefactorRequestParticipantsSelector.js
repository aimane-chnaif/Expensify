import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import _ from 'underscore';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ReferralProgramCTA from '@components/ReferralProgramCTA';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useScreenWrapperTranstionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import variables from '@styles/variables';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Callback to request parent modal to go to next step, which should be split */
    onFinish: PropTypes.func.isRequired,

    /** Callback to add participants in MoneyRequestModal */
    onParticipantsAdded: PropTypes.func.isRequired,

    /** Selected participants from MoneyRequestModal with login */
    participants: PropTypes.arrayOf(
        PropTypes.shape({
            accountID: PropTypes.number,
            login: PropTypes.string,
            isPolicyExpenseChat: PropTypes.bool,
            isOwnPolicyExpenseChat: PropTypes.bool,
            selected: PropTypes.bool,
        }),
    ),

    /** The type of IOU report, i.e. split, request, send, track */
    iouType: PropTypes.oneOf(_.values(CONST.IOU.TYPE)).isRequired,

    /** The expense type, ie. manual, scan, distance */
    iouRequestType: PropTypes.oneOf(_.values(CONST.IOU.REQUEST_TYPE)).isRequired,

    /** The action of the IOU, i.e. create, split, move */
    action: PropTypes.oneOf(_.values(CONST.IOU.ACTION)),
};

const defaultProps = {
    participants: [],
    action: CONST.IOU.ACTION.CREATE,
};

function MoneyTemporaryForRefactorRequestParticipantsSelector({participants, onFinish, onParticipantsAdded, iouType, iouRequestType, action}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const referralContentType = iouType === CONST.IOU.TYPE.PAY ? CONST.REFERRAL_PROGRAM.CONTENT_TYPES.PAY_SOMEONE : CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE;
    const {isOffline} = useNetwork();
    const personalDetails = usePersonalDetails();
    const {isDismissed} = useDismissedReferralBanners({referralContentType});
    const {canUseP2PDistanceRequests} = usePermissions();
    const {didScreenTransitionEnd} = useScreenWrapperTranstionStatus();
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: didScreenTransitionEnd,
    });

    const offlineMessage = isOffline ? [`${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}`, {isTranslated: true}] : '';

    const maxParticipantsReached = participants.length === CONST.REPORT.MAXIMUM_PARTICIPANTS;
    const {isSmallScreenWidth} = useWindowDimensions();

    const isIOUSplit = iouType === CONST.IOU.TYPE.SPLIT;

    useEffect(() => {
        Report.searchInServer(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
                categoryOptions: [],
                tagOptions: [],
                taxRatesOptions: [],
            };
        }

        const optionList = OptionsListUtils.getFilteredOptions(
            options.reports,
            options.personalDetails,
            betas,
            '',
            participants,
            CONST.EXPENSIFY_EMAILS,

            // If we are using this component in the "Submit expense" flow then we pass the includeOwnedWorkspaceChats argument so that the current user
            // sees the option to submit an expense from their admin on their own Workspace Chat.
            (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.SPLIT) && action !== CONST.IOU.ACTION.SUBMIT,

            (canUseP2PDistanceRequests || iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE) && ![CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].includes(action),
            false,
            {},
            [],
            false,
            {},
            [],
            (canUseP2PDistanceRequests || iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE) && ![CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].includes(action),
            false,
            false,
            0,
        );

        return optionList;
    }, [action, areOptionsInitialized, betas, canUseP2PDistanceRequests, didScreenTransitionEnd, iouRequestType, iouType, options.personalDetails, options.reports, participants]);

    const chatOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
                categoryOptions: [],
                tagOptions: [],
                taxRatesOptions: [],
            };
        }

        const newOptions = OptionsListUtils.filterOptions(defaultOptions, debouncedSearchTerm, {
            betas,
            selectedOptions: participants,
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        return newOptions;
    }, [areOptionsInitialized, betas, defaultOptions, debouncedSearchTerm, participants]);
    /**
     * Returns the sections needed for the OptionsSelector
     * @returns {Array}
     */
    const [sections, header] = useMemo(() => {
        const requestMoneyOptions = chatOptions;
        const newSections = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(
            debouncedSearchTerm,
            participants,
            requestMoneyOptions.recentReports,
            requestMoneyOptions.personalDetails,
            maxParticipantsReached,
            personalDetails,
            true,
        );

        newSections.push(formatResults.section);

        if (maxParticipantsReached) {
            return [newSections, {}];
        }

        newSections.push({
            title: translate('common.recents'),
            data: requestMoneyOptions.recentReports,
            shouldShow: !_.isEmpty(options.recentReports),
        });

        if (![CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].includes(action)) {
            newSections.push({
                title: translate('common.contacts'),
                data: requestMoneyOptions.personalDetails,
                shouldShow: !_.isEmpty(chatOptions.personalDetails),
            });
        }

        if (requestMoneyOptions.userToInvite && !OptionsListUtils.isCurrentUser(requestMoneyOptions.userToInvite)) {
            newSections.push({
                title: undefined,
                data: _.map([requestMoneyOptions.userToInvite], (participant) => {
                    const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                    return isPolicyExpenseChat ? OptionsListUtils.getPolicyExpenseReportOption(participant) : OptionsListUtils.getParticipantsOption(participant, personalDetails);
                }),
                shouldShow: true,
            });
        }

        const headerMessage = OptionsListUtils.getHeaderMessage(
            _.get(requestMoneyOptions, 'personalDetails', []).length + _.get(requestMoneyOptions, 'recentReports', []).length !== 0,
            Boolean(requestMoneyOptions.userToInvite),
            debouncedSearchTerm.trim(),
            maxParticipantsReached,
            _.some(participants, (participant) => participant.searchText.toLowerCase().includes(debouncedSearchTerm.trim().toLowerCase())),
        );

        return [newSections, headerMessage];
    }, [debouncedSearchTerm, chatOptions, areOptionsInitialized, didScreenTransitionEnd, participants, action, maxParticipantsReached, personalDetails, translate, options.recentReports]);

    /**
     * Adds a single participant to the expense
     *
     * @param {Object} option
     */
    const addSingleParticipant = useCallback(
        (option) => {
            onParticipantsAdded([
                {
                    ..._.pick(option, 'accountID', 'login', 'isPolicyExpenseChat', 'reportID', 'searchText', 'policyID'),
                    selected: true,
                    iouType,
                },
            ]);
            onFinish();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
        [onFinish, onParticipantsAdded],
    );

    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     * @param {Object} option
     */
    const addParticipantToSelection = useCallback(
        (option) => {
            const isOptionSelected = (selectedOption) => {
                if (selectedOption.accountID && selectedOption.accountID === option.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID === option.reportID) {
                    return true;
                }

                return false;
            };
            const isOptionInList = _.some(participants, isOptionSelected);
            let newSelectedOptions;

            if (isOptionInList) {
                newSelectedOptions = _.reject(participants, isOptionSelected);
            } else {
                newSelectedOptions = [
                    ...participants,
                    {
                        accountID: option.accountID,
                        login: option.login,
                        isPolicyExpenseChat: option.isPolicyExpenseChat,
                        reportID: option.reportID,
                        selected: true,
                        searchText: option.searchText,
                        iouType,
                    },
                ];
            }

            onParticipantsAdded(newSelectedOptions);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- we don't want to trigger this callback when iouType changes
        [participants, onParticipantsAdded],
    );

    // Right now you can't split a request with a workspace and other additional participants
    // This is getting properly fixed in https://github.com/Expensify/App/issues/27508, but as a stop-gap to prevent
    // the app from crashing on native when you try to do this, we'll going to hide the button if you have a workspace and other participants
    const hasPolicyExpenseChatParticipant = _.some(participants, (participant) => participant.isPolicyExpenseChat);
    const shouldShowSplitBillErrorMessage = participants.length > 1 && hasPolicyExpenseChatParticipant;

    // canUseP2PDistanceRequests is true if the iouType is track expense, but we don't want to allow splitting distance with track expense yet
    const isAllowedToSplit =
        (canUseP2PDistanceRequests || iouRequestType !== CONST.IOU.REQUEST_TYPE.DISTANCE) &&
        iouType !== CONST.IOU.TYPE.PAY &&
        iouType !== CONST.IOU.TYPE.TRACK &&
        ![CONST.IOU.ACTION.SHARE, CONST.IOU.ACTION.SUBMIT, CONST.IOU.ACTION.CATEGORIZE].includes(action);

    const handleConfirmSelection = useCallback(
        (keyEvent, option) => {
            const shouldAddSingleParticipant = option && !participants.length;
            if (shouldShowSplitBillErrorMessage || (!participants.length && !option)) {
                return;
            }

            if (shouldAddSingleParticipant) {
                addSingleParticipant(option);
                return;
            }

            onFinish(CONST.IOU.TYPE.SPLIT);
        },
        [shouldShowSplitBillErrorMessage, onFinish, addSingleParticipant, participants],
    );

    const footerContent = useMemo(() => {
        if (isDismissed && !shouldShowSplitBillErrorMessage && !participants.length) {
            return;
        }

        return (
            <>
                {!isDismissed && (
                    <ReferralProgramCTA
                        referralContentType={referralContentType}
                        style={[styles.flexShrink0, !!participants.length && !shouldShowSplitBillErrorMessage && styles.mb5]}
                    />
                )}

                {shouldShowSplitBillErrorMessage && (
                    <FormHelpMessage
                        style={[styles.ph1, styles.mb2]}
                        isError
                        message="iou.error.splitExpenseMultipleParticipantsErrorMessage"
                    />
                )}

                {!!participants.length && (
                    <Button
                        success
                        text={translate('common.next')}
                        onPress={handleConfirmSelection}
                        pressOnEnter
                        large
                        isDisabled={shouldShowSplitBillErrorMessage}
                    />
                )}
            </>
        );
    }, [handleConfirmSelection, participants.length, isDismissed, referralContentType, shouldShowSplitBillErrorMessage, styles, translate]);

    const renderEmptyWorkspaceView = () => (
        <>
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyWorkspaceIconWidth}
                iconHeight={variables.emptyWorkspaceIconHeight}
                title={translate('workspace.emptyWorkspace.notFound')}
                shouldShowLink={false}
            />
            <Button
                success
                large
                text={translate('footer.learnMore')}
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_WORKSPACES)}
                style={[styles.mh5, styles.mb5]}
            />
            {isSmallScreenWidth && <OfflineIndicator />}
        </>
    );

    const isAllSectionsEmpty = _.every(sections, (section) => section.data.length === 0);
    if (
        [CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.ACTION.SHARE].includes(action) &&
        isAllSectionsEmpty &&
        didScreenTransitionEnd &&
        debouncedSearchTerm.trim() === '' &&
        areOptionsInitialized
    ) {
        return renderEmptyWorkspaceView();
    }

    return (
        <SelectionList
            onConfirm={handleConfirmSelection}
            sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
            ListItem={InviteMemberListItem}
            textInputValue={searchTerm}
            textInputLabel={translate('optionsSelector.nameEmailOrPhoneNumber')}
            textInputHint={offlineMessage}
            onChangeText={setSearchTerm}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            onSelectRow={(item) => (isIOUSplit ? addParticipantToSelection(item) : addSingleParticipant(item))}
            footerContent={footerContent}
            headerMessage={header}
            showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
            canSelectMultiple={isIOUSplit && isAllowedToSplit}
        />
    );
}

MoneyTemporaryForRefactorRequestParticipantsSelector.propTypes = propTypes;
MoneyTemporaryForRefactorRequestParticipantsSelector.defaultProps = defaultProps;
MoneyTemporaryForRefactorRequestParticipantsSelector.displayName = 'MoneyTemporaryForRefactorRequestParticipantsSelector';

export default memo(
    MoneyTemporaryForRefactorRequestParticipantsSelector,
    (prevProps, nextProps) =>
        _.isEqual(prevProps.participants, nextProps.participants) &&
        prevProps.iouRequestType === nextProps.iouRequestType &&
        prevProps.iouType === nextProps.iouType &&
        _.isEqual(prevProps.betas, nextProps.betas),
);
