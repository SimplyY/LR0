var LR0Items = {
    productions: [],
    aug_productions: [[]],
    symbols:[]
};

// Also creates a list of all symbols in the grammar.
// self.productions like ['E', 'E->E+T', 'E->T', 'T->T*F', 'T->F', 'F->(E)', 'F->i']
function initLR0Items(LR0Items, input_grammar) {
    LR0Items.productions = productions = input_grammar.split('\n');

    LR0Items.aug_productions = [[LR0Items.productions[0] + "'", LR0Items.productions[0]]];
    var regex = /([A-Z])->(.*)/;
    for (var i = 1; i < LR0Items.productions.length; i++) {
        m = regex.exec(LR0Items.productions[i]);
        LR0Items.aug_productions.push([m[1], m[2]]);
    }

    LR0Items.symbols = createListOfSymbols();
    LR0Items.symbols.sort();

    // Returns a list of symbols in the grammar, e.g. ['E','B','a']
    function createListOfSymbols() {
        var symbols = [];
        var array = LR0Items.aug_productions;
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array[i][1].length; j++) {
                var char = array[i][1].charAt(j);
                if (char !== '·' && char !== LR0Items.productions[0] + "'" && symbols.indexOf(char) === -1) {
                    symbols.push(char);
                }
            }
        }
        return symbols;
    }

    return LR0Items;
}

// Prints the augmented grammar
function getAugmentedGrammar(LR0Items) {
    var grammer = 'Augmented Grammar\n-----------------' + '\n';
    array = LR0Items.aug_productions;
    for (var i = 0; i < array.length; i++) {
        grammer += array[i][0] + '->' + array[i][1] + '\n';
    }
    return grammer;
}

// The main function to calculate LR(0) items.
function getItems(LR0Items) {
    var C = [];
    C.push(getClosure(LR0Items, LR0Items.productions[0] + "'", "·" + LR0Items.productions[0]));

    var added = true;
    while(added){
        added = false;
        for (var i = 0; i < C.length; i++) {
            var items = C[i];
            C[i].goto = {};
            for (var j = 0; j < LR0Items.symbols.length; j++) {
                var symbol = LR0Items.symbols[j];
                goto_result = getGotoResult(LR0Items, items, symbol);
                // TODO
                if (goto_result && isInArray(goto_result, C) === false) {
                    C.push(goto_result);
                    added = true;
                }
            }
        }
    }

    return C;
}

function getDfaOutput(items) {
    var dfaOutput = "Sets of LR(0) Items\n-------------------" + '\n';
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        dfaOutput += 'I' + i.toString() +':\n';
        examinedGotoSymbols = [];
        for (var j = 0; j < items[i].length; j++) {
            var line = items[i][j];
            var itemString = line[0] + '->' + line[1];

            var gotoSymbol = dotBeforeSymbol(line[1], false);
            if (gotoSymbol && isInArray(gotoSymbol, examinedGotoSymbols) === false) {
                examinedGotoSymbols.push(gotoSymbol);
                var gotoState = getGotoState(items, rhsWithSymbol(line[1]), i, j);
                dfaOutput += '   ' + itemString + '\t' + 'goto(' + gotoSymbol + ')=I' + gotoState + '\n';

                item.goto[gotoSymbol] = gotoState;
            } else {
                dfaOutput += '   ' +  itemString + '\n';
            }
        }
        dfaOutput += '\n';
    }
    return dfaOutput;
}

