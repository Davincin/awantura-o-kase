'use strict'

var checkAnswerBtn, hideAnswerBtn, goodAnswerBtn, wrongAnswerBtn, drawCategoryBtn, drawQuestionBtn, startBtn, infoBtn, newGameBtn, buttons;
var categoryTxt, questionTxt, jackpotTxt, answerTxt, answerBox, info, categoryName, questionSrc, categoryId, teams;
var doneQuestions = [[], [], [], [], []];
var doneQuestionsLenght = 0, jackpot = 0;

const newGame = () => {
    window.location.reload();
};

const hideInfo = () => {
    info.classList.add('start--hidden');
    startBtn.innerText = 'Wróć do gry';
    newGameBtn.classList.remove('game__btn--disabled');
};

const showInfo = () => {
    info.classList.remove('start--hidden');
};

const disableBtn = btn => {
    btn.disabled = true;
    btn.classList.add('game__btn--disabled');
};

const enableBtn = btn => {
    btn.disabled = false;
    btn.classList.remove('game__btn--disabled');
}; 

const disableFields = () => {
    for (let [a, b, c] of teams) {
        a.disabled = true;
        a.classList.add('game__auction-field--disabled');
    };
};

const enableFields = () => {
    for (let [a, b, c] of teams) {
        if (c > 0) {
            a.disabled = false;
            a.classList.remove('game__auction-field--disabled');
        };
    };
};

const showAnswer = () => {
    answerBox.classList.remove('answer--hidden');
    handleAnswerButtons();
};

const hideAnswer = () => {
    answerBox.classList.add('answer--hidden');
    if (drawQuestionBtn.classList.contains('game__btn--disabled')) {
        enableBtn(checkAnswerBtn);
    };
 };

const handleAnswerButtons = () => {
    if (((parseInt(teams[0][0].value) !== 0) || (parseInt(teams[1][0].value) !== 0) || (parseInt(teams[2][0].value) !== 0)) && (!checkAnswerBtn.classList.contains('game__btn--disabled')) && drawQuestionBtn.classList.contains('game__btn--disabled')) {
        enableBtn(goodAnswerBtn);
        enableBtn(wrongAnswerBtn);
    } else {
        disableBtn(goodAnswerBtn);
        disableBtn(wrongAnswerBtn);
    };
};

const drawCategory = () => {
    setMaxInputValues();
    if (doneQuestionsLenght === 25) {
        answerTxt.innerText = "To już wszystkie pytania, które przygotowaliśmy."
        hideAnswerBtn.addEventListener('click', newGame);
        hideAnswerBtn.innerText = "Nowa gra"
        showAnswer();
        disableBtn(drawCategoryBtn);
        disableBtn(checkAnswerBtn);
    } else {
        for (let [a, b, c] of teams) {
            a.value = 10;
        };
        bid();
        const categoryIdRandom = Math.round(Math.random() * 4);
        fetch("categories.json")
            .then(res => {
                return res.json();
            })
            .then(data => {
                categoryId = data[categoryIdRandom].categoryId;
                if (doneQuestions[categoryId].length === 5) {
                    drawCategory();
                };
                categoryTxt.innerText = data[categoryIdRandom].categoryName;
                questionSrc = `${data[categoryIdRandom].categorySrc}.json`;
            });
        disableBtn(drawCategoryBtn);
        enableFields();
    };
};

const drawQuestion = () => {
    if (((parseInt(teams[0][0].value) == parseInt(teams[1][0].value) && (parseInt(teams[0][0].value) >= parseInt(teams[2][0].value))) || (parseInt(teams[0][0].value) == parseInt(teams[2][0].value) && (parseInt(teams[0][0].value) >= parseInt(teams[1][0].value))) || (parseInt(teams[1][0].value) == parseInt(teams[2][0].value)) && (parseInt(teams[1][0].value) >= parseInt(teams[0][0].value)))) {
        answerTxt.innerText = "Aby wygrać licytację, musisz przebić swojego przeciwnika."
        showAnswer();
    } else {
        disableBtn(drawQuestionBtn);
        enableBtn(checkAnswerBtn);
        disableFields();
        fetch(questionSrc)
        .then(res => {
            return res.json();
        })
        .then(data => {
            const questionIdRandom = Math.round(Math.random() * 4);
            if (doneQuestions[categoryId].includes(data[questionIdRandom].questionId)) {
                drawQuestion();
            } else {
                questionTxt.innerText = data[questionIdRandom].questionText;
                answerTxt.innerText = data[questionIdRandom].questionAnswer;
                doneQuestions[categoryId].push(data[questionIdRandom].questionId);
                doneQuestionsLenght++;
            };
        });
    };
};

const checkLose = () => {
    for (let [a, b, c] of teams) {
        if (c == 0) {
            a.classList.add('game__auction-field--disabled');
            a.disabled = true;
            b.classList.add('game__auction-field--disabled');
        };
    };
};

const checkWin = () => {
    for (let [a, b, c] of teams) {
        if (c === 1500) {
            hideAnswerBtn.innerText = "Nowa gra"
            answerTxt.innerText = "Koniec gry:)"
            hideAnswerBtn.addEventListener('click', newGame);
            disableBtn(drawCategoryBtn);
            showAnswer();
        };
    };
};

