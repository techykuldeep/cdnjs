"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../environment");
var globals_1 = require("../globals");
var ops_1 = require("../ops/ops");
var optimizer_1 = require("./optimizer");
var AdagradOptimizer = (function (_super) {
    __extends(AdagradOptimizer, _super);
    function AdagradOptimizer(learningRate, initialAccumulatorValue) {
        if (initialAccumulatorValue === void 0) { initialAccumulatorValue = 0.1; }
        var _this = _super.call(this) || this;
        _this.learningRate = learningRate;
        _this.initialAccumulatorValue = initialAccumulatorValue;
        _this.accumulatedGrads = {};
        _this.c = globals_1.keep(ops_1.scalar(-learningRate));
        _this.epsilon = globals_1.keep(ops_1.scalar(1e-8));
        return _this;
    }
    AdagradOptimizer.prototype.applyGradients = function (variableGradients) {
        var _this = this;
        var _loop_1 = function (variableName) {
            var value = environment_1.ENV.engine.registeredVariables[variableName];
            if (this_1.accumulatedGrads[variableName] == null) {
                var trainable_1 = false;
                globals_1.tidy(function () {
                    _this.accumulatedGrads[variableName] =
                        ops_1.fill(value.shape, _this.initialAccumulatorValue)
                            .variable(trainable_1);
                });
            }
            var gradient = variableGradients[variableName];
            var accumulatedGrad = this_1.accumulatedGrads[variableName];
            globals_1.tidy(function () {
                var newAccumulatedGrad = accumulatedGrad.add(gradient.square());
                _this.accumulatedGrads[variableName].assign(newAccumulatedGrad);
                var newValue = _this.c
                    .mul(gradient.div(newAccumulatedGrad.add(_this.epsilon).sqrt()))
                    .add(value);
                value.assign(newValue);
            });
        };
        var this_1 = this;
        for (var variableName in variableGradients) {
            _loop_1(variableName);
        }
    };
    AdagradOptimizer.prototype.dispose = function () {
        var _this = this;
        this.epsilon.dispose();
        this.c.dispose();
        if (this.accumulatedGrads != null) {
            Object.keys(this.accumulatedGrads)
                .forEach(function (name) { return _this.accumulatedGrads[name].dispose(); });
        }
    };
    return AdagradOptimizer;
}(optimizer_1.Optimizer));
exports.AdagradOptimizer = AdagradOptimizer;
