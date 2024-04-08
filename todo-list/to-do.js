// ------------------
// UTILITY FUNCTIONS
// ------------------

// Increment variable to keep track of date changes
let increment = 0;
var recentlyDeletedTasks = [];
var recentlyMovedTasks = [];
let currentTaskEvent = null;
let currentEditingTask = null;

// Function to display the current date
// displayDate()

function displayDate() {
    // Month and Day Names
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var date = new Date();
    let newDate = new Date(date.getTime() + (increment * 24 * 60 * 60 * 1000));
    var day = newDate.getDate();
    var month = monthNames[newDate.getMonth()];
    var dayOfWeek = dayNames[newDate.getDay()];

    var el = document.getElementById("currentdate");
    el.textContent = dayOfWeek + ", " + String(month) + " " + String(day);
    updateLastAccessedDate();
    deleteOldTasks();
    clearTasks();  // Clear all tasks before loading new ones
    loadButtons();  // Load tasks for the new date

    // Get the reference to the 'openButton'
    var openButton = document.getElementById('openButton');

    // Create date objects for today and yesterday
    var today = new Date();
    var yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);  // Get yesterday's date

    // Compare the displayed date (newDate) with yesterday's date
    if (newDate.toDateString() === yesterday.toDateString()) {
        openButton.style.display = 'none';  // Hide the "Open" button if it's the day before today
    } else {
        openButton.style.display = 'inline-block';  // Otherwise, show the "Open" button
    }
}

// Function to show toast notification
// showToast()

function showToast() {
    var toastElement = document.getElementById('toast');
    toastElement.classList.add('show');
    setTimeout(function () {
        toastElement.classList.remove('show');
    }, 3000);
}

// Function to show ShowTaskbar notification
// showSnackBar(), showSnackBarD(), showSnackBarM()

function showSnackBar() {
    var snackBarElement = document.getElementById('snackBar');
    snackBarElement.classList.add('show');
    setTimeout(function () {
        snackBarElement.classList.remove('show');
    }, 5000);
}
function showSnackBarD() {
    var snackBarElement = document.getElementById('snackBarD');
    snackBarElement.classList.add('show');
    setTimeout(function () {
        snackBarElement.classList.remove('show');
    }, 5000);
}
function showSnackBarM() {
    var snackBarElement = document.getElementById('snackBarM');
    snackBarElement.classList.add('show');
    setTimeout(function () {
        snackBarElement.classList.remove('show');
    }, 5000);
}

// Function to convert 12-hour format time to 24-hour format
// convertTo24Hour()

function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'pm') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
}

// Function to convert to 12-hour format
// convertTo12Hour()

function convertTo12Hour(time) {
    let [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;  // Convert hour from "0-23" to "1-12" format
    return `${hours}:${minutes} ${ampm}`;
}

// Function to format a date to a string
// getDateString()

function getDateString(date) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var day = date.getDate();
    var month = monthNames[date.getMonth()];
    return month + " " + day;
}

// Helper function to format time
// formatTime()

function formatTime(hour, minute) {
    hour = parseInt(hour, 10);
    var ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12;
    minute = minute < 10 ? '0' + minute : minute;
    return hour + ':' + minute + ' ' + ampm;
}

// Function to parse time string to Date object
// parseTimeToDate()

