document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('submit').addEventListener('click',save_options);

function restore_options() {
    chrome.storage.sync.get(['timer_hr', 'timer_min'], function(result) {
        document.getElementById('t_hr').value = result.timer_hr;
        document.getElementById('t_min').value = result.timer_min;
    });
}

function save_options() {
    var t_hr = document.getElementById('t_hr').value;
    var t_min = document.getElementById('t_min').value;
    chrome.storage.sync.set({
        timer_hr: t_hr,
        timer_min: t_min
    }, function() {
        try{
            var tstate = chrome.extension.getBackgroundPage().getTimerState();
            if(tstate != ''){
                chrome.extension.getBackgroundPage().cancelTimer();
            }
            chrome.extension.getBackgroundPage().setTimer(t_hr, t_min);

            document.getElementById('msg').textContent = 'Options saved.';
            setTimeout(function() {
                document.getElementById('msg').textContent = '';
            }, 5000);
        } catch(err){document.getElementById('msg').textContent = 'Options saved.';
            setTimeout(function() {
                document.getElementById('msg').textContent = err;
            }, 5000);
        }
    });
}