import AsyncStorage from "@react-native-community/async-storage";

const STRING = {
    // baseURL: 'http://13.234.141.121:2999/api/Raccount',
    // resourceBaseURL: 'http://13.234.141.121:7576/',
    // videoBaseURL: 'https://stepup-data.s3.ap-south-1.amazonaws.com/media/',
    baseURL: 'baseURL',
    resourceBaseURL: 'resourceBaseURL',
    videoBaseURL: 'videoBaseURL',
    topicThumbBaseURL: 'topicThumbBaseURL',
    liveClassBaseUrl: 'liveClassBaseUrl',
    servieBaseURL: 'http://0.0.0.0:',

    registrationDataURL: '/GetRegistrationData',
    registrationURL: '/RegisterNewUser',
    loginURL: '/Login',
    isValidUserInfo: '/IsValidUserInfo',
    sendOTP: 'https://www.smsstriker.com/API/sms.php?username=9705899999&password=GQQAhwKm&from=STEPUP&to=',
    sendOTPByMail: '/SendOtpByMail',
    getUserPhoneNumber: '/GetUserPhoneNumber?uniqueId=',
    resetPassword: '/ResetPassword',
    getGradesDetails: '/GetGradeDetails?',
    getTopicQuestions: '/GetTopicQuestions?',
    getTopicNote: '/GetTopicNote?',
    getChapterQuiz: '/GetChapterQuiz?',
    getSubjectQuiz: '/GetSubjectQuiz?',
    updateUserInfo: '/UpdateUserInfo',
    getCompExamDetails: '/GetCompExamDetails?',
    getPrePaperQuestions: '/GetPrePaperQuestions?',
    getMockTestDetails: '/GetMockTestDetails?',
    getAllMockTestQuestions: '/GetAllMockTestQuestions?',
    getQuestionsByIds: '/GetQuestionsByIds',
    createRazorPayOrder: '/CreateRazorPayOrder',
    paymentCallback: '/PaymentCallback?isScatchCard=',
    getPromoCodeDetails: '/GetPromoCodeDetails?promoCode=',
    getScratchCardDetails: '/GetScratchCardDetails?scratchCard=',
    syncUsageData: '/SyncUsageData',
    usageReSync: '/UsageReSync',
    updateDeviceToken: '/UpdateDeviceToken',
    getLanguages: '/GetLanguages',
    topicInteractive: '/InteractiveVideo/TopicInteractive?id=',

    forgotPasswordURL: '/LoginDetails.svc/ForgotPassword',
    examBoardURL: '/LoginDetails.svc/GetAllBoard',
    gradeURL: '/LoginDetails.svc/GetAllGrade',
    subjectURL: '/LoginDetails.svc/GetSubjectByGradeId',
    chapterURL: '/LoginDetails.svc/GetChapters',
    topicURL: '/LoginDetails.svc/GetTopics',
    SMSStrickerURL: 'https://www.smsstriker.com/API/sms.php?username=9705899999&password=GQQAhwKm&from=STEPUP&to=',
    imgSubjectURL: 'https://stepupstorage.blob.core.windows.net/stepuplive-subject/',
    imgChapterURL: 'https://stepupstorage.blob.core.windows.net/stepuplive-chapter/',
    imgTopicURL: 'https://stepupstorage.blob.core.windows.net/stepuplive-topic/',

    PreAssessment: 'Pre Assessment',
    PostAssessment: 'Post Assessment',
    Hard: 'Hard',
    Easy: 'Easy',
    Medium: 'Medium',

    USERNAME: 'userName',
    PASSWORD: 'password',
    BOARDID: 'boardId',
    BOARDNAME: 'boardName',
    GRADEID: 'gradeId',
    GRADENAME: 'gradeName',
    SUBJECTID: 'subjectId',
    SUBJECTNAME: 'subjectName',
    CHAPTERID: 'chapterId',
    CHAPTERNAME: 'chapterName',
    TOPICID: 'topicId',
    TOPICNAME: 'topicName',
    LANGUAGEID: 'languageId',
    VIDEOURL: 'videoURL',
    ISFROMLOGIN: 'isFromLogin',

    PORT: 'PORT',
}

const url = async (key) => {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.log(error);
    }
}

export { STRING, url };