function parseTimeToDate(timeStr) {
    // Convert the time string (e.g., "2:21 PM") to a Date object for easy comparison
    var [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    hours = parseInt(hours);
    minutes = parseInt(minutes);
    if (modifier.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier.toLowerCase() === 'am' && hours === 12) hours = 0;

    var date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

// Function to get time from element
// getTimeFromElement()

function getTimeFromElement(element) {
    // Extract time from the timeSection of the task card
    var timeElement = element.querySelector('#timeSection');
    if (!timeElement) return new Date(0); // Return an early date for missing times

    var timeString = timeElement.textContent;
    return parseTimeToDate(timeString);
}

// Function to get the current date
// getCurrentDate()

function getCurrentDate() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var date = new Date();
    let newDate = new Date(date.getTime() + (increment * 24 * 60 * 60 * 1000));
    var day = newDate.getDate();
    var month = monthNames[newDate.getMonth()];
    return month + " " + day;
}

// ----------------------
// TASK MANAGEMENT LOGIC
// ----------------------

// Function to add or update a task
// addOrUpdateTask()

function addOrUpdateTask(taskName, taskTime, isUpdate = false) {
    if (!taskName) return;
    if (!taskTime) return;
    if (isUpdate && currentEditingTask) {
        // If updating, remove the existing task first
        currentEditingTask.remove();
    }

    // The logic for creating a new task card
    var newDiv = document.createElement('div');
    newDiv.className = 'taskcard';

    var newSection = document.createElement('section');
    newSection.textContent = taskName;
    if (taskName.length > 15) {
        newSection.setAttribute('title', taskName);
    }
    newDiv.appendChild(newSection);

    var deleteButton = document.createElement('button');
    deleteButton.setAttribute('onclick', 'remove(this)');
    deleteButton.id = 'deleteButton';
    newDiv.insertBefore(deleteButton, newSection);

    var tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = taskName;
    newDiv.appendChild(tooltip);

    var formattedTime = convertTo12Hour(taskTime);
    var timeSection = document.createElement('section');
    timeSection.id = 'timeSection';
    timeSection.textContent = formattedTime;
    newDiv.appendChild(timeSection);

    var editButton = document.createElement('button');
    editButton.setAttribute('onclick', 'editButtonFunction(event)');
    editButton.id = 'editButton';
    var pushButton = document.createElement('button');
    pushButton.id = 'push';
    pushButton.addEventListener('click', function (event) {
        currentTaskEvent = event;
        document.getElementById('slidePanelPush').classList.add('open');
        document.getElementById('backdrop').style.pointerEvents = 'auto';
        document.getElementById('backdrop').classList.add('dark');
        document.getElementById('textbox').focus();
    });

    var buttonSection = document.createElement('section');
    buttonSection.className = 'buttonSection';
    buttonSection.appendChild(editButton);
    buttonSection.appendChild(pushButton);
    newDiv.appendChild(buttonSection);

    var mainElement = document.querySelector('main');
    var clearDiv = document.getElementById('clear');
    if (clearDiv) {
        mainElement.insertBefore(newDiv, clearDiv);
    } else {
        mainElement.appendChild(newDiv);
    }

    // Get the <main> element
    var mainElement = document.querySelector('main');

    // Get the reference button (the button before which new buttons should be inserted)
    //var clear = document.getElementById('clear');

    // Add the newly created task element
    let taskElements = Array.from(document.querySelectorAll('.taskcard:not(#openButtonTemporary, #clear)'));

    // Add the newly created task element
    taskElements.push(newDiv);

    // Sort the task elements based on their time
    taskElements.sort(function (a, b) {
        let timeA = getTimeFromElement(a);
        let timeB = getTimeFromElement(b);
        return timeA - timeB;
    });

    // Clear existing tasks and append sorted tasks
    mainElement.innerHTML = '';
    taskElements.forEach(function (sortedTask) {
        mainElement.appendChild(sortedTask);
    });

    saveButtons();
    showSnackBar();
    checkForTasks();
    saveTaskTime();
    attachEventListenersToTaskcards();

    if (!isUpdate) {
        // Clear the textbox for the next task only if it's not an update
        document.getElementById('textbox').value = '';
        document.getElementById('timeInput').value = '';
    }
}

// Function to handle the "Open" button click event
// addNewTask()

function addNewTask() {
    var taskName = document.getElementById('textbox').value;  // Get the value from the textbox
    if (!taskName) {
        document.getElementById('textbox').value = '';
        document.getElementById('timeInput').value = '';
        document.getElementById('never').checked = true;
        document.getElementById('days').checked = false;
        document.getElementById('weeks').checked = false;
        return;
    }  // Don't create a new task if the textbox is empty
    var taskTime = document.getElementById('timeInput').value;  // Get the value from the taskTime
    if (!taskTime) {
        document.getElementById('textbox').value = '';
        document.getElementById('timeInput').value = '';
        document.getElementById('never').checked = true;
        document.getElementById('days').checked = false;
        document.getElementById('weeks').checked = false;
        return;
    }  // Don't create a new task if the taskTime is empty
    var nowStr = new Date().toUTCString();

    // Create a new div element
    var newDiv = document.createElement('div');
    // Set className to 'taskcard'
    newDiv.className = 'taskcard';
    newDiv.id = nowStr;

    // Create a new section element
    var newSection = document.createElement('section');
    // Set the new section's text content to the task name
    newSection.textContent = taskName;
    // Set the title attribute to the task name for tooltip if the text is too long
    if (taskName.length > 15) {  // Assume 20 as the character limit
        newSection.setAttribute('title', taskName);
    }

    // Append the new section to the new div
    newDiv.appendChild(newSection);

    // Create a new button element
    var deleteButton = document.createElement('button');
    // Set the new button's onclick attribute to call a function named remove
    deleteButton.setAttribute('onclick', 'remove(this)');
    // Insert the new button before the new section in the new div
    newDiv.insertBefore(deleteButton, newSection);

    // Set the id attribute to 'deleteButton'
    deleteButton.id = 'deleteButton';
    // Create a new button element
    // Create a tooltip div element
    var tooltip = document.createElement('div');
    // Set className to 'tooltip'
    tooltip.className = 'tooltip';
    // Set the tooltip's text content to the task name
    tooltip.textContent = taskName;

    // Append the tooltip to the new div
    newDiv.appendChild(tooltip);

    var formattedTime = convertTo12Hour(taskTime);  // Convert to 12-hour format
    newDiv.dataset.taskTime = formattedTime;

    var timeSection = document.createElement('section');
    timeSection.id = 'timeSection';
    timeSection.textContent = formattedTime;  // Use the formatted time

    newDiv.appendChild(timeSection);

    var editButton = document.createElement('button');
    editButton.setAttribute('onclick', 'editButtonFunction(event)');  // assuming editButtonFunction is the name of your function
    editButton.id = 'editButton';

    var push = document.createElement('button');
    //push.setAttribute('onclick', 'nextDayButtonFunction(event)');
    push.id = 'push';
    // Attach the event listener to the push button
    push.addEventListener('click', function (event) {
        currentTaskEvent = event; // Store the event
        document.getElementById('slidePanelPush').classList.add('open');
        document.getElementById('backdrop').style.pointerEvents = 'auto';
        document.getElementById('backdrop').classList.add('dark');
        document.getElementById('textbox').focus();
    });

    // Create a new section element for holding the new buttons
    var buttonSection = document.createElement('section');
    // Set some attributes or classes if needed
    buttonSection.className = 'buttonSection';

    // Append the new buttons to the new section
    buttonSection.appendChild(editButton);
    buttonSection.appendChild(push);

    // Append the new section to the new div (taskcard)
    newDiv.appendChild(buttonSection);
    //var repeatTaskDaily = false;
    //var repeatTaskWeekly = false;
    var radio = document.querySelector('input[name ="repeat"]:checked');
    if (radio.id === "days") {
        repeatTaskDaily = true;
        repeatDaily(taskName, formattedTime)
    }
    if (radio.id === "weeks") {
        repeatTaskWeekly = true;
        repeatWeekly(taskName, formattedTime)
    }

    // Get the <main> element
    var mainElement = document.querySelector('main');

    // Get the reference button (the button before which new buttons should be inserted)
    //var clear = document.getElementById('clear');

    // Add the newly created task element
    let taskElements = Array.from(document.querySelectorAll('.taskcard:not(#openButtonTemporary, #clear)'));

    // Add the newly created task element
    taskElements.push(newDiv);

    // Sort the task elements based on their time
    taskElements.sort(function (a, b) {
        let timeA = getTimeFromElement(a);
        let timeB = getTimeFromElement(b);
        return timeA - timeB;
    });

    // Clear existing tasks and append sorted tasks
    mainElement.innerHTML = '';
    taskElements.forEach(function (sortedTask) {
        mainElement.appendChild(sortedTask);
    });

    // Save the current state of the buttons to LocalStorage
    saveButtons();
    showSnackBar();
    checkForTasks();
    saveTaskTime();
    // Attach event listeners to loaded taskcard buttons
    attachEventListenersToTaskcards();
    // Clear the textbox for the next task
    document.getElementById('textbox').value = '';
    document.getElementById('timeInput').value = '';
    document.getElementById('never').checked = true;
    document.getElementById('days').checked = false;
    document.getElementById('weeks').checked = false;
}

// Function to handle the remove button click event
// remove()

function remove(buttonElement) {
    var parentDiv = buttonElement.parentElement;
    var taskText = parentDiv.querySelector('section').textContent;
    try {
        var taskTime = parentDiv.querySelector('#timeSection').textContent
    } catch (err) {
        console.error("didn't have the time");
        parentDiv.remove();
        saveButtons();
        return;
    }
    var deletedTaskInfo = { taskText: taskText, taskTime: taskTime, date: getCurrentDate() };
    recentlyDeletedTasks.push(deletedTaskInfo);
    parentDiv.remove();
    saveButtons();
    displayDate();
    checkForTasks();
    showSnackBarD();
}

// Function to clear all tasks
// clearTasks()

function clearTasks() {
    var mainElement = document.querySelector('main');
    var taskCards = document.querySelectorAll('.taskcard:not(#openButton)');  // Select all taskcard elements except the openButton
    taskCards.forEach(card => {
        mainElement.removeChild(card);  // Remove each taskcard element from mainElement
    });
}

// Function to delete old tasks
// deleteOldTasks()

function deleteOldTasks() {
    const lastAccessedDate = new Date(localStorage.getItem('lastAccessedDate'));
    const today = new Date(getCurrentDate());
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fifteenDaysForward = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);

    if (lastAccessedDate < twoDaysAgo) {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
        for (let date in savedTasks) {
            const taskDate = new Date(date);
            if (taskDate < twoDaysAgo || taskDate > fifteenDaysForward) {
                delete savedTasks[date];
            }
        }
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
    }
}

