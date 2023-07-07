import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';

const commonScreenOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
};

export default (isSmallScreenWidth) => ({
    rightModalNavigator: {
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),
        presentation: 'transparentModal',

        // we want pop in RHP since there are some flows that would work weird otherwise
        animationTypeForReplace: 'pop',
        cardStyle: {
            ...styles.cardStyleNavigator,

            // This is necessary to cover translated sidebar with overlay.
            marginLeft: isSmallScreenWidth ? 0 : -2 * variables.sideBarWidth,
        },
    },

    homeScreen: {
        title: 'New Expensify',
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),

        // Prevent unnecessary scrolling
        cardStyle: {
            ...styles.cardStyleNavigator,
            width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,

            // We need to translate the sidebar to not be covered by the StackNavigator so it can be clickable.
            transform: [{translateX: isSmallScreenWidth ? 0 : -variables.sideBarWidth}],
            ...(isSmallScreenWidth ? {} : styles.borderRight),
        },
    },
    // eslint-disable-next-line rulesdir/no-negated-variables
    notFoundScreen: {
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, true, props),
        cardStyle: {
            ...styles.cardStyleNavigator,

            // This is necessary to cover whole screen. Including translated sidebar.
            marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
        },
    },

    centralPaneNavigator: {
        title: 'New Expensify',
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, true, props),

        // Prevent unnecessary scrolling
        cardStyle: styles.cardStyleNavigator,
    },
});
