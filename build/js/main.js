"use strict";

// (function () {
//     const PROMO_END_DATE = new Date('2023-12-23T19:00:00.000Z'); //-2 hours
//     const apiURL = 'https://fav-prom.com/api_predictor_fight_hr';
//     const CHOICES_COUNT = 13;
//     const JUDGE_DECISION_OPTION = 'O/S';
//
//     const
//         resultsTable = document.querySelector('.tableResults__body'),
//         unauthMsgs = document.querySelectorAll('.unauth-msg'),
//         youAreInBtns = document.querySelectorAll('.took-part'),
//         predictionBtn = document.querySelector('.predictionBtn'),
//         yourBetTxt = document.querySelector('.prediction__yourBet');
//
//     const hrLeng = document.querySelector('#hrLeng');
//
//     let locale = 'hr';
//
//     if (hrLeng) locale = 'hr';
//
//     let i18nData = {};
//     let userId;
//     // userId = 1457027;
//
//     function loadTranslations() {
//         return fetch(`${apiURL}/translates/${locale}`).then(res => res.json())
//             .then(json => {
//                 i18nData = json;
//                 translate();
//
//                 var mutationObserver = new MutationObserver(function (mutations) {
//                     translate();
//                 });
//                 mutationObserver.observe(document.getElementById('predictor'), {
//                     childList: true,
//                     subtree: true,
//                 });
//
//             });
//     }
//
//     function translate() {
//         const elems = document.querySelectorAll('[data-translate]')
//         if (elems && elems.length) {
//             elems.forEach(elem => {
//                 const key = elem.getAttribute('data-translate');
//                 elem.innerHTML = translateKey(key);
//                 elem.removeAttribute('data-translate');
//             })
//         }
//         refreshLocalizedClass();
//     }
//
//     function translateKey(key) {
//         if (!key) {
//             return;
//         }
//         return i18nData[key] || '*----NEED TO BE TRANSLATED----*   key:  ' + key;
//     }
//
//     function refreshLocalizedClass(element, baseCssClass) {
//         if (!element) {
//             return;
//         }
//         for (const lang of ['hr']) {
//             element.classList.remove(baseCssClass + lang);
//         }
//         element.classList.add(baseCssClass + locale);
//     }
//
//     const request = function (link, extraOptions) {
//         return fetch(apiURL + link, {
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             ...(extraOptions || {})
//         }).then(res => res.json())
//     }
//
//     function getUsers() {
//         return request('/users');
//     }
//
//     const InitPage = () => {
//         getUsers().then(users => {
//             renderUsers(users);
//             translate();
//         })
//     }
//
//     function init() {
//         initPlayerSelector();
//         initScoreSelector();
//         initPredictionBtn();
//
//         if (window.store) {
//             var state = window.store.getState();
//             userId = state.auth.isAuthorized && state.auth.id || '';
//             InitPage();
//         } else {
//             InitPage();
//             let c = 0;
//             var i = setInterval(function () {
//                 if (c < 50) {
//                     if (!!window.g_user_id) {
//                         userId = window.g_user_id;
//                         InitPage();
//                         checkUserAuth();
//                         clearInterval(i);
//                     }
//                 } else {
//                     clearInterval(i);
//                 }
//             }, 200);
//         }
//
//         checkUserAuth();
//     }
//
//     function renderUsers(users) {
//         populateUsersTable(users, userId, resultsTable);
//     }
//
//     function populateUsersTable(users, currentUserId, table) {
//         table.innerHTML = '';
//         if (users && users.length) {
//             const currentUser = userId && users.find(user => user.userid === currentUserId);
//             if (currentUser) {
//                 displayUser(currentUser, true, table);
//             }
//
//             users.forEach((user) => {
//                 if (user.userid !== currentUserId) {
//                     displayUser(user, false, table);
//                 }
//             });
//         }
//     }
//
//     function displayUser(user, isCurrentUser, table) {
//         const additionalUserRow = document.createElement('div');
//         additionalUserRow.classList.add('tableResults__row');
//         if (isCurrentUser) {
//             updateLastPrediction(user);
//             additionalUserRow.classList.add('you');
//         }
//
//         const translationKey = 'boxer-' + user.player;
//         const player = translateKey(translationKey);
//         const prediction = user.score == 0 ? JUDGE_DECISION_OPTION : user.score + ' runda';
//
//         additionalUserRow.innerHTML = `
//                         <div class="tableResults__body-col">${user.userid} ${isCurrentUser ? '<span data-translate="you"></span>' : ''}</div>
//                         <div class="tableResults__body-col">${formatDateString(user.lastForecast)}</div>
//                         <div class="tableResults__body-col">${player} - ${prediction}</div>
//                         <div class="tableResults__body-col">***</div>
//                     `;
//         table.append(additionalUserRow);
//     }
//
//     function updateLastPrediction(data) {
//         const translationKey = 'boxer-' + data.player;
//         const player = translateKey(translationKey);
//         const predictedPlayerDiv = document.querySelector('.prediction__last-team');
//         predictedPlayerDiv.innerHTML = player;
//
//         const scoreDiv = document.querySelector('.prediction__last-score');
//         scoreDiv.innerHTML = data.score == 0 ? JUDGE_DECISION_OPTION : `<span class="scoreTeam1">${data.score} </span>` + 'runda';
//
//         const lastPrediction = document.querySelector('.prediction__last');
//         lastPrediction.classList.remove('hide');
//
//         // const predictionStatusDiv = document.querySelector('.prediction__bet');
//         // predictionStatusDiv.classList.remove('hide');
//
//         const predictionConfirmed = document.querySelector(`.prediction__bet-${data.betConfirmed || false}`);
//         predictionConfirmed.classList.add('betScale');
//     }
//
//     function formatDateString(dateString) {
//         const date = new Date(dateString);
//
//         const day = date.getDate().toString().padStart(2, '0');
//         const month = (date.getMonth() + 1).toString().padStart(2, '0');
//         const year = date.getFullYear();
//         const hours = date.getHours().toString().padStart(2, '0');
//         const minutes = date.getMinutes().toString().padStart(2, '0');
//
//         return `${day}.${month}.${year} / ${hours}:${minutes}`;
//     }
//
//     function maskUserId(userId) {
//         return "**" + userId.toString().slice(2);
//     }
//
//     let checkUserAuth = () => {
//         if (userId) {
//             unauthMsgs.forEach(item => item.classList.add('hide'));
//             youAreInBtns.forEach(item => item.classList.remove('hide'));
//         }
//     }
//
//     const scorePrediction = {player : 1, score: 1}
//
//     function initPlayerSelector() {
//         const player1 = document.querySelector('.player1');
//         const player2 = document.querySelector('.player2');
//         const minusBtn = document.querySelector(`.prediction__team-btn-minus`);
//         const plusBtn = document.querySelector(`.prediction__team-btn-plus`);
//
//         player1.addEventListener('click', () => {
//             scorePrediction.player = 1;
//             player1.classList.add('takeUser');
//             player1.classList.add('boxerScale');
//             player2.classList.remove('boxerScale');
//             player2.classList.remove('takeUser');
//             minusBtn.classList.remove('disableBtn');
//             plusBtn.classList.remove('disableBtn');
//
//         });
//
//         player2.addEventListener('click', () => {
//             scorePrediction.player = 2;
//             player2.classList.add('takeUser');
//             player2.classList.add('boxerScale');
//             player1.classList.remove('boxerScale');
//             player1.classList.remove('takeUser');
//             minusBtn.classList.remove('disableBtn');
//             plusBtn.classList.remove('disableBtn');
//         });
//     }
//
//     function initScoreSelector() {
//         const minusBtn = document.querySelector(`.prediction__team-btn-minus`);
//         const plusBtn = document.querySelector(`.prediction__team-btn-plus`);
//         const scorePanel = document.querySelector(`.prediction__score`);
//
//         minusBtn.addEventListener('click', () => {
//             scorePrediction.score = normalizeScore(scorePrediction.score - 1);
//             scorePanel.innerHTML = displayRound(scorePrediction.score);
//         });
//
//         plusBtn.addEventListener('click', () => {
//             scorePrediction.score = normalizeScore(scorePrediction.score + 1);
//             scorePanel.innerHTML = displayRound(scorePrediction.score);
//         });
//     }
//
//     function normalizeScore(score) {
//         if (score < 0) {
//             return score + CHOICES_COUNT;
//         }
//         if (score > 12) {
//             return score - CHOICES_COUNT;
//         }
//         return score;
//     }