// Function to load saved tasks
// loadButtons()

function loadButtons() {
    const currentDate = getCurrentDate();
    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    var divData = savedTasks[currentDate] || [];
    var savedTimes = JSON.parse(localStorage.getItem('taskTimes')) || {};
    var timesData = (savedTimes[currentDate] || []).reduce((acc, item) => {
        acc[item.taskText] = item.taskTime;
        return acc;
    }, {});
    var mainElement = document.querySelector('main');
    var clearDiv = document.getElementById('clear');

    var today = new Date();
    var yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    var displayedDate = new Date(new Date().getTime() + (increment * 24 * 60 * 60 * 1000));

    if (divData.length === 0 && displayedDate.toDateString() === yesterday.toDateString()) {
        var newDiv = document.createElement('div');
        newDiv.className = 'taskcard';
        newDiv.className = 'taskcard no-tasks';

        var newSection = document.createElement('section');
        newSection.textContent = 'No tasks';

        newDiv.appendChild(newSection);
        var clearDiv = document.getElementById('clear');
        if (clearDiv) {
            mainElement.insertBefore(newDiv, clearDiv);
        } else {
            mainElement.appendChild(newDiv);  // If 'clearDiv' isn't found, append 'newDiv' at the end
        }
    } else {
        divData.forEach(text => {
            var newDiv = document.createElement('div');
            newDiv.className = 'taskcard';

            var newSection = document.createElement('section');
            newSection.textContent = text;
            if (text.length > 15) {
                newSection.setAttribute('title', text);
            }
            newDiv.appendChild(newSection);

            var tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = text;
            newDiv.appendChild(tooltip);

            if (timesData[text]) {
                var timeSection = document.createElement('section');
                timeSection.id = 'timeSection';
                timeSection.textContent = timesData[text]; // Display the saved time
                newDiv.appendChild(timeSection);
            }

            var deleteButton = document.createElement('button');
            deleteButton.setAttribute('onclick', 'remove(this)');
            deleteButton.id = 'deleteButton';

            var editButton = document.createElement('button');
            editButton.setAttribute('onclick', 'editButtonFunction(event)');  // assuming editButtonFunction is the name of your function
            editButton.id = 'editButton';

            var push = document.createElement('button');
            //push.setAttribute('onclick', 'nextDayButtonFunction(event)');
            push.id = 'push';
            // Attach the event listener to the push button
            push.addEventListener('click', function (event) {
                currentTaskEvent = event; // Store the event
                document.getElementById('slidePanelPush').classList.add('open');
                document.getElementById('backdrop').style.pointerEvents = 'auto';
                document.getElementById('backdrop').classList.add('dark');
                document.getElementById('textbox').focus();
            });
            // Create a new section element for holding the new buttons
            var buttonSection = document.createElement('section');
            // Set some attributes or classes if needed
            var buttonSection = document.createElement('section');
            buttonSection.className = 'buttonSection';
            buttonSection.appendChild(editButton);
            buttonSection.appendChild(push);
            newDiv.appendChild(buttonSection);

            // Insert the new button before the new section in the new div
            newDiv.insertBefore(deleteButton, newSection);

            let taskElements = Array.from(document.querySelectorAll('.taskcard:not(#openButtonTemporary, #clear)'));

            // Add the newly created task element
            taskElements.push(newDiv);

            // Sort the task elements based on their time
            taskElements.sort(function (a, b) {
                let timeA = getTimeFromElement(a);
                let timeB = getTimeFromElement(b);
                return timeA - timeB;
            });

            // Clear existing tasks and append sorted tasks
            mainElement.innerHTML = '';
            taskElements.forEach(function (sortedTask) {
                mainElement.appendChild(sortedTask);
            });

            // if(){}
            checkForTasks();
            saveTaskTime();
        });
    }
}