const checkFields = () => {
    for (let [a, b, c] of teams) {
        let check = parseInt(a.value);
        let checkDbl = parseFloat(a.value);
        if (Number.isNaN(check)) {
            a.value = 10;
        } else if (parseInt(a.value) > c) {
            a.value = c;
        } else if (!Number.isInteger(checkDbl)) {
            if (checkDbl < 10) {
                a.value = 10;
            } else {
                a.value = Math.round(checkDbl);
            };
        };
    }; 
};

const setMaxInputValues = () => {
    for (let [a, b, c] of teams) {
        a.setAttribute('max', c);
    };
};

const goodAnswer = () => {
    let max = 0;
    let index;
    for (let i = 0,j = 0; i <= 2; i++) {
        if (parseInt(teams[i][j].value) > max) {
            max = parseInt(teams[i][j].value);
            index = i;
        };
    };
    teams[index][2] = parseInt(teams[index][1].innerText) + parseInt(jackpotTxt.innerText);
    teams[index][1].innerText = teams[index][2];
    for (let [a, b, c] of teams) {
        c = parseInt(b.innerText);
        a.value = 0;
    };
    jackpot = 0;
    jackpotTxt.innerText = jackpot;
    questionTxt.innerText = '';
    hideAnswer();
    enableBtn(drawCategoryBtn);
    disableBtn(checkAnswerBtn);
    refreshTeams();
    handleAnswerButtons();
    disableFields();
    checkLose();
    checkWin();
};

const wrongAnswer = () => {
    refreshTeams();
    for (let [a, b, c] of teams) {
        a.value = 0;
        c = parseInt(b.innerText);
        b.innerText = c;
    };
    jackpot = parseInt(jackpotTxt.innerText);
    questionTxt.innerText = '';
    refreshTeams();
    hideAnswer();
    enableBtn(drawCategoryBtn);
    disableBtn(checkAnswerBtn);
    disableFields();
    checkLose();
    checkWin();
    handleAnswerButtons();
};

const bid = () => {
    checkFields();
    let add = 0 + jackpot;
    for (let [a, b, c] of teams) {
            b.innerText = c - parseInt(a.value)
            add += parseInt(a.value);
    };
    jackpotTxt.innerText = add;
    enableBtn(drawQuestionBtn);
};

const refreshTeams = () => {
    teams = [[document.querySelector('.game__auction-field--blue'), document.querySelector('.game__balance-field--blue'), parseInt(document.querySelector('.game__balance-field--blue').innerText)], [document.querySelector('.game__auction-field--green'), document.querySelector('.game__balance-field--green'), parseInt(document.querySelector('.game__balance-field--green').innerText)], [document.querySelector('.game__auction-field--yellow'), document.querySelector('.game__balance-field--yellow'), parseInt(document.querySelector('.game__balance-field--yellow').innerText)]];
};

const prepareDOMElements = () => {
    drawCategoryBtn = document.querySelector('.game__category-btn');
    drawQuestionBtn = document.querySelector('.game__question-btn');
    checkAnswerBtn = document.querySelector('.game__question-btn-answer');
    hideAnswerBtn = document.querySelector('.answer__btn');
    newGameBtn = document.querySelector('.start__new-game-btn');
    goodAnswerBtn = document.querySelector('.game__good-answer-btn');
    wrongAnswerBtn = document.querySelector('.game__wrong-answer-btn');
    startBtn = document.querySelector('.start__play-btn');
    buttons = document.querySelectorAll('.game__btn')
    infoBtn = document.querySelector('.header__info-btn');
    answerBox = document.querySelector('.answer');
    categoryTxt = document.querySelector('.game__category');
    jackpotTxt = document.querySelector('.game__jackpot');
    questionTxt = document.querySelector('.game__question');
    answerTxt = document.querySelector('.answer__text');
    info = document.querySelector('.start')
    
    teams = [[document.querySelector('.game__auction-field--blue'), document.querySelector('.game__balance-field--blue'), parseInt(document.querySelector('.game__balance-field--blue').innerText)], [document.querySelector('.game__auction-field--green'), document.querySelector('.game__balance-field--green'), parseInt(document.querySelector('.game__balance-field--green').innerText)], [document.querySelector('.game__auction-field--yellow'), document.querySelector('.game__balance-field--yellow'), parseInt(document.querySelector('.game__balance-field--yellow').innerText)]];
};

const prepareDOMEvents = () => {
    checkAnswerBtn.addEventListener('click', showAnswer);
    hideAnswerBtn.addEventListener('click', hideAnswer);
    drawCategoryBtn.addEventListener('click', drawCategory);
    drawQuestionBtn.addEventListener('click', drawQuestion);
    goodAnswerBtn.addEventListener('click', goodAnswer);
    wrongAnswerBtn.addEventListener('click', wrongAnswer);
    startBtn.addEventListener('click', hideInfo);
    infoBtn.addEventListener('click', showInfo);
    newGameBtn.addEventListener('click', newGame);
    for (let [a, b, c] of teams) {
        a.addEventListener('change', bid);
        a.value = 0;
    };
    handleAnswerButtons();
};

const main = () => {
    prepareDOMElements();
    prepareDOMEvents();
};

document.addEventListener('DOMContentLoaded', main);