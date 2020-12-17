import { StyleSheet } from 'react-native'
import COLORS from '../styles/color';

export default StyleSheet.create({
    thumbnailContainerTitle: {
        width: '80%',
        padding: 8,
        alignSelf: "center",
        textAlign: 'center',
        fontSize: 13,
        color: COLORS.white,
        backgroundColor: COLORS.blue,
        position: 'absolute',
        marginTop: 100,
        elevation: 5,
        borderRadius: 5,
        backgroundColor: COLORS.purple
    },
    quizContainer: {
        width: '90%',
        height: '83%',
        paddingTop: 10,
        marginTop: 60,
        alignSelf: 'center',
        position: 'absolute',
        backgroundColor: COLORS.white,
        elevation: 5,
        borderRadius: 8
    },
    thumbnailContainer: {
        width: '90%',
        height: '75%',
        paddingTop: 10,
        marginTop: 150,
        alignSelf: 'center',
        position: 'absolute'
    },
    imageThumbnailList: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 120,
        width: 150,
        marginStart:10,
        borderRadius: 14,
        backgroundColor:COLORS.darkGrey
    },
    imageSmallThumbnail: {
        height: 90,
        opacity: 0.75,
        width: 90,
        marginBottom: 20,
        borderRadius: 14,
    },
    thumbnailTitle: {
        color: COLORS.white,
        width: '100%',
        textAlign: 'center',
        textAlignVertical: 'center',
        height: 40,
        backgroundColor: 'rgba(10,55,0,0.5)',
        position: 'absolute',
        paddingLeft: 8,
        paddingRight: 8,
        bottom: 0,
        borderBottomRightRadius: 15,
        borderBottomLeftRadius: 15,
        fontSize:15,
    },
    inputBox: {
        marginTop: 30,
        paddingStart: 10,
        height: 45,
        position: 'relative',
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderWidth: 0.6,
        borderRadius: 10,
        borderColor: COLORS.orange,
        backgroundColor: COLORS.white,
        elevation: 5,
        textAlign:'right'
    },
    submitButton: {
        padding: 7,
        height: 35,
        marginTop: 20,
        marginBottom: 30,
        borderRadius: 4,
    },
    quizQue: {
        borderRadius: 5,
        width: '95%',
        borderWidth: 0.5,
        borderColor: COLORS.white,
        alignSelf: 'center',
    },
    quizOption: {
        borderRadius: 5,
        width: '86%',
        borderWidth: 1,
        borderColor: COLORS.grey,
        marginTop: 8,
        alignSelf: 'center',
    },
    selectedQuizOption: {
        borderRadius: 5,
        width: '86%',
        borderWidth: 1,
        borderColor: COLORS.orange,
        marginTop: 8,
        alignSelf: 'center',
    },
    selectedQuizOptionCorrect: {
        borderRadius: 5,
        width: '86%',
        borderWidth: 1,
        borderColor: COLORS.green,
        marginTop: 8,
        alignSelf: 'center',
    },
    selectedQuizOptionInCorrect: {
        borderRadius: 5,
        width: '86%',
        borderWidth: 1,
        borderColor: COLORS.red,
        marginTop: 8,
        alignSelf: 'center',
    },
    quizNumber: {
        backgroundColor: COLORS.white,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        marginStart: 15,
        borderRadius: 14,
        borderColor: COLORS.orange,
        borderWidth: 0.5,
        color: COLORS.blue
    },
    selectedQuizNumber: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        marginStart: 15,
        borderRadius: 20,
        borderColor: COLORS.orange,
        borderWidth: 0.5,
        backgroundColor: COLORS.orange,
        color: COLORS.white
    },
    attemptedQuizNumber: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        marginStart: 15,
        borderRadius: 20,
        borderColor: COLORS.blue,
        borderWidth: 0.5,
        backgroundColor: COLORS.blue,
        color: COLORS.white
    },
    correctQuizNumber: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        marginStart: 15,
        borderRadius: 20,
        borderColor: COLORS.green,
        borderWidth: 0.5,
        backgroundColor: COLORS.green,
        color: COLORS.white
    },
    incorrectQuizNumber: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 5,
        marginStart: 15,
        borderRadius: 20,
        borderColor: COLORS.red,
        borderWidth: 0.5,
        backgroundColor: COLORS.red,
        color: COLORS.white
    },
    quizNumberFont: {
        color: COLORS.black,
        fontSize: 13
    },
    selectedQuizNumberFont: {
        color: COLORS.white,
        fontSize: 13
    },
    attemptedQuizNumberFont: {
        color: COLORS.white,
        fontSize: 13
    },
    correctQuizNumberFont: {
        color: COLORS.white,
        fontSize: 13
    },
    incorrectQuizNumberFont: {
        color: COLORS.white,
        fontSize: 13
    },
    nextPrevBtn: {
        textAlign: 'center',
        color: COLORS.orange,
        fontWeight: 'bold',
        fontSize: 15
    },
    nextPrevBtnIfFirst: {
        textAlign: 'center',
        color: COLORS.darkGrey,
        fontWeight: 'bold',
        fontSize: 15
    },
});