function getLrPraseTable(items) {
    function Action(value, isState, isProduction) {
        this.value = value;
        this.isState = isState;
        this.isProduction = isProduction;
    }

    var lrPraseTable = [];
    var symbols = LR0Items.symbols;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        lrPraseTable.push({});
        for (var j = 0; j < symbols.length; j++) {
            var symbol = symbols[j];
            if (/[a-z]/.test(symbol)) {
                lrPraseTable[i][symbol] = getAction(item, symbol);
            }
            if (/[A-Z]/.test(symbol)) {
                lrPraseTable[i][symbol] = getGOTOState(item, symbol);
            }
        }
    }

    setEndAction(lrPraseTable, symbols);

    return lrPraseTable;

    function getAction(item, symbol) {
        var action, value;
        // 当 item 没有 goto 一个的 state，此 item 就规约 item，此时 item.goto 为空对象
        if (JSON.stringify(item.goto) === JSON.stringify({})) {
            // 得到规约 item 的 Action,即规约的产生式序号
            for (var i = 0; i < LR0Items.aug_productions.length; i++) {
                var production = LR0Items.aug_productions[i];
                if (item[0].toString().split('·')[0] === production.toString()) {
                    value = i;
                }
            }
            if (value) {
                action = new Action(value, false, true);
            }
            return action;
        } else {
            // 否则为item 的Action状态
            var state = item.goto[symbol];
            if (state) {
                action = new Action(state, true, false);
            }
            return action;
        }
    }

    function getGOTOState(item, symbol) {
        var state = item.goto[symbol];
        return state;
    }

    function setEndAction(lrPraseTable, symbols) {
        for (var i = 0; i < lrPraseTable.length; i++) {
            for (var j = 0; j < symbols.length; j++) {
                var symbol = symbols[j];
                if (/[a-z]/.test(symbol) && lrPraseTable[i][symbol] && lrPraseTable[i][symbol].isProduction) {
                    lrPraseTable[i]['#'] = lrPraseTable[i][symbol];
                }
            }
        }
        lrPraseTable[1]['#'] = 'acc';
    }
}

function formatLrPraseTable(lrPraseTable) {
    String.prototype.repeat = function(num){//创建repeat方法
        return new Array(num + 1).join(this);//创建个数为重复次数+1的数组，用字符串自身做为分隔符连接起来
    };
    var symbols = LR0Items.symbols;

    var lrPraseTableString = '状态\t\tACTION\t\t\t\tGOTO\n';
    lrPraseTableString += drawLine();

    // draw colomnAttribute
    lrPraseTableString += '\t' + drawIntervalLine();
    for (var i = 0; i < symbols.length; i++) {
        if (/[a-z]/.test(symbols[i])) {
            lrPraseTableString += symbols[i] + ' ' + drawIntervalLine();
        }
    }
    lrPraseTableString += '# ' + drawIntervalLine();
    for (i = 0; i < symbols.length; i++) {
        if (/[A-Z]/.test(symbols[i])) {
            lrPraseTableString += symbols[i] + ' ' +  drawIntervalLine();
        }
    }
    lrPraseTableString += '\n' + drawLine();

    // draw table value
    for (i = 0; i < lrPraseTable.length; i++) {
        var item = lrPraseTable[i];
        lrPraseTableString += 'I' + i;
        lrPraseTableString += '\t' + drawIntervalLine();

        for (var j = 0; j < symbols.length; j++) {
            if (/[a-z]/.test(symbols[j]) && lrPraseTable[i][symbols[j]]) {
                if (lrPraseTable[i][symbols[j]].isState === true) {
                    lrPraseTableString += 's';
                }
                if (lrPraseTable[i][symbols[j]].isProduction === true) {
                    lrPraseTableString += 'r';
                }
                lrPraseTableString += lrPraseTable[i][symbols[j]].value;
                lrPraseTableString += drawIntervalLine();
            }

            if (/[a-z]/.test(symbols[j]) && lrPraseTable[i][symbols[j]] === undefined) {
                lrPraseTableString += drawBlank();
            }
        }
        if (lrPraseTable[i]['#'] === undefined) {
            lrPraseTableString += drawBlank();
        } else if (lrPraseTable[i]['#'] === 'acc') {
            lrPraseTableString += 'acc' + drawIntervalLine().slice(1);
        } else if (lrPraseTable[i]['#'].isProduction === true ) {
            lrPraseTableString += 'r' + lrPraseTable[i]['#'].value + drawIntervalLine();
        }


        for (j = 0; j < symbols.length; j++) {
            if (/[A-Z]/.test(symbols[j]) && lrPraseTable[i][symbols[j]]){
                if (lrPraseTable[i][symbols[j]] < 10) {
                    lrPraseTableString += lrPraseTable[i][symbols[j]] + ' ';
                } else {
                    lrPraseTableString += lrPraseTable[i][symbols[j]];
                }
                lrPraseTableString += drawIntervalLine();
            }
            if (/[A-Z]/.test(symbols[j]) && lrPraseTable[i][symbols[j]] === undefined) {
                lrPraseTableString += '  ';
                lrPraseTableString += drawIntervalLine();
            }
        }

        lrPraseTableString += '\n';
    }

    return lrPraseTableString;

    function drawLine() {
        return '-'.repeat(70) + '\n';
    }
    function drawIntervalLine() {
        return '  |  ';
    }
    function drawBlank() {
        return '  ' + drawIntervalLine();
    }
}

