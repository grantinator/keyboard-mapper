const ruleArea = document.getElementById("rule-area");
const editorArea = document.getElementById("user-input-area");
const newRuleButton = document.getElementById("new-rule-btn");
const clearRuleButton = document.getElementById("clear-rule-btn");
const randomMapButton = document.getElementById("random-map-button");
const selectBox = document.getElementById("demo-maps");
const zalgoSlider = document.getElementById("zalgo-slider");
const regex = /^[a-z0-9]{1}$/i;
var sessionKeyMap = {};
//AWS SETUP
AWS.config.region = "us-east-1";
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: "us-east-1:5573c699-1030-4753-aff7-e83346d7172f"});

document.addEventListener("DOMContentLoaded", function(event) {
    //AWS ASYNC STUFF
    var dynamodb = new AWS.DynamoDB();
    var params = {
        TableName: "KeyboardMapperTable"
    };
    dynamodb.scan(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            const mapArray = [];
            data.Items.forEach(function(mapObj, index) {
                var currentOption = document.createElement("option");
                currentOption.value = JSON.stringify(JSON.parse(mapObj.map.S));
                currentOption.innerHTML = mapObj.mapName.S;
                selectBox.appendChild(currentOption);
            });
        }
    });
    //----------------
    editorArea.addEventListener("keydown", function(event) {
        var pressedKey = event.key;
        if (regex.test(pressedKey)) {
            event.preventDefault();
            var translatedKey = editorCharEntered(pressedKey);
            if (zalgoSlider.value > 0) {
                editorArea.textContent += zalgo(translatedKey, zalgoSlider.value);
            } else {
                editorArea.textContent += translatedKey;
            }
            placeCaretAtEnd(editorArea);
        }
    });
    ruleArea.addEventListener("input", function(event) {   
        var fromInput = event.target.parentNode.querySelector("#from-input").value;
        var toInput = event.target.parentNode.querySelector("#to-input").value;
        if (fromInput.length == 0 || toInput.length == 0) {
            return
        } else if (regex.test(fromInput) && regex.test(toInput)){
            updateMap(fromInput, toInput);
        }
    });
})

function updateMap(fromChar, toChar) {
    sessionKeyMap[fromChar] = toChar
}

function createRuleBox() {
    var ruleBox = document.createElement("div");
    ruleBox.id += "rule-box";
    var fromBox = document.createElement("input");
    fromBox.type = "text";
    fromBox.id += "from-input";
    var toBox = document.createElement("input");
    toBox.type = "text";
    toBox.id += "to-input";

    ruleBox.appendChild(fromBox);
    ruleBox.appendChild(toBox);
    return ruleBox;
}

function addRule() {
    var currentRuleBox = createRuleBox();
    ruleArea.appendChild(currentRuleBox);
    return currentRuleBox;
}

function addPremadeRule(fromChar, toChar) {
    var currentRuleBox = createRuleBox();
    ruleArea.appendChild(currentRuleBox);
    populateRuleBox({[fromChar]: toChar}, currentRuleBox);
    return currentRuleBox;
}

function populateRuleBox(mapping, ruleBox) {
    var fromInput = ruleBox.querySelector("#from-input");
    var toInput = ruleBox.querySelector("#to-input");
    fromInput.value = Object.keys(mapping)[0];
    toInput.value = mapping[Object.keys(mapping)[0]];
    return ruleBox;
}

function editorCharEntered(inputChar) {
    if (sessionKeyMap.hasOwnProperty(inputChar)) {
        return sessionKeyMap[inputChar];
    } else {
        return inputChar;
    }
}

function clearCurrentRules() {
    while (ruleArea.firstChild) {
        ruleArea.removeChild(ruleArea.lastChild);
    }
    sessionKeyMap = {};
}

function loadRules(optionId, rulesList) {
    if (optionId === "placeholder") {
        return;
    }
    clearCurrentRules();
    if (rulesList.constructor !== ([]).constructor) {
        rulesList = JSON.parse(rulesList);
    }
    for (var key in rulesList) {
        if (rulesList.hasOwnProperty(key) && regex.test(key) && regex.test(rulesList[key])) {
            addPremadeRule(key, rulesList[key])
            updateMap(key, rulesList[key]);
        }
    }
}

function zalgo(char, intensity) {
    const unicodeStart = 0x0300;
    const unicodeEnd = 0x036F;
    for (i=0; i < intensity; i++) {
        char += String.fromCharCode(unicodeStart + Math.random() * (unicodeEnd - unicodeStart));
    }
    return char;
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
    }
}

function initiateZalgo(value) {
    if (value == 0) {
        if (document.body.classList.contains("zalgo-mode")) {
            document.body.classList.remove("zalgo-mode");
            newRuleButton.classList.remove("zalgo-mode");
            clearRuleButton.classList.remove("zalgo-mode");
            randomMapButton.classList.remove("zalgo-mode");
        }
    } else if (value > 0 ) {
        document.body.classList.add("zalgo-mode");
        newRuleButton.classList.add("zalgo-mode");
        clearRuleButton.classList.add("zalgo-mode");
        randomMapButton.classList.add("zalgo-mode");
    }
}

function shuffleArray(array) {
    // Fisher-yates shuffle
    var shuffleBorder = array.length, temp, swapNdx;
    while (shuffleBorder > 0) {
        swapNdx = Math.floor(Math.random() * shuffleBorder--);
        temp = array[shuffleBorder];
        array[shuffleBorder] = array[swapNdx];
        array[swapNdx] = temp; 
    }
    return array;
}

function generateAlphabetArray() {
    var resultArray = []
    var start = 'a'.charCodeAt(0);
    var end = 'z'.charCodeAt(0);

    while(start <= end) {
        resultArray.push(String.fromCharCode(start))
        start++;
    }
    return resultArray;
}

function generateRandomMap() {
    var keyArray = generateAlphabetArray();
    var valueArray = shuffleArray(generateAlphabetArray());

    if (keyArray.length == valueArray.length) {
        sessionKeyMap = {}

        keyArray.forEach(function(keyChar, ndx) {
            updateMap(keyChar, valueArray[ndx]);
        });
    }
}

function createRandomRuleMap() {
    clearCurrentRules();
    generateRandomMap();

    for (key in sessionKeyMap) {
        if (sessionKeyMap.hasOwnProperty(key)) {
            addPremadeRule(key, sessionKeyMap[key]);
        }
    }
}