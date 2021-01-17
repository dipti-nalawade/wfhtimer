//import timer  from './timer.js';
let timer = chrome.extension.getBackgroundPage();
let displayTimeLeftId = 0;
let timeLeftStr = 0;
let timerState = '';

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        //call a function to handle a first install
    }else if(details.reason == "update"){
        //call a function to handle an update
    }
});

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['timer_hr', 'timer_min'], function(result) {
        if(result.timer_hr){
            $('#t_hr').val(result.timer_hr);
        }else{
            $('#t_hr').val(0);
        }
        if(result.timer_min){
            $('#t_min').val(result.timer_min);
        }else{
            $('#t_min').val(0);
        }
    });

    timerState = timer.getTimerState();
    handleTimerState(timerState);

    document.getElementById('setTimer').addEventListener('click', setTimerFunc);
    document.getElementById('cancelTimer').addEventListener('click', cancelTimerFunc);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimerFunc);
    document.getElementById('restartTimer').addEventListener('click', restartTimerFunc);

    function setTimerFunc(){
        let hr = $('#t_hr').val();
		let min = $('#t_min').val();

		try{
            timer.setTimer(hr, min);
            displayTimeLeftId =  setInterval(() => updateTimeLeft(), 1000);

            $("#cancel_btn_div").show();
            $("#set_btn_div").hide();

            $("#err_div").html('Timer Set Successfully!');
		} catch(err){
			$("#err_div").html(err);
        }
        
        chrome.storage.sync.set({timer_hr: hr});
        chrome.storage.sync.set({timer_min: min});
       
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
            $("#err_div").html('Timer is restarted');
		} catch(err){
			$("#err_div").html(err);
		}
		setTimeout(() => { $("#err_div").html(''); }, 5000);
    }

    function handleTimerState(timerState){
        if(timerState == ''){
            $("#cancel_btn_div").hide();
            $("#set_btn_div").show();
            if(displayTimeLeftId > 0){
                clearTimeout(displayTimeLeftId);
            }
        }
        else if(timerState == 'set'){
            $("#cancel_btn_div").show();
            $("#set_btn_div").hide();
        }
        else if(timerState == 'paused'){
            $("#cancel_btn_div").hide();
            $("#set_btn_div").show();
        }
    }

    function updateTimeLeft(){
        timerState = timer.getTimerState();
        handleTimerState(timerState);
    }
  
});
