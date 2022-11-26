var config = {
   testMode: true
};

(function() {
   if (config.testMode) {
       tizen = {
           systeminfo: {
               getPropertyValue: function (a, cb) {
                   console.log('Mock Tizen return 80');
                   cb({level: 1});
               },
               addPropertyValueChangeListener: function () {
                   console.log('Mock Tizen : do nothing');
               },
               removePropertyValueChangeListener: function () {
                   console.log('Mock Tizen : do nothing');
               }
           },
           time: {
               getCurrentDateTime: function () {
                   return new Date();
               }
           },
           ApplicationControl: function () {
               console.log('Mock Tizen ApplicationControl');
           },
           ApplicationControlData: function () {
               console.log('Mock Tizen ApplicationControlData');
           },
           application: {
               launchAppControl: function () {
                   console.log('Mock Tizen launchAppControl');
               }
           }
       };

       document.addEventListener('keydown', (event) => {
           const keyName = event.key;
           console.log(keyName);
           if (keyName === 'Control') {
               // do not alert when only Control key is pressed.
               return;
           }
       
           if (keyName === 'Backspace') {
               try {
                   if (isButtonMode)
                       onClickBackButton();
                   else
                       tizen.application.getCurrentApplication().exit();
               } catch (ignore) {}
           }
       }, false);
   } //TEST_MODE

    var animRequest = 0,
        isInDoubleClickTime = false,
		bClicked = false,
		longClickTimer = 0,
        modeStopwatch = "Pause",
        timePrevFrame,
        timeElapsed = 0,
		lastMinute = -1,
		lastHour = -1,
		lastSecond = -1,
		lastDate = -1,
		isShowing = false,
        isButtonMode = false,
        isCounterOn = false,
        counter = 0,
        is12Type = false,
        isClickGuideTime = false,
        isStopwatchButtonMode = true,
        records = {
            list: [],
            sum: 0,
            avg: 0
        },
		DIGIT_IMG = ["./image/0.png", "./image/1.png", "./image/2.png","./image/3.png", "./image/4.png", "./image/5.png", "./image/6.png", "./image/7.png", "./image/8.png", "./image/9.png"],
		MONTH_IMG = ["./image/jan.png", "./image/feb.png", "./image/mar.png","./image/apr.png", "./image/may.png", "./image/jun.png", "./image/jul.png", "./image/aug.png", "./image/sep.png", "./image/oct.png", "./image/nov.png", "./image/dec.png"];
        
    function updateDigitalWatch(){
        var datetime = tizen.time.getCurrentDateTime(),
        	hour = datetime.getHours(),
        	minute = datetime.getMinutes(),
        	second = datetime.getSeconds(),
        	date = datetime.getDate(),
        	month = datetime.getMonth(),
        	year = datetime.getFullYear();

//        console.log('updateDigitalWatch - start');
        if (is12Type && hour > 12)
            hour -= 12;

        if (hour == 0)
            hour = 12;

        if (lastHour !== hour) {
//        	console.log("hour " + hour);
        	if (hour < 10) {
        		$('#digital-hour-digit1').attr('src','#');
        		$('#digital-hour-digit2').attr('src',DIGIT_IMG[hour]);
        	} else {
        		$('#digital-hour-digit1').attr('src',DIGIT_IMG[parseInt(hour/10)]);
        		$('#digital-hour-digit2').attr('src',DIGIT_IMG[hour%10]);
        	}
        	lastHour = hour;
       	}

        if (lastMinute !== minute) {
//        	console.log("min " + minute);
//        	console.log("parseInt(minute/10) " + parseInt(minute/10));
        	
        	if (minute < 10) {
        		$('#digital-minute-digit1').attr('src',DIGIT_IMG[0]);
        		$('#digital-minute-digit2').attr('src',DIGIT_IMG[minute]);
        	} else {
        		$('#digital-minute-digit1').attr('src',DIGIT_IMG[parseInt(minute/10)]);
        		$('#digital-minute-digit2').attr('src',DIGIT_IMG[minute%10]);
        	}
           	lastMinute = minute;
      	}

        if (lastSecond !== second) {
//        	console.log("min " + minute);
//        	console.log("parseInt(minute/10) " + parseInt(minute/10));
        	
        	if (second < 10) {
        		$('#digital-second-digit1').attr('src',DIGIT_IMG[0]);
        		$('#digital-second-digit2').attr('src',DIGIT_IMG[second]);
        	} else {
        		$('#digital-second-digit1').attr('src',DIGIT_IMG[parseInt(second/10)]);
        		$('#digital-second-digit2').attr('src',DIGIT_IMG[second%10]);
        	}
        	lastSecond = second;
      	}

        if (lastDate !== date) {
//        	console.log("date " + date, "::", month, "::", year);
        	if (date < 10) {
        		$('#digital-day-digit1').attr('src','#');
        		$('#digital-day-digit2').attr('src',DIGIT_IMG[date]);
        	} else {
        		$('#digital-day-digit1').attr('src',DIGIT_IMG[parseInt(date/10)]);
        		$('#digital-day-digit2').attr('src',DIGIT_IMG[date%10]);
        	}
        	
       		$('#digital-month-digit2').attr('src',MONTH_IMG[month]);
        	
    		$('#digital-year-digit1').attr('src',DIGIT_IMG[2]);
    		$('#digital-year-digit2').attr('src',DIGIT_IMG[parseInt((year%1000)/100)]);
    		$('#digital-year-digit3').attr('src',DIGIT_IMG[parseInt((year%100)/10)]);
    		$('#digital-year-digit4').attr('src',DIGIT_IMG[year%10]);
        	lastDate = date;
       	}
    }
   
    /**
     * Sets default event listeners.
     * @private
     */
    function bindEvents() {
        // Add an event listener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden)
                tizen.power.request("SCREEN", "SCREEN_NORMAL");
        });

        // add eventListener for tizenhwkey
        document.addEventListener('tizenhwkey', function(e) {
            if (e.keyName === "back") {
                try {
                    if (isButtonMode)
                        onClickBackButton();
                    else
                        tizen.application.getCurrentApplication().exit();
                } catch (ignore) {}
            }
        });
        
        $('#stopwatch').on('touchstart', touchStartStopwatch);
        $('#stopwatch').on('touchend', touchEndStopwatch);
        $('#stopwatch').on('click', function () {
            if (!isClickGuideTime)
                toggleStopwatch();
        });
        $('#digital-watch').on('click', increaseCounter);
        $('#digital-counter').on('click', increaseCounter);
        $('#lock-icon').on('click', toggleButtonMode);
        $('#record-reset').on('click', resetRecord);
        $('#launch-help').on('click', launchHelp);
        $('.navi-button').on('click', onClickNaviButton);
        $('.onoffswitch-checkbox').on('change', onChangeSwitch);
    }

    function onClickBackButton() {
        if (!isStopwatchButtonMode) {
            increaseCounter();
            return;
        }

        if (isInDoubleClickTime) {
            //handle double click
            isInDoubleClickTime = false;
            resetStopwatch();
            return;
        }

        isInDoubleClickTime = true;
    	toggleStopwatch();
		doubleClickTimer = setTimeout(function () {
            isInDoubleClickTime = false;
        }, 350);
    }

    function touchStartStopwatch(){
    	touchEffectShow();

        bClicked = true;
		longClickTimer = setTimeout(longTouchStopwatch, 1000);
    }

    function touchEndStopwatch(){
		bClicked = false;
		clearTimeout(longClickTimer);
    }

    function longTouchStopwatch(){
		if (bClicked)
            resetStopwatch();

        isClickGuideTime = true;
        setTimeout(function () {
            isClickGuideTime = false;
        }, 800);
    }

    function toggleButtonMode(e){
        e.preventDefault();

        if (isButtonMode) {
            isButtonMode = false;
            $('#lock-icon').attr('data-state', 'unlock');
        } else {
            isButtonMode = true;
            $('#lock-icon').attr('data-state', 'lock');
        }
    }

    function increaseCounter(reset) {
        if (!isCounterOn)
            return;

        counter++;

        if (reset === 'reset')
            counter = 0;

        setCounter(counter);
    }

    function setCounter(number) {
        var digit1, digit2, digit3, digit4, digit5;

        digit1 = parseInt(number/10000);
        digit2 = parseInt((number%10000)/1000);
        digit3 = parseInt((number%1000)/100);
        digit4 = parseInt((number%100)/10);
        digit5 = parseInt(number%10);

        localStorage.setItem('counter', JSON.stringify(number));

        $('#digital-counter-digit1').attr('src',DIGIT_IMG[digit1]);
        $('#digital-counter-digit2').attr('src',DIGIT_IMG[digit2]);
        $('#digital-counter-digit3').attr('src',DIGIT_IMG[digit3]);
        $('#digital-counter-digit4').attr('src',DIGIT_IMG[digit4]);
        $('#digital-counter-digit5').attr('src',DIGIT_IMG[digit5]);
    }

    /**
     * Adds leading zero(s) to a number and make a string of fixed length.
     * @private
     * @param {number} number - A number to make a string.
     * @param {number} digit - The length of the result string.
     * @return {string} The result string
     */
    function addLeadingZero(number, digit) {
        var n = number.toString(),
            i,
            strZero = "";

        for (i = 0; i < digit - n.length; i++) {
            strZero += '0';
        }

        return strZero + n;
    }

    /**
     * Sets the text data to the element.
     * @private
     * @param {Object} elm - An element to be changed.
     * @param {string} data - A text string to set.
     */
    function setText(elm, data) {
        emptyElement(elm);
        elm.appendChild(document.createTextNode(data));
    }

    /**
     * Removes all child of the element.
     * @private
     * @param {Object} elm - The object to be emptied
     * @return {Object} The emptied element
     */
    function emptyElement(elm) {
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }

        return elm;
    }

    /**
     * Resets the stopwatch status.
     * @private
     */
    function resetStopwatch() {
        var elmTextMinute = document.querySelector("#text-swatch-minute"),
            elmTextSecond = document.querySelector("#text-swatch-second"),
            elmTextMsecond = document.querySelector("#text-swatch-msecond");

        // Reset elapsed time variable
        window.cancelAnimationFrame(animRequest);
        animRequest = 0;
        appendRecord(timeElapsed);
        timeElapsed = 0;
        timePrevFrame = 0;
        modeStopwatch = "Pause";

        // Clear all text of labels and angle of needles.
        setText(elmTextMinute, "00");
        setText(elmTextSecond, "00");
        setText(elmTextMsecond, "00");
    }

    /**
     * Toggle the stopwatch to start or pause.
     * @private
     */
    function toggleStopwatch() {
//    	console.log(modeStopwatch);
    	switch (modeStopwatch) {
            case "Pause":
                // Pause -> Start
                modeStopwatch = "Start";
                if (animRequest == 0)
                	animRequest = window.requestAnimationFrame(drawStopwatchAnimationFrame);
                break;
            case "Start":
                // Start -> Pause
                modeStopwatch = "Pause";
                timePrevFrame = 0;
                window.cancelAnimationFrame(animRequest);
                animRequest = 0;
                break;
            default:
                break;
        }
    }

    /**
     * Makes a snapshot of stopwatch screen animation frame,
     * by setting style to elements by elapsed time calculated by timestamp.
     * @private
     * @param {number} timestamp - DOMHighResTimeStamp value passed by requestAnimationFrame.
     */
    function drawStopwatchAnimationFrame(timestamp) {
        var elmTextMinute = document.querySelector("#text-swatch-minute"),
            elmTextSecond = document.querySelector("#text-swatch-second"),
            elmTextMsecond = document.querySelector("#text-swatch-msecond"),
            progress;

//		console.log('drawStopwatchAnimationFrame');

        // Check timestamp of the last frame of animation.
        if (!timePrevFrame) {
            timePrevFrame = timestamp;
        }
        
        // Progress is calculated by difference of timestamps between last time and now.
        progress = timestamp - timePrevFrame;
        // TimeElapsed is sum of progress from each calls.
        timeElapsed += progress;

        // Set time text to the center area
        setText(elmTextMinute, addLeadingZero(Math.floor(timeElapsed / 60000) % 60, 2));
        setText(elmTextSecond, addLeadingZero(Math.floor(timeElapsed / 1000) % 60, 2));
        setText(elmTextMsecond, addLeadingZero(Math.round(timeElapsed / 10) % 100, 2));

        // Save the timestamp to use a reference of last time in next frame.
        timePrevFrame = timestamp;
       	animRequest = window.requestAnimationFrame(drawStopwatchAnimationFrame);
    }
    
    function touchEffectShow(){
    	if (!isShowing) {
    		isShowing = true;
   		
	    	$('#touch-effect').show();
	    	setTimeout(function(){
	    		isShowing = false;
		    	$('#touch-effect').hide();
	    	}, 200);
    	}
    }
    
    /**
     * Initiates the application
     * @private
     */
    function init() {
        bindEvents();
        updateDigitalWatch();
        startOOB();
        digitTimer = setInterval(updateDigitalWatch, 1000);

        var tmp = localStorage.getItem('records');
    	if (tmp != null) {
			records = JSON.parse(tmp);
        }

        tmp = localStorage.getItem('hourMode');
    	if (tmp != null) {
			is12Type = JSON.parse(tmp);
            $('#switch-setting-hourmode').prop("checked", is12Type); 
        }

        tmp = localStorage.getItem('counterMode');
    	if (tmp != null) {
            isCounterOn = JSON.parse(tmp);
            if (isCounterOn) {
                $('#digital-watch-bg').attr('data-state', 'counter');
            } else {
                $('#digital-watch-bg').attr('data-state', 'watch');
            }
            $('#switch-setting-counter').prop("checked", isCounterOn); 
        }

        tmp = localStorage.getItem('buttonMode');
    	if (tmp != null) {
            isStopwatchButtonMode = JSON.parse(tmp);
            $('#switch-setting-buttonmode').prop("checked", isStopwatchButtonMode); 
        }

        tmp = localStorage.getItem('counter');
    	if (tmp != null) {
            counter = JSON.parse(tmp);
            setCounter(counter);
        }

        updateRecordView();

        try {
    		tizen.power.request("SCREEN", "SCREEN_NORMAL");
        } catch (ignore) {
//        	console.log('tizen.power.request error!');
        }
    }

    function onChangeSwitch() {
        var on = $(this).is(":checked");
        console.log(on);
        var type = $(this).attr('data-type');
        if (type == 'counter') {
            isCounterOn = on;
            if (on) {
                increaseCounter('reset');
                $('#digital-watch-bg').attr('data-state', 'counter');
            } else {
                $('#digital-watch-bg').attr('data-state', 'watch');
            }
            localStorage.setItem('counterMode', JSON.stringify(isCounterOn));
        } else if (type == '24mode') {
            is12Type = on;
            localStorage.setItem('hourMode', JSON.stringify(is12Type));
        } else if (type == 'rotation') {
            if (on) {
                $('#background').attr('data-display', 'v');
            } else {
                $('#background').attr('data-display', 'h');
            }
        } else if (type == 'buttonmode') {
            isStopwatchButtonMode = on;
            localStorage.setItem('buttonMode', JSON.stringify(isStopwatchButtonMode));
        }
    }

    function onClickNaviButton() {
        var direction = $(this).attr('data-direction');
        if (direction == 'right') {
            swipeView(true);
        } else {
            swipeView(false);
        }
    }

    function swipeView(isRight) {
        var left = Number($('#container').css('left').split('px')[0]);

        if (isRight) {
            left -= 360;
        } else {
            left += 360;
        }

        if (left < -720)
            left = -720;

        if (left > 0)
            left = 0;

        $('#container').css('left', left + 'px');
    }

    function getTimeString(ms) {
        return [addLeadingZero(Math.floor(ms / 60000) % 60, 2), ':', 
        addLeadingZero(Math.floor(ms / 1000) % 60, 2), '.',
        addLeadingZero(Math.round(ms / 10) % 100, 2)].join('');
    }

    function updateRecordView() {
        var listStr = [];
        for (var i = 0; i < records.list.length; i++) {
            listStr.push('<li>' + getTimeString(records.list[i]) + '</li>');
        }
        $('#record-list').html(listStr.join(''));
        $('.summary .count').text(records.list.length);
        $('.summary .sum').text(getTimeString(records.sum));
        $('.summary .avg').text(getTimeString(records.avg));
    }

    function appendRecord(ms) {
        records.list.push(ms);
        records.sum += ms;
        records.avg = parseInt(records.sum / records.list.length);
        localStorage.setItem('records', JSON.stringify(records));
        updateRecordView();
    }

    function resetRecord() {
        records = {
            list: [],
            sum: 0,
            avg: 0
        };
        localStorage.setItem('records', JSON.stringify(records));
        updateRecordView();
    }

    function startOOB() {
        const LAUNCH_COUNT_KEY = 'launch-count';
        var launchCount = localStorage.getItem(LAUNCH_COUNT_KEY);
        if (launchCount != null) {
            launchCount = Number(launchCount);
            if (isNaN(launchCount) || launchCount < 0)
                launchCount = 1;
            else
                launchCount++;
        } else {
            launchCount = 1;
            launchHelp();
        }
        localStorage.setItem(LAUNCH_COUNT_KEY, launchCount);
    }
    
    function launchHelp() {
        var appid = "tizen.wearablemanager",
        extra_data = [new tizen.ApplicationControlData("type", ["launch-remote-browser"])],
        launch_uri = "https://watch-go.com/3",
        appControlReplyCallback = {
            onsuccess: function(data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].key == "error") {
                        console.log("error: " + data[i].value[0]);
                    }
                }
            }
        };
    
        var appControl = new tizen.ApplicationControl(
                "http://tizen.org/appcontrol/operation/default",
                launch_uri, null, null, extra_data
            );
    
        try {
            tizen.application.launchAppControl(appControl, appid,
                function () {console.log("success");},
                function(e) {console.log("failed : " + e.message);},
                appControlReplyCallback);
        } catch(e) {
            console.log("Error Exception, error name : " + e.name + ", error message : " + e.message);
        }
    }

    window.onload = init();
}());
