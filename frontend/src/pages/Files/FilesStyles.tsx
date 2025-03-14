import { makeStyles } from '@fluentui/react-components';

const FilesPageStyles = makeStyles({
    createRoomButton: {
        marginLeft: '10px',
        minWidth: '9rem',
    },
    container: {
        display: 'flex',
        height: "calc(100vh - 55px)",
        width: navigator.userAgent.includes('Firefox') ? '-moz-available' : '-webkit-fill-available',
    },
    leftPanel: {
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
    },
    headerTitle: {
        flexGrow: 1,
        wordBreak: "break-all",
        paddingBottom: ".25rem",
        paddingTop: ".25rem",
        maxHeight: "5rem",
    },
    scrollableContent: {
        userSelect: 'text',
        maxHeight: 'auto',
        overflowY: 'auto',
    },
    lineNumber: {
        textAlign: 'right',
        paddingRight: '10px',
        fontSize: '14px',
        color: '#888',
        userSelect: 'none',
    },
    lineText: {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
    },
    divider: {
        width: '3px',
    },
    rightPanel: {
        display: 'flex',
        flexDirection: 'column',
        height: 'auto',
    },
    summaryTitle: {
        flexGrow: 1,
    },
    chapterContainer: {
        marginBottom: '20px',
    },
    chapterHeader: {
        display: 'flex',
        alignItems: 'center',
    },
    summaryText: {
        marginTop: '5px',
        alignItems: 'center',
        display: 'flex',
    },
});

export default FilesPageStyles;