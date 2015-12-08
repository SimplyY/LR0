function praseGrammar() {
    var inputGrammer = document.getElementById('input-grammar').value;

    initLR0Items(LR0Items, inputGrammer);
    var grammer = getAugmentedGrammar(LR0Items);
    var resultItems = getItems(LR0Items);
    var dfaOutput = getDfaOutput(resultItems);

    var dfaOutputDom = document.getElementById('dfa-output');
    dfaOutputDom.value = dfaOutput;
}
