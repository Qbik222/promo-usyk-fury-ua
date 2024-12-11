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
  console.log(userId);
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
    var prediction = user.team === 13 ? JUDGE_DECISION_OPTION : user.team + " <span data-translate=\"round\" class=\"table-round\"></span>";

    // console.log(user.team)

    additionalUserRow.innerHTML = "\n                        <div class=\"tableResults__body-col\">".concat(user.userid, " ").concat(isCurrentUser ? '<span data-translate="you"></span>' : '', "</div>\n                        <div class=\"tableResults__body-col\">").concat(formatDateString(user.lastForecast), "</div>\n                        <div class=\"tableResults__body-col\">").concat(prediction, " </div>\n                        <div class=\"tableResults__body-col\">*******</div>\n                    ");
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
        console.log(userId === res.userid);
        if (res.userid == userId) {
          confirmBet(res.betConfirmed);
          lastPredict(res.team);
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
    // console.log(betWrap)

    if (bet) {
      betTrue.classList.remove("hide");
    } else {
      betFalse.classList.remove("hide");
    }
  }
  function lastPredict(predict) {
    var predictWrap = document.querySelector(".prediction__last-txt");
    console.log(predictWrap.textContent);
    var newText = "".concat(predictWrap.textContent + "<br>" + predict + '<span data-translate="round" class="table-round"></span>');
    console.log(newText);
    var text = "".concat(predict === 13 ? predictWrap.textContent + "<br>" + JUDGE_DECISION_OPTION : newText);
    predictWrap.innerHTML = text;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJzZWNvbmQuanMiXSwibmFtZXMiOlsiUFJPTU9fRU5EX0RBVEUiLCJEYXRlIiwiYXBpVVJMIiwiQ0hPSUNFU19DT1VOVCIsInNjb3JlUHJlZGljdGlvbiIsInBsYXllciIsInNjb3JlIiwicmVzdWx0c1RhYmxlIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwidW5hdXRoTXNncyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJ5b3VBcmVJbkJ0bnMiLCJwcmVkaWN0aW9uQnRuIiwieW91ckJldFR4dCIsImVuTGVuZyIsImxvY2FsZSIsInNlc3Npb25TdG9yYWdlIiwiZ2V0SXRlbSIsInNldFN0YXRlIiwibmV3TG9jYWxlIiwic2V0SXRlbSIsInRvZ2dsZVN0YXRlIiwid2luZG93IiwibG9jYXRpb24iLCJyZWxvYWQiLCJhZGRFdmVudExpc3RlbmVyIiwiY2xhc3NMaXN0IiwiYWRkIiwiSlVER0VfREVDSVNJT05fT1BUSU9OIiwiaTE4bkRhdGEiLCJ1c2VySWQiLCJOdW1iZXIiLCJjb25zb2xlIiwibG9nIiwicmVtb3ZlSXRlbSIsInRvZ2dsZSIsImxvYWRUcmFuc2xhdGlvbnMiLCJmZXRjaCIsImNvbmNhdCIsInRoZW4iLCJyZXMiLCJqc29uIiwidHJhbnNsYXRlIiwibXV0YXRpb25PYnNlcnZlciIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJtdXRhdGlvbnMiLCJvYnNlcnZlIiwiZ2V0RWxlbWVudEJ5SWQiLCJjaGlsZExpc3QiLCJzdWJ0cmVlIiwiZWxlbXMiLCJsZW5ndGgiLCJmb3JFYWNoIiwiZWxlbSIsImtleSIsImdldEF0dHJpYnV0ZSIsImlubmVySFRNTCIsInRyYW5zbGF0ZUtleSIsInJlbW92ZUF0dHJpYnV0ZSIsInJlZnJlc2hMb2NhbGl6ZWRDbGFzcyIsImVsZW1lbnQiLCJiYXNlQ3NzQ2xhc3MiLCJfaSIsIl9hcnIiLCJsYW5nIiwicmVtb3ZlIiwicmVxdWVzdCIsImxpbmsiLCJleHRyYU9wdGlvbnMiLCJfb2JqZWN0U3ByZWFkIiwiaGVhZGVycyIsImdldFVzZXJzIiwiSW5pdFBhZ2UiLCJ1c2VycyIsInJlbmRlclVzZXJzIiwiaW5pdCIsImluaXRQbGF5ZXJTZWxlY3RvciIsImluaXRTY29yZVNlbGVjdG9yIiwiaW5pdFByZWRpY3Rpb25CdG4iLCJzdG9yZSIsInN0YXRlIiwiZ2V0U3RhdGUiLCJhdXRoIiwiaXNBdXRob3JpemVkIiwiaWQiLCJjIiwiaSIsInNldEludGVydmFsIiwiZ191c2VyX2lkIiwiY2hlY2tVc2VyQXV0aCIsImNsZWFySW50ZXJ2YWwiLCJwb3B1bGF0ZVVzZXJzVGFibGUiLCJjdXJyZW50VXNlcklkIiwidGFibGUiLCJjdXJyZW50VXNlciIsImZpbmQiLCJ1c2VyIiwidXNlcmlkIiwiZGlzcGxheVVzZXIiLCJpc0N1cnJlbnRVc2VyIiwiYWRkaXRpb25hbFVzZXJSb3ciLCJjcmVhdGVFbGVtZW50IiwicHJlZGljdGlvbiIsInRlYW0iLCJmb3JtYXREYXRlU3RyaW5nIiwibGFzdEZvcmVjYXN0IiwiYXBwZW5kIiwidXBkYXRlTGFzdFByZWRpY3Rpb24iLCJkYXRhIiwidHJhbnNsYXRpb25LZXkiLCJwcmVkaWN0ZWRQbGF5ZXJEaXYiLCJzY29yZURpdiIsImxhc3RQcmVkaWN0aW9uIiwicHJlZGljdGlvbkNvbmZpcm1lZCIsImJldENvbmZpcm1lZCIsImRhdGVTdHJpbmciLCJkYXRlIiwiZGF5IiwiZ2V0RGF0ZSIsInRvU3RyaW5nIiwicGFkU3RhcnQiLCJtb250aCIsImdldE1vbnRoIiwieWVhciIsImdldEZ1bGxZZWFyIiwiaG91cnMiLCJnZXRIb3VycyIsIm1pbnV0ZXMiLCJnZXRNaW51dGVzIiwibWFza1VzZXJJZCIsInNsaWNlIiwiY29uZmlybUJldCIsImxhc3RQcmVkaWN0IiwiaXRlbSIsInBsYXllcjEiLCJwbGF5ZXIyIiwibWludXNCdG4iLCJwbHVzQnRuIiwic2NvcmVQYW5lbCIsIm5vcm1hbGl6ZVNjb3JlIiwiZGlzcGxheVJvdW5kIiwiY2hvaWNlIiwiaXNSZXF1ZXN0SW5Qcm9ncmVzcyIsImUiLCJ0YXJnZXQiLCJjbG9zZXN0Iiwic2V0VGltZW91dCIsIm1ldGhvZCIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwibWFpblBhZ2UiLCJjdXJyZW50RGF0ZSIsImJldCIsImJldFdyYXAiLCJiZXRUcnVlIiwiYmV0RmFsc2UiLCJwcmVkaWN0IiwicHJlZGljdFdyYXAiLCJ0ZXh0Q29udGVudCIsIm5ld1RleHQiLCJ0ZXh0IiwiYmxhY2tCdG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsQ0FBQyxZQUFZO0VBQ1QsSUFBTUEsY0FBYyxHQUFHLElBQUlDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7RUFDN0QsSUFBTUMsTUFBTSxHQUFHLDZDQUE2QztFQUM1RCxJQUFNQyxhQUFhLEdBQUcsRUFBRTtFQUN4QjtFQUNBO0VBQ0E7RUFDQSxJQUFJQyxlQUFlLEdBQUc7SUFBQ0MsTUFBTSxFQUFHLENBQUM7SUFBRUMsS0FBSyxFQUFFO0VBQUMsQ0FBQztFQUc1QyxJQUNJQyxZQUFZLEdBQUdDLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLHFCQUFxQixDQUFDO0lBQzVEQyxVQUFVLEdBQUdGLFFBQVEsQ0FBQ0csZ0JBQWdCLENBQUMsYUFBYSxDQUFDO0lBQ3JEQyxZQUFZLEdBQUdKLFFBQVEsQ0FBQ0csZ0JBQWdCLENBQUMsWUFBWSxDQUFDO0lBQ3RERSxhQUFhLEdBQUdMLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLGdCQUFnQixDQUFDO0lBQ3hESyxVQUFVLEdBQUdOLFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLHNCQUFzQixDQUFDO0VBRS9ELElBQU1NLE1BQU0sR0FBR1AsUUFBUSxDQUFDQyxhQUFhLENBQUMsU0FBUyxDQUFDOztFQUVoRDs7RUFFQSxJQUFJTyxNQUFNLEdBQUdDLGNBQWMsQ0FBQ0MsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUk7RUFFckQsU0FBU0MsUUFBUUEsQ0FBQ0MsU0FBUyxFQUFFO0lBQ3pCSixNQUFNLEdBQUdJLFNBQVM7SUFDbEJILGNBQWMsQ0FBQ0ksT0FBTyxDQUFD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Uk9NT19FTkRfREFURSA9IG5ldyBEYXRlKCcyMDIzLTEyLTIzVDE5OjAwOjAwLjAwMFonKTsgLy8tMiBob3Vyc1xuICAgIGNvbnN0IGFwaVVSTCA9ICdodHRwczovL2Zhdi1wcm9tLmNvbS9hcGlfcHJlZGljdG9yX2ZpZ2h0X3VhJztcbiAgICBjb25zdCBDSE9JQ0VTX0NPVU5UID0gMTM7XG4gICAgLy8gbGV0IHNjb3JlUHJlZGljdGlvbiA9IHtcbiAgICAvLyAgICAgc2NvcmU6IDBcbiAgICAvLyB9XG4gICAgbGV0IHNjb3JlUHJlZGljdGlvbiA9IHtwbGF5ZXIgOiAxLCBzY29yZTogMX1cblxuXG4gICAgY29uc3RcbiAgICAgICAgcmVzdWx0c1RhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRhYmxlUmVzdWx0c19fYm9keScpLFxuICAgICAgICB1bmF1dGhNc2dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnVuYXV0aC1tc2cnKSxcbiAgICAgICAgeW91QXJlSW5CdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRvb2stcGFydCcpLFxuICAgICAgICBwcmVkaWN0aW9uQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWRpY3Rpb25CdG4nKSxcbiAgICAgICAgeW91ckJldFR4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX195b3VyQmV0Jyk7XG5cbiAgICBjb25zdCBlbkxlbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaHJMZW5nJyk7XG5cbiAgICAvLyBsZXQgbG9jYWxlID0gJ2VuJztcblxuICAgIGxldCBsb2NhbGUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdsb2NhbGUnKSB8fCAnZW4nO1xuXG4gICAgZnVuY3Rpb24gc2V0U3RhdGUobmV3TG9jYWxlKSB7XG4gICAgICAgIGxvY2FsZSA9IG5ld0xvY2FsZTtcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnbG9jYWxlJywgbG9jYWxlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9nZ2xlU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IG5ld0xvY2FsZSA9IGxvY2FsZSA9PT0gJ2VuJyA/ICd1aycgOiAnZW4nO1xuICAgICAgICBzZXRTdGF0ZShuZXdMb2NhbGUpO1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICB9XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmVuLWJ0bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB0b2dnbGVTdGF0ZSgpO1xuXG4gICAgfSk7XG5cbiAgICBpZiAoZW5MZW5nKSBsb2NhbGUgPSAnZW4nO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mYXZfX3BhZ2VcIikuY2xhc3NMaXN0LmFkZChsb2NhbGUpXG5cbiAgICBjb25zdCBKVURHRV9ERUNJU0lPTl9PUFRJT04gPSBsb2NhbGUgPT09ICd1aycgPyAn0LfQsCDRgNGW0YjQtdC90L3Rj9C8INGB0YPQtNC00ZbQsicgOiBgQWNjb3JkaW5nIHRvIHRoZSBqdWRnZXMgZGVjaXNpb25gO1xuXG5cbiAgICBsZXQgaTE4bkRhdGEgPSB7fTtcbiAgICBsZXQgdXNlcklkID0gTnVtYmVyKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2lkJykpIHx8IG51bGw7XG4gICAgY29uc29sZS5sb2codXNlcklkKVxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5iZXRUcnVlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PntcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnaWQnLCAxMDAzNjAxMzApXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgIH0pXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5iZXRGYWxzZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT57XG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2lkJywgMTAwMzAwMjY4KVxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICB9KVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudW5BdXRoXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PntcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnaWQnKVxuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICB9KVxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1idG5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+e1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYnRuc1wiKS5jbGFzc0xpc3QudG9nZ2xlKFwiaGlkZVwiKVxuICAgIH0pXG4gICAgLy8gdXNlcklkID0gMTQ1NzAyNztcbiAgICAvLyB1c2VySWQgPSAxMDAzMDAyNjhcbiAgICAvLyB1c2VySWQgPSAxMDAzNjAxMzBcbiAgICBmdW5jdGlvbiBsb2FkVHJhbnNsYXRpb25zKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2goYCR7YXBpVVJMfS90cmFuc2xhdGVzLyR7bG9jYWxlfWApLnRoZW4ocmVzID0+IHJlcy5qc29uKCkpXG4gICAgICAgICAgICAudGhlbihqc29uID0+IHtcbiAgICAgICAgICAgICAgICBpMThuRGF0YSA9IGpzb247XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlKCk7XG5cbiAgICAgICAgICAgICAgICB2YXIgbXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uIChtdXRhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbXV0YXRpb25PYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcmVkaWN0b3InKSwge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHN1YnRyZWU6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZSgpIHtcbiAgICAgICAgY29uc3QgZWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS10cmFuc2xhdGVdJylcbiAgICAgICAgaWYgKGVsZW1zICYmIGVsZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZWxlbXMuZm9yRWFjaChlbGVtID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBlbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS10cmFuc2xhdGUnKTtcbiAgICAgICAgICAgICAgICBlbGVtLmlubmVySFRNTCA9IHRyYW5zbGF0ZUtleShrZXkpO1xuICAgICAgICAgICAgICAgIGVsZW0ucmVtb3ZlQXR0cmlidXRlKCdkYXRhLXRyYW5zbGF0ZScpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICByZWZyZXNoTG9jYWxpemVkQ2xhc3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2xhdGVLZXkoa2V5KSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGkxOG5EYXRhW2tleV0gfHwgJyotLS0tTkVFRCBUTyBCRSBUUkFOU0xBVEVELS0tLSogICBrZXk6ICAnICsga2V5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlZnJlc2hMb2NhbGl6ZWRDbGFzcyhlbGVtZW50LCBiYXNlQ3NzQ2xhc3MpIHtcbiAgICAgICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBsYW5nIG9mIFsnaHInXSkge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGJhc2VDc3NDbGFzcyArIGxhbmcpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChiYXNlQ3NzQ2xhc3MgKyBsb2NhbGUpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3QgPSBmdW5jdGlvbiAobGluaywgZXh0cmFPcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBmZXRjaChhcGlVUkwgKyBsaW5rLCB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLi4uKGV4dHJhT3B0aW9ucyB8fCB7fSlcbiAgICAgICAgfSkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRVc2VycygpIHtcbiAgICAgICAgcmV0dXJuIHJlcXVlc3QoJy91c2VycycpO1xuICAgIH1cblxuICAgIGNvbnN0IEluaXRQYWdlID0gKCkgPT4ge1xuICAgICAgICBnZXRVc2VycygpLnRoZW4odXNlcnMgPT4ge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codXNlcnMpXG4gICAgICAgICAgICByZW5kZXJVc2Vycyh1c2Vycyk7XG4gICAgICAgICAgICB0cmFuc2xhdGUoKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICBpbml0UGxheWVyU2VsZWN0b3IoKTtcbiAgICAgICAgaW5pdFNjb3JlU2VsZWN0b3IoKTtcbiAgICAgICAgaW5pdFByZWRpY3Rpb25CdG4oKTtcblxuICAgICAgICBpZiAod2luZG93LnN0b3JlKSB7XG4gICAgICAgICAgICB2YXIgc3RhdGUgPSB3aW5kb3cuc3RvcmUuZ2V0U3RhdGUoKTtcbiAgICAgICAgICAgIHVzZXJJZCA9IHN0YXRlLmF1dGguaXNBdXRob3JpemVkICYmIHN0YXRlLmF1dGguaWQgfHwgJyc7XG4gICAgICAgICAgICBJbml0UGFnZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgSW5pdFBhZ2UoKTtcbiAgICAgICAgICAgIGxldCBjID0gMDtcbiAgICAgICAgICAgIHZhciBpID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChjIDwgNTApIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhd2luZG93LmdfdXNlcl9pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklkID0gd2luZG93LmdfdXNlcl9pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIEluaXRQYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja1VzZXJBdXRoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAyMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hlY2tVc2VyQXV0aCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlclVzZXJzKHVzZXJzKSB7XG4gICAgICAgIHBvcHVsYXRlVXNlcnNUYWJsZSh1c2VycywgdXNlcklkLCByZXN1bHRzVGFibGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvcHVsYXRlVXNlcnNUYWJsZSh1c2VycywgY3VycmVudFVzZXJJZCwgdGFibGUpIHtcbiAgICAgICAgdGFibGUuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHVzZXJzKVxuICAgICAgICBpZiAodXNlcnMgJiYgdXNlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VXNlciA9IHVzZXJJZCAmJiB1c2Vycy5maW5kKHVzZXIgPT4gdXNlci51c2VyaWQgPT09IGN1cnJlbnRVc2VySWQpO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRVc2VyKSB7XG4gICAgICAgICAgICAgICAgZGlzcGxheVVzZXIoY3VycmVudFVzZXIsIHRydWUsIHRhYmxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdXNlcnMuZm9yRWFjaCgodXNlcikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh1c2VyLnVzZXJpZCAhPT0gY3VycmVudFVzZXJJZCkge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5VXNlcih1c2VyLCBmYWxzZSwgdGFibGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzcGxheVVzZXIodXNlciwgaXNDdXJyZW50VXNlciwgdGFibGUpIHtcbiAgICAgICAgY29uc3QgYWRkaXRpb25hbFVzZXJSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgYWRkaXRpb25hbFVzZXJSb3cuY2xhc3NMaXN0LmFkZCgndGFibGVSZXN1bHRzX19yb3cnKTtcbiAgICAgICAgaWYgKGlzQ3VycmVudFVzZXIpIHtcbiAgICAgICAgICAgIC8vIHVwZGF0ZUxhc3RQcmVkaWN0aW9uKHVzZXIpO1xuICAgICAgICAgICAgYWRkaXRpb25hbFVzZXJSb3cuY2xhc3NMaXN0LmFkZCgneW91Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb25zdCB0cmFuc2xhdGlvbktleSA9ICdib3hlci0nICsgdXNlci5wbGF5ZXI7XG4gICAgICAgIC8vIGNvbnN0IHBsYXllciA9IHRyYW5zbGF0ZUtleSh0cmFuc2xhdGlvbktleSk7XG4gICAgICAgIGNvbnN0IHByZWRpY3Rpb24gPSB1c2VyLnRlYW0gPT09IDEzID8gSlVER0VfREVDSVNJT05fT1BUSU9OIDogdXNlci50ZWFtICsgYCA8c3BhbiBkYXRhLXRyYW5zbGF0ZT1cInJvdW5kXCIgY2xhc3M9XCJ0YWJsZS1yb3VuZFwiPjwvc3Bhbj5gO1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHVzZXIudGVhbSlcblxuXG4gICAgICAgIGFkZGl0aW9uYWxVc2VyUm93LmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHt1c2VyLnVzZXJpZH0gJHtpc0N1cnJlbnRVc2VyID8gJzxzcGFuIGRhdGEtdHJhbnNsYXRlPVwieW91XCI+PC9zcGFuPicgOiAnJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHtmb3JtYXREYXRlU3RyaW5nKHVzZXIubGFzdEZvcmVjYXN0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHtwcmVkaWN0aW9ufSA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+KioqKioqKjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICB0YWJsZS5hcHBlbmQoYWRkaXRpb25hbFVzZXJSb3cpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUxhc3RQcmVkaWN0aW9uKGRhdGEpIHtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb25LZXkgPSAnYm94ZXItJyArIGRhdGEucGxheWVyO1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSB0cmFuc2xhdGVLZXkodHJhbnNsYXRpb25LZXkpO1xuICAgICAgICBjb25zdCBwcmVkaWN0ZWRQbGF5ZXJEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9fbGFzdC10ZWFtJyk7XG4gICAgICAgIHByZWRpY3RlZFBsYXllckRpdi5pbm5lckhUTUwgPSBwbGF5ZXI7XG5cbiAgICAgICAgY29uc3Qgc2NvcmVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9fbGFzdC1zY29yZScpO1xuICAgICAgICBzY29yZURpdi5pbm5lckhUTUwgPSBkYXRhLnNjb3JlID09IDAgPyBKVURHRV9ERUNJU0lPTl9PUFRJT04gOiBgPHNwYW4gY2xhc3M9XCJzY29yZVRlYW0xXCI+JHtkYXRhLnNjb3JlfSA8L3NwYW4+YCArICdydW5kYSc7XG5cbiAgICAgICAgY29uc3QgbGFzdFByZWRpY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9fbGFzdCcpO1xuICAgICAgICBsYXN0UHJlZGljdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG5cbiAgICAgICAgLy8gY29uc3QgcHJlZGljdGlvblN0YXR1c0RpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX19iZXQnKTtcbiAgICAgICAgLy8gcHJlZGljdGlvblN0YXR1c0Rpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG5cbiAgICAgICAgY29uc3QgcHJlZGljdGlvbkNvbmZpcm1lZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX19iZXQtJHtkYXRhLmJldENvbmZpcm1lZCB8fCBmYWxzZX1gKTtcbiAgICAgICAgcHJlZGljdGlvbkNvbmZpcm1lZC5jbGFzc0xpc3QuYWRkKCdiZXRTY2FsZScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdERhdGVTdHJpbmcoZGF0ZVN0cmluZykge1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVN0cmluZyk7XG5cbiAgICAgICAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICBjb25zdCBtb250aCA9IChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgIGNvbnN0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIGNvbnN0IGhvdXJzID0gZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcblxuICAgICAgICByZXR1cm4gYCR7ZGF5fS4ke21vbnRofS4ke3llYXJ9IC8gJHtob3Vyc306JHttaW51dGVzfWA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFza1VzZXJJZCh1c2VySWQpIHtcbiAgICAgICAgcmV0dXJuIFwiKipcIiArIHVzZXJJZC50b1N0cmluZygpLnNsaWNlKDIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrVXNlckF1dGgoKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KGAvZmF2dXNlci8ke3VzZXJJZH0/bm9jYWNoZT0xYClcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzLnVzZXJpZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh1c2VySWQgPT09IHJlcy51c2VyaWQpXG4gICAgICAgICAgICAgICAgICAgIGlmKHJlcy51c2VyaWQgPT0gdXNlcklkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpcm1CZXQocmVzLmJldENvbmZpcm1lZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcmVkaWN0KHJlcy50ZWFtKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdW5hdXRoTXNncy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRlJykpO1xuICAgICAgICAgICAgICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1bmF1dGhNc2dzLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKSk7XG4gICAgICAgICAgICAgICAgICAgIHlvdUFyZUluQnRucy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRlJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBpbml0UGxheWVyU2VsZWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IHBsYXllcjEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGxheWVyMScpO1xuICAgICAgICBjb25zdCBwbGF5ZXIyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBsYXllcjInKTtcbiAgICAgICAgY29uc3QgbWludXNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fdGVhbS1idG4tbWludXNgKTtcbiAgICAgICAgY29uc3QgcGx1c0J0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX190ZWFtLWJ0bi1wbHVzYCk7XG5cbiAgICAgICAgcGxheWVyMS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHNjb3JlUHJlZGljdGlvbi5wbGF5ZXIgPSAxO1xuICAgICAgICAgICAgcGxheWVyMS5jbGFzc0xpc3QuYWRkKCd0YWtlVXNlcicpO1xuICAgICAgICAgICAgcGxheWVyMS5jbGFzc0xpc3QuYWRkKCdib3hlclNjYWxlJyk7XG4gICAgICAgICAgICBwbGF5ZXIyLmNsYXNzTGlzdC5yZW1vdmUoJ2JveGVyU2NhbGUnKTtcbiAgICAgICAgICAgIHBsYXllcjIuY2xhc3NMaXN0LnJlbW92ZSgndGFrZVVzZXInKTtcbiAgICAgICAgICAgIG1pbnVzQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVCdG4nKTtcbiAgICAgICAgICAgIHBsdXNCdG4uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZUJ0bicpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBsYXllcjIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBzY29yZVByZWRpY3Rpb24ucGxheWVyID0gMjtcbiAgICAgICAgICAgIHBsYXllcjIuY2xhc3NMaXN0LmFkZCgndGFrZVVzZXInKTtcbiAgICAgICAgICAgIHBsYXllcjIuY2xhc3NMaXN0LmFkZCgnYm94ZXJTY2FsZScpO1xuICAgICAgICAgICAgcGxheWVyMS5jbGFzc0xpc3QucmVtb3ZlKCdib3hlclNjYWxlJyk7XG4gICAgICAgICAgICBwbGF5ZXIxLmNsYXNzTGlzdC5yZW1vdmUoJ3Rha2VVc2VyJyk7XG4gICAgICAgICAgICBtaW51c0J0bi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlQnRuJyk7XG4gICAgICAgICAgICBwbHVzQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVCdG4nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdFNjb3JlU2VsZWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IG1pbnVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLW1pbnVzYCk7XG4gICAgICAgIGNvbnN0IHBsdXNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fdGVhbS1idG4tcGx1c2ApO1xuICAgICAgICBjb25zdCBzY29yZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3Njb3JlYCk7XG5cbiAgICAgICAgbWludXNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBzY29yZVByZWRpY3Rpb24uc2NvcmUgPSBub3JtYWxpemVTY29yZShzY29yZVByZWRpY3Rpb24uc2NvcmUgLSAxKTtcbiAgICAgICAgICAgIHNjb3JlUGFuZWwuaW5uZXJIVE1MID0gZGlzcGxheVJvdW5kKHNjb3JlUHJlZGljdGlvbi5zY29yZSk7XG4gICAgICAgICAgICBpZihzY29yZVByZWRpY3Rpb24uc2NvcmUgPT09IDApe1xuICAgICAgICAgICAgICAgIHNjb3JlUGFuZWwuY2xhc3NMaXN0LmFkZChcInNtYWxsLXNjb3JlXCIpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBzY29yZVBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJzbWFsbC1zY29yZVwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBwbHVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgc2NvcmVQcmVkaWN0aW9uLnNjb3JlID0gbm9ybWFsaXplU2NvcmUoc2NvcmVQcmVkaWN0aW9uLnNjb3JlICsgMSk7XG4gICAgICAgICAgICBzY29yZVBhbmVsLmlubmVySFRNTCA9IGRpc3BsYXlSb3VuZChzY29yZVByZWRpY3Rpb24uc2NvcmUpO1xuICAgICAgICAgICAgaWYoc2NvcmVQcmVkaWN0aW9uLnNjb3JlID09PSAwKXtcbiAgICAgICAgICAgICAgICBzY29yZVBhbmVsLmNsYXNzTGlzdC5hZGQoXCJzbWFsbC1zY29yZVwiKVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKFwic21hbGwtc2NvcmVcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplU2NvcmUoc2NvcmUpIHtcbiAgICAgICAgaWYgKHNjb3JlIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3JlICsgQ0hPSUNFU19DT1VOVDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcmUgPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3JlIC0gQ0hPSUNFU19DT1VOVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NvcmU7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBkaXNwbGF5Um91bmQoY2hvaWNlKSB7XG4gICAgICAgIHJldHVybiBjaG9pY2UgPT09IDAgPyBKVURHRV9ERUNJU0lPTl9PUFRJT04gOiBjaG9pY2U7XG4gICAgfVxuXG4gICAgbGV0IGlzUmVxdWVzdEluUHJvZ3Jlc3M7XG4gICAgZnVuY3Rpb24gaW5pdFByZWRpY3Rpb25CdG4oKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICghIWUudGFyZ2V0LmNsb3Nlc3QoJy5wcmVkaWN0aW9uQnRuJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNSZXF1ZXN0SW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeW91ckJldFR4dC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnc2hvd0J0bicpKTtcbiAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnc2hvd0J0bicpKTtcbiAgICAgICAgICAgICAgICBpc1JlcXVlc3RJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwcmVkaWN0aW9uQnRuLmNsYXNzTGlzdC5hZGQoXCJwb2ludGVyLW5vbmVcIik7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCgnL2JldCcsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJpZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyOiBzY29yZVByZWRpY3Rpb24ucGxheWVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHNjb3JlUHJlZGljdGlvbi5zY29yZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXNSZXF1ZXN0SW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBwcmVkaWN0aW9uQnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLW5vbmVcIik7XG4gICAgICAgICAgICAgICAgICAgIEluaXRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlzUmVxdWVzdEluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcHJlZGljdGlvbkJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwicG9pbnRlci1ub25lXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIGxvYWRUcmFuc2xhdGlvbnMoKVxuICAgICAgICAudGhlbihpbml0KTtcblxuICAgIGxldCBtYWluUGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYXZfX3BhZ2UnKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IG1haW5QYWdlLmNsYXNzTGlzdC5hZGQoJ292ZXJmbG93JyksIDEwMDApO1xuXG4gICAgY29uc3QgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGlmKGN1cnJlbnREYXRlID49IFBST01PX0VORF9EQVRFKSB7XG4gICAgICAgIHlvdUFyZUluQnRucy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdibG9jay1idG4nKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uZmlybUJldChiZXQpe1xuICAgICAgICBjb25zdCBiZXRXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wcmVkaWN0aW9uX19sYXN0XCIpXG4gICAgICAgIGNvbnN0IGJldFRydWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnByZWRpY3Rpb25fX2JldC10cnVlXCIpXG4gICAgICAgIGNvbnN0IGJldEZhbHNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wcmVkaWN0aW9uX19iZXQtZmFsc2VcIilcbiAgICAgICAgYmV0V3JhcC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKVxuICAgICAgICAvLyBjb25zb2xlLmxvZyhiZXRXcmFwKVxuICAgICAgICBcbiAgICAgICAgaWYoYmV0KXtcbiAgICAgICAgICAgIGJldFRydWUuY2xhc3NMaXN0LnJlbW92ZShcImhpZGVcIilcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBiZXRGYWxzZS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBsYXN0UHJlZGljdChwcmVkaWN0KXtcbiAgICAgICAgY29uc3QgcHJlZGljdFdyYXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnByZWRpY3Rpb25fX2xhc3QtdHh0XCIpXG4gICAgICAgIGNvbnNvbGUubG9nKHByZWRpY3RXcmFwLnRleHRDb250ZW50KVxuXG4gICAgICAgIGxldCBuZXdUZXh0ID0gYCR7cHJlZGljdFdyYXAudGV4dENvbnRlbnQgKyBcIjxicj5cIiArIHByZWRpY3QgKyAnPHNwYW4gZGF0YS10cmFuc2xhdGU9XCJyb3VuZFwiIGNsYXNzPVwidGFibGUtcm91bmRcIj48L3NwYW4+J31gXG4gICAgICAgIGNvbnNvbGUubG9nKG5ld1RleHQpXG5cbiAgICAgICAgbGV0IHRleHQgPSBgJHtwcmVkaWN0ID09PSAxMyA/IHByZWRpY3RXcmFwLnRleHRDb250ZW50ICsgXCI8YnI+XCIgKyBKVURHRV9ERUNJU0lPTl9PUFRJT04gOiBuZXdUZXh0fWBcblxuICAgICAgICBwcmVkaWN0V3JhcC5pbm5lckhUTUwgPSB0ZXh0XG5cblxuICAgIH1cblxuICAgIC8vXG4gICAgLy9cbiAgICAvLyBmdW5jdGlvbiBkaXNwbGF5Um91bmQoY2hvaWNlKSB7XG4gICAgLy8gICAgIHJldHVybiBjaG9pY2UgPT09IDAgPyBKVURHRV9ERUNJU0lPTl9PUFRJT04gOiBjaG9pY2U7XG4gICAgLy8gfVxuICAgIC8vXG4gICAgLy8gZnVuY3Rpb24gbm9ybWFsaXplU2NvcmUoc2NvcmUpIHtcbiAgICAvLyAgICAgaWYgKHNjb3JlIDwgMCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHNjb3JlICsgQ0hPSUNFU19DT1VOVDtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICBpZiAoc2NvcmUgPiAxMikge1xuICAgIC8vICAgICAgICAgcmV0dXJuIHNjb3JlIC0gQ0hPSUNFU19DT1VOVDtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICByZXR1cm4gc2NvcmU7XG4gICAgLy8gfVxuICAgIC8vIGZ1bmN0aW9uIGluaXRTY29yZVNlbGVjdG9yKCkge1xuICAgIC8vICAgICBjb25zdCBtaW51c0J0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX190ZWFtLWJ0bi1taW51c2ApO1xuICAgIC8vICAgICBjb25zdCBwbHVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLXBsdXNgKTtcbiAgICAvLyAgICAgY29uc3Qgc2NvcmVQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX19zY29yZWApO1xuICAgIC8vXG4gICAgLy9cbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIG1pbnVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vICAgICAgICAgc2NvcmVQcmVkaWN0aW9uLnNjb3JlID0gbm9ybWFsaXplU2NvcmUoc2NvcmVQcmVkaWN0aW9uLnNjb3JlIC0gMSk7XG4gICAgLy8gICAgICAgICBzY29yZVBhbmVsLmlubmVySFRNTCA9IGRpc3BsYXlSb3VuZChzY29yZVByZWRpY3Rpb24uc2NvcmUpO1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coc2NvcmVQcmVkaWN0aW9uLnNjb3JlKVxuICAgIC8vICAgICAgICAgaWYoc2NvcmVQcmVkaWN0aW9uLnNjb3JlID09PSAwKXtcbiAgICAvLyAgICAgICAgICAgICBzY29yZVBhbmVsLmNsYXNzTGlzdC5hZGQoXCJzbWFsbC1zY29yZVwiKVxuICAgIC8vICAgICAgICAgfWVsc2V7XG4gICAgLy8gICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKFwic21hbGwtc2NvcmVcIilcbiAgICAvLyAgICAgICAgIH1cbiAgICAvL1xuICAgIC8vICAgICB9KTtcbiAgICAvL1xuICAgIC8vICAgICBwbHVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIC8vICAgICAgICAgc2NvcmVQcmVkaWN0aW9uLnNjb3JlID0gbm9ybWFsaXplU2NvcmUoc2NvcmVQcmVkaWN0aW9uLnNjb3JlICsgMSk7XG4gICAgLy8gICAgICAgICBzY29yZVBhbmVsLmlubmVySFRNTCA9IGRpc3BsYXlSb3VuZChzY29yZVByZWRpY3Rpb24uc2NvcmUpO1xuICAgIC8vICAgICAgICAgY29uc29sZS5sb2coc2NvcmVQcmVkaWN0aW9uLnNjb3JlKVxuICAgIC8vICAgICAgICAgaWYoc2NvcmVQcmVkaWN0aW9uLnNjb3JlID09PSAwKXtcbiAgICAvLyAgICAgICAgICAgICBzY29yZVBhbmVsLmNsYXNzTGlzdC5hZGQoXCJzbWFsbC1zY29yZVwiKVxuICAgIC8vICAgICAgICAgfWVsc2V7XG4gICAgLy8gICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKFwic21hbGwtc2NvcmVcIilcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG5cblxuICAgIC8vIGZvciB0ZXN0XG4gICAgY29uc3QgYmxhY2tCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJsYWNrLWJ0blwiKVxuXG4gICAgYmxhY2tCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+e1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoXCJkYXJrXCIpXG4gICAgfSlcblxufSkoKTtcblxuXG5cblxuXG4vLyBmdW5jdGlvbiBpbml0KCkge1xuLy8gICAgICAgIDtcbi8vIH1cbi8vIGluaXQoKSIsIiJdfQ==
