function praseGrammar() {
    var inputGrammer = document.getElementById('input-grammar').value;

    initLR0Items(LR0Items, inputGrammer);
    var grammer = getAugmentedGrammar(LR0Items);
    var resultItems = getItems(LR0Items);
    var dfaOutput = getDfaOutput(resultItems);
    var lrPraseTable = getLrPraseTable(resultItems);

    showDfa(dfaOutput);
    showLrPraseTable(lrPraseTable);

    function showDfa(dfaOutput) {
        var dfaOutputDom = document.getElementById('dfa-output');
        dfaOutputDom.value = dfaOutput;
    }

    function showLrPraseTable(lrPraseTable) {
        var lrPraseTableDom = document.getElementById('lrPraseTable');
        lrPraseTableDom.value = lrPraseTable;
    }
}


function alertSentenceError() {
    alert(' 句子输入错误，请重新输入 ');
}

// // 如果 state 为空，句子出错
// if (state === undefined) {
//     alertSentenceError();
//     return;
// }
