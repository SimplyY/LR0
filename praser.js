// 浅复制
Array.prototype.getLastElement = function () {
    return this.slice(-1)[0];
};

function getPraseOutput(sentence, tableItems, aug_productions) {
    function PraseItem(index, stateStackStr, charsStackStr, inputArrayStr, action, goto) {
        this.index = index;
        this.stateStackStr = stateStackStr;
        this.charsStackStr = charsStackStr;
        this.inputArrayStr = inputArrayStr;
        this.action = action;
        this.goto = goto;
    }

    var praseOutput = [];

    var stateStack = [0,];
    var charsStack = ['#',];
    var action;
    var goto;

    // init sentenceArray
    var inputArray = [];
    for (var i = 0; i < sentence.length; i++) {
        if (/[a-z]|#/.test(sentence.charAt(i)) === true) {
            inputArray.push(sentence.charAt(i));
        } else {
            alertSentenceError();
            return;
        }
    }

    i = 0;
    while(true) {
        if (action === 'acc') {
            break;
        }

        var oldStateStack = stateStack.slice();
        var oldCharsStack = charsStack.slice();
        var oldInputArray = inputArray.slice();
        var state = stateStack.getLastElement();
        var char = inputArray[0];
        action = tableItems[state][char];

        if (action === undefined) {
            alertSentenceError();
        }

        // 移近
        if (action.isState === true) {
            charsStack.push(char);
            stateStack.push(action.value);

            inputArray.shift();
        }
        // 规约
        if (action.isProduction === true) {
            var deleteNumber = aug_productions[action.value][1].length;
            stateStack.splice(stateStack.length - deleteNumber);
            charsStack.splice(stateStack.length - deleteNumber);

            var bigChar = aug_productions[action.value][0];
            charsStack.push(bigChar);

            state = stateStack.getLastElement();
            goto = tableItems[state][bigChar];
            stateStack.push(goto);
        }

        setPraseOutput(praseOutput, i, oldStateStack, oldCharsStack, oldInputArray, action, goto);
        i++;
    }

    console.log(praseOutput);

    return getFormatedOutput(praseOutput);

    function setPraseOutput(praseOutput, i, stateStack, charsStack, inputArray, action, goto) {
        var actionStr = action.isState === true ? 'S' + action.value : 'r' + action.value;
        if (action === 'acc') {
            actionStr = 'acc';
        }

        var praseItem = new PraseItem(i + 1, stateStack.join(''), charsStack.join(''), inputArray.join(''), actionStr, goto);

        praseOutput.push(praseItem);
    }

    function getFormatedOutput(praseOutput) {
        var praseOutputString = '步骤\t状态栈\t符号栈\t输入串\tACTION\tGOTO\n';

        for (var i = 0; i < praseOutput.length; i++) {
            var praseItem = praseOutput[i];
            praseOutputString += praseItem.index;
            praseOutputString += '\t' + praseItem.stateStackStr;
            praseOutputString += '\t' + praseItem.charsStackStr;
            praseOutputString += '\t' + praseItem.inputArrayStr;
            praseOutputString += '\t' + praseItem.action;

            if (praseItem.goto === undefined) {
                praseOutputString += '\t';
            } else {
                praseOutputString += '\t' + praseItem.goto;
            }

            praseOutputString += '\n';
        }

        return praseOutputString;
    }
}