// Function to save buttons/tasks to localStorage
// saveButtons()

function saveButtons() {
    const currentDate = getCurrentDate();
    var divs = Array.from(document.querySelectorAll('.taskcard'))
        .filter(div => div.id !== 'openButton' && !div.classList.contains('no-tasks'));
    var divData = divs.map(div => div.querySelector('section').textContent);

    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};

    // Update tasks for the current date
    savedTasks[currentDate] = divData;

    // Ensure all dates within the 14-day forward and 1-day back range have an entry in savedTasks
    for (let i = -1; i <= 14; i++) {
        let targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        let targetDateString = getDateString(targetDate);

        // If there is no entry for the target date, create an empty array
        if (!savedTasks[targetDateString]) {
            savedTasks[targetDateString] = [];
        }
    }

    localStorage.setItem('tasks', JSON.stringify(savedTasks));
}

// Function to save task time
// saveTaskTime()

function saveTaskTime() {
    const currentDate = getCurrentDate();
    var taskCards = Array.from(document.querySelectorAll('.taskcard'))
        .filter(div => div.id !== 'openButton' && !div.classList.contains('no-tasks'));

    var timeData = taskCards.map(card => {
        const taskText = card.querySelector('section').textContent;
        const taskTime = card.querySelector('#timeSection') ? card.querySelector('#timeSection').textContent : '';
        return { taskText, taskTime };
    });

    var savedTimes = JSON.parse(localStorage.getItem('taskTimes')) || {};
    savedTimes[currentDate] = timeData;
    localStorage.setItem('taskTimes', JSON.stringify(savedTimes));
}

// Function to check and add task card if needed
// checkAndAddTaskCard()

function checkAndAddTaskCard() {
    // Create a new div element
    var newDiv = document.createElement('div');
    // Set className to 'taskcard' and id to 'openButtonTemparary'
    newDiv.className = 'taskcard';
    newDiv.className = 'taskcard temporary';
    newDiv.id = 'openButtonTemparary';

    // Set cursor to pointer
    newDiv.style.cursor = 'pointer';

    // Create a new section element
    var newSection = document.createElement('section');
    // Set the new section's text content to '+'
    newSection.textContent = '+';

    // Append the new section to the new div
    newDiv.appendChild(newSection);

    // Get the <main> element
    var mainElement = document.querySelector('main');

    // Get the reference button (the button before which new buttons should be inserted)
    var clear = document.getElementById('clear');

    if (clear) {
        // If the reference button is found, insert the new div before it
        mainElement.insertBefore(newDiv, clear);
    } else {
        // Otherwise, append the new div at the end
        mainElement.appendChild(newDiv);
    }
    // Add event listener for click action, similar to openButton
    newDiv.addEventListener('click', function () {
        document.getElementById('slidePanel').classList.add('open');
        document.getElementById('backdrop').style.pointerEvents = 'auto';  // Make the backdrop clickable
        document.getElementById('backdrop').classList.add('dark');  // Darken the backdrop
        document.getElementById('textbox').focus();

    });
}

// Function to check for tasks on the current date
// checkForTasks()

function checkForTasks() {
    const currentDate = getCurrentDate();
    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    var divData = savedTasks[currentDate] || [];

    var today = new Date();
    var yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);  // Get yesterday's date
    var displayedDate = new Date(new Date().getTime() + (increment * 24 * 60 * 60 * 1000));

    // Check if there's already an element with the class 'taskcard'
    var existingTaskCard = document.querySelector('.taskcard:not(.temporary)');
    // If there are no tasks, the displayed date is not yesterday, and there's no existing taskcard, run the checkAndAddTaskCard function
    if (divData.length === 0 && displayedDate.toDateString() !== yesterday.toDateString() && !existingTaskCard) {
        checkAndAddTaskCard();
    } else {
        var tempTaskCard = document.getElementById('openButtonTemparary');
        if (tempTaskCard) {  // Check if the element exists before trying to remove it
            tempTaskCard.remove();
        }
        saveButtons();
    }
}

// Function to attach event listeners to taskcards
// attachEventListenersToTaskcards()

function attachEventListenersToTaskcards() {
    // Get all taskcard buttons
    var taskcardButtons = document.querySelectorAll('.taskcard button');

    // Loop through each button and attach the event listener
    taskcardButtons.forEach(function (button) {
        if (button.id === 'editButton') {
            button.removeEventListener('click', editButtonFunction); // Remove existing listener to avoid duplicates
            button.addEventListener('click', editButtonFunction);
        }
    });
}

// Function to handle the edit button functionality
// editButtonFunction()

function editButtonFunction(event) {
    currentEditingTask = event.target.closest('.taskcard');

    // For Task Name
    const editInput = document.getElementById('textboxEdit');
    if (editInput) {
        const currentTaskName = currentEditingTask.querySelector('section').textContent;
        editInput.value = currentTaskName;
    }

    // For Task Time
    const timeInputEdit = document.getElementById('timeInputEdit');
    if (timeInputEdit) {
        let currentTaskTime = currentEditingTask.querySelector('#timeSection') ? currentEditingTask.querySelector('#timeSection').textContent : '';
        timeInputEdit.value = convertTo24Hour(currentTaskTime);
    }

    document.getElementById('slidePanelEdit').classList.add('open');
    document.getElementById('backdrop').style.pointerEvents = 'auto';
    document.getElementById('backdrop').classList.add('dark');
    document.getElementById('textboxEdit').focus();
    document.getElementById('textboxEdit').select();
}

