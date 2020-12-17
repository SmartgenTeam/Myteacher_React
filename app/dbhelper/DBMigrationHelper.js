import React, { Component } from 'react'
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'UserDatabase.db' });
var CURRENT_SCHEMA_VERSION = 9;

export default class DBMigrationHelper {

    static instance = null;

    static getInstance() {
        if (DBMigrationHelper.instance == null) {
            DBMigrationHelper.instance = new DBMigrationHelper();
        }
        return this.instance;
    }

    constructor() {
        // this.getCurrentDBVersion(version => {
        //     this.createOrUpdateDB(++version);
        // });
        this.createOrUpdateDB(0);
    }

    createOrUpdateDB(version) {
        if (version <= CURRENT_SCHEMA_VERSION) {
            switch (version) {
                case 1:
                    this.executeQuery("CREATE TABLE IF NOT EXISTS userData(id STRING, name STRING, email STRING, phoneNumber STRING, stateId STRING, stateName STRING, districtId STRING, districtName STRING)");
                    this.executeQuery("CREATE TABLE IF NOT EXISTS gradeData(boardId STRING, boardName STRING, gradeId STRING, gradeName STRING, languageId STRING, purchaseDate STRING, transactionId STRING, orderId STRING, promoCode STRING, actualAmount STRING, paidAmount STRING)");
                    this.updateCurrentDBVersion(version);
                    break;
                case 2:
                    this.executeQuery("CREATE TABLE IF NOT EXISTS quizData(questionCode STRING, typeId STRING, complexityId STRING, boardId STRING, boardName STRING, gradeId STRING, gradeName STRING, subjectId STRING, subjectName STRING, chapterId STRING, chapterName STRING, topicId STRING, topicName STRING, languageId STRING, userId STRING, correctOption STRING, givenAnswer STRING, timeTaken STRING, timeStamp STRING, noOfAttempts STRING)");
                    this.updateCurrentDBVersion(version);
                    break;
                case 3:
                    this.executeQuery("CREATE TABLE IF NOT EXISTS typeIdData(typeId STRING, typeName STRING)");
                    this.updateCurrentDBVersion(version);
                    break;
                case 4:
                    this.executeQuery("ALTER TABLE userData ADD gender STRING;");
                    this.executeQuery("ALTER TABLE userData ADD dob STRING;");
                    this.updateCurrentDBVersion(version);
                    break;
                case 5:
                    this.executeQuery("ALTER TABLE gradeData ADD orderId STRING;");
                    this.executeQuery("ALTER TABLE gradeData ADD transactionId STRING;");
                    this.executeQuery("ALTER TABLE gradeData ADD promoCode STRING;");
                    this.executeQuery("ALTER TABLE gradeData ADD scratchCard STRING;");
                    this.executeQuery("ALTER TABLE gradeData ADD referalCode STRING;");
                    this.updateCurrentDBVersion(version);
                    break;
                case 6:
                    this.executeQuery("CREATE TABLE temp (questionCode STRING, typeId STRING, complexityId STRING, boardId STRING, gradeId STRING, subjectId STRING, chapterId STRING, topicId STRING, languageId STRING, userId STRING, correctOption STRING, givenAnswer STRING, timeTaken STRING, timeStamp STRING);");
                    this.executeQuery("INSERT INTO temp (questionCode, typeId, complexityId, boardId, gradeId, subjectId, chapterId, topicId, languageId, userId, correctOption, givenAnswer, timeTaken, timeStamp) SELECT questionCode, typeId, complexityId, boardId, gradeId, subjectId, chapterId, topicId, languageId, userId, correctOption, givenAnswer, timeTaken, timeStamp FROM quizData;");
                    this.executeQuery("DROP TABLE quizData");
                    this.executeQuery("ALTER TABLE temp RENAME TO quizData");
                    this.executeQuery("CREATE TABLE IF NOT EXISTS SyllabusMetaData(SyllabusMetaDataId INTEGER PRIMARY KEY AUTOINCREMENT, CategoryDetailId STRING, CategoryDetailName STRING)");
                    this.updateCurrentDBVersion(version);
                    break;
                case 7:
                    this.executeQuery("ALTER TABLE gradeData ADD endDate STRING;");
                    this.executeQuery("ALTER TABLE gradeData ADD hasMockTest STRING;");
                    this.executeQuery("ALTER TABLE SyllabusMetaData ADD status STRING;");
                    this.executeQuery("ALTER TABLE quizData ADD status STRING;");
                    this.updateCurrentDBVersion(version);
                case 8:
                    this.executeQuery("CREATE TABLE temp1 (qId INTEGER PRIMARY KEY AUTOINCREMENT, questionCode STRING, typeId STRING, complexityId STRING, boardId STRING, gradeId STRING, subjectId STRING, chapterId STRING, topicId STRING, languageId STRING, userId STRING, correctOption STRING, givenAnswer STRING, timeTaken STRING, timeStamp STRING, status STRING);");
                    this.executeQuery("INSERT INTO temp1 (qId, questionCode, typeId, complexityId, boardId, gradeId, subjectId, chapterId, topicId, languageId, userId, correctOption, givenAnswer, timeTaken, timeStamp, status) SELECT qId, questionCode, typeId, complexityId, boardId, gradeId, subjectId, chapterId, topicId, languageId, userId, correctOption, givenAnswer, timeTaken, timeStamp, status FROM quizData;");
                    this.executeQuery("DROP TABLE quizData");
                    this.executeQuery("ALTER TABLE temp1 RENAME TO quizData");

                    this.executeQuery("CREATE TABLE IF NOT EXISTS temp2 (sId INTEGER PRIMARY KEY AUTOINCREMENT, CategoryDetailId STRING, CategoryDetailName STRING, status STRING);");
                    this.executeQuery("INSERT INTO temp2 (sId, CategoryDetailId, CategoryDetailName, status) SELECT sId, CategoryDetailId, CategoryDetailName, status FROM SyllabusMetaData;");
                    this.executeQuery("DROP TABLE SyllabusMetaData");
                    this.executeQuery("ALTER TABLE temp2 RENAME TO SyllabusMetaData");
                    this.updateCurrentDBVersion(version);
                    break;
                case 9:
                    this.executeQuery("CREATE TABLE IF NOT EXISTS notificationData(nid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title STRING, date STRING, data STRING, deleteStatus STRING)");
                    this.updateCurrentDBVersion(version);
                    break;
                case 0:
                    this.executeQuery("CREATE TABLE IF NOT EXISTS versionMaster(version INTEGER)");
                    this.executeQuery("DELETE FROM versionMaster");
                    this.executeQuery("INSERT INTO versionMaster (version) VALUES(" + (version) + ")");
                    break;
            }
            this.getCurrentDBVersion(version => {
                this.createOrUpdateDB(++version);
            });
        }
    }