//
//     function displayRound(choice) {
//         return choice == 0 ? JUDGE_DECISION_OPTION : choice;
//     }
//
//     let isRequestInProgress;
//     function initPredictionBtn() {
//         document.addEventListener('click', (e) => {
//             if (!!e.target.closest('.predictionBtn')) {
//                 if (isRequestInProgress) {
//                     return
//                 }
//                 yourBetTxt.classList.remove("hide");
//                 setTimeout(function() {
//                     youAreInBtns.forEach(item => item.classList.remove('showBtn'));
//                 }, 5000);
//                 youAreInBtns.forEach(item => item.classList.add('showBtn'));
//                 isRequestInProgress = true;
//                 predictionBtn.classList.add("pointer-none");
//                 request('/bet', {
//                     method: 'POST',
//                     body: JSON.stringify({
//                         userid: userId,
//                         player: scorePrediction.player,
//                         score: scorePrediction.score
//                     })
//                 }).then(res => {
//                     isRequestInProgress = false;
//                     predictionBtn.classList.remove("pointer-none");
//                     InitPage();
//                 }).catch(e => {
//                     isRequestInProgress = false;
//                     predictionBtn.classList.remove("pointer-none");
//                 });
//             }
//         });
//     }
//
//
//     loadTranslations()
//         .then(init);
//
//     let mainPage = document.querySelector('.fav__page');
//     setTimeout(() => mainPage.classList.add('overflow'), 1000);
//
//     const currentDate = new Date();
//     if(currentDate >= PROMO_END_DATE) {
//         youAreInBtns.forEach(item => item.classList.add('block-btn'));
//     }
//
// })();

