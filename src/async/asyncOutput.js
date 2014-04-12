
//TODO: ... rename this to ??? OutputKind? OutputType?
//TODO: ...  doc
var AsyncOutput;
(function (AsyncOutput) {
    AsyncOutput[AsyncOutput["Promise"] = 0] = "Promise";
    AsyncOutput[AsyncOutput["PromiseIterator"] = 1] = "PromiseIterator";
})(AsyncOutput || (AsyncOutput = {}));
module.exports = AsyncOutput;
//# sourceMappingURL=asyncOutput.js.map