// Functions to handle task repetition
// repeatDaily(), repeatWeekly()

function repeatDaily(name, time) {
    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    var savedTimes = JSON.parse(localStorage.getItem('taskTimes')) || {};

    // Add task for the next 14 days as an example
    for (let i = 1; i <= 14; i++) {
        let targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + i);
        let targetDateString = getDateString(targetDate);

        if (!savedTasks[targetDateString]) {
            savedTasks[targetDateString] = [];
        }
        if (!savedTimes[targetDateString]) {
            savedTimes[targetDateString] = [];
        }

        savedTasks[targetDateString].push(name); // Store just the name string
        savedTimes[targetDateString].push({ taskText: name, taskTime: time }); // Ensure object structure matches expected format
    }

    localStorage.setItem('tasks', JSON.stringify(savedTasks));
    localStorage.setItem('taskTimes', JSON.stringify(savedTimes));
    loadButtons();  // Reload the tasks to reflect the changes
}

/*
when it is first set to repeat check every 7 days based off of date it was created. 
if a variable is false then it will put them there again. 
in edit there will be the option to set the variable to true otomatically and delete all events with that name ahead of it
*/

function repeatWeekly(name, time) {
    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    var savedTimes = JSON.parse(localStorage.getItem('taskTimes')) || {};

    // Calculate the date for the same day next week
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    let targetDateString = getDateString(targetDate);

    if (!savedTasks[targetDateString]) {
        savedTasks[targetDateString] = [];
    }
    if (!savedTimes[targetDateString]) {
        savedTimes[targetDateString] = [];
    }

    savedTasks[targetDateString].push(name); // Store just the name string
    savedTimes[targetDateString].push({ taskText: name, taskTime: time }); // Ensure object structure matches expected format

    localStorage.setItem('tasks', JSON.stringify(savedTasks));
    localStorage.setItem('taskTimes', JSON.stringify(savedTimes));
    loadButtons();  // Reload the tasks to reflect the changes
}


// Function to handle undo delete action
// undoDelete()

function undoDelete() {
    var lastDeletedTaskInfo = recentlyDeletedTasks.pop();
    console.log(lastDeletedTaskInfo);
    var snackBarElement = document.getElementById('snackBarD');
    snackBarElement.classList.remove('show');
    if (lastDeletedTaskInfo) {
        var taskName = lastDeletedTaskInfo.taskText;
        var taskTime = lastDeletedTaskInfo.taskTime;

        // Now re-create the regular task card for the deleted task
        var newDiv = document.createElement('div');
        newDiv.className = 'taskcard';

        var newSection = document.createElement('section');
        newSection.textContent = taskName;
        newDiv.appendChild(newSection);

        var timeSection = document.createElement('section');
        timeSection.id = "timeSection"
        timeSection.textContent = taskTime;
        newDiv.appendChild(timeSection);

        var deleteButton = document.createElement('button');
        deleteButton.setAttribute('onclick', 'remove(this)');
        deleteButton.id = 'deleteButton';
        newDiv.insertBefore(deleteButton, newSection);

        var mainElement = document.querySelector('main');
        var clear = document.getElementById('clear');

        if (clear) {
            mainElement.insertBefore(newDiv, clear);
        } else {
            mainElement.appendChild(newDiv);
        }
        saveButtons();
        saveTaskTime();
        displayDate();
        checkForTasks();

        removePlusTask();
    } else {
        console.log("No tasks to undo delete.");
    }
}

// Function to remove a specific task ('+' task)
// removePlusTask()

function removePlusTask() {
    const mainElement = document.querySelector('main'); // Select the main element
    const tasks = mainElement.querySelectorAll('.taskcard section'); // Assuming each task is in a section inside a .taskcard div
    //console.log('Tasks found:', tasks.length); // Debugging

    tasks.forEach(task => {
        //console.log('Checking task:', task.textContent); // Debugging
        if (task.textContent === '+') {
            //console.log('Removing task:', task.textContent); // Debugging
            task.parentNode.remove(); // Remove the taskcard div that contains the section
        }
    });
}

// Function to handle undo move action
// undoMove()

function undoMove() {
    var snackBarElement = document.getElementById('snackBarM');
    snackBarElement.classList.remove('show');

    if (recentlyMovedTasks.length > 0) {
        let lastMovedTask = recentlyMovedTasks.pop();
        const { taskText, originalDate, daysMoved } = lastMovedTask;

        const movedDate = getDateString(new Date(new Date(originalDate).getTime() + daysMoved * 24 * 60 * 60 * 1000));
        var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
        var savedTimes = JSON.parse(localStorage.getItem('taskTimes')) || {};

        var originalDateTasks = savedTasks[originalDate] || [];
        var originalDateTimes = savedTimes[originalDate] || [];
        var movedDayTasks = savedTasks[movedDate] || [];
        var movedDayTimes = savedTimes[movedDate] || [];

        var taskIndex = movedDayTasks.indexOf(taskText);
        if (taskIndex > -1) {
            movedDayTasks.splice(taskIndex, 1);
            originalDateTasks.push(taskText);

            // Also handle the time
            let movedTimeEntry = movedDayTimes[taskIndex];
            movedDayTimes.splice(taskIndex, 1);
            originalDateTimes.push(movedTimeEntry);
        }

        savedTasks[originalDate] = originalDateTasks;
        savedTasks[movedDate] = movedDayTasks;
        savedTimes[originalDate] = originalDateTimes;
        savedTimes[movedDate] = movedDayTimes;

        localStorage.setItem('tasks', JSON.stringify(savedTasks));
        localStorage.setItem('taskTimes', JSON.stringify(savedTimes));

        clearTasks();
        loadButtons();
        displayDate();
        checkForTasks();
    } else {
        console.log("No more moves to undo.");
    }
}

