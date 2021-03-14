//import timer  from './timer.js';
let timer = chrome.extension.getBackgroundPage();
let remainingMsSec= 0 ;
let hr = 0;
let min = 0;
let timerState = '';
let remainingTimeId;
let remainingTimeStr = '';

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        $("#time_left").hide();
        $("#set_btn_div").show();
    }
});

showRemainingTime();
remainingTimeId = setInterval(showRemainingTime, 500);

document.getElementById('setTimer').addEventListener('click', setWorkingHours);
document.getElementById('cancelTimer').addEventListener('click', cancelTimerFunc);
document.getElementById('pauseTimer').addEventListener('click', pauseTimerFunc);
document.getElementById('restartTimer').addEventListener('click', restartTimerFunc);

function setWorkingHours(){
    hr = $('#t_hr').val();
    min = $('#t_min').val();
   
    if(hr == ''){ hr = 0; }
    if(min == ''){ min = 0; }

    chrome.storage.sync.set({timer_hr: hr});
    chrome.storage.sync.set({timer_min: min});

    try{
        timer.setTimer(hr, min);

        $("#cancel_btn_div").show();
        $("#set_btn_div").hide();
        $("#submit_btn_div").hide();

        $("#err_div").html('Timer Set Successfully!');
    } catch(err){
        $("#err_div").html(err);
    }
   
    setTimeout(() => { $("#err_div").html(''); }, 5000);
}

function cancelTimerFunc(){
    try{
        timer.cancelTimer();
        $("#err_div").html('Timer is cancelled');
        chrome.storage.sync.set({timer_hr: 0});
        chrome.storage.sync.set({timer_min: 0});
        $("#cancel_btn_div").hide();
        $("#set_btn_div").show();

    } catch(err){
        $("#err_div").html(err);
    }
    setTimeout(() => { $("#err_div").html(''); }, 5000);
}

function pauseTimerFunc(){
    try{
        timer.pauseTimer();
        $("#err_div").html('Timer is paused');
    } catch(err){
        $("#err_div").html(err);
    }
    setTimeout(() => { $("#err_div").html(''); }, 5000);
}

function restartTimerFunc(){
    try{
        timer.restartTimer();
        $("#err_div").html('Timer is set');
    } catch(err){
        $("#err_div").html(err);
    }
    setTimeout(() => { $("#err_div").html(''); }, 5000);
    remainingTimeId =  setInterval(showRemainingTime, 500);
}

function showRemainingTime(){
    timerState = timer.getTimerState();
    if(timerState == 'set'){
        $("#cancel_btn_div").show();
        $("#time_left").show();
        $("#submit_btn_div").hide();
        $("#set_btn_div").hide();

        remainingTimeStr = timer.getRemainingTime();
        if(remainingTimeStr != ''){
            document.getElementById('time_left').innerHTML = "Time Left : "+remainingTimeStr;
	    showBadge(remainingTimeStr);
        } else{
            document.getElementById('time_left').innerHTML = remainingTimeStr;
    	    timerState = timer.getTimerState();
	    if(timerState == ''){	
              clearTimeout(remainingTimeId);
	    }
        }
    } else if(timerState == ''){ 
        $("#submit_btn_div").show();
        $("#set_btn_div").show();
        $("#cancel_btn_div").hide();
        $("#time_left").hide();
    } else if(timerState == 'paused'){
        clearTimeout(remainingTimeId);
    }
}

function showBadge(timeStr){
    let badgeString = '';	
    let remainingTimeArr = timeStr.split(":");
    if(remainingTimeArr[0] > 0) { badgeString += parseInt(remainingTimeArr[0])+'H'; }
    if(remainingTimeArr[1] > 0) { badgeString += parseInt(remainingTimeArr[1])+'M'; }
    if(remainingTimeArr[2] > 0 && badgeString == ''){ badgeString = parseInt(remainingTimeArr[2])+'S'; }

    chrome.browserAction.setBadgeBackgroundColor({ color: "#ff0000" });
    chrome.browserAction.setBadgeText({text: badgeString });
	
}

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === myNotificationID) {
      if (btnIdx === 0) {
         stopSound();
      }
    }
});

