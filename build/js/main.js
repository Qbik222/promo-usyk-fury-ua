"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
(function () {
  var PROMO_END_DATE = new Date('2023-12-23T19:00:00.000Z'); //-2 hours
  var apiURL = 'https://fav-prom.com/api_predictor_fight_ua';
  var CHOICES_COUNT = 13;
  // let scorePrediction = {
  //     score: 0
  // }
  var scorePrediction = {
    player: 1,
    score: 1
  };
  var resultsTable = document.querySelector('.tableResults__body'),
    unauthMsgs = document.querySelectorAll('.unauth-msg'),
    youAreInBtns = document.querySelectorAll('.took-part'),
    predictionBtn = document.querySelector('.predictionBtn'),
    yourBetTxt = document.querySelector('.prediction__yourBet');
  var enLeng = document.querySelector('#hrLeng');

  // let locale = 'en';

  var locale = sessionStorage.getItem('locale') || 'en';
  function setState(newLocale) {
    locale = newLocale;
    sessionStorage.setItem('locale', locale);
  }
  function toggleState() {
    var newLocale = locale === 'en' ? 'uk' : 'en';
    setState(newLocale);
    window.location.reload();
  }
  document.querySelector('.en-btn').addEventListener('click', function () {
    toggleState();
  });
  if (enLeng) locale = 'en';
  document.querySelector(".fav__page").classList.add(locale);
  var JUDGE_DECISION_OPTION = locale === 'uk' ? 'за рішенням суддів' : "According to the judges decision";
  var i18nData = {};
  var userId = Number(sessionStorage.getItem('id')) || null;
  document.querySelector(".betTrue").addEventListener("click", function () {
    sessionStorage.setItem('id', 100360130);
    window.location.reload();
  });
  document.querySelector(".betFalse").addEventListener("click", function () {
    sessionStorage.setItem('id', 100300268);
    window.location.reload();
  });
  document.querySelector(".unAuth").addEventListener("click", function () {
    sessionStorage.removeItem('id');
    window.location.reload();
  });
  document.querySelector(".menu-btn").addEventListener("click", function () {
    document.querySelector(".menu-btns").classList.toggle("hide");
  });
  // userId = 1457027;
  // userId = 100300268
  // userId = 100360130
  function loadTranslations() {
    return fetch("".concat(apiURL, "/translates/").concat(locale)).then(function (res) {
      return res.json();
    }).then(function (json) {
      i18nData = json;
      translate();
      var mutationObserver = new MutationObserver(function (mutations) {
        translate();
      });
      mutationObserver.observe(document.getElementById('predictor'), {
        childList: true,
        subtree: true
      });
    });
  }
  function translate() {
    var elems = document.querySelectorAll('[data-translate]');
    if (elems && elems.length) {
      elems.forEach(function (elem) {
        var key = elem.getAttribute('data-translate');
        elem.innerHTML = translateKey(key);
        elem.removeAttribute('data-translate');
      });
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
    for (var _i = 0, _arr = ['hr']; _i < _arr.length; _i++) {
      var lang = _arr[_i];
      element.classList.remove(baseCssClass + lang);
    }
    element.classList.add(baseCssClass + locale);
  }
  var request = function request(link, extraOptions) {
    return fetch(apiURL + link, _objectSpread({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, extraOptions || {})).then(function (res) {
      return res.json();
    });
  };
  function getUsers() {
    return request('/users');
  }
  var InitPage = function InitPage() {
    getUsers().then(function (users) {
      // console.log(users)
      renderUsers(users);
      translate();
    });
  };
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
      var c = 0;
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
      var currentUser = userId && users.find(function (user) {
        return user.userid === currentUserId;
      });
      if (currentUser) {
        displayUser(currentUser, true, table);
      }
      users.forEach(function (user) {
        if (user.userid !== currentUserId) {
          displayUser(user, false, table);
        }
      });
    }
  }
  function displayUser(user, isCurrentUser, table) {
    var additionalUserRow = document.createElement('div');
    additionalUserRow.classList.add('tableResults__row');
    if (isCurrentUser) {
      // updateLastPrediction(user);
      additionalUserRow.classList.add('you');
    }

    // const translationKey = 'boxer-' + user.player;
    // const player = translateKey(translationKey);
    var prediction = user.team === 13 ? JUDGE_DECISION_OPTION : user.team + ' runda';
    additionalUserRow.innerHTML = "\n                        <div class=\"tableResults__body-col\">".concat(user.userid, " ").concat(isCurrentUser ? '<span data-translate="you"></span>' : '', "</div>\n                        <div class=\"tableResults__body-col\">").concat(formatDateString(user.lastForecast), "</div>\n                        <div class=\"tableResults__body-col\">").concat(prediction, "</div>\n                        <div class=\"tableResults__body-col\">*******</div>\n                    ");
    table.append(additionalUserRow);
  }
  function updateLastPrediction(data) {
    var translationKey = 'boxer-' + data.player;
    var player = translateKey(translationKey);
    var predictedPlayerDiv = document.querySelector('.prediction__last-team');
    predictedPlayerDiv.innerHTML = player;
    var scoreDiv = document.querySelector('.prediction__last-score');
    scoreDiv.innerHTML = data.score == 0 ? JUDGE_DECISION_OPTION : "<span class=\"scoreTeam1\">".concat(data.score, " </span>") + 'runda';
    var lastPrediction = document.querySelector('.prediction__last');
    lastPrediction.classList.remove('hide');

    // const predictionStatusDiv = document.querySelector('.prediction__bet');
    // predictionStatusDiv.classList.remove('hide');

    var predictionConfirmed = document.querySelector(".prediction__bet-".concat(data.betConfirmed || false));
    predictionConfirmed.classList.add('betScale');
  }
  function formatDateString(dateString) {
    var date = new Date(dateString);
    var day = date.getDate().toString().padStart(2, '0');
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var year = date.getFullYear();
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    return "".concat(day, ".").concat(month, ".").concat(year, " / ").concat(hours, ":").concat(minutes);
  }
  function maskUserId(userId) {
    return "**" + userId.toString().slice(2);
  }
  function checkUserAuth() {
    return request("/favuser/".concat(userId, "?nocache=1")).then(function (res) {
      if (res.userid) {
        if (res.userid === userId) {
          confirmBet(res.betConfirmed);
        }
        unauthMsgs.forEach(function (item) {
          return item.classList.add('hide');
        });
        youAreInBtns.forEach(function (item) {
          return item.classList.remove('hide');
        });
      } else {
        unauthMsgs.forEach(function (item) {
          return item.classList.remove('hide');
        });
        youAreInBtns.forEach(function (item) {
          return item.classList.add('hide');
        });
      }
    });
  }
  function initPlayerSelector() {
    var player1 = document.querySelector('.player1');
    var player2 = document.querySelector('.player2');
    var minusBtn = document.querySelector(".prediction__team-btn-minus");
    var plusBtn = document.querySelector(".prediction__team-btn-plus");
    player1.addEventListener('click', function () {
      scorePrediction.player = 1;
      player1.classList.add('takeUser');
      player1.classList.add('boxerScale');
      player2.classList.remove('boxerScale');
      player2.classList.remove('takeUser');
      minusBtn.classList.remove('disableBtn');
      plusBtn.classList.remove('disableBtn');
    });
    player2.addEventListener('click', function () {
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
    var minusBtn = document.querySelector(".prediction__team-btn-minus");
    var plusBtn = document.querySelector(".prediction__team-btn-plus");
    var scorePanel = document.querySelector(".prediction__score");
    minusBtn.addEventListener('click', function () {
      scorePrediction.score = normalizeScore(scorePrediction.score - 1);
      scorePanel.innerHTML = displayRound(scorePrediction.score);
      if (scorePrediction.score === 0) {
        scorePanel.classList.add("small-score");
      } else {
        scorePanel.classList.remove("small-score");
      }
    });
    plusBtn.addEventListener('click', function () {
      scorePrediction.score = normalizeScore(scorePrediction.score + 1);
      scorePanel.innerHTML = displayRound(scorePrediction.score);
      if (scorePrediction.score === 0) {
        scorePanel.classList.add("small-score");
      } else {
        scorePanel.classList.remove("small-score");
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
  var isRequestInProgress;
  function initPredictionBtn() {
    document.addEventListener('click', function (e) {
      if (!!e.target.closest('.predictionBtn')) {
        if (isRequestInProgress) {
          return;
        }
        yourBetTxt.classList.remove("hide");
        setTimeout(function () {
          youAreInBtns.forEach(function (item) {
            return item.classList.remove('showBtn');
          });
        }, 5000);
        youAreInBtns.forEach(function (item) {
          return item.classList.add('showBtn');
        });
        isRequestInProgress = true;
        predictionBtn.classList.add("pointer-none");
        request('/bet', {
          method: 'POST',
          body: JSON.stringify({
            userid: userId,
            player: scorePrediction.player,
            score: scorePrediction.score
          })
        }).then(function (res) {
          isRequestInProgress = false;
          predictionBtn.classList.remove("pointer-none");
          InitPage();
        })["catch"](function (e) {
          isRequestInProgress = false;
          predictionBtn.classList.remove("pointer-none");
        });
      }
    });
  }
  loadTranslations().then(init);
  var mainPage = document.querySelector('.fav__page');
  setTimeout(function () {
    return mainPage.classList.add('overflow');
  }, 1000);
  var currentDate = new Date();
  if (currentDate >= PROMO_END_DATE) {
    youAreInBtns.forEach(function (item) {
      return item.classList.add('block-btn');
    });
  }
  function confirmBet(bet) {
    var betWrap = document.querySelector(".prediction__last");
    var betTrue = document.querySelector(".prediction__bet-true");
    var betFalse = document.querySelector(".prediction__bet-false");
    betWrap.classList.remove("hide");
    if (bet) {
      betTrue.classList.remove("hide");
    } else {
      betFalse.classList.remove("hide");
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
  var blackBtn = document.querySelector(".black-btn");
  blackBtn.addEventListener("click", function () {
    document.body.classList.toggle("dark");
  });
})();

// function init() {
//        ;
// }
// init()
"use strict";
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJzZWNvbmQuanMiXSwibmFtZXMiOlsiUFJPTU9fRU5EX0RBVEUiLCJEYXRlIiwiYXBpVVJMIiwiQ0hPSUNFU19DT1VOVCIsInNjb3JlUHJlZGljdGlvbiIsInBsYXllciIsInNjb3JlIiwicmVzdWx0c1RhYmxlIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwidW5hdXRoTXNncyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJ5b3VBcmVJbkJ0bnMiLCJwcmVkaWN0aW9uQnRuIiwieW91ckJldFR4dCIsImVuTGVuZyIsImxvY2FsZSIsInNlc3Npb25TdG9yYWdlIiwiZ2V0SXRlbSIsInNldFN0YXRlIiwibmV3TG9jYWxlIiwic2V0SXRlbSIsInRvZ2dsZVN0YXRlIiwid2luZG93IiwibG9jYXRpb24iLCJyZWxvYWQiLCJhZGRFdmVudExpc3RlbmVyIiwiY2xhc3NMaXN0IiwiYWRkIiwiSlVER0VfREVDSVNJT05fT1BUSU9OIiwiaTE4bkRhdGEiLCJ1c2VySWQiLCJOdW1iZXIiLCJyZW1vdmVJdGVtIiwidG9nZ2xlIiwibG9hZFRyYW5zbGF0aW9ucyIsImZldGNoIiwiY29uY2F0IiwidGhlbiIsInJlcyIsImpzb24iLCJ0cmFuc2xhdGUiLCJtdXRhdGlvbk9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsIm9ic2VydmUiLCJnZXRFbGVtZW50QnlJZCIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJlbGVtcyIsImxlbmd0aCIsImZvckVhY2giLCJlbGVtIiwia2V5IiwiZ2V0QXR0cmlidXRlIiwiaW5uZXJIVE1MIiwidHJhbnNsYXRlS2V5IiwicmVtb3ZlQXR0cmlidXRlIiwicmVmcmVzaExvY2FsaXplZENsYXNzIiwiZWxlbWVudCIsImJhc2VDc3NDbGFzcyIsIl9pIiwiX2FyciIsImxhbmciLCJyZW1vdmUiLCJyZXF1ZXN0IiwibGluayIsImV4dHJhT3B0aW9ucyIsIl9vYmplY3RTcHJlYWQiLCJoZWFkZXJzIiwiZ2V0VXNlcnMiLCJJbml0UGFnZSIsInVzZXJzIiwicmVuZGVyVXNlcnMiLCJpbml0IiwiaW5pdFBsYXllclNlbGVjdG9yIiwiaW5pdFNjb3JlU2VsZWN0b3IiLCJpbml0UHJlZGljdGlvbkJ0biIsInN0b3JlIiwic3RhdGUiLCJnZXRTdGF0ZSIsImF1dGgiLCJpc0F1dGhvcml6ZWQiLCJpZCIsImMiLCJpIiwic2V0SW50ZXJ2YWwiLCJnX3VzZXJfaWQiLCJjaGVja1VzZXJBdXRoIiwiY2xlYXJJbnRlcnZhbCIsInBvcHVsYXRlVXNlcnNUYWJsZSIsImN1cnJlbnRVc2VySWQiLCJ0YWJsZSIsImN1cnJlbnRVc2VyIiwiZmluZCIsInVzZXIiLCJ1c2VyaWQiLCJkaXNwbGF5VXNlciIsImlzQ3VycmVudFVzZXIiLCJhZGRpdGlvbmFsVXNlclJvdyIsImNyZWF0ZUVsZW1lbnQiLCJwcmVkaWN0aW9uIiwidGVhbSIsImZvcm1hdERhdGVTdHJpbmciLCJsYXN0Rm9yZWNhc3QiLCJhcHBlbmQiLCJ1cGRhdGVMYXN0UHJlZGljdGlvbiIsImRhdGEiLCJ0cmFuc2xhdGlvbktleSIsInByZWRpY3RlZFBsYXllckRpdiIsInNjb3JlRGl2IiwibGFzdFByZWRpY3Rpb24iLCJwcmVkaWN0aW9uQ29uZmlybWVkIiwiYmV0Q29uZmlybWVkIiwiZGF0ZVN0cmluZyIsImRhdGUiLCJkYXkiLCJnZXREYXRlIiwidG9TdHJpbmciLCJwYWRTdGFydCIsIm1vbnRoIiwiZ2V0TW9udGgiLCJ5ZWFyIiwiZ2V0RnVsbFllYXIiLCJob3VycyIsImdldEhvdXJzIiwibWludXRlcyIsImdldE1pbnV0ZXMiLCJtYXNrVXNlcklkIiwic2xpY2UiLCJjb25maXJtQmV0IiwiaXRlbSIsInBsYXllcjEiLCJwbGF5ZXIyIiwibWludXNCdG4iLCJwbHVzQnRuIiwic2NvcmVQYW5lbCIsIm5vcm1hbGl6ZVNjb3JlIiwiZGlzcGxheVJvdW5kIiwiY2hvaWNlIiwiaXNSZXF1ZXN0SW5Qcm9ncmVzcyIsImUiLCJ0YXJnZXQiLCJjbG9zZXN0Iiwic2V0VGltZW91dCIsIm1ldGhvZCIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwibWFpblBhZ2UiLCJjdXJyZW50RGF0ZSIsImJldCIsImJldFdyYXAiLCJiZXRUcnVlIiwiYmV0RmFsc2UiLCJibGFja0J0biJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxDQUFDLFlBQVk7RUFDVCxJQUFNQSxjQUFjLEdBQUcsSUFBSUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztFQUM3RCxJQUFNQyxNQUFNLEdBQUcsNkNBQTZDO0VBQzVELElBQU1DLGFBQWEsR0FBRyxFQUFFO0VBQ3hCO0VBQ0E7RUFDQTtFQUNBLElBQUlDLGVBQWUsR0FBRztJQUFDQyxNQUFNLEVBQUcsQ0FBQztJQUFFQyxLQUFLLEVBQUU7RUFBQyxDQUFDO0VBRzVDLElBQ0lDLFlBQVksR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUMscUJBQXFCLENBQUM7SUFDNURDLFVBQVUsR0FBR0YsUUFBUSxDQUFDRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUM7SUFDckRDLFlBQVksR0FBR0osUUFBUSxDQUFDRyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUM7SUFDdERFLGFBQWEsR0FBR0wsUUFBUSxDQUFDQyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7SUFDeERLLFVBQVUsR0FBR04sUUFBUSxDQUFDQyxhQUFhLENBQUMsc0JBQXNCLENBQUM7RUFFL0QsSUFBTU0sTUFBTSxHQUFHUCxRQUFRLENBQUNDLGFBQWEsQ0FBQyxTQUFTLENBQUM7O0VBRWhEOztFQUVBLElBQUlPLE1BQU0sR0FBR0MsY0FBYyxDQUFDQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSTtFQUVyRCxTQUFTQyxRQUFRQSxDQUFDQyxTQUFTLEVBQUU7SUFDekJKLE1BQU0sR0FBR0ksU0FBUztJQUNsQkgsY0FBYyxDQUFDSSxPQUFPLENBQUMsUUFBUSxFQUFFTCxNQUFNLENBQUM7RUFDNUM7RUFDQSxTQUFTTSxXQUFXQSxDQUFBLEVBQUc7SUFDbkIsSUFBTUYsU0FBUyxHQUFHSixNQUFNLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJO0lBQy9DRyxRQUFRLENBQUNDLFNBQVMsQ0FBQztJQUNuQkcsTUFBTSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sQ0FBQyxDQUFDO0VBQzVCO0VBQ0FqQixRQUFRLENBQUNDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQ2lCLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFNO0lBQzlESixXQUFXLENBQUMsQ0FBQztFQUVqQixDQUFDLENBQUM7RUFFRixJQUFJUCxNQUFNLEVBQUVDLE1BQU0sR0FBRyxJQUFJO0VBRXpCUixRQUFRLENBQUNDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQ2tCLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDWixNQUFNLENBQUM7RUFFMUQsSUFBTWEscUJBQXFCLEdBQUdiLE1BQU0sS0FBSyxJQUFJLEdBQUcsb0JBQW9CLHFDQUFxQztFQUd6RyxJQUFJYyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0VBQ2pCLElBQUlDLE1BQU0sR0FBR0MsTUFBTSxDQUFDZixjQUFjLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUk7RUFFekRWLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDaUIsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQUs7SUFDOURULGNBQWMsQ0FBQ0ksT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7SUFDdkNFLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLENBQUMsQ0FBQztFQUM1QixDQUFDLENBQUM7RUFDRmpCLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDaUIsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQUs7SUFDL0RULGNBQWMsQ0FBQ0ksT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7SUFDdkNFLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLENBQUMsQ0FBQztFQUM1QixDQUFDLENBQUM7RUFDRmpCLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDaUIsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQUs7SUFDN0RULGNBQWMsQ0FBQ2dCLFVBQVUsQ0FBQyxJQUFJLENBQUM7SUFDL0JWLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLENBQUMsQ0FBQztFQUM1QixDQUFDLENBQUM7RUFDRmpCLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDaUIsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQUs7SUFDL0RsQixRQUFRLENBQUNDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQ2tCLFNBQVMsQ0FBQ08sTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNqRSxDQUFDLENBQUM7RUFDRjtFQUNBO0VBQ0E7RUFDQSxTQUFTQyxnQkFBZ0JBLENBQUEsRUFBRztJQUN4QixPQUFPQyxLQUFLLElBQUFDLE1BQUEsQ0FBSW5DLE1BQU0sa0JBQUFtQyxNQUFBLENBQWVyQixNQUFNLENBQUUsQ0FBQyxDQUFDc0IsSUFBSSxDQUFDLFVBQUFDLEdBQUc7TUFBQSxPQUFJQSxHQUFHLENBQUNDLElBQUksQ0FBQyxDQUFDO0lBQUEsRUFBQyxDQUNqRUYsSUFBSSxDQUFDLFVBQUFFLElBQUksRUFBSTtNQUNWVixRQUFRLEdBQUdVLElBQUk7TUFDZkMsU0FBUyxDQUFDLENBQUM7TUFFWCxJQUFJQyxnQkFBZ0IsR0FBRyxJQUFJQyxnQkFBZ0IsQ0FBQyxVQUFVQyxTQUFTLEVBQUU7UUFDN0RILFNBQVMsQ0FBQyxDQUFDO01BQ2YsQ0FBQyxDQUFDO01BQ0ZDLGdCQUFnQixDQUFDRyxPQUFPLENBQUNyQyxRQUFRLENBQUNzQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDM0RDLFNBQVMsRUFBRSxJQUFJO1FBQ2ZDLE9BQU8sRUFBRTtNQUNiLENBQUMsQ0FBQztJQUVOLENBQUMsQ0FBQztFQUNWO0VBRUEsU0FBU1AsU0FBU0EsQ0FBQSxFQUFHO0lBQ2pCLElBQU1RLEtBQUssR0FBR3pDLFFBQVEsQ0FBQ0csZ0JBQWdCLENBQUMsa0JBQWtCLENBQUM7SUFDM0QsSUFBSXNDLEtBQUssSUFBSUEsS0FBSyxDQUFDQyxNQUFNLEVBQUU7TUFDdkJELEtBQUssQ0FBQ0UsT0FBTyxDQUFDLFVBQUFDLElBQUksRUFBSTtRQUNsQixJQUFNQyxHQUFHLEdBQUdELElBQUksQ0FBQ0UsWUFBWSxDQUFDLGdCQUFnQixDQUFDO1FBQy9DRixJQUFJLENBQUNHLFNBQVMsR0FBR0MsWUFBWSxDQUFDSCxHQUFHLENBQUM7UUFDbENELElBQUksQ0FBQ0ssZUFBZSxDQUFDLGdCQUFnQixDQUFDO01BQzFDLENBQUMsQ0FBQztJQUNOO0lBQ0FDLHFCQUFxQixDQUFDLENBQUM7RUFDM0I7RUFFQSxTQUFTRixZQUFZQSxDQUFDSCxHQUFHLEVBQUU7SUFDdkIsSUFBSSxDQUFDQSxHQUFHLEVBQUU7TUFDTjtJQUNKO0lBQ0EsT0FBT3ZCLFFBQVEsQ0FBQ3VCLEdBQUcsQ0FBQyxJQUFJLDBDQUEwQyxHQUFHQSxHQUFHO0VBQzVFO0VBRUEsU0FBU0sscUJBQXFCQSxDQUFDQyxPQUFPLEVBQUVDLFlBQVksRUFBRTtJQUNsRCxJQUFJLENBQUNELE9BQU8sRUFBRTtNQUNWO0lBQ0o7SUFDQSxTQUFBRSxFQUFBLE1BQUFDLElBQUEsR0FBbUIsQ0FBQyxJQUFJLENBQUMsRUFBQUQsRUFBQSxHQUFBQyxJQUFBLENBQUFaLE1BQUEsRUFBQVcsRUFBQSxJQUFFO01BQXRCLElBQU1FLElBQUksR0FBQUQsSUFBQSxDQUFBRCxFQUFBO01BQ1hGLE9BQU8sQ0FBQ2hDLFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQ0osWUFBWSxHQUFHRyxJQUFJLENBQUM7SUFDakQ7SUFDQUosT0FBTyxDQUFDaEMsU0FBUyxDQUFDQyxHQUFHLENBQUNnQyxZQUFZLEdBQUc1QyxNQUFNLENBQUM7RUFDaEQ7RUFFQSxJQUFNaUQsT0FBTyxHQUFHLFNBQVZBLE9BQU9BLENBQWFDLElBQUksRUFBRUMsWUFBWSxFQUFFO0lBQzFDLE9BQU8vQixLQUFLLENBQUNsQyxNQUFNLEdBQUdnRSxJQUFJLEVBQUFFLGFBQUE7TUFDdEJDLE9BQU8sRUFBRTtRQUNMLFFBQVEsRUFBRSxrQkFBa0I7UUFDNUIsY0FBYyxFQUFFO01BQ3BCO0lBQUMsR0FDR0YsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUN6QixDQUFDLENBQUM3QixJQUFJLENBQUMsVUFBQUMsR0FBRztNQUFBLE9BQUlBLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDLENBQUM7SUFBQSxFQUFDO0VBQzlCLENBQUM7RUFFRCxTQUFTOEIsUUFBUUEsQ0FBQSxFQUFHO0lBQ2hCLE9BQU9MLE9BQU8sQ0FBQyxRQUFRLENBQUM7RUFDNUI7RUFFQSxJQUFNTSxRQUFRLEdBQUcsU0FBWEEsUUFBUUEsQ0FBQSxFQUFTO0lBQ25CRCxRQUFRLENBQUMsQ0FBQyxDQUFDaEMsSUFBSSxDQUFDLFVBQUFrQyxLQUFLLEVBQUk7TUFDckI7TUFDQUMsV0FBVyxDQUFDRCxLQUFLLENBQUM7TUFDbEIvQixTQUFTLENBQUMsQ0FBQztJQUNmLENBQUMsQ0FBQztFQUNOLENBQUM7RUFFRCxTQUFTaUMsSUFBSUEsQ0FBQSxFQUFHO0lBQ1pDLGtCQUFrQixDQUFDLENBQUM7SUFDcEJDLGlCQUFpQixDQUFDLENBQUM7SUFDbkJDLGlCQUFpQixDQUFDLENBQUM7SUFFbkIsSUFBSXRELE1BQU0sQ0FBQ3VELEtBQUssRUFBRTtNQUNkLElBQUlDLEtBQUssR0FBR3hELE1BQU0sQ0FBQ3VELEtBQUssQ0FBQ0UsUUFBUSxDQUFDLENBQUM7TUFDbkNqRCxNQUFNLEdBQUdnRCxLQUFLLENBQUNFLElBQUksQ0FBQ0MsWUFBWSxJQUFJSCxLQUFLLENBQUNFLElBQUksQ0FBQ0UsRUFBRSxJQUFJLEVBQUU7TUFDdkRaLFFBQVEsQ0FBQyxDQUFDO0lBQ2QsQ0FBQyxNQUFNO01BQ0hBLFFBQVEsQ0FBQyxDQUFDO01BQ1YsSUFBSWEsQ0FBQyxHQUFHLENBQUM7TUFDVCxJQUFJQyxDQUFDLEdBQUdDLFdBQVcsQ0FBQyxZQUFZO1FBQzVCLElBQUlGLENBQUMsR0FBRyxFQUFFLEVBQUU7VUFDUixJQUFJLENBQUMsQ0FBQzdELE1BQU0sQ0FBQ2dFLFNBQVMsRUFBRTtZQUNwQnhELE1BQU0sR0FBR1IsTUFBTSxDQUFDZ0UsU0FBUztZQUN6QmhCLFFBQVEsQ0FBQyxDQUFDO1lBQ1ZpQixhQUFhLENBQUMsQ0FBQztZQUNmQyxhQUFhLENBQUNKLENBQUMsQ0FBQztVQUNwQjtRQUNKLENBQUMsTUFBTTtVQUNISSxhQUFhLENBQUNKLENBQUMsQ0FBQztRQUNwQjtNQUNKLENBQUMsRUFBRSxHQUFHLENBQUM7SUFDWDtJQUVBRyxhQUFhLENBQUMsQ0FBQztFQUNuQjtFQUVBLFNBQVNmLFdBQVdBLENBQUNELEtBQUssRUFBRTtJQUN4QmtCLGtCQUFrQixDQUFDbEIsS0FBSyxFQUFFekMsTUFBTSxFQUFFeEIsWUFBWSxDQUFDO0VBQ25EO0VBRUEsU0FBU21GLGtCQUFrQkEsQ0FBQ2xCLEtBQUssRUFBRW1CLGFBQWEsRUFBRUMsS0FBSyxFQUFFO0lBQ3JEQSxLQUFLLENBQUNyQyxTQUFTLEdBQUcsRUFBRTtJQUNwQjtJQUNBLElBQUlpQixLQUFLLElBQUlBLEtBQUssQ0FBQ3RCLE1BQU0sRUFBRTtNQUN2QixJQUFNMkMsV0FBVyxHQUFHOUQsTUFBTSxJQUFJeUMsS0FBSyxDQUFDc0IsSUFBSSxDQUFDLFVBQUFDLElBQUk7UUFBQSxPQUFJQSxJQUFJLENBQUNDLE1BQU0sS0FBS0wsYUFBYTtNQUFBLEVBQUM7TUFDL0UsSUFBSUUsV0FBVyxFQUFFO1FBQ2JJLFdBQVcsQ0FBQ0osV0FBVyxFQUFFLElBQUksRUFBRUQsS0FBSyxDQUFDO01BQ3pDO01BRUFwQixLQUFLLENBQUNyQixPQUFPLENBQUMsVUFBQzRDLElBQUksRUFBSztRQUNwQixJQUFJQSxJQUFJLENBQUNDLE1BQU0sS0FBS0wsYUFBYSxFQUFFO1VBQy9CTSxXQUFXLENBQUNGLElBQUksRUFBRSxLQUFLLEVBQUVILEtBQUssQ0FBQztRQUNuQztNQUNKLENBQUMsQ0FBQztJQUNOO0VBQ0o7RUFFQSxTQUFTSyxXQUFXQSxDQUFDRixJQUFJLEVBQUVHLGFBQWEsRUFBRU4sS0FBSyxFQUFFO0lBQzdDLElBQU1PLGlCQUFpQixHQUFHM0YsUUFBUSxDQUFDNEYsYUFBYSxDQUFDLEtBQUssQ0FBQztJQUN2REQsaUJBQWlCLENBQUN4RSxTQUFTLENBQUNDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztJQUNwRCxJQUFJc0UsYUFBYSxFQUFFO01BQ2Y7TUFDQUMsaUJBQWlCLENBQUN4RSxTQUFTLENBQUNDLEdBQUcsQ0FBQyxLQUFLLENBQUM7SUFDMUM7O0lBRUE7SUFDQTtJQUNBLElBQU15RSxVQUFVLEdBQUdOLElBQUksQ0FBQ08sSUFBSSxLQUFLLEVBQUUsR0FBR3pFLHFCQUFxQixHQUFHa0UsSUFBSSxDQUFDTyxJQUFJLEdBQUcsUUFBUTtJQUVsRkgsaUJBQWlCLENBQUM1QyxTQUFTLHNFQUFBbEIsTUFBQSxDQUMyQjBELElBQUksQ0FBQ0MsTUFBTSxPQUFBM0QsTUFBQSxDQUFJNkQsYUFBYSxHQUFHLG9DQUFvQyxHQUFHLEVBQUUsNEVBQUE3RCxNQUFBLENBQ3hFa0UsZ0JBQWdCLENBQUNSLElBQUksQ0FBQ1MsWUFBWSxDQUFDLDRFQUFBbkUsTUFBQSxDQUNuQ2dFLFVBQVUsOEdBRW5EO0lBQ2JULEtBQUssQ0FBQ2EsTUFBTSxDQUFDTixpQkFBaUIsQ0FBQztFQUNuQztFQUVBLFNBQVNPLG9CQUFvQkEsQ0FBQ0MsSUFBSSxFQUFFO0lBQ2hDLElBQU1DLGNBQWMsR0FBRyxRQUFRLEdBQUdELElBQUksQ0FBQ3RHLE1BQU07SUFDN0MsSUFBTUEsTUFBTSxHQUFHbUQsWUFBWSxDQUFDb0QsY0FBYyxDQUFDO0lBQzNDLElBQU1DLGtCQUFrQixHQUFHckcsUUFBUSxDQUFDQyxhQUFhLENBQUMsd0JBQXdCLENBQUM7SUFDM0VvRyxrQkFBa0IsQ0FBQ3RELFNBQVMsR0FBR2xELE1BQU07SUFFckMsSUFBTXlHLFFBQVEsR0FBR3RHLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLHlCQUF5QixDQUFDO0lBQ2xFcUcsUUFBUSxDQUFDdkQsU0FBUyxHQUFHb0QsSUFBSSxDQUFDckcsS0FBSyxJQUFJLENBQUMsR0FBR3VCLHFCQUFxQixHQUFHLDhCQUFBUSxNQUFBLENBQTRCc0UsSUFBSSxDQUFDckcsS0FBSyxnQkFBYSxPQUFPO0lBRXpILElBQU15RyxjQUFjLEdBQUd2RyxRQUFRLENBQUNDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQztJQUNsRXNHLGNBQWMsQ0FBQ3BGLFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0lBRXZDO0lBQ0E7O0lBRUEsSUFBTWdELG1CQUFtQixHQUFHeEcsUUFBUSxDQUFDQyxhQUFhLHFCQUFBNEIsTUFBQSxDQUFxQnNFLElBQUksQ0FBQ00sWUFBWSxJQUFJLEtBQUssQ0FBRSxDQUFDO0lBQ3BHRCxtQkFBbUIsQ0FBQ3JGLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLFVBQVUsQ0FBQztFQUNqRDtFQUVBLFNBQVMyRSxnQkFBZ0JBLENBQUNXLFVBQVUsRUFBRTtJQUNsQyxJQUFNQyxJQUFJLEdBQUcsSUFBSWxILElBQUksQ0FBQ2lILFVBQVUsQ0FBQztJQUVqQyxJQUFNRSxHQUFHLEdBQUdELElBQUksQ0FBQ0UsT0FBTyxDQUFDLENBQUMsQ0FBQ0MsUUFBUSxDQUFDLENBQUMsQ0FBQ0MsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7SUFDdEQsSUFBTUMsS0FBSyxHQUFHLENBQUNMLElBQUksQ0FBQ00sUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUVILFFBQVEsQ0FBQyxDQUFDLENBQUNDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0lBQy9ELElBQU1HLElBQUksR0FBR1AsSUFBSSxDQUFDUSxXQUFXLENBQUMsQ0FBQztJQUMvQixJQUFNQyxLQUFLLEdBQUdULElBQUksQ0FBQ1UsUUFBUSxDQUFDLENBQUMsQ0FBQ1AsUUFBUSxDQUFDLENBQUMsQ0FBQ0MsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7SUFDekQsSUFBTU8sT0FBTyxHQUFHWCxJQUFJLENBQUNZLFVBQVUsQ0FBQyxDQUFDLENBQUNULFFBQVEsQ0FBQyxDQUFDLENBQUNDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0lBRTdELFVBQUFsRixNQUFBLENBQVUrRSxHQUFHLE9BQUEvRSxNQUFBLENBQUltRixLQUFLLE9BQUFuRixNQUFBLENBQUlxRixJQUFJLFNBQUFyRixNQUFBLENBQU11RixLQUFLLE9BQUF2RixNQUFBLENBQUl5RixPQUFPO0VBQ3hEO0VBRUEsU0FBU0UsVUFBVUEsQ0FBQ2pHLE1BQU0sRUFBRTtJQUN4QixPQUFPLElBQUksR0FBR0EsTUFBTSxDQUFDdUYsUUFBUSxDQUFDLENBQUMsQ0FBQ1csS0FBSyxDQUFDLENBQUMsQ0FBQztFQUM1QztFQUVBLFNBQVN6QyxhQUFhQSxDQUFBLEVBQUc7SUFDckIsT0FBT3ZCLE9BQU8sYUFBQTVCLE1BQUEsQ0FBYU4sTUFBTSxlQUFZLENBQUMsQ0FDekNPLElBQUksQ0FBQyxVQUFBQyxHQUFHLEVBQUk7TUFFVCxJQUFJQSxHQUFHLENBQUN5RCxNQUFNLEVBQUU7UUFDWixJQUFHekQsR0FBRyxDQUFDeUQsTUFBTSxLQUFLakUsTUFBTSxFQUFDO1VBRXJCbUcsVUFBVSxDQUFDM0YsR0FBRyxDQUFDMEUsWUFBWSxDQUFDO1FBQ2hDO1FBRUF2RyxVQUFVLENBQUN5QyxPQUFPLENBQUMsVUFBQWdGLElBQUk7VUFBQSxPQUFJQSxJQUFJLENBQUN4RyxTQUFTLENBQUNDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFBQSxFQUFDO1FBQ3REaEIsWUFBWSxDQUFDdUMsT0FBTyxDQUFDLFVBQUFnRixJQUFJO1VBQUEsT0FBSUEsSUFBSSxDQUFDeEcsU0FBUyxDQUFDcUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUFBLEVBQUM7TUFDL0QsQ0FBQyxNQUFNO1FBQ0h0RCxVQUFVLENBQUN5QyxPQUFPLENBQUMsVUFBQWdGLElBQUk7VUFBQSxPQUFJQSxJQUFJLENBQUN4RyxTQUFTLENBQUNxQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQUEsRUFBQztRQUN6RHBELFlBQVksQ0FBQ3VDLE9BQU8sQ0FBQyxVQUFBZ0YsSUFBSTtVQUFBLE9BQUlBLElBQUksQ0FBQ3hHLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUFBLEVBQUM7TUFDNUQ7SUFDSixDQUFDLENBQUM7RUFDVjtFQUdBLFNBQVMrQyxrQkFBa0JBLENBQUEsRUFBRztJQUMxQixJQUFNeUQsT0FBTyxHQUFHNUgsUUFBUSxDQUFDQyxhQUFhLENBQUMsVUFBVSxDQUFDO0lBQ2xELElBQU00SCxPQUFPLEdBQUc3SCxRQUFRLENBQUNDLGFBQWEsQ0FBQyxVQUFVLENBQUM7SUFDbEQsSUFBTTZILFFBQVEsR0FBRzlILFFBQVEsQ0FBQ0MsYUFBYSw4QkFBOEIsQ0FBQztJQUN0RSxJQUFNOEgsT0FBTyxHQUFHL0gsUUFBUSxDQUFDQyxhQUFhLDZCQUE2QixDQUFDO0lBRXBFMkgsT0FBTyxDQUFDMUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQU07TUFDcEN0QixlQUFlLENBQUNDLE1BQU0sR0FBRyxDQUFDO01BQzFCK0gsT0FBTyxDQUFDekcsU0FBUyxDQUFDQyxHQUFHLENBQUMsVUFBVSxDQUFDO01BQ2pDd0csT0FBTyxDQUFDekcsU0FBUyxDQUFDQyxHQUFHLENBQUMsWUFBWSxDQUFDO01BQ25DeUcsT0FBTyxDQUFDMUcsU0FBUyxDQUFDcUMsTUFBTSxDQUFDLFlBQVksQ0FBQztNQUN0Q3FFLE9BQU8sQ0FBQzFHLFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQyxVQUFVLENBQUM7TUFDcENzRSxRQUFRLENBQUMzRyxTQUFTLENBQUNxQyxNQUFNLENBQUMsWUFBWSxDQUFDO01BQ3ZDdUUsT0FBTyxDQUFDNUcsU0FBUyxDQUFDcUMsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUUxQyxDQUFDLENBQUM7SUFFRnFFLE9BQU8sQ0FBQzNHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFNO01BQ3BDdEIsZUFBZSxDQUFDQyxNQUFNLEdBQUcsQ0FBQztNQUMxQmdJLE9BQU8sQ0FBQzFHLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLFVBQVUsQ0FBQztNQUNqQ3lHLE9BQU8sQ0FBQzFHLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLFlBQVksQ0FBQztNQUNuQ3dHLE9BQU8sQ0FBQ3pHLFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQyxZQUFZLENBQUM7TUFDdENvRSxPQUFPLENBQUN6RyxTQUFTLENBQUNxQyxNQUFNLENBQUMsVUFBVSxDQUFDO01BQ3BDc0UsUUFBUSxDQUFDM0csU0FBUyxDQUFDcUMsTUFBTSxDQUFDLFlBQVksQ0FBQztNQUN2Q3VFLE9BQU8sQ0FBQzVHLFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQyxZQUFZLENBQUM7SUFDMUMsQ0FBQyxDQUFDO0VBQ047RUFFQSxTQUFTWSxpQkFBaUJBLENBQUEsRUFBRztJQUN6QixJQUFNMEQsUUFBUSxHQUFHOUgsUUFBUSxDQUFDQyxhQUFhLDhCQUE4QixDQUFDO0lBQ3RFLElBQU04SCxPQUFPLEdBQUcvSCxRQUFRLENBQUNDLGFBQWEsNkJBQTZCLENBQUM7SUFDcEUsSUFBTStILFVBQVUsR0FBR2hJLFFBQVEsQ0FBQ0MsYUFBYSxxQkFBcUIsQ0FBQztJQUUvRDZILFFBQVEsQ0FBQzVHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFNO01BQ3JDdEIsZUFBZSxDQUFDRSxLQUFLLEdBQUdtSSxjQUFjLENBQUNySSxlQUFlLENBQUNFLEtBQUssR0FBRyxDQUFDLENBQUM7TUFDakVrSSxVQUFVLENBQUNqRixTQUFTLEdBQUdtRixZQUFZLENBQUN0SSxlQUFlLENBQUNFLEtBQUssQ0FBQztNQUMxRCxJQUFHRixlQUFlLENBQUNFLEtBQUssS0FBSyxDQUFDLEVBQUM7UUFDM0JrSSxVQUFVLENBQUM3RyxTQUFTLENBQUNDLEdBQUcsQ0FBQyxhQUFhLENBQUM7TUFDM0MsQ0FBQyxNQUFJO1FBQ0Q0RyxVQUFVLENBQUM3RyxTQUFTLENBQUNxQyxNQUFNLENBQUMsYUFBYSxDQUFDO01BQzlDO0lBQ0osQ0FBQyxDQUFDO0lBRUZ1RSxPQUFPLENBQUM3RyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBTTtNQUNwQ3RCLGVBQWUsQ0FBQ0UsS0FBSyxHQUFHbUksY0FBYyxDQUFDckksZUFBZSxDQUFDRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ2pFa0ksVUFBVSxDQUFDakYsU0FBUyxHQUFHbUYsWUFBWSxDQUFDdEksZUFBZSxDQUFDRSxLQUFLLENBQUM7TUFDMUQsSUFBR0YsZUFBZSxDQUFDRSxLQUFLLEtBQUssQ0FBQyxFQUFDO1FBQzNCa0ksVUFBVSxDQUFDN0csU0FBUyxDQUFDQyxHQUFHLENBQUMsYUFBYSxDQUFDO01BQzNDLENBQUMsTUFBSTtRQUNENEcsVUFBVSxDQUFDN0csU0FBUyxDQUFDcUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztNQUM5QztJQUNKLENBQUMsQ0FBQztFQUNOO0VBRUEsU0FBU3lFLGNBQWNBLENBQUNuSSxLQUFLLEVBQUU7SUFDM0IsSUFBSUEsS0FBSyxHQUFHLENBQUMsRUFBRTtNQUNYLE9BQU9BLEtBQUssR0FBR0gsYUFBYTtJQUNoQztJQUNBLElBQUlHLEtBQUssR0FBRyxFQUFFLEVBQUU7TUFDWixPQUFPQSxLQUFLLEdBQUdILGFBQWE7SUFDaEM7SUFDQSxPQUFPRyxLQUFLO0VBQ2hCO0VBR0EsU0FBU29JLFlBQVlBLENBQUNDLE1BQU0sRUFBRTtJQUMxQixPQUFPQSxNQUFNLEtBQUssQ0FBQyxHQUFHOUcscUJBQXFCLEdBQUc4RyxNQUFNO0VBQ3hEO0VBRUEsSUFBSUMsbUJBQW1CO0VBQ3ZCLFNBQVMvRCxpQkFBaUJBLENBQUEsRUFBRztJQUN6QnJFLFFBQVEsQ0FBQ2tCLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFDbUgsQ0FBQyxFQUFLO01BQ3RDLElBQUksQ0FBQyxDQUFDQSxDQUFDLENBQUNDLE1BQU0sQ0FBQ0MsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7UUFDdEMsSUFBSUgsbUJBQW1CLEVBQUU7VUFDckI7UUFDSjtRQUNBOUgsVUFBVSxDQUFDYSxTQUFTLENBQUNxQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ25DZ0YsVUFBVSxDQUFDLFlBQVc7VUFDbEJwSSxZQUFZLENBQUN1QyxPQUFPLENBQUMsVUFBQWdGLElBQUk7WUFBQSxPQUFJQSxJQUFJLENBQUN4RyxTQUFTLENBQUNxQyxNQUFNLENBQUMsU0FBUyxDQUFDO1VBQUEsRUFBQztRQUNsRSxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQ1JwRCxZQUFZLENBQUN1QyxPQUFPLENBQUMsVUFBQWdGLElBQUk7VUFBQSxPQUFJQSxJQUFJLENBQUN4RyxTQUFTLENBQUNDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFBQSxFQUFDO1FBQzNEZ0gsbUJBQW1CLEdBQUcsSUFBSTtRQUMxQi9ILGFBQWEsQ0FBQ2MsU0FBUyxDQUFDQyxHQUFHLENBQUMsY0FBYyxDQUFDO1FBQzNDcUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtVQUNaZ0YsTUFBTSxFQUFFLE1BQU07VUFDZEMsSUFBSSxFQUFFQyxJQUFJLENBQUNDLFNBQVMsQ0FBQztZQUNqQnBELE1BQU0sRUFBRWpFLE1BQU07WUFDZDFCLE1BQU0sRUFBRUQsZUFBZSxDQUFDQyxNQUFNO1lBQzlCQyxLQUFLLEVBQUVGLGVBQWUsQ0FBQ0U7VUFDM0IsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDZ0MsSUFBSSxDQUFDLFVBQUFDLEdBQUcsRUFBSTtVQUNYcUcsbUJBQW1CLEdBQUcsS0FBSztVQUMzQi9ILGFBQWEsQ0FBQ2MsU0FBUyxDQUFDcUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztVQUM5Q08sUUFBUSxDQUFDLENBQUM7UUFDZCxDQUFDLENBQUMsU0FBTSxDQUFDLFVBQUFzRSxDQUFDLEVBQUk7VUFDVkQsbUJBQW1CLEdBQUcsS0FBSztVQUMzQi9ILGFBQWEsQ0FBQ2MsU0FBUyxDQUFDcUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUNsRCxDQUFDLENBQUM7TUFDTjtJQUNKLENBQUMsQ0FBQztFQUNOO0VBR0E3QixnQkFBZ0IsQ0FBQyxDQUFDLENBQ2JHLElBQUksQ0FBQ29DLElBQUksQ0FBQztFQUVmLElBQUkyRSxRQUFRLEdBQUc3SSxRQUFRLENBQUNDLGFBQWEsQ0FBQyxZQUFZLENBQUM7RUFDbkR1SSxVQUFVLENBQUM7SUFBQSxPQUFNSyxRQUFRLENBQUMxSCxTQUFTLENBQUNDLEdBQUcsQ0FBQyxVQUFVLENBQUM7RUFBQSxHQUFFLElBQUksQ0FBQztFQUUxRCxJQUFNMEgsV0FBVyxHQUFHLElBQUlySixJQUFJLENBQUMsQ0FBQztFQUM5QixJQUFHcUosV0FBVyxJQUFJdEosY0FBYyxFQUFFO0lBQzlCWSxZQUFZLENBQUN1QyxPQUFPLENBQUMsVUFBQWdGLElBQUk7TUFBQSxPQUFJQSxJQUFJLENBQUN4RyxTQUFTLENBQUNDLEdBQUcsQ0FBQyxXQUFXLENBQUM7SUFBQSxFQUFDO0VBQ2pFO0VBRUEsU0FBU3NHLFVBQVVBLENBQUNxQixHQUFHLEVBQUM7SUFDcEIsSUFBTUMsT0FBTyxHQUFHaEosUUFBUSxDQUFDQyxhQUFhLENBQUMsbUJBQW1CLENBQUM7SUFDM0QsSUFBTWdKLE9BQU8sR0FBR2pKLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLHVCQUF1QixDQUFDO0lBQy9ELElBQU1pSixRQUFRLEdBQUdsSixRQUFRLENBQUNDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQztJQUNqRStJLE9BQU8sQ0FBQzdILFNBQVMsQ0FBQ3FDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEMsSUFBR3VGLEdBQUcsRUFBQztNQUNIRSxPQUFPLENBQUM5SCxTQUFTLENBQUNxQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ3BDLENBQUMsTUFBSTtNQUNEMEYsUUFBUSxDQUFDL0gsU0FBUyxDQUFDcUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNyQztFQUNKOztFQUdBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBOztFQUlBO0VBQ0EsSUFBTTJGLFFBQVEsR0FBR25KLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFlBQVksQ0FBQztFQUVyRGtKLFFBQVEsQ0FBQ2pJLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFLO0lBQ3BDbEIsUUFBUSxDQUFDMEksSUFBSSxDQUFDdkgsU0FBUyxDQUFDTyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzFDLENBQUMsQ0FBQztBQUVOLENBQUMsRUFBRSxDQUFDOztBQU1KO0FBQ0E7QUFDQTtBQUNBO0FDbmNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IFBST01PX0VORF9EQVRFID0gbmV3IERhdGUoJzIwMjMtMTItMjNUMTk6MDA6MDAuMDAwWicpOyAvLy0yIGhvdXJzXG4gICAgY29uc3QgYXBpVVJMID0gJ2h0dHBzOi8vZmF2LXByb20uY29tL2FwaV9wcmVkaWN0b3JfZmlnaHRfdWEnO1xuICAgIGNvbnN0IENIT0lDRVNfQ09VTlQgPSAxMztcbiAgICAvLyBsZXQgc2NvcmVQcmVkaWN0aW9uID0ge1xuICAgIC8vICAgICBzY29yZTogMFxuICAgIC8vIH1cbiAgICBsZXQgc2NvcmVQcmVkaWN0aW9uID0ge3BsYXllciA6IDEsIHNjb3JlOiAxfVxuXG5cbiAgICBjb25zdFxuICAgICAgICByZXN1bHRzVGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGFibGVSZXN1bHRzX19ib2R5JyksXG4gICAgICAgIHVuYXV0aE1zZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudW5hdXRoLW1zZycpLFxuICAgICAgICB5b3VBcmVJbkJ0bnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9vay1wYXJ0JyksXG4gICAgICAgIHByZWRpY3Rpb25CdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbkJ0bicpLFxuICAgICAgICB5b3VyQmV0VHh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWRpY3Rpb25fX3lvdXJCZXQnKTtcblxuICAgIGNvbnN0IGVuTGVuZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNockxlbmcnKTtcblxuICAgIC8vIGxldCBsb2NhbGUgPSAnZW4nO1xuXG4gICAgbGV0IGxvY2FsZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2xvY2FsZScpIHx8ICdlbic7XG5cbiAgICBmdW5jdGlvbiBzZXRTdGF0ZShuZXdMb2NhbGUpIHtcbiAgICAgICAgbG9jYWxlID0gbmV3TG9jYWxlO1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdsb2NhbGUnLCBsb2NhbGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0b2dnbGVTdGF0ZSgpIHtcbiAgICAgICAgY29uc3QgbmV3TG9jYWxlID0gbG9jYWxlID09PSAnZW4nID8gJ3VrJyA6ICdlbic7XG4gICAgICAgIHNldFN0YXRlKG5ld0xvY2FsZSk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgIH1cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZW4tYnRuJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHRvZ2dsZVN0YXRlKCk7XG5cbiAgICB9KTtcblxuICAgIGlmIChlbkxlbmcpIGxvY2FsZSA9ICdlbic7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZhdl9fcGFnZVwiKS5jbGFzc0xpc3QuYWRkKGxvY2FsZSlcblxuICAgIGNvbnN0IEpVREdFX0RFQ0lTSU9OX09QVElPTiA9IGxvY2FsZSA9PT0gJ3VrJyA/ICfQt9CwINGA0ZbRiNC10L3QvdGP0Lwg0YHRg9C00LTRltCyJyA6IGBBY2NvcmRpbmcgdG8gdGhlIGp1ZGdlcyBkZWNpc2lvbmA7XG5cblxuICAgIGxldCBpMThuRGF0YSA9IHt9O1xuICAgIGxldCB1c2VySWQgPSBOdW1iZXIoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnaWQnKSkgfHwgbnVsbDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYmV0VHJ1ZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT57XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2lkJywgMTAwMzYwMTMwKVxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICB9KVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYmV0RmFsc2VcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+e1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdpZCcsIDEwMDMwMDI2OClcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgfSlcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnVuQXV0aFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT57XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ2lkJylcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgfSlcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYnRuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PntcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWJ0bnNcIikuY2xhc3NMaXN0LnRvZ2dsZShcImhpZGVcIilcbiAgICB9KVxuICAgIC8vIHVzZXJJZCA9IDE0NTcwMjc7XG4gICAgLy8gdXNlcklkID0gMTAwMzAwMjY4XG4gICAgLy8gdXNlcklkID0gMTAwMzYwMTMwXG4gICAgZnVuY3Rpb24gbG9hZFRyYW5zbGF0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoKGAke2FwaVVSTH0vdHJhbnNsYXRlcy8ke2xvY2FsZX1gKS50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgICAgICAgICAgLnRoZW4oanNvbiA9PiB7XG4gICAgICAgICAgICAgICAgaTE4bkRhdGEgPSBqc29uO1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgdmFyIG11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJlZGljdG9yJyksIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBzdWJ0cmVlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGUoKSB7XG4gICAgICAgIGNvbnN0IGVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdHJhbnNsYXRlXScpXG4gICAgICAgIGlmIChlbGVtcyAmJiBlbGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGVsZW1zLmZvckVhY2goZWxlbSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtdHJhbnNsYXRlJyk7XG4gICAgICAgICAgICAgICAgZWxlbS5pbm5lckhUTUwgPSB0cmFuc2xhdGVLZXkoa2V5KTtcbiAgICAgICAgICAgICAgICBlbGVtLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS10cmFuc2xhdGUnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgcmVmcmVzaExvY2FsaXplZENsYXNzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlS2V5KGtleSkge1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpMThuRGF0YVtrZXldIHx8ICcqLS0tLU5FRUQgVE8gQkUgVFJBTlNMQVRFRC0tLS0qICAga2V5OiAgJyArIGtleTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWZyZXNoTG9jYWxpemVkQ2xhc3MoZWxlbWVudCwgYmFzZUNzc0NsYXNzKSB7XG4gICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3QgbGFuZyBvZiBbJ2hyJ10pIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShiYXNlQ3NzQ2xhc3MgKyBsYW5nKTtcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoYmFzZUNzc0NsYXNzICsgbG9jYWxlKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0ID0gZnVuY3Rpb24gKGxpbmssIGV4dHJhT3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZmV0Y2goYXBpVVJMICsgbGluaywge1xuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC4uLihleHRyYU9wdGlvbnMgfHwge30pXG4gICAgICAgIH0pLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VXNlcnMoKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KCcvdXNlcnMnKTtcbiAgICB9XG5cbiAgICBjb25zdCBJbml0UGFnZSA9ICgpID0+IHtcbiAgICAgICAgZ2V0VXNlcnMoKS50aGVuKHVzZXJzID0+IHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHVzZXJzKVxuICAgICAgICAgICAgcmVuZGVyVXNlcnModXNlcnMpO1xuICAgICAgICAgICAgdHJhbnNsYXRlKCk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAgICAgaW5pdFBsYXllclNlbGVjdG9yKCk7XG4gICAgICAgIGluaXRTY29yZVNlbGVjdG9yKCk7XG4gICAgICAgIGluaXRQcmVkaWN0aW9uQnRuKCk7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5zdG9yZSkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gd2luZG93LnN0b3JlLmdldFN0YXRlKCk7XG4gICAgICAgICAgICB1c2VySWQgPSBzdGF0ZS5hdXRoLmlzQXV0aG9yaXplZCAmJiBzdGF0ZS5hdXRoLmlkIHx8ICcnO1xuICAgICAgICAgICAgSW5pdFBhZ2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIEluaXRQYWdlKCk7XG4gICAgICAgICAgICBsZXQgYyA9IDA7XG4gICAgICAgICAgICB2YXIgaSA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoYyA8IDUwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghIXdpbmRvdy5nX3VzZXJfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZCA9IHdpbmRvdy5nX3VzZXJfaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBJbml0UGFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tVc2VyQXV0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoZWNrVXNlckF1dGgoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW5kZXJVc2Vycyh1c2Vycykge1xuICAgICAgICBwb3B1bGF0ZVVzZXJzVGFibGUodXNlcnMsIHVzZXJJZCwgcmVzdWx0c1RhYmxlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwb3B1bGF0ZVVzZXJzVGFibGUodXNlcnMsIGN1cnJlbnRVc2VySWQsIHRhYmxlKSB7XG4gICAgICAgIHRhYmxlLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh1c2VycylcbiAgICAgICAgaWYgKHVzZXJzICYmIHVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFVzZXIgPSB1c2VySWQgJiYgdXNlcnMuZmluZCh1c2VyID0+IHVzZXIudXNlcmlkID09PSBjdXJyZW50VXNlcklkKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50VXNlcikge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlVc2VyKGN1cnJlbnRVc2VyLCB0cnVlLCB0YWJsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVzZXJzLmZvckVhY2goKHVzZXIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodXNlci51c2VyaWQgIT09IGN1cnJlbnRVc2VySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheVVzZXIodXNlciwgZmFsc2UsIHRhYmxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpc3BsYXlVc2VyKHVzZXIsIGlzQ3VycmVudFVzZXIsIHRhYmxlKSB7XG4gICAgICAgIGNvbnN0IGFkZGl0aW9uYWxVc2VyUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGFkZGl0aW9uYWxVc2VyUm93LmNsYXNzTGlzdC5hZGQoJ3RhYmxlUmVzdWx0c19fcm93Jyk7XG4gICAgICAgIGlmIChpc0N1cnJlbnRVc2VyKSB7XG4gICAgICAgICAgICAvLyB1cGRhdGVMYXN0UHJlZGljdGlvbih1c2VyKTtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxVc2VyUm93LmNsYXNzTGlzdC5hZGQoJ3lvdScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29uc3QgdHJhbnNsYXRpb25LZXkgPSAnYm94ZXItJyArIHVzZXIucGxheWVyO1xuICAgICAgICAvLyBjb25zdCBwbGF5ZXIgPSB0cmFuc2xhdGVLZXkodHJhbnNsYXRpb25LZXkpO1xuICAgICAgICBjb25zdCBwcmVkaWN0aW9uID0gdXNlci50ZWFtID09PSAxMyA/IEpVREdFX0RFQ0lTSU9OX09QVElPTiA6IHVzZXIudGVhbSArICcgcnVuZGEnO1xuXG4gICAgICAgIGFkZGl0aW9uYWxVc2VyUm93LmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHt1c2VyLnVzZXJpZH0gJHtpc0N1cnJlbnRVc2VyID8gJzxzcGFuIGRhdGEtdHJhbnNsYXRlPVwieW91XCI+PC9zcGFuPicgOiAnJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHtmb3JtYXREYXRlU3RyaW5nKHVzZXIubGFzdEZvcmVjYXN0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHtwcmVkaWN0aW9ufTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhYmxlUmVzdWx0c19fYm9keS1jb2xcIj4qKioqKioqPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIGA7XG4gICAgICAgIHRhYmxlLmFwcGVuZChhZGRpdGlvbmFsVXNlclJvdyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlTGFzdFByZWRpY3Rpb24oZGF0YSkge1xuICAgICAgICBjb25zdCB0cmFuc2xhdGlvbktleSA9ICdib3hlci0nICsgZGF0YS5wbGF5ZXI7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IHRyYW5zbGF0ZUtleSh0cmFuc2xhdGlvbktleSk7XG4gICAgICAgIGNvbnN0IHByZWRpY3RlZFBsYXllckRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX19sYXN0LXRlYW0nKTtcbiAgICAgICAgcHJlZGljdGVkUGxheWVyRGl2LmlubmVySFRNTCA9IHBsYXllcjtcblxuICAgICAgICBjb25zdCBzY29yZURpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX19sYXN0LXNjb3JlJyk7XG4gICAgICAgIHNjb3JlRGl2LmlubmVySFRNTCA9IGRhdGEuc2NvcmUgPT0gMCA/IEpVREdFX0RFQ0lTSU9OX09QVElPTiA6IGA8c3BhbiBjbGFzcz1cInNjb3JlVGVhbTFcIj4ke2RhdGEuc2NvcmV9IDwvc3Bhbj5gICsgJ3J1bmRhJztcblxuICAgICAgICBjb25zdCBsYXN0UHJlZGljdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX19sYXN0Jyk7XG4gICAgICAgIGxhc3RQcmVkaWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcblxuICAgICAgICAvLyBjb25zdCBwcmVkaWN0aW9uU3RhdHVzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWRpY3Rpb25fX2JldCcpO1xuICAgICAgICAvLyBwcmVkaWN0aW9uU3RhdHVzRGl2LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKTtcblxuICAgICAgICBjb25zdCBwcmVkaWN0aW9uQ29uZmlybWVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX2JldC0ke2RhdGEuYmV0Q29uZmlybWVkIHx8IGZhbHNlfWApO1xuICAgICAgICBwcmVkaWN0aW9uQ29uZmlybWVkLmNsYXNzTGlzdC5hZGQoJ2JldFNjYWxlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm9ybWF0RGF0ZVN0cmluZyhkYXRlU3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShkYXRlU3RyaW5nKTtcblxuICAgICAgICBjb25zdCBkYXkgPSBkYXRlLmdldERhdGUoKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgIGNvbnN0IG1vbnRoID0gKGRhdGUuZ2V0TW9udGgoKSArIDEpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgY29uc3QgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgY29uc3QgaG91cnMgPSBkYXRlLmdldEhvdXJzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICBjb25zdCBtaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuXG4gICAgICAgIHJldHVybiBgJHtkYXl9LiR7bW9udGh9LiR7eWVhcn0gLyAke2hvdXJzfToke21pbnV0ZXN9YDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXNrVXNlcklkKHVzZXJJZCkge1xuICAgICAgICByZXR1cm4gXCIqKlwiICsgdXNlcklkLnRvU3RyaW5nKCkuc2xpY2UoMik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tVc2VyQXV0aCgpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QoYC9mYXZ1c2VyLyR7dXNlcklkfT9ub2NhY2hlPTFgKVxuICAgICAgICAgICAgLnRoZW4ocmVzID0+IHtcblxuICAgICAgICAgICAgICAgIGlmIChyZXMudXNlcmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHJlcy51c2VyaWQgPT09IHVzZXJJZCl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpcm1CZXQocmVzLmJldENvbmZpcm1lZClcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHVuYXV0aE1zZ3MuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZScpKTtcbiAgICAgICAgICAgICAgICAgICAgeW91QXJlSW5CdG5zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdW5hdXRoTXNncy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJykpO1xuICAgICAgICAgICAgICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnaGlkZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gaW5pdFBsYXllclNlbGVjdG9yKCkge1xuICAgICAgICBjb25zdCBwbGF5ZXIxID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBsYXllcjEnKTtcbiAgICAgICAgY29uc3QgcGxheWVyMiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wbGF5ZXIyJyk7XG4gICAgICAgIGNvbnN0IG1pbnVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLW1pbnVzYCk7XG4gICAgICAgIGNvbnN0IHBsdXNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fdGVhbS1idG4tcGx1c2ApO1xuXG4gICAgICAgIHBsYXllcjEuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBzY29yZVByZWRpY3Rpb24ucGxheWVyID0gMTtcbiAgICAgICAgICAgIHBsYXllcjEuY2xhc3NMaXN0LmFkZCgndGFrZVVzZXInKTtcbiAgICAgICAgICAgIHBsYXllcjEuY2xhc3NMaXN0LmFkZCgnYm94ZXJTY2FsZScpO1xuICAgICAgICAgICAgcGxheWVyMi5jbGFzc0xpc3QucmVtb3ZlKCdib3hlclNjYWxlJyk7XG4gICAgICAgICAgICBwbGF5ZXIyLmNsYXNzTGlzdC5yZW1vdmUoJ3Rha2VVc2VyJyk7XG4gICAgICAgICAgICBtaW51c0J0bi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlQnRuJyk7XG4gICAgICAgICAgICBwbHVzQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVCdG4nKTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBwbGF5ZXIyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgc2NvcmVQcmVkaWN0aW9uLnBsYXllciA9IDI7XG4gICAgICAgICAgICBwbGF5ZXIyLmNsYXNzTGlzdC5hZGQoJ3Rha2VVc2VyJyk7XG4gICAgICAgICAgICBwbGF5ZXIyLmNsYXNzTGlzdC5hZGQoJ2JveGVyU2NhbGUnKTtcbiAgICAgICAgICAgIHBsYXllcjEuY2xhc3NMaXN0LnJlbW92ZSgnYm94ZXJTY2FsZScpO1xuICAgICAgICAgICAgcGxheWVyMS5jbGFzc0xpc3QucmVtb3ZlKCd0YWtlVXNlcicpO1xuICAgICAgICAgICAgbWludXNCdG4uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZUJ0bicpO1xuICAgICAgICAgICAgcGx1c0J0bi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlQnRuJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRTY29yZVNlbGVjdG9yKCkge1xuICAgICAgICBjb25zdCBtaW51c0J0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX190ZWFtLWJ0bi1taW51c2ApO1xuICAgICAgICBjb25zdCBwbHVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLXBsdXNgKTtcbiAgICAgICAgY29uc3Qgc2NvcmVQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX19zY29yZWApO1xuXG4gICAgICAgIG1pbnVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgc2NvcmVQcmVkaWN0aW9uLnNjb3JlID0gbm9ybWFsaXplU2NvcmUoc2NvcmVQcmVkaWN0aW9uLnNjb3JlIC0gMSk7XG4gICAgICAgICAgICBzY29yZVBhbmVsLmlubmVySFRNTCA9IGRpc3BsYXlSb3VuZChzY29yZVByZWRpY3Rpb24uc2NvcmUpO1xuICAgICAgICAgICAgaWYoc2NvcmVQcmVkaWN0aW9uLnNjb3JlID09PSAwKXtcbiAgICAgICAgICAgICAgICBzY29yZVBhbmVsLmNsYXNzTGlzdC5hZGQoXCJzbWFsbC1zY29yZVwiKVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKFwic21hbGwtc2NvcmVcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcGx1c0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHNjb3JlUHJlZGljdGlvbi5zY29yZSA9IG5vcm1hbGl6ZVNjb3JlKHNjb3JlUHJlZGljdGlvbi5zY29yZSArIDEpO1xuICAgICAgICAgICAgc2NvcmVQYW5lbC5pbm5lckhUTUwgPSBkaXNwbGF5Um91bmQoc2NvcmVQcmVkaWN0aW9uLnNjb3JlKTtcbiAgICAgICAgICAgIGlmKHNjb3JlUHJlZGljdGlvbi5zY29yZSA9PT0gMCl7XG4gICAgICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QuYWRkKFwic21hbGwtc2NvcmVcIilcbiAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHNjb3JlUGFuZWwuY2xhc3NMaXN0LnJlbW92ZShcInNtYWxsLXNjb3JlXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB7XG4gICAgICAgIGlmIChzY29yZSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiBzY29yZSArIENIT0lDRVNfQ09VTlQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3JlID4gMTIpIHtcbiAgICAgICAgICAgIHJldHVybiBzY29yZSAtIENIT0lDRVNfQ09VTlQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNjb3JlO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZGlzcGxheVJvdW5kKGNob2ljZSkge1xuICAgICAgICByZXR1cm4gY2hvaWNlID09PSAwID8gSlVER0VfREVDSVNJT05fT1BUSU9OIDogY2hvaWNlO1xuICAgIH1cblxuICAgIGxldCBpc1JlcXVlc3RJblByb2dyZXNzO1xuICAgIGZ1bmN0aW9uIGluaXRQcmVkaWN0aW9uQnRuKCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoISFlLnRhcmdldC5jbG9zZXN0KCcucHJlZGljdGlvbkJ0bicpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzUmVxdWVzdEluUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHlvdXJCZXRUeHQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgeW91QXJlSW5CdG5zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3dCdG4nKSk7XG4gICAgICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgICAgICAgICAgeW91QXJlSW5CdG5zLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5hZGQoJ3Nob3dCdG4nKSk7XG4gICAgICAgICAgICAgICAgaXNSZXF1ZXN0SW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgcHJlZGljdGlvbkJ0bi5jbGFzc0xpc3QuYWRkKFwicG9pbnRlci1ub25lXCIpO1xuICAgICAgICAgICAgICAgIHJlcXVlc3QoJy9iZXQnLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyaWQ6IHVzZXJJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllcjogc2NvcmVQcmVkaWN0aW9uLnBsYXllcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3JlOiBzY29yZVByZWRpY3Rpb24uc2NvcmVcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KS50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlzUmVxdWVzdEluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcHJlZGljdGlvbkJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwicG9pbnRlci1ub25lXCIpO1xuICAgICAgICAgICAgICAgICAgICBJbml0UGFnZSgpO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpc1JlcXVlc3RJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHByZWRpY3Rpb25CdG4uY2xhc3NMaXN0LnJlbW92ZShcInBvaW50ZXItbm9uZVwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBsb2FkVHJhbnNsYXRpb25zKClcbiAgICAgICAgLnRoZW4oaW5pdCk7XG5cbiAgICBsZXQgbWFpblBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZmF2X19wYWdlJyk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBtYWluUGFnZS5jbGFzc0xpc3QuYWRkKCdvdmVyZmxvdycpLCAxMDAwKTtcblxuICAgIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcbiAgICBpZihjdXJyZW50RGF0ZSA+PSBQUk9NT19FTkRfREFURSkge1xuICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnYmxvY2stYnRuJykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbmZpcm1CZXQoYmV0KXtcbiAgICAgICAgY29uc3QgYmV0V3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucHJlZGljdGlvbl9fbGFzdFwiKVxuICAgICAgICBjb25zdCBiZXRUcnVlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wcmVkaWN0aW9uX19iZXQtdHJ1ZVwiKVxuICAgICAgICBjb25zdCBiZXRGYWxzZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucHJlZGljdGlvbl9fYmV0LWZhbHNlXCIpXG4gICAgICAgIGJldFdyYXAuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIilcbiAgICAgICAgaWYoYmV0KXtcbiAgICAgICAgICAgIGJldFRydWUuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIilcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBiZXRGYWxzZS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gZnVuY3Rpb24gZGlzcGxheVJvdW5kKGNob2ljZSkge1xuICAgIC8vICAgICByZXR1cm4gY2hvaWNlID09PSAwID8gSlVER0VfREVDSVNJT05fT1BUSU9OIDogY2hvaWNlO1xuICAgIC8vIH1cbiAgICAvL1xuICAgIC8vIGZ1bmN0aW9uIG5vcm1hbGl6ZVNjb3JlKHNjb3JlKSB7XG4gICAgLy8gICAgIGlmIChzY29yZSA8IDApIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBzY29yZSArIENIT0lDRVNfQ09VTlQ7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgaWYgKHNjb3JlID4gMTIpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiBzY29yZSAtIENIT0lDRVNfQ09VTlQ7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgcmV0dXJuIHNjb3JlO1xuICAgIC8vIH1cbiAgICAvLyBmdW5jdGlvbiBpbml0U2NvcmVTZWxlY3RvcigpIHtcbiAgICAvLyAgICAgY29uc3QgbWludXNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fdGVhbS1idG4tbWludXNgKTtcbiAgICAvLyAgICAgY29uc3QgcGx1c0J0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX190ZWFtLWJ0bi1wbHVzYCk7XG4gICAgLy8gICAgIGNvbnN0IHNjb3JlUGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fc2NvcmVgKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vICAgICBtaW51c0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyAgICAgICAgIHNjb3JlUHJlZGljdGlvbi5zY29yZSA9IG5vcm1hbGl6ZVNjb3JlKHNjb3JlUHJlZGljdGlvbi5zY29yZSAtIDEpO1xuICAgIC8vICAgICAgICAgc2NvcmVQYW5lbC5pbm5lckhUTUwgPSBkaXNwbGF5Um91bmQoc2NvcmVQcmVkaWN0aW9uLnNjb3JlKTtcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKHNjb3JlUHJlZGljdGlvbi5zY29yZSlcbiAgICAvLyAgICAgICAgIGlmKHNjb3JlUHJlZGljdGlvbi5zY29yZSA9PT0gMCl7XG4gICAgLy8gICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QuYWRkKFwic21hbGwtc2NvcmVcIilcbiAgICAvLyAgICAgICAgIH1lbHNle1xuICAgIC8vICAgICAgICAgICAgIHNjb3JlUGFuZWwuY2xhc3NMaXN0LnJlbW92ZShcInNtYWxsLXNjb3JlXCIpXG4gICAgLy8gICAgICAgICB9XG4gICAgLy9cbiAgICAvLyAgICAgfSk7XG4gICAgLy9cbiAgICAvLyAgICAgcGx1c0J0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAvLyAgICAgICAgIHNjb3JlUHJlZGljdGlvbi5zY29yZSA9IG5vcm1hbGl6ZVNjb3JlKHNjb3JlUHJlZGljdGlvbi5zY29yZSArIDEpO1xuICAgIC8vICAgICAgICAgc2NvcmVQYW5lbC5pbm5lckhUTUwgPSBkaXNwbGF5Um91bmQoc2NvcmVQcmVkaWN0aW9uLnNjb3JlKTtcbiAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKHNjb3JlUHJlZGljdGlvbi5zY29yZSlcbiAgICAvLyAgICAgICAgIGlmKHNjb3JlUHJlZGljdGlvbi5zY29yZSA9PT0gMCl7XG4gICAgLy8gICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QuYWRkKFwic21hbGwtc2NvcmVcIilcbiAgICAvLyAgICAgICAgIH1lbHNle1xuICAgIC8vICAgICAgICAgICAgIHNjb3JlUGFuZWwuY2xhc3NMaXN0LnJlbW92ZShcInNtYWxsLXNjb3JlXCIpXG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cblxuXG5cbiAgICAvLyBmb3IgdGVzdFxuICAgIGNvbnN0IGJsYWNrQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5ibGFjay1idG5cIilcblxuICAgIGJsYWNrQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PntcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKFwiZGFya1wiKVxuICAgIH0pXG5cbn0pKCk7XG5cblxuXG5cblxuLy8gZnVuY3Rpb24gaW5pdCgpIHtcbi8vICAgICAgICA7XG4vLyB9XG4vLyBpbml0KCkiLCIiXX0=
