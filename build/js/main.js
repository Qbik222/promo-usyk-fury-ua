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
  var locale = 'uk';
  if (enLeng) locale = 'en';
  document.querySelector(".fav__page").classList.add(locale);
  var JUDGE_DECISION_OPTION = locale === 'uk' ? 'за рішенням суддів' : "According to the judges decision";
  var i18nData = {};
  var userId;
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
      additionalUserRow.classList.add('you');
    }

    // const translationKey = 'boxer-' + user.player;
    // const player = translateKey(translationKey);
    var prediction = user.team === 13 ? JUDGE_DECISION_OPTION : user.team + " <span data-translate=\"round\" class=\"table-round\"></span>";
    additionalUserRow.innerHTML = "\n                        <div class=\"tableResults__body-col\">".concat(user.userid, " ").concat(isCurrentUser ? '<span data-translate="you"></span>' : '', "</div>\n                        <div class=\"tableResults__body-col\">").concat(formatDateString(user.lastForecast), "</div>\n                        <div class=\"tableResults__body-col\">").concat(prediction, " </div>\n                        <div class=\"tableResults__body-col\">*******</div>\n                    ");
    table.append(additionalUserRow);
  }

  // function updateLastPrediction(data) {
  //     const translationKey = 'boxer-' + data.player;
  //     const player = translateKey(translationKey);
  //     const predictedPlayerDiv = document.querySelector('.prediction__last-team');
  //     predictedPlayerDiv.innerHTML = player;
  //
  //     const scoreDiv = document.querySelector('.prediction__last-score');
  //     scoreDiv.innerHTML = data.score == 0 ? JUDGE_DECISION_OPTION : `<span class="scoreTeam1">${data.score} </span>` + 'runda';
  //
  //     const lastPrediction = document.querySelector('.prediction__last');
  //     lastPrediction.classList.remove('hide');
  //
  //     // const predictionStatusDiv = document.querySelector('.prediction__bet');
  //     // predictionStatusDiv.classList.remove('hide');
  //
  //     const predictionConfirmed = document.querySelector(`.prediction__bet-${data.betConfirmed || false}`);
  //     predictionConfirmed.classList.add('betScale');
  // }

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
})();
"use strict";
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiLCJzZWNvbmQuanMiXSwibmFtZXMiOlsiUFJPTU9fRU5EX0RBVEUiLCJEYXRlIiwiYXBpVVJMIiwiQ0hPSUNFU19DT1VOVCIsInNjb3JlUHJlZGljdGlvbiIsInBsYXllciIsInNjb3JlIiwicmVzdWx0c1RhYmxlIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwidW5hdXRoTXNncyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJ5b3VBcmVJbkJ0bnMiLCJwcmVkaWN0aW9uQnRuIiwieW91ckJldFR4dCIsImVuTGVuZyIsImxvY2FsZSIsImNsYXNzTGlzdCIsImFkZCIsIkpVREdFX0RFQ0lTSU9OX09QVElPTiIsImkxOG5EYXRhIiwidXNlcklkIiwibG9hZFRyYW5zbGF0aW9ucyIsImZldGNoIiwiY29uY2F0IiwidGhlbiIsInJlcyIsImpzb24iLCJ0cmFuc2xhdGUiLCJtdXRhdGlvbk9ic2VydmVyIiwiTXV0YXRpb25PYnNlcnZlciIsIm11dGF0aW9ucyIsIm9ic2VydmUiLCJnZXRFbGVtZW50QnlJZCIsImNoaWxkTGlzdCIsInN1YnRyZWUiLCJlbGVtcyIsImxlbmd0aCIsImZvckVhY2giLCJlbGVtIiwia2V5IiwiZ2V0QXR0cmlidXRlIiwiaW5uZXJIVE1MIiwidHJhbnNsYXRlS2V5IiwicmVtb3ZlQXR0cmlidXRlIiwicmVmcmVzaExvY2FsaXplZENsYXNzIiwiZWxlbWVudCIsImJhc2VDc3NDbGFzcyIsIl9pIiwiX2FyciIsImxhbmciLCJyZW1vdmUiLCJyZXF1ZXN0IiwibGluayIsImV4dHJhT3B0aW9ucyIsIl9vYmplY3RTcHJlYWQiLCJoZWFkZXJzIiwiZ2V0VXNlcnMiLCJJbml0UGFnZSIsInVzZXJzIiwicmVuZGVyVXNlcnMiLCJpbml0IiwiaW5pdFBsYXllclNlbGVjdG9yIiwiaW5pdFNjb3JlU2VsZWN0b3IiLCJpbml0UHJlZGljdGlvbkJ0biIsIndpbmRvdyIsInN0b3JlIiwic3RhdGUiLCJnZXRTdGF0ZSIsImF1dGgiLCJpc0F1dGhvcml6ZWQiLCJpZCIsImMiLCJpIiwic2V0SW50ZXJ2YWwiLCJnX3VzZXJfaWQiLCJjaGVja1VzZXJBdXRoIiwiY2xlYXJJbnRlcnZhbCIsInBvcHVsYXRlVXNlcnNUYWJsZSIsImN1cnJlbnRVc2VySWQiLCJ0YWJsZSIsImN1cnJlbnRVc2VyIiwiZmluZCIsInVzZXIiLCJ1c2VyaWQiLCJkaXNwbGF5VXNlciIsImlzQ3VycmVudFVzZXIiLCJhZGRpdGlvbmFsVXNlclJvdyIsImNyZWF0ZUVsZW1lbnQiLCJwcmVkaWN0aW9uIiwidGVhbSIsImZvcm1hdERhdGVTdHJpbmciLCJsYXN0Rm9yZWNhc3QiLCJhcHBlbmQiLCJkYXRlU3RyaW5nIiwiZGF0ZSIsImRheSIsImdldERhdGUiLCJ0b1N0cmluZyIsInBhZFN0YXJ0IiwibW9udGgiLCJnZXRNb250aCIsInllYXIiLCJnZXRGdWxsWWVhciIsImhvdXJzIiwiZ2V0SG91cnMiLCJtaW51dGVzIiwiZ2V0TWludXRlcyIsIm1hc2tVc2VySWQiLCJzbGljZSIsImNvbnNvbGUiLCJsb2ciLCJjb25maXJtQmV0IiwiYmV0Q29uZmlybWVkIiwibGFzdFByZWRpY3QiLCJpdGVtIiwicGxheWVyMSIsInBsYXllcjIiLCJtaW51c0J0biIsInBsdXNCdG4iLCJhZGRFdmVudExpc3RlbmVyIiwic2NvcmVQYW5lbCIsIm5vcm1hbGl6ZVNjb3JlIiwiZGlzcGxheVJvdW5kIiwiY2hvaWNlIiwiaXNSZXF1ZXN0SW5Qcm9ncmVzcyIsImUiLCJ0YXJnZXQiLCJjbG9zZXN0Iiwic2V0VGltZW91dCIsIm1ldGhvZCIsImJvZHkiLCJKU09OIiwic3RyaW5naWZ5IiwibWFpblBhZ2UiLCJjdXJyZW50RGF0ZSIsImJldCIsImJldFdyYXAiLCJiZXRUcnVlIiwiYmV0RmFsc2UiLCJwcmVkaWN0IiwicHJlZGljdFdyYXAiLCJ0ZXh0Q29udGVudCIsIm5ld1RleHQiLCJ0ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLENBQUMsWUFBWTtFQUNULElBQU1BLGNBQWMsR0FBRyxJ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LFdBQVcsQ0FBQ25HLFNBQVMsR0FBR3NHLElBQUk7RUFDaEM7QUFFSixDQUFDLEVBQUUsQ0FBQztBQzFXSiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBQUk9NT19FTkRfREFURSA9IG5ldyBEYXRlKCcyMDIzLTEyLTIzVDE5OjAwOjAwLjAwMFonKTsgLy8tMiBob3Vyc1xuICAgIGNvbnN0IGFwaVVSTCA9ICdodHRwczovL2Zhdi1wcm9tLmNvbS9hcGlfcHJlZGljdG9yX2ZpZ2h0X3VhJztcbiAgICBjb25zdCBDSE9JQ0VTX0NPVU5UID0gMTM7XG4gICAgLy8gbGV0IHNjb3JlUHJlZGljdGlvbiA9IHtcbiAgICAvLyAgICAgc2NvcmU6IDBcbiAgICAvLyB9XG4gICAgbGV0IHNjb3JlUHJlZGljdGlvbiA9IHtwbGF5ZXIgOiAxLCBzY29yZTogMX1cblxuXG4gICAgY29uc3RcbiAgICAgICAgcmVzdWx0c1RhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRhYmxlUmVzdWx0c19fYm9keScpLFxuICAgICAgICB1bmF1dGhNc2dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnVuYXV0aC1tc2cnKSxcbiAgICAgICAgeW91QXJlSW5CdG5zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRvb2stcGFydCcpLFxuICAgICAgICBwcmVkaWN0aW9uQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZWRpY3Rpb25CdG4nKSxcbiAgICAgICAgeW91ckJldFR4dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX195b3VyQmV0Jyk7XG5cbiAgICBjb25zdCBlbkxlbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaHJMZW5nJyk7XG5cbiAgICBsZXQgbG9jYWxlID0gJ3VrJ1xuXG4gICAgaWYgKGVuTGVuZykgbG9jYWxlID0gJ2VuJztcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmF2X19wYWdlXCIpLmNsYXNzTGlzdC5hZGQobG9jYWxlKVxuXG4gICAgY29uc3QgSlVER0VfREVDSVNJT05fT1BUSU9OID0gbG9jYWxlID09PSAndWsnID8gJ9C30LAg0YDRltGI0LXQvdC90Y/QvCDRgdGD0LTQtNGW0LInIDogYEFjY29yZGluZyB0byB0aGUganVkZ2VzIGRlY2lzaW9uYDtcblxuXG4gICAgbGV0IGkxOG5EYXRhID0ge307XG4gICAgbGV0IHVzZXJJZDtcblxuICAgIGZ1bmN0aW9uIGxvYWRUcmFuc2xhdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiBmZXRjaChgJHthcGlVUkx9L3RyYW5zbGF0ZXMvJHtsb2NhbGV9YCkudGhlbihyZXMgPT4gcmVzLmpzb24oKSlcbiAgICAgICAgICAgIC50aGVuKGpzb24gPT4ge1xuICAgICAgICAgICAgICAgIGkxOG5EYXRhID0ganNvbjtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUoKTtcblxuICAgICAgICAgICAgICAgIHZhciBtdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKG11dGF0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtdXRhdGlvbk9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ByZWRpY3RvcicpLCB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlKCkge1xuICAgICAgICBjb25zdCBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXRyYW5zbGF0ZV0nKVxuICAgICAgICBpZiAoZWxlbXMgJiYgZWxlbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBlbGVtcy5mb3JFYWNoKGVsZW0gPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLXRyYW5zbGF0ZScpO1xuICAgICAgICAgICAgICAgIGVsZW0uaW5uZXJIVE1MID0gdHJhbnNsYXRlS2V5KGtleSk7XG4gICAgICAgICAgICAgICAgZWxlbS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtdHJhbnNsYXRlJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIHJlZnJlc2hMb2NhbGl6ZWRDbGFzcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZUtleShrZXkpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaTE4bkRhdGFba2V5XSB8fCAnKi0tLS1ORUVEIFRPIEJFIFRSQU5TTEFURUQtLS0tKiAgIGtleTogICcgKyBrZXk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVmcmVzaExvY2FsaXplZENsYXNzKGVsZW1lbnQsIGJhc2VDc3NDbGFzcykge1xuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGxhbmcgb2YgWydociddKSB7XG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoYmFzZUNzc0NsYXNzICsgbGFuZyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGJhc2VDc3NDbGFzcyArIGxvY2FsZSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdCA9IGZ1bmN0aW9uIChsaW5rLCBleHRyYU9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoKGFwaVVSTCArIGxpbmssIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAnQWNjZXB0JzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAuLi4oZXh0cmFPcHRpb25zIHx8IHt9KVxuICAgICAgICB9KS50aGVuKHJlcyA9PiByZXMuanNvbigpKVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFVzZXJzKCkge1xuICAgICAgICByZXR1cm4gcmVxdWVzdCgnL3VzZXJzJyk7XG4gICAgfVxuXG4gICAgY29uc3QgSW5pdFBhZ2UgPSAoKSA9PiB7XG4gICAgICAgIGdldFVzZXJzKCkudGhlbih1c2VycyA9PiB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh1c2VycylcbiAgICAgICAgICAgIHJlbmRlclVzZXJzKHVzZXJzKTtcbiAgICAgICAgICAgIHRyYW5zbGF0ZSgpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgIGluaXRQbGF5ZXJTZWxlY3RvcigpO1xuICAgICAgICBpbml0U2NvcmVTZWxlY3RvcigpO1xuICAgICAgICBpbml0UHJlZGljdGlvbkJ0bigpO1xuXG4gICAgICAgIGlmICh3aW5kb3cuc3RvcmUpIHtcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IHdpbmRvdy5zdG9yZS5nZXRTdGF0ZSgpO1xuICAgICAgICAgICAgdXNlcklkID0gc3RhdGUuYXV0aC5pc0F1dGhvcml6ZWQgJiYgc3RhdGUuYXV0aC5pZCB8fCAnJztcbiAgICAgICAgICAgIEluaXRQYWdlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBJbml0UGFnZSgpO1xuICAgICAgICAgICAgbGV0IGMgPSAwO1xuICAgICAgICAgICAgdmFyIGkgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGMgPCA1MCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISF3aW5kb3cuZ191c2VyX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySWQgPSB3aW5kb3cuZ191c2VyX2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgSW5pdFBhZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrVXNlckF1dGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGVja1VzZXJBdXRoKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyVXNlcnModXNlcnMpIHtcbiAgICAgICAgcG9wdWxhdGVVc2Vyc1RhYmxlKHVzZXJzLCB1c2VySWQsIHJlc3VsdHNUYWJsZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcG9wdWxhdGVVc2Vyc1RhYmxlKHVzZXJzLCBjdXJyZW50VXNlcklkLCB0YWJsZSkge1xuICAgICAgICB0YWJsZS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgaWYgKHVzZXJzICYmIHVzZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFVzZXIgPSB1c2VySWQgJiYgdXNlcnMuZmluZCh1c2VyID0+IHVzZXIudXNlcmlkID09PSBjdXJyZW50VXNlcklkKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50VXNlcikge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlVc2VyKGN1cnJlbnRVc2VyLCB0cnVlLCB0YWJsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2Vycy5mb3JFYWNoKCh1c2VyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXIudXNlcmlkICE9PSBjdXJyZW50VXNlcklkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlVc2VyKHVzZXIsIGZhbHNlLCB0YWJsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaXNwbGF5VXNlcih1c2VyLCBpc0N1cnJlbnRVc2VyLCB0YWJsZSkge1xuICAgICAgICBjb25zdCBhZGRpdGlvbmFsVXNlclJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhZGRpdGlvbmFsVXNlclJvdy5jbGFzc0xpc3QuYWRkKCd0YWJsZVJlc3VsdHNfX3JvdycpO1xuICAgICAgICBpZiAoaXNDdXJyZW50VXNlcikge1xuICAgICAgICAgICAgYWRkaXRpb25hbFVzZXJSb3cuY2xhc3NMaXN0LmFkZCgneW91Jyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb25zdCB0cmFuc2xhdGlvbktleSA9ICdib3hlci0nICsgdXNlci5wbGF5ZXI7XG4gICAgICAgIC8vIGNvbnN0IHBsYXllciA9IHRyYW5zbGF0ZUtleSh0cmFuc2xhdGlvbktleSk7XG4gICAgICAgIGNvbnN0IHByZWRpY3Rpb24gPSB1c2VyLnRlYW0gPT09IDEzID8gSlVER0VfREVDSVNJT05fT1BUSU9OIDogdXNlci50ZWFtICsgYCA8c3BhbiBkYXRhLXRyYW5zbGF0ZT1cInJvdW5kXCIgY2xhc3M9XCJ0YWJsZS1yb3VuZFwiPjwvc3Bhbj5gO1xuXG4gICAgICAgIGFkZGl0aW9uYWxVc2VyUm93LmlubmVySFRNTCA9IGBcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHt1c2VyLnVzZXJpZH0gJHtpc0N1cnJlbnRVc2VyID8gJzxzcGFuIGRhdGEtdHJhbnNsYXRlPVwieW91XCI+PC9zcGFuPicgOiAnJ308L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHtmb3JtYXREYXRlU3RyaW5nKHVzZXIubGFzdEZvcmVjYXN0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+JHtwcmVkaWN0aW9ufSA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWJsZVJlc3VsdHNfX2JvZHktY29sXCI+KioqKioqKjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICB0YWJsZS5hcHBlbmQoYWRkaXRpb25hbFVzZXJSb3cpO1xuICAgIH1cblxuICAgIC8vIGZ1bmN0aW9uIHVwZGF0ZUxhc3RQcmVkaWN0aW9uKGRhdGEpIHtcbiAgICAvLyAgICAgY29uc3QgdHJhbnNsYXRpb25LZXkgPSAnYm94ZXItJyArIGRhdGEucGxheWVyO1xuICAgIC8vICAgICBjb25zdCBwbGF5ZXIgPSB0cmFuc2xhdGVLZXkodHJhbnNsYXRpb25LZXkpO1xuICAgIC8vICAgICBjb25zdCBwcmVkaWN0ZWRQbGF5ZXJEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9fbGFzdC10ZWFtJyk7XG4gICAgLy8gICAgIHByZWRpY3RlZFBsYXllckRpdi5pbm5lckhUTUwgPSBwbGF5ZXI7XG4gICAgLy9cbiAgICAvLyAgICAgY29uc3Qgc2NvcmVEaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9fbGFzdC1zY29yZScpO1xuICAgIC8vICAgICBzY29yZURpdi5pbm5lckhUTUwgPSBkYXRhLnNjb3JlID09IDAgPyBKVURHRV9ERUNJU0lPTl9PUFRJT04gOiBgPHNwYW4gY2xhc3M9XCJzY29yZVRlYW0xXCI+JHtkYXRhLnNjb3JlfSA8L3NwYW4+YCArICdydW5kYSc7XG4gICAgLy9cbiAgICAvLyAgICAgY29uc3QgbGFzdFByZWRpY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlZGljdGlvbl9fbGFzdCcpO1xuICAgIC8vICAgICBsYXN0UHJlZGljdGlvbi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgLy9cbiAgICAvLyAgICAgLy8gY29uc3QgcHJlZGljdGlvblN0YXR1c0RpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVkaWN0aW9uX19iZXQnKTtcbiAgICAvLyAgICAgLy8gcHJlZGljdGlvblN0YXR1c0Rpdi5jbGFzc0xpc3QucmVtb3ZlKCdoaWRlJyk7XG4gICAgLy9cbiAgICAvLyAgICAgY29uc3QgcHJlZGljdGlvbkNvbmZpcm1lZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX19iZXQtJHtkYXRhLmJldENvbmZpcm1lZCB8fCBmYWxzZX1gKTtcbiAgICAvLyAgICAgcHJlZGljdGlvbkNvbmZpcm1lZC5jbGFzc0xpc3QuYWRkKCdiZXRTY2FsZScpO1xuICAgIC8vIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdERhdGVTdHJpbmcoZGF0ZVN0cmluZykge1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoZGF0ZVN0cmluZyk7XG5cbiAgICAgICAgY29uc3QgZGF5ID0gZGF0ZS5nZXREYXRlKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCAnMCcpO1xuICAgICAgICBjb25zdCBtb250aCA9IChkYXRlLmdldE1vbnRoKCkgKyAxKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsICcwJyk7XG4gICAgICAgIGNvbnN0IHllYXIgPSBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgIGNvbnN0IGhvdXJzID0gZGF0ZS5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcbiAgICAgICAgY29uc3QgbWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwgJzAnKTtcblxuICAgICAgICByZXR1cm4gYCR7ZGF5fS4ke21vbnRofS4ke3llYXJ9IC8gJHtob3Vyc306JHttaW51dGVzfWA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFza1VzZXJJZCh1c2VySWQpIHtcbiAgICAgICAgcmV0dXJuIFwiKipcIiArIHVzZXJJZC50b1N0cmluZygpLnNsaWNlKDIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoZWNrVXNlckF1dGgoKSB7XG4gICAgICAgIHJldHVybiByZXF1ZXN0KGAvZmF2dXNlci8ke3VzZXJJZH0/bm9jYWNoZT0xYClcbiAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVzLnVzZXJpZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh1c2VySWQgPT09IHJlcy51c2VyaWQpXG4gICAgICAgICAgICAgICAgICAgIGlmKHJlcy51c2VyaWQgPT0gdXNlcklkKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpcm1CZXQocmVzLmJldENvbmZpcm1lZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RQcmVkaWN0KHJlcy50ZWFtKVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdW5hdXRoTXNncy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRlJykpO1xuICAgICAgICAgICAgICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1bmF1dGhNc2dzLmZvckVhY2goaXRlbSA9PiBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGUnKSk7XG4gICAgICAgICAgICAgICAgICAgIHlvdUFyZUluQnRucy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRlJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBpbml0UGxheWVyU2VsZWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IHBsYXllcjEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGxheWVyMScpO1xuICAgICAgICBjb25zdCBwbGF5ZXIyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBsYXllcjInKTtcbiAgICAgICAgY29uc3QgbWludXNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fdGVhbS1idG4tbWludXNgKTtcbiAgICAgICAgY29uc3QgcGx1c0J0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wcmVkaWN0aW9uX190ZWFtLWJ0bi1wbHVzYCk7XG5cbiAgICAgICAgcGxheWVyMS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgIHNjb3JlUHJlZGljdGlvbi5wbGF5ZXIgPSAxO1xuICAgICAgICAgICAgcGxheWVyMS5jbGFzc0xpc3QuYWRkKCd0YWtlVXNlcicpO1xuICAgICAgICAgICAgcGxheWVyMS5jbGFzc0xpc3QuYWRkKCdib3hlclNjYWxlJyk7XG4gICAgICAgICAgICBwbGF5ZXIyLmNsYXNzTGlzdC5yZW1vdmUoJ2JveGVyU2NhbGUnKTtcbiAgICAgICAgICAgIHBsYXllcjIuY2xhc3NMaXN0LnJlbW92ZSgndGFrZVVzZXInKTtcbiAgICAgICAgICAgIG1pbnVzQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVCdG4nKTtcbiAgICAgICAgICAgIHBsdXNCdG4uY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZUJ0bicpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBsYXllcjIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBzY29yZVByZWRpY3Rpb24ucGxheWVyID0gMjtcbiAgICAgICAgICAgIHBsYXllcjIuY2xhc3NMaXN0LmFkZCgndGFrZVVzZXInKTtcbiAgICAgICAgICAgIHBsYXllcjIuY2xhc3NMaXN0LmFkZCgnYm94ZXJTY2FsZScpO1xuICAgICAgICAgICAgcGxheWVyMS5jbGFzc0xpc3QucmVtb3ZlKCdib3hlclNjYWxlJyk7XG4gICAgICAgICAgICBwbGF5ZXIxLmNsYXNzTGlzdC5yZW1vdmUoJ3Rha2VVc2VyJyk7XG4gICAgICAgICAgICBtaW51c0J0bi5jbGFzc0xpc3QucmVtb3ZlKCdkaXNhYmxlQnRuJyk7XG4gICAgICAgICAgICBwbHVzQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGVCdG4nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdFNjb3JlU2VsZWN0b3IoKSB7XG4gICAgICAgIGNvbnN0IG1pbnVzQnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3RlYW0tYnRuLW1pbnVzYCk7XG4gICAgICAgIGNvbnN0IHBsdXNCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJlZGljdGlvbl9fdGVhbS1idG4tcGx1c2ApO1xuICAgICAgICBjb25zdCBzY29yZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByZWRpY3Rpb25fX3Njb3JlYCk7XG5cbiAgICAgICAgbWludXNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICBzY29yZVByZWRpY3Rpb24uc2NvcmUgPSBub3JtYWxpemVTY29yZShzY29yZVByZWRpY3Rpb24uc2NvcmUgLSAxKTtcbiAgICAgICAgICAgIHNjb3JlUGFuZWwuaW5uZXJIVE1MID0gZGlzcGxheVJvdW5kKHNjb3JlUHJlZGljdGlvbi5zY29yZSk7XG4gICAgICAgICAgICBpZihzY29yZVByZWRpY3Rpb24uc2NvcmUgPT09IDApe1xuICAgICAgICAgICAgICAgIHNjb3JlUGFuZWwuY2xhc3NMaXN0LmFkZChcInNtYWxsLXNjb3JlXCIpXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBzY29yZVBhbmVsLmNsYXNzTGlzdC5yZW1vdmUoXCJzbWFsbC1zY29yZVwiKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBwbHVzQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgc2NvcmVQcmVkaWN0aW9uLnNjb3JlID0gbm9ybWFsaXplU2NvcmUoc2NvcmVQcmVkaWN0aW9uLnNjb3JlICsgMSk7XG4gICAgICAgICAgICBzY29yZVBhbmVsLmlubmVySFRNTCA9IGRpc3BsYXlSb3VuZChzY29yZVByZWRpY3Rpb24uc2NvcmUpO1xuICAgICAgICAgICAgaWYoc2NvcmVQcmVkaWN0aW9uLnNjb3JlID09PSAwKXtcbiAgICAgICAgICAgICAgICBzY29yZVBhbmVsLmNsYXNzTGlzdC5hZGQoXCJzbWFsbC1zY29yZVwiKVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2NvcmVQYW5lbC5jbGFzc0xpc3QucmVtb3ZlKFwic21hbGwtc2NvcmVcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplU2NvcmUoc2NvcmUpIHtcbiAgICAgICAgaWYgKHNjb3JlIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3JlICsgQ0hPSUNFU19DT1VOVDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcmUgPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIHNjb3JlIC0gQ0hPSUNFU19DT1VOVDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2NvcmU7XG4gICAgfVxuXG5cbiAgICBmdW5jdGlvbiBkaXNwbGF5Um91bmQoY2hvaWNlKSB7XG4gICAgICAgIHJldHVybiBjaG9pY2UgPT09IDAgPyBKVURHRV9ERUNJU0lPTl9PUFRJT04gOiBjaG9pY2U7XG4gICAgfVxuXG4gICAgbGV0IGlzUmVxdWVzdEluUHJvZ3Jlc3M7XG4gICAgZnVuY3Rpb24gaW5pdFByZWRpY3Rpb25CdG4oKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICghIWUudGFyZ2V0LmNsb3Nlc3QoJy5wcmVkaWN0aW9uQnRuJykpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNSZXF1ZXN0SW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgeW91ckJldFR4dC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnc2hvd0J0bicpKTtcbiAgICAgICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgICAgICAgICB5b3VBcmVJbkJ0bnMuZm9yRWFjaChpdGVtID0+IGl0ZW0uY2xhc3NMaXN0LmFkZCgnc2hvd0J0bicpKTtcbiAgICAgICAgICAgICAgICBpc1JlcXVlc3RJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwcmVkaWN0aW9uQnRuLmNsYXNzTGlzdC5hZGQoXCJwb2ludGVyLW5vbmVcIik7XG4gICAgICAgICAgICAgICAgcmVxdWVzdCgnL2JldCcsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJpZDogdXNlcklkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyOiBzY29yZVByZWRpY3Rpb24ucGxheWVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcmU6IHNjb3JlUHJlZGljdGlvbi5zY29yZVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXNSZXF1ZXN0SW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBwcmVkaWN0aW9uQnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJwb2ludGVyLW5vbmVcIik7XG4gICAgICAgICAgICAgICAgICAgIEluaXRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlzUmVxdWVzdEluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcHJlZGljdGlvbkJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwicG9pbnRlci1ub25lXCIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIGxvYWRUcmFuc2xhdGlvbnMoKVxuICAgICAgICAudGhlbihpbml0KTtcblxuICAgIGxldCBtYWluUGFnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5mYXZfX3BhZ2UnKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IG1haW5QYWdlLmNsYXNzTGlzdC5hZGQoJ292ZXJmbG93JyksIDEwMDApO1xuXG4gICAgY29uc3QgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIGlmKGN1cnJlbnREYXRlID49IFBST01PX0VORF9EQVRFKSB7XG4gICAgICAgIHlvdUFyZUluQnRucy5mb3JFYWNoKGl0ZW0gPT4gaXRlbS5jbGFzc0xpc3QuYWRkKCdibG9jay1idG4nKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uZmlybUJldChiZXQpe1xuICAgICAgICBjb25zdCBiZXRXcmFwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wcmVkaWN0aW9uX19sYXN0XCIpXG4gICAgICAgIGNvbnN0IGJldFRydWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLnByZWRpY3Rpb25fX2JldC10cnVlXCIpXG4gICAgICAgIGNvbnN0IGJldEZhbHNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5wcmVkaWN0aW9uX19iZXQtZmFsc2VcIilcbiAgICAgICAgYmV0V3JhcC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKVxuICAgICAgICBpZihiZXQpe1xuICAgICAgICAgICAgYmV0VHJ1ZS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGJldEZhbHNlLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpXG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGxhc3RQcmVkaWN0KHByZWRpY3Qpe1xuICAgICAgICBjb25zdCBwcmVkaWN0V3JhcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIucHJlZGljdGlvbl9fbGFzdC10eHRcIilcbiAgICAgICAgY29uc29sZS5sb2cocHJlZGljdFdyYXAudGV4dENvbnRlbnQpXG5cbiAgICAgICAgbGV0IG5ld1RleHQgPSBgJHtwcmVkaWN0V3JhcC50ZXh0Q29udGVudCArIFwiPGJyPlwiICsgcHJlZGljdCArICc8c3BhbiBkYXRhLXRyYW5zbGF0ZT1cInJvdW5kXCIgY2xhc3M9XCJ0YWJsZS1yb3VuZFwiPjwvc3Bhbj4nfWBcbiAgICAgICAgY29uc29sZS5sb2cobmV3VGV4dClcblxuICAgICAgICBsZXQgdGV4dCA9IGAke3ByZWRpY3QgPT09IDEzID8gcHJlZGljdFdyYXAudGV4dENvbnRlbnQgKyBcIjxicj5cIiArIEpVREdFX0RFQ0lTSU9OX09QVElPTiA6IG5ld1RleHR9YFxuXG4gICAgICAgIHByZWRpY3RXcmFwLmlubmVySFRNTCA9IHRleHRcbiAgICB9XG5cbn0pKCk7XG4iLCIiXX0=
