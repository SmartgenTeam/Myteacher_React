/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import {
  Dimensions
} from 'react-native';

import LoginActivity from './app/components/LoginActivity';
import SignUpActivity from './app/components/SignUpActivity';
import KDApp from './app/components/KDApp';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator } from 'react-navigation-drawer';
import TopicActivity from './app/components/TopicActivity';
import GradeActivity from './app/components/GradeActivity';
import ForgotPasswordActivity from './app/components/ForgotPasswordActivity';
import ResetPasswordActivity from './app/components/ResetPasswordActivity';
import OTPActivity from './app/components/OTPActivity';
import QuizActivity from './app/components/QuizActivity';
import SummeryActivity from './app/components/SummeryActivity';
import QuizResultActivity from './app/components/QuizResultActivity';
import AppNavigatorWithDrawer from './app/components/DrawerNavigator';
import NotesActivity from './app/components/NotesActivity';
import VideoActivity from './app/components/VideoActivity';
import QuizPracticeActivity from './app/components/QuizPracticeActivity';
import QuizPracticeResultActivity from './app/components/QuizPracticeResultActivity';
import SummeryPracticeActivity from './app/components/SummeryPracticeActivity';
import ContactUsActivity from './app/components/ContactUsActivity';
import WalletActivity from './app/components/WalletActivity';
import ReferEarnActivity from './app/components/ReferEarnActivity';
import BuyPackageActivity from './app/components/BuyPackageActivity';
import NotificationActivity from './app/components/NotificationActivity';
import ProfileActivity from './app/components/ProfileActivity';
import PerformanceActivity from './app/components/PerformanceActivity';
import ReviewActivity from './app/components/ReviewActivity';
import QuizReviewActivity from './app/components/QuizReviewActivity';
import SummeryReviewActivity from './app/components/SummeryReviewActivity';
import SplashActivity from './app/components/SplashActivity';
import LanguageChooserActivity from './app/components/LanguageChooserActivity';
import SummeryTeacherReviewActivity from './app/components/SummeryTeacherReviewActivity';
import QuizInteractiveActivity from './app/components/QuizInteractiveActivity';

const AppNavigator = createStackNavigator({
  splashActivity: SplashActivity,
  languageChooserActivity: LanguageChooserActivity,
  loginActivity: LoginActivity,
  signUpActivity: SignUpActivity,
  dashBoardActivity: AppNavigatorWithDrawer,
  subjectActivity: AppNavigatorWithDrawer,
  chapterActivity: AppNavigatorWithDrawer,
  topicActivity: TopicActivity,
  forgotPasswordActivity: ForgotPasswordActivity,
  resetPasswordActivity: ResetPasswordActivity,
  topicDetailActivity: AppNavigatorWithDrawer,
  quizReviewTeacherActivity: AppNavigatorWithDrawer,
  otpActivity: OTPActivity,
  quizActivity: QuizActivity,
  summeryActivity: SummeryActivity,
  summeryTeacherReviewActivity: SummeryTeacherReviewActivity,
  quizResultActivity: QuizResultActivity,
  notesActivity: NotesActivity,
  videoActivity: VideoActivity,
  quizInteractiveActivity: QuizInteractiveActivity,
  subjectPracticeActivity: AppNavigatorWithDrawer,
  chapterPracticeActivity: AppNavigatorWithDrawer,
  quizPracticeActivity: QuizPracticeActivity,
  summeryPracticeActivity: SummeryPracticeActivity,
  quizPracticeResultActivity: QuizPracticeResultActivity,
  contactUsActivity: ContactUsActivity,
  walletActivity: WalletActivity,
  referEarnActivity: ReferEarnActivity,
  buyPackageActivity: BuyPackageActivity,
  notificationActivity: NotificationActivity,
  profileActivity: ProfileActivity,
  gradeActivity: GradeActivity,
  performanceActivity: PerformanceActivity,
  questionPaperActivity: AppNavigatorWithDrawer,
  questionPaperYearActivity: AppNavigatorWithDrawer,
  questionPaperInstructionActivity: AppNavigatorWithDrawer,
  quizPaperActivity: AppNavigatorWithDrawer,
  summeryPaperActivity: AppNavigatorWithDrawer,
  quizPaperResultActivity: AppNavigatorWithDrawer,
  solutionPaperActivity: AppNavigatorWithDrawer,
  mockTestActivity: AppNavigatorWithDrawer,
  mockTestYearActivity: AppNavigatorWithDrawer,
  mockTestInstructionActivity: AppNavigatorWithDrawer,
  quizMockActivity: AppNavigatorWithDrawer,
  summeryMockActivity: AppNavigatorWithDrawer,
  quizMockResultActivity: AppNavigatorWithDrawer,
  reviewActivity: ReviewActivity,
  quizReviewActivity: QuizReviewActivity,
  summeryReviewActivity: SummeryReviewActivity,
}, {
  headerMode: 'none'
});

export default createAppContainer(AppNavigator);