// Returns the closure of a production as a list of tuples
function getClosure(LR0Items, LHS, RHS) {
    var J = [[LHS, RHS]];

    var done = [];
    var added = true;
    while (added) {
        added = false;
        for (var i = 0; i < J.length; i++) {
            var item =  J[i];
            var nextClosureChar = dotBeforeSymbol(item[1], true);
            if (nextClosureChar && done.indexOf(nextClosureChar) === -1) {
                done.push(nextClosureChar);
                for (var j = 1; j < LR0Items.aug_productions.length; j++) {
                    var prod = LR0Items.aug_productions[j];
                    if (prod[0] === nextClosureChar) {
                        var newProd = [prod[0], '·' + prod[1]];
                        J.push(newProd);
                        added = true;
                    }
                }
            }
        }
    }

    return J;
}

function isInArray(element, array) {
    for (var i = 0; i < array.length; i++) {
        if (JSON.stringify(element) === JSON.stringify(array[i])) {
            return true;
        }
    }
    return false;
}

// Returns the state to goto for the right-hand side rhs.
function getGotoResult(LR0Items, set_of_items, symbol) {
    var gotoResult = [];
    for (var i = 0; i < set_of_items.length; i++) {
        var item = set_of_items[i];
        var symbolStr = '·' + symbol;
        if (item[1].indexOf(symbolStr) !== -1) {
            newRHS = item[1].replace('·' + symbol, symbol + '·');
            res = getClosure(LR0Items, item[0], newRHS);
            for (var j = 0; j < res.length; j++) {
                var r = res[j];
                // r isIn gotoResult
                if (isInArray(r, gotoResult) === false) {
                    gotoResult.push(r);
                }
            }
        }
    }
    if (gotoResult.length === 0) {
        return undefined;
    }
    return gotoResult;
}

// Returns a symbol that is preceeded by an '·', or false if no such symbol exists
function dotBeforeSymbol(RHS, nonTerminal) {
    var regex;
    if (nonTerminal) {
        regex =/·([A-Z])/;
    } else {
        regex = /·(.)/;
    }
    var result = regex.exec(RHS);
    if (!result) {
        return undefined;
    } else {
        return result[1];
    }
}

// Returns the state to goto for the right-hand side rhs.
function getGotoState(data, rhs, oldIndexI, oldIndexJ) {
    if (!rhs) {
        return;
    }

    var symbol = dotBeforeSymbol(rhs, false);
    var gotoString = rhs.replace('·' + symbol, symbol + '·');
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            var item = data[i][j];
            if (item[1] === gotoString && item[0] === data[oldIndexI][oldIndexJ][0]) {
                return i;
            }
        }
    }
}

// Returns the entire right hand side of a production that contains an '·'
// but only if the '·' is not the last character.
function rhsWithSymbol(RHS) {
    var result = /.*·.+/.exec(RHS);
    if (!result) {
        return undefined;
    } else {
        return result[0];
    }
}
