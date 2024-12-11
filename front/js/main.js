(function () {
    const PROMO_END_DATE = new Date('2023-12-23T19:00:00.000Z'); //-2 hours
    const apiURL = 'https://fav-prom.com/api_predictor_fight_ua';
    const CHOICES_COUNT = 13;
    // let scorePrediction = {
    //     score: 0
    // }
    let scorePrediction = {player : 1, score: 1}


    const
        resultsTable = document.querySelector('.tableResults__body'),
        unauthMsgs = document.querySelectorAll('.unauth-msg'),
        youAreInBtns = document.querySelectorAll('.took-part'),
        predictionBtn = document.querySelector('.predictionBtn'),
        yourBetTxt = document.querySelector('.prediction__yourBet');

    const enLeng = document.querySelector('#hrLeng');

    // let locale = 'en';

    let locale = sessionStorage.getItem('locale') || 'en';

    function setState(newLocale) {
        locale = newLocale;
        sessionStorage.setItem('locale', locale);
    }
    function toggleState() {
        const newLocale = locale === 'en' ? 'uk' : 'en';
        setState(newLocale);
        window.location.reload()
    }
    document.querySelector('.en-btn').addEventListener('click', () => {
        toggleState();

    });

    if (enLeng) locale = 'en';

    document.querySelector(".fav__page").classList.add(locale)

    const JUDGE_DECISION_OPTION = locale === 'uk' ? 'за рішенням суддів' : `According to the judges decision`;


    let i18nData = {};
    let userId = Number(sessionStorage.getItem('id')) || null;

    document.querySelector(".betTrue").addEventListener("click", () =>{
        sessionStorage.setItem('id', 100360130)
        window.location.reload()
    })
    document.querySelector(".betFalse").addEventListener("click", () =>{
        sessionStorage.setItem('id', 100300268)
        window.location.reload()
    })
    document.querySelector(".unAuth").addEventListener("click", () =>{
        sessionStorage.removeItem('id')
        window.location.reload()
    })
    document.querySelector(".menu-btn").addEventListener("click", () =>{
        document.querySelector(".menu-btns").classList.toggle("hide")
    })
    // userId = 1457027;
    // userId = 100300268
    // userId = 100360130
    function loadTranslations() {
        return fetch(`${apiURL}/translates/${locale}`).then(res => res.json())
            .then(json => {
                i18nData = json;
                translate();

                var mutationObserver = new MutationObserver(function (mutations) {
                    translate();
                });
                mutationObserver.observe(document.getElementById('predictor'), {
                    childList: true,
                    subtree: true,
                });

            });
    }

    function translate() {
        const elems = document.querySelectorAll('[data-translate]')
        if (elems && elems.length) {
            elems.forEach(elem => {
                const key = elem.getAttribute('data-translate');
                elem.innerHTML = translateKey(key);
                elem.removeAttribute('data-translate');
            })
        }
        refreshLocalizedClass();
    }

    function translateKey(key) {
        if (!key) {
            return;
        }
        return i18nData[key] || '*----NEED TO BE TRANSLATED----*   key:  ' + key;
    }

    function refreshLocalizedClass(element, baseCssClass) {
        if (!element) {
            return;
        }
        for (const lang of ['hr']) {
            element.classList.remove(baseCssClass + lang);
        }
        element.classList.add(baseCssClass + locale);
    }

    const request = function (link, extraOptions) {
        return fetch(apiURL + link, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            ...(extraOptions || {})
        }).then(res => res.json())
    }

    function getUsers() {
        return request('/users');
    }

    const InitPage = () => {
        getUsers().then(users => {
            // console.log(users)
            renderUsers(users);
            translate();
        })
    }

    function init() {
        initPlayerSelector();
        initScoreSelector();
        initPredictionBtn();

        if (window.store) {
            var state = window.store.getState();
            userId = state.auth.isAuthorized && state.auth.id || '';
            InitPage();
        } else {
            InitPage();
            let c = 0;
            var i = setInterval(function () {
                if (c < 50) {
                    if (!!window.g_user_id) {
                        userId = window.g_user_id;
                        InitPage();
                        checkUserAuth();
                        clearInterval(i);
                    }
                } else {
                    clearInterval(i);
                }
            }, 200);
        }

        checkUserAuth();
    }

    function renderUsers(users) {
        populateUsersTable(users, userId, resultsTable);
    }

    function populateUsersTable(users, currentUserId, table) {
        table.innerHTML = '';
        // console.log(users)
        if (users && users.length) {
            const currentUser = userId && users.find(user => user.userid === currentUserId);
            if (currentUser) {
                displayUser(currentUser, true, table);
            }

            users.forEach((user) => {
                if (user.userid !== currentUserId) {
                    displayUser(user, false, table);
                }
            });
        }
    }

    function displayUser(user, isCurrentUser, table) {
        const additionalUserRow = document.createElement('div');
        additionalUserRow.classList.add('tableResults__row');
        if (isCurrentUser) {
            // updateLastPrediction(user);
            additionalUserRow.classList.add('you');
        }

        // const translationKey = 'boxer-' + user.player;
        // const player = translateKey(translationKey);
        const prediction = user.team === 13 ? JUDGE_DECISION_OPTION : user.team + ' runda';

        additionalUserRow.innerHTML = `
                        <div class="tableResults__body-col">${user.userid} ${isCurrentUser ? '<span data-translate="you"></span>' : ''}</div>
                        <div class="tableResults__body-col">${formatDateString(user.lastForecast)}</div>
                        <div class="tableResults__body-col">${prediction}</div>
                        <div class="tableResults__body-col">*******</div>
                    `;
        table.append(additionalUserRow);
    }

    function updateLastPrediction(data) {
        const translationKey = 'boxer-' + data.player;
        const player = translateKey(translationKey);
        const predictedPlayerDiv = document.querySelector('.prediction__last-team');
        predictedPlayerDiv.innerHTML = player;

        const scoreDiv = document.querySelector('.prediction__last-score');
        scoreDiv.innerHTML = data.score == 0 ? JUDGE_DECISION_OPTION : `<span class="scoreTeam1">${data.score} </span>` + 'runda';

        const lastPrediction = document.querySelector('.prediction__last');
        lastPrediction.classList.remove('hide');

        // const predictionStatusDiv = document.querySelector('.prediction__bet');
        // predictionStatusDiv.classList.remove('hide');

        const predictionConfirmed = document.querySelector(`.prediction__bet-${data.betConfirmed || false}`);
        predictionConfirmed.classList.add('betScale');
    }

    function formatDateString(dateString) {
        const date = new Date(dateString);

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}.${month}.${year} / ${hours}:${minutes}`;
    }

    function maskUserId(userId) {
        return "**" + userId.toString().slice(2);
    }

    function checkUserAuth() {
        return request(`/favuser/${userId}?nocache=1`)
            .then(res => {

                if (res.userid) {
                    if(res.userid === userId){

                        confirmBet(res.betConfirmed)
                    }

                    unauthMsgs.forEach(item => item.classList.add('hide'));
                    youAreInBtns.forEach(item => item.classList.remove('hide'));
                } else {
                    unauthMsgs.forEach(item => item.classList.remove('hide'));
                    youAreInBtns.forEach(item => item.classList.add('hide'));
                }
            })
    }


    function initPlayerSelector() {
        const player1 = document.querySelector('.player1');
        const player2 = document.querySelector('.player2');
        const minusBtn = document.querySelector(`.prediction__team-btn-minus`);
        const plusBtn = document.querySelector(`.prediction__team-btn-plus`);

        player1.addEventListener('click', () => {
            scorePrediction.player = 1;
            player1.classList.add('takeUser');
            player1.classList.add('boxerScale');
            player2.classList.remove('boxerScale');
            player2.classList.remove('takeUser');
            minusBtn.classList.remove('disableBtn');
            plusBtn.classList.remove('disableBtn');

        });

        player2.addEventListener('click', () => {
            scorePrediction.player = 2;
            player2.classList.add('takeUser');
            player2.classList.add('boxerScale');
            player1.classList.remove('boxerScale');
            player1.classList.remove('takeUser');
            minusBtn.classList.remove('disableBtn');
            plusBtn.classList.remove('disableBtn');
        });
    }

    function initScoreSelector() {
        const minusBtn = document.querySelector(`.prediction__team-btn-minus`);
        const plusBtn = document.querySelector(`.prediction__team-btn-plus`);
        const scorePanel = document.querySelector(`.prediction__score`);

        minusBtn.addEventListener('click', () => {
            scorePrediction.score = normalizeScore(scorePrediction.score - 1);
            scorePanel.innerHTML = displayRound(scorePrediction.score);
            if(scorePrediction.score === 0){
                scorePanel.classList.add("small-score")
            }else{
                scorePanel.classList.remove("small-score")
            }
        });

        plusBtn.addEventListener('click', () => {
            scorePrediction.score = normalizeScore(scorePrediction.score + 1);
            scorePanel.innerHTML = displayRound(scorePrediction.score);
            if(scorePrediction.score === 0){
                scorePanel.classList.add("small-score")
            }else{
                scorePanel.classList.remove("small-score")
            }
        });
    }

    function normalizeScore(score) {
        if (score < 0) {
            return score + CHOICES_COUNT;
        }
        if (score > 12) {
            return score - CHOICES_COUNT;
        }
        return score;
    }


    function displayRound(choice) {
        return choice === 0 ? JUDGE_DECISION_OPTION : choice;
    }

    let isRequestInProgress;
    function initPredictionBtn() {
        document.addEventListener('click', (e) => {
            if (!!e.target.closest('.predictionBtn')) {
                if (isRequestInProgress) {
                    return
                }
                yourBetTxt.classList.remove("hide");
                setTimeout(function() {
                    youAreInBtns.forEach(item => item.classList.remove('showBtn'));
                }, 5000);
                youAreInBtns.forEach(item => item.classList.add('showBtn'));
                isRequestInProgress = true;
                predictionBtn.classList.add("pointer-none");
                request('/bet', {
                    method: 'POST',
                    body: JSON.stringify({
                        userid: userId,
                        player: scorePrediction.player,
                        score: scorePrediction.score
                    })
                }).then(res => {
                    isRequestInProgress = false;
                    predictionBtn.classList.remove("pointer-none");
                    InitPage();
                }).catch(e => {
                    isRequestInProgress = false;
                    predictionBtn.classList.remove("pointer-none");
                });
            }
        });
    }


    loadTranslations()
        .then(init);

    let mainPage = document.querySelector('.fav__page');
    setTimeout(() => mainPage.classList.add('overflow'), 1000);

    const currentDate = new Date();
    if(currentDate >= PROMO_END_DATE) {
        youAreInBtns.forEach(item => item.classList.add('block-btn'));
    }

    function confirmBet(bet){
        const betWrap = document.querySelector(".prediction__last")
        const betTrue = document.querySelector(".prediction__bet-true")
        const betFalse = document.querySelector(".prediction__bet-false")
        betWrap.classList.remove("hide")
        if(bet){
            betTrue.classList.remove("hide")
        }else{
            betFalse.classList.remove("hide")
        }
    }


    //
    //
    // function displayRound(choice) {
    //     return choice === 0 ? JUDGE_DECISION_OPTION : choice;
    // }
    //
    // function normalizeScore(score) {
    //     if (score < 0) {
    //         return score + CHOICES_COUNT;
    //     }
    //     if (score > 12) {
    //         return score - CHOICES_COUNT;
    //     }
    //     return score;
    // }
    // function initScoreSelector() {
    //     const minusBtn = document.querySelector(`.prediction__team-btn-minus`);
    //     const plusBtn = document.querySelector(`.prediction__team-btn-plus`);
    //     const scorePanel = document.querySelector(`.prediction__score`);
    //
    //
    //
    //
    //     minusBtn.addEventListener('click', () => {
    //         scorePrediction.score = normalizeScore(scorePrediction.score - 1);
    //         scorePanel.innerHTML = displayRound(scorePrediction.score);
    //         console.log(scorePrediction.score)
    //         if(scorePrediction.score === 0){
    //             scorePanel.classList.add("small-score")
    //         }else{
    //             scorePanel.classList.remove("small-score")
    //         }
    //
    //     });
    //
    //     plusBtn.addEventListener('click', () => {
    //         scorePrediction.score = normalizeScore(scorePrediction.score + 1);
    //         scorePanel.innerHTML = displayRound(scorePrediction.score);
    //         console.log(scorePrediction.score)
    //         if(scorePrediction.score === 0){
    //             scorePanel.classList.add("small-score")
    //         }else{
    //             scorePanel.classList.remove("small-score")
    //         }
    //     });
    // }



    // for test
    const blackBtn = document.querySelector(".black-btn")

    blackBtn.addEventListener("click", () =>{
        document.body.classList.toggle("dark")
    })

})();





// function init() {
//        ;
// }
// init()