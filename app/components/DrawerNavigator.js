import React, { Component } from 'react'
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import DashBoardActivity from './DashBoardActivity';
import SubjectActivity from './SubjectActivity';
import ChapterActivity from './ChapterActivity';
import CustomSidebarMenu from './CustomSidebarMenu';
import SubjectPracticeActivity from './SubjectPracticeActivity';
import ChapterPracticeActivity from './ChapterPracticeActivity';
import TopicDetailActivity from './TopicDetailActivity';
import QuestionPaperActivity from './QuestionPaperActivity';
import QuestionPaperYearActivity from './QuestionPaperYearActivity';
import QuestionPaperInstructionActivity from './QuestionPaperInstructionActivity';
import MockTestActivity from './MockTestActivity';
import MockTestYearActivity from './MockTestYearActivity';
import MockTestInstructionActivity from './MockTestInstructionActivity';
import QuizPaperActivity from './QuizPaperActivity';
import SummeryPaperActivity from './SummeryPaperActivity';
import QuizPaperResultActivity from './QuizPaperResultActivity';
import SolutionPaperActivity from './SolutionPaperActivity';
import QuizMockActivity from './QuizMockActivity';
import SummeryMockActivity from './SummeryMockActivity';
import QuizReviewTeacherActivity from './QuizReviewTeacherActivity';
import QuizMockResultActivity from './QuizMockResultActivity';


const AppNavigatorWithDrawer = createStackNavigator({
    dashBoardActivity: DashBoardActivity,
    subjectActivity: SubjectActivity,
    chapterActivity: ChapterActivity,
    subjectPracticeActivity: SubjectPracticeActivity,
    chapterPracticeActivity: ChapterPracticeActivity,
    topicDetailActivity: TopicDetailActivity,
    quizReviewTeacherActivity: QuizReviewTeacherActivity,
    questionPaperActivity: QuestionPaperActivity,
    questionPaperYearActivity: QuestionPaperYearActivity,
    questionPaperInstructionActivity: QuestionPaperInstructionActivity,
    mockTestActivity: MockTestActivity,
    mockTestYearActivity: MockTestYearActivity,
    mockTestInstructionActivity : MockTestInstructionActivity,
    
    quizPaperActivity: QuizPaperActivity,
    summeryPaperActivity: SummeryPaperActivity,
    quizPaperResultActivity: QuizPaperResultActivity,
    solutionPaperActivity: SolutionPaperActivity,
    quizMockActivity: QuizMockActivity,
    summeryMockActivity: SummeryMockActivity,
    quizMockResultActivity: QuizMockResultActivity,
}, {
    headerMode: 'none'
});

const DrawerNavigator = createDrawerNavigator({
    SubjectActivity: AppNavigatorWithDrawer
},
    {
        contentComponent: CustomSidebarMenu,
        drawerWidth: '75%',
    });

export default createAppContainer(DrawerNavigator);