var blackBtn = document.querySelector(".black-btn");
blackBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");
});
var CHOICES_COUNT = 13;
var JUDGE_DECISION_OPTION = 'O/S';
var scorePrediction = {
  score: 0
};
function displayRound(choice) {
  return choice === 0 ? JUDGE_DECISION_OPTION : choice;
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
function initScoreSelector() {
  var minusBtn = document.querySelector(".prediction__team-btn-minus");
  var plusBtn = document.querySelector(".prediction__team-btn-plus");
  var scorePanel = document.querySelector(".prediction__score");
  minusBtn.addEventListener('click', function () {
    scorePrediction.score = normalizeScore(scorePrediction.score - 1);
    scorePanel.innerHTML = displayRound(scorePrediction.score);
  });
  plusBtn.addEventListener('click', function () {
    scorePrediction.score = normalizeScore(scorePrediction.score + 1);
    scorePanel.innerHTML = displayRound(scorePrediction.score);
  });
}
function init() {
  initScoreSelector();
}
init();
"use strict";
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJzZWNvbmQuanMiXSwibmFtZXMiOlsiYmxhY2tCdG4iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiYm9keSIsImNsYXNzTGlzdCIsInRvZ2dsZSIsIkNIT0lDRVNfQ09VTlQiLCJKVURHRV9ERUNJU0lPTl9PUFRJT04iLCJzY29yZVByZWRpY3Rpb24iLCJzY29yZSIsImRpc3BsYXlSb3VuZCIsImNob2ljZSIsIm5vcm1hbGl6ZVNjb3JlIiwiaW5pdFNjb3JlU2VsZWN0b3IiLCJtaW51c0J0biIsInBsdXNCdG4iLCJzY29yZVBhbmVsIiwiaW5uZXJIVE1MIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxJQUFNQSxRQUFRLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFlBQVksQ0FBQztBQUVyREYsUUFBUSxDQUFDRyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBSztFQUNwQ0YsUUFBUSxDQUFDRyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMxQyxDQUFDLENBQUM7QUFHRixJQUFNQyxhQUFhLEdBQUcsRUFBRTtBQUN4QixJQUFNQyxxQkFBcUIsR0FBRyxLQUFLO0FBQ25DLElBQUlDLGVBQWUsR0FBRztFQUNsQkMsS0FBSyxFQUFFO0FBQ1gsQ0FBQztBQUVELFNBQVNDLFlBQVlBLENBQUNDLE1BQU0sRUFBRTtFQUMxQixPQUFPQSxNQUFNLEtBQUssQ0FBQyxHQUFHSixxQkFBcUIsR0FBR0ksTUFBTTtBQUN4RDtBQUVBLFNBQVNDLGNBQWNBLENBQUNILEtBQUssRUFBRTtFQUMzQixJQUFJQSxLQUFLLEdBQUcsQ0FBQyxFQUFFO0lBQ1gsT0FBT0EsS0FBSyxHQUFHSCxhQUFhO0VBQ2hDO0VBQ0EsSUFBSUcsS0FBSyxHQUFHLEVBQUUsRUFBRTtJQUNaLE9BQU9BLEtBQUssR0FBR0gsYUFBYTtFQUNoQztFQUNBLE9BQU9HLEtBQUs7QUFDaEI7QUFDQSxTQUFTSSxpQkFBaUJBLENBQUEsRUFBRztFQUN6QixJQUFNQyxRQUFRLEdBQUdkLFFBQVEsQ0FBQ0MsYUFBYSw4QkFBOEIsQ0FBQztFQUN0RSxJQUFNYyxPQUFPLEdBQUdmLFFBQVEsQ0FBQ0MsYUFBYSw2QkFBNkIsQ0FBQztFQUNwRSxJQUFNZSxVQUFVLEdBQUdoQixRQUFRLENBQUNDLGFBQWEscUJBQXFCLENBQUM7RUFFL0RhLFFBQVEsQ0FBQ1osZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQU07SUFDckNNLGVBQWUsQ0FBQ0MsS0FBSyxHQUFHRyxjQUFjLENBQUNKLGVBQWUsQ0FBQ0MsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNqRU8sVUFBVSxDQUFDQyxTQUFTLEdBQUdQLFlBQVksQ0FBQ0YsZUFBZSxDQUFDQyxLQUFLLENBQUM7RUFDOUQsQ0FBQyxDQUFDO0VBRUZNLE9BQU8sQ0FBQ2IsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQU07SUFDcENNLGVBQWUsQ0FBQ0MsS0FBSyxHQUFHRyxjQUFjLENBQUNKLGVBQWUsQ0FBQ0MsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUNqRU8sVUFBVSxDQUFDQyxTQUFTLEdBQUdQLFlBQVksQ0FBQ0YsZUFBZSxDQUFDQyxLQUFLLENBQUM7RUFDOUQsQ0FBQyxDQUFDO0FBQ047QUFFQSxTQUFTUyxJQUFJQSxDQUFBLEVBQUc7RUFDUkwsaUJBQWlCLENBQUMsQ0FBQztBQUMzQjtBQUNBSyxJQUFJLENBQUMsQ0FBQztBQ3BXTiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gKGZ1bmN0aW9uICgpIHtcbi8vICAgICBjb25zdCBQUk9NT19FTkRfREFURSA9IG5ldyBEYXRlKCcyMDIzLTEyLTIzVDE5OjAwOjAwLjAwMFonKTsgLy8tMiBob3Vyc1xuLy8gICAgIGNvbnN0IGFwaVVSTCA9ICdodHRwczovL2Zhdi1wcm9tLmNvbS9hcGlfcHJlZGljdG9yX2ZpZ2h0X2hyJztcbi8vICAgICBjb25zdCBDSE9JQ0VTX0NPVU5UID0gMTM7XG4vLyAgICAgY29uc3QgSlVER0VfREVDSVNJT05fT1BUSU9OID0gJ08vUyc7XG4vL1xuLy8gICAgIGNvbnN0XG4vLyAgICAgICAgIHJlc3VsdHNUYWJsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50YWJsZVJlc3VsdHNfX2JvZHknKSxcbi8vICAgICAgICAgdW5hdXRoTXNncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy51bmF1dGgtbXNnJyksXG4vLyAgICAgICAgIHlvdUFyZUluQnRucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b29rLXBhcnQnKSxcbi8vICAgICAgICAgcHJlZGljdGlvbkJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uQnRuJyksXG4vLyAgICAgICAgIHlvdXJCZXRUeHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9feW91ckJldCcpO1xuLy9cbi8vICAgICBjb25zdCBockxlbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaHJMZW5nJyk7XG4vL1xuLy8gICAgIGxldCBsb2NhbGUgPSAnaHInO1xuLy9cbi8vICAgICBpZiAoaHJMZW5nKSBsb2NhbGUgPSAnaHInO1xuLy9cbi8vICAgICBsZXQgaTE4bkRhdGEgPSB7fTtcbi8vICAgICBsZXQgdXNlcklkO1xuLy8gICAgIC8vIHVzZXJJZCA9IDE0NTcwMjc7XG4vL1xuLy8gICAgIGZ1bmN0aW9uIGxvYWRUcmFuc2xhdGlvbnMoKSB7XG4vLyAgICAgICAgIHJldHVybiBmZXRjaChgJHthcGlVUkx9L3RyYW5zbGF0ZXMvJHtsb2NhbGV9YCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbi8vICAgICAgICAgICAgIC50aGVuKGpzb24gPT4ge1xuLy8gICAgICAgICAgICAgICAgIGkxOG5EYXRhID0ganNvbjtcbi8vICAgICAgICAgICAgICAgICB0cmFuc2xhdGUoKTtcbi8vXG4vLyAgICAgICAgICAgICAgICAgdmFyIG11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSgpO1xuLy8gICAgICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgICAgICAgIG11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJlZGljdG9yJyksIHtcbi8vICAgICAgICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuLy8gICAgICAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuLy8gICAgICAgICAgICAgICAgIH0pO1xuLy9cbi8vICAgICAgICAgICAgIH0pO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgZnVuY3Rpb24gdHJhbnNsYXRlKCkge1xuLy8gICAgICAgICBjb25zdCBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRyYW5zbGF0ZV0nKVxuLy8gICAgICAgICBpZiAoZWxlbXMgJiYgZWxlbXMubGVuZ3RoKSB7XG4vLyAgICAgICAgICAgICBlbGVtcy5mb3JFYWNoKGVsZW0gPT4ge1xuLy8gICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXRyYW5zbGF0ZScpO1xuLy8gICAgICAgICAgICAgICAgIGVsZW0uaW5uZXJIVE1MID0gdHJhbnNsYXRlS2V5KGtleSk7XG4vLyAgICAgICAgICAgICAgICAgZWxlbS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdHJhbnNsYXRlJyk7XG4vLyAgICAgICAgICAgICB9KVxuLy8gICAgICAgICB9XG4vLyAgICAgICAgIHJlZnJlc2hMb2NhbGl6ZWRDbGFzcygpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgZnVuY3Rpb24gdHJhbnNsYXRlS2V5KGtleSkge1xuLy8gICAgICAgICBpZiAoIWtleSkge1xuLy8gICAgICAgICAgICAgcmV0dXJuO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIHJldHVybiBpMThuRGF0YVtrZXldIHx8ICcqLS0tLU5FRUQgVE8gQkUgVFJBTlNMQVRFRC0tLS0qICAga2V5OiAgJyArIGtleTtcbi8vICAgICB9XG4vL1xuLy8gICAgIGZ1bmN0aW9uIHJlZnJlc2hMb2NhbGl6ZWRDbGFzcyhlbGVtZW50LCBiYXNlQ3NzQ2xhc3MpIHtcbi8vICAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4vLyAgICAgICAgICAgICByZXR1cm47XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgZm9yIChjb25zdCBsYW5nIG9mIFsnaHInXSkge1xuLy8gICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGJhc2VDc3NDbGFzcyArIGxhbmcpO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChiYXNlQ3NzQ2xhc3MgKyBsb2NhbGUpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgY29uc3QgcmVxdWVzdCA9IGZ1bmN0aW9uIChsaW5rLCBleHRyYU9wdGlvbnMpIHtcbi8vICAgICAgICAgcmV0dXJuIGZldGNoKGFwaVVSTCArIGxpbmssIHtcbi8vICAgICAgICAgICAgIGhlYWRlcnM6IHtcbi8vICAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuLy8gICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbi8vICAgICAgICAgICAgIH0sXG4vLyAgICAgICAgICAgICAuLi4oZXh0cmFPcHRpb25zIHx8IHt9KVxuLy8gICAgICAgICB9KS50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuLy8gICAgIH1cbi8vXG4vLyAgICAgZnVuY3Rpb24gZ2V0VXNlcnMoKSB7XG4vLyAgICAgICAgIHJldHVybiByZXF1ZXN0KCcvdXNlcnMnKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIGNvbnN0IEluaXRQYWdlID0gKCkgPT4ge1xuLy8gICAgICAgICBnZXRVc2VycygpLnRoZW4odXNlcnMgPT4ge1xuLy8gICAgICAgICAgICAgcmVuZGVyVXNlcnModXNlcnMpO1xuLy8gICAgICAgICAgICAgdHJhbnNsYXRlKCk7XG4vLyAgICAgICAgIH0pXG4vLyAgICAgfVxuLy9cbi8vICAgICBmdW5jdGlvbiBpbml0KCkge1xuLy8gICAgICAgICBpbml0UGxheWVyU2VsZWN0b3IoKTtcbi8vICAgICAgICAgaW5pdFNjb3JlU2VsZWN0b3IoKTtcbi8vICAgICAgICAgaW5pdFByZWRpY3Rpb25CdG4oKTtcbi8vXG4vLyAgICAgICAgIGlmICh3aW5kb3cuc3RvcmUpIHtcbi8vICAgICAgICAgICAgIHZhciBzdGF0ZSA9IHdpbmRvdy5zdG9yZS5nZXRTdGF0ZSgpO1xuLy8gICAgICAgICAgICAgdXNlcklkID0gc3RhdGUuYXV0aC5pc0F1dGhvcml6ZWQgJiYgc3RhdGUuYXV0aC5pZCB8fCAnJztcbi8vICAgICAgICAgICAgIEluaXRQYWdlKCk7XG4vLyAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICBJbml0UGFnZSgpO1xuLy8gICAgICAgICAgICAgbGV0IGMgPSAwO1xuLy8gICAgICAgICAgICAgdmFyIGkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4vLyAgICAgICAgICAgICAgICAgaWYgKGMgPCA1MCkge1xuLy8gICAgICAgICAgICAgICAgICAgICBpZiAoISF3aW5kb3cuZ191c2VyX2lkKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQgPSB3aW5kb3cuZ191c2VyX2lkO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgSW5pdFBhZ2UoKTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrVXNlckF1dGgoKTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaSk7XG4vLyAgICAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGkpO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH0sIDIwMCk7XG4vLyAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgIGNoZWNrVXNlckF1dGgoKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIGZ1bmN0aW9uIHJlbmRlclVzZXJzKHVzZXJzKSB7XG4vLyAgICAgICAgIHBvcHVsYXRlVXNlcnNUYWJsZSh1c2VycywgdXNlcklkLCByZXN1bHRzVGFibGUpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgZnVuY3Rpb24gcG9wdWxhdGVVc2Vyc1RhYmxlKHVzZXJzLCBjdXJyZW50VXNlcklkLCB0YWJsZSkge1xuLy8gICAgICAgICB0YWJsZS5pbm5lckhUTUwgPSAnJztcbi8vICAgICAgICAgaWYgKHVzZXJzICYmIHVzZXJzLmxlbmd0aCkge1xuLy8gICAgICAgICAgICAgY29uc3QgY3VycmVudFVzZXIgPSB1c2VySWQgJiYgdXNlcnMuZmluZCh1c2VyID0+IHVzZXIudXNlcmlkID09PSBjdXJyZW50VXNlcklkKTtcbi8vICAgICAgICAgICAgIGlmIChjdXJyZW50VXNlcikge1xuLy8gICAgICAgICAgICAgICAgIGRpc3BsYXlVc2VyKGN1cnJlbnRVc2VyLCB0cnVlLCB0YWJsZSk7XG4vLyAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgdXNlcnMuZm9yRWFjaCgodXNlcikgPT4ge1xuLy8gICAgICAgICAgICAgICAgIGlmICh1c2VyLnVzZXJpZCAhPT0gY3VycmVudFVzZXJJZCkge1xuLy8gICAgICAgICAgICAgICAgICAgICBkaXNwbGF5VXNlcih1c2VyLCBmYWxzZSwgdGFibGUpO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICBmdW5jdGlvbiBkaXNwbGF5VXNlcih1c2VyLCBpc0N1cnJlbnRVc2VyLCB0YWJsZSkge1xuLy8gICAgICAgICBjb25zdCBhZGRpdGlvbmFsVXNlclJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuLy8gICAgICAgICBhZGRpdGlvbmFsVXNlclJvdy5jbGFzc0xpc3QuYWRkKCd0YWJsZVJlc3VsdHNfX3JvdycpO1xuLy8gICAgICAgICBpZiAoaXNDdXJyZW50VXNlcikge1xuLy8gICAgICAgICAgICAgdXBkYXRlTGFzdFByZWRpY3Rpb24odXNlcik7XG4vLyAgICAgICAgICAgICBhZGRpdGlvbmFsVXNlclJvdy5jbGFzc0xpc3QuYWRkKCd5b3UnKTtcbi8vICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgY29uc3QgdHJhbnNsYXRpb25LZXkgPSAnYm94ZXItJyArIHVzZXIucGxheWVyO1xuLy8gICAgICAgICBjb25zdCBwbGF5ZXIgPSB0cmFuc2xhdGVLZXkodHJhbnNsYXRpb25LZXkpO1xuLy8gICAgICAgICBjb25zdCBwcmVkaWN0aW9uID0gdXNlci5zY29yZSA9PSAwID8gSlVER0VfREVDSVNJT05fT1BUSU9OIDogdXNlci5zY29yZSArICcgcnVuZGEnO1xuLy9cbi8vICAgICAgICAgYWRkaXRpb25hbFVzZXJSb3cuaW5uZXJIVE1MID0gYFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYmxlUmVzdWx0c19fYm9keS1jb2xcIj4ke3VzZXIudXNlcmlkfSAke2lzQ3VycmVudFVzZXIgPyAnPHNwYW4gZGF0YS10cmFuc2xhdGU9XCJ5b3VcIj48L3NwYW4+JyA6ICcnfTwvZGl2PlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYmxlUmVzdWx0c19fYm9keS1jb2xcIj4ke2Zvcm1hdERhdGVTdHJpbmcodXNlci5sYXN0Rm9yZWNhc3QpfTwvZGl2PlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYmxlUmVzdWx0c19fYm9keS1jb2xcIj4ke3BsYXllcn0gLSAke3ByZWRpY3Rpb259PC9kaXY+XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFibGVSZXN1bHRzX19ib2R5LWNvbFwiPioqKjwvZGl2PlxuLy8gICAgICAgICAgICAgICAgICAgICBgO1xuLy8gICAgICAgICB0YWJsZS5hcHBlbmQoYWRkaXRpb25hbFVzZXJSb3cpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgZnVuY3Rpb24gdXBkYXRlTGFzdFByZWRpY3Rpb24oZGF0YSkge1xuLy8gICAgICAgICBjb25zdCB0cmFuc2xhdGlvbktleSA9ICdib3hlci0nICsgZGF0YS5wbGF5ZXI7XG4vLyAgICAgICAgIGNvbnN0IHBsYXllciA9IHRyYW5zbGF0ZUtleSh0cmFuc2xhdGlvbktleSk7XG4vLyAgICAgICAgIGNvbnN0IHByZWRpY3RlZFBsYXllckRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX19sYXN0LXRlYW0nKTtcbi8vICAgICAgICAgcHJlZGljdGVkUGxheWVyRGl2LmlubmVySFRNTCA9IHBsYXllcjtcbi8vXG4vLyAgICAgICAgIGNvbnN0IHNjb3JlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWRpY3Rpb25fX2xhc3Qtc2NvcmUnKTtcbi8vICAgICAgICAgc2NvcmVEaXYuaW5uZXJIVE1MID0gZGF0YS5zY29yZSA9PSAwID8gSlVER0VfREVDSVNJT05fT1BUSU9OIDogYDxzcGFuIGNsYXNzPVwic2NvcmVUZWFtMVwiPiR7ZGF0YS5zY29yZX0gPC9zcGFuPmAgKyAncnVuZGEnO1xuLy9cbi8vICAgICAgICAgY29uc3QgbGFzdFByZWRpY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9fbGFzdCcpO1xuLy8gICAgICAgICBsYXN0UHJlZGljdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4vL1xuLy8gICAgICAgICAvLyBjb25zdCBwcmVkaWN0aW9uU3RhdHVzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWRpY3Rpb25fX2JldCcpO1xuLy8gICAgICAgICAvLyBwcmVkaWN0aW9uU3RhdHVzRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcbi8vXG4vLyAgICAgICAgIGNvbnN0IHByZWRpY3Rpb25Db25maXJtZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fYmV0LSR7ZGF0YS5iZXRDb25maXJtZWQgfHwgZmFsc2V9YCk7XG4vLyAgICAgICAgIHByZWRpY3Rpb25Db25maXJtZWQuY2xhc3NMaXN0LmFkZCgnYmV0U2NhbGUnKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIGZ1bmN0aW9uIGZvcm1hdERhdGVTdHJpbmcoZGF0ZVN0cmluZykge1xuLy8gICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVN0cmluZyk7XG4vL1xuLy8gICAgICAgICBjb25zdCBkYXkgPSBkYXRlLmdldERhdGUoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XG4vLyAgICAgICAgIGNvbnN0IG1vbnRoID0gKGRhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbi8vICAgICAgICAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbi8vICAgICAgICAgY29uc3QgaG91cnMgPSBkYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuLy8gICAgICAgICBjb25zdCBtaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuLy9cbi8vICAgICAgICAgcmV0dXJuIGAke2RheX0uJHttb250aH0uJHt5ZWFyfSAvICR7aG91cnN9OiR7bWludXRlc31gO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgZnVuY3Rpb24gbWFza1VzZXJJZCh1c2VySWQpIHtcbi8vICAgICAgICAgcmV0dXJuIFwiKipcIiArIHVzZXJJZC50b1N0cmluZygpLnNsaWNlKDIpO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgbGV0IGNoZWNrVXNlckF1dGggPSAoKSA9PiB7XG4vLyAgICAgICAgIGlmICh1c2VySWQpIHtcbi8vICAgICAgICAgICAgIHVuYXV0aE1zZ3MuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZScpKTtcbi8vICAgICAgICAgICAgIHlvdUFyZUluQnRucy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJykpO1xuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICBjb25zdCBzY29yZVByZWRpY3Rpb24gPSB7cGxheWVyIDogMSwgc2NvcmU6IDF9XG4vL1xuLy8gICAgIGZ1bmN0aW9uIGluaXRQbGF5ZXJTZWxlY3RvcigpIHtcbi8vICAgICAgICAgY29uc3QgcGxheWVyMSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wbGF5ZXIxJyk7XG4vLyAgICAgICAgIGNvbnN0IHBsYXllcjIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGxheWVyMicpO1xuLy8gICAgICAgICBjb25zdCBtaW51c0J0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX190ZWFtLWJ0bi1taW51c2ApO1xuLy8gICAgICAgICBjb25zdCBwbHVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLXBsdXNgKTtcbi8vXG4vLyAgICAgICAgIHBsYXllcjEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4vLyAgICAgICAgICAgICBzY29yZVByZWRpY3Rpb24ucGxheWVyID0gMTtcbi8vICAgICAgICAgICAgIHBsYXllcjEuY2xhc3NMaXN0LmFkZCgndGFrZVVzZXInKTtcbi8vICAgICAgICAgICAgIHBsYXllcjEuY2xhc3NMaXN0LmFkZCgnYm94ZXJTY2FsZScpO1xuLy8gICAgICAgICAgICAgcGxheWVyMi5jbGFzc0xpc3QucmVtb3ZlKCdib3hlclNjYWxlJyk7XG4vLyAgICAgICAgICAgICBwbGF5ZXIyLmNsYXNzTGlzdC5yZW1vdmUoJ3Rha2VVc2VyJyk7XG4vLyAgICAgICAgICAgICBtaW51c0J0bi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlQnRuJyk7XG4vLyAgICAgICAgICAgICBwbHVzQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVCdG4nKTtcbi8vXG4vLyAgICAgICAgIH0pO1xuLy9cbi8vICAgICAgICAgcGxheWVyMi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbi8vICAgICAgICAgICAgIHNjb3JlUHJlZGljdGlvbi5wbGF5ZXIgPSAyO1xuLy8gICAgICAgICAgICAgcGxheWVyMi5jbGFzc0xpc3QuYWRkKCd0YWtlVXNlcicpO1xuLy8gICAgICAgICAgICAgcGxheWVyMi5jbGFzc0xpc3QuYWRkKCdib3hlclNjYWxlJyk7XG4vLyAgICAgICAgICAgICBwbGF5ZXIxLmNsYXNzTGlzdC5yZW1vdmUoJ2JveGVyU2NhbGUnKTtcbi8vICAgICAgICAgICAgIHBsYXllcjEuY2xhc3NMaXN0LnJlbW92ZSgndGFrZVVzZXInKTtcbi8vICAgICAgICAgICAgIG1pbnVzQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVCdG4nKTtcbi8vICAgICAgICAgICAgIHBsdXNCdG4uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZUJ0bicpO1xuLy8gICAgICAgICB9KTtcbi8vICAgICB9XG4vL1xuLy8gICAgIGZ1bmN0aW9uIGluaXRTY29yZVNlbGVjdG9yKCkge1xuLy8gICAgICAgICBjb25zdCBtaW51c0J0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX190ZWFtLWJ0bi1taW51c2ApO1xuLy8gICAgICAgICBjb25zdCBwbHVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLXBsdXNgKTtcbi8vICAgICAgICAgY29uc3Qgc2NvcmVQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX19zY29yZWApO1xuLy9cbi8vICAgICAgICAgbWludXNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4vLyAgICAgICAgICAgICBzY29yZVByZWRpY3Rpb24uc2NvcmUgPSBub3JtYWxpemVTY29yZShzY29yZVByZWRpY3Rpb24uc2NvcmUgLSAxKTtcbi8vICAgICAgICAgICAgIHNjb3JlUGFuZWwuaW5uZXJIVE1MID0gZGlzcGxheVJvdW5kKHNjb3JlUHJlZGljdGlvbi5zY29yZSk7XG4vLyAgICAgICAgIH0pO1xuLy9cbi8vICAgICAgICAgcGx1c0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbi8vICAgICAgICAgICAgIHNjb3JlUHJlZGljdGlvbi5zY29yZSA9IG5vcm1hbGl6ZVNjb3JlKHNjb3JlUHJlZGljdGlvbi5zY29yZSArIDEpO1xuLy8gICAgICAgICAgICAgc2NvcmVQYW5lbC5pbm5lckhUTUwgPSBkaXNwbGF5Um91bmQoc2NvcmVQcmVkaWN0aW9uLnNjb3JlKTtcbi8vICAgICAgICAgfSk7XG4vLyAgICAgfVxuLy9cbi8vICAgICBmdW5jdGlvbiBub3JtYWxpemVTY29yZShzY29yZSkge1xuLy8gICAgICAgICBpZiAoc2NvcmUgPCAwKSB7XG4vLyAgICAgICAgICAgICByZXR1cm4gc2NvcmUgKyBDSE9JQ0VTX0NPVU5UO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIGlmIChzY29yZSA+IDEyKSB7XG4vLyAgICAgICAgICAgICByZXR1cm4gc2NvcmUgLSBDSE9JQ0VTX0NPVU5UO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIHJldHVybiBzY29yZTtcbi8vICAgICB9XG5cbi8vXG4vLyAgICAgZnVuY3Rpb24gZGlzcGxheVJvdW5kKGNob2ljZSkge1xuLy8gICAgICAgICByZXR1cm4gY2hvaWNlID09IDAgPyBKVURHRV9ERUNJU0lPTl9PUFRJT04gOiBjaG9pY2U7XG4vLyAgICAgfVxuLy9cbi8vICAgICBsZXQgaXNSZXF1ZXN0SW5Qcm9ncmVzcztcbi8vICAgICBmdW5jdGlvbiBpbml0UHJlZGljdGlvbkJ0bigpIHtcbi8vICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuLy8gICAgICAgICAgICAgaWYgKCEhZS50YXJnZXQuY2xvc2VzdCgnLnByZWRpY3Rpb25CdG4nKSkge1xuLy8gICAgICAgICAgICAgICAgIGlmIChpc1JlcXVlc3RJblByb2dyZXNzKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICB5b3VyQmV0VHh0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpO1xuLy8gICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIHlvdUFyZUluQnRucy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdzaG93QnRuJykpO1xuLy8gICAgICAgICAgICAgICAgIH0sIDUwMDApO1xuLy8gICAgICAgICAgICAgICAgIHlvdUFyZUluQnRucy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdzaG93QnRuJykpO1xuLy8gICAgICAgICAgICAgICAgIGlzUmVxdWVzdEluUHJvZ3Jlc3MgPSB0cnVlO1xuLy8gICAgICAgICAgICAgICAgIHByZWRpY3Rpb25CdG4uY2xhc3NMaXN0LmFkZChcInBvaW50ZXItbm9uZVwiKTtcbi8vICAgICAgICAgICAgICAgICByZXF1ZXN0KCcvYmV0Jywge1xuLy8gICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbi8vICAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgdXNlcmlkOiB1c2VySWQsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXI6IHNjb3JlUHJlZGljdGlvbi5wbGF5ZXIsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBzY29yZTogc2NvcmVQcmVkaWN0aW9uLnNjb3JlXG4vLyAgICAgICAgICAgICAgICAgICAgIH0pXG4vLyAgICAgICAgICAgICAgICAgfSkudGhlbihyZXMgPT4ge1xuLy8gICAgICAgICAgICAgICAgICAgICBpc1JlcXVlc3RJblByb2dyZXNzID0gZmFsc2U7XG4vLyAgICAgICAgICAgICAgICAgICAgIHByZWRpY3Rpb25CdG4uY2xhc3NMaXN0LnJlbW92ZShcInBvaW50ZXItbm9uZVwiKTtcbi8vICAgICAgICAgICAgICAgICAgICAgSW5pdFBhZ2UoKTtcbi8vICAgICAgICAgICAgICAgICB9KS5jYXRjaChlID0+IHtcbi8vICAgICAgICAgICAgICAgICAgICAgaXNSZXF1ZXN0SW5Qcm9ncmVzcyA9IGZhbHNlO1xuLy8gICAgICAgICAgICAgICAgICAgICBwcmVkaWN0aW9uQnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLW5vbmVcIik7XG4vLyAgICAgICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuLy8gICAgIH1cbi8vXG4vL1xuLy8gICAgIGxvYWRUcmFuc2xhdGlvbnMoKVxuLy8gICAgICAgICAudGhlbihpbml0KTtcbi8vXG4vLyAgICAgbGV0IG1haW5QYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZhdl9fcGFnZScpO1xuLy8gICAgIHNldFRpbWVvdXQoKCkgPT4gbWFpblBhZ2UuY2xhc3NMaXN0LmFkZCgnb3ZlcmZsb3cnKSwgMTAwMCk7XG4vL1xuLy8gICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcbi8vICAgICBpZihjdXJyZW50RGF0ZSA+PSBQUk9NT19FTkRfREFURSkge1xuLy8gICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnYmxvY2stYnRuJykpO1xuLy8gICAgIH1cbi8vXG4vLyB9KSgpO1xuXG5cbmNvbnN0IGJsYWNrQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ibGFjay1idG5cIilcblxuYmxhY2tCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+e1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmtcIilcbn0pXG5cblxuY29uc3QgQ0hPSUNFU19DT1VOVCA9IDEzO1xuY29uc3QgSlVER0VfREVDSVNJT05fT1BUSU9OID0gJ08vUyc7XG5sZXQgc2NvcmVQcmVkaWN0aW9uID0ge1xuICAgIHNjb3JlOiAwXG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlSb3VuZChjaG9pY2UpIHtcbiAgICByZXR1cm4gY2hvaWNlID09PSAwID8gSlVER0VfREVDSVNJT05fT1BUSU9OIDogY2hvaWNlO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVTY29yZShzY29yZSkge1xuICAgIGlmIChzY29yZSA8IDApIHtcbiAgICAgICAgcmV0dXJuIHNjb3JlICsgQ0hPSUNFU19DT1VOVDtcbiAgICB9XG4gICAgaWYgKHNjb3JlID4gMTIpIHtcbiAgICAgICAgcmV0dXJuIHNjb3JlIC0gQ0hPSUNFU19DT1VOVDtcbiAgICB9XG4gICAgcmV0dXJuIHNjb3JlO1xufVxuZnVuY3Rpb24gaW5pdFNjb3JlU2VsZWN0b3IoKSB7XG4gICAgY29uc3QgbWludXNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fdGVhbS1idG4tbWludXNgKTtcbiAgICBjb25zdCBwbHVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLXBsdXNgKTtcbiAgICBjb25zdCBzY29yZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3Njb3JlYCk7XG5cbiAgICBtaW51c0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgc2NvcmVQcmVkaWN0aW9uLnNjb3JlID0gbm9ybWFsaXplU2NvcmUoc2NvcmVQcmVkaWN0aW9uLnNjb3JlIC0gMSk7XG4gICAgICAgIHNjb3JlUGFuZWwuaW5uZXJIVE1MID0gZGlzcGxheVJvdW5kKHNjb3JlUHJlZGljdGlvbi5zY29yZSk7XG4gICAgfSk7XG5cbiAgICBwbHVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzY29yZVByZWRpY3Rpb24uc2NvcmUgPSBub3JtYWxpemVTY29yZShzY29yZVByZWRpY3Rpb24uc2NvcmUgKyAxKTtcbiAgICAgICAgc2NvcmVQYW5lbC5pbm5lckhUTUwgPSBkaXNwbGF5Um91bmQoc2NvcmVQcmVkaWN0aW9uLnNjb3JlKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgaW5pdFNjb3JlU2VsZWN0b3IoKTtcbn1cbmluaXQoKSIsIiJdfQ==
