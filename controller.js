Function.prototype.getMultilines = function () {
    return this.toString().slice(15,-4);
};
// set test data
document.addEventListener("DOMContentLoaded", function(event) {
    var inputGrammerDom = document.getElementById('input-grammar');
    inputGrammerDom.value = function () {/*E
E->aA
E->bB
A->cA
A->d
B->cB
B->d
*/}.getMultilines();

    var inputSentenceDom = document.getElementById('input-sentence');
    inputSentenceDom.value = 'bccd#';
});


function praseGrammar() {
    var inputGrammer = document.getElementById('input-grammar').value;

    initLR0Items(LR0Items, inputGrammer);
    var grammer = getAugmentedGrammar(LR0Items);
    var resultItems = getItems(LR0Items);
    var dfaOutput = getDfaOutput(resultItems);
    window.lrPraseTable = getLrPraseTable(resultItems);
    var lrPraseTableString = formatLrPraseTable(lrPraseTable);

    showDfa(dfaOutput);
    showLrPraseTable(lrPraseTableString);

    function showDfa(dfaOutput) {
        var dfaOutputDom = document.getElementById('dfa-output');
        dfaOutputDom.value = dfaOutput;
    }

    function showLrPraseTable(lrPraseTableString) {
        var lrPraseTableDom = document.getElementById('lrPraseTable');
        lrPraseTableDom.value = lrPraseTableString;
    }
}

function praseSentence() {
    var inputSentence = document.getElementById('input-sentence').value;
    if (window.lrPraseTable === undefined) {
        alert('请先生成 LRO 分析表');
        return;
    }

    var praseSentenceOutput = getPraseOutput(inputSentence, lrPraseTable, LR0Items.aug_productions);
    showSentenceOutput(praseSentenceOutput);

    function showSentenceOutput(praseSentenceOutput) {
        var sentenceOutputDom = document.getElementById('sentence-output');
        sentenceOutputDom.value = praseSentenceOutput;
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
