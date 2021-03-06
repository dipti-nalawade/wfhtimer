let timerId = 0;
let currentDate = new Date();
let timerEndDate = new Date();
let timerHr;
let timerMin;
let timerSec;
let remainingMsTime;
let timerState = '';
let remainingTime = '';
let myNotificationID;
let audioObj;

chrome.runtime.onStartup.addListener(function() {
    var today = new Date();
    var todayDt = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

    chrome.storage.sync.get(['timer_dt', 'timer_rt', 'timer_hr', 'timer_min'], function(result) {
        console.log(result);
        if(result.timer_hr == '' && result.timer_min == ''){
            $("#submit_btn_div").show();
        } else{
            if(result.timer_dt == '' || result.timer_dt != todayDt){
                setTimer(result.timer_hr, result.timer_min);
                chrome.storage.sync.set({timer_dt: todayDt});
            }
            /*else if(result.timer_dt != '' && result.timer_dt == todayDt){ 
                if(result.timer_rt > 0){
                    remainingMsTime = result.timer_rt;
                    restartTimer();
                }
            }*/
        }
    });
});

function setTimer(hr, min){
    if(timerState != ''){
        throw new Error("Timer is already running");
    }
    else if(isNaN(hr) || isNaN(min)){
        throw new Error("Enter Valid Hr and Min");
    }
    else if( hr < 0 || hr > 24){
        throw new Error("Enter Hour value less than 24");
    }
    else if( min < 0 || min > 60){
        throw new Error("Enter Min value less than 60");
    } else{
        let hrToMin = parseInt(hr) * 60 ;
        let totalTimerMin = hrToMin + parseInt(min);
        timerHr = totalTimerMin / 60;
        timerMin = totalTimerMin % 60;
        
        timerEndDate = new Date();
        let currentHr = +timerEndDate.getHours();
        let currentMin = +timerEndDate.getMinutes();

        timerHr = currentHr + timerHr;
        timerMin = currentMin + timerMin;
       
        timerEndDate.setHours(timerHr, timerMin);
        timerId =  setInterval(() => checkTimerEnd(), 500);
        timerState = 'set';

        showbadgeId =  setInterval(showBadge, 500);
    }
}

function checkTimerEnd(){
    currentDate =  new Date();
    remainingMsTime = timerEndDate - currentDate;
    if(remainingMsTime <= 0){
        timerEnd();
    }
}

function timerEnd(){
    clearTimeout(timerId);

    clearTimeout(showbadgeId);
    chrome.browserAction.setBadgeBackgroundColor({ color: "#ff0000" });
    chrome.browserAction.setBadgeText({ text: "" });

    var opt = {
        "type": "basic",
        "title": "Timer Alert!",
        "iconUrl": "icon.png",
        "message": "Your Time End Now",
	"buttons": [{
            "title": "Pause",
        }],
    };

    chrome.notifications.create('notify', opt, function(id) { myNotificationID = id; });
    audioNotification();

    timerState = '';
    chrome.storage.sync.set({timer_dt: ''});
    chrome.storage.sync.set({timer_rt: 0});
}

function audioNotification(){
    audioObj = new Audio('../audio/notification.mp3');
    audioObj.play();
}

function stopSound() {
    audioObj.pause();
}

function cancelTimer(){
    if(timerState == ''){
        throw new Error("Timer is not set");
    } else{
        currentDate = '';
        clearTimeout(timerId);
        timerState = '';
        chrome.storage.sync.set({timer_rt: 0});
	remainingMsTime = 0;   

        clearTimeout(showbadgeId); 
        chrome.browserAction.setBadgeBackgroundColor({ color: "#ff0000" });
        chrome.browserAction.setBadgeText({ text: "" });
    }
}

function pauseTimer(){
    if(timerState == ''){
        throw new Error("Timer is not set");
    } else if (timerState == 'paused'){
        throw new Error("Timer is alreday paused");
    } else{
        clearTimeout(timerId);
        timerState = 'paused';

        currentDate =  new Date();
        remainingMsTime = timerEndDate - currentDate;
        chrome.storage.sync.set({timer_rt: remainingMsTime});

        clearTimeout(showbadgeId);
    }
}

function restartTimer(){
    chrome.storage.sync.get(['timer_rt'], function(result) {
        remainingMsTime = result.timer_rt;

        if(remainingMsTime > 0){
            timerSec = remainingMsTime / 1000;
            timerMin = timerSec / 60;
            timerSec = Math.floor(timerSec % 60);
            timerHr = Math.floor(timerMin / 60);
            timerMin = Math.floor(timerMin % 60);

            timerEndDate = new Date();
            let currentHr = +timerEndDate.getHours();
            let currentMin = +timerEndDate.getMinutes();
            let currentSec = +timerEndDate.getSeconds();

            timerHr = currentHr + timerHr;
            timerMin = currentMin + timerMin;
            timerSec = currentSec + timerSec;

            timerEndDate.setHours(timerHr, timerMin, timerSec);

            timerId =  setInterval(() => checkTimerEnd(), 500);
            timerState = 'set';
            showbadgeId =  setInterval(showBadge, 500);
        } else{
            throw new Error("Working Hours are over");
        }
    });
}

function getTimerState(){
    return timerState;
}

function showBadge(){
    remainingTime = getRemainingTime();
    let badgeString = '';
    if(remainingTimeHr > 0) { badgeString += parseInt(remainingTimeHr)+"H"; } 	
    if(remainingTimeMin > 0) { badgeString += parseInt(remainingTimeMin)+"M"; }
    if(remainingTimeSec > 0 && badgeString == '') { badgeString += parseInt(remainingTimeSec)+"S"; }

    chrome.browserAction.setBadgeBackgroundColor({ color: "#ff0000" });
    chrome.browserAction.setBadgeText({ text: badgeString });
}

function getRemainingTime(){
    remainingTimeSec = (remainingMsTime / 1000);
    remainingTimeMin  = (remainingTimeSec / 60);
    remainingTimeSec = Math.floor(remainingTimeSec % 60);
    remainingTimeHr   = Math.floor(remainingTimeMin / 60);
    remainingTimeMin  = Math.floor (remainingTimeMin % 60);

    if(remainingTimeHr < 10) { remainingTimeHr = "0" + remainingTimeHr }
    if(remainingTimeMin < 10) { remainingTimeMin = "0" + remainingTimeMin }
    if(remainingTimeSec < 10) { remainingTimeSec = "0" + remainingTimeSec }

    if(isNaN(remainingTimeHr) || isNaN(remainingTimeMin) || isNaN(remainingTimeSec)){
       return '';
    }
  
    let remainingTimeStr = remainingTimeHr+":"+remainingTimeMin+":"+remainingTimeSec;
    return remainingTimeStr;
}

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === myNotificationID) {
      if (btnIdx === 0) {
	 stopSound();
      }
    }
});

chrome.notifications.onClosed.addListener(function(notifId, btnIdx) {
     if (notifId === myNotificationID) {
	stopSound();     
     }	
});