// Function to handle undo action
// undo()

function undo() {
    // Hide the snackBar
    var snackBarElement = document.getElementById('snackBar');
    snackBarElement.classList.remove('show');

    // Get all elements with the class 'taskcard', excluding the one with id 'openButton'
    var taskcards = Array.from(document.querySelectorAll('.taskcard:not(#openButton)'));
    // Get the last taskcard div
    var lastTaskcard = taskcards[taskcards.length - 1];
    if (lastTaskcard) {
        // Remove the last taskcard div from the DOM
        lastTaskcard.remove();
        // Update the saved data in LocalStorage
        saveButtons();
    }
    checkForTasks();
}

// Functions to move task to next day/week
// nextDayButtonFunction(), nextWeekButtonFunction()

function nextDayButtonFunction() {
    if (!currentTaskEvent) {
        console.log("No task selected to move.");
        return;
    }

    var taskCardDiv = currentTaskEvent.target.closest('.taskcard');
    var taskContent = taskCardDiv.querySelector('section').textContent;
    var taskTime = taskCardDiv.querySelector('#timeSection').textContent;
    taskCardDiv.remove();

    const currentDate = getCurrentDate();
    let newDateObj = new Date(new Date().getTime() + ((increment + 1) * 24 * 60 * 60 * 1000));
    const newDate = getDateString(newDateObj);

    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    var savedTimes = JSON.parse(localStorage.getItem('taskTimes')) || {};
    var currentDayTasks = savedTasks[currentDate] || [];
    var nextDayTasks = savedTasks[newDate] || [];
    var currentDayTimes = savedTimes[currentDate] || [];
    var nextDayTimes = savedTimes[newDate] || [];

    var taskIndex = currentDayTasks.indexOf(taskContent);
    if (taskIndex > -1) {
        currentDayTasks.splice(taskIndex, 1);
        currentDayTimes.splice(taskIndex, 1);
    }
    nextDayTasks.push(taskContent);
    nextDayTimes.push({ taskText: taskContent, taskTime: taskTime });

    savedTasks[currentDate] = currentDayTasks;
    savedTasks[newDate] = nextDayTasks;
    savedTimes[currentDate] = currentDayTimes;
    savedTimes[newDate] = nextDayTimes;

    recentlyMovedTasks.push({ taskText: taskContent, originalDate: currentDate, newDate: newDate, daysMoved: 1 });

    localStorage.setItem('tasks', JSON.stringify(savedTasks));
    localStorage.setItem('taskTimes', JSON.stringify(savedTimes));

    clearTasks();
    loadButtons();
    checkAndAddTaskCard();
    showSnackBarM();
    removePlusTask();
}
function nextWeekButtonFunction() {
    if (!currentTaskEvent) return;

    var taskCardDiv = currentTaskEvent.target.closest('.taskcard');
    var taskContent = taskCardDiv.querySelector('section').textContent;
    var taskTime = taskCardDiv.querySelector('#timeSection').textContent;
    taskCardDiv.remove();

    const currentDate = getCurrentDate();
    let newDateObj = new Date(new Date().getTime() + ((increment + 7) * 24 * 60 * 60 * 1000));
    const newDate = getDateString(newDateObj);

    var savedTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    var savedTimes = JSON.parse(localStorage.getItem('taskTimes')) || {};
    var currentDayTasks = savedTasks[currentDate] || [];
    var nextWeekTasks = savedTasks[newDate] || [];
    var currentDayTimes = savedTimes[currentDate] || [];
    var nextWeekTimes = savedTimes[newDate] || [];

    var taskIndex = currentDayTasks.indexOf(taskContent);
    if (taskIndex > -1) {
        currentDayTasks.splice(taskIndex, 1);
        currentDayTimes.splice(taskIndex, 1);
    }
    nextWeekTasks.push(taskContent);
    nextWeekTimes.push({ taskText: taskContent, taskTime: taskTime });

    savedTasks[currentDate] = currentDayTasks;
    savedTasks[newDate] = nextWeekTasks;
    savedTimes[currentDate] = currentDayTimes;
    savedTimes[newDate] = nextWeekTimes;

    // Add the moved task information to the recentlyMovedTasks array
    recentlyMovedTasks.push({ taskText: taskContent, originalDate: currentDate, newDate: newDate, daysMoved: 7 });

    localStorage.setItem('tasks', JSON.stringify(savedTasks));
    localStorage.setItem('taskTimes', JSON.stringify(savedTimes));

    clearTasks();
    loadButtons();
    checkAndAddTaskCard();
    showSnackBarM();
    removePlusTask();
}

// Function to scroll to top of the page
// scrollToTop()

function scrollToTop() {
    window.scrollTo({
        top: 0, behavior: 'smooth'
    })
}

// Function to check local storage for saved task cards
// checkLocalStorageTaskCards()

function checkLocalStorageTaskCards() {
    // Retrieve the saved tasks from local storage
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));

    if (!savedTasks) {
        console.log('No task cards found in local storage.');
    } else {
        // Initialize a counter for total number of task cards
        let totalTaskCards = 0;

        // Iterate over each date in the saved tasks
        for (let date in savedTasks) {
            // Get the tasks for the current date
            const tasks = savedTasks[date];

            // Log the date and number of tasks for that date
            console.log(`${date} has ${tasks.length} task card(s):`);

            // Iterate over each task and log it
            for (let i = 0; i < tasks.length; i++) {
                console.log(`Task Card #${i + 1} on ${date}: `, tasks[i]);
                totalTaskCards++;
            }
        }

        // Log the total number of task cards found
        console.log(`Total task cards found: ${totalTaskCards}`);
    }
}

