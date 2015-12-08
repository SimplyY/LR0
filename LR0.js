var LR0Items = {
    productions: [],
    aug_productions: [[]],
    symbols:[]
};

// Also creates a list of all symbols in the grammar.
// self.productions like ['E', 'E->E+T', 'E->T', 'T->T*F', 'T->F', 'F->(E)', 'F->i']
function initLR0Items(LR0Items, input_grammar) {
    LR0Items.productions = productions = input_grammar.split('\n');

    LR0Items.aug_productions = [["'", LR0Items.productions[0]]];
    var regex = /([A-Z])->(.*)/;
    for (var i = 1; i < LR0Items.productions.length; i++) {
        m = regex.exec(LR0Items.productions[i]);
        LR0Items.aug_productions.push([m[1], m[2]]);
    }

    LR0Items.symbols = createListOfSymbols();

    // Returns a list of symbols in the grammar, e.g. ['E','B','a']
    function createListOfSymbols() {
        var symbols = [];
        var array = LR0Items.aug_productions;
        for (var i = 0; i < array.length; i++) {
            for (var j = 0; j < array[i][1].length; j++) {
                var char = array[i][1].charAt(j);
                if (char !== '@' && char !== "'" && symbols.indexOf(char) === -1) {
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
    C.push(getClosure(LR0Items, "'", "@" + LR0Items.productions[0]));

    var added = true;
    while(added){
        added = false;
        for (var i = 0; i < C.length; i++) {
            var items = C[i];
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
    var dfaOutput = "\nSets of LR(0) Items\n-------------------" + '\n';
    for (var i = 0; i < items.length; i++) {
        dfaOutput += 'I' + i.toString() +':\n';
        examinedGotoSymbols = [];
        for (var j = 0; j < items[i].length; j++) {
            var item = items[i][j];
            var itemString = item[0] + '->' + item[1];

            var gotoSymbol = dotBeforeSymbol(item[1], false);
            if (gotoSymbol && isInArray(gotoSymbol, examinedGotoSymbols) === false) {
                examinedGotoSymbols.push(gotoSymbol);
                var gotoState = getGotoState(items, rhsWithSymbol(item[1]));
                dfaOutput += '   ' + itemString + '\t\t' + 'goto(' + gotoSymbol + ')=I' + gotoState + '\n';
            } else {
                dfaOutput += '   ' +  itemString + '\n';
            }
        }
        dfaOutput += '\n';
    }
    return dfaOutput;
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
                        var newProd = [prod[0], '@' + prod[1]];
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
        var symbolStr = '@' + symbol;
        if (item[1].indexOf(symbolStr) !== -1) {
            newRHS = item[1].replace('@' + symbol, symbol + '@');
            res = getClosure(LR0Items, item[0], newRHS);
            for (var j = 0; j < res.length; j++) {
                var r = res[j];
//              r isIn gotoResult
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


// Returns a symbol that is preceeded by an '@', or false if no such symbol exists
function dotBeforeSymbol(RHS, nonTerminal) {
    var regex;
    if (nonTerminal) {
        regex =/@([A-Z])/;
    } else {
        regex = /@(.)/;
    }
    var result = regex.exec(RHS);
    if (!result) {
        return undefined;
    } else {
        return result[1];
    }
}

// Returns the state to goto for the right-hand side rhs.
function getGotoState(data, rhs) {
    if (!rhs) {
        return;
    }

    var symbol = dotBeforeSymbol(rhs, false);
    var gotoString = rhs.replace('@' + symbol, symbol + '@');
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            var item = data[i][j];
            if (item[1] === gotoString) {
                return i;
            }
        }
    }
}

// Returns the entire right hand side of a production that contains an '@'
// but only if the '@' is not the last character.
function rhsWithSymbol(RHS) {
    var result = /.*@.+/.exec(RHS);
    if (!result) {
        return undefined;
    } else {
        return result[0];
    }
}