    executeQuery(query) {
        try {
            db.transaction(txn => {
                txn.executeSql(query);
            });
        } catch (e) {
            return -1;
        }
    }

    updateCurrentDBVersion(version) {
        try {
            db.transaction(function (txn) {
                txn.executeSql("UPDATE versionMaster SET version=?", [version],
                    function (tx, res) {
                    });
            });
        } catch (e) {
            return -1;
        }
    }

    getCurrentDBVersion(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT version FROM versionMaster", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.item(0).version)
                    } else {
                        callback(0);
                    }
                });
        });
    }

    insertUser(callback, data) {
        // this.executeQuery("DELETE FROM quizData");
        // this.executeQuery("DELETE FROM SyllabusMetaData");
        this.executeQuery("DELETE FROM userData");
        this.executeQuery("DELETE FROM gradeData");
        this.executeQuery("DELETE FROM typeIdData");

        db.transaction(function (tx) {
            tx.executeSql(
                'INSERT INTO userData(id, name, email, phoneNumber, stateId, stateName, districtId, districtName, gender, dob) VALUES (?,?,?,?,?,?,?,?,?,?)',
                [data.id, data.name, data.email, data.phoneNumber, data.stateId, data.stateName, data.districtId, data.districtName, data.gender, data.dob],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        DBMigrationHelper.getInstance().insertTypeIds(code => { }, data.typeDetails);
                        DBMigrationHelper.getInstance().insertGrades(code => {
                            if (code == 400) {
                                callback(400);
                            } else {
                                callback(200);
                            }
                        }, data.grades);
                    } else {
                        callback(400);
                    }
                }
            );
        });
    }

    insertGrades(callback, data) {
        let insertQuery = "INSERT INTO gradeData(boardId, boardName, gradeId, gradeName, languageId, purchaseDate, endDate, transactionId, orderId, promoCode, actualAmount, paidAmount, orderId, transactionId, promoCode, scratchCard, referalCode, hasMockTest) VALUES";
        let dataValue = "";

        for (let i = 0; i < data.length; i++) {
            if (i == data.length - 1) {
                dataValue = dataValue + "('" + data[i].boardId + "', '" + data[i].boardName + "', '" + data[i].gradeId + "', '" + data[i].gradeName + "', '" + data[i].languageId + "', '" + data[i].purchaseDate + "', '" + data[i].endDate + "', '" + data[i].transactionId + "', '" + data[i].orderId + "', '" + data[i].promoCode + "', '" + data[i].actualAmount + "', '" + data[i].paidAmount + "', '" + data[i].orderId + "', '" + data[i].transactionId + "', '" + data[i].promoCode + "', '" + data[i].scratchCard + "', '" + data[i].referalCode + "', '" + data[i].hasMockTest + "')";
            } else {
                dataValue = dataValue + "('" + data[i].boardId + "', '" + data[i].boardName + "', '" + data[i].gradeId + "', '" + data[i].gradeName + "', '" + data[i].languageId + "', '" + data[i].purchaseDate + "', '" + data[i].endDate + "', '" + data[i].transactionId + "', '" + data[i].orderId + "', '" + data[i].promoCode + "', '" + data[i].actualAmount + "', '" + data[i].paidAmount + "', '" + data[i].orderId + "', '" + data[i].transactionId + "', '" + data[i].promoCode + "', '" + data[i].scratchCard + "', '" + data[i].referalCode + "', '" + data[i].hasMockTest + "'),";
            }
        }

        insertQuery = insertQuery + dataValue;

        db.transaction(function (tx) {
            tx.executeSql(
                insertQuery,
                [],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        callback(200);
                    } else {
                        callback(400);
                    }
                }
            );
        });
    }

    insertQuizData(callback, data, isReSync) {
        try {
            let insertQuery;
            let dataValue = "";

            for (let i = 0; i < data.length; i++) {
                if (!isReSync) {
                    insertQuery = "INSERT INTO quizData(questionCode, typeId, complexityId, boardId, gradeId, subjectId, chapterId, topicId, languageId, userId, correctOption, givenAnswer, timeTaken, timeStamp, status) VALUES";

                    if (i == data.length - 1) {
                        dataValue = dataValue + "('" + data[i].questionCode + "', '" + data[i].typeId + "', '" + data[i].complexityId + "', '" + data[i].boardId + "', '" + data[i].gradeId + "', '" + data[i].subjectId + "', '" + data[i].chapterId + "', '" + data[i].topicId + "', '" + data[i].languageId + "', '" + data[i].userId + "', '" + data[i].correctOption + "', '" + data[i].givenAnswer + "', '" + data[i].totalTimeTaken + "', '" + data[i].timeStamp + "', 'false')";
                    } else {
                        dataValue = dataValue + "('" + data[i].questionCode + "', '" + data[i].typeId + "', '" + data[i].complexityId + "', '" + data[i].boardId + "', '" + data[i].gradeId + "', '" + data[i].subjectId + "', '" + data[i].chapterId + "', '" + data[i].topicId + "', '" + data[i].languageId + "', '" + data[i].userId + "', '" + data[i].correctOption + "', '" + data[i].givenAnswer + "', '" + data[i].totalTimeTaken + "', '" + data[i].timeStamp + "', 'false'),";
                    }
                } else {
                    insertQuery = "INSERT INTO quizData(qId, questionCode, typeId, complexityId, boardId, gradeId, subjectId, chapterId, topicId, languageId, userId, correctOption, givenAnswer, timeTaken, timeStamp, status) VALUES";

                    if (i == data.length - 1) {
                        dataValue = dataValue + "('" + data[i].qid + "', '" + data[i].questionCode + "', '" + data[i].typeId + "', '" + data[i].complexityId + "', '" + data[i].boardId + "', '" + data[i].gradeId + "', '" + data[i].subjectId + "', '" + data[i].chapterId + "', '" + data[i].topicId + "', '" + data[i].languageId + "', '" + data[i].userId + "', '" + data[i].correctOption + "', '" + data[i].givenAnswer + "', '" + data[i].timeTaken + "', '" + data[i].timeStamp + "', 'true')";
                    } else {
                        dataValue = dataValue + "('" + data[i].qid + "', '" + data[i].questionCode + "', '" + data[i].typeId + "', '" + data[i].complexityId + "', '" + data[i].boardId + "', '" + data[i].gradeId + "', '" + data[i].subjectId + "', '" + data[i].chapterId + "', '" + data[i].topicId + "', '" + data[i].languageId + "', '" + data[i].userId + "', '" + data[i].correctOption + "', '" + data[i].givenAnswer + "', '" + data[i].timeTaken + "', '" + data[i].timeStamp + "', 'true'),";
                    }
                }
            }

            insertQuery = insertQuery + dataValue;

            db.transaction(function (tx) {
                tx.executeSql(
                    insertQuery,
                    [],
                    (tx, results) => {
                        if (results.rowsAffected > 0) {
                            callback(200);
                        } else {
                            callback(400);
                        }
                    }
                );
            });
        } catch (error) {
        }
    }

    insertTypeIds(callback, data) {
        let insertQuery = "INSERT INTO typeIdData(typeId, typeName) VALUES";
        let dataValue = "";

        for (let i = 0; i < data.questionTypes.length; i++) {
            dataValue = dataValue + "('" + data.questionTypes[i].typeId + "', '" + data.questionTypes[i].typeName + "'),";
        }

        for (let i = 0; i < data.questionComplexities.length; i++) {
            //Condition required for commma ','...
            if (i == data.questionComplexities.length - 1) {
                dataValue = dataValue + "('" + data.questionComplexities[i].complexityId + "', '" + data.questionComplexities[i].complexity + "')";
            } else {
                dataValue = dataValue + "('" + data.questionComplexities[i].complexityId + "', '" + data.questionComplexities[i].complexity + "'),";
            }
        }

        insertQuery = insertQuery + dataValue;

        db.transaction(function (tx) {
            tx.executeSql(
                insertQuery,
                [],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        callback(200);
                    } else {
                        callback(400);
                    }
                }
            );
        });
    }

    insertSyllabusMetaData(callback, CategoryDetailId, CategoryDetailName, data) {
        let insertQuery;
        let dataValue = "";

        if (data == null) {
            insertQuery = "INSERT INTO SyllabusMetaData(CategoryDetailId, CategoryDetailName, status) VALUES";

            dataValue = dataValue + "('" + CategoryDetailId + "', '" + CategoryDetailName + "', 'false')";
        } else {
            insertQuery = "INSERT INTO SyllabusMetaData(sId, CategoryDetailId, CategoryDetailName, status) VALUES";

            for (let i = 0; i < data.length; i++) {
                if (i == data.length - 1) {
                    dataValue = dataValue + "('" + data[i].sid + "', '" + data[i].categoryDetailId + "', '" + data[i].categoryDetailName + "', 'true')";
                } else {
                    dataValue = dataValue + "('" + data[i].sid + "', '" + data[i].categoryDetailId + "', '" + data[i].categoryDetailName + "', 'true'),";
                }
            }
        }

        insertQuery = insertQuery + dataValue;

        db.transaction(function (tx) {
            tx.executeSql(
                insertQuery,
                [],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        callback(200);
                    } else {
                        callback(400);
                    }
                }
            );
        });
    }

    updateGrades(callback, data) {
        this.executeQuery("DELETE FROM gradeData");

        let insertQuery = "INSERT INTO gradeData(boardId, boardName, gradeId, gradeName, languageId, purchaseDate, endDate, transactionId, orderId, promoCode, actualAmount, paidAmount, orderId, transactionId, promoCode, scratchCard, referalCode, hasMockTest) VALUES";
        let dataValue = "";

        for (let i = 0; i < data.length; i++) {
            if (i == data.length - 1) {
                dataValue = dataValue + "('" + data[i].boardId + "', '" + data[i].boardName + "', '" + data[i].gradeId + "', '" + data[i].gradeName + "', '" + data[i].languageId + "', '" + data[i].purchaseDate + "', '" + data[i].endDate + "', '" + data[i].transactionId + "', '" + data[i].orderId + "', '" + data[i].promoCode + "', '" + data[i].actualAmount + "', '" + data[i].paidAmount + "', '" + data[i].orderId + "', '" + data[i].transactionId + "', '" + data[i].promoCode + "', '" + data[i].scratchCard + "', '" + data[i].referalCode + "', '" + data[i].hasMockTest + "')";
            } else {
                dataValue = dataValue + "('" + data[i].boardId + "', '" + data[i].boardName + "', '" + data[i].gradeId + "', '" + data[i].gradeName + "', '" + data[i].languageId + "', '" + data[i].purchaseDate + "', '" + data[i].endDate + "', '" + data[i].transactionId + "', '" + data[i].orderId + "', '" + data[i].promoCode + "', '" + data[i].actualAmount + "', '" + data[i].paidAmount + "', '" + data[i].orderId + "', '" + data[i].transactionId + "', '" + data[i].promoCode + "', '" + data[i].scratchCard + "', '" + data[i].referalCode + "', '" + data[i].hasMockTest + "'),";
            }
        }

        insertQuery = insertQuery + dataValue;

        db.transaction(function (tx) {
            tx.executeSql(
                insertQuery,
                [],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        callback(200);
                    } else {
                        callback(400);
                    }
                }
            );
        });
    }

    insertNotificationData(callback, title, date, message) {
        let insertQuery = "INSERT INTO notificationData(title, date, data, deleteStatus) VALUES";
        let dataValue = "";

        dataValue = "('" + title + "', '" + date + "', '" + message + "', '0')";

        insertQuery = insertQuery + dataValue;

        db.transaction(function (tx) {
            tx.executeSql(
                insertQuery,
                [],
                (tx, results) => {
                    if (results.rowsAffected > 0) {
                        callback(200);
                    } else {
                        callback(400);
                    }
                }
            );
        });
    }

    isMataDataExist(CategoryDetailId, CategoryDetailName) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM SyllabusMetaData WHERE CategoryDetailId='" + CategoryDetailId + "'", [],
                function (tx, res) {
                    if (res.rows.length == 0) {
                        DBMigrationHelper.getInstance().insertSyllabusMetaData(null, CategoryDetailId, CategoryDetailName, null);
                    }
                });
        });
    }

    getGrades(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM gradeData", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows)
                    } else {
                        callback(null);
                    }
                });
        });
    }

    getOneGrade(callback, gradeID) {
        let query = '';

        if (gradeID == null || gradeID == '' || gradeID.length == 0) {
            query = "SELECT * FROM gradeData";
        } else {
            query = "SELECT * FROM gradeData WHERE gradeId='" + gradeID + "'";
        }

        db.transaction(function (txn) {
            txn.executeSql(query, [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.item(0))
                    } else {
                        callback(null);
                    }
                });
        });
    }

    getUserDetails(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM userData", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.item(0))
                    } else {
                        callback(null);
                    }
                });
        });
    }

    getTypeDetails(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM typeIdData WHERE typeName ='Easy' OR typeName ='easy' OR typeName ='Medium' OR typeName ='medium' OR typeName ='Hard' OR typeName ='hard'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows)
                    } else {
                        callback(null);
                    }
                });
        });
    }

    isTopicViwed(callback, topicId) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM quizData where topicId='" + topicId + "'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(true)
                    } else {
                        callback(false);
                    }
                });
        });
    }

    getIDData(callback, data) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM typeIdData where typeName='" + data + "'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.item(0))
                    } else {
                        callback(null);
                    }
                });
        });
    }

    getChapterData(callback, subId, chapId) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM quizData where subjectId='" + subId + "' and chapterId='" + chapId + "'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.length)
                    } else {
                        callback(0);
                    }
                });
        });
    }

    // getCount1(callback, userID, boardId, gradeID, subjectID, chapterId) {        
    //     db.transaction(function (txn) {
    //         txn.executeSql("SELECT COUNT(*) AS totalQuestion, COUNT(DISTINCT(questionCode)) AS totalDistinctQuestion, COUNT(DISTINCT(timeStamp)) AS testAttempted, SUM(timeTaken) AS totalTime FROM quizData WHERE userId ='"+userID + "' AND boardId ='"+boardId+"' AND gradeID ='"+gradeID+"' AND subjectId ='"+subjectID+"' AND chapterId ='"+chapterId+"'", [],
    //             function (tx, res) {
    //                 callback(res.rows.item(0))
    //             });
    //     });
    // }

    // executeSql(query) {
    //     return new Promise((resolve,reject) => {
    //         db.transaction(function (txn) {
    //             txn.executeSql(query, [],
    //                 function (tx, res) {
    //                     // resolve(res.rows.item(0));
    //                     resolve("DHRUV")
    //                 });
    //         });
    //     });
    // }

    // getCount1(userID, boardId, gradeID, subjectID, chapterId) {
    //     return new Promise((resolve,reject) => {
    //         db.transaction(function (txn) {
    //             txn.executeSql("SELECT COUNT(*) AS totalQuestion, COUNT(DISTINCT(questionCode)) AS totalDistinctQuestion, COUNT(DISTINCT(timeStamp)) AS testAttempted, SUM(timeTaken) AS totalTime FROM quizData WHERE userId ='"+userID + "' AND boardId ='"+boardId+"' AND gradeID ='"+gradeID+"' AND subjectId ='"+subjectID+"' AND chapterId ='"+chapterId+"'", [],
    //                 function (tx, res) {
    //                     resolve(res.rows.item(0));
    //                 });
    //         });
    //     });
    // }

    getCount1(callback, userId, boardId, gradeId, subjectId, chapterId, easyComplexId, mediumComplexId, hardComplexId) {

        // console.log("SELECT " +
        //     "COUNT(*) AS totalQuestion, " +
        //     "COUNT(DISTINCT(questionCode)) AS totalDistinctQuestion, " +
        //     "COUNT(DISTINCT(timeStamp)) AS testAttempted, " +
        //     "SUM(timeTaken) AS totalTime," +
        //     "(SELECT COUNT(*) AS correctQuestion FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND correctOption==givenAnswer) AS correctQuestion," +
        //     "(SELECT COUNT(*) AS queCountEasy FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + easyComplexId + "') AS queCountEasy," +
        //     "(SELECT COUNT(*) AS correctQueCountEasy FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + easyComplexId + "' AND correctOption==givenAnswer) AS correctQueCountEasy," +
        //     "(SELECT COUNT(*) AS queCountMedium FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + mediumComplexId + "') AS queCountMedium," +
        //     "(SELECT COUNT(*) AS correctQueCountMedium FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + mediumComplexId + "' AND correctOption==givenAnswer) AS correctQueCountMedium," +
        //     "(SELECT COUNT(*) AS queCountHard FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + hardComplexId + "') AS queCountHard," +
        //     "(SELECT COUNT(*) AS correctQueCountHard FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + hardComplexId + "' AND correctOption==givenAnswer) AS correctQueCountHard " +
        //     "FROM quizData " +
        //     "WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "'");

        return db.transaction(function (txn) {
            txn.executeSql("SELECT " +
                "COUNT(*) AS totalQuestion, " +
                "COUNT(DISTINCT(questionCode)) AS totalDistinctQuestion, " +
                "COUNT(DISTINCT(timeStamp)) AS testAttempted, " +
                "SUM(timeTaken) AS totalTime," +
                "(SELECT COUNT(*) AS correctQuestion FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND correctOption==givenAnswer) AS correctQuestion," +
                "(SELECT COUNT(*) AS queCountEasy FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + easyComplexId + "') AS queCountEasy," +
                "(SELECT COUNT(*) AS correctQueCountEasy FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + easyComplexId + "' AND correctOption==givenAnswer) AS correctQueCountEasy," +
                "(SELECT COUNT(*) AS queCountMedium FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + mediumComplexId + "') AS queCountMedium," +
                "(SELECT COUNT(*) AS correctQueCountMedium FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + mediumComplexId + "' AND correctOption==givenAnswer) AS correctQueCountMedium," +
                "(SELECT COUNT(*) AS queCountHard FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + hardComplexId + "') AS queCountHard," +
                "(SELECT COUNT(*) AS correctQueCountHard FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND complexityId ='" + hardComplexId + "' AND correctOption==givenAnswer) AS correctQueCountHard " +
                "FROM quizData " +
                "WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "'", [],
                function (tx, res) {
                    callback(res.rows.item(0));
                });
        });
    }

    getCount2(callback, userId, boardId, gradeId, subjectId, chapterId, topicId) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT " +
                "(SELECT COUNT(*) AS topicQueCount FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND topicId='" + topicId + "') AS topicQueCount," +
                "(SELECT COUNT(*) AS correctQueCount FROM quizData WHERE userId ='" + userId + "' AND boardId ='" + boardId + "' AND gradeID ='" + gradeId + "' AND subjectId ='" + subjectId + "' AND chapterId ='" + chapterId + "' AND topicId='" + topicId + "' AND correctOption==givenAnswer) AS correctQueCount", [],
                function (tx, res) {
                    callback(res.rows.item(0))
                });
        });
    }

    getTopicName(callback, topicId) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT CategoryDetailName FROM SyllabusMetaData WHERE CategoryDetailId='" + topicId + "'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.item(0))
                    } else {
                        callback(null);
                    }
                });
        });
    }

    updateUserData(callback, data) {
        try {
            db.transaction(function (txn) {
                txn.executeSql("UPDATE userData SET name='" + data.name + "', gender='" + data.gender + "', dob='" + data.dob + "' where id='" + data.id + "'",
                    function (tx, res) {
                        callback(1);
                    });
            });
        } catch (e) {
            return -1;
        }
    }

    getTimeStamps(callback, subID, chapID) {
        try {
            db.transaction(function (txn) {
                txn.executeSql("SELECT distinct(timeStamp) FROM quizData where subjectId='" + subID + "' and chapterId='" + chapID + "' and (topicId='null' or topicId='')", [],
                    function (tx, res) {
                        if (res.rows.length > 0) {
                            callback(res.rows)
                        } else {
                            callback(0);
                        }
                    });
            });
        } catch (e) {
            return -1;
        }
    }

    getTopicTimeStamps(callback, subID, topicID, typeID) {
        try {
            console.log("SELECT distinct(timeStamp) FROM quizData where subjectId='" + subID + "' and topicId='" + topicID + "' and typeId='" + typeID + "'");
            db.transaction(function (txn) {
                txn.executeSql("SELECT distinct(timeStamp) FROM quizData where subjectId='" + subID + "' and topicId='" + topicID + "' and typeId='" + typeID + "'", [],
                    function (tx, res) {
                        if (res.rows.length > 0) {
                            callback(res.rows)
                        } else {
                            callback(0);
                        }
                    });
            });
        } catch (e) {
            return -1;
        }
    }

    getTimeStampDetails(callback, timeStamp) {
        try {
            db.transaction(function (txn) {
                txn.executeSql("SELECT * FROM quizData where timeStamp='" + timeStamp + "'", [],
                    function (tx, res) {
                        if (res.rows.length > 0) {
                            callback(res.rows)
                        } else {
                            callback(null);
                        }
                    });
            });
        } catch (e) {
            return -1;
        }
    }

    getCount3(callback, timeStamp) {
        try {
            db.transaction(function (txn) {
                txn.executeSql("SELECT count(*) AS totalCorrectQuestion, (SELECT count(*) AS BB FROM quizData where timeStamp='" + timeStamp + "') AS totalQuestion, (count(*) * 100 / (SELECT count(*) AS BB FROM quizData where timeStamp='" + timeStamp + "')) AS percentage FROM quizData where timeStamp='" + timeStamp + "' AND givenAnswer == correctOption", [],
                    // txn.executeSql("SELECT (count(*) * 100 / (SELECT count(*) AS BB FROM quizData where timeStamp='" + timeStamp + "')) AS percentage FROM quizData where timeStamp='" + timeStamp + "' AND givenAnswer == correctOption", [],
                    function (tx, res) {
                        if (res.rows.length > 0) {
                            callback(res.rows.item(0))
                        } else {
                            callback(null);
                        }
                    });
            });
        } catch (e) {
            return -1;
        }
    }

    logoutUser() {
        this.executeQuery("DELETE FROM quizData");
        this.executeQuery("DELETE FROM SyllabusMetaData");
        this.executeQuery("DELETE FROM userData");
        this.executeQuery("DELETE FROM gradeData");
        this.executeQuery("DELETE FROM notificationData");
    }

    getUnSyncedQuizData(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM quizData where status ='false'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows)
                    } else {
                        callback(null);
                    }
                });
        });
    }

    getQuizDataCount(callback, userId) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT COUNT(*) AS count FROM quizData where userId ='" + userId + "'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.item(0).count)
                    } else {
                        callback(0);
                    }
                });
        });
    }

    getQuizMetaDataCount(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT COUNT(*) AS count FROM SyllabusMetaData", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows.item(0).count)
                    } else {
                        callback(0);
                    }
                });
        });
    }

    getUnSyncedMataData(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM SyllabusMetaData where status ='false'", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows)
                    } else {
                        callback(null);
                    }
                });
        });
    }

    getNotificationData(callback) {
        db.transaction(function (txn) {
            txn.executeSql("SELECT * FROM notificationData WHERE deleteStatus = '0' ORDER BY date DESC", [],
                function (tx, res) {
                    if (res.rows.length > 0) {
                        callback(res.rows)
                    } else {
                        callback(null);
                    }
                });
        });
    }

    updateStatus() {
        db.transaction(function (txn) {
            txn.executeSql("UPDATE quizData SET status='true' where status='false'",
                function (tx, res) {
                });
        });
        db.transaction(function (txn) {
            txn.executeSql("UPDATE SyllabusMetaData SET status='true' where status='false'",
                function (tx, res) {
                });
        });
    }
}