// -------------------
// SETTINGS FUNCTIONS
// -------------------

// Function to apply settings
// applySettings()

function applySettings() {
    var notifications = document.querySelector('input[id ="settingsCheck"]:checked')
    if (notifications) {
        console.log("notifications: checked");
    } else {
        console.log("notifications: not checked");
    }
    var radio = document.querySelector('input[name ="theme"]:checked');
    if (radio.id === "theme1") {
        document.getElementById("styleSheetColor").href = "to-do css/theme1.css";
        setStylePreference("to-do css/theme1.css");
    }
    if (radio.id === "theme2") {
        document.getElementById("styleSheetColor").href = "to-do css/theme2.css";
        setStylePreference("to-do css/theme2.css");
    }
    if (radio.id === "theme3") {
        document.getElementById("styleSheetColor").href = "to-do css/theme3.css";
        setStylePreference("to-do css/theme3.css");
    }
    if (radio.id === "theme4") {
        document.getElementById("styleSheetColor").href = "to-do css/theme4.css";
        setStylePreference("to-do css/theme4.css");
    }
    if (radio.id === "theme5") {
        document.getElementById("styleSheetColor").href = "to-do css/theme5.css";
        setStylePreference("to-do css/theme5.css");
    }
    if (radio.id === "theme6") {
        document.getElementById("styleSheetColor").href = "to-do css/theme6.css";
        setStylePreference("to-do css/theme6.css");
    }
}

// Function to set style preference in localStorage
// setStylePreference()

function setStylePreference(styleName) {
    localStorage.setItem('selectedStyle', styleName);
}

//---------------------
// Debug Testing
//---------------------

// Function to clear all tasks from local storage
// clearAllTasks()

function clearAllTasks() {
    localStorage.removeItem('tasks');
    localStorage.removeItem('taskTimes');
    console.warn("all cleared");
    location.reload();
}

// Function to add tasks for testing
// addTasks()

function addTasks() {
    for (var i = 0; i < 5; i++) {

        var taskName = i;
        var taskTime = "12:0" + i;

        // Create a new div element
        var newDiv = document.createElement('div');
        // Set className to 'taskcard'
        newDiv.className = 'taskcard';

        // Create a new section element
        var newSection = document.createElement('section');
        // Set the new section's text content to the task name
        newSection.textContent = taskName;

        // Append the new section to the new div
        newDiv.appendChild(newSection);

        // Create a new button element
        var deleteButton = document.createElement('button');
        // Set the new button's onclick attribute to call a function named remove
        deleteButton.setAttribute('onclick', 'remove(this)');
        // Insert the new button before the new section in the new div
        newDiv.insertBefore(deleteButton, newSection);

        // Set the id attribute to 'deleteButton'
        deleteButton.id = 'deleteButton';
        // Create a new button element
        // Create a tooltip div element
        var tooltip = document.createElement('div');
        // Set className to 'tooltip'
        tooltip.className = 'tooltip';
        // Set the tooltip's text content to the task name
        tooltip.textContent = taskName;

        // Append the tooltip to the new div
        newDiv.appendChild(tooltip);

        var formattedTime = convertTo12Hour(taskTime);  // Convert to 12-hour format

        var timeSection = document.createElement('section');
        timeSection.id = 'timeSection';
        timeSection.textContent = formattedTime;  // Use the formatted time

        newDiv.appendChild(timeSection);

        var editButton = document.createElement('button');
        editButton.setAttribute('onclick', 'editButtonFunction(event)');  // assuming editButtonFunction is the name of your function
        editButton.id = 'editButton';

        var push = document.createElement('button');
        //push.setAttribute('onclick', 'nextDayButtonFunction(event)');
        push.id = 'push';
        // Attach the event listener to the push button
        push.addEventListener('click', function (event) {
            currentTaskEvent = event; // Store the event
            document.getElementById('slidePanelPush').classList.add('open');
            document.getElementById('backdrop').style.pointerEvents = 'auto';
            document.getElementById('backdrop').classList.add('dark');
            document.getElementById('textbox').focus();
        });

        // Create a new section element for holding the new buttons
        var buttonSection = document.createElement('section');
        // Set some attributes or classes if needed
        buttonSection.className = 'buttonSection';

        // Append the new buttons to the new section
        buttonSection.appendChild(editButton);
        buttonSection.appendChild(push);

        // Append the new section to the new div (taskcard)
        newDiv.appendChild(buttonSection);

        // Get the <main> element
        var mainElement = document.querySelector('main');

        // Get the reference button (the button before which new buttons should be inserted)
        var clear = document.getElementById('clear');

        if (clear) {
            // If the reference button is found, insert the new div before it
            mainElement.insertBefore(newDiv, clear);
        } else {
            // Otherwise, append the new div at the end
            mainElement.appendChild(newDiv);
        }

        // Save the current state of the buttons to LocalStorage
        saveButtons();
        showSnackBar();
        checkForTasks();
        saveTaskTime();
        attachEventListenersToTaskcards();
        // Clear the textbox for the next task
    }
}

// Function to clear localStorage completely
// clearIt()

function clearIt() {
    localStorage.clear();
    location.reload();
}

// Function to apply hidden theme
// hiddenTheme()

function hiddenTheme(int) {
    switch (int) {
        case 1:
            document.getElementById("styleSheetColor").href = "to-do css/theme1.css";
            break;
        case 2:
            document.getElementById("styleSheetColor").href = "to-do css/theme2.css";
            break;
        case 3:
            document.getElementById("styleSheetColor").href = "to-do css/theme3.css";
            break;
        case 4:
            document.getElementById("styleSheetColor").href = "to-do css/theme4.css";
            break;
        case 5:
            document.getElementById("styleSheetColor").href = "to-do css/theme5.css";
            break;
        case 6:
            document.getElementById("styleSheetColor").href = "to-do css/theme6.css";
            break;
        case 7:
            document.getElementById("styleSheetColor").href = "to-do css/themeChristmas.css";
            break;
        case 8:
            document.getElementById("styleSheetColor").href = "to-do css/themeNotHere.css";
            break;
        case 9:
            document.getElementById("styleSheetColor").href = "to-do css/themeUmm.css";
            break;
        default:
            console.log("no");
    }
}

// ----------------
// INITIALIZATION
// ----------------

// Attach the addNewButton function to the "Open" button's click event
document.getElementById('closeButton').addEventListener('click', addNewTask);

// Function to initialize application
// initialize()

function initialize() {
    // Set up event listeners
    document.getElementById('openButton').addEventListener('click', function () {
        document.getElementById('slidePanel').classList.add('open');
        document.getElementById('backdrop').style.pointerEvents = 'auto';  /* Make the backdrop clickable */
        document.getElementById('backdrop').classList.add('dark');  /* Darken the backdrop */
        document.getElementById('textbox').focus();
    });
    document.getElementById('settings').addEventListener('click', function () {
        document.getElementById('slidePanelSettings').classList.add('open');
        document.getElementById('backdrop').style.pointerEvents = 'auto';  /* Make the backdrop clickable */
        document.getElementById('backdrop').classList.add('dark');  /* Darken the backdrop */
    });
    document.getElementById('applySettings').addEventListener('click', function () {
        document.getElementById('slidePanelSettings').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
        applySettings();
    });
    document.getElementById('closeButton').addEventListener('click', function () {
        document.getElementById('slidePanel').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
    });
    document.getElementById('closeButtonEdit').addEventListener('click', function () {
        const newTaskName = document.getElementById('textboxEdit').value;
        const newTaskTime = document.getElementById('timeInputEdit').value;
        addOrUpdateTask(newTaskName, newTaskTime, true);

        var radio = document.querySelector('input[name ="repeatEdit"]:checked');
        if (radio.id === "never") {
            console.log("Never: Radio button is checked. Value is: " + radio.value);
        }
        if (radio.id === "days") {
            console.log("Days: Radio button is checked. Value is: " + radio.value);
        }
        if (radio.id === "weeks") {
            console.log("Weeks: Radio button is checked. Value is: " + radio.value);
        }

        document.getElementById('slidePanelEdit').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';
        document.getElementById('backdrop').classList.remove('dark');
        document.getElementById('never').checked = true;
        document.getElementById('days').checked = false;
        document.getElementById('weeks').checked = false;
    });
    document.getElementById('closeButtonPush').addEventListener('click', function () {
        document.getElementById('slidePanelPush').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
    });
    document.getElementById('exitButton').addEventListener('click', function () {
        document.getElementById('slidePanel').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
        document.getElementById('textbox').value = '';
    });
    document.getElementById('exitButtonEdit').addEventListener('click', function () {
        document.getElementById('slidePanelEdit').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
        document.getElementById('textbox').value = '';
    });
    document.getElementById('exitButtonSettings').addEventListener('click', function () {
        document.getElementById('slidePanelSettings').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
    });
    document.getElementById('exitButtonPush').addEventListener('click', function () {
        document.getElementById('slidePanelPush').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
    });
    document.getElementById('backdrop').addEventListener('click', function () {
        document.getElementById('slidePanel').classList.remove('open');
        document.getElementById('slidePanelEdit').classList.remove('open');
        document.getElementById('slidePanelSettings').classList.remove('open');
        document.getElementById('slidePanelPush').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
        document.getElementById('textbox').value = '';
    });
    document.getElementById('nextDay').addEventListener('click', function () {
        document.getElementById('slidePanelPush').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
    });
    document.getElementById('nextWeek').addEventListener('click', function () {
        document.getElementById('slidePanelPush').classList.remove('open');
        document.getElementById('backdrop').style.pointerEvents = 'none';  /* Make the backdrop non-clickable */
        document.getElementById('backdrop').classList.remove('dark');  /* Reset the backdrop */
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            var activeElement = document.activeElement;

            if (activeElement.id === 'textbox') {
                document.getElementById('timeInput').focus();
            } else if (activeElement.id === 'timeInput') {
                const newTaskName = document.getElementById('textboxEdit').value;
                const newTaskTime = document.getElementById('timeInputEdit').value;
                addNewTask();

                document.getElementById('slidePanel').classList.remove('open');
                document.getElementById('backdrop').style.pointerEvents = 'none';
                document.getElementById('backdrop').classList.remove('dark');
            }
        }
    });
    let savedStyle = localStorage.getItem('selectedStyle');
    if (savedStyle) {
        document.getElementById("styleSheetColor").href = savedStyle;
    }
    loadButtons();
    updateLastAccessedDate();
    deleteOldTasks();
    displayDate();
    checkForTasks();
    attachEventListenersToTaskcards();
}

// Execute initialize function on window load
window.onload = initialize;

// Function to move to next date
function movetonext() {
    if (increment < 7) {
        increment++;
        displayDate();
        checkForTasks();
    } else {
        showToast();
    }
}
function movetoprev() {
    if (increment > -1) {
        increment--;
        displayDate();
        checkForTasks();
    } else {
        showToast();
    }
}
function updateLastAccessedDate() {
    const currentDate = getCurrentDate();
    localStorage.setItem('lastAccessedDate', currentDate);
}
function currentDay() {
    increment = 0;
    console.log(increment)
    displayDate();
    checkForTasks();
}
