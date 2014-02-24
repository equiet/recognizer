define(function (require, exports, module) {
var WebInspector = {};
/* ------------------------------------------------------------------------ */


/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @param {!Object} obj
 * @return {boolean}
 */
Object.isEmpty = function(obj)
{
    for (var i in obj)
        return false;
    return true;
}

/**
 * @param {!Object.<string,!T>} obj
 * @return {!Array.<!T>}
 * @template T
 */
Object.values = function(obj)
{
    var result = Object.keys(obj);
    var length = result.length;
    for (var i = 0; i < length; ++i)
        result[i] = obj[result[i]];
    return result;
}

/**
 * @param {string} string
 * @return {!Array.<number>}
 */
String.prototype.findAll = function(string)
{
    var matches = [];
    var i = this.indexOf(string);
    while (i !== -1) {
        matches.push(i);
        i = this.indexOf(string, i + string.length);
    }
    return matches;
}

/**
 * @return {!Array.<number>}
 */
String.prototype.lineEndings = function()
{
    if (!this._lineEndings) {
        this._lineEndings = this.findAll("\n");
        this._lineEndings.push(this.length);
    }
    return this._lineEndings;
}

/**
 * @param {string} chars
 * @return {string}
 */
String.prototype.escapeCharacters = function(chars)
{
    var foundChar = false;
    for (var i = 0; i < chars.length; ++i) {
        if (this.indexOf(chars.charAt(i)) !== -1) {
            foundChar = true;
            break;
        }
    }

    if (!foundChar)
        return String(this);

    var result = "";
    for (var i = 0; i < this.length; ++i) {
        if (chars.indexOf(this.charAt(i)) !== -1)
            result += "\\";
        result += this.charAt(i);
    }

    return result;
}

/**
 * @return {string}
 */
String.regexSpecialCharacters = function()
{
    return "^[]{}()\\.$*+?|-,";
}

/**
 * @return {string}
 */
String.prototype.escapeForRegExp = function()
{
    return this.escapeCharacters(String.regexSpecialCharacters());
}

/**
 * @return {string}
 */
String.prototype.escapeHTML = function()
{
    return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); //" doublequotes just for editor
}

/**
 * @return {string}
 */
String.prototype.collapseWhitespace = function()
{
    return this.replace(/[\s\xA0]+/g, " ");
}

/**
 * @param {number} maxLength
 * @return {string}
 */
String.prototype.trimMiddle = function(maxLength)
{
    if (this.length <= maxLength)
        return String(this);
    var leftHalf = maxLength >> 1;
    var rightHalf = maxLength - leftHalf - 1;
    return this.substr(0, leftHalf) + "\u2026" + this.substr(this.length - rightHalf, rightHalf);
}

/**
 * @param {number} maxLength
 * @return {string}
 */
String.prototype.trimEnd = function(maxLength)
{
    if (this.length <= maxLength)
        return String(this);
    return this.substr(0, maxLength - 1) + "\u2026";
}

/**
 * @param {?string=} baseURLDomain
 * @return {string}
 */
String.prototype.trimURL = function(baseURLDomain)
{
    var result = this.replace(/^(https|http|file):\/\//i, "");
    if (baseURLDomain)
        result = result.replace(new RegExp("^" + baseURLDomain.escapeForRegExp(), "i"), "");
    return result;
}

/**
 * @return {string}
 */
String.prototype.toTitleCase = function()
{
    return this.substring(0, 1).toUpperCase() + this.substring(1);
}

/**
 * @param {string} other
 * @return {number}
 */
String.prototype.compareTo = function(other)
{
    if (this > other)
        return 1;
    if (this < other)
        return -1;
    return 0;
}

/**
 * @param {string} href
 * @return {?string}
 */
function sanitizeHref(href)
{
    return href && href.trim().toLowerCase().startsWith("javascript:") ? null : href;
}

/**
 * @return {string}
 */
String.prototype.removeURLFragment = function()
{
    var fragmentIndex = this.indexOf("#");
    if (fragmentIndex == -1)
        fragmentIndex = this.length;
    return this.substring(0, fragmentIndex);
}

/**
 * @return {boolean}
 */
String.prototype.startsWith = function(substring)
{
    return !this.lastIndexOf(substring, 0);
}

/**
 * @return {boolean}
 */
String.prototype.endsWith = function(substring)
{
    return this.indexOf(substring, this.length - substring.length) !== -1;
}

/**
 * @return {number}
 */
String.prototype.hashCode = function()
{
    var result = 0;
    for (var i = 0; i < this.length; ++i)
        result = result * 3 + this.charCodeAt(i);
    return result;
}

/**
 * @param {string} a
 * @param {string} b
 * @return {number}
 */
String.naturalOrderComparator = function(a, b)
{
    var chunk = /^\d+|^\D+/;
    var chunka, chunkb, anum, bnum;
    while (1) {
        if (a) {
            if (!b)
                return 1;
        } else {
            if (b)
                return -1;
            else
                return 0;
        }
        chunka = a.match(chunk)[0];
        chunkb = b.match(chunk)[0];
        anum = !isNaN(chunka);
        bnum = !isNaN(chunkb);
        if (anum && !bnum)
            return -1;
        if (bnum && !anum)
            return 1;
        if (anum && bnum) {
            var diff = chunka - chunkb;
            if (diff)
                return diff;
            if (chunka.length !== chunkb.length) {
                if (!+chunka && !+chunkb) // chunks are strings of all 0s (special case)
                    return chunka.length - chunkb.length;
                else
                    return chunkb.length - chunka.length;
            }
        } else if (chunka !== chunkb)
            return (chunka < chunkb) ? -1 : 1;
        a = a.substring(chunka.length);
        b = b.substring(chunkb.length);
    }
}

/**
 * @param {string} name
 * @param {number=} arrayLength
 * @return {boolean}
 */
String.isArrayIndexPropertyName = function(name, arrayLength)
{
    // Array index check according to the ES5-15.4.
    var index = name >>> 0;
    return String(index) === name && index !== 0xffffffff && (typeof arrayLength === "undefined" || index < arrayLength);
}

/**
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
Number.constrain = function(num, min, max)
{
    if (num < min)
        num = min;
    else if (num > max)
        num = max;
    return num;
}

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
Number.gcd = function(a, b)
{
    if (b === 0)
        return a;
    else
        return Number.gcd(b, a % b);
}

/**
 * @param {string} value
 * @return {string}
 */
Number.toFixedIfFloating = function(value)
{
    if (!value || isNaN(value))
        return value;
    var number = Number(value);
    return number % 1 ? number.toFixed(3) : String(number);
}

/**
 * @return {string}
 */
Date.prototype.toISO8601Compact = function()
{
    /**
     * @param {number} x
     * @return {string}
     */
    function leadZero(x)
    {
        return (x > 9 ? "" : "0") + x;
    }
    return this.getFullYear() +
           leadZero(this.getMonth() + 1) +
           leadZero(this.getDate()) + "T" +
           leadZero(this.getHours()) +
           leadZero(this.getMinutes()) +
           leadZero(this.getSeconds());
}

Object.defineProperty(Array.prototype, "remove",
{
    /**
     * @param {!T} value
     * @param {boolean=} onlyFirst
     * @this {Array.<!T>}
     * @template T
     */
    value: function(value, onlyFirst)
    {
        if (onlyFirst) {
            var index = this.indexOf(value);
            if (index !== -1)
                this.splice(index, 1);
            return;
        }

        var length = this.length;
        for (var i = 0; i < length; ++i) {
            if (this[i] === value)
                this.splice(i, 1);
        }
    }
});

Object.defineProperty(Array.prototype, "keySet",
{
    /**
     * @return {!Object.<string, boolean>}
     * @this {Array.<*>}
     */
    value: function()
    {
        var keys = {};
        for (var i = 0; i < this.length; ++i)
            keys[this[i]] = true;
        return keys;
    }
});

Object.defineProperty(Array.prototype, "rotate",
{
    /**
     * @param {number} index
     * @return {!Array.<!T>}
     * @this {Array.<!T>}
     * @template T
     */
    value: function(index)
    {
        var result = [];
        for (var i = index; i < index + this.length; ++i)
            result.push(this[i % this.length]);
        return result;
    }
});

Object.defineProperty(Uint32Array.prototype, "sort", {
   value: Array.prototype.sort
});

(function() {
var partition = {
    /**
     * @this {Array.<number>}
     * @param {function(number, number): number} comparator
     * @param {number} left
     * @param {number} right
     * @param {number} pivotIndex
     */
    value: function(comparator, left, right, pivotIndex)
    {
        function swap(array, i1, i2)
        {
            var temp = array[i1];
            array[i1] = array[i2];
            array[i2] = temp;
        }

        var pivotValue = this[pivotIndex];
        swap(this, right, pivotIndex);
        var storeIndex = left;
        for (var i = left; i < right; ++i) {
            if (comparator(this[i], pivotValue) < 0) {
                swap(this, storeIndex, i);
                ++storeIndex;
            }
        }
        swap(this, right, storeIndex);
        return storeIndex;
    }
};
Object.defineProperty(Array.prototype, "partition", partition);
Object.defineProperty(Uint32Array.prototype, "partition", partition);

var sortRange = {
    /**
     * @param {function(number, number): number} comparator
     * @param {number} leftBound
     * @param {number} rightBound
     * @param {number} sortWindowLeft
     * @param {number} sortWindowRight
     * @return {!Array.<number>}
     * @this {Array.<number>}
     */
    value: function(comparator, leftBound, rightBound, sortWindowLeft, sortWindowRight)
    {
        function quickSortRange(array, comparator, left, right, sortWindowLeft, sortWindowRight)
        {
            if (right <= left)
                return;
            var pivotIndex = Math.floor(Math.random() * (right - left)) + left;
            var pivotNewIndex = array.partition(comparator, left, right, pivotIndex);
            if (sortWindowLeft < pivotNewIndex)
                quickSortRange(array, comparator, left, pivotNewIndex - 1, sortWindowLeft, sortWindowRight);
            if (pivotNewIndex < sortWindowRight)
                quickSortRange(array, comparator, pivotNewIndex + 1, right, sortWindowLeft, sortWindowRight);
        }
        if (leftBound === 0 && rightBound === (this.length - 1) && sortWindowLeft === 0 && sortWindowRight >= rightBound)
            this.sort(comparator);
        else
            quickSortRange(this, comparator, leftBound, rightBound, sortWindowLeft, sortWindowRight);
        return this;
    }
}
Object.defineProperty(Array.prototype, "sortRange", sortRange);
Object.defineProperty(Uint32Array.prototype, "sortRange", sortRange);
})();

Object.defineProperty(Array.prototype, "stableSort",
{
    /**
     * @param {function(?T, ?T): number=} comparator
     * @return {!Array.<?T>}
     * @this {Array.<?T>}
     * @template T
     */
    value: function(comparator)
    {
        function defaultComparator(a, b)
        {
            return a < b ? -1 : (a > b ? 1 : 0);
        }
        comparator = comparator || defaultComparator;

        var indices = new Array(this.length);
        for (var i = 0; i < this.length; ++i)
            indices[i] = i;
        var self = this;
        /**
         * @param {number} a
         * @param {number} b
         * @return {number}
         */
        function indexComparator(a, b)
        {
            var result = comparator(self[a], self[b]);
            return result ? result : a - b;
        }
        indices.sort(indexComparator);

        for (var i = 0; i < this.length; ++i) {
            if (indices[i] < 0 || i === indices[i])
                continue;
            var cyclical = i;
            var saved = this[i];
            while (true) {
                var next = indices[cyclical];
                indices[cyclical] = -1;
                if (next === i) {
                    this[cyclical] = saved;
                    break;
                } else {
                    this[cyclical] = this[next];
                    cyclical = next;
                }
            }
        }
        return this;
    }
});

Object.defineProperty(Array.prototype, "qselect",
{
    /**
     * @param {number} k
     * @param {function(number, number): number=} comparator
     * @return {number|undefined}
     * @this {Array.<number>}
     */
    value: function(k, comparator)
    {
        if (k < 0 || k >= this.length)
            return;
        if (!comparator)
            comparator = function(a, b) { return a - b; }

        var low = 0;
        var high = this.length - 1;
        for (;;) {
            var pivotPosition = this.partition(comparator, low, high, Math.floor((high + low) / 2));
            if (pivotPosition === k)
                return this[k];
            else if (pivotPosition > k)
                high = pivotPosition - 1;
            else
                low = pivotPosition + 1;
        }
    }
});

Object.defineProperty(Array.prototype, "lowerBound",
{
    /**
     * Return index of the leftmost element that is equal or greater
     * than the specimen object. If there's no such element (i.e. all
     * elements are smaller than the specimen) returns array.length.
     * The function works for sorted array.
     *
     * @param {!T} object
     * @param {function(!T,!S):number=} comparator
     * @return {number}
     * @this {Array.<!S>}
     * @template T,S
     */
    value: function(object, comparator)
    {
        function defaultComparator(a, b)
        {
            return a < b ? -1 : (a > b ? 1 : 0);
        }
        comparator = comparator || defaultComparator;
        var l = 0;
        var r = this.length;
        while (l < r) {
            var m = (l + r) >> 1;
            if (comparator(object, this[m]) > 0)
                l = m + 1;
            else
                r = m;
        }
        return r;
    }
});

Object.defineProperty(Array.prototype, "upperBound",
{
    /**
     * Return index of the leftmost element that is greater
     * than the specimen object. If there's no such element (i.e. all
     * elements are smaller than the specimen) returns array.length.
     * The function works for sorted array.
     *
     * @param {!T} object
     * @param {function(!T,!S):number=} comparator
     * @return {number}
     * @this {Array.<!S>}
     * @template T,S
     */
    value: function(object, comparator)
    {
        function defaultComparator(a, b)
        {
            return a < b ? -1 : (a > b ? 1 : 0);
        }
        comparator = comparator || defaultComparator;
        var l = 0;
        var r = this.length;
        while (l < r) {
            var m = (l + r) >> 1;
            if (comparator(object, this[m]) >= 0)
                l = m + 1;
            else
                r = m;
        }
        return r;
    }
});

Object.defineProperty(Array.prototype, "binaryIndexOf",
{
    /**
     * @param {!T} value
     * @param {function(!T,!S):number} comparator
     * @return {number}
     * @this {Array.<!S>}
     * @template T,S
     */
    value: function(value, comparator)
    {
        var index = this.lowerBound(value, comparator);
        return index < this.length && comparator(value, this[index]) === 0 ? index : -1;
    }
});

Object.defineProperty(Array.prototype, "select",
{
    /**
     * @param {string} field
     * @return {!Array.<!T>}
     * @this {Array.<!Object.<string,!T>>}
     * @template T
     */
    value: function(field)
    {
        var result = new Array(this.length);
        for (var i = 0; i < this.length; ++i)
            result[i] = this[i][field];
        return result;
    }
});

Object.defineProperty(Array.prototype, "peekLast",
{
    /**
     * @return {!T|undefined}
     * @this {Array.<!T>}
     * @template T
     */
    value: function()
    {
        return this[this.length - 1];
    }
});

(function(){

/**
 * @param {!Array.<T>} array1
 * @param {!Array.<T>} array2
 * @param {function(T,T):number} comparator
 * @return {!Array.<T>}
 * @template T
 */
function mergeOrIntersect(array1, array2, comparator, mergeNotIntersect)
{
    var result = [];
    var i = 0;
    var j = 0;
    while (i < array1.length || j < array2.length) {
        if (i === array1.length) {
            result = result.concat(array2.slice(j));
            j = array2.length;
        } else if (j === array2.length) {
            result = result.concat(array1.slice(i));
            i = array1.length;
        } else {
            var compareValue = comparator(array1[i], array2[j])
             if (compareValue < 0) {
                 if (mergeNotIntersect)
                    result.push(array1[i]);
                 ++i;
             } else if (compareValue > 0) {
                 if (mergeNotIntersect)
                     result.push(array2[j]);
                 ++j;
             } else {
                 result.push(array1[i]);
                 ++i;
                 ++j;
             }
        }
    }
    return result;
}

Object.defineProperty(Array.prototype, "intersectOrdered",
{
    /**
     * @param {!Array.<T>} array
     * @param {function(T,T):number} comparator
     * @return {!Array.<T>}
     * @this {!Array.<T>}
     * @template T
     */
    value: function(array, comparator)
    {
        return mergeOrIntersect(this, array, comparator, false);
    }
});

Object.defineProperty(Array.prototype, "mergeOrdered",
{
    /**
     * @param {!Array.<T>} array
     * @param {function(T,T):number} comparator
     * @return {!Array.<T>}
     * @this {!Array.<T>}
     * @template T
     */
    value: function(array, comparator)
    {
        return mergeOrIntersect(this, array, comparator, true);
    }
});

}());


/**
 * @param {!T} object
 * @param {!Array.<!S>} list
 * @param {function(!T,!S):number=} comparator
 * @param {boolean=} insertionIndexAfter
 * @return {number}
 * @template T,S
 */
function insertionIndexForObjectInListSortedByFunction(object, list, comparator, insertionIndexAfter)
{
    if (insertionIndexAfter)
        return list.upperBound(object, comparator);
    else
        return list.lowerBound(object, comparator);
}

/**
 * @param {string} format
 * @param {...*} var_arg
 * @return {string}
 */
String.sprintf = function(format, var_arg)
{
    return String.vsprintf(format, Array.prototype.slice.call(arguments, 1));
}

String.tokenizeFormatString = function(format, formatters)
{
    var tokens = [];
    var substitutionIndex = 0;

    function addStringToken(str)
    {
        tokens.push({ type: "string", value: str });
    }

    function addSpecifierToken(specifier, precision, substitutionIndex)
    {
        tokens.push({ type: "specifier", specifier: specifier, precision: precision, substitutionIndex: substitutionIndex });
    }

    function isDigit(c)
    {
        return !!/[0-9]/.exec(c);
    }

    var index = 0;
    for (var precentIndex = format.indexOf("%", index); precentIndex !== -1; precentIndex = format.indexOf("%", index)) {
        addStringToken(format.substring(index, precentIndex));
        index = precentIndex + 1;

        if (isDigit(format[index])) {
            // The first character is a number, it might be a substitution index.
            var number = parseInt(format.substring(index), 10);
            while (isDigit(format[index]))
                ++index;

            // If the number is greater than zero and ends with a "$",
            // then this is a substitution index.
            if (number > 0 && format[index] === "$") {
                substitutionIndex = (number - 1);
                ++index;
            }
        }

        var precision = -1;
        if (format[index] === ".") {
            // This is a precision specifier. If no digit follows the ".",
            // then the precision should be zero.
            ++index;
            precision = parseInt(format.substring(index), 10);
            if (isNaN(precision))
                precision = 0;

            while (isDigit(format[index]))
                ++index;
        }

        if (!(format[index] in formatters)) {
            addStringToken(format.substring(precentIndex, index + 1));
            ++index;
            continue;
        }

        addSpecifierToken(format[index], precision, substitutionIndex);

        ++substitutionIndex;
        ++index;
    }

    addStringToken(format.substring(index));

    return tokens;
}

String.standardFormatters = {
    /**
     * @return {number}
     */
    d: function(substitution)
    {
        return !isNaN(substitution) ? substitution : 0;
    },

    /**
     * @return {number}
     */
    f: function(substitution, token)
    {
        if (substitution && token.precision > -1)
            substitution = substitution.toFixed(token.precision);
        return !isNaN(substitution) ? substitution : (token.precision > -1 ? Number(0).toFixed(token.precision) : 0);
    },

    /**
     * @return {string}
     */
    s: function(substitution)
    {
        return substitution;
    }
}

/**
 * @param {string} format
 * @param {!Array.<*>} substitutions
 * @return {string}
 */
String.vsprintf = function(format, substitutions)
{
    return String.format(format, substitutions, String.standardFormatters, "", function(a, b) { return a + b; }).formattedResult;
}

String.format = function(format, substitutions, formatters, initialValue, append)
{
    if (!format || !substitutions || !substitutions.length)
        return { formattedResult: append(initialValue, format), unusedSubstitutions: substitutions };

    function prettyFunctionName()
    {
        return "String.format(\"" + format + "\", \"" + substitutions.join("\", \"") + "\")";
    }

    function warn(msg)
    {
        console.warn(prettyFunctionName() + ": " + msg);
    }

    function error(msg)
    {
        console.error(prettyFunctionName() + ": " + msg);
    }

    var result = initialValue;
    var tokens = String.tokenizeFormatString(format, formatters);
    var usedSubstitutionIndexes = {};

    for (var i = 0; i < tokens.length; ++i) {
        var token = tokens[i];

        if (token.type === "string") {
            result = append(result, token.value);
            continue;
        }

        if (token.type !== "specifier") {
            error("Unknown token type \"" + token.type + "\" found.");
            continue;
        }

        if (token.substitutionIndex >= substitutions.length) {
            // If there are not enough substitutions for the current substitutionIndex
            // just output the format specifier literally and move on.
            error("not enough substitution arguments. Had " + substitutions.length + " but needed " + (token.substitutionIndex + 1) + ", so substitution was skipped.");
            result = append(result, "%" + (token.precision > -1 ? token.precision : "") + token.specifier);
            continue;
        }

        usedSubstitutionIndexes[token.substitutionIndex] = true;

        if (!(token.specifier in formatters)) {
            // Encountered an unsupported format character, treat as a string.
            warn("unsupported format character \u201C" + token.specifier + "\u201D. Treating as a string.");
            result = append(result, substitutions[token.substitutionIndex]);
            continue;
        }

        result = append(result, formatters[token.specifier](substitutions[token.substitutionIndex], token));
    }

    var unusedSubstitutions = [];
    for (var i = 0; i < substitutions.length; ++i) {
        if (i in usedSubstitutionIndexes)
            continue;
        unusedSubstitutions.push(substitutions[i]);
    }

    return { formattedResult: result, unusedSubstitutions: unusedSubstitutions };
}

/**
 * @param {string} query
 * @param {boolean} caseSensitive
 * @param {boolean} isRegex
 * @return {!RegExp}
 */
function createSearchRegex(query, caseSensitive, isRegex)
{
    var regexFlags = caseSensitive ? "g" : "gi";
    var regexObject;

    if (isRegex) {
        try {
            regexObject = new RegExp(query, regexFlags);
        } catch (e) {
            // Silent catch.
        }
    }

    if (!regexObject)
        regexObject = createPlainTextSearchRegex(query, regexFlags);

    return regexObject;
}

/**
 * @param {string} query
 * @param {string=} flags
 * @return {!RegExp}
 */
function createPlainTextSearchRegex(query, flags)
{
    // This should be kept the same as the one in ContentSearchUtils.cpp.
    var regexSpecialCharacters = String.regexSpecialCharacters();
    var regex = "";
    for (var i = 0; i < query.length; ++i) {
        var c = query.charAt(i);
        if (regexSpecialCharacters.indexOf(c) != -1)
            regex += "\\";
        regex += c;
    }
    return new RegExp(regex, flags || "");
}

/**
 * @param {!RegExp} regex
 * @param {string} content
 * @return {number}
 */
function countRegexMatches(regex, content)
{
    var text = content;
    var result = 0;
    var match;
    while (text && (match = regex.exec(text))) {
        if (match[0].length > 0)
            ++result;
        text = text.substring(match.index + 1);
    }
    return result;
}

/**
 * @param {number} value
 * @param {number} symbolsCount
 * @return {string}
 */
function numberToStringWithSpacesPadding(value, symbolsCount)
{
    var numberString = value.toString();
    var paddingLength = Math.max(0, symbolsCount - numberString.length);
    var paddingString = Array(paddingLength + 1).join("\u00a0");
    return paddingString + numberString;
}

/**
 * @return {string}
 */
var createObjectIdentifier = function()
{
    // It has to be string for better performance.
    return "_" + ++createObjectIdentifier._last;
}

createObjectIdentifier._last = 0;

/**
 * @constructor
 * @template T
 */
var Set = function()
{
    /** @type {!Object.<string, !T>} */
    this._set = {};
    this._size = 0;
}

Set.prototype = {
    /**
     * @param {!T} item
     */
    add: function(item)
    {
        var objectIdentifier = item.__identifier;
        if (!objectIdentifier) {
            objectIdentifier = createObjectIdentifier();
            item.__identifier = objectIdentifier;
        }
        if (!this._set[objectIdentifier])
            ++this._size;
        this._set[objectIdentifier] = item;
    },

    /**
     * @param {!T} item
     * @return {boolean}
     */
    remove: function(item)
    {
        if (this._set[item.__identifier]) {
            --this._size;
            delete this._set[item.__identifier];
            return true;
        }
        return false;
    },

    /**
     * @return {!Array.<!T>}
     */
    items: function()
    {
        var result = new Array(this._size);
        var i = 0;
        for (var objectIdentifier in this._set)
            result[i++] = this._set[objectIdentifier];
        return result;
    },

    /**
     * @param {!T} item
     * @return {boolean}
     */
    hasItem: function(item)
    {
        return !!this._set[item.__identifier];
    },

    /**
     * @return {number}
     */
    size: function()
    {
        return this._size;
    },

    clear: function()
    {
        this._set = {};
        this._size = 0;
    }
}

/**
 * @constructor
 * @template K,V
 */
var Map = function()
{
    /** @type {!Object.<string, !Array.<K|V>>} */
    this._map = {};
    this._size = 0;
}

Map.prototype = {
    /**
     * @param {K} key
     * @param {V} value
     */
    put: function(key, value)
    {
        var objectIdentifier = key.__identifier;
        if (!objectIdentifier) {
            objectIdentifier = createObjectIdentifier();
            key.__identifier = objectIdentifier;
        }
        if (!this._map[objectIdentifier])
            ++this._size;
        this._map[objectIdentifier] = [key, value];
    },

    /**
     * @param {K} key
     * @return {V}
     */
    remove: function(key)
    {
        var result = this._map[key.__identifier];
        if (!result)
            return undefined;
        --this._size;
        delete this._map[key.__identifier];
        return result[1];
    },

    /**
     * @return {!Array.<K>}
     */
    keys: function()
    {
        return this._list(0);
    },

    /**
     * @return {!Array.<V>}
     */
    values: function()
    {
        return this._list(1);
    },

    /**
     * @param {number} index
     * @return {!Array.<K|V>}
     */
    _list: function(index)
    {
        var result = new Array(this._size);
        var i = 0;
        for (var objectIdentifier in this._map)
            result[i++] = this._map[objectIdentifier][index];
        return result;
    },

    /**
     * @param {K} key
     * @return {V|undefined}
     */
    get: function(key)
    {
        var entry = this._map[key.__identifier];
        return entry ? entry[1] : undefined;
    },

    /**
     * @param {K} key
     * @return {boolean}
     */
    contains: function(key)
    {
        var entry = this._map[key.__identifier];
        return !!entry;
    },

    /**
     * @return {number}
     */
    size: function()
    {
        return this._size;
    },

    clear: function()
    {
        this._map = {};
        this._size = 0;
    }
}

/**
 * @constructor
 * @template T
 */
var StringMap = function()
{
    /** @type {!Object.<string, T>} */
    this._map = {};
    this._size = 0;
}

StringMap.prototype = {
    /**
     * @param {string} key
     * @param {T} value
     */
    put: function(key, value)
    {
        if (key === "__proto__") {
            if (!this._hasProtoKey) {
                ++this._size;
                this._hasProtoKey = true;
            }
            /** @type {T} */
            this._protoValue = value;
            return;
        }
        if (!Object.prototype.hasOwnProperty.call(this._map, key))
            ++this._size;
        this._map[key] = value;
    },

    /**
     * @param {string} key
     * @return {T|undefined}
     */
    remove: function(key)
    {
        var result;
        if (key === "__proto__") {
            if (!this._hasProtoKey)
                return undefined;
            --this._size;
            delete this._hasProtoKey;
            result = this._protoValue;
            delete this._protoValue;
            return result;
        }
        if (!Object.prototype.hasOwnProperty.call(this._map, key))
            return undefined;
        --this._size;
        result = this._map[key];
        delete this._map[key];
        return result;
    },

    /**
     * @return {!Array.<string>}
     */
    keys: function()
    {
        var result = Object.keys(this._map) || [];
        if (this._hasProtoKey)
            result.push("__proto__");
        return result;
    },

    /**
     * @return {!Array.<T>}
     */
    values: function()
    {
        var result = Object.values(this._map);
        if (this._hasProtoKey)
            result.push(this._protoValue);
        return result;
    },

    /**
     * @param {string} key
     * @return {T|undefined}
     */
    get: function(key)
    {
        if (key === "__proto__")
            return this._protoValue;
        if (!Object.prototype.hasOwnProperty.call(this._map, key))
            return undefined;
        return this._map[key];
    },

    /**
     * @param {string} key
     * @return {boolean}
     */
    contains: function(key)
    {
        var result;
        if (key === "__proto__")
            return this._hasProtoKey;
        return Object.prototype.hasOwnProperty.call(this._map, key);
    },

    /**
     * @return {number}
     */
    size: function()
    {
        return this._size;
    },

    clear: function()
    {
        this._map = {};
        this._size = 0;
        delete this._hasProtoKey;
        delete this._protoValue;
    }
}

/**
 * @param {string} url
 * @param {boolean=} async
 * @param {function(?string)=} callback
 * @return {?string}
 */
function loadXHR(url, async, callback)
{
    function onReadyStateChanged()
    {
        if (xhr.readyState !== XMLHttpRequest.DONE)
            return;

        if (xhr.status === 200) {
            callback(xhr.responseText);
            return;
        }

        callback(null);
   }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, async);
    if (async)
        xhr.onreadystatechange = onReadyStateChanged;
    xhr.send(null);

    if (!async) {
        if (xhr.status === 200)
            return xhr.responseText;
        return null;
    }
    return null;
}

/**
 * @constructor
 */
function StringPool()
{
    this.reset();
}

StringPool.prototype = {
    /**
     * @param {string} string
     * @return {string}
     */
    intern: function(string)
    {
        // Do not mess with setting __proto__ to anything but null, just handle it explicitly.
        if (string === "__proto__")
            return "__proto__";
        var result = this._strings[string];
        if (result === undefined) {
            this._strings[string] = string;
            result = string;
        }
        return result;
    },

    reset: function()
    {
        this._strings = Object.create(null);
    },

    /**
     * @param {!Object} obj
     * @param {number=} depthLimit
     */
    internObjectStrings: function(obj, depthLimit)
    {
        if (typeof depthLimit !== "number")
            depthLimit = 100;
        else if (--depthLimit < 0)
            throw "recursion depth limit reached in StringPool.deepIntern(), perhaps attempting to traverse cyclical references?";

        for (var field in obj) {
            switch (typeof obj[field]) {
            case "string":
                obj[field] = this.intern(obj[field]);
                break;
            case "object":
                this.internObjectStrings(obj[field], depthLimit);
                break;
            }
        }
    }
}

var _importedScripts = {};

/**
 * This function behavior depends on the "debug_devtools" flag value.
 * - In debug mode it loads scripts synchronously via xhr request.
 * - In release mode every occurrence of "importScript" in the js files
 *   that have been white listed in the build system gets replaced with
 *   the script source code on the compilation phase.
 *   The build system will throw an exception if it found importScript call
 *   in other files.
 *
 * To load scripts lazily in release mode call "loadScript" function.
 * @param {string} scriptName
 */
function importScript(scriptName)
{
    if (_importedScripts[scriptName])
        return;
    var xhr = new XMLHttpRequest();
    _importedScripts[scriptName] = true;
    xhr.open("GET", scriptName, false);
    xhr.send(null);
    if (!xhr.responseText)
        throw "empty response arrived for script '" + scriptName + "'";
    var baseUrl = location.origin + location.pathname;
    baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf("/"));
    var sourceURL = baseUrl + "/" + scriptName;
    eval(xhr.responseText + "\n//# sourceURL=" + sourceURL);
}

var loadScript = importScript;

/**
 * @constructor
 */
function CallbackBarrier()
{
    this._pendingIncomingCallbacksCount = 0;
}

CallbackBarrier.prototype = {
    /**
     * @param {function(!T)=} userCallback
     * @return {function(!T=)}
     * @template T
     */
    createCallback: function(userCallback)
    {
        console.assert(!this._outgoingCallback, "CallbackBarrier.createCallback() is called after CallbackBarrier.callWhenDone()");
        ++this._pendingIncomingCallbacksCount;
        return this._incomingCallback.bind(this, userCallback);
    },

    /**
     * @param {function()} callback
     */
    callWhenDone: function(callback)
    {
        console.assert(!this._outgoingCallback, "CallbackBarrier.callWhenDone() is called multiple times");
        this._outgoingCallback = callback;
        if (!this._pendingIncomingCallbacksCount)
            this._outgoingCallback();
    },

    /**
     * @param {function(...)=} userCallback
     */
    _incomingCallback: function(userCallback)
    {
        console.assert(this._pendingIncomingCallbacksCount > 0);
        if (userCallback) {
            var args = Array.prototype.slice.call(arguments, 1);
            userCallback.apply(null, args);
        }
        if (!--this._pendingIncomingCallbacksCount && this._outgoingCallback)
            this._outgoingCallback();
    }
}





/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @implements {WebInspector.EventTarget}
 */
WebInspector.Object = function() {
}

WebInspector.Object.prototype = {
    /**
     * @param {string} eventType
     * @param {function(!WebInspector.Event)} listener
     * @param {!Object=} thisObject
     */
    addEventListener: function(eventType, listener, thisObject)
    {
        if (!listener)
            console.assert(false);

        if (!this._listeners)
            this._listeners = {};
        if (!this._listeners[eventType])
            this._listeners[eventType] = [];
        this._listeners[eventType].push({ thisObject: thisObject, listener: listener });
    },

    /**
     * @param {string} eventType
     * @param {function(!WebInspector.Event)} listener
     * @param {!Object=} thisObject
     */
    removeEventListener: function(eventType, listener, thisObject)
    {
        console.assert(listener);

        if (!this._listeners || !this._listeners[eventType])
            return;
        var listeners = this._listeners[eventType];
        for (var i = 0; i < listeners.length; ++i) {
            if (listener && listeners[i].listener === listener && listeners[i].thisObject === thisObject)
                listeners.splice(i, 1);
            else if (!listener && thisObject && listeners[i].thisObject === thisObject)
                listeners.splice(i, 1);
        }

        if (!listeners.length)
            delete this._listeners[eventType];
    },

    removeAllListeners: function()
    {
        delete this._listeners;
    },

    /**
     * @param {string} eventType
     * @return {boolean}
     */
    hasEventListeners: function(eventType)
    {
        if (!this._listeners || !this._listeners[eventType])
            return false;
        return true;
    },

    /**
     * @param {string} eventType
     * @param {*=} eventData
     * @return {boolean}
     */
    dispatchEventToListeners: function(eventType, eventData)
    {
        if (!this._listeners || !this._listeners[eventType])
            return false;

        var event = new WebInspector.Event(this, eventType, eventData);
        var listeners = this._listeners[eventType].slice(0);
        for (var i = 0; i < listeners.length; ++i) {
            listeners[i].listener.call(listeners[i].thisObject, event);
            if (event._stoppedPropagation)
                break;
        }

        return event.defaultPrevented;
    }
}

/**
 * @constructor
 * @param {!WebInspector.EventTarget} target
 * @param {string} type
 * @param {*=} data
 */
WebInspector.Event = function(target, type, data)
{
    this.target = target;
    this.type = type;
    this.data = data;
    this.defaultPrevented = false;
    this._stoppedPropagation = false;
}

WebInspector.Event.prototype = {
    stopPropagation: function()
    {
        this._stoppedPropagation = true;
    },

    preventDefault: function()
    {
        this.defaultPrevented = true;
    },

    /**
     * @param {boolean=} preventDefault
     */
    consume: function(preventDefault)
    {
        this.stopPropagation();
        if (preventDefault)
            this.preventDefault();
    }
}

/**
 * @interface
 */
WebInspector.EventTarget = function()
{
}

WebInspector.EventTarget.prototype = {
    /**
     * @param {string} eventType
     * @param {function(!WebInspector.Event)} listener
     * @param {!Object=} thisObject
     */
    addEventListener: function(eventType, listener, thisObject) { },

    /**
     * @param {string} eventType
     * @param {function(!WebInspector.Event)} listener
     * @param {!Object=} thisObject
     */
    removeEventListener: function(eventType, listener, thisObject) { },

    removeAllListeners: function() { },

    /**
     * @param {string} eventType
     * @return {boolean}
     */
    hasEventListeners: function(eventType) { },

    /**
     * @param {string} eventType
     * @param {*=} eventData
     * @return {boolean}
     */
    dispatchEventToListeners: function(eventType, eventData) { },
}

WebInspector.notifications = new WebInspector.Object();



/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @param {!Element} listNode
 * @param {boolean=} nonFocusable
 */
function TreeOutline(listNode, nonFocusable)
{
    /** @type {!Array.<!TreeElement>} */
    this.children = [];
    this.selectedTreeElement = null;
    this._childrenListNode = listNode;
    this.childrenListElement = this._childrenListNode;
    this._childrenListNode.removeChildren();
    this.expandTreeElementsWhenArrowing = false;
    this.root = true;
    this.hasChildren = false;
    this.expanded = true;
    this.selected = false;
    this.treeOutline = this;
    /** @type {?function(!TreeElement, !TreeElement):number} */
    this.comparator = null;

    this.setFocusable(!nonFocusable);
    this._childrenListNode.addEventListener("keydown", this._treeKeyDown.bind(this), true);

    /** @type {!Map.<!Object, !Array.<!TreeElement>>} */
    this._treeElementsMap = new Map();
    /** @type {!Map.<!Object, boolean>} */
    this._expandedStateMap = new Map();
}

TreeOutline.prototype.setFocusable = function(focusable)
{
    if (focusable)
        this._childrenListNode.setAttribute("tabIndex", 0);
    else
        this._childrenListNode.removeAttribute("tabIndex");
}

/**
 * @param {!TreeElement} child
 */
TreeOutline.prototype.appendChild = function(child)
{
    var insertionIndex;
    if (this.treeOutline.comparator)
        insertionIndex = insertionIndexForObjectInListSortedByFunction(child, this.children, this.treeOutline.comparator);
    else
        insertionIndex = this.children.length;
    this.insertChild(child, insertionIndex);
}

/**
 * @param {!TreeElement} child
 * @param {!TreeElement} beforeChild
 */
TreeOutline.prototype.insertBeforeChild = function(child, beforeChild)
{
    if (!child)
        throw("child can't be undefined or null");

    if (!beforeChild)
        throw("beforeChild can't be undefined or null");

    var childIndex = this.children.indexOf(beforeChild);
    if (childIndex === -1)
        throw("beforeChild not found in this node's children");

    this.insertChild(child, childIndex);
}

/**
 * @param {!TreeElement} child
 * @param {number} index
 */
TreeOutline.prototype.insertChild = function(child, index)
{
    if (!child)
        throw("child can't be undefined or null");

    var previousChild = (index > 0 ? this.children[index - 1] : null);
    if (previousChild) {
        previousChild.nextSibling = child;
        child.previousSibling = previousChild;
    } else {
        child.previousSibling = null;
    }

    var nextChild = this.children[index];
    if (nextChild) {
        nextChild.previousSibling = child;
        child.nextSibling = nextChild;
    } else {
        child.nextSibling = null;
    }

    this.children.splice(index, 0, child);
    this.hasChildren = true;
    child.parent = this;
    child.treeOutline = this.treeOutline;
    child.treeOutline._rememberTreeElement(child);

    var current = child.children[0];
    while (current) {
        current.treeOutline = this.treeOutline;
        current.treeOutline._rememberTreeElement(current);
        current = current.traverseNextTreeElement(false, child, true);
    }

    if (child.hasChildren && typeof(child.treeOutline._expandedStateMap.get(child.representedObject)) !== "undefined")
        child.expanded = child.treeOutline._expandedStateMap.get(child.representedObject);

    if (!this._childrenListNode) {
        this._childrenListNode = this.treeOutline._childrenListNode.ownerDocument.createElement("ol");
        this._childrenListNode.parentTreeElement = this;
        this._childrenListNode.classList.add("children");
        if (this.hidden)
            this._childrenListNode.classList.add("hidden");
    }

    child._attach();
}

/**
 * @param {number} childIndex
 */
TreeOutline.prototype.removeChildAtIndex = function(childIndex)
{
    if (childIndex < 0 || childIndex >= this.children.length)
        throw("childIndex out of range");

    var child = this.children[childIndex];
    this.children.splice(childIndex, 1);

    var parent = child.parent;
    if (child.deselect()) {
        if (child.previousSibling)
            child.previousSibling.select();
        else if (child.nextSibling)
            child.nextSibling.select();
        else
            parent.select();
    }

    if (child.previousSibling)
        child.previousSibling.nextSibling = child.nextSibling;
    if (child.nextSibling)
        child.nextSibling.previousSibling = child.previousSibling;

    if (child.treeOutline) {
        child.treeOutline._forgetTreeElement(child);
        child.treeOutline._forgetChildrenRecursive(child);
    }

    child._detach();
    child.treeOutline = null;
    child.parent = null;
    child.nextSibling = null;
    child.previousSibling = null;
}

/**
 * @param {!TreeElement} child
 */
TreeOutline.prototype.removeChild = function(child)
{
    if (!child)
        throw("child can't be undefined or null");

    var childIndex = this.children.indexOf(child);
    if (childIndex === -1)
        throw("child not found in this node's children");

    this.removeChildAtIndex.call(this, childIndex);
}

TreeOutline.prototype.removeChildren = function()
{
    for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i];
        child.deselect();

        if (child.treeOutline) {
            child.treeOutline._forgetTreeElement(child);
            child.treeOutline._forgetChildrenRecursive(child);
        }

        child._detach();
        child.treeOutline = null;
        child.parent = null;
        child.nextSibling = null;
        child.previousSibling = null;
    }

    this.children = [];
}

/**
 * @param {!TreeElement} element
 */
TreeOutline.prototype._rememberTreeElement = function(element)
{
    if (!this._treeElementsMap.get(element.representedObject))
        this._treeElementsMap.put(element.representedObject, []);

    // check if the element is already known
    var elements = this._treeElementsMap.get(element.representedObject);
    if (elements.indexOf(element) !== -1)
        return;

    // add the element
    elements.push(element);
}

/**
 * @param {!TreeElement} element
 */
TreeOutline.prototype._forgetTreeElement = function(element)
{
    if (this._treeElementsMap.get(element.representedObject)) {
        var elements = this._treeElementsMap.get(element.representedObject);
        elements.remove(element, true);
        if (!elements.length)
            this._treeElementsMap.remove(element.representedObject);
    }
}

/**
 * @param {!TreeElement} parentElement
 */
TreeOutline.prototype._forgetChildrenRecursive = function(parentElement)
{
    var child = parentElement.children[0];
    while (child) {
        this._forgetTreeElement(child);
        child = child.traverseNextTreeElement(false, parentElement, true);
    }
}

/**
 * @param {?Object} representedObject
 * @return {?TreeElement}
 */
TreeOutline.prototype.getCachedTreeElement = function(representedObject)
{
    if (!representedObject)
        return null;

    var elements = this._treeElementsMap.get(representedObject);
    if (elements && elements.length)
        return elements[0];
    return null;
}

/**
 * @param {?Object} representedObject
 * @return {?TreeElement}
 */
TreeOutline.prototype.findTreeElement = function(representedObject, isAncestor, getParent)
{
    if (!representedObject)
        return null;

    var cachedElement = this.getCachedTreeElement(representedObject);
    if (cachedElement)
        return cachedElement;

    // Walk up the parent pointers from the desired representedObject
    var ancestors = [];
    for (var currentObject = getParent(representedObject); currentObject;  currentObject = getParent(currentObject)) {
        ancestors.push(currentObject);
        if (this.getCachedTreeElement(currentObject))  // stop climbing as soon as we hit
            break;
    }

    if (!currentObject)
        return null;

    // Walk down to populate each ancestor's children, to fill in the tree and the cache.
    for (var i = ancestors.length - 1; i >= 0; --i) {
        var treeElement = this.getCachedTreeElement(ancestors[i]);
        if (treeElement)
            treeElement.onpopulate();  // fill the cache with the children of treeElement
    }

    return this.getCachedTreeElement(representedObject);
}

/**
 * @param {number} x
 * @param {number} y
 * @return {?TreeElement}
 */
TreeOutline.prototype.treeElementFromPoint = function(x, y)
{
    var node = this._childrenListNode.ownerDocument.elementFromPoint(x, y);
    if (!node)
        return null;

    var listNode = node.enclosingNodeOrSelfWithNodeNameInArray(["ol", "li"]);
    if (listNode)
        return listNode.parentTreeElement || listNode.treeElement;
    return null;
}

TreeOutline.prototype._treeKeyDown = function(event)
{
    if (event.target !== this._childrenListNode)
        return;

    if (!this.selectedTreeElement || event.shiftKey || event.metaKey || event.ctrlKey)
        return;

    var handled = false;
    var nextSelectedElement;
    if (event.keyIdentifier === "Up" && !event.altKey) {
        nextSelectedElement = this.selectedTreeElement.traversePreviousTreeElement(true);
        while (nextSelectedElement && !nextSelectedElement.selectable)
            nextSelectedElement = nextSelectedElement.traversePreviousTreeElement(!this.expandTreeElementsWhenArrowing);
        handled = nextSelectedElement ? true : false;
    } else if (event.keyIdentifier === "Down" && !event.altKey) {
        nextSelectedElement = this.selectedTreeElement.traverseNextTreeElement(true);
        while (nextSelectedElement && !nextSelectedElement.selectable)
            nextSelectedElement = nextSelectedElement.traverseNextTreeElement(!this.expandTreeElementsWhenArrowing);
        handled = nextSelectedElement ? true : false;
    } else if (event.keyIdentifier === "Left") {
        if (this.selectedTreeElement.expanded) {
            if (event.altKey)
                this.selectedTreeElement.collapseRecursively();
            else
                this.selectedTreeElement.collapse();
            handled = true;
        } else if (this.selectedTreeElement.parent && !this.selectedTreeElement.parent.root) {
            handled = true;
            if (this.selectedTreeElement.parent.selectable) {
                nextSelectedElement = this.selectedTreeElement.parent;
                while (nextSelectedElement && !nextSelectedElement.selectable)
                    nextSelectedElement = nextSelectedElement.parent;
                handled = nextSelectedElement ? true : false;
            } else if (this.selectedTreeElement.parent)
                this.selectedTreeElement.parent.collapse();
        }
    } else if (event.keyIdentifier === "Right") {
        if (!this.selectedTreeElement.revealed()) {
            this.selectedTreeElement.reveal();
            handled = true;
        } else if (this.selectedTreeElement.hasChildren) {
            handled = true;
            if (this.selectedTreeElement.expanded) {
                nextSelectedElement = this.selectedTreeElement.children[0];
                while (nextSelectedElement && !nextSelectedElement.selectable)
                    nextSelectedElement = nextSelectedElement.nextSibling;
                handled = nextSelectedElement ? true : false;
            } else {
                if (event.altKey)
                    this.selectedTreeElement.expandRecursively();
                else
                    this.selectedTreeElement.expand();
            }
        }
    } else if (event.keyCode === 8 /* Backspace */ || event.keyCode === 46 /* Delete */)
        handled = this.selectedTreeElement.ondelete();
    else if (isEnterKey(event))
        handled = this.selectedTreeElement.onenter();
    else if (event.keyCode === WebInspector.KeyboardShortcut.Keys.Space.code)
        handled = this.selectedTreeElement.onspace();

    if (nextSelectedElement) {
        nextSelectedElement.reveal();
        nextSelectedElement.select(false, true);
    }

    if (handled)
        event.consume(true);
}

TreeOutline.prototype.expand = function()
{
    // this is the root, do nothing
}

TreeOutline.prototype.collapse = function()
{
    // this is the root, do nothing
}

TreeOutline.prototype.revealed = function()
{
    return true;
}

TreeOutline.prototype.reveal = function()
{
    // this is the root, do nothing
}

TreeOutline.prototype.select = function()
{
    // this is the root, do nothing
}

/**
 * @param {boolean=} omitFocus
 */
TreeOutline.prototype.revealAndSelect = function(omitFocus)
{
    // this is the root, do nothing
}

/**
 * @constructor
 * @param {string|!Node} title
 * @param {?Object=} representedObject
 * @param {boolean=} hasChildren
 */
function TreeElement(title, representedObject, hasChildren)
{
    this._title = title;
    this.representedObject = (representedObject || {});

    this.root = false;
    this._hidden = false;
    this._selectable = true;
    this.expanded = false;
    this.selected = false;
    this.hasChildren = hasChildren;
    this.children = [];
    this.treeOutline = null;
    this.parent = null;
    this.previousSibling = null;
    this.nextSibling = null;
    this._listItemNode = null;
}

TreeElement.prototype = {
    arrowToggleWidth: 10,

    get selectable() {
        if (this._hidden)
            return false;
        return this._selectable;
    },

    set selectable(x) {
        this._selectable = x;
    },

    get listItemElement() {
        return this._listItemNode;
    },

    get childrenListElement() {
        return this._childrenListNode;
    },

    get title() {
        return this._title;
    },

    set title(x) {
        this._title = x;
        this._setListItemNodeContent();
    },

    get tooltip() {
        return this._tooltip;
    },

    set tooltip(x) {
        this._tooltip = x;
        if (this._listItemNode)
            this._listItemNode.title = x ? x : "";
    },

    get hasChildren() {
        return this._hasChildren;
    },

    set hasChildren(x) {
        if (this._hasChildren === x)
            return;

        this._hasChildren = x;

        if (!this._listItemNode)
            return;

        if (x)
            this._listItemNode.classList.add("parent");
        else {
            this._listItemNode.classList.remove("parent");
            this.collapse();
        }
    },

    get hidden() {
        return this._hidden;
    },

    set hidden(x) {
        if (this._hidden === x)
            return;

        this._hidden = x;

        if (x) {
            if (this._listItemNode)
                this._listItemNode.classList.add("hidden");
            if (this._childrenListNode)
                this._childrenListNode.classList.add("hidden");
        } else {
            if (this._listItemNode)
                this._listItemNode.classList.remove("hidden");
            if (this._childrenListNode)
                this._childrenListNode.classList.remove("hidden");
        }
    },

    get shouldRefreshChildren() {
        return this._shouldRefreshChildren;
    },

    set shouldRefreshChildren(x) {
        this._shouldRefreshChildren = x;
        if (x && this.expanded)
            this.expand();
    },

    _setListItemNodeContent: function()
    {
        if (!this._listItemNode)
            return;

        if (typeof this._title === "string")
            this._listItemNode.textContent = this._title;
        else {
            this._listItemNode.removeChildren();
            if (this._title)
                this._listItemNode.appendChild(this._title);
        }
    }
}

TreeElement.prototype.appendChild = TreeOutline.prototype.appendChild;
TreeElement.prototype.insertChild = TreeOutline.prototype.insertChild;
TreeElement.prototype.insertBeforeChild = TreeOutline.prototype.insertBeforeChild;
TreeElement.prototype.removeChild = TreeOutline.prototype.removeChild;
TreeElement.prototype.removeChildAtIndex = TreeOutline.prototype.removeChildAtIndex;
TreeElement.prototype.removeChildren = TreeOutline.prototype.removeChildren;

TreeElement.prototype._attach = function()
{
    if (!this._listItemNode || this.parent._shouldRefreshChildren) {
        if (this._listItemNode && this._listItemNode.parentNode)
            this._listItemNode.parentNode.removeChild(this._listItemNode);

        this._listItemNode = this.treeOutline._childrenListNode.ownerDocument.createElement("li");
        this._listItemNode.treeElement = this;
        this._setListItemNodeContent();
        this._listItemNode.title = this._tooltip ? this._tooltip : "";

        if (this.hidden)
            this._listItemNode.classList.add("hidden");
        if (this.hasChildren)
            this._listItemNode.classList.add("parent");
        if (this.expanded)
            this._listItemNode.classList.add("expanded");
        if (this.selected)
            this._listItemNode.classList.add("selected");

        this._listItemNode.addEventListener("mousedown", TreeElement.treeElementMouseDown, false);
        this._listItemNode.addEventListener("click", TreeElement.treeElementToggled, false);
        this._listItemNode.addEventListener("dblclick", TreeElement.treeElementDoubleClicked, false);

        this.onattach();
    }

    var nextSibling = null;
    if (this.nextSibling && this.nextSibling._listItemNode && this.nextSibling._listItemNode.parentNode === this.parent._childrenListNode)
        nextSibling = this.nextSibling._listItemNode;
    this.parent._childrenListNode.insertBefore(this._listItemNode, nextSibling);
    if (this._childrenListNode)
        this.parent._childrenListNode.insertBefore(this._childrenListNode, this._listItemNode.nextSibling);
    if (this.selected)
        this.select();
    if (this.expanded)
        this.expand();
}

TreeElement.prototype._detach = function()
{
    if (this._listItemNode && this._listItemNode.parentNode)
        this._listItemNode.parentNode.removeChild(this._listItemNode);
    if (this._childrenListNode && this._childrenListNode.parentNode)
        this._childrenListNode.parentNode.removeChild(this._childrenListNode);
}

TreeElement.treeElementMouseDown = function(event)
{
    var element = event.currentTarget;
    if (!element || !element.treeElement || !element.treeElement.selectable)
        return;

    if (element.treeElement.isEventWithinDisclosureTriangle(event))
        return;

    element.treeElement.selectOnMouseDown(event);
}

TreeElement.treeElementToggled = function(event)
{
    var element = event.currentTarget;
    if (!element || !element.treeElement)
        return;

    var toggleOnClick = element.treeElement.toggleOnClick && !element.treeElement.selectable;
    var isInTriangle = element.treeElement.isEventWithinDisclosureTriangle(event);
    if (!toggleOnClick && !isInTriangle)
        return;

    if (element.treeElement.expanded) {
        if (event.altKey)
            element.treeElement.collapseRecursively();
        else
            element.treeElement.collapse();
    } else {
        if (event.altKey)
            element.treeElement.expandRecursively();
        else
            element.treeElement.expand();
    }
    event.consume();
}

TreeElement.treeElementDoubleClicked = function(event)
{
    var element = event.currentTarget;
    if (!element || !element.treeElement)
        return;

    var handled = element.treeElement.ondblclick.call(element.treeElement, event);
    if (handled)
        return;
    if (element.treeElement.hasChildren && !element.treeElement.expanded)
        element.treeElement.expand();
}

TreeElement.prototype.collapse = function()
{
    if (this._listItemNode)
        this._listItemNode.classList.remove("expanded");
    if (this._childrenListNode)
        this._childrenListNode.classList.remove("expanded");

    this.expanded = false;

    if (this.treeOutline)
        this.treeOutline._expandedStateMap.put(this.representedObject, false);

    this.oncollapse();
}

TreeElement.prototype.collapseRecursively = function()
{
    var item = this;
    while (item) {
        if (item.expanded)
            item.collapse();
        item = item.traverseNextTreeElement(false, this, true);
    }
}

TreeElement.prototype.expand = function()
{
    if (!this.hasChildren || (this.expanded && !this._shouldRefreshChildren && this._childrenListNode))
        return;

    // Set this before onpopulate. Since onpopulate can add elements, this makes
    // sure the expanded flag is true before calling those functions. This prevents the possibility
    // of an infinite loop if onpopulate were to call expand.

    this.expanded = true;
    if (this.treeOutline)
        this.treeOutline._expandedStateMap.put(this.representedObject, true);

    if (this.treeOutline && (!this._childrenListNode || this._shouldRefreshChildren)) {
        if (this._childrenListNode && this._childrenListNode.parentNode)
            this._childrenListNode.parentNode.removeChild(this._childrenListNode);

        this._childrenListNode = this.treeOutline._childrenListNode.ownerDocument.createElement("ol");
        this._childrenListNode.parentTreeElement = this;
        this._childrenListNode.classList.add("children");

        if (this.hidden)
            this._childrenListNode.classList.add("hidden");

        this.onpopulate();

        for (var i = 0; i < this.children.length; ++i)
            this.children[i]._attach();

        delete this._shouldRefreshChildren;
    }

    if (this._listItemNode) {
        this._listItemNode.classList.add("expanded");
        if (this._childrenListNode && this._childrenListNode.parentNode != this._listItemNode.parentNode)
            this.parent._childrenListNode.insertBefore(this._childrenListNode, this._listItemNode.nextSibling);
    }

    if (this._childrenListNode)
        this._childrenListNode.classList.add("expanded");

    this.onexpand();
}

TreeElement.prototype.expandRecursively = function(maxDepth)
{
    var item = this;
    var info = {};
    var depth = 0;

    // The Inspector uses TreeOutlines to represents object properties, so recursive expansion
    // in some case can be infinite, since JavaScript objects can hold circular references.
    // So default to a recursion cap of 3 levels, since that gives fairly good results.
    if (isNaN(maxDepth))
        maxDepth = 3;

    while (item) {
        if (depth < maxDepth)
            item.expand();
        item = item.traverseNextTreeElement(false, this, (depth >= maxDepth), info);
        depth += info.depthChange;
    }
}

TreeElement.prototype.hasAncestor = function(ancestor) {
    if (!ancestor)
        return false;

    var currentNode = this.parent;
    while (currentNode) {
        if (ancestor === currentNode)
            return true;
        currentNode = currentNode.parent;
    }

    return false;
}

TreeElement.prototype.reveal = function()
{
    var currentAncestor = this.parent;
    while (currentAncestor && !currentAncestor.root) {
        if (!currentAncestor.expanded)
            currentAncestor.expand();
        currentAncestor = currentAncestor.parent;
    }

    this.onreveal();
}

TreeElement.prototype.revealed = function()
{
    var currentAncestor = this.parent;
    while (currentAncestor && !currentAncestor.root) {
        if (!currentAncestor.expanded)
            return false;
        currentAncestor = currentAncestor.parent;
    }

    return true;
}

TreeElement.prototype.selectOnMouseDown = function(event)
{
    if (this.select(false, true))
        event.consume(true);
}

/**
 * @param {boolean=} omitFocus
 * @param {boolean=} selectedByUser
 * @return {boolean}
 */
TreeElement.prototype.select = function(omitFocus, selectedByUser)
{
    if (!this.treeOutline || !this.selectable || this.selected)
        return false;

    if (this.treeOutline.selectedTreeElement)
        this.treeOutline.selectedTreeElement.deselect();

    this.selected = true;

    if (!omitFocus)
        this.treeOutline._childrenListNode.focus();

    // Focusing on another node may detach "this" from tree.
    if (!this.treeOutline)
        return false;
    this.treeOutline.selectedTreeElement = this;
    if (this._listItemNode)
        this._listItemNode.classList.add("selected");

    return this.onselect(selectedByUser);
}

/**
 * @param {boolean=} omitFocus
 */
TreeElement.prototype.revealAndSelect = function(omitFocus)
{
    this.reveal();
    this.select(omitFocus);
}

/**
 * @param {boolean=} supressOnDeselect
 */
TreeElement.prototype.deselect = function(supressOnDeselect)
{
    if (!this.treeOutline || this.treeOutline.selectedTreeElement !== this || !this.selected)
        return false;

    this.selected = false;
    this.treeOutline.selectedTreeElement = null;
    if (this._listItemNode)
        this._listItemNode.classList.remove("selected");
    return true;
}

// Overridden by subclasses.
TreeElement.prototype.onpopulate = function() { }

/**
 * @return {boolean}
 */
TreeElement.prototype.onenter = function() { return false; }

/**
 * @return {boolean}
 */
TreeElement.prototype.ondelete = function() { return false; }

/**
 * @return {boolean}
 */
TreeElement.prototype.onspace = function() { return false; }

TreeElement.prototype.onattach = function() { }

TreeElement.prototype.onexpand = function() { }

TreeElement.prototype.oncollapse = function() { }

/**
 * @param {!MouseEvent} e
 * @return {boolean}
 */
TreeElement.prototype.ondblclick = function(e) { return false; }

TreeElement.prototype.onreveal = function() { }

/**
 * @param {boolean=} selectedByUser
 * @return {boolean}
 */
TreeElement.prototype.onselect = function(selectedByUser) { return false; }

/**
 * @param {boolean} skipUnrevealed
 * @param {(!TreeOutline|!TreeElement|null)=} stayWithin
 * @param {boolean=} dontPopulate
 * @param {!Object=} info
 * @return {?TreeElement}
 */
TreeElement.prototype.traverseNextTreeElement = function(skipUnrevealed, stayWithin, dontPopulate, info)
{
    if (!dontPopulate && this.hasChildren)
        this.onpopulate();

    if (info)
        info.depthChange = 0;

    var element = skipUnrevealed ? (this.revealed() ? this.children[0] : null) : this.children[0];
    if (element && (!skipUnrevealed || (skipUnrevealed && this.expanded))) {
        if (info)
            info.depthChange = 1;
        return element;
    }

    if (this === stayWithin)
        return null;

    element = skipUnrevealed ? (this.revealed() ? this.nextSibling : null) : this.nextSibling;
    if (element)
        return element;

    element = this;
    while (element && !element.root && !(skipUnrevealed ? (element.revealed() ? element.nextSibling : null) : element.nextSibling) && element.parent !== stayWithin) {
        if (info)
            info.depthChange -= 1;
        element = element.parent;
    }

    if (!element)
        return null;

    return (skipUnrevealed ? (element.revealed() ? element.nextSibling : null) : element.nextSibling);
}

/**
 * @param {boolean} skipUnrevealed
 * @param {boolean=} dontPopulate
 * @return {?TreeElement}
 */
TreeElement.prototype.traversePreviousTreeElement = function(skipUnrevealed, dontPopulate)
{
    var element = skipUnrevealed ? (this.revealed() ? this.previousSibling : null) : this.previousSibling;
    if (!dontPopulate && element && element.hasChildren)
        element.onpopulate();

    while (element && (skipUnrevealed ? (element.revealed() && element.expanded ? element.children[element.children.length - 1] : null) : element.children[element.children.length - 1])) {
        if (!dontPopulate && element.hasChildren)
            element.onpopulate();
        element = (skipUnrevealed ? (element.revealed() && element.expanded ? element.children[element.children.length - 1] : null) : element.children[element.children.length - 1]);
    }

    if (element)
        return element;

    if (!this.parent || this.parent.root)
        return null;

    return this.parent;
}

TreeElement.prototype.isEventWithinDisclosureTriangle = function(event)
{
    // FIXME: We should not use getComputedStyle(). For that we need to get rid of using ::before for disclosure triangle. (http://webk.it/74446)
    var paddingLeftValue = window.getComputedStyle(this._listItemNode).getPropertyCSSValue("padding-left");
    var computedLeftPadding = paddingLeftValue ? paddingLeftValue.getFloatValue(CSSPrimitiveValue.CSS_PX) : 0;
    var left = this._listItemNode.totalOffsetLeft() + computedLeftPadding;
    return event.pageX >= left && event.pageX <= left + this.arrowToggleWidth && this.hasChildren;
}



/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Google Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @param {string|!Element} title
 * @param {string=} subtitle
 */
WebInspector.Section = function(title, subtitle)
{
    this.element = document.createElement("div");
    this.element.className = "section";
    this.element._section = this;

    this.headerElement = document.createElement("div");
    this.headerElement.className = "header";

    this.titleElement = document.createElement("div");
    this.titleElement.className = "title";

    this.subtitleElement = document.createElement("div");
    this.subtitleElement.className = "subtitle";

    this.headerElement.appendChild(this.subtitleElement);
    this.headerElement.appendChild(this.titleElement);

    this.headerElement.addEventListener("click", this.handleClick.bind(this), false);
    this.element.appendChild(this.headerElement);

    this.title = title;
    this.subtitle = subtitle;
    this._expanded = false;
}

WebInspector.Section.prototype = {
    get title()
    {
        return this._title;
    },

    set title(x)
    {
        if (this._title === x)
            return;
        this._title = x;

        if (x instanceof Node) {
            this.titleElement.removeChildren();
            this.titleElement.appendChild(x);
        } else
          this.titleElement.textContent = x;
    },

    get subtitle()
    {
        return this._subtitle;
    },

    set subtitle(x)
    {
        if (this._subtitle === x)
            return;
        this._subtitle = x;
        this.subtitleElement.textContent = x;
    },

    get subtitleAsTextForTest()
    {
        var result = this.subtitleElement.textContent;
        var child = this.subtitleElement.querySelector("[data-uncopyable]");
        if (child) {
            var linkData = child.getAttribute("data-uncopyable");
            if (linkData)
                result += linkData;
        }
        return result;
    },

    get expanded()
    {
        return this._expanded;
    },

    set expanded(x)
    {
        if (x)
            this.expand();
        else
            this.collapse();
    },

    get populated()
    {
        return this._populated;
    },

    set populated(x)
    {
        this._populated = x;
        if (!x && this._expanded) {
            this.onpopulate();
            this._populated = true;
        }
    },

    onpopulate: function()
    {
        // Overriden by subclasses.
    },

    get firstSibling()
    {
        var parent = this.element.parentElement;
        if (!parent)
            return null;

        var childElement = parent.firstChild;
        while (childElement) {
            if (childElement._section)
                return childElement._section;
            childElement = childElement.nextSibling;
        }

        return null;
    },

    get lastSibling()
    {
        var parent = this.element.parentElement;
        if (!parent)
            return null;

        var childElement = parent.lastChild;
        while (childElement) {
            if (childElement._section)
                return childElement._section;
            childElement = childElement.previousSibling;
        }

        return null;
    },

    get nextSibling()
    {
        var curElement = this.element;
        do {
            curElement = curElement.nextSibling;
        } while (curElement && !curElement._section);

        return curElement ? curElement._section : null;
    },

    get previousSibling()
    {
        var curElement = this.element;
        do {
            curElement = curElement.previousSibling;
        } while (curElement && !curElement._section);

        return curElement ? curElement._section : null;
    },

    expand: function()
    {
        if (this._expanded)
            return;
        this._expanded = true;
        this.element.classList.add("expanded");

        if (!this._populated) {
            this.onpopulate();
            this._populated = true;
        }
    },

    collapse: function()
    {
        if (!this._expanded)
            return;
        this._expanded = false;
        this.element.classList.remove("expanded");
    },

    toggleExpanded: function()
    {
        this.expanded = !this.expanded;
    },

    handleClick: function(event)
    {
        this.toggleExpanded();
        event.consume();
    }
}


/*
 * Copyright (C) 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.Object}
 * @implements {WebInspector.SuggestBoxDelegate}
 * @param {function(!Element, !Range, boolean, function(!Array.<string>, number=))} completions
 * @param {string=} stopCharacters
 */
WebInspector.TextPrompt = function(completions, stopCharacters)
{
    /**
     * @type {!Element|undefined}
     */
    this._proxyElement;
    this._proxyElementDisplay = "inline-block";
    this._loadCompletions = completions;
    this._completionStopCharacters = stopCharacters || " =:[({;,!+-*/&|^<>.";
}

WebInspector.TextPrompt.Events = {
    ItemApplied: "text-prompt-item-applied",
    ItemAccepted: "text-prompt-item-accepted"
};

WebInspector.TextPrompt.prototype = {
    get proxyElement()
    {
        return this._proxyElement;
    },

    /**
     * @param {string} className
     */
    setSuggestBoxEnabled: function(className)
    {
        this._suggestBoxClassName = className;
    },

    renderAsBlock: function()
    {
        this._proxyElementDisplay = "block";
    },

    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events.
     *
     * @param {!Element} element
     * @return {!Element}
     */
    attach: function(element)
    {
        return this._attachInternal(element);
    },

    /**
     * Clients should never attach any event listeners to the |element|. Instead,
     * they should use the result of this method to attach listeners for bubbling events
     * or the |blurListener| parameter to register a "blur" event listener on the |element|
     * (since the "blur" event does not bubble.)
     *
     * @param {!Element} element
     * @param {function(!Event)} blurListener
     * @return {!Element}
     */
    attachAndStartEditing: function(element, blurListener)
    {
        this._attachInternal(element);
        this._startEditing(blurListener);
        return this.proxyElement;
    },

    /**
     * @param {!Element} element
     * @return {!Element}
     */
    _attachInternal: function(element)
    {
        if (this.proxyElement)
            throw "Cannot attach an attached TextPrompt";
        this._element = element;

        this._boundOnKeyDown = this.onKeyDown.bind(this);
        this._boundOnMouseWheel = this.onMouseWheel.bind(this);
        this._boundSelectStart = this._selectStart.bind(this);
        this._proxyElement = element.ownerDocument.createElement("span");
        this._proxyElement.style.display = this._proxyElementDisplay;
        element.parentElement.insertBefore(this.proxyElement, element);
        this.proxyElement.appendChild(element);
        this._element.classList.add("text-prompt");
        this._element.addEventListener("keydown", this._boundOnKeyDown, false);
        this._element.addEventListener("mousewheel", this._boundOnMouseWheel, false);
        this._element.addEventListener("selectstart", this._boundSelectStart, false);

        if (typeof this._suggestBoxClassName === "string")
            this._suggestBox = new WebInspector.SuggestBox(this, this._element, this._suggestBoxClassName);

        return this.proxyElement;
    },

    detach: function()
    {
        this._removeFromElement();
        this.proxyElement.parentElement.insertBefore(this._element, this.proxyElement);
        this.proxyElement.remove();
        delete this._proxyElement;
        this._element.classList.remove("text-prompt");
        this._element.removeEventListener("keydown", this._boundOnKeyDown, false);
        this._element.removeEventListener("mousewheel", this._boundOnMouseWheel, false);
        this._element.removeEventListener("selectstart", this._boundSelectStart, false);
        WebInspector.restoreFocusFromElement(this._element);
    },

    /**
     * @type {string}
     */
    get text()
    {
        return this._element.textContent;
    },

    /**
     * @param {string} x
     */
    set text(x)
    {
        this._removeSuggestionAids();
        if (!x) {
            // Append a break element instead of setting textContent to make sure the selection is inside the prompt.
            this._element.removeChildren();
            this._element.appendChild(document.createElement("br"));
        } else
            this._element.textContent = x;

        this.moveCaretToEndOfPrompt();
        this._element.scrollIntoView();
    },

    _removeFromElement: function()
    {
        this.clearAutoComplete(true);
        this._element.removeEventListener("keydown", this._boundOnKeyDown, false);
        this._element.removeEventListener("selectstart", this._boundSelectStart, false);
        if (this._isEditing)
            this._stopEditing();
        if (this._suggestBox)
            this._suggestBox.removeFromElement();
    },

    /**
     * @param {function(!Event)=} blurListener
     */
    _startEditing: function(blurListener)
    {
        this._isEditing = true;
        this._element.classList.add("editing");
        if (blurListener) {
            this._blurListener = blurListener;
            this._element.addEventListener("blur", this._blurListener, false);
        }
        this._oldTabIndex = this._element.tabIndex;
        if (this._element.tabIndex < 0)
            this._element.tabIndex = 0;
        WebInspector.setCurrentFocusElement(this._element);
        if (!this.text)
            this._updateAutoComplete();
    },

    _stopEditing: function()
    {
        this._element.tabIndex = this._oldTabIndex;
        if (this._blurListener)
            this._element.removeEventListener("blur", this._blurListener, false);
        this._element.classList.remove("editing");
        delete this._isEditing;
    },

    _removeSuggestionAids: function()
    {
        this.clearAutoComplete();
        this.hideSuggestBox();
    },

    _selectStart: function()
    {
        if (this._selectionTimeout)
            clearTimeout(this._selectionTimeout);

        this._removeSuggestionAids();

        /**
         * @this {WebInspector.TextPrompt}
         */
        function moveBackIfOutside()
        {
            delete this._selectionTimeout;
            if (!this.isCaretInsidePrompt() && window.getSelection().isCollapsed) {
                this.moveCaretToEndOfPrompt();
                this.autoCompleteSoon();
            }
        }

        this._selectionTimeout = setTimeout(moveBackIfOutside.bind(this), 100);
    },

    /**
     * @param {boolean=} force
     * @return {boolean}
     */
    defaultKeyHandler: function(event, force)
    {
        this._updateAutoComplete(force);
        return false;
    },

    /**
     * @param {boolean=} force
     */
    _updateAutoComplete: function(force)
    {
        this.clearAutoComplete();
        this.autoCompleteSoon(force);
    },

    /**
     * @param {?Event} event
     */
    onMouseWheel: function(event)
    {
        // Subclasses can implement.
    },

    /**
     * @param {?Event} event
     * @return {boolean}
     */
    onKeyDown: function(event)
    {
        var handled = false;
        var invokeDefault = true;

        switch (event.keyIdentifier) {
        case "U+0009": // Tab
            handled = this.tabKeyPressed(event);
            break;
        case "Left":
        case "Home":
            this._removeSuggestionAids();
            invokeDefault = false;
            break;
        case "Right":
        case "End":
            if (this.isCaretAtEndOfPrompt())
                handled = this.acceptAutoComplete();
            else
                this._removeSuggestionAids();
            invokeDefault = false;
            break;
        case "U+001B": // Esc
            if (this.isSuggestBoxVisible()) {
                this._removeSuggestionAids();
                handled = true;
            }
            break;
        case "U+0020": // Space
            if (event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
                this.defaultKeyHandler(event, true);
                handled = true;
            }
            break;
        case "Alt":
        case "Meta":
        case "Shift":
        case "Control":
            invokeDefault = false;
            break;
        }

        if (!handled && this.isSuggestBoxVisible())
            handled = this._suggestBox.keyPressed(event);

        if (!handled && invokeDefault)
            handled = this.defaultKeyHandler(event);

        if (handled)
            event.consume(true);

        return handled;
    },

    /**
     * @return {boolean}
     */
    acceptAutoComplete: function()
    {
        var result = false;
        if (this.isSuggestBoxVisible())
            result = this._suggestBox.acceptSuggestion();
        if (!result)
            result = this._acceptSuggestionInternal();

        return result;
    },

    /**
     * @param {boolean=} includeTimeout
     */
    clearAutoComplete: function(includeTimeout)
    {
        if (includeTimeout && this._completeTimeout) {
            clearTimeout(this._completeTimeout);
            delete this._completeTimeout;
        }
        delete this._waitingForCompletions;

        if (!this.autoCompleteElement)
            return;

        this.autoCompleteElement.remove();
        delete this.autoCompleteElement;

        if (!this._userEnteredRange || !this._userEnteredText)
            return;

        this._userEnteredRange.deleteContents();
        this._element.normalize();

        var userTextNode = document.createTextNode(this._userEnteredText);
        this._userEnteredRange.insertNode(userTextNode);

        var selectionRange = document.createRange();
        selectionRange.setStart(userTextNode, this._userEnteredText.length);
        selectionRange.setEnd(userTextNode, this._userEnteredText.length);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(selectionRange);

        delete this._userEnteredRange;
        delete this._userEnteredText;
    },

    /**
     * @param {boolean=} force
     */
    autoCompleteSoon: function(force)
    {
        var immediately = this.isSuggestBoxVisible() || force;
        if (!this._completeTimeout)
            this._completeTimeout = setTimeout(this.complete.bind(this, force), immediately ? 0 : 250);
    },

    /**
     * @param {boolean=} reverse
     */
    complete: function(force, reverse)
    {
        this.clearAutoComplete(true);
        var selection = window.getSelection();
        if (!selection.rangeCount)
            return;

        var selectionRange = selection.getRangeAt(0);
        var shouldExit;

        if (!force && !this.isCaretAtEndOfPrompt() && !this.isSuggestBoxVisible())
            shouldExit = true;
        else if (!selection.isCollapsed)
            shouldExit = true;
        else if (!force) {
            // BUG72018: Do not show suggest box if caret is followed by a non-stop character.
            var wordSuffixRange = selectionRange.startContainer.rangeOfWord(selectionRange.endOffset, this._completionStopCharacters, this._element, "forward");
            if (wordSuffixRange.toString().length)
                shouldExit = true;
        }
        if (shouldExit) {
            this.hideSuggestBox();
            return;
        }

        var wordPrefixRange = selectionRange.startContainer.rangeOfWord(selectionRange.startOffset, this._completionStopCharacters, this._element, "backward");
        this._waitingForCompletions = true;
        this._loadCompletions(this.proxyElement, wordPrefixRange, force, this._completionsReady.bind(this, selection, wordPrefixRange, !!reverse));
    },

    disableDefaultSuggestionForEmptyInput: function()
    {
        this._disableDefaultSuggestionForEmptyInput = true;
    },

    /**
     * @param {!Selection} selection
     * @param {!Range} textRange
     */
    _boxForAnchorAtStart: function(selection, textRange)
    {
        var rangeCopy = selection.getRangeAt(0).cloneRange();
        var anchorElement = document.createElement("span");
        anchorElement.textContent = "\u200B";
        textRange.insertNode(anchorElement);
        var box = anchorElement.boxInWindow(window);
        anchorElement.remove();
        selection.removeAllRanges();
        selection.addRange(rangeCopy);
        return box;
    },

    /**
     * @param {!Array.<string>} completions
     * @param {number} wordPrefixLength
     */
    _buildCommonPrefix: function(completions, wordPrefixLength)
    {
        var commonPrefix = completions[0];
        for (var i = 0; i < completions.length; ++i) {
            var completion = completions[i];
            var lastIndex = Math.min(commonPrefix.length, completion.length);
            for (var j = wordPrefixLength; j < lastIndex; ++j) {
                if (commonPrefix[j] !== completion[j]) {
                    commonPrefix = commonPrefix.substr(0, j);
                    break;
                }
            }
        }
        return commonPrefix;
    },

    /**
     * @param {!Selection} selection
     * @param {!Range} originalWordPrefixRange
     * @param {boolean} reverse
     * @param {!Array.<string>} completions
     * @param {number=} selectedIndex
     */
    _completionsReady: function(selection, originalWordPrefixRange, reverse, completions, selectedIndex)
    {
        if (!this._waitingForCompletions || !completions.length) {
            this.hideSuggestBox();
            return;
        }
        delete this._waitingForCompletions;

        var selectionRange = selection.getRangeAt(0);

        var fullWordRange = document.createRange();
        fullWordRange.setStart(originalWordPrefixRange.startContainer, originalWordPrefixRange.startOffset);
        fullWordRange.setEnd(selectionRange.endContainer, selectionRange.endOffset);

        if (originalWordPrefixRange.toString() + selectionRange.toString() !== fullWordRange.toString())
            return;

        selectedIndex = (this._disableDefaultSuggestionForEmptyInput && !this.text) ? -1 : (selectedIndex || 0);

        this._userEnteredRange = fullWordRange;
        this._userEnteredText = fullWordRange.toString();

        if (this._suggestBox)
            this._suggestBox.updateSuggestions(this._boxForAnchorAtStart(selection, fullWordRange), completions, selectedIndex, !this.isCaretAtEndOfPrompt(), this._userEnteredText);

        if (selectedIndex === -1)
            return;

        var wordPrefixLength = originalWordPrefixRange.toString().length;
        this._commonPrefix = this._buildCommonPrefix(completions, wordPrefixLength);

        if (this.isCaretAtEndOfPrompt()) {
            this._userEnteredRange.deleteContents();
            this._element.normalize();
            var finalSelectionRange = document.createRange();
            var completionText = completions[selectedIndex];
            var prefixText = completionText.substring(0, wordPrefixLength);
            var suffixText = completionText.substring(wordPrefixLength);

            var prefixTextNode = document.createTextNode(prefixText);
            fullWordRange.insertNode(prefixTextNode);

            this.autoCompleteElement = document.createElement("span");
            this.autoCompleteElement.className = "auto-complete-text";
            this.autoCompleteElement.textContent = suffixText;

            prefixTextNode.parentNode.insertBefore(this.autoCompleteElement, prefixTextNode.nextSibling);

            finalSelectionRange.setStart(prefixTextNode, wordPrefixLength);
            finalSelectionRange.setEnd(prefixTextNode, wordPrefixLength);
            selection.removeAllRanges();
            selection.addRange(finalSelectionRange);
            this.dispatchEventToListeners(WebInspector.TextPrompt.Events.ItemApplied);
        }
    },

    _completeCommonPrefix: function()
    {
        if (!this.autoCompleteElement || !this._commonPrefix || !this._userEnteredText || !this._commonPrefix.startsWith(this._userEnteredText))
            return;

        if (!this.isSuggestBoxVisible()) {
            this.acceptAutoComplete();
            return;
        }

        this.autoCompleteElement.textContent = this._commonPrefix.substring(this._userEnteredText.length);
        this._acceptSuggestionInternal(true);
    },

    /**
     * @param {string} completionText
     * @param {boolean=} isIntermediateSuggestion
     */
    applySuggestion: function(completionText, isIntermediateSuggestion)
    {
        this._applySuggestion(completionText, isIntermediateSuggestion);
    },

    /**
     * @param {string} completionText
     * @param {boolean=} isIntermediateSuggestion
     * @param {!Range=} originalPrefixRange
     */
    _applySuggestion: function(completionText, isIntermediateSuggestion, originalPrefixRange)
    {
        var wordPrefixLength;
        if (originalPrefixRange)
            wordPrefixLength = originalPrefixRange.toString().length;
        else
            wordPrefixLength = this._userEnteredText ? this._userEnteredText.length : 0;

        this._userEnteredRange.deleteContents();
        this._element.normalize();
        var finalSelectionRange = document.createRange();
        var completionTextNode = document.createTextNode(completionText);
        this._userEnteredRange.insertNode(completionTextNode);
        if (this.autoCompleteElement) {
            this.autoCompleteElement.remove();
            delete this.autoCompleteElement;
        }

        if (isIntermediateSuggestion)
            finalSelectionRange.setStart(completionTextNode, wordPrefixLength);
        else
            finalSelectionRange.setStart(completionTextNode, completionText.length);

        finalSelectionRange.setEnd(completionTextNode, completionText.length);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(finalSelectionRange);
        if (isIntermediateSuggestion)
            this.dispatchEventToListeners(WebInspector.TextPrompt.Events.ItemApplied, { itemText: completionText });
    },

    /**
     * @override
     */
    acceptSuggestion: function()
    {
        this._acceptSuggestionInternal();
    },

    /**
     * @param {boolean=} prefixAccepted
     * @return {boolean}
     */
    _acceptSuggestionInternal: function(prefixAccepted)
    {
        if (this._isAcceptingSuggestion)
            return false;

        if (!this.autoCompleteElement || !this.autoCompleteElement.parentNode)
            return false;

        var text = this.autoCompleteElement.textContent;
        var textNode = document.createTextNode(text);
        this.autoCompleteElement.parentNode.replaceChild(textNode, this.autoCompleteElement);
        delete this.autoCompleteElement;

        var finalSelectionRange = document.createRange();
        finalSelectionRange.setStart(textNode, text.length);
        finalSelectionRange.setEnd(textNode, text.length);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(finalSelectionRange);

        if (!prefixAccepted) {
            this.hideSuggestBox();
            this.dispatchEventToListeners(WebInspector.TextPrompt.Events.ItemAccepted);
        } else
            this.autoCompleteSoon(true);

        return true;
    },

    hideSuggestBox: function()
    {
        if (this.isSuggestBoxVisible())
            this._suggestBox.hide();
    },

    /**
     * @return {boolean}
     */
    isSuggestBoxVisible: function()
    {
        return this._suggestBox && this._suggestBox.visible();
    },

    /**
     * @return {boolean}
     */
    isCaretInsidePrompt: function()
    {
        return this._element.isInsertionCaretInside();
    },

    /**
     * @return {boolean}
     */
    isCaretAtEndOfPrompt: function()
    {
        var selection = window.getSelection();
        if (!selection.rangeCount || !selection.isCollapsed)
            return false;

        var selectionRange = selection.getRangeAt(0);
        var node = selectionRange.startContainer;
        if (!node.isSelfOrDescendant(this._element))
            return false;

        if (node.nodeType === Node.TEXT_NODE && selectionRange.startOffset < node.nodeValue.length)
            return false;

        var foundNextText = false;
        while (node) {
            if (node.nodeType === Node.TEXT_NODE && node.nodeValue.length) {
                if (foundNextText && (!this.autoCompleteElement || !this.autoCompleteElement.isAncestor(node)))
                    return false;
                foundNextText = true;
            }

            node = node.traverseNextNode(this._element);
        }

        return true;
    },

    /**
     * @return {boolean}
     */
    isCaretOnFirstLine: function()
    {
        var selection = window.getSelection();
        var focusNode = selection.focusNode;
        if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE || focusNode.parentNode !== this._element)
            return true;

        if (focusNode.textContent.substring(0, selection.focusOffset).indexOf("\n") !== -1)
            return false;
        focusNode = focusNode.previousSibling;

        while (focusNode) {
            if (focusNode.nodeType !== Node.TEXT_NODE)
                return true;
            if (focusNode.textContent.indexOf("\n") !== -1)
                return false;
            focusNode = focusNode.previousSibling;
        }

        return true;
    },

    /**
     * @return {boolean}
     */
    isCaretOnLastLine: function()
    {
        var selection = window.getSelection();
        var focusNode = selection.focusNode;
        if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE || focusNode.parentNode !== this._element)
            return true;

        if (focusNode.textContent.substring(selection.focusOffset).indexOf("\n") !== -1)
            return false;
        focusNode = focusNode.nextSibling;

        while (focusNode) {
            if (focusNode.nodeType !== Node.TEXT_NODE)
                return true;
            if (focusNode.textContent.indexOf("\n") !== -1)
                return false;
            focusNode = focusNode.nextSibling;
        }

        return true;
    },

    moveCaretToEndOfPrompt: function()
    {
        var selection = window.getSelection();
        var selectionRange = document.createRange();

        var offset = this._element.childNodes.length;
        selectionRange.setStart(this._element, offset);
        selectionRange.setEnd(this._element, offset);

        selection.removeAllRanges();
        selection.addRange(selectionRange);
    },

    /**
     * @param {!Event} event
     * @return {boolean}
     */
    tabKeyPressed: function(event)
    {
        this._completeCommonPrefix();

        // Consume the key.
        return true;
    },

    __proto__: WebInspector.Object.prototype
}


/**
 * @constructor
 * @extends {WebInspector.TextPrompt}
 * @param {function(!Element, !Range, boolean, function(!Array.<string>, number=))} completions
 * @param {string=} stopCharacters
 */
WebInspector.TextPromptWithHistory = function(completions, stopCharacters)
{
    WebInspector.TextPrompt.call(this, completions, stopCharacters);

    /**
     * @type {!Array.<string>}
     */
    this._data = [];

    /**
     * 1-based entry in the history stack.
     * @type {number}
     */
    this._historyOffset = 1;

    /**
     * Whether to coalesce duplicate items in the history, default is true.
     * @type {boolean}
     */
    this._coalesceHistoryDupes = true;
}

WebInspector.TextPromptWithHistory.prototype = {
    /**
     * @return {!Array.<string>}
     */
    get historyData()
    {
        // FIXME: do we need to copy this?
        return this._data;
    },

    /**
     * @param {boolean} x
     */
    setCoalesceHistoryDupes: function(x)
    {
        this._coalesceHistoryDupes = x;
    },

    /**
     * @param {!Array.<string>} data
     */
    setHistoryData: function(data)
    {
        this._data = [].concat(data);
        this._historyOffset = 1;
    },

    /**
     * Pushes a committed text into the history.
     * @param {string} text
     */
    pushHistoryItem: function(text)
    {
        if (this._uncommittedIsTop) {
            this._data.pop();
            delete this._uncommittedIsTop;
        }

        this._historyOffset = 1;
        if (this._coalesceHistoryDupes && text === this._currentHistoryItem())
            return;
        this._data.push(text);
    },

    /**
     * Pushes the current (uncommitted) text into the history.
     */
    _pushCurrentText: function()
    {
        if (this._uncommittedIsTop)
            this._data.pop(); // Throw away obsolete uncommitted text.
        this._uncommittedIsTop = true;
        this.clearAutoComplete(true);
        this._data.push(this.text);
    },

    /**
     * @return {string|undefined}
     */
    _previous: function()
    {
        if (this._historyOffset > this._data.length)
            return undefined;
        if (this._historyOffset === 1)
            this._pushCurrentText();
        ++this._historyOffset;
        return this._currentHistoryItem();
    },

    /**
     * @return {string|undefined}
     */
    _next: function()
    {
        if (this._historyOffset === 1)
            return undefined;
        --this._historyOffset;
        return this._currentHistoryItem();
    },

    /**
     * @return {string|undefined}
     */
    _currentHistoryItem: function()
    {
        return this._data[this._data.length - this._historyOffset];
    },

    /**
     * @override
     * @return {boolean}
     */
    defaultKeyHandler: function(event, force)
    {
        var newText;
        var isPrevious;

        switch (event.keyIdentifier) {
        case "Up":
            if (!this.isCaretOnFirstLine())
                break;
            newText = this._previous();
            isPrevious = true;
            break;
        case "Down":
            if (!this.isCaretOnLastLine())
                break;
            newText = this._next();
            break;
        case "U+0050": // Ctrl+P = Previous
            if (WebInspector.isMac() && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
                newText = this._previous();
                isPrevious = true;
            }
            break;
        case "U+004E": // Ctrl+N = Next
            if (WebInspector.isMac() && event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey)
                newText = this._next();
            break;
        }

        if (newText !== undefined) {
            event.consume(true);
            this.text = newText;

            if (isPrevious) {
                var firstNewlineIndex = this.text.indexOf("\n");
                if (firstNewlineIndex === -1)
                    this.moveCaretToEndOfPrompt();
                else {
                    var selection = window.getSelection();
                    var selectionRange = document.createRange();

                    selectionRange.setStart(this._element.firstChild, firstNewlineIndex);
                    selectionRange.setEnd(this._element.firstChild, firstNewlineIndex);

                    selection.removeAllRanges();
                    selection.addRange(selectionRange);
                }
            }

            return true;
        }

        return WebInspector.TextPrompt.prototype.defaultKeyHandler.apply(this, arguments);
    },

    __proto__: WebInspector.TextPrompt.prototype
}


/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 * Copyright (C) 2006, 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2007 Matt Lilek (pewtermoose@gmail.com).
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

 /**
 * @param {string} string
 * @param {...*} vararg
 * @return {string}
 */
WebInspector.UIString = function(string, vararg)
{
    return String.vsprintf(string, Array.prototype.slice.call(arguments, 1));
}



/*
 * Copyright (C) 2009, 2010 Google Inc. All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @param {!WebInspector.DOMAgent} domAgent
 * @param {?WebInspector.DOMDocument} doc
 * @param {boolean} isInShadowTree
 * @param {!DOMAgent.Node} payload
 */
WebInspector.DOMNode = function(domAgent, doc, isInShadowTree, payload) {
    this._domAgent = domAgent;
    this.ownerDocument = doc;
    this._isInShadowTree = isInShadowTree;

    this.id = payload.nodeId;
    domAgent._idToDOMNode[this.id] = this;
    this._nodeType = payload.nodeType;
    this._nodeName = payload.nodeName;
    this._localName = payload.localName;
    this._nodeValue = payload.nodeValue;
    this._pseudoType = payload.pseudoType;
    this._shadowRootType = payload.shadowRootType;

    this._shadowRoots = [];

    this._attributes = [];
    this._attributesMap = {};
    if (payload.attributes)
        this._setAttributesPayload(payload.attributes);

    this._userProperties = {};
    this._descendantUserPropertyCounters = {};

    this._childNodeCount = payload.childNodeCount || 0;
    this._children = null;

    this.nextSibling = null;
    this.previousSibling = null;
    this.firstChild = null;
    this.lastChild = null;
    this.parentNode = null;

    if (payload.shadowRoots) {
        for (var i = 0; i < payload.shadowRoots.length; ++i) {
            var root = payload.shadowRoots[i];
            var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, true, root);
            this._shadowRoots.push(node);
            node.parentNode = this;
        }
    }

    if (payload.templateContent) {
        this._templateContent = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, true, payload.templateContent);
        this._templateContent.parentNode = this;
    }

    if (payload.children)
        this._setChildrenPayload(payload.children);

    this._setPseudoElements(payload.pseudoElements);

    if (payload.contentDocument) {
        this._contentDocument = new WebInspector.DOMDocument(domAgent, payload.contentDocument);
        this._children = [this._contentDocument];
        this._renumber();
    }

    if (this._nodeType === Node.ELEMENT_NODE) {
        // HTML and BODY from internal iframes should not overwrite top-level ones.
        if (this.ownerDocument && !this.ownerDocument.documentElement && this._nodeName === "HTML")
            this.ownerDocument.documentElement = this;
        if (this.ownerDocument && !this.ownerDocument.body && this._nodeName === "BODY")
            this.ownerDocument.body = this;
    } else if (this._nodeType === Node.DOCUMENT_TYPE_NODE) {
        this.publicId = payload.publicId;
        this.systemId = payload.systemId;
        this.internalSubset = payload.internalSubset;
    } else if (this._nodeType === Node.ATTRIBUTE_NODE) {
        this.name = payload.name;
        this.value = payload.value;
    }
}

WebInspector.DOMNode.PseudoElementNames = {
    Before: "before",
    After: "after"
}

WebInspector.DOMNode.ShadowRootTypes = {
    UserAgent: "user-agent",
    Author: "author"
}

WebInspector.DOMNode.prototype = {
    /**
     * @return {?Array.<!WebInspector.DOMNode>}
     */
    children: function()
    {
        return this._children ? this._children.slice() : null;
    },

    /**
     * @return {boolean}
     */
    hasAttributes: function()
    {
        return this._attributes.length > 0;
    },

    /**
     * @return {number}
     */
    childNodeCount: function()
    {
        return this._childNodeCount;
    },

    /**
     * @return {boolean}
     */
    hasShadowRoots: function()
    {
        return !!this._shadowRoots.length;
    },

    /**
     * @return {!Array.<!WebInspector.DOMNode>}
     */
    shadowRoots: function()
    {
        return this._shadowRoots.slice();
    },

    /**
     * @return {!WebInspector.DOMNode}
     */
    templateContent: function()
    {
        return this._templateContent;
    },

    /**
     * @return {number}
     */
    nodeType: function()
    {
        return this._nodeType;
    },

    /**
     * @return {string}
     */
    nodeName: function()
    {
        return this._nodeName;
    },

    /**
     * @return {string|undefined}
     */
    pseudoType: function()
    {
        return this._pseudoType;
    },

    /**
     * @return {boolean}
     */
    hasPseudoElements: function()
    {
        return Object.keys(this._pseudoElements).length !== 0;
    },

    /**
     * @return {!Object.<string, !WebInspector.DOMNode>}
     */
    pseudoElements: function()
    {
        return this._pseudoElements;
    },

    /**
     * @return {boolean}
     */
    isInShadowTree: function()
    {
        return this._isInShadowTree;
    },

    /**
     * @return {?string}
     */
    shadowRootType: function()
    {
        return this._shadowRootType || null;
    },

    /**
     * @return {string}
     */
    nodeNameInCorrectCase: function()
    {
        return this.isXMLNode() ? this.nodeName() : this.nodeName().toLowerCase();
    },

    /**
     * @param {string} name
     * @param {function(?Protocol.Error)=} callback
     */
    setNodeName: function(name, callback)
    {
        DOMAgent.setNodeName(this.id, name, WebInspector.domAgent._markRevision(this, callback));
    },

    /**
     * @return {string}
     */
    localName: function()
    {
        return this._localName;
    },

    /**
     * @return {string}
     */
    nodeValue: function()
    {
        return this._nodeValue;
    },

    /**
     * @param {string} value
     * @param {function(?Protocol.Error)=} callback
     */
    setNodeValue: function(value, callback)
    {
        DOMAgent.setNodeValue(this.id, value, WebInspector.domAgent._markRevision(this, callback));
    },

    /**
     * @param {string} name
     * @return {string}
     */
    getAttribute: function(name)
    {
        var attr = this._attributesMap[name];
        return attr ? attr.value : undefined;
    },

    /**
     * @param {string} name
     * @param {string} text
     * @param {function(?Protocol.Error)=} callback
     */
    setAttribute: function(name, text, callback)
    {
        DOMAgent.setAttributesAsText(this.id, text, name, WebInspector.domAgent._markRevision(this, callback));
    },

    /**
     * @param {string} name
     * @param {string} value
     * @param {function(?Protocol.Error)=} callback
     */
    setAttributeValue: function(name, value, callback)
    {
        DOMAgent.setAttributeValue(this.id, name, value, WebInspector.domAgent._markRevision(this, callback));
    },

    /**
     * @return {!Object}
     */
    attributes: function()
    {
        return this._attributes;
    },

    /**
     * @param {string} name
     * @param {function(?Protocol.Error)=} callback
     */
    removeAttribute: function(name, callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @this {WebInspector.DOMNode}
         */
        function mycallback(error)
        {
            if (!error) {
                delete this._attributesMap[name];
                for (var i = 0;  i < this._attributes.length; ++i) {
                    if (this._attributes[i].name === name) {
                        this._attributes.splice(i, 1);
                        break;
                    }
                }
            }

            WebInspector.domAgent._markRevision(this, callback)(error);
        }
        DOMAgent.removeAttribute(this.id, name, mycallback.bind(this));
    },

    /**
     * @param {function(?Array.<!WebInspector.DOMNode>)=} callback
     */
    getChildNodes: function(callback)
    {
        if (this._children) {
            if (callback)
                callback(this.children());
            return;
        }

        /**
         * @this {WebInspector.DOMNode}
         * @param {?Protocol.Error} error
         */
        function mycallback(error)
        {
            if (callback)
                callback(error ? null : this.children());
        }

        DOMAgent.requestChildNodes(this.id, undefined, mycallback.bind(this));
    },

    /**
     * @param {number} depth
     * @param {function(?Array.<!WebInspector.DOMNode>)=} callback
     */
    getSubtree: function(depth, callback)
    {
        /**
         * @this {WebInspector.DOMNode}
         * @param {?Protocol.Error} error
         */
        function mycallback(error)
        {
            if (callback)
                callback(error ? null : this._children);
        }

        DOMAgent.requestChildNodes(this.id, depth, mycallback.bind(this));
    },

    /**
     * @param {function(?Protocol.Error)=} callback
     */
    getOuterHTML: function(callback)
    {
        DOMAgent.getOuterHTML(this.id, callback);
    },

    /**
     * @param {string} html
     * @param {function(?Protocol.Error)=} callback
     */
    setOuterHTML: function(html, callback)
    {
        DOMAgent.setOuterHTML(this.id, html, WebInspector.domAgent._markRevision(this, callback));
    },

    /**
     * @param {function(?Protocol.Error, !DOMAgent.NodeId=)=} callback
     */
    removeNode: function(callback)
    {
        DOMAgent.removeNode(this.id, WebInspector.domAgent._markRevision(this, callback));
    },

    copyNode: function()
    {
        function copy(error, text)
        {
            if (!error)
                InspectorFrontendHost.copyText(text);
        }
        DOMAgent.getOuterHTML(this.id, copy);
    },

    /**
     * @param {string} objectGroupId
     * @param {function(?Protocol.Error)=} callback
     */
    eventListeners: function(objectGroupId, callback)
    {
        DOMAgent.getEventListenersForNode(this.id, objectGroupId, callback);
    },

    /**
     * @return {string}
     */
    path: function()
    {
        var path = [];
        var node = this;
        while (node && "index" in node && node._nodeName.length) {
            path.push([node.index, node._nodeName]);
            node = node.parentNode;
        }
        path.reverse();
        return path.join(",");
    },

    /**
     * @param {!WebInspector.DOMNode} node
     * @return {boolean}
     */
    isAncestor: function(node)
    {
        if (!node)
            return false;

        var currentNode = node.parentNode;
        while (currentNode) {
            if (this === currentNode)
                return true;
            currentNode = currentNode.parentNode;
        }
        return false;
    },

    /**
     * @param {!WebInspector.DOMNode} descendant
     * @return {boolean}
     */
    isDescendant: function(descendant)
    {
        return descendant !== null && descendant.isAncestor(this);
    },

    /**
     * @param {!Array.<string>} attrs
     * @return {boolean}
     */
    _setAttributesPayload: function(attrs)
    {
        var attributesChanged = !this._attributes || attrs.length !== this._attributes.length * 2;
        var oldAttributesMap = this._attributesMap || {};

        this._attributes = [];
        this._attributesMap = {};

        for (var i = 0; i < attrs.length; i += 2) {
            var name = attrs[i];
            var value = attrs[i + 1];
            this._addAttribute(name, value);

            if (attributesChanged)
                continue;

            if (!oldAttributesMap[name] || oldAttributesMap[name].value !== value)
              attributesChanged = true;
        }
        return attributesChanged;
    },

    /**
     * @param {!WebInspector.DOMNode} prev
     * @param {!DOMAgent.Node} payload
     * @return {!WebInspector.DOMNode}
     */
    _insertChild: function(prev, payload)
    {
        var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, this._isInShadowTree, payload);
        this._children.splice(this._children.indexOf(prev) + 1, 0, node);
        this._renumber();
        return node;
    },

    /**
     * @param {!WebInspector.DOMNode} node
     */
    _removeChild: function(node)
    {
        if (node.pseudoType()) {
            delete this._pseudoElements[node.pseudoType()];
        } else {
            var shadowRootIndex = this._shadowRoots.indexOf(node);
            if (shadowRootIndex !== -1)
                this._shadowRoots.splice(shadowRootIndex, 1);
            else
                this._children.splice(this._children.indexOf(node), 1);
        }
        node.parentNode = null;
        node._updateChildUserPropertyCountsOnRemoval(this);
        this._renumber();
    },

    /**
     * @param {!Array.<!DOMAgent.Node>} payloads
     */
    _setChildrenPayload: function(payloads)
    {
        // We set children in the constructor.
        if (this._contentDocument)
            return;

        this._children = [];
        for (var i = 0; i < payloads.length; ++i) {
            var payload = payloads[i];
            var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, this._isInShadowTree, payload);
            this._children.push(node);
        }
        this._renumber();
    },

    /**
     * @param {!Array.<!DOMAgent.Node>|undefined} payloads
     */
    _setPseudoElements: function(payloads)
    {
        this._pseudoElements = {};
        if (!payloads)
            return;

        for (var i = 0; i < payloads.length; ++i) {
            var node = new WebInspector.DOMNode(this._domAgent, this.ownerDocument, this._isInShadowTree, payloads[i]);
            node.parentNode = this;
            this._pseudoElements[node.pseudoType()] = node;
        }
    },

    _renumber: function()
    {
        this._childNodeCount = this._children.length;
        if (this._childNodeCount == 0) {
            this.firstChild = null;
            this.lastChild = null;
            return;
        }
        this.firstChild = this._children[0];
        this.lastChild = this._children[this._childNodeCount - 1];
        for (var i = 0; i < this._childNodeCount; ++i) {
            var child = this._children[i];
            child.index = i;
            child.nextSibling = i + 1 < this._childNodeCount ? this._children[i + 1] : null;
            child.previousSibling = i - 1 >= 0 ? this._children[i - 1] : null;
            child.parentNode = this;
        }
    },

    /**
     * @param {string} name
     * @param {string} value
     */
    _addAttribute: function(name, value)
    {
        var attr = {
            name: name,
            value: value,
            _node: this
        };
        this._attributesMap[name] = attr;
        this._attributes.push(attr);
    },

    /**
     * @param {string} name
     * @param {string} value
     */
    _setAttribute: function(name, value)
    {
        var attr = this._attributesMap[name];
        if (attr)
            attr.value = value;
        else
            this._addAttribute(name, value);
    },

    /**
     * @param {string} name
     */
    _removeAttribute: function(name)
    {
        var attr = this._attributesMap[name];
        if (attr) {
            this._attributes.remove(attr);
            delete this._attributesMap[name];
        }
    },

    /**
     * @param {!WebInspector.DOMNode} targetNode
     * @param {?WebInspector.DOMNode} anchorNode
     * @param {function(?Protocol.Error, !DOMAgent.NodeId=)=} callback
     */
    moveTo: function(targetNode, anchorNode, callback)
    {
        DOMAgent.moveTo(this.id, targetNode.id, anchorNode ? anchorNode.id : undefined, WebInspector.domAgent._markRevision(this, callback));
    },

    /**
     * @return {boolean}
     */
    isXMLNode: function()
    {
        return !!this.ownerDocument && !!this.ownerDocument.xmlVersion;
    },

    _updateChildUserPropertyCountsOnRemoval: function(parentNode)
    {
        var result = {};
        if (this._userProperties) {
            for (var name in this._userProperties)
                result[name] = (result[name] || 0) + 1;
        }

        if (this._descendantUserPropertyCounters) {
            for (var name in this._descendantUserPropertyCounters) {
                var counter = this._descendantUserPropertyCounters[name];
                result[name] = (result[name] || 0) + counter;
            }
        }

        for (var name in result)
            parentNode._updateDescendantUserPropertyCount(name, -result[name]);
    },

    _updateDescendantUserPropertyCount: function(name, delta)
    {
        if (!this._descendantUserPropertyCounters.hasOwnProperty(name))
            this._descendantUserPropertyCounters[name] = 0;
        this._descendantUserPropertyCounters[name] += delta;
        if (!this._descendantUserPropertyCounters[name])
            delete this._descendantUserPropertyCounters[name];
        if (this.parentNode)
            this.parentNode._updateDescendantUserPropertyCount(name, delta);
    },

    setUserProperty: function(name, value)
    {
        if (value === null) {
            this.removeUserProperty(name);
            return;
        }

        if (this.parentNode && !this._userProperties.hasOwnProperty(name))
            this.parentNode._updateDescendantUserPropertyCount(name, 1);

        this._userProperties[name] = value;
    },

    removeUserProperty: function(name)
    {
        if (!this._userProperties.hasOwnProperty(name))
            return;

        delete this._userProperties[name];
        if (this.parentNode)
            this.parentNode._updateDescendantUserPropertyCount(name, -1);
    },

    /**
     * @param {string} name
     * @return {?T}
     * @template T
     */
    getUserProperty: function(name)
    {
        return (this._userProperties && this._userProperties[name]) || null;
    },

    /**
     * @param {string} name
     * @return {number}
     */
    descendantUserPropertyCount: function(name)
    {
        return this._descendantUserPropertyCounters && this._descendantUserPropertyCounters[name] ? this._descendantUserPropertyCounters[name] : 0;
    },

    /**
     * @param {string} url
     * @return {?string}
     */
    resolveURL: function(url)
    {
        if (!url)
            return url;
        for (var frameOwnerCandidate = this; frameOwnerCandidate; frameOwnerCandidate = frameOwnerCandidate.parentNode) {
            if (frameOwnerCandidate.baseURL)
                return WebInspector.ParsedURL.completeURL(frameOwnerCandidate.baseURL, url);
        }
        return null;
    },

    reveal: function()
    {
        var revealer = WebInspector.moduleManager.instance(WebInspector.Revealer, this);
        if (revealer)
            revealer.reveal(this);
    }
}

/**
 * @extends {WebInspector.DOMNode}
 * @constructor
 * @param {!WebInspector.DOMAgent} domAgent
 * @param {!DOMAgent.Node} payload
 */
WebInspector.DOMDocument = function(domAgent, payload)
{
    WebInspector.DOMNode.call(this, domAgent, this, false, payload);
    this.documentURL = payload.documentURL || "";
    this.baseURL = payload.baseURL || "";
    this.xmlVersion = payload.xmlVersion;
    this._listeners = {};
}

WebInspector.DOMDocument.prototype = {
    __proto__: WebInspector.DOMNode.prototype
}

/**
 * @extends {WebInspector.Object}
 * @constructor
 */
WebInspector.DOMAgent = function() {
    /** @type {!Object.<number, !WebInspector.DOMNode>} */
    this._idToDOMNode = {};
    /** @type {?WebInspector.DOMDocument} */
    this._document = null;
    /** @type {!Object.<number, boolean>} */
    this._attributeLoadNodeIds = {};
    InspectorBackend.registerDOMDispatcher(new WebInspector.DOMDispatcher(this));

    this._defaultHighlighter = new WebInspector.DefaultDOMNodeHighlighter();
    this._highlighter = this._defaultHighlighter;
}

WebInspector.DOMAgent.Events = {
    AttrModified: "AttrModified",
    AttrRemoved: "AttrRemoved",
    CharacterDataModified: "CharacterDataModified",
    NodeInserted: "NodeInserted",
    NodeRemoved: "NodeRemoved",
    DocumentUpdated: "DocumentUpdated",
    ChildNodeCountUpdated: "ChildNodeCountUpdated",
    UndoRedoRequested: "UndoRedoRequested",
    UndoRedoCompleted: "UndoRedoCompleted",
    InspectNodeRequested: "InspectNodeRequested"
}

WebInspector.DOMAgent.prototype = {
    /**
     * @param {function(!WebInspector.DOMDocument)=} callback
     */
    requestDocument: function(callback)
    {
        if (this._document) {
            if (callback)
                callback(this._document);
            return;
        }

        if (this._pendingDocumentRequestCallbacks) {
            this._pendingDocumentRequestCallbacks.push(callback);
            return;
        }

        this._pendingDocumentRequestCallbacks = [callback];

        /**
         * @this {WebInspector.DOMAgent}
         * @param {?Protocol.Error} error
         * @param {!DOMAgent.Node} root
         */
        function onDocumentAvailable(error, root)
        {
            if (!error)
                this._setDocument(root);

            for (var i = 0; i < this._pendingDocumentRequestCallbacks.length; ++i) {
                var callback = this._pendingDocumentRequestCallbacks[i];
                if (callback)
                    callback(this._document);
            }
            delete this._pendingDocumentRequestCallbacks;
        }

        DOMAgent.getDocument(onDocumentAvailable.bind(this));
    },

    /**
     * @return {?WebInspector.DOMDocument}
     */
    existingDocument: function()
    {
        return this._document;
    },

    /**
     * @param {!RuntimeAgent.RemoteObjectId} objectId
     * @param {function(?DOMAgent.NodeId)=} callback
     */
    pushNodeToFrontend: function(objectId, callback)
    {
        this._dispatchWhenDocumentAvailable(DOMAgent.requestNode.bind(DOMAgent, objectId), callback);
    },

    /**
     * @param {string} path
     * @param {function(?number)=} callback
     */
    pushNodeByPathToFrontend: function(path, callback)
    {
        this._dispatchWhenDocumentAvailable(DOMAgent.pushNodeByPathToFrontend.bind(DOMAgent, path), callback);
    },

    /**
     * @param {number} backendNodeId
     * @param {function(?number)=} callback
     */
    pushNodeByBackendIdToFrontend: function(backendNodeId, callback)
    {
        this._dispatchWhenDocumentAvailable(DOMAgent.pushNodeByBackendIdToFrontend.bind(DOMAgent, backendNodeId), callback);
    },

    /**
     * @param {function(!T)=} callback
     * @return {function(?Protocol.Error, !T=)|undefined}
     * @template T
     */
    _wrapClientCallback: function(callback)
    {
        if (!callback)
            return;
        /**
         * @param {?Protocol.Error} error
         * @param {!T=} result
         * @template T
         */
        return function(error, result)
        {
            // Caller is responsible for handling the actual error.
            callback(error ? null : result);
        }
    },

    /**
     * @param {function(function(?Protocol.Error, !T=)=)} func
     * @param {function(!T)=} callback
     * @template T
     */
    _dispatchWhenDocumentAvailable: function(func, callback)
    {
        var callbackWrapper = this._wrapClientCallback(callback);

        /**
         * @this {WebInspector.DOMAgent}
         */
        function onDocumentAvailable()
        {
            if (this._document)
                func(callbackWrapper);
            else {
                if (callbackWrapper)
                    callbackWrapper("No document");
            }
        }
        this.requestDocument(onDocumentAvailable.bind(this));
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} name
     * @param {string} value
     */
    _attributeModified: function(nodeId, name, value)
    {
        var node = this._idToDOMNode[nodeId];
        if (!node)
            return;

        node._setAttribute(name, value);
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.AttrModified, { node: node, name: name });
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} name
     */
    _attributeRemoved: function(nodeId, name)
    {
        var node = this._idToDOMNode[nodeId];
        if (!node)
            return;
        node._removeAttribute(name);
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.AttrRemoved, { node: node, name: name });
    },

    /**
     * @param {!Array.<!DOMAgent.NodeId>} nodeIds
     */
    _inlineStyleInvalidated: function(nodeIds)
    {
        for (var i = 0; i < nodeIds.length; ++i)
            this._attributeLoadNodeIds[nodeIds[i]] = true;
        if ("_loadNodeAttributesTimeout" in this)
            return;
        this._loadNodeAttributesTimeout = setTimeout(this._loadNodeAttributes.bind(this), 20);
    },

    _loadNodeAttributes: function()
    {
        /**
         * @this {WebInspector.DOMAgent}
         * @param {!DOMAgent.NodeId} nodeId
         * @param {?Protocol.Error} error
         * @param {!Array.<string>} attributes
         */
        function callback(nodeId, error, attributes)
        {
            if (error) {
                // We are calling _loadNodeAttributes asynchronously, it is ok if node is not found.
                return;
            }
            var node = this._idToDOMNode[nodeId];
            if (node) {
                if (node._setAttributesPayload(attributes))
                    this.dispatchEventToListeners(WebInspector.DOMAgent.Events.AttrModified, { node: node, name: "style" });
            }
        }

        delete this._loadNodeAttributesTimeout;

        for (var nodeId in this._attributeLoadNodeIds) {
            var nodeIdAsNumber = parseInt(nodeId, 10);
            DOMAgent.getAttributes(nodeIdAsNumber, callback.bind(this, nodeIdAsNumber));
        }
        this._attributeLoadNodeIds = {};
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} newValue
     */
    _characterDataModified: function(nodeId, newValue)
    {
        var node = this._idToDOMNode[nodeId];
        node._nodeValue = newValue;
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.CharacterDataModified, node);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @return {?WebInspector.DOMNode}
     */
    nodeForId: function(nodeId)
    {
        return this._idToDOMNode[nodeId] || null;
    },

    _documentUpdated: function()
    {
        this._setDocument(null);
    },

    /**
     * @param {?DOMAgent.Node} payload
     */
    _setDocument: function(payload)
    {
        this._idToDOMNode = {};
        if (payload && "nodeId" in payload)
            this._document = new WebInspector.DOMDocument(this, payload);
        else
            this._document = null;
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.DocumentUpdated, this._document);
    },

    /**
     * @param {!DOMAgent.Node} payload
     */
    _setDetachedRoot: function(payload)
    {
        if (payload.nodeName === "#document")
            new WebInspector.DOMDocument(this, payload);
        else
            new WebInspector.DOMNode(this, null, false, payload);
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!Array.<!DOMAgent.Node>} payloads
     */
    _setChildNodes: function(parentId, payloads)
    {
        if (!parentId && payloads.length) {
            this._setDetachedRoot(payloads[0]);
            return;
        }

        var parent = this._idToDOMNode[parentId];
        parent._setChildrenPayload(payloads);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {number} newValue
     */
    _childNodeCountUpdated: function(nodeId, newValue)
    {
        var node = this._idToDOMNode[nodeId];
        node._childNodeCount = newValue;
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.ChildNodeCountUpdated, node);
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!DOMAgent.NodeId} prevId
     * @param {!DOMAgent.Node} payload
     */
    _childNodeInserted: function(parentId, prevId, payload)
    {
        var parent = this._idToDOMNode[parentId];
        var prev = this._idToDOMNode[prevId];
        var node = parent._insertChild(prev, payload);
        this._idToDOMNode[node.id] = node;
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.NodeInserted, node);
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!DOMAgent.NodeId} nodeId
     */
    _childNodeRemoved: function(parentId, nodeId)
    {
        var parent = this._idToDOMNode[parentId];
        var node = this._idToDOMNode[nodeId];
        parent._removeChild(node);
        this._unbind(node);
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.NodeRemoved, {node: node, parent: parent});
    },

    /**
     * @param {!DOMAgent.NodeId} hostId
     * @param {!DOMAgent.Node} root
     */
    _shadowRootPushed: function(hostId, root)
    {
        var host = this._idToDOMNode[hostId];
        if (!host)
            return;
        var node = new WebInspector.DOMNode(this, host.ownerDocument, true, root);
        node.parentNode = host;
        this._idToDOMNode[node.id] = node;
        host._shadowRoots.push(node);
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.NodeInserted, node);
    },

    /**
     * @param {!DOMAgent.NodeId} hostId
     * @param {!DOMAgent.NodeId} rootId
     */
    _shadowRootPopped: function(hostId, rootId)
    {
        var host = this._idToDOMNode[hostId];
        if (!host)
            return;
        var root = this._idToDOMNode[rootId];
        if (!root)
            return;
        host._removeChild(root);
        this._unbind(root);
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.NodeRemoved, {node: root, parent: host});
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!DOMAgent.Node} pseudoElement
     */
    _pseudoElementAdded: function(parentId, pseudoElement)
    {
        var parent = this._idToDOMNode[parentId];
        if (!parent)
            return;
        var node = new WebInspector.DOMNode(this, parent.ownerDocument, false, pseudoElement);
        node.parentNode = parent;
        this._idToDOMNode[node.id] = node;
        console.assert(!parent._pseudoElements[node.pseudoType()]);
        parent._pseudoElements[node.pseudoType()] = node;
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.NodeInserted, node);
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!DOMAgent.NodeId} pseudoElementId
     */
    _pseudoElementRemoved: function(parentId, pseudoElementId)
    {
        var parent = this._idToDOMNode[parentId];
        if (!parent)
            return;
        var pseudoElement = this._idToDOMNode[pseudoElementId];
        if (!pseudoElement)
            return;
        parent._removeChild(pseudoElement);
        this._unbind(pseudoElement);
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.NodeRemoved, {node: pseudoElement, parent: parent});
    },

    /**
     * @param {!WebInspector.DOMNode} node
     */
    _unbind: function(node)
    {
        delete this._idToDOMNode[node.id];
        for (var i = 0; node._children && i < node._children.length; ++i)
            this._unbind(node._children[i]);
        for (var i = 0; i < node._shadowRoots.length; ++i)
            this._unbind(node._shadowRoots[i]);
        var pseudoElements = node.pseudoElements();
        for (var id in pseudoElements)
            this._unbind(pseudoElements[id]);
        if (node._templateContent)
            this._unbind(node._templateContent);
    },

    /**
     * @param {number} nodeId
     */
    inspectElement: function(nodeId)
    {
        var node = this._idToDOMNode[nodeId];
        if (node)
            this.dispatchEventToListeners(WebInspector.DOMAgent.Events.InspectNodeRequested, nodeId);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     */
    _inspectNodeRequested: function(nodeId)
    {
        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.InspectNodeRequested, nodeId);
    },

    /**
     * @param {string} query
     * @param {function(number)} searchCallback
     */
    performSearch: function(query, searchCallback)
    {
        this.cancelSearch();

        /**
         * @param {?Protocol.Error} error
         * @param {string} searchId
         * @param {number} resultsCount
         * @this {WebInspector.DOMAgent}
         */
        function callback(error, searchId, resultsCount)
        {
            this._searchId = searchId;
            searchCallback(resultsCount);
        }
        DOMAgent.performSearch(query, callback.bind(this));
    },

    /**
     * @param {number} index
     * @param {?function(?WebInspector.DOMNode)} callback
     */
    searchResult: function(index, callback)
    {
        if (this._searchId)
            DOMAgent.getSearchResults(this._searchId, index, index + 1, searchResultsCallback.bind(this));
        else
            callback(null);

        /**
         * @param {?Protocol.Error} error
         * @param {!Array.<number>} nodeIds
         * @this {WebInspector.DOMAgent}
         */
        function searchResultsCallback(error, nodeIds)
        {
            if (error) {
                console.error(error);
                callback(null);
                return;
            }
            if (nodeIds.length != 1)
                return;

            callback(this.nodeForId(nodeIds[0]));
        }
    },

    cancelSearch: function()
    {
        if (this._searchId) {
            DOMAgent.discardSearchResults(this._searchId);
            delete this._searchId;
        }
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} selectors
     * @param {function(?DOMAgent.NodeId)=} callback
     */
    querySelector: function(nodeId, selectors, callback)
    {
        DOMAgent.querySelector(nodeId, selectors, this._wrapClientCallback(callback));
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} selectors
     * @param {function(!Array.<!DOMAgent.NodeId>=)=} callback
     */
    querySelectorAll: function(nodeId, selectors, callback)
    {
        DOMAgent.querySelectorAll(nodeId, selectors, this._wrapClientCallback(callback));
    },

    /**
     * @param {!DOMAgent.NodeId=} nodeId
     * @param {string=} mode
     * @param {!RuntimeAgent.RemoteObjectId=} objectId
     */
    highlightDOMNode: function(nodeId, mode, objectId)
    {
        if (this._hideDOMNodeHighlightTimeout) {
            clearTimeout(this._hideDOMNodeHighlightTimeout);
            delete this._hideDOMNodeHighlightTimeout;
        }
        this._highlighter.highlightDOMNode(nodeId || 0, this._buildHighlightConfig(mode), objectId);
    },

    hideDOMNodeHighlight: function()
    {
        this.highlightDOMNode(0);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     */
    highlightDOMNodeForTwoSeconds: function(nodeId)
    {
        this.highlightDOMNode(nodeId);
        this._hideDOMNodeHighlightTimeout = setTimeout(this.hideDOMNodeHighlight.bind(this), 2000);
    },

    /**
     * @param {boolean} enabled
     * @param {boolean} inspectShadowDOM
     * @param {function(?Protocol.Error)=} callback
     */
    setInspectModeEnabled: function(enabled, inspectShadowDOM, callback)
    {
        /**
         * @this {WebInspector.DOMAgent}
         */
        function onDocumentAvailable()
        {
            this._highlighter.setInspectModeEnabled(enabled, inspectShadowDOM, this._buildHighlightConfig(), callback);
        }
        this.requestDocument(onDocumentAvailable.bind(this));
    },

    /**
     * @param {string=} mode
     * @return {!DOMAgent.HighlightConfig}
     */
    _buildHighlightConfig: function(mode)
    {
        mode = mode || "all";
        var highlightConfig = { showInfo: mode === "all", showRulers: WebInspector.settings.showMetricsRulers.get() };
        if (mode === "all" || mode === "content")
            highlightConfig.contentColor = WebInspector.Color.PageHighlight.Content.toProtocolRGBA();

        if (mode === "all" || mode === "padding")
            highlightConfig.paddingColor = WebInspector.Color.PageHighlight.Padding.toProtocolRGBA();

        if (mode === "all" || mode === "border")
            highlightConfig.borderColor = WebInspector.Color.PageHighlight.Border.toProtocolRGBA();

        if (mode === "all" || mode === "margin")
            highlightConfig.marginColor = WebInspector.Color.PageHighlight.Margin.toProtocolRGBA();

        if (mode === "all")
            highlightConfig.eventTargetColor = WebInspector.Color.PageHighlight.EventTarget.toProtocolRGBA();

        return highlightConfig;
    },

    /**
     * @param {!WebInspector.DOMNode} node
     * @param {function(?Protocol.Error, !A=, !B=)=} callback
     * @return {function(?Protocol.Error, !A=, !B=)}
     * @template A,B
     */
    _markRevision: function(node, callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @this {WebInspector.DOMAgent}
         */
        function wrapperFunction(error)
        {
            if (!error)
                this.markUndoableState();

            if (callback)
                callback.apply(this, arguments);
        }
        return wrapperFunction.bind(this);
    },

    /**
     * @param {boolean} emulationEnabled
     */
    emulateTouchEventObjects: function(emulationEnabled)
    {
        const injectedFunction = function() {
            const touchEvents = ["ontouchstart", "ontouchend", "ontouchmove", "ontouchcancel"];
            var recepients = [window.__proto__, document.__proto__];
            for (var i = 0; i < touchEvents.length; ++i) {
                for (var j = 0; j < recepients.length; ++j) {
                    if (!(touchEvents[i] in recepients[j]))
                        Object.defineProperty(recepients[j], touchEvents[i], { value: null, writable: true, configurable: true, enumerable: true });
                }
            }
        }

        if (emulationEnabled && !this._addTouchEventsScriptInjecting) {
            this._addTouchEventsScriptInjecting = true;
            PageAgent.addScriptToEvaluateOnLoad("(" + injectedFunction.toString() + ")()", scriptAddedCallback.bind(this));
        } else {
            if (typeof this._addTouchEventsScriptId !== "undefined") {
                PageAgent.removeScriptToEvaluateOnLoad(this._addTouchEventsScriptId);
                delete this._addTouchEventsScriptId;
            }
        }

        /**
         * @param {?Protocol.Error} error
         * @param {string} scriptId
         * @this {WebInspector.DOMAgent}
         */
        function scriptAddedCallback(error, scriptId)
        {
            delete this._addTouchEventsScriptInjecting;
            if (error)
                return;
            this._addTouchEventsScriptId = scriptId;
        }

        PageAgent.setTouchEmulationEnabled(emulationEnabled);
    },

    markUndoableState: function()
    {
        DOMAgent.markUndoableState();
    },

    /**
     * @param {function(?Protocol.Error)=} callback
     */
    undo: function(callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @this {WebInspector.DOMAgent}
         */
        function mycallback(error)
        {
            this.dispatchEventToListeners(WebInspector.DOMAgent.Events.UndoRedoCompleted);
            callback(error);
        }

        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.UndoRedoRequested);
        DOMAgent.undo(callback);
    },

    /**
     * @param {function(?Protocol.Error)=} callback
     */
    redo: function(callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @this {WebInspector.DOMAgent}
         */
        function mycallback(error)
        {
            this.dispatchEventToListeners(WebInspector.DOMAgent.Events.UndoRedoCompleted);
            callback(error);
        }

        this.dispatchEventToListeners(WebInspector.DOMAgent.Events.UndoRedoRequested);
        DOMAgent.redo(callback);
    },

    /**
     * @param {?WebInspector.DOMNodeHighlighter} highlighter
     */
    setHighlighter: function(highlighter)
    {
        this._highlighter = highlighter || this._defaultHighlighter;
    },

    __proto__: WebInspector.Object.prototype
}

/**
 * @constructor
 * @implements {DOMAgent.Dispatcher}
 * @param {!WebInspector.DOMAgent} domAgent
 */
WebInspector.DOMDispatcher = function(domAgent)
{
    this._domAgent = domAgent;
}

WebInspector.DOMDispatcher.prototype = {
    documentUpdated: function()
    {
        this._domAgent._documentUpdated();
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     */
    inspectNodeRequested: function(nodeId)
    {
        this._domAgent._inspectNodeRequested(nodeId);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} name
     * @param {string} value
     */
    attributeModified: function(nodeId, name, value)
    {
        this._domAgent._attributeModified(nodeId, name, value);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} name
     */
    attributeRemoved: function(nodeId, name)
    {
        this._domAgent._attributeRemoved(nodeId, name);
    },

    /**
     * @param {!Array.<!DOMAgent.NodeId>} nodeIds
     */
    inlineStyleInvalidated: function(nodeIds)
    {
        this._domAgent._inlineStyleInvalidated(nodeIds);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {string} characterData
     */
    characterDataModified: function(nodeId, characterData)
    {
        this._domAgent._characterDataModified(nodeId, characterData);
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!Array.<!DOMAgent.Node>} payloads
     */
    setChildNodes: function(parentId, payloads)
    {
        this._domAgent._setChildNodes(parentId, payloads);
    },

    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {number} childNodeCount
     */
    childNodeCountUpdated: function(nodeId, childNodeCount)
    {
        this._domAgent._childNodeCountUpdated(nodeId, childNodeCount);
    },

    /**
     * @param {!DOMAgent.NodeId} parentNodeId
     * @param {!DOMAgent.NodeId} previousNodeId
     * @param {!DOMAgent.Node} payload
     */
    childNodeInserted: function(parentNodeId, previousNodeId, payload)
    {
        this._domAgent._childNodeInserted(parentNodeId, previousNodeId, payload);
    },

    /**
     * @param {!DOMAgent.NodeId} parentNodeId
     * @param {!DOMAgent.NodeId} nodeId
     */
    childNodeRemoved: function(parentNodeId, nodeId)
    {
        this._domAgent._childNodeRemoved(parentNodeId, nodeId);
    },

    /**
     * @param {!DOMAgent.NodeId} hostId
     * @param {!DOMAgent.Node} root
     */
    shadowRootPushed: function(hostId, root)
    {
        this._domAgent._shadowRootPushed(hostId, root);
    },

    /**
     * @param {!DOMAgent.NodeId} hostId
     * @param {!DOMAgent.NodeId} rootId
     */
    shadowRootPopped: function(hostId, rootId)
    {
        this._domAgent._shadowRootPopped(hostId, rootId);
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!DOMAgent.Node} pseudoElement
     */
    pseudoElementAdded: function(parentId, pseudoElement)
    {
        this._domAgent._pseudoElementAdded(parentId, pseudoElement);
    },

    /**
     * @param {!DOMAgent.NodeId} parentId
     * @param {!DOMAgent.NodeId} pseudoElementId
     */
    pseudoElementRemoved: function(parentId, pseudoElementId)
    {
        this._domAgent._pseudoElementRemoved(parentId, pseudoElementId);
    }
}

/**
 * @interface
 */
WebInspector.DOMNodeHighlighter = function() {
}

WebInspector.DOMNodeHighlighter.prototype = {
    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {!DOMAgent.HighlightConfig} config
     * @param {!RuntimeAgent.RemoteObjectId=} objectId
     */
    highlightDOMNode: function(nodeId, config, objectId) {},

    /**
     * @param {boolean} enabled
     * @param {boolean} inspectShadowDOM
     * @param {!DOMAgent.HighlightConfig} config
     * @param {function(?Protocol.Error)=} callback
     */
    setInspectModeEnabled: function(enabled, inspectShadowDOM, config, callback) {}
}

/**
 * @constructor
 * @implements {WebInspector.DOMNodeHighlighter}
 */
WebInspector.DefaultDOMNodeHighlighter = function() {
}

WebInspector.DefaultDOMNodeHighlighter.prototype = {
    /**
     * @param {!DOMAgent.NodeId} nodeId
     * @param {!DOMAgent.HighlightConfig} config
     * @param {!RuntimeAgent.RemoteObjectId=} objectId
     */
    highlightDOMNode: function(nodeId, config, objectId)
    {
        if (objectId || nodeId)
            DOMAgent.highlightNode(config, objectId ? undefined : nodeId, objectId);
        else
            DOMAgent.hideHighlight();
    },

    /**
     * @param {boolean} enabled
     * @param {boolean} inspectShadowDOM
     * @param {!DOMAgent.HighlightConfig} config
     * @param {function(?Protocol.Error)=} callback
     */
    setInspectModeEnabled: function(enabled, inspectShadowDOM, config, callback)
    {
        DOMAgent.setInspectModeEnabled(enabled, inspectShadowDOM, config, callback);
    }
}

/**
 * @type {!WebInspector.DOMAgent}
 */
WebInspector.domAgent;





/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008 Matt Lilek <webkit@mattlilek.com>
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

WebInspector.DOMPresentationUtils = {}

WebInspector.DOMPresentationUtils.decorateNodeLabel = function(node, parentElement)
{
    var title = node.nodeNameInCorrectCase();

    var nameElement = document.createElement("span");
    nameElement.textContent = title;
    parentElement.appendChild(nameElement);

    var idAttribute = node.getAttribute("id");
    if (idAttribute) {
        var idElement = document.createElement("span");
        parentElement.appendChild(idElement);

        var part = "#" + idAttribute;
        title += part;
        idElement.appendChild(document.createTextNode(part));

        // Mark the name as extra, since the ID is more important.
        nameElement.className = "extra";
    }

    var classAttribute = node.getAttribute("class");
    if (classAttribute) {
        var classes = classAttribute.split(/\s+/);
        var foundClasses = {};

        if (classes.length) {
            var classesElement = document.createElement("span");
            classesElement.className = "extra";
            parentElement.appendChild(classesElement);

            for (var i = 0; i < classes.length; ++i) {
                var className = classes[i];
                if (className && !(className in foundClasses)) {
                    var part = "." + className;
                    title += part;
                    classesElement.appendChild(document.createTextNode(part));
                    foundClasses[className] = true;
                }
            }
        }
    }
    parentElement.title = title;
}

/**
 * @param {!Element} container
 * @param {string} nodeTitle
 */
WebInspector.DOMPresentationUtils.createSpansForNodeTitle = function(container, nodeTitle)
{
    var match = nodeTitle.match(/([^#.]+)(#[^.]+)?(\..*)?/);
    container.createChild("span", "webkit-html-tag-name").textContent = match[1];
    if (match[2])
        container.createChild("span", "webkit-html-attribute-value").textContent = match[2];
    if (match[3])
        container.createChild("span", "webkit-html-attribute-name").textContent = match[3];
}

WebInspector.DOMPresentationUtils.linkifyNodeReference = function(node)
{
    var link = document.createElement("span");
    link.className = "node-link";
    WebInspector.DOMPresentationUtils.decorateNodeLabel(node, link);

    link.addEventListener("click", WebInspector.domAgent.inspectElement.bind(WebInspector.domAgent, node.id), false);
    link.addEventListener("mouseover", WebInspector.domAgent.highlightDOMNode.bind(WebInspector.domAgent, node.id, "", undefined), false);
    link.addEventListener("mouseout", WebInspector.domAgent.hideDOMNodeHighlight.bind(WebInspector.domAgent), false);

    return link;
}

WebInspector.DOMPresentationUtils.linkifyNodeById = function(nodeId)
{
    var node = WebInspector.domAgent.nodeForId(nodeId);
    if (!node)
        return document.createTextNode(WebInspector.UIString("<node>"));
    return WebInspector.DOMPresentationUtils.linkifyNodeReference(node);
}

/**
 * @param {string} imageURL
 * @param {boolean} showDimensions
 * @param {function(!Element=)} userCallback
 * @param {!Object=} precomputedDimensions
 */
WebInspector.DOMPresentationUtils.buildImagePreviewContents = function(imageURL, showDimensions, userCallback, precomputedDimensions)
{
    var resource = WebInspector.resourceTreeModel.resourceForURL(imageURL);
    if (!resource) {
        userCallback();
        return;
    }

    var imageElement = document.createElement("img");
    imageElement.addEventListener("load", buildContent, false);
    imageElement.addEventListener("error", errorCallback, false);
    resource.populateImageSource(imageElement);

    function errorCallback()
    {
        // Drop the event parameter when invoking userCallback.
        userCallback();
    }

    function buildContent()
    {
        var container = document.createElement("table");
        container.className = "image-preview-container";
        var naturalWidth = precomputedDimensions ? precomputedDimensions.naturalWidth : imageElement.naturalWidth;
        var naturalHeight = precomputedDimensions ? precomputedDimensions.naturalHeight : imageElement.naturalHeight;
        var offsetWidth = precomputedDimensions ? precomputedDimensions.offsetWidth : naturalWidth;
        var offsetHeight = precomputedDimensions ? precomputedDimensions.offsetHeight : naturalHeight;
        var description;
        if (showDimensions) {
            if (offsetHeight === naturalHeight && offsetWidth === naturalWidth)
                description = WebInspector.UIString("%d \xd7 %d pixels", offsetWidth, offsetHeight);
            else
                description = WebInspector.UIString("%d \xd7 %d pixels (Natural: %d \xd7 %d pixels)", offsetWidth, offsetHeight, naturalWidth, naturalHeight);
        }

        container.createChild("tr").createChild("td", "image-container").appendChild(imageElement);
        if (description)
            container.createChild("tr").createChild("td").createChild("span", "description").textContent = description;
        userCallback(container);
    }
}

/**
 * @param {!WebInspector.DOMNode} node
 * @param {boolean=} justSelector
 * @return {string}
 */
WebInspector.DOMPresentationUtils.appropriateSelectorFor = function(node, justSelector)
{
    var lowerCaseName = node.localName() || node.nodeName().toLowerCase();
    if (node.nodeType() !== Node.ELEMENT_NODE)
        return lowerCaseName;
    if (lowerCaseName === "input" && node.getAttribute("type") && !node.getAttribute("id") && !node.getAttribute("class"))
        return lowerCaseName + "[type=\"" + node.getAttribute("type") + "\"]";

    return WebInspector.DOMPresentationUtils.cssPath(node, justSelector);
}

/**
 * @param {!WebInspector.DOMNode} node
 * @param {boolean=} optimized
 * @return {string}
 */
WebInspector.DOMPresentationUtils.cssPath = function(node, optimized)
{
    if (node.nodeType() !== Node.ELEMENT_NODE)
        return "";

    var steps = [];
    var contextNode = node;
    while (contextNode) {
        var step = WebInspector.DOMPresentationUtils._cssPathValue(contextNode, optimized);
        if (!step)
            break; // Error - bail out early.
        steps.push(step);
        if (step.optimized)
            break;
        contextNode = contextNode.parentNode;
    }

    steps.reverse();
    return steps.join(" > ");
}

/**
 * @param {!WebInspector.DOMNode} node
 * @param {boolean=} optimized
 * @return {?WebInspector.DOMNodePathStep}
 */
WebInspector.DOMPresentationUtils._cssPathValue = function(node, optimized)
{
    if (node.nodeType() !== Node.ELEMENT_NODE)
        return null;

    var id = node.getAttribute("id");
    if (optimized) {
        if (id)
            return new WebInspector.DOMNodePathStep(idSelector(id), true);
        var nodeNameLower = node.nodeName().toLowerCase();
        if (nodeNameLower === "body" || nodeNameLower === "head" || nodeNameLower === "html")
            return new WebInspector.DOMNodePathStep(node.nodeNameInCorrectCase(), true);
    }
    var nodeName = node.nodeNameInCorrectCase();

    if (id)
        return new WebInspector.DOMNodePathStep(nodeName + idSelector(id), true);
    var parent = node.parentNode;
    if (!parent || parent.nodeType() === Node.DOCUMENT_NODE)
        return new WebInspector.DOMNodePathStep(nodeName, true);

    /**
     * @param {!WebInspector.DOMNode} node
     * @return {!Array.<string>}
     */
    function prefixedElementClassNames(node)
    {
        var classAttribute = node.getAttribute("class");
        if (!classAttribute)
            return [];

        return classAttribute.split(/\s+/g).filter(Boolean).map(function(name) {
            // The prefix is required to store "__proto__" in a object-based map.
            return "$" + name;
        });
    }

    /**
     * @param {string} id
     * @return {string}
     */
    function idSelector(id)
    {
        return "#" + escapeIdentifierIfNeeded(id);
    }

    /**
     * @param {string} ident
     * @return {string}
     */
    function escapeIdentifierIfNeeded(ident)
    {
        if (isCSSIdentifier(ident))
            return ident;
        var shouldEscapeFirst = /^(?:[0-9]|-[0-9-]?)/.test(ident);
        var lastIndex = ident.length - 1;
        return ident.replace(/./g, function(c, i) {
            return ((shouldEscapeFirst && i === 0) || !isCSSIdentChar(c)) ? escapeAsciiChar(c, i === lastIndex) : c;
        });
    }

    /**
     * @param {string} c
     * @param {boolean} isLast
     * @return {string}
     */
    function escapeAsciiChar(c, isLast)
    {
        return "\\" + toHexByte(c) + (isLast ? "" : " ");
    }

    /**
     * @param {string} c
     */
    function toHexByte(c)
    {
        var hexByte = c.charCodeAt(0).toString(16);
        if (hexByte.length === 1)
          hexByte = "0" + hexByte;
        return hexByte;
    }

    /**
     * @param {string} c
     * @return {boolean}
     */
    function isCSSIdentChar(c)
    {
        if (/[a-zA-Z0-9_-]/.test(c))
            return true;
        return c.charCodeAt(0) >= 0xA0;
    }

    /**
     * @param {string} value
     * @return {boolean}
     */
    function isCSSIdentifier(value)
    {
        return /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value);
    }

    var prefixedOwnClassNamesArray = prefixedElementClassNames(node);
    var needsClassNames = false;
    var needsNthChild = false;
    var ownIndex = -1;
    var elementIndex = -1;
    var siblings = parent.children();
    for (var i = 0; (ownIndex === -1 || !needsNthChild) && i < siblings.length; ++i) {
        var sibling = siblings[i];
        if (sibling.nodeType() !== Node.ELEMENT_NODE)
            continue;
        elementIndex += 1;
        if (sibling === node) {
            ownIndex = elementIndex;
            continue;
        }
        if (needsNthChild)
            continue;
        if (sibling.nodeNameInCorrectCase() !== nodeName)
            continue;

        needsClassNames = true;
        var ownClassNames = prefixedOwnClassNamesArray.keySet();
        var ownClassNameCount = 0;
        for (var name in ownClassNames)
            ++ownClassNameCount;
        if (ownClassNameCount === 0) {
            needsNthChild = true;
            continue;
        }
        var siblingClassNamesArray = prefixedElementClassNames(sibling);
        for (var j = 0; j < siblingClassNamesArray.length; ++j) {
            var siblingClass = siblingClassNamesArray[j];
            if (!ownClassNames.hasOwnProperty(siblingClass))
                continue;
            delete ownClassNames[siblingClass];
            if (!--ownClassNameCount) {
                needsNthChild = true;
                break;
            }
        }
    }

    var result = nodeName;
    if (needsNthChild) {
        result += ":nth-child(" + (ownIndex + 1) + ")";
    } else if (needsClassNames) {
        for (var prefixedName in prefixedOwnClassNamesArray.keySet())
            result += "." + escapeIdentifierIfNeeded(prefixedName.substr(1));
    }

    return new WebInspector.DOMNodePathStep(result, false);
}

/**
 * @param {!WebInspector.DOMNode} node
 * @param {boolean=} optimized
 * @return {string}
 */
WebInspector.DOMPresentationUtils.xPath = function(node, optimized)
{
    if (node.nodeType() === Node.DOCUMENT_NODE)
        return "/";

    var steps = [];
    var contextNode = node;
    while (contextNode) {
        var step = WebInspector.DOMPresentationUtils._xPathValue(contextNode, optimized);
        if (!step)
            break; // Error - bail out early.
        steps.push(step);
        if (step.optimized)
            break;
        contextNode = contextNode.parentNode;
    }

    steps.reverse();
    return (steps.length && steps[0].optimized ? "" : "/") + steps.join("/");
}

/**
 * @param {!WebInspector.DOMNode} node
 * @param {boolean=} optimized
 * @return {?WebInspector.DOMNodePathStep}
 */
WebInspector.DOMPresentationUtils._xPathValue = function(node, optimized)
{
    var ownValue;
    var ownIndex = WebInspector.DOMPresentationUtils._xPathIndex(node);
    if (ownIndex === -1)
        return null; // Error.

    switch (node.nodeType()) {
    case Node.ELEMENT_NODE:
        if (optimized && node.getAttribute("id"))
            return new WebInspector.DOMNodePathStep("//*[@id=\"" + node.getAttribute("id") + "\"]", true);
        ownValue = node.localName();
        break;
    case Node.ATTRIBUTE_NODE:
        ownValue = "@" + node.nodeName();
        break;
    case Node.TEXT_NODE:
    case Node.CDATA_SECTION_NODE:
        ownValue = "text()";
        break;
    case Node.PROCESSING_INSTRUCTION_NODE:
        ownValue = "processing-instruction()";
        break;
    case Node.COMMENT_NODE:
        ownValue = "comment()";
        break;
    case Node.DOCUMENT_NODE:
        ownValue = "";
        break;
    default:
        ownValue = "";
        break;
    }

    if (ownIndex > 0)
        ownValue += "[" + ownIndex + "]";

    return new WebInspector.DOMNodePathStep(ownValue, node.nodeType() === Node.DOCUMENT_NODE);
},

/**
 * @param {!WebInspector.DOMNode} node
 * @return {number}
 */
WebInspector.DOMPresentationUtils._xPathIndex = function(node)
{
    // Returns -1 in case of error, 0 if no siblings matching the same expression, <XPath index among the same expression-matching sibling nodes> otherwise.
    function areNodesSimilar(left, right)
    {
        if (left === right)
            return true;

        if (left.nodeType() === Node.ELEMENT_NODE && right.nodeType() === Node.ELEMENT_NODE)
            return left.localName() === right.localName();

        if (left.nodeType() === right.nodeType())
            return true;

        // XPath treats CDATA as text nodes.
        var leftType = left.nodeType() === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType();
        var rightType = right.nodeType() === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : right.nodeType();
        return leftType === rightType;
    }

    var siblings = node.parentNode ? node.parentNode.children() : null;
    if (!siblings)
        return 0; // Root node - no siblings.
    var hasSameNamedElements;
    for (var i = 0; i < siblings.length; ++i) {
        if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
            hasSameNamedElements = true;
            break;
        }
    }
    if (!hasSameNamedElements)
        return 0;
    var ownIndex = 1; // XPath indices start with 1.
    for (var i = 0; i < siblings.length; ++i) {
        if (areNodesSimilar(node, siblings[i])) {
            if (siblings[i] === node)
                return ownIndex;
            ++ownIndex;
        }
    }
    return -1; // An error occurred: |node| not found in parent's children.
}

/**
 * @constructor
 * @param {string} value
 * @param {boolean} optimized
 */
WebInspector.DOMNodePathStep = function(value, optimized)
{
    this.value = value;
    this.optimized = optimized || false;
}

WebInspector.DOMNodePathStep.prototype = {
    /**
     * @return {string}
     */
    toString: function()
    {
        return this.value;
    }
}



/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Google Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.Section}
 * @param {string|!Element} title
 * @param {string=} subtitle
 */
WebInspector.PropertiesSection = function(title, subtitle)
{
    WebInspector.Section.call(this, title, subtitle);

    this.headerElement.classList.add("monospace");
    this.propertiesElement = document.createElement("ol");
    this.propertiesElement.className = "properties properties-tree monospace";
    this.propertiesTreeOutline = new TreeOutline(this.propertiesElement, true);
    this.propertiesTreeOutline.setFocusable(false);
    this.propertiesTreeOutline.section = this;

    this.element.appendChild(this.propertiesElement);
}

WebInspector.PropertiesSection.prototype = {
    __proto__: WebInspector.Section.prototype
}


/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.PropertiesSection}
 * @param {!WebInspector.RemoteObject} object
 * @param {?string|!Element=} title
 * @param {string=} subtitle
 * @param {?string=} emptyPlaceholder
 * @param {boolean=} ignoreHasOwnProperty
 * @param {!Array.<!WebInspector.RemoteObjectProperty>=} extraProperties
 * @param {function(new:TreeElement, !WebInspector.RemoteObjectProperty)=} treeElementConstructor
 */
WebInspector.ObjectPropertiesSection = function(object, title, subtitle, emptyPlaceholder, ignoreHasOwnProperty, extraProperties, treeElementConstructor)
{
    this.emptyPlaceholder = (emptyPlaceholder || WebInspector.UIString("No Properties"));
    this.object = object;
    this.ignoreHasOwnProperty = ignoreHasOwnProperty;
    this.extraProperties = extraProperties;
    this.treeElementConstructor = treeElementConstructor || WebInspector.ObjectPropertyTreeElement;
    this.editable = true;
    this.skipProto = false;

    WebInspector.PropertiesSection.call(this, title || "", subtitle);
}

WebInspector.ObjectPropertiesSection._arrayLoadThreshold = 100;

WebInspector.ObjectPropertiesSection.prototype = {
    enableContextMenu: function()
    {
        this.element.addEventListener("contextmenu", this._contextMenuEventFired.bind(this), false);
    },

    _contextMenuEventFired: function(event)
    {
        var contextMenu = new WebInspector.ContextMenu(event);
        contextMenu.appendApplicableItems(this.object);
        contextMenu.show();
    },

    onpopulate: function()
    {
        this.update();
    },

    update: function()
    {
        if (this.object.arrayLength() > WebInspector.ObjectPropertiesSection._arrayLoadThreshold) {
            this.propertiesTreeOutline.removeChildren();
            WebInspector.ArrayGroupingTreeElement._populateArray(this.propertiesTreeOutline, this.object, 0, this.object.arrayLength() - 1);
            return;
        }

        /**
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
         * @this {WebInspector.ObjectPropertiesSection}
         */
        function callback(properties, internalProperties)
        {
            if (!properties)
                return;
            this.updateProperties(properties, internalProperties);
        }

        WebInspector.RemoteObject.loadFromObject(this.object, !!this.ignoreHasOwnProperty, callback.bind(this));
    },

    updateProperties: function(properties, internalProperties, rootTreeElementConstructor, rootPropertyComparer)
    {
        if (!rootTreeElementConstructor)
            rootTreeElementConstructor = this.treeElementConstructor;

        if (!rootPropertyComparer)
            rootPropertyComparer = WebInspector.ObjectPropertiesSection.CompareProperties;

        if (this.extraProperties) {
            for (var i = 0; i < this.extraProperties.length; ++i)
                properties.push(this.extraProperties[i]);
        }

        this.propertiesTreeOutline.removeChildren();

        WebInspector.ObjectPropertyTreeElement.populateWithProperties(this.propertiesTreeOutline,
            properties, internalProperties,
            rootTreeElementConstructor, rootPropertyComparer,
            this.skipProto, this.object);

        this.propertiesForTest = properties;

        if (!this.propertiesTreeOutline.children.length) {
            var title = document.createElement("div");
            title.className = "info";
            title.textContent = this.emptyPlaceholder;
            var infoElement = new TreeElement(title, null, false);
            this.propertiesTreeOutline.appendChild(infoElement);
        }
    },

    __proto__: WebInspector.PropertiesSection.prototype
}

/**
 * @param {!WebInspector.RemoteObjectProperty} propertyA
 * @param {!WebInspector.RemoteObjectProperty} propertyB
 * @return {number}
 */
WebInspector.ObjectPropertiesSection.CompareProperties = function(propertyA, propertyB)
{
    var a = propertyA.name;
    var b = propertyB.name;
    if (a === "__proto__")
        return 1;
    if (b === "__proto__")
        return -1;
    return String.naturalOrderComparator(a, b);
}

/**
 * @constructor
 * @extends {TreeElement}
 * @param {!WebInspector.RemoteObjectProperty} property
 */
WebInspector.ObjectPropertyTreeElement = function(property)
{
    this.property = property;

    // Pass an empty title, the title gets made later in onattach.
    TreeElement.call(this, "", null, false);
    this.toggleOnClick = true;
    this.selectable = false;
}

WebInspector.ObjectPropertyTreeElement.prototype = {
    onpopulate: function()
    {
        var propertyValue = /** @type {!WebInspector.RemoteObject} */ (this.property.value);
        console.assert(propertyValue);
        WebInspector.ObjectPropertyTreeElement.populate(this, propertyValue);
    },

    /**
     * @override
     * @return {boolean}
     */
    ondblclick: function(event)
    {
        if (this.property.writable || this.property.setter)
            this.startEditing(event);
        return false;
    },

    /**
     * @override
     */
    onattach: function()
    {
        this.update();
    },

    update: function()
    {
        this.nameElement = document.createElement("span");
        this.nameElement.className = "name";
        var name = this.property.name;
        if (/^\s|\s$|^$|\n/.test(name))
            name = "\"" + name.replace(/\n/g, "\u21B5") + "\"";
        this.nameElement.textContent = name;
        if (!this.property.enumerable)
            this.nameElement.classList.add("dimmed");
        if (this.property.isAccessorProperty())
            this.nameElement.classList.add("properties-accessor-property-name");

        var separatorElement = document.createElement("span");
        separatorElement.className = "separator";
        separatorElement.textContent = ": ";

        if (this.property.value) {
            this.valueElement = document.createElement("span");
            this.valueElement.className = "value";
            var description = this.property.value.description;
            // Render \n as a nice unicode cr symbol.
            if (this.property.wasThrown) {
                this.valueElement.textContent = "[Exception: " + description + "]";
            } else if (this.property.value.type === "string" && typeof description === "string") {
                this.valueElement.textContent = "\"" + description.replace(/\n/g, "\u21B5") + "\"";
                this.valueElement._originalTextContent = "\"" + description + "\"";
            } else if (this.property.value.type === "function" && typeof description === "string") {
                this.valueElement.textContent = /.*/.exec(description)[0].replace(/ +$/g, "");
                this.valueElement._originalTextContent = description;
            } else if (this.property.value.type !== "object" || this.property.value.subtype !== "node") {
                this.valueElement.textContent = description;
            }

            if (this.property.wasThrown)
                this.valueElement.classList.add("error");
            if (this.property.value.subtype)
                this.valueElement.classList.add("console-formatted-" + this.property.value.subtype);
            else if (this.property.value.type)
                this.valueElement.classList.add("console-formatted-" + this.property.value.type);

            this.valueElement.addEventListener("contextmenu", this._contextMenuFired.bind(this, this.property.value), false);
            if (this.property.value.type === "object" && this.property.value.subtype === "node" && this.property.value.description) {
                WebInspector.DOMPresentationUtils.createSpansForNodeTitle(this.valueElement, this.property.value.description);
                this.valueElement.addEventListener("mousemove", this._mouseMove.bind(this, this.property.value), false);
                this.valueElement.addEventListener("mouseout", this._mouseOut.bind(this, this.property.value), false);
            } else {
                this.valueElement.title = description || "";
            }

            this.listItemElement.removeChildren();

            this.hasChildren = this.property.value.hasChildren && !this.property.wasThrown;
        } else {
            if (this.property.getter) {
                this.valueElement = WebInspector.ObjectPropertyTreeElement.createRemoteObjectAccessorPropertySpan(this.property.parentObject, [this.property.name], this._onInvokeGetterClick.bind(this));
            } else {
                this.valueElement = document.createElement("span");
                this.valueElement.className = "console-formatted-undefined";
                this.valueElement.textContent = WebInspector.UIString("<unreadable>");
                this.valueElement.title = WebInspector.UIString("No property getter");
            }
        }

        this.listItemElement.appendChild(this.nameElement);
        this.listItemElement.appendChild(separatorElement);
        this.listItemElement.appendChild(this.valueElement);
    },

    _contextMenuFired: function(value, event)
    {
        var contextMenu = new WebInspector.ContextMenu(event);
        this.populateContextMenu(contextMenu);
        contextMenu.appendApplicableItems(value);
        contextMenu.show();
    },

    /**
     * @param {!WebInspector.ContextMenu} contextMenu
     */
    populateContextMenu: function(contextMenu)
    {
    },

    _mouseMove: function(event)
    {
        this.property.value.highlightAsDOMNode();
    },

    _mouseOut: function(event)
    {
        this.property.value.hideDOMNodeHighlight();
    },

    updateSiblings: function()
    {
        if (this.parent.root)
            this.treeOutline.section.update();
        else
            this.parent.shouldRefreshChildren = true;
    },

    /**
     * @return {boolean}
     */
    renderPromptAsBlock: function()
    {
        return false;
    },

    /**
     * @param {!Event=} event
     * @return {!Array.<!Element|undefined>}
     */
    elementAndValueToEdit: function(event)
    {
        return [this.valueElement, (typeof this.valueElement._originalTextContent === "string") ? this.valueElement._originalTextContent : undefined];
    },

    /**
     * @param {!Event=} event
     */
    startEditing: function(event)
    {
        var elementAndValueToEdit = this.elementAndValueToEdit(event);
        var elementToEdit = elementAndValueToEdit[0];
        var valueToEdit = elementAndValueToEdit[1];

        if (WebInspector.isBeingEdited(elementToEdit) || !this.treeOutline.section.editable || this._readOnly)
            return;

        // Edit original source.
        if (typeof valueToEdit !== "undefined")
            elementToEdit.textContent = valueToEdit;

        var context = { expanded: this.expanded, elementToEdit: elementToEdit, previousContent: elementToEdit.textContent };

        // Lie about our children to prevent expanding on double click and to collapse subproperties.
        this.hasChildren = false;

        this.listItemElement.classList.add("editing-sub-part");

        this._prompt = new WebInspector.ObjectPropertyPrompt(this.editingCommitted.bind(this, null, elementToEdit.textContent, context.previousContent, context), this.editingCancelled.bind(this, null, context), this.renderPromptAsBlock());

        /**
         * @this {WebInspector.ObjectPropertyTreeElement}
         */
        function blurListener()
        {
            this.editingCommitted(null, elementToEdit.textContent, context.previousContent, context);
        }

        var proxyElement = this._prompt.attachAndStartEditing(elementToEdit, blurListener.bind(this));
        window.getSelection().setBaseAndExtent(elementToEdit, 0, elementToEdit, 1);
        proxyElement.addEventListener("keydown", this._promptKeyDown.bind(this, context), false);
    },

    /**
     * @return {boolean}
     */
    isEditing: function()
    {
        return !!this._prompt;
    },

    editingEnded: function(context)
    {
        this._prompt.detach();
        delete this._prompt;

        this.listItemElement.scrollLeft = 0;
        this.listItemElement.classList.remove("editing-sub-part");
        if (context.expanded)
            this.expand();
    },

    editingCancelled: function(element, context)
    {
        this.editingEnded(context);
        this.update();
    },

    editingCommitted: function(element, userInput, previousContent, context)
    {
        if (userInput === previousContent) {
            this.editingCancelled(element, context); // nothing changed, so cancel
            return;
        }

        this.editingEnded(context);
        this.applyExpression(userInput, true);
    },

    _promptKeyDown: function(context, event)
    {
        if (isEnterKey(event)) {
            event.consume(true);
            this.editingCommitted(null, context.elementToEdit.textContent, context.previousContent, context);
            return;
        }
        if (event.keyIdentifier === "U+001B") { // Esc
            event.consume();
            this.editingCancelled(null, context);
            return;
        }
    },

    applyExpression: function(expression, updateInterface)
    {
        expression = expression.trim();
        var expressionLength = expression.length;

        /**
         * @param {?Protocol.Error} error
         * @this {WebInspector.ObjectPropertyTreeElement}
         */
        function callback(error)
        {
            if (!updateInterface)
                return;

            if (error)
                this.update();

            if (!expressionLength) {
                // The property was deleted, so remove this tree element.
                this.parent.removeChild(this);
            } else {
                // Call updateSiblings since their value might be based on the value that just changed.
                this.updateSiblings();
            }
        };
        this.property.parentObject.setPropertyValue(this.property.name, expression.trim(), callback.bind(this));
    },

    /**
     * @return {string|undefined}
     */
    propertyPath: function()
    {
        if ("_cachedPropertyPath" in this)
            return this._cachedPropertyPath;

        var current = this;
        var result;

        do {
            if (current.property) {
                if (result)
                    result = current.property.name + "." + result;
                else
                    result = current.property.name;
            }
            current = current.parent;
        } while (current && !current.root);

        this._cachedPropertyPath = result;
        return result;
    },

    /**
     * @param {?WebInspector.RemoteObject} result
     * @param {boolean=} wasThrown
     */
    _onInvokeGetterClick: function(result, wasThrown)
    {
        if (!result)
            return;
        this.property.value = result;
        this.property.wasThrown = wasThrown;

        this.update();
        this.shouldRefreshChildren = true;
    },

    __proto__: TreeElement.prototype
}

/**
 * @param {!TreeElement} treeElement
 * @param {!WebInspector.RemoteObject} value
 */
WebInspector.ObjectPropertyTreeElement.populate = function(treeElement, value) {
    if (treeElement.children.length && !treeElement.shouldRefreshChildren)
        return;

    if (value.arrayLength() > WebInspector.ObjectPropertiesSection._arrayLoadThreshold) {
        treeElement.removeChildren();
        WebInspector.ArrayGroupingTreeElement._populateArray(treeElement, value, 0, value.arrayLength() - 1);
        return;
    }

    /**
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
     */
    function callback(properties, internalProperties)
    {
        treeElement.removeChildren();
        if (!properties)
            return;
        if (!internalProperties)
            internalProperties = [];

        WebInspector.ObjectPropertyTreeElement.populateWithProperties(treeElement, properties, internalProperties,
            treeElement.treeOutline.section.treeElementConstructor, WebInspector.ObjectPropertiesSection.CompareProperties,
            treeElement.treeOutline.section.skipProto, value);
    }

    WebInspector.RemoteObject.loadFromObjectPerProto(value, callback);
}

/**
 * @param {!TreeElement|!TreeOutline} treeElement
 * @param {!Array.<!WebInspector.RemoteObjectProperty>} properties
 * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
 * @param {function(new:TreeElement, !WebInspector.RemoteObjectProperty)} treeElementConstructor
 * @param {function (!WebInspector.RemoteObjectProperty, !WebInspector.RemoteObjectProperty): number} comparator
 * @param {boolean} skipProto
 * @param {?WebInspector.RemoteObject} value
 */
WebInspector.ObjectPropertyTreeElement.populateWithProperties = function(treeElement, properties, internalProperties, treeElementConstructor, comparator, skipProto, value) {
    properties.sort(comparator);

    for (var i = 0; i < properties.length; ++i) {
        var property = properties[i];
        if (skipProto && property.name === "__proto__")
            continue;
        if (property.isAccessorProperty()) {
            if (property.name !== "__proto__" && property.getter) {
                property.parentObject = value;
                treeElement.appendChild(new treeElementConstructor(property));
            }
            if (property.isOwn) {
                if (property.getter) {
                    var getterProperty = new WebInspector.RemoteObjectProperty("get " + property.name, property.getter);
                    getterProperty.parentObject = value;
                    treeElement.appendChild(new treeElementConstructor(getterProperty));
                }
                if (property.setter) {
                    var setterProperty = new WebInspector.RemoteObjectProperty("set " + property.name, property.setter);
                    setterProperty.parentObject = value;
                    treeElement.appendChild(new treeElementConstructor(setterProperty));
                }
            }
        } else {
            property.parentObject = value;
            treeElement.appendChild(new treeElementConstructor(property));
        }
    }
    if (value && value.type === "function") {
        // Whether function has TargetFunction internal property.
        // This is a simple way to tell that the function is actually a bound function (we are not told).
        // Bound function never has inner scope and doesn't need corresponding UI node.
        var hasTargetFunction = false;

        if (internalProperties) {
            for (var i = 0; i < internalProperties.length; i++) {
                if (internalProperties[i].name == "[[TargetFunction]]") {
                    hasTargetFunction = true;
                    break;
                }
            }
        }
        if (!hasTargetFunction)
            treeElement.appendChild(new WebInspector.FunctionScopeMainTreeElement(value));
    }
    if (internalProperties) {
        for (var i = 0; i < internalProperties.length; i++) {
            internalProperties[i].parentObject = value;
            treeElement.appendChild(new treeElementConstructor(internalProperties[i]));
        }
    }
}

/**
 * @param {!WebInspector.RemoteObject} object
 * @param {!Array.<string>} propertyPath
 * @param {function(?WebInspector.RemoteObject, boolean=)} callback
 * @return {!Element}
 */
WebInspector.ObjectPropertyTreeElement.createRemoteObjectAccessorPropertySpan = function(object, propertyPath, callback)
{
    var rootElement = document.createElement("span");
    var element = rootElement.createChild("span", "properties-calculate-value-button");
    element.textContent = WebInspector.UIString("(...)");
    element.title = WebInspector.UIString("Invoke property getter");
    element.addEventListener("click", onInvokeGetterClick, false);

    function onInvokeGetterClick(event)
    {
        event.consume();
        object.getProperty(propertyPath, callback);
    }

    return rootElement;
}

/**
 * @constructor
 * @extends {TreeElement}
 * @param {!WebInspector.RemoteObject} remoteObject
 */
WebInspector.FunctionScopeMainTreeElement = function(remoteObject)
{
    TreeElement.call(this, "<function scope>", null, false);
    this.toggleOnClick = true;
    this.selectable = false;
    this._remoteObject = remoteObject;
    this.hasChildren = true;
}

WebInspector.FunctionScopeMainTreeElement.prototype = {
    onpopulate: function()
    {
        if (this.children.length && !this.shouldRefreshChildren)
            return;

        /**
         * @param {?Protocol.Error} error
         * @param {!DebuggerAgent.FunctionDetails} response
         * @this {WebInspector.FunctionScopeMainTreeElement}
         */
        function didGetDetails(error, response)
        {
            if (error) {
                console.error(error);
                return;
            }
            this.removeChildren();

            var scopeChain = response.scopeChain;
            if (!scopeChain)
                return;
            for (var i = 0; i < scopeChain.length; ++i) {
                var scope = scopeChain[i];
                var title = null;
                var isTrueObject;

                switch (scope.type) {
                case DebuggerAgent.ScopeType.Local:
                    // Not really expecting this scope type here.
                    title = WebInspector.UIString("Local");
                    isTrueObject = false;
                    break;
                case DebuggerAgent.ScopeType.Closure:
                    title = WebInspector.UIString("Closure");
                    isTrueObject = false;
                    break;
                case DebuggerAgent.ScopeType.Catch:
                    title = WebInspector.UIString("Catch");
                    isTrueObject = false;
                    break;
                case DebuggerAgent.ScopeType.With:
                    title = WebInspector.UIString("With Block");
                    isTrueObject = true;
                    break;
                case DebuggerAgent.ScopeType.Global:
                    title = WebInspector.UIString("Global");
                    isTrueObject = true;
                    break;
                default:
                    console.error("Unknown scope type: " + scope.type);
                    continue;
                }

                var scopeRef = isTrueObject ? undefined : new WebInspector.ScopeRef(i, undefined, this._remoteObject.objectId);
                var remoteObject = WebInspector.ScopeRemoteObject.fromPayload(scope.object, scopeRef);
                if (isTrueObject) {
                    var property = WebInspector.RemoteObjectProperty.fromScopeValue(title, remoteObject);
                    property.parentObject = null;
                    this.appendChild(new this.treeOutline.section.treeElementConstructor(property));
                } else {
                    var scopeTreeElement = new WebInspector.ScopeTreeElement(title, null, remoteObject);
                    this.appendChild(scopeTreeElement);
                }
            }

        }
        DebuggerAgent.getFunctionDetails(this._remoteObject.objectId, didGetDetails.bind(this));
    },

    __proto__: TreeElement.prototype
}

/**
 * @constructor
 * @extends {TreeElement}
 * @param {!WebInspector.RemoteObject} remoteObject
 */
WebInspector.ScopeTreeElement = function(title, subtitle, remoteObject)
{
    // TODO: use subtitle parameter.
    TreeElement.call(this, title, null, false);
    this.toggleOnClick = true;
    this.selectable = false;
    this._remoteObject = remoteObject;
    this.hasChildren = true;
}

WebInspector.ScopeTreeElement.prototype = {
    onpopulate: function()
    {
        WebInspector.ObjectPropertyTreeElement.populate(this, this._remoteObject);
    },

    __proto__: TreeElement.prototype
}

/**
 * @constructor
 * @extends {TreeElement}
 * @param {!WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 * @param {number} propertyCount
 */
WebInspector.ArrayGroupingTreeElement = function(object, fromIndex, toIndex, propertyCount)
{
    TreeElement.call(this, String.sprintf("[%d \u2026 %d]", fromIndex, toIndex), undefined, true);
    this._fromIndex = fromIndex;
    this._toIndex = toIndex;
    this._object = object;
    this._readOnly = true;
    this._propertyCount = propertyCount;
    this._populated = false;
}

WebInspector.ArrayGroupingTreeElement._bucketThreshold = 100;
WebInspector.ArrayGroupingTreeElement._sparseIterationThreshold = 250000;

/**
 * @param {!TreeElement|!TreeOutline} treeElement
 * @param {!WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 */
WebInspector.ArrayGroupingTreeElement._populateArray = function(treeElement, object, fromIndex, toIndex)
{
    WebInspector.ArrayGroupingTreeElement._populateRanges(treeElement, object, fromIndex, toIndex, true);
}

/**
 * @param {!TreeElement|!TreeOutline} treeElement
 * @param {!WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 * @param {boolean} topLevel
 * @this {WebInspector.ArrayGroupingTreeElement}
 */
WebInspector.ArrayGroupingTreeElement._populateRanges = function(treeElement, object, fromIndex, toIndex, topLevel)
{
    object.callFunctionJSON(packRanges, [{value: fromIndex}, {value: toIndex}, {value: WebInspector.ArrayGroupingTreeElement._bucketThreshold}, {value: WebInspector.ArrayGroupingTreeElement._sparseIterationThreshold}], callback.bind(this));

    /**
     * @this {Object}
     * @param {number=} fromIndex // must declare optional
     * @param {number=} toIndex // must declare optional
     * @param {number=} bucketThreshold // must declare optional
     * @param {number=} sparseIterationThreshold // must declare optional
     */
    function packRanges(fromIndex, toIndex, bucketThreshold, sparseIterationThreshold)
    {
        var ownPropertyNames = null;

        /**
         * @this {Object}
         */
        function doLoop(iterationCallback)
        {
            if (toIndex - fromIndex < sparseIterationThreshold) {
                for (var i = fromIndex; i <= toIndex; ++i) {
                    if (i in this)
                        iterationCallback(i);
                }
            } else {
                ownPropertyNames = ownPropertyNames || Object.getOwnPropertyNames(this);
                for (var i = 0; i < ownPropertyNames.length; ++i) {
                    var name = ownPropertyNames[i];
                    var index = name >>> 0;
                    if (String(index) === name && fromIndex <= index && index <= toIndex)
                        iterationCallback(index);
                }
            }
        }

        var count = 0;
        function countIterationCallback()
        {
            ++count;
        }
        doLoop.call(this, countIterationCallback);

        var bucketSize = count;
        if (count <= bucketThreshold)
            bucketSize = count;
        else
            bucketSize = Math.pow(bucketThreshold, Math.ceil(Math.log(count) / Math.log(bucketThreshold)) - 1);

        var ranges = [];
        count = 0;
        var groupStart = -1;
        var groupEnd = 0;
        function loopIterationCallback(i)
        {
            if (groupStart === -1)
                groupStart = i;

            groupEnd = i;
            if (++count === bucketSize) {
                ranges.push([groupStart, groupEnd, count]);
                count = 0;
                groupStart = -1;
            }
        }
        doLoop.call(this, loopIterationCallback);

        if (count > 0)
            ranges.push([groupStart, groupEnd, count]);
        return ranges;
    }

    function callback(ranges)
    {
        if (ranges.length == 1)
            WebInspector.ArrayGroupingTreeElement._populateAsFragment(treeElement, object, ranges[0][0], ranges[0][1]);
        else {
            for (var i = 0; i < ranges.length; ++i) {
                var fromIndex = ranges[i][0];
                var toIndex = ranges[i][1];
                var count = ranges[i][2];
                if (fromIndex == toIndex)
                    WebInspector.ArrayGroupingTreeElement._populateAsFragment(treeElement, object, fromIndex, toIndex);
                else
                    treeElement.appendChild(new WebInspector.ArrayGroupingTreeElement(object, fromIndex, toIndex, count));
            }
        }
        if (topLevel)
            WebInspector.ArrayGroupingTreeElement._populateNonIndexProperties(treeElement, object);
    }
}

/**
 * @param {!TreeElement|!TreeOutline} treeElement
 * @param {!WebInspector.RemoteObject} object
 * @param {number} fromIndex
 * @param {number} toIndex
 * @this {WebInspector.ArrayGroupingTreeElement}
 */
WebInspector.ArrayGroupingTreeElement._populateAsFragment = function(treeElement, object, fromIndex, toIndex)
{
    object.callFunction(buildArrayFragment, [{value: fromIndex}, {value: toIndex}, {value: WebInspector.ArrayGroupingTreeElement._sparseIterationThreshold}], processArrayFragment.bind(this));

    /**
     * @this {Object}
     * @param {number=} fromIndex // must declare optional
     * @param {number=} toIndex // must declare optional
     * @param {number=} sparseIterationThreshold // must declare optional
     */
    function buildArrayFragment(fromIndex, toIndex, sparseIterationThreshold)
    {
        var result = Object.create(null);
        if (toIndex - fromIndex < sparseIterationThreshold) {
            for (var i = fromIndex; i <= toIndex; ++i) {
                if (i in this)
                    result[i] = this[i];
            }
        } else {
            var ownPropertyNames = Object.getOwnPropertyNames(this);
            for (var i = 0; i < ownPropertyNames.length; ++i) {
                var name = ownPropertyNames[i];
                var index = name >>> 0;
                if (String(index) === name && fromIndex <= index && index <= toIndex)
                    result[index] = this[index];
            }
        }
        return result;
    }

    /**
     * @param {?WebInspector.RemoteObject} arrayFragment
     * @param {boolean=} wasThrown
     * @this {WebInspector.ArrayGroupingTreeElement}
     */
    function processArrayFragment(arrayFragment, wasThrown)
    {
        if (!arrayFragment || wasThrown)
            return;
        arrayFragment.getAllProperties(false, processProperties.bind(this));
    }

    /** @this {WebInspector.ArrayGroupingTreeElement} */
    function processProperties(properties, internalProperties)
    {
        if (!properties)
            return;

        properties.sort(WebInspector.ObjectPropertiesSection.CompareProperties);
        for (var i = 0; i < properties.length; ++i) {
            properties[i].parentObject = this._object;
            var childTreeElement = new treeElement.treeOutline.section.treeElementConstructor(properties[i]);
            childTreeElement._readOnly = true;
            treeElement.appendChild(childTreeElement);
        }
    }
}

/**
 * @param {!TreeElement|!TreeOutline} treeElement
 * @param {!WebInspector.RemoteObject} object
 * @this {WebInspector.ArrayGroupingTreeElement}
 */
WebInspector.ArrayGroupingTreeElement._populateNonIndexProperties = function(treeElement, object)
{
    object.callFunction(buildObjectFragment, undefined, processObjectFragment.bind(this));

    /** @this {Object} */
    function buildObjectFragment()
    {
        var result = Object.create(this.__proto__);
        var names = Object.getOwnPropertyNames(this);
        for (var i = 0; i < names.length; ++i) {
            var name = names[i];
            // Array index check according to the ES5-15.4.
            if (String(name >>> 0) === name && name >>> 0 !== 0xffffffff)
                continue;
            var descriptor = Object.getOwnPropertyDescriptor(this, name);
            if (descriptor)
                Object.defineProperty(result, name, descriptor);
        }
        return result;
    }

    /**
     * @param {?WebInspector.RemoteObject} arrayFragment
     * @param {boolean=} wasThrown
     * @this {WebInspector.ArrayGroupingTreeElement}
     */
    function processObjectFragment(arrayFragment, wasThrown)
    {
        if (!arrayFragment || wasThrown)
            return;
        arrayFragment.getOwnProperties(processProperties.bind(this));
    }

    /**
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
     * @param {?Array.<!WebInspector.RemoteObjectProperty>=} internalProperties
     * @this {WebInspector.ArrayGroupingTreeElement}
     */
    function processProperties(properties, internalProperties)
    {
        if (!properties)
            return;
        properties.sort(WebInspector.ObjectPropertiesSection.CompareProperties);
        for (var i = 0; i < properties.length; ++i) {
            properties[i].parentObject = this._object;
            var childTreeElement = new treeElement.treeOutline.section.treeElementConstructor(properties[i]);
            childTreeElement._readOnly = true;
            treeElement.appendChild(childTreeElement);
        }
    }
}

WebInspector.ArrayGroupingTreeElement.prototype = {
    onpopulate: function()
    {
        if (this._populated)
            return;

        this._populated = true;

        if (this._propertyCount >= WebInspector.ArrayGroupingTreeElement._bucketThreshold) {
            WebInspector.ArrayGroupingTreeElement._populateRanges(this, this._object, this._fromIndex, this._toIndex, false);
            return;
        }
        WebInspector.ArrayGroupingTreeElement._populateAsFragment(this, this._object, this._fromIndex, this._toIndex);
    },

    onattach: function()
    {
        this.listItemElement.classList.add("name");
    },

    __proto__: TreeElement.prototype
}

/**
 * @constructor
 * @extends {WebInspector.TextPrompt}
 * @param {boolean=} renderAsBlock
 */
WebInspector.ObjectPropertyPrompt = function(commitHandler, cancelHandler, renderAsBlock)
{
    WebInspector.TextPrompt.call(this, WebInspector.runtimeModel.completionsForTextPrompt.bind(WebInspector.runtimeModel));
    this.setSuggestBoxEnabled("generic-suggest");
    if (renderAsBlock)
        this.renderAsBlock();
}

WebInspector.ObjectPropertyPrompt.prototype = {
    __proto__: WebInspector.TextPrompt.prototype
}



/*
 * Copyright (C) 2007 Apple Inc.  All rights reserved.
 * Copyright (C) 2012 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Contains diff method based on Javascript Diff Algorithm By John Resig
 * http://ejohn.org/files/jsdiff.js (released under the MIT license).
 */

/**
 * @param {string=} direction
 */
Node.prototype.rangeOfWord = function(offset, stopCharacters, stayWithinNode, direction)
{
    var startNode;
    var startOffset = 0;
    var endNode;
    var endOffset = 0;

    if (!stayWithinNode)
        stayWithinNode = this;

    if (!direction || direction === "backward" || direction === "both") {
        var node = this;
        while (node) {
            if (node === stayWithinNode) {
                if (!startNode)
                    startNode = stayWithinNode;
                break;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                var start = (node === this ? (offset - 1) : (node.nodeValue.length - 1));
                for (var i = start; i >= 0; --i) {
                    if (stopCharacters.indexOf(node.nodeValue[i]) !== -1) {
                        startNode = node;
                        startOffset = i + 1;
                        break;
                    }
                }
            }

            if (startNode)
                break;

            node = node.traversePreviousNode(stayWithinNode);
        }

        if (!startNode) {
            startNode = stayWithinNode;
            startOffset = 0;
        }
    } else {
        startNode = this;
        startOffset = offset;
    }

    if (!direction || direction === "forward" || direction === "both") {
        node = this;
        while (node) {
            if (node === stayWithinNode) {
                if (!endNode)
                    endNode = stayWithinNode;
                break;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                var start = (node === this ? offset : 0);
                for (var i = start; i < node.nodeValue.length; ++i) {
                    if (stopCharacters.indexOf(node.nodeValue[i]) !== -1) {
                        endNode = node;
                        endOffset = i;
                        break;
                    }
                }
            }

            if (endNode)
                break;

            node = node.traverseNextNode(stayWithinNode);
        }

        if (!endNode) {
            endNode = stayWithinNode;
            endOffset = stayWithinNode.nodeType === Node.TEXT_NODE ? stayWithinNode.nodeValue.length : stayWithinNode.childNodes.length;
        }
    } else {
        endNode = this;
        endOffset = offset;
    }

    var result = this.ownerDocument.createRange();
    result.setStart(startNode, startOffset);
    result.setEnd(endNode, endOffset);

    return result;
}

Node.prototype.traverseNextTextNode = function(stayWithin)
{
    var node = this.traverseNextNode(stayWithin);
    if (!node)
        return;

    while (node && node.nodeType !== Node.TEXT_NODE)
        node = node.traverseNextNode(stayWithin);

    return node;
}

Node.prototype.rangeBoundaryForOffset = function(offset)
{
    var node = this.traverseNextTextNode(this);
    while (node && offset > node.nodeValue.length) {
        offset -= node.nodeValue.length;
        node = node.traverseNextTextNode(this);
    }
    if (!node)
        return { container: this, offset: 0 };
    return { container: node, offset: offset };
}

Element.prototype.removeMatchingStyleClasses = function(classNameRegex)
{
    var regex = new RegExp("(^|\\s+)" + classNameRegex + "($|\\s+)");
    if (regex.test(this.className))
        this.className = this.className.replace(regex, " ");
}

/**
 * @param {string} className
 * @param {*} enable
 */
Element.prototype.enableStyleClass = function(className, enable)
{
    if (enable)
        this.classList.add(className);
    else
        this.classList.remove(className);
}

/**
 * @param {number|undefined} x
 * @param {number|undefined} y
 * @param {!Element=} relativeTo
 */
Element.prototype.positionAt = function(x, y, relativeTo)
{
    var shift = {x: 0, y: 0};
    if (relativeTo)
       shift = relativeTo.boxInWindow(this.ownerDocument.defaultView);

    if (typeof x === "number")
        this.style.setProperty("left", (shift.x + x) + "px");
    else
        this.style.removeProperty("left");

    if (typeof y === "number")
        this.style.setProperty("top", (shift.y + y) + "px");
    else
        this.style.removeProperty("top");
}

Element.prototype.isScrolledToBottom = function()
{
    // This code works only for 0-width border
    return this.scrollTop + this.clientHeight === this.scrollHeight;
}

/**
 * @param {!Node} fromNode
 * @param {!Node} toNode
 */
function removeSubsequentNodes(fromNode, toNode)
{
    for (var node = fromNode; node && node !== toNode; ) {
        var nodeToRemove = node;
        node = node.nextSibling;
        nodeToRemove.remove();
    }
}

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 */
function Size(width, height)
{
    this.width = width;
    this.height = height;
}

/**
 * @param {?Element=} containerElement
 * @return {!Size}
 */
Element.prototype.measurePreferredSize = function(containerElement)
{
    containerElement = containerElement || document.body;
    containerElement.appendChild(this);
    this.positionAt(0, 0);
    var result = new Size(this.offsetWidth, this.offsetHeight);
    this.positionAt(undefined, undefined);
    this.remove();
    return result;
}

/**
 * @param {!Event} event
 * @return {boolean}
 */
Element.prototype.containsEventPoint = function(event)
{
    var box = this.getBoundingClientRect();
    return box.left < event.x  && event.x < box.right &&
           box.top < event.y && event.y < box.bottom;
}

Node.prototype.enclosingNodeOrSelfWithNodeNameInArray = function(nameArray)
{
    for (var node = this; node && node !== this.ownerDocument; node = node.parentNode)
        for (var i = 0; i < nameArray.length; ++i)
            if (node.nodeName.toLowerCase() === nameArray[i].toLowerCase())
                return node;
    return null;
}

Node.prototype.enclosingNodeOrSelfWithNodeName = function(nodeName)
{
    return this.enclosingNodeOrSelfWithNodeNameInArray([nodeName]);
}

/**
 * @param {string} className
 * @param {!Element=} stayWithin
 */
Node.prototype.enclosingNodeOrSelfWithClass = function(className, stayWithin)
{
    for (var node = this; node && node !== stayWithin && node !== this.ownerDocument; node = node.parentNode)
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains(className))
            return node;
    return null;
}

Element.prototype.query = function(query)
{
    return this.ownerDocument.evaluate(query, this, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

Element.prototype.removeChildren = function()
{
    if (this.firstChild)
        this.textContent = "";
}

Element.prototype.isInsertionCaretInside = function()
{
    var selection = window.getSelection();
    if (!selection.rangeCount || !selection.isCollapsed)
        return false;
    var selectionRange = selection.getRangeAt(0);
    return selectionRange.startContainer.isSelfOrDescendant(this);
}

/**
 * @param {string} elementName
 * @param {string=} className
 */
Document.prototype.createElementWithClass = function(elementName, className)
{
    var element = this.createElement(elementName);
    if (className)
        element.className = className;
    return element;
}

/**
 * @param {string=} className
 */
Element.prototype.createChild = function(elementName, className)
{
    var element = this.ownerDocument.createElementWithClass(elementName, className);
    this.appendChild(element);
    return element;
}

DocumentFragment.prototype.createChild = Element.prototype.createChild;

/**
 * @param {string} text
 */
Element.prototype.createTextChild = function(text)
{
    var element = this.ownerDocument.createTextNode(text);
    this.appendChild(element);
    return element;
}

DocumentFragment.prototype.createTextChild = Element.prototype.createTextChild;

/**
 * @return {number}
 */
Element.prototype.totalOffsetLeft = function()
{
    return this.totalOffset().left;
}

/**
 * @return {number}
 */
Element.prototype.totalOffsetTop = function()
{
    return this.totalOffset().top;

}

Element.prototype.totalOffset = function()
{
    var rect = this.getBoundingClientRect();
    return { left: rect.left, top: rect.top };
}

Element.prototype.scrollOffset = function()
{
    var curLeft = 0;
    var curTop = 0;
    for (var element = this; element; element = element.scrollParent) {
        curLeft += element.scrollLeft;
        curTop += element.scrollTop;
    }
    return { left: curLeft, top: curTop };
}

/**
 * @constructor
 * @param {number=} x
 * @param {number=} y
 * @param {number=} width
 * @param {number=} height
 */
function AnchorBox(x, y, width, height)
{
    this.x = x || 0;
    this.y = y || 0;
    this.width = width || 0;
    this.height = height || 0;
}

/**
 * @param {!AnchorBox} box
 * @return {!AnchorBox}
 */
AnchorBox.prototype.relativeTo = function(box)
{
    return new AnchorBox(
        this.x - box.x, this.y - box.y, this.width, this.height);
};

/**
 * @param {!Element} element
 * @return {!AnchorBox}
 */
AnchorBox.prototype.relativeToElement = function(element)
{
    return this.relativeTo(element.boxInWindow(element.ownerDocument.defaultView));
};

/**
 * @param {!Window} targetWindow
 * @return {!AnchorBox}
 */
Element.prototype.offsetRelativeToWindow = function(targetWindow)
{
    var elementOffset = new AnchorBox();
    var curElement = this;
    var curWindow = this.ownerDocument.defaultView;
    while (curWindow && curElement) {
        elementOffset.x += curElement.totalOffsetLeft();
        elementOffset.y += curElement.totalOffsetTop();
        if (curWindow === targetWindow)
            break;

        curElement = curWindow.frameElement;
        curWindow = curWindow.parent;
    }

    return elementOffset;
}

/**
 * @param {!Window} targetWindow
 * @return {!AnchorBox}
 */
Element.prototype.boxInWindow = function(targetWindow)
{
    targetWindow = targetWindow || this.ownerDocument.defaultView;

    var anchorBox = this.offsetRelativeToWindow(window);
    anchorBox.width = Math.min(this.offsetWidth, window.innerWidth - anchorBox.x);
    anchorBox.height = Math.min(this.offsetHeight, window.innerHeight - anchorBox.y);

    return anchorBox;
}

/**
 * @param {string} text
 */
Element.prototype.setTextAndTitle = function(text)
{
    this.textContent = text;
    this.title = text;
}

KeyboardEvent.prototype.__defineGetter__("data", function()
{
    // Emulate "data" attribute from DOM 3 TextInput event.
    // See http://www.w3.org/TR/DOM-Level-3-Events/#events-Events-TextEvent-data
    switch (this.type) {
        case "keypress":
            if (!this.ctrlKey && !this.metaKey)
                return String.fromCharCode(this.charCode);
            else
                return "";
        case "keydown":
        case "keyup":
            if (!this.ctrlKey && !this.metaKey && !this.altKey)
                return String.fromCharCode(this.which);
            else
                return "";
    }
});

/**
 * @param {boolean=} preventDefault
 */
Event.prototype.consume = function(preventDefault)
{
    this.stopImmediatePropagation();
    if (preventDefault)
        this.preventDefault();
    this.handled = true;
}

Text.prototype.select = function(start, end)
{
    start = start || 0;
    end = end || this.textContent.length;

    if (start < 0)
        start = end + start;

    var selection = this.ownerDocument.defaultView.getSelection();
    selection.removeAllRanges();
    var range = this.ownerDocument.createRange();
    range.setStart(this, start);
    range.setEnd(this, end);
    selection.addRange(range);
    return this;
}

Element.prototype.selectionLeftOffset = function()
{
    // Calculate selection offset relative to the current element.

    var selection = window.getSelection();
    if (!selection.containsNode(this, true))
        return null;

    var leftOffset = selection.anchorOffset;
    var node = selection.anchorNode;

    while (node !== this) {
        while (node.previousSibling) {
            node = node.previousSibling;
            leftOffset += node.textContent.length;
        }
        node = node.parentNode;
    }

    return leftOffset;
}

Node.prototype.isAncestor = function(node)
{
    if (!node)
        return false;

    var currentNode = node.parentNode;
    while (currentNode) {
        if (this === currentNode)
            return true;
        currentNode = currentNode.parentNode;
    }
    return false;
}

Node.prototype.isDescendant = function(descendant)
{
    return !!descendant && descendant.isAncestor(this);
}

Node.prototype.isSelfOrAncestor = function(node)
{
    return !!node && (node === this || this.isAncestor(node));
}

Node.prototype.isSelfOrDescendant = function(node)
{
    return !!node && (node === this || this.isDescendant(node));
}

Node.prototype.traverseNextNode = function(stayWithin)
{
    var node = this.firstChild;
    if (node)
        return node;

    if (stayWithin && this === stayWithin)
        return null;

    node = this.nextSibling;
    if (node)
        return node;

    node = this;
    while (node && !node.nextSibling && (!stayWithin || !node.parentNode || node.parentNode !== stayWithin))
        node = node.parentNode;
    if (!node)
        return null;

    return node.nextSibling;
}

Node.prototype.traversePreviousNode = function(stayWithin)
{
    if (stayWithin && this === stayWithin)
        return null;
    var node = this.previousSibling;
    while (node && node.lastChild)
        node = node.lastChild;
    if (node)
        return node;
    return this.parentNode;
}

/**
 * @return {boolean}
 */
function isEnterKey(event) {
    // Check if in IME.
    return event.keyCode !== 229 && event.keyIdentifier === "Enter";
}

function consumeEvent(e)
{
    e.consume();
}

/**
 * Mutation observers leak memory. Keep track of them and disconnect
 * on unload.
 * @constructor
 * @param {function(!Array.<!WebKitMutation>)} handler
 */
function NonLeakingMutationObserver(handler)
{
    this._observer = new WebKitMutationObserver(handler);
    NonLeakingMutationObserver._instances.push(this);
    if (!NonLeakingMutationObserver._unloadListener) {
        NonLeakingMutationObserver._unloadListener = function() {
            while (NonLeakingMutationObserver._instances.length)
                NonLeakingMutationObserver._instances[NonLeakingMutationObserver._instances.length - 1].disconnect();
        };
        window.addEventListener("unload", NonLeakingMutationObserver._unloadListener, false);
    }
}

NonLeakingMutationObserver._instances = [];

NonLeakingMutationObserver.prototype = {
    /**
     * @param {!Element} element
     * @param {!Object} config
     */
    observe: function(element, config)
    {
        if (this._observer)
            this._observer.observe(element, config);
    },

    disconnect: function()
    {
        if (this._observer)
            this._observer.disconnect();
        NonLeakingMutationObserver._instances.remove(this);
        delete this._observer;
    }
}




/*
 * Copyright (C) 2009 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @param {string|undefined} objectId
 * @param {string} type
 * @param {string|undefined} subtype
 * @param {*} value
 * @param {string=} description
 * @param {!RuntimeAgent.ObjectPreview=} preview
 */
WebInspector.RemoteObject = function(objectId, type, subtype, value, description, preview)
{
    this._type = type;
    this._subtype = subtype;
    if (objectId) {
        // handle
        this._objectId = objectId;
        this._description = description;
        this._hasChildren = true;
        this._preview = preview;
    } else {
        // Primitive or null object.
        console.assert(type !== "object" || value === null);
        this._description = description || (value + "");
        this._hasChildren = false;
        this.value = value;
    }
}

/**
 * @param {number|string|boolean} value
 * @return {!WebInspector.RemoteObject}
 */
WebInspector.RemoteObject.fromPrimitiveValue = function(value)
{
    return new WebInspector.RemoteObject(undefined, typeof value, undefined, value);
}

/**
 * @param {*} value
 * @return {!WebInspector.RemoteObject}
 */
WebInspector.RemoteObject.fromLocalObject = function(value)
{
    return new WebInspector.LocalJSONObject(value);
}

/**
 * @param {!WebInspector.DOMNode} node
 * @param {string} objectGroup
 * @param {function(?WebInspector.RemoteObject)} callback
 */
WebInspector.RemoteObject.resolveNode = function(node, objectGroup, callback)
{
    /**
     * @param {?Protocol.Error} error
     * @param {!RuntimeAgent.RemoteObject} object
     */
    function mycallback(error, object)
    {
        if (!callback)
            return;

        if (error || !object)
            callback(null);
        else
            callback(WebInspector.RemoteObject.fromPayload(object));
    }
    DOMAgent.resolveNode(node.id, objectGroup, mycallback);
}

/**
 * @param {!RuntimeAgent.RemoteObject} payload
 * @return {!WebInspector.RemoteObject}
 */
WebInspector.RemoteObject.fromPayload = function(payload)
{
    console.assert(typeof payload === "object", "Remote object payload should only be an object");

    return new WebInspector.RemoteObject(payload.objectId, payload.type, payload.subtype, payload.value, payload.description, payload.preview);
}

/**
 * @param {!WebInspector.RemoteObject} remoteObject
 * @return {string}
 */
WebInspector.RemoteObject.type = function(remoteObject)
{
    if (remoteObject === null)
        return "null";

    var type = typeof remoteObject;
    if (type !== "object" && type !== "function")
        return type;

    return remoteObject.type;
}

WebInspector.RemoteObject.prototype = {
    /** @return {!RuntimeAgent.RemoteObjectId} */
    get objectId()
    {
        return this._objectId;
    },

    /** @return {string} */
    get type()
    {
        return this._type;
    },

    /** @return {string|undefined} */
    get subtype()
    {
        return this._subtype;
    },

    /** @return {string|undefined} */
    get description()
    {
        return this._description;
    },

    /** @return {boolean} */
    get hasChildren()
    {
        return this._hasChildren;
    },

    /** @return {!RuntimeAgent.ObjectPreview|undefined} */
    get preview()
    {
        return this._preview;
    },

    /**
     * @param {function(?Array.<!WebInspector.RemoteObjectProperty>, ?Array.<!WebInspector.RemoteObjectProperty>)} callback
     */
    getOwnProperties: function(callback)
    {
        this.doGetProperties(true, false, callback);
    },

    /**
     * @param {boolean} accessorPropertiesOnly
     * @param {function(?Array.<!WebInspector.RemoteObjectProperty>, ?Array.<!WebInspector.RemoteObjectProperty>)} callback
     */
    getAllProperties: function(accessorPropertiesOnly, callback)
    {
        this.doGetProperties(false, accessorPropertiesOnly, callback);
    },

    /**
     * @param {!Array.<string>} propertyPath
     * @param {function(?WebInspector.RemoteObject, boolean=)} callback
     */
    getProperty: function(propertyPath, callback)
    {
        /**
         * @param {string} arrayStr
         * @this {Object}
         */
        function remoteFunction(arrayStr)
        {
            var result = this;
            var properties = JSON.parse(arrayStr);
            for (var i = 0, n = properties.length; i < n; ++i)
                result = result[properties[i]];
            return result;
        }

        var args = [{ value: JSON.stringify(propertyPath) }];
        this.callFunction(remoteFunction, args, callback);
    },

    /**
     * @param {boolean} ownProperties
     * @param {boolean} accessorPropertiesOnly
     * @param {?function(?Array.<!WebInspector.RemoteObjectProperty>, ?Array.<!WebInspector.RemoteObjectProperty>)} callback
     */
    doGetProperties: function(ownProperties, accessorPropertiesOnly, callback)
    {
        if (!this._objectId) {
            callback(null, null);
            return;
        }

        /**
         * @param {?Protocol.Error} error
         * @param {!Array.<!RuntimeAgent.PropertyDescriptor>} properties
         * @param {!Array.<!RuntimeAgent.InternalPropertyDescriptor>=} internalProperties
         */
        // function remoteObjectBinder(error, properties, internalProperties)
        function remoteObjectBinder(res) // TODO better adapter for window.RuntimeAgent
        {
            // -----------
            var error = false,
                properties = res.result,
                internalProperties = res.internalProperties;
            // -----------
            if (error) {
                callback(null, null);
                return;
            }
            var result = [];
            for (var i = 0; properties && i < properties.length; ++i) {
                var property = properties[i];
                result.push(new WebInspector.RemoteObjectProperty(property.name, null, property));
            }
            var internalPropertiesResult = null;
            if (internalProperties) {
                internalPropertiesResult = [];
                for (var i = 0; i < internalProperties.length; i++) {
                    var property = internalProperties[i];
                    if (!property.value)
                        continue;
                    internalPropertiesResult.push(new WebInspector.RemoteObjectProperty(property.name, WebInspector.RemoteObject.fromPayload(property.value)));
                }
            }
            callback(result, internalPropertiesResult);
        }
        RuntimeAgent.getProperties(this._objectId, ownProperties, accessorPropertiesOnly, remoteObjectBinder);
    },

    /**
     * @param {string} name
     * @param {string} value
     * @param {function(string=)} callback
     */
    setPropertyValue: function(name, value, callback)
    {
        if (!this._objectId) {
            callback("Can't set a property of non-object.");
            return;
        }

        RuntimeAgent.evaluate.invoke({expression:value, doNotPauseOnExceptionsAndMuteConsole:true}, evaluatedCallback.bind(this));

        /**
         * @param {?Protocol.Error} error
         * @param {!RuntimeAgent.RemoteObject} result
         * @param {boolean=} wasThrown
         * @this {WebInspector.RemoteObject}
         */
        function evaluatedCallback(error, result, wasThrown)
        {
            if (error || wasThrown) {
                callback(error || result.description);
                return;
            }

            this.doSetObjectPropertyValue(result, name, callback);

            if (result.objectId)
                RuntimeAgent.releaseObject(result.objectId);
        }
    },

    /**
     * @param {!RuntimeAgent.RemoteObject} result
     * @param {string} name
     * @param {function(string=)} callback
     */
    doSetObjectPropertyValue: function(result, name, callback)
    {
        // This assignment may be for a regular (data) property, and for an acccessor property (with getter/setter).
        // Note the sensitive matter about accessor property: the property may be physically defined in some proto object,
        // but logically it is bound to the object in question. JavaScript passes this object to getters/setters, not the object
        // where property was defined; so do we.
        var setPropertyValueFunction = "function(a, b) { this[a] = b; }";

        // Special case for NaN, Infinity, -Infinity, -0.
        if (result.type === "number" && String(result.value) !== result.description)
            setPropertyValueFunction = "function(a) { this[a] = " + result.description + "; }";

        delete result.description; // Optimize on traffic.
        RuntimeAgent.callFunctionOn(this._objectId, setPropertyValueFunction, [{ value:name }, result], true, undefined, undefined, propertySetCallback.bind(this));

        /**
         * @param {?Protocol.Error} error
         * @param {!RuntimeAgent.RemoteObject} result
         * @param {boolean=} wasThrown
         */
        function propertySetCallback(error, result, wasThrown)
        {
            if (error || wasThrown) {
                callback(error || result.description);
                return;
            }
            callback();
        }
    },

    /**
     * @param {function(?DOMAgent.NodeId)} callback
     */
    pushNodeToFrontend: function(callback)
    {
        callback(0); // TODO
        return;

        if (this._objectId)
            WebInspector.domAgent.pushNodeToFrontend(this._objectId, callback);
        else
            callback(0);
    },

    highlightAsDOMNode: function()
    {
        WebInspector.domAgent.highlightDOMNode(undefined, undefined, this._objectId);
    },

    hideDOMNodeHighlight: function()
    {
        WebInspector.domAgent.hideDOMNodeHighlight();
    },

    /**
     * @param {function(this:Object, ...)} functionDeclaration
     * @param {!Array.<!RuntimeAgent.CallArgument>=} args
     * @param {function(?WebInspector.RemoteObject, boolean=)=} callback
     */
    callFunction: function(functionDeclaration, args, callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @param {!RuntimeAgent.RemoteObject} result
         * @param {boolean=} wasThrown
         */
        function mycallback(error, result, wasThrown)
        {
            if (!callback)
                return;
            if (error)
                callback(null, false);
            else
                callback(WebInspector.RemoteObject.fromPayload(result), wasThrown);
        }

        RuntimeAgent.callFunctionOn(this._objectId, functionDeclaration.toString(), args, true, undefined, undefined, mycallback);
    },

    /**
     * @param {function(this:Object)} functionDeclaration
     * @param {!Array.<!RuntimeAgent.CallArgument>|undefined} args
     * @param {function(*)} callback
     */
    callFunctionJSON: function(functionDeclaration, args, callback)
    {
        /**
         * @param {?Protocol.Error} error
         * @param {!RuntimeAgent.RemoteObject} result
         * @param {boolean=} wasThrown
         */
        function mycallback(error, result, wasThrown)
        {
            callback((error || wasThrown) ? null : result.value);
        }

        RuntimeAgent.callFunctionOn(this._objectId, functionDeclaration.toString(), args, true, true, false, mycallback);
    },

    release: function()
    {
        if (!this._objectId)
            return;
        RuntimeAgent.releaseObject(this._objectId);
    },

    /**
     * @return {number}
     */
    arrayLength: function()
    {
        if (this.subtype !== "array")
            return 0;

        var matches = this._description.match(/\[([0-9]+)\]/);
        if (!matches)
            return 0;
        return parseInt(matches[1], 10);
    }
};


/**
 * @param {!WebInspector.RemoteObject} object
 * @param {boolean} flattenProtoChain
 * @param {function(?Array.<!WebInspector.RemoteObjectProperty>, ?Array.<!WebInspector.RemoteObjectProperty>)} callback
 */
WebInspector.RemoteObject.loadFromObject = function(object, flattenProtoChain, callback)
{
    if (flattenProtoChain)
       object.getAllProperties(false, callback);
    else
        WebInspector.RemoteObject.loadFromObjectPerProto(object, callback);
};

/**
 * @param {!WebInspector.RemoteObject} object
 * @param {function(?Array.<!WebInspector.RemoteObjectProperty>, ?Array.<!WebInspector.RemoteObjectProperty>)} callback
 */
WebInspector.RemoteObject.loadFromObjectPerProto = function(object, callback)
{
    // Combines 2 asynch calls. Doesn't rely on call-back orders (some calls may be loop-back).
    var savedOwnProperties;
    var savedAccessorProperties;
    var savedInternalProperties;
    var resultCounter = 2;

    function processCallback()
    {
        if (--resultCounter)
            return;
        if (savedOwnProperties && savedAccessorProperties) {
            var combinedList = savedAccessorProperties.slice(0);
            for (var i = 0; i < savedOwnProperties.length; i++) {
                var property = savedOwnProperties[i];
                if (!property.isAccessorProperty())
                    combinedList.push(property);
            }
            return callback(combinedList, savedInternalProperties ? savedInternalProperties : null);
        } else {
            callback(null, null);
        }
    }

    /**
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
     */
    function allAccessorPropertiesCallback(properties, internalProperties)
    {
        savedAccessorProperties = properties;
        processCallback();
    }

    /**
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
     */
    function ownPropertiesCallback(properties, internalProperties)
    {
        savedOwnProperties = properties;
        savedInternalProperties = internalProperties;
        processCallback();
    }

    object.getAllProperties(true, allAccessorPropertiesCallback);
    object.getOwnProperties(ownPropertiesCallback);
};


/**
 * @constructor
 * @extends {WebInspector.RemoteObject}
 * @param {string|undefined} objectId
 * @param {!WebInspector.ScopeRef} scopeRef
 * @param {string} type
 * @param {string|undefined} subtype
 * @param {*} value
 * @param {string=} description
 * @param {!RuntimeAgent.ObjectPreview=} preview
 */
WebInspector.ScopeRemoteObject = function(objectId, scopeRef, type, subtype, value, description, preview)
{
    WebInspector.RemoteObject.call(this, objectId, type, subtype, value, description, preview);
    this._scopeRef = scopeRef;
    this._savedScopeProperties = undefined;
};

/**
 * @param {!RuntimeAgent.RemoteObject} payload
 * @param {!WebInspector.ScopeRef=} scopeRef
 * @return {!WebInspector.RemoteObject}
 */
WebInspector.ScopeRemoteObject.fromPayload = function(payload, scopeRef)
{
    if (scopeRef)
        return new WebInspector.ScopeRemoteObject(payload.objectId, scopeRef, payload.type, payload.subtype, payload.value, payload.description, payload.preview);
    else
        return new WebInspector.RemoteObject(payload.objectId, payload.type, payload.subtype, payload.value, payload.description, payload.preview);
}

WebInspector.ScopeRemoteObject.prototype = {
    /**
     * @param {boolean} ownProperties
     * @param {boolean} accessorPropertiesOnly
     * @param {function(?Array.<!WebInspector.RemoteObjectProperty>, ?Array.<!WebInspector.RemoteObjectProperty>)} callback
     * @override
     */
    doGetProperties: function(ownProperties, accessorPropertiesOnly, callback)
    {
        if (accessorPropertiesOnly) {
            callback([], []);
            return;
        }
        if (this._savedScopeProperties) {
            // No need to reload scope variables, as the remote object never
            // changes its properties. If variable is updated, the properties
            // array is patched locally.
            callback(this._savedScopeProperties.slice(), []);
            return;
        }

        /**
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
         * @param {?Array.<!WebInspector.RemoteObjectProperty>} internalProperties
         * @this {WebInspector.ScopeRemoteObject}
         */
        function wrappedCallback(properties, internalProperties)
        {
            if (this._scopeRef && properties instanceof Array)
                this._savedScopeProperties = properties.slice();
            callback(properties, internalProperties);
        }

        WebInspector.RemoteObject.prototype.doGetProperties.call(this, ownProperties, accessorPropertiesOnly, wrappedCallback.bind(this));
    },

    /**
     * @override
     * @param {!RuntimeAgent.RemoteObject} result
     * @param {string} name
     * @param {function(string=)} callback
     */
    doSetObjectPropertyValue: function(result, name, callback)
    {
        var newValue;

        switch (result.type) {
            case "undefined":
                newValue = {};
                break;
            case "object":
            case "function":
                newValue = { objectId: result.objectId };
                break;
            default:
                newValue = { value: result.value };
        }

        DebuggerAgent.setVariableValue(this._scopeRef.number, name, newValue, this._scopeRef.callFrameId, this._scopeRef.functionId, setVariableValueCallback.bind(this));

        /**
         * @param {?Protocol.Error} error
         * @this {WebInspector.ScopeRemoteObject}
         */
        function setVariableValueCallback(error)
        {
            if (error) {
                callback(error);
                return;
            }
            if (this._savedScopeProperties) {
                for (var i = 0; i < this._savedScopeProperties.length; i++) {
                    if (this._savedScopeProperties[i].name === name)
                        this._savedScopeProperties[i].value = WebInspector.RemoteObject.fromPayload(result);
                }
            }
            callback();
        }
    },

    __proto__: WebInspector.RemoteObject.prototype
};

/**
 * Either callFrameId or functionId (exactly one) must be defined.
 * @constructor
 * @param {number} number
 * @param {string=} callFrameId
 * @param {string=} functionId
 */
WebInspector.ScopeRef = function(number, callFrameId, functionId)
{
    this.number = number;
    this.callFrameId = callFrameId;
    this.functionId = functionId;
}

/**
 * @constructor
 * @param {string} name
 * @param {?WebInspector.RemoteObject} value
 * @param {!RuntimeAgent.PropertyDescriptor=} descriptor
 */
WebInspector.RemoteObjectProperty = function(name, value, descriptor)
{
    this.name = name;
    this.enumerable = descriptor ? !!descriptor.enumerable : true;
    this.writable = descriptor ? !!descriptor.writable : true;

    if (value === null && descriptor) {
        if (descriptor.value)
            this.value = WebInspector.RemoteObject.fromPayload(descriptor.value)
        if (descriptor.get && descriptor.get.type !== "undefined")
            this.getter = WebInspector.RemoteObject.fromPayload(descriptor.get);
        if (descriptor.set && descriptor.set.type !== "undefined")
            this.setter = WebInspector.RemoteObject.fromPayload(descriptor.set);
    } else {
         this.value = value;
    }

    if (descriptor) {
        this.isOwn = descriptor.isOwn;
        this.wasThrown = !!descriptor.wasThrown;
    }
}

WebInspector.RemoteObjectProperty.prototype = {
    /**
     * @return {boolean}
     */
    isAccessorProperty: function()
    {
        return !!(this.getter || this.setter);
    }
};

/**
 * @param {string} name
 * @param {string} value
 * @return {!WebInspector.RemoteObjectProperty}
 */
WebInspector.RemoteObjectProperty.fromPrimitiveValue = function(name, value)
{
    return new WebInspector.RemoteObjectProperty(name, WebInspector.RemoteObject.fromPrimitiveValue(value));
}

/**
 * @param {string} name
 * @param {!WebInspector.RemoteObject} value
 * @return {!WebInspector.RemoteObjectProperty}
 */
WebInspector.RemoteObjectProperty.fromScopeValue = function(name, value)
{
    var result = new WebInspector.RemoteObjectProperty(name, value);
    result.writable = false;
    return result;
}

// The below is a wrapper around a local object that provides an interface comaptible
// with RemoteObject, to be used by the UI code (primarily ObjectPropertiesSection).
// Note that only JSON-compliant objects are currently supported, as there's no provision
// for traversing prototypes, extracting class names via constuctor, handling properties
// or functions.

/**
 * @constructor
 * @extends {WebInspector.RemoteObject}
 * @param {*} value
 */
WebInspector.LocalJSONObject = function(value)
{
    this._value = value;
}

WebInspector.LocalJSONObject.prototype = {
    /**
     * @return {string}
     */
    get description()
    {
        if (this._cachedDescription)
            return this._cachedDescription;

        /**
         * @param {!WebInspector.RemoteObjectProperty} property
         */
        function formatArrayItem(property)
        {
            return property.value.description;
        }

        /**
         * @param {!WebInspector.RemoteObjectProperty} property
         */
        function formatObjectItem(property)
        {
            return property.name + ":" + property.value.description;
        }

        if (this.type === "object") {
            switch (this.subtype) {
            case "array":
                this._cachedDescription = this._concatenate("[", "]", formatArrayItem);
                break;
            case "date":
                this._cachedDescription = "" + this._value;
                break;
            case "null":
                this._cachedDescription = "null";
                break;
            default:
                this._cachedDescription = this._concatenate("{", "}", formatObjectItem);
            }
        } else
            this._cachedDescription = String(this._value);

        return this._cachedDescription;
    },

    /**
     * @param {string} prefix
     * @param {string} suffix
     * @param {function (!WebInspector.RemoteObjectProperty)} formatProperty
     * @return {string}
     */
    _concatenate: function(prefix, suffix, formatProperty)
    {
        const previewChars = 100;

        var buffer = prefix;
        var children = this._children();
        for (var i = 0; i < children.length; ++i) {
            var itemDescription = formatProperty(children[i]);
            if (buffer.length + itemDescription.length > previewChars) {
                buffer += ",\u2026";
                break;
            }
            if (i)
                buffer += ", ";
            buffer += itemDescription;
        }
        buffer += suffix;
        return buffer;
    },

    /**
     * @return {string}
     */
    get type()
    {
        return typeof this._value;
    },

    /**
     * @return {string|undefined}
     */
    get subtype()
    {
        if (this._value === null)
            return "null";

        if (this._value instanceof Array)
            return "array";

        if (this._value instanceof Date)
            return "date";

        return undefined;
    },

    /**
     * @return {boolean}
     */
    get hasChildren()
    {
        if ((typeof this._value !== "object") || (this._value === null))
            return false;
        return !!Object.keys(/** @type {!Object} */ (this._value)).length;
    },

    /**
     * @param {function(!Array.<!WebInspector.RemoteObjectProperty>)} callback
     */
    getOwnProperties: function(callback)
    {
        callback(this._children());
    },

    /**
     * @param {boolean} accessorPropertiesOnly
     * @param {function(!Array.<!WebInspector.RemoteObjectProperty>)} callback
     */
    getAllProperties: function(accessorPropertiesOnly, callback)
    {
        if (accessorPropertiesOnly)
            callback([]);
        else
            callback(this._children());
    },

    /**
     * @return {!Array.<!WebInspector.RemoteObjectProperty>}
     */
    _children: function()
    {
        if (!this.hasChildren)
            return [];
        var value = /** @type {!Object} */ (this._value);

        /**
         * @param {string} propName
         * @this {WebInspector.LocalJSONObject}
         */
        function buildProperty(propName)
        {
            return new WebInspector.RemoteObjectProperty(propName, new WebInspector.LocalJSONObject(this._value[propName]));
        }
        if (!this._cachedChildren)
            this._cachedChildren = Object.keys(value).map(buildProperty.bind(this));
        return this._cachedChildren;
    },

    /**
     * @return {boolean}
     */
    isError: function()
    {
        return false;
    },

    /**
     * @return {number}
     */
    arrayLength: function()
    {
        return this._value instanceof Array ? this._value.length : 0;
    },

    /**
     * @param {function(this:Object, ...)} functionDeclaration
     * @param {!Array.<!RuntimeAgent.CallArgument>=} args
     * @param {function(?WebInspector.RemoteObject, boolean=)=} callback
     */
    callFunction: function(functionDeclaration, args, callback)
    {
        var target = /** @type {?Object} */ (this._value);
        var rawArgs = args ? args.map(function(arg) {return arg.value;}) : [];

        var result;
        var wasThrown = false;
        try {
            result = functionDeclaration.apply(target, rawArgs);
        } catch (e) {
            wasThrown = true;
        }

        if (!callback)
            return;
        callback(WebInspector.RemoteObject.fromLocalObject(result), wasThrown);
    },

    /**
     * @param {function(this:Object)} functionDeclaration
     * @param {!Array.<!RuntimeAgent.CallArgument>|undefined} args
     * @param {function(*)} callback
     */
    callFunctionJSON: function(functionDeclaration, args, callback)
    {
        var target = /** @type {?Object} */ (this._value);
        var rawArgs = args ? args.map(function(arg) {return arg.value;}) : [];

        var result;
        try {
            result = functionDeclaration.apply(target, rawArgs);
        } catch (e) {
            result = null;
        }

        callback(result);
    },

    __proto__: WebInspector.RemoteObject.prototype
}



/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.View = function()
{
    this.element = document.createElement("div");
    this.element.className = "view";
    this.element.__view = this;
    this._visible = true;
    this._isRoot = false;
    this._isShowing = false;
    this._children = [];
    this._hideOnDetach = false;
    this._cssFiles = [];
    this._notificationDepth = 0;
}

WebInspector.View._cssFileToVisibleViewCount = {};
WebInspector.View._cssFileToStyleElement = {};
WebInspector.View._cssUnloadTimeout = 2000;

WebInspector.View.prototype = {
    markAsRoot: function()
    {
        WebInspector.View._assert(!this.element.parentElement, "Attempt to mark as root attached node");
        this._isRoot = true;
    },

    /**
     * @return {?WebInspector.View}
     */
    parentView: function()
    {
        return this._parentView;
    },

    /**
     * @return {boolean}
     */
    isShowing: function()
    {
        return this._isShowing;
    },

    setHideOnDetach: function()
    {
        this._hideOnDetach = true;
    },

    /**
     * @return {boolean}
     */
    _inNotification: function()
    {
        return !!this._notificationDepth || (this._parentView && this._parentView._inNotification());
    },

    _parentIsShowing: function()
    {
        if (this._isRoot)
            return true;
        return this._parentView && this._parentView.isShowing();
    },

    /**
     * @param {function(this:WebInspector.View)} method
     */
    _callOnVisibleChildren: function(method)
    {
        var copy = this._children.slice();
        for (var i = 0; i < copy.length; ++i) {
            if (copy[i]._parentView === this && copy[i]._visible)
                method.call(copy[i]);
        }
    },

    _processWillShow: function()
    {
        this._loadCSSIfNeeded();
        this._callOnVisibleChildren(this._processWillShow);
        this._isShowing = true;
    },

    _processWasShown: function()
    {
        if (this._inNotification())
            return;
        this.restoreScrollPositions();
        this._notify(this.wasShown);
        this._notify(this.onResize);
        this._callOnVisibleChildren(this._processWasShown);
    },

    _processWillHide: function()
    {
        if (this._inNotification())
            return;
        this.storeScrollPositions();

        this._callOnVisibleChildren(this._processWillHide);
        this._notify(this.willHide);
        this._isShowing = false;
    },

    _processWasHidden: function()
    {
        this._disableCSSIfNeeded();
        this._callOnVisibleChildren(this._processWasHidden);
    },

    _processOnResize: function()
    {
        if (this._inNotification())
            return;
        if (!this.isShowing())
            return;
        this._notify(this.onResize);
        this._callOnVisibleChildren(this._processOnResize);
    },

    /**
     * @param {function(this:WebInspector.View)} notification
     */
    _notify: function(notification)
    {
        ++this._notificationDepth;
        try {
            notification.call(this);
        } finally {
            --this._notificationDepth;
        }
    },

    wasShown: function()
    {
    },

    willHide: function()
    {
    },

    onResize: function()
    {
    },

    /**
     * @param {?Element} parentElement
     * @param {!Element=} insertBefore
     */
    show: function(parentElement, insertBefore)
    {
        WebInspector.View._assert(parentElement, "Attempt to attach view with no parent element");

        // Update view hierarchy
        if (this.element.parentElement !== parentElement) {
            if (this.element.parentElement)
                this.detach();

            var currentParent = parentElement;
            while (currentParent && !currentParent.__view)
                currentParent = currentParent.parentElement;

            if (currentParent) {
                this._parentView = currentParent.__view;
                this._parentView._children.push(this);
                this._isRoot = false;
            } else
                WebInspector.View._assert(this._isRoot, "Attempt to attach view to orphan node");
        } else if (this._visible) {
            return;
        }

        this._visible = true;

        if (this._parentIsShowing())
            this._processWillShow();

        this.element.classList.add("visible");

        // Reparent
        if (this.element.parentElement !== parentElement) {
            WebInspector.View._incrementViewCounter(parentElement, this.element);
            if (insertBefore)
                WebInspector.View._originalInsertBefore.call(parentElement, this.element, insertBefore);
            else
                WebInspector.View._originalAppendChild.call(parentElement, this.element);
        }

        if (this._parentIsShowing())
            this._processWasShown();
    },

    /**
     * @param {boolean=} overrideHideOnDetach
     */
    detach: function(overrideHideOnDetach)
    {
        var parentElement = this.element.parentElement;
        if (!parentElement)
            return;

        if (this._parentIsShowing())
            this._processWillHide();

        if (this._hideOnDetach && !overrideHideOnDetach) {
            this.element.classList.remove("visible");
            this._visible = false;
            if (this._parentIsShowing())
                this._processWasHidden();
            return;
        }

        // Force legal removal
        WebInspector.View._decrementViewCounter(parentElement, this.element);
        WebInspector.View._originalRemoveChild.call(parentElement, this.element);

        this._visible = false;
        if (this._parentIsShowing())
            this._processWasHidden();

        // Update view hierarchy
        if (this._parentView) {
            var childIndex = this._parentView._children.indexOf(this);
            WebInspector.View._assert(childIndex >= 0, "Attempt to remove non-child view");
            this._parentView._children.splice(childIndex, 1);
            this._parentView = null;
        } else
            WebInspector.View._assert(this._isRoot, "Removing non-root view from DOM");
    },

    detachChildViews: function()
    {
        var children = this._children.slice();
        for (var i = 0; i < children.length; ++i)
            children[i].detach();
    },

    /**
     * @return {!Array.<!Element>}
     */
    elementsToRestoreScrollPositionsFor: function()
    {
        return [this.element];
    },

    storeScrollPositions: function()
    {
        var elements = this.elementsToRestoreScrollPositionsFor();
        for (var i = 0; i < elements.length; ++i) {
            var container = elements[i];
            container._scrollTop = container.scrollTop;
            container._scrollLeft = container.scrollLeft;
        }
    },

    restoreScrollPositions: function()
    {
        var elements = this.elementsToRestoreScrollPositionsFor();
        for (var i = 0; i < elements.length; ++i) {
            var container = elements[i];
            if (container._scrollTop)
                container.scrollTop = container._scrollTop;
            if (container._scrollLeft)
                container.scrollLeft = container._scrollLeft;
        }
    },

    /**
     * @return {boolean}
     */
    canHighlightPosition: function()
    {
        return false;
    },

    /**
     * @param {number} line
     * @param {number=} column
     */
    highlightPosition: function(line, column)
    {
    },

    doResize: function()
    {
        if (!this.isShowing())
            return;
        this._callOnVisibleChildren(this._processOnResize);
    },

    registerRequiredCSS: function(cssFile)
    {
        if (window.flattenImports)
            cssFile = cssFile.split("/").reverse()[0];
        this._cssFiles.push(cssFile);
    },

    _loadCSSIfNeeded: function()
    {
        for (var i = 0; i < this._cssFiles.length; ++i) {
            var cssFile = this._cssFiles[i];

            var viewsWithCSSFile = WebInspector.View._cssFileToVisibleViewCount[cssFile];
            WebInspector.View._cssFileToVisibleViewCount[cssFile] = (viewsWithCSSFile || 0) + 1;
            if (!viewsWithCSSFile)
                this._doLoadCSS(cssFile);
        }
    },

    _doLoadCSS: function(cssFile)
    {
        var styleElement = WebInspector.View._cssFileToStyleElement[cssFile];
        if (styleElement) {
            styleElement.disabled = false;
            return;
        }

        if (window.debugCSS) { /* debugging support */
            styleElement = document.createElement("link");
            styleElement.rel = "stylesheet";
            styleElement.type = "text/css";
            styleElement.href = cssFile;
        } else {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", cssFile, false);
            xhr.send(null);

            styleElement = document.createElement("style");
            styleElement.type = "text/css";
            styleElement.textContent = xhr.responseText + this._buildSourceURL(cssFile);
        }
        document.head.insertBefore(styleElement, document.head.firstChild);

        WebInspector.View._cssFileToStyleElement[cssFile] = styleElement;
    },

    _buildSourceURL: function(cssFile)
    {
        return "\n/*# sourceURL=" + WebInspector.ParsedURL.completeURL(window.location.href, cssFile) + " */";
    },

    _disableCSSIfNeeded: function()
    {
        var scheduleUnload = !!WebInspector.View._cssUnloadTimer;

        for (var i = 0; i < this._cssFiles.length; ++i) {
            var cssFile = this._cssFiles[i];

            if (!--WebInspector.View._cssFileToVisibleViewCount[cssFile])
                scheduleUnload = true;
        }

        function doUnloadCSS()
        {
            delete WebInspector.View._cssUnloadTimer;

            for (cssFile in WebInspector.View._cssFileToVisibleViewCount) {
                if (WebInspector.View._cssFileToVisibleViewCount.hasOwnProperty(cssFile)
                    && !WebInspector.View._cssFileToVisibleViewCount[cssFile])
                    WebInspector.View._cssFileToStyleElement[cssFile].disabled = true;
            }
        }

        if (scheduleUnload) {
            if (WebInspector.View._cssUnloadTimer)
                clearTimeout(WebInspector.View._cssUnloadTimer);

            WebInspector.View._cssUnloadTimer = setTimeout(doUnloadCSS, WebInspector.View._cssUnloadTimeout)
        }
    },

    printViewHierarchy: function()
    {
        var lines = [];
        this._collectViewHierarchy("", lines);
        console.log(lines.join("\n"));
    },

    _collectViewHierarchy: function(prefix, lines)
    {
        lines.push(prefix + "[" + this.element.className + "]" + (this._children.length ? " {" : ""));

        for (var i = 0; i < this._children.length; ++i)
            this._children[i]._collectViewHierarchy(prefix + "    ", lines);

        if (this._children.length)
            lines.push(prefix + "}");
    },

    /**
     * @return {!Element}
     */
    defaultFocusedElement: function()
    {
        return this._defaultFocusedElement || this.element;
    },

    /**
     * @param {!Element} element
     */
    setDefaultFocusedElement: function(element)
    {
        this._defaultFocusedElement = element;
    },

    focus: function()
    {
        var element = this.defaultFocusedElement();
        if (!element || element.isAncestor(document.activeElement))
            return;

        WebInspector.setCurrentFocusElement(element);
    },

    /**
     * @return {!Size}
     */
    measurePreferredSize: function()
    {
        this._loadCSSIfNeeded();
        WebInspector.View._originalAppendChild.call(document.body, this.element);
        this.element.positionAt(0, 0);
        var result = new Size(this.element.offsetWidth, this.element.offsetHeight);
        this.element.positionAt(undefined, undefined);
        WebInspector.View._originalRemoveChild.call(document.body, this.element);
        this._disableCSSIfNeeded();
        return result;
    },

    __proto__: WebInspector.Object.prototype
}

WebInspector.View._originalAppendChild = Element.prototype.appendChild;
WebInspector.View._originalInsertBefore = Element.prototype.insertBefore;
WebInspector.View._originalRemoveChild = Element.prototype.removeChild;
WebInspector.View._originalRemoveChildren = Element.prototype.removeChildren;

WebInspector.View._incrementViewCounter = function(parentElement, childElement)
{
    var count = (childElement.__viewCounter || 0) + (childElement.__view ? 1 : 0);
    if (!count)
        return;

    while (parentElement) {
        parentElement.__viewCounter = (parentElement.__viewCounter || 0) + count;
        parentElement = parentElement.parentElement;
    }
}

WebInspector.View._decrementViewCounter = function(parentElement, childElement)
{
    var count = (childElement.__viewCounter || 0) + (childElement.__view ? 1 : 0);
    if (!count)
        return;

    while (parentElement) {
        parentElement.__viewCounter -= count;
        parentElement = parentElement.parentElement;
    }
}

WebInspector.View._assert = function(condition, message)
{
    if (!condition) {
        console.trace();
        throw new Error(message);
    }
}

/**
 * @constructor
 * @extends {WebInspector.View}
 * @param {function()} resizeCallback
 */
WebInspector.ViewWithResizeCallback = function(resizeCallback)
{
    WebInspector.View.call(this);
    this._resizeCallback = resizeCallback;
}

WebInspector.ViewWithResizeCallback.prototype = {
    onResize: function()
    {
        this._resizeCallback();
    },

    __proto__: WebInspector.View.prototype
}

Element.prototype.appendChild = function(child)
{
    WebInspector.View._assert(!child.__view, "Attempt to add view via regular DOM operation.");
    return WebInspector.View._originalAppendChild.call(this, child);
}

Element.prototype.insertBefore = function(child, anchor)
{
    WebInspector.View._assert(!child.__view, "Attempt to add view via regular DOM operation.");
    return WebInspector.View._originalInsertBefore.call(this, child, anchor);
}


Element.prototype.removeChild = function(child)
{
    WebInspector.View._assert(!child.__viewCounter && !child.__view, "Attempt to remove element containing view via regular DOM operation");
    return WebInspector.View._originalRemoveChild.call(this, child);
}

Element.prototype.removeChildren = function()
{
    WebInspector.View._assert(!this.__viewCounter, "Attempt to remove element containing view via regular DOM operation");
    WebInspector.View._originalRemoveChildren.call(this);
}


/*
 * Copyright (C) 2006, 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2007 Matt Lilek (pewtermoose@gmail.com).
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @param {string} url
 * @return {?WebInspector.Resource}
 */
WebInspector.resourceForURL = function(url)
{
    return WebInspector.resourceTreeModel.resourceForURL(url);
}

/**
 * @param {function(!WebInspector.Resource)} callback
 */
WebInspector.forAllResources = function(callback)
{
     WebInspector.resourceTreeModel.forAllResources(callback);
}

/**
 * @param {string} url
 * @return {string}
 */
WebInspector.displayNameForURL = function(url)
{
    if (!url)
        return "";

    var resource = WebInspector.resourceForURL(url);
    if (resource)
        return resource.displayName;

    var uiSourceCode = WebInspector.workspace.uiSourceCodeForURL(url);
    if (uiSourceCode)
        return uiSourceCode.displayName();

    if (!WebInspector.inspectedPageURL)
        return url.trimURL("");

    var parsedURL = WebInspector.inspectedPageURL.asParsedURL();
    var lastPathComponent = parsedURL ? parsedURL.lastPathComponent : parsedURL;
    var index = WebInspector.inspectedPageURL.indexOf(lastPathComponent);
    if (index !== -1 && index + lastPathComponent.length === WebInspector.inspectedPageURL.length) {
        var baseURL = WebInspector.inspectedPageURL.substring(0, index);
        if (url.startsWith(baseURL))
            return url.substring(index);
    }

    if (!parsedURL)
        return url;

    var displayName = url.trimURL(parsedURL.host);
    return displayName === "/" ? parsedURL.host + "/" : displayName;
}

/**
 * @param {string} string
 * @param {function(string,string,number=,number=):!Node} linkifier
 * @return {!DocumentFragment}
 */
WebInspector.linkifyStringAsFragmentWithCustomLinkifier = function(string, linkifier)
{
    var container = document.createDocumentFragment();
    var linkStringRegEx = /(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\/\/|data:|www\.)[\w$\-_+*'=\|\/\\(){}[\]^%@&#~,:;.!?]{2,}[\w$\-_+*=\|\/\\({^%@&#~]/;
    var lineColumnRegEx = /:(\d+)(:(\d+))?$/;

    while (string) {
        var linkString = linkStringRegEx.exec(string);
        if (!linkString)
            break;

        linkString = linkString[0];
        var linkIndex = string.indexOf(linkString);
        var nonLink = string.substring(0, linkIndex);
        container.appendChild(document.createTextNode(nonLink));

        var title = linkString;
        var realURL = (linkString.startsWith("www.") ? "http://" + linkString : linkString);
        var lineColumnMatch = lineColumnRegEx.exec(realURL);
        var lineNumber;
        var columnNumber;
        if (lineColumnMatch) {
            realURL = realURL.substring(0, realURL.length - lineColumnMatch[0].length);
            lineNumber = parseInt(lineColumnMatch[1], 10);
            // Immediately convert line and column to 0-based numbers.
            lineNumber = isNaN(lineNumber) ? undefined : lineNumber - 1;
            if (typeof(lineColumnMatch[3]) === "string") {
                columnNumber = parseInt(lineColumnMatch[3], 10);
                columnNumber = isNaN(columnNumber) ? undefined : columnNumber - 1;
            }
        }

        var linkNode = linkifier(title, realURL, lineNumber, columnNumber);
        container.appendChild(linkNode);
        string = string.substring(linkIndex + linkString.length, string.length);
    }

    if (string)
        container.appendChild(document.createTextNode(string));

    return container;
}

/**
 * @param {string} string
 * @return {!DocumentFragment}
 */
WebInspector.linkifyStringAsFragment = function(string)
{
    /**
     * @param {string} title
     * @param {string} url
     * @param {number=} lineNumber
     * @param {number=} columnNumber
     * @return {!Node}
     */
    function linkifier(title, url, lineNumber, columnNumber)
    {
        var isExternal = !WebInspector.resourceForURL(url) && !WebInspector.workspace.uiSourceCodeForURL(url);
        var urlNode = WebInspector.linkifyURLAsNode(url, title, undefined, isExternal);
        if (typeof lineNumber !== "undefined") {
            urlNode.lineNumber = lineNumber;
            urlNode.preferredPanel = "sources";
            if (typeof columnNumber !== "undefined")
                urlNode.columnNumber = columnNumber;
        }

        return urlNode;
    }

    return WebInspector.linkifyStringAsFragmentWithCustomLinkifier(string, linkifier);
}

/**
 * @param {string} url
 * @param {string=} linkText
 * @param {string=} classes
 * @param {boolean=} isExternal
 * @param {string=} tooltipText
 * @return {!Element}
 */
WebInspector.linkifyURLAsNode = function(url, linkText, classes, isExternal, tooltipText)
{
    if (!linkText)
        linkText = url;
    classes = (classes ? classes + " " : "");
    classes += isExternal ? "webkit-html-external-link" : "webkit-html-resource-link";

    var a = document.createElement("a");
    a.href = sanitizeHref(url);
    a.className = classes;
    if (typeof tooltipText === "undefined")
        a.title = url;
    else if (typeof tooltipText !== "string" || tooltipText.length)
        a.title = tooltipText;
    a.textContent = linkText.trimMiddle(WebInspector.Linkifier.MaxLengthForDisplayedURLs);
    if (isExternal)
        a.setAttribute("target", "_blank");

    return a;
}

/**
 * @param {string} url
 * @param {number=} lineNumber
 * @return {string}
 */
WebInspector.formatLinkText = function(url, lineNumber)
{
    var text = url ? WebInspector.displayNameForURL(url) : WebInspector.UIString("(program)");
    if (typeof lineNumber === "number")
        text += ":" + (lineNumber + 1);
    return text;
}

/**
 * @param {string} url
 * @param {number=} lineNumber
 * @param {string=} classes
 * @param {string=} tooltipText
 * @return {!Element}
 */
WebInspector.linkifyResourceAsNode = function(url, lineNumber, classes, tooltipText)
{
    var linkText = WebInspector.formatLinkText(url, lineNumber);
    var anchor = WebInspector.linkifyURLAsNode(url, linkText, classes, false, tooltipText);
    anchor.lineNumber = lineNumber;
    return anchor;
}

/**
 * @param {!WebInspector.NetworkRequest} request
 * @return {!Element}
 */
WebInspector.linkifyRequestAsNode = function(request)
{
    var anchor = WebInspector.linkifyURLAsNode(request.url);
    anchor.preferredPanel = "network";
    anchor.requestId  = request.requestId;
    return anchor;
}

/**
 * @param {?string} content
 * @param {string} mimeType
 * @param {boolean} contentEncoded
 * @return {?string}
 */
WebInspector.contentAsDataURL = function(content, mimeType, contentEncoded)
{
    const maxDataUrlSize = 1024 * 1024;
    if (content === null || content.length > maxDataUrlSize)
        return null;

    return "data:" + mimeType + (contentEncoded ? ";base64," : ",") + content;
}



/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @extends {WebInspector.View}
 * @constructor
 */
WebInspector.Panel = function(name)
{
    WebInspector.View.call(this);
    WebInspector.panels[name] = this;

    this.element.classList.add("panel");
    this.element.classList.add(name);
    this._panelName = name;

    this._shortcuts = /** !Object.<number, function(Event=):boolean> */ ({});

    WebInspector.settings[this._sidebarWidthSettingName()] = WebInspector.settings.createSetting(this._sidebarWidthSettingName(), undefined);
}

// Should by in sync with style declarations.
WebInspector.Panel.counterRightMargin = 25;

WebInspector.Panel.prototype = {
    get name()
    {
        return this._panelName;
    },

    reset: function()
    {
    },

    /**
     * @return {!Element}
     */
    defaultFocusedElement: function()
    {
        return this.sidebarTreeElement || this.element;
    },

    /**
     * @return {?WebInspector.SearchableView}
     */
    searchableView: function()
    {
        return null;
    },

    /**
     * @param {string} text
     */
    replaceSelectionWith: function(text)
    {
    },

    /**
     * @param {string} query
     * @param {string} text
     */
    replaceAllWith: function(query, text)
    {
    },

    /**
     * @param {!Element=} parentElement
     * @param {string=} position
     * @param {number=} defaultWidth
     * @param {number=} defaultHeight
     */
    createSidebarView: function(parentElement, position, defaultWidth, defaultHeight)
    {
        if (this.splitView)
            return;

        if (!parentElement)
            parentElement = this.element;

        this.splitView = new WebInspector.SidebarView(position, this._sidebarWidthSettingName(), defaultWidth, defaultHeight);
        this.splitView.show(parentElement);
    },

    /**
     * @param {!Element=} parentElement
     * @param {string=} position
     * @param {number=} defaultWidth
     */
    createSidebarViewWithTree: function(parentElement, position, defaultWidth)
    {
        if (this.splitView)
            return;

        this.createSidebarView(parentElement, position);

        this.sidebarTreeElement = document.createElement("ol");
        this.sidebarTreeElement.className = "sidebar-tree";
        this.splitView.sidebarElement().appendChild(this.sidebarTreeElement);
        this.splitView.sidebarElement().classList.add("sidebar");

        this.sidebarTree = new TreeOutline(this.sidebarTreeElement);
        this.sidebarTree.panel = this;
    },

    _sidebarWidthSettingName: function()
    {
        return this._panelName + "SidebarWidth";
    },

    // Should be implemented by ancestors.

    get statusBarItems()
    {
    },

    statusBarResized: function()
    {
    },

    /**
     * @param {!Element} anchor
     * @return {boolean}
     */
    showAnchorLocation: function(anchor)
    {
        return false;
    },

    /**
     * @return {!Array.<!Element>}
     */
    elementsToRestoreScrollPositionsFor: function()
    {
        return [];
    },

    /**
     * @param {!KeyboardEvent} event
     */
    handleShortcut: function(event)
    {
        var shortcutKey = WebInspector.KeyboardShortcut.makeKeyFromEvent(event);
        var handler = this._shortcuts[shortcutKey];
        if (handler && handler(event)) {
            event.handled = true;
            return;
        }

        var searchableView = this.searchableView();
        if (!searchableView)
            return;

        function handleSearchShortcuts(shortcuts, handler)
        {
            for (var i = 0; i < shortcuts.length; ++i) {
                if (shortcuts[i].key !== shortcutKey)
                    continue;
                return handler.call(searchableView);
            }
            return false;
        }

        if (handleSearchShortcuts(WebInspector.SearchableView.findShortcuts(), searchableView.handleFindShortcut))
            event.handled = true;
        else if (handleSearchShortcuts(WebInspector.SearchableView.cancelSearchShortcuts(), searchableView.handleCancelSearchShortcut))
            event.handled = true;
    },

    /**
     * @param {!Array.<!WebInspector.KeyboardShortcut.Descriptor>} keys
     * @param {function(?Event=):boolean} handler
     */
    registerShortcuts: function(keys, handler)
    {
        for (var i = 0; i < keys.length; ++i)
            this._shortcuts[keys[i].key] = handler;
    },

    __proto__: WebInspector.View.prototype
}

/**
 * @interface
 */
WebInspector.PanelDescriptor = function()
{
}

WebInspector.PanelDescriptor.prototype = {
    /**
     * @return {string}
     */
    name: function() {},

    /**
     * @return {string}
     */
    title: function() {},

    /**
     * @return {!WebInspector.Panel}
     */
    panel: function() {}
}

/**
 * @constructor
 * @param {!WebInspector.ModuleManager.Extension} extension
 * @implements {WebInspector.PanelDescriptor}
 */
WebInspector.ModuleManagerExtensionPanelDescriptor = function(extension)
{
    this._name = extension.descriptor()["name"];
    this._title = WebInspector.UIString(extension.descriptor()["title"]);
    this._extension = extension;
}

WebInspector.ModuleManagerExtensionPanelDescriptor.prototype = {
    /**
     * @return {string}
     */
    name: function()
    {
        return this._name;
    },

    /**
     * @return {string}
     */
    title: function()
    {
        return this._title;
    },

    /**
     * @return {!WebInspector.Panel}
     */
    panel: function()
    {
        return /** @type {!WebInspector.Panel} */ (this._extension.instance());
    }
}


/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.Object}
 */
WebInspector.ConsoleModel = function()
{
    this.messages = [];
    this.warnings = 0;
    this.errors = 0;
    this._interruptRepeatCount = false;
    InspectorBackend.registerConsoleDispatcher(new WebInspector.ConsoleDispatcher(this));
}

WebInspector.ConsoleModel.Events = {
    ConsoleCleared: "console-cleared",
    MessageAdded: "console-message-added",
    RepeatCountUpdated: "repeat-count-updated"
}

WebInspector.ConsoleModel.prototype = {
    enableAgent: function()
    {
        if (WebInspector.settings.monitoringXHREnabled.get())
            ConsoleAgent.setMonitoringXHREnabled(true);

        this._enablingConsole = true;

        /**
         * @this {WebInspector.ConsoleModel}
         */
        function callback()
        {
            delete this._enablingConsole;
        }
        ConsoleAgent.enable(callback.bind(this));
    },

    /**
     * @return {boolean}
     */
    enablingConsole: function()
    {
        return !!this._enablingConsole;
    },

    /**
     * @param {!WebInspector.ConsoleMessage} msg
     * @param {boolean=} isFromBackend
     */
    addMessage: function(msg, isFromBackend)
    {
        if (isFromBackend && WebInspector.SourceMap.hasSourceMapRequestHeader(msg.request()))
            return;

        msg.index = this.messages.length;
        this.messages.push(msg);
        this._incrementErrorWarningCount(msg);

        if (isFromBackend)
            this._previousMessage = msg;

        this._interruptRepeatCount = !isFromBackend;

        this.dispatchEventToListeners(WebInspector.ConsoleModel.Events.MessageAdded, msg);
    },

    /**
     * @param {!WebInspector.ConsoleMessage} msg
     */
    _incrementErrorWarningCount: function(msg)
    {
        switch (msg.level) {
            case WebInspector.ConsoleMessage.MessageLevel.Warning:
                this.warnings += msg.repeatDelta;
                break;
            case WebInspector.ConsoleMessage.MessageLevel.Error:
                this.errors += msg.repeatDelta;
                break;
        }
    },

    requestClearMessages: function()
    {
        ConsoleAgent.clearMessages();
        this.clearMessages();
    },

    clearMessages: function()
    {
        this.dispatchEventToListeners(WebInspector.ConsoleModel.Events.ConsoleCleared);

        this.messages = [];
        delete this._previousMessage;

        this.errors = 0;
        this.warnings = 0;
    },

    /**
     * @param {number} count
     */
    _messageRepeatCountUpdated: function(count)
    {
        var msg = this._previousMessage;
        if (!msg)
            return;

        var prevRepeatCount = msg.totalRepeatCount;

        if (!this._interruptRepeatCount) {
            msg.repeatDelta = count - prevRepeatCount;
            msg.repeatCount = msg.repeatCount + msg.repeatDelta;
            msg.totalRepeatCount = count;
            msg.updateRepeatCount();

            this._incrementErrorWarningCount(msg);
            this.dispatchEventToListeners(WebInspector.ConsoleModel.Events.RepeatCountUpdated, msg);
        } else {
            var msgCopy = msg.clone();
            msgCopy.totalRepeatCount = count;
            msgCopy.repeatCount = (count - prevRepeatCount) || 1;
            msgCopy.repeatDelta = msgCopy.repeatCount;
            this.addMessage(msgCopy, true);
        }
    },

    __proto__: WebInspector.Object.prototype
}

/**
 * @constructor
 * @param {string} source
 * @param {string} level
 * @param {string=} url
 * @param {number=} line
 * @param {number=} column
 * @param {number=} repeatCount
 * @param {!NetworkAgent.RequestId=} requestId
 */
WebInspector.ConsoleMessage = function(source, level, url, line, column, repeatCount, requestId)
{
    this.source = source;
    this.level = level;
    this.url = url || null;
    this.line = line || 0;
    this.column = column || 0;
    this.message = "";

    repeatCount = repeatCount || 1;
    this.repeatCount = repeatCount;
    this.repeatDelta = repeatCount;
    this.totalRepeatCount = repeatCount;
    this._request = requestId ? WebInspector.networkLog.requestForId(requestId) : null;
}

WebInspector.ConsoleMessage.prototype = {
    /**
     * @param {!Node} messageElement
     */
    setMessageElement: function(messageElement)
    {
    },

    /**
     * @return {boolean}
     */
    isErrorOrWarning: function()
    {
        return (this.level === WebInspector.ConsoleMessage.MessageLevel.Warning || this.level === WebInspector.ConsoleMessage.MessageLevel.Error);
    },

    updateRepeatCount: function()
    {
        // Implemented by concrete instances
    },

    /**
     * @return {!WebInspector.ConsoleMessage}
     */
    clone: function()
    {
        throw "Not implemented";
    },

    /**
     * @return {!WebInspector.DebuggerModel.Location}
     */
    location: function()
    {
        throw "Not implemented";
    },

    /**
     * @return {?WebInspector.NetworkRequest}
     */
    request: function()
    {
        return this._request;
    }
}

/**
 * @param {string} source
 * @param {string} level
 * @param {string} message
 * @param {string=} type
 * @param {string=} url
 * @param {number=} line
 * @param {number=} column
 * @param {number=} repeatCount
 * @param {!Array.<!RuntimeAgent.RemoteObject>=} parameters
 * @param {!ConsoleAgent.StackTrace=} stackTrace
 * @param {!NetworkAgent.RequestId=} requestId
 * @param {boolean=} isOutdated
 * @return {!WebInspector.ConsoleMessage}
 */
WebInspector.ConsoleMessage.create = function(source, level, message, type, url, line, column, repeatCount, parameters, stackTrace, requestId, isOutdated)
{
}

// Note: Keep these constants in sync with the ones in Console.h
WebInspector.ConsoleMessage.MessageSource = {
    XML: "xml",
    JS: "javascript",
    Network: "network",
    ConsoleAPI: "console-api",
    Storage: "storage",
    AppCache: "appcache",
    Rendering: "rendering",
    CSS: "css",
    Security: "security",
    Other: "other",
    Deprecation: "deprecation"
}

WebInspector.ConsoleMessage.MessageType = {
    Log: "log",
    Dir: "dir",
    DirXML: "dirxml",
    Table: "table",
    Trace: "trace",
    Clear: "clear",
    StartGroup: "startGroup",
    StartGroupCollapsed: "startGroupCollapsed",
    EndGroup: "endGroup",
    Assert: "assert",
    Result: "result",
    Profile: "profile",
    ProfileEnd: "profileEnd",
    Command: "command"
}

WebInspector.ConsoleMessage.MessageLevel = {
    Log: "log",
    Info: "info",
    Warning: "warning",
    Error: "error",
    Debug: "debug"
}

/**
 * @constructor
 * @implements {ConsoleAgent.Dispatcher}
 * @param {!WebInspector.ConsoleModel} console
 */
WebInspector.ConsoleDispatcher = function(console)
{
    this._console = console;
}

WebInspector.ConsoleDispatcher.prototype = {
    /**
     * @param {!ConsoleAgent.ConsoleMessage} payload
     */
    messageAdded: function(payload)
    {
        var consoleMessage = WebInspector.ConsoleMessage.create(
            payload.source,
            payload.level,
            payload.text,
            payload.type,
            payload.url,
            payload.line,
            payload.column,
            payload.repeatCount,
            payload.parameters,
            payload.stackTrace,
            payload.networkRequestId,
            this._console._enablingConsole);
        this._console.addMessage(consoleMessage, true);
    },

    /**
     * @param {number} count
     */
    messageRepeatCountUpdated: function(count)
    {
        this._console._messageRepeatCountUpdated(count);
    },

    messagesCleared: function()
    {
        if (!WebInspector.settings.preserveConsoleLog.get())
            this._console.clearMessages();
    }
}

/**
 * @type {!WebInspector.ConsoleModel}
 */
WebInspector.console;



/*
 * Copyright (C) 2011 Google Inc.  All rights reserved.
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.ConsoleMessage}
 *
 * @param {string} source
 * @param {string} level
 * @param {string} message
 * @param {!WebInspector.Linkifier} linkifier
 * @param {string=} type
 * @param {string=} url
 * @param {number=} line
 * @param {number=} column
 * @param {number=} repeatCount
 * @param {!Array.<!RuntimeAgent.RemoteObject>=} parameters
 * @param {!ConsoleAgent.StackTrace=} stackTrace
 * @param {!NetworkAgent.RequestId=} requestId
 * @param {boolean=} isOutdated
 */
WebInspector.ConsoleMessageImpl = function(source, level, message, linkifier, type, url, line, column, repeatCount, parameters, stackTrace, requestId, isOutdated)
{
    WebInspector.ConsoleMessage.call(this, source, level, url, line, column, repeatCount, requestId);

    this._linkifier = linkifier;
    this.type = type || WebInspector.ConsoleMessage.MessageType.Log;
    this._messageText = message;
    this._parameters = parameters;
    this._stackTrace = stackTrace;
    this._isOutdated = isOutdated;
    /** @type {!Array.<!WebInspector.DataGrid>} */
    this._dataGrids = [];
    /** @type {!Map.<!WebInspector.DataGrid, ?Element>} */
    this._dataGridParents = new Map();

    this._customFormatters = {
        "object": this._formatParameterAsObject,
        "array":  this._formatParameterAsArray,
        "node":   this._formatParameterAsNode,
        "string": this._formatParameterAsString
    };
}

WebInspector.ConsoleMessageImpl.prototype = {
    wasShown: function()
    {
        for (var i = 0; this._dataGrids && i < this._dataGrids.length; ++i) {
            var dataGrid = this._dataGrids[i];
            var parentElement = this._dataGridParents.get(dataGrid) || null;
            dataGrid.show(parentElement);
            dataGrid.updateWidths();
        }
    },

    willHide: function()
    {
        for (var i = 0; this._dataGrids && i < this._dataGrids.length; ++i) {
            var dataGrid = this._dataGrids[i];
            this._dataGridParents.put(dataGrid, dataGrid.element.parentElement);
            dataGrid.detach();
        }
    },

    /**
     * @override
     * @param {!Node} messageElement
     */
    setMessageElement: function(messageElement)
    {
        this._messageElement = messageElement;
    },

    _formatMessage: function()
    {
        this._formattedMessage = document.createElement("span");
        this._formattedMessage.className = "console-message-text source-code";

        if (!this._messageElement) {
            if (this.source === WebInspector.ConsoleMessage.MessageSource.ConsoleAPI) {
                switch (this.type) {
                    case WebInspector.ConsoleMessage.MessageType.Trace:
                        this._messageElement = this._format(this._parameters || ["console.trace()"]);
                        break;
                    case WebInspector.ConsoleMessage.MessageType.Clear:
                        this._messageElement = document.createTextNode(WebInspector.UIString("Console was cleared"));
                        this._formattedMessage.classList.add("console-info");
                        break;
                    case WebInspector.ConsoleMessage.MessageType.Assert:
                        var args = [WebInspector.UIString("Assertion failed:")];
                        if (this._parameters)
                            args = args.concat(this._parameters);
                        this._messageElement = this._format(args);
                        break;
                    case WebInspector.ConsoleMessage.MessageType.Dir:
                        var obj = this._parameters ? this._parameters[0] : undefined;
                        var args = ["%O", obj];
                        this._messageElement = this._format(args);
                        break;
                    case WebInspector.ConsoleMessage.MessageType.Profile:
                    case WebInspector.ConsoleMessage.MessageType.ProfileEnd:
                        console.assert(false);
                        break;
                    default:
                        var args = this._parameters || [this._messageText];
                        this._messageElement = this._format(args);
                }
            } else if (this.source === WebInspector.ConsoleMessage.MessageSource.Network) {
                if (this._request) {
                    this._stackTrace = this._request.initiator.stackTrace;
                    if (this._request.initiator && this._request.initiator.url) {
                        this.url = this._request.initiator.url;
                        this.line = this._request.initiator.lineNumber;
                    }
                    this._messageElement = document.createElement("span");
                    if (this.level === WebInspector.ConsoleMessage.MessageLevel.Error) {
                        this._messageElement.appendChild(document.createTextNode(this._request.requestMethod + " "));
                        this._messageElement.appendChild(WebInspector.linkifyRequestAsNode(this._request));
                        if (this._request.failed)
                            this._messageElement.appendChild(document.createTextNode(" " + this._request.localizedFailDescription));
                        else
                            this._messageElement.appendChild(document.createTextNode(" " + this._request.statusCode + " (" + this._request.statusText + ")"));
                    } else {
                        var fragment = WebInspector.linkifyStringAsFragmentWithCustomLinkifier(this._messageText, WebInspector.linkifyRequestAsNode.bind(null, this._request));
                        this._messageElement.appendChild(fragment);
                    }
                } else {
                    if (this.url) {
                        var isExternal = !WebInspector.resourceForURL(this.url) && !WebInspector.workspace.uiSourceCodeForURL(this.url);
                        this._anchorElement = WebInspector.linkifyURLAsNode(this.url, this.url, "console-message-url", isExternal);
                    }
                    this._messageElement = this._format([this._messageText]);
                }
            } else {
                var args = this._parameters || [this._messageText];
                this._messageElement = this._format(args);
            }
        }

        if (this.source !== WebInspector.ConsoleMessage.MessageSource.Network || this._request) {
            if (this._stackTrace && this._stackTrace.length && this._stackTrace[0].scriptId) {
                this._anchorElement = this._linkifyCallFrame(this._stackTrace[0]);
            } else if (this.url && this.url !== "undefined") {
                this._anchorElement = this._linkifyLocation(this.url, this.line, this.column);
            }
        }

        this._formattedMessage.appendChild(this._messageElement);
        if (this._anchorElement) {
            this._formattedMessage.appendChild(document.createTextNode(" "));
            this._formattedMessage.appendChild(this._anchorElement);
        }

        var dumpStackTrace = !!this._stackTrace && this._stackTrace.length && (this.source === WebInspector.ConsoleMessage.MessageSource.Network || this.level === WebInspector.ConsoleMessage.MessageLevel.Error || this.type === WebInspector.ConsoleMessage.MessageType.Trace);
        if (dumpStackTrace) {
            var ol = document.createElement("ol");
            ol.className = "outline-disclosure";
            var treeOutline = new TreeOutline(ol);

            var content = this._formattedMessage;
            var root = new TreeElement(content, null, true);
            content.treeElementForTest = root;
            treeOutline.appendChild(root);
            if (this.type === WebInspector.ConsoleMessage.MessageType.Trace)
                root.expand();

            this._populateStackTraceTreeElement(root);
            this._formattedMessage = ol;
        }

        // This is used for inline message bubbles in SourceFrames, or other plain-text representations.
        this._message = this._messageElement.textContent;
    },

    /**
     * @return {string}
     */
    get message()
    {
        // force message formatting
        var formattedMessage = this.formattedMessage;
        return this._message;
    },

    /**
     * @return {!Element}
     */
    get formattedMessage()
    {
        if (!this._formattedMessage)
            this._formatMessage();
        return this._formattedMessage;
    },

    /**
     * @param {string} url
     * @param {number} lineNumber
     * @param {number} columnNumber
     * @return {?Element}
     */
    _linkifyLocation: function(url, lineNumber, columnNumber)
    {
        // FIXME(62725): stack trace line/column numbers are one-based.
        lineNumber = lineNumber ? lineNumber - 1 : 0;
        columnNumber = columnNumber ? columnNumber - 1 : 0;
        if (this.source === WebInspector.ConsoleMessage.MessageSource.CSS) {
            var headerIds = WebInspector.cssModel.styleSheetIdsForURL(url);
            var cssLocation = new WebInspector.CSSLocation(url, lineNumber, columnNumber);
            return this._linkifier.linkifyCSSLocation(headerIds[0] || null, cssLocation, "console-message-url");
        }

        return this._linkifier.linkifyLocation(url, lineNumber, columnNumber, "console-message-url");
    },

    /**
     * @param {!ConsoleAgent.CallFrame} callFrame
     * @return {?Element}
     */
    _linkifyCallFrame: function(callFrame)
    {
        // FIXME(62725): stack trace line/column numbers are one-based.
        var lineNumber = callFrame.lineNumber ? callFrame.lineNumber - 1 : 0;
        var columnNumber = callFrame.columnNumber ? callFrame.columnNumber - 1 : 0;
        var rawLocation = new WebInspector.DebuggerModel.Location(callFrame.scriptId, lineNumber, columnNumber);
        return this._linkifier.linkifyRawLocation(rawLocation, "console-message-url");
    },

    /**
     * @return {boolean}
     */
    isErrorOrWarning: function()
    {
        return (this.level === WebInspector.ConsoleMessage.MessageLevel.Warning || this.level === WebInspector.ConsoleMessage.MessageLevel.Error);
    },

    _format: function(parameters)
    {
        // This node is used like a Builder. Values are continually appended onto it.
        var formattedResult = document.createElement("span");
        if (!parameters.length)
            return formattedResult;

        // Formatting code below assumes that parameters are all wrappers whereas frontend console
        // API allows passing arbitrary values as messages (strings, numbers, etc.). Wrap them here.
        for (var i = 0; i < parameters.length; ++i) {
            // FIXME: Only pass runtime wrappers here.
            if (parameters[i] instanceof WebInspector.RemoteObject)
                continue;

            if (typeof parameters[i] === "object")
                parameters[i] = WebInspector.RemoteObject.fromPayload(parameters[i]);
            else
                parameters[i] = WebInspector.RemoteObject.fromPrimitiveValue(parameters[i]);
        }

        // There can be string log and string eval result. We distinguish between them based on message type.
        var shouldFormatMessage = WebInspector.RemoteObject.type(parameters[0]) === "string" && this.type !== WebInspector.ConsoleMessage.MessageType.Result;

        // Multiple parameters with the first being a format string. Save unused substitutions.
        if (shouldFormatMessage) {
            // Multiple parameters with the first being a format string. Save unused substitutions.
            var result = this._formatWithSubstitutionString(parameters[0].description, parameters.slice(1), formattedResult);
            parameters = result.unusedSubstitutions;
            if (parameters.length)
                formattedResult.appendChild(document.createTextNode(" "));
        }

        if (this.type === WebInspector.ConsoleMessage.MessageType.Table) {
            formattedResult.appendChild(this._formatParameterAsTable(parameters));
            return formattedResult;
        }

        // Single parameter, or unused substitutions from above.
        for (var i = 0; i < parameters.length; ++i) {
            // Inline strings when formatting.
            if (shouldFormatMessage && parameters[i].type === "string")
                formattedResult.appendChild(WebInspector.linkifyStringAsFragment(parameters[i].description));
            else
                formattedResult.appendChild(this._formatParameter(parameters[i], false, true));
            if (i < parameters.length - 1)
                formattedResult.appendChild(document.createTextNode(" "));
        }
        return formattedResult;
    },

    /**
     * @param {?Object} output
     * @param {boolean=} forceObjectFormat
     * @param {boolean=} includePreview
     * @return {!Element}
     */
    _formatParameter: function(output, forceObjectFormat, includePreview)
    {
        var type;
        if (forceObjectFormat)
            type = "object";
        else if (output instanceof WebInspector.RemoteObject)
            type = output.subtype || output.type;
        else
            type = typeof output;

        var formatter = this._customFormatters[type];
        if (!formatter) {
            formatter = this._formatParameterAsValue;
            output = output.description;
        }

        var span = document.createElement("span");
        span.className = "console-formatted-" + type + " source-code";
        formatter.call(this, output, span, includePreview);
        return span;
    },

    _formatParameterAsValue: function(val, elem)
    {
        elem.appendChild(document.createTextNode(val));
    },

    /**
     * @param {!WebInspector.RemoteObject} obj
     * @param {!Element} elem
     * @param {boolean} includePreview
     */
    _formatParameterAsObject: function(obj, elem, includePreview)
    {
        this._formatParameterAsArrayOrObject(obj, obj.description || "", elem, includePreview);
    },

    /**
     * @param {!WebInspector.RemoteObject} obj
     * @param {string} description
     * @param {!Element} elem
     * @param {boolean} includePreview
     */
    _formatParameterAsArrayOrObject: function(obj, description, elem, includePreview)
    {
        var titleElement = document.createElement("span");
        if (description)
            titleElement.createTextChild(description);
        if (includePreview && obj.preview) {
            titleElement.classList.add("console-object-preview");
            if (description)
                titleElement.createTextChild(" ");
            var lossless = this._appendObjectPreview(obj, titleElement);
            if (lossless) {
                elem.appendChild(titleElement);
                return;
            }
        }
        var section = new WebInspector.ObjectPropertiesSection(obj, titleElement);
        section.enableContextMenu();
        elem.appendChild(section.element);

        var note = section.titleElement.createChild("span", "object-info-state-note");
        note.title = WebInspector.UIString("Object state below is captured upon first expansion");
    },

    /**
     * @param {!WebInspector.RemoteObject} obj
     * @param {!Element} titleElement
     * @return {boolean} true iff preview captured all information.
     */
    _appendObjectPreview: function(obj, titleElement)
    {
        var preview = obj.preview;
        var isArray = obj.subtype === "array";
        var arrayLength = isArray ? obj.arrayLength() : undefined;
        var properties = preview.properties;

        var elements = [];
        for (var i = 0; i < properties.length; ++i) {
            var property = properties[i];
            var name = property.name;
            elements.push({
                name: name,
                element: this._renderPropertyPreviewOrAccessor(obj, [property])
            });
        }

        this._appendArrayOrObjectPropertyElements(titleElement, elements, preview.overflow, arrayLength);
        return preview.lossless;
    },

    /**
     * @param {!Element} parent
     * @param {!Array.<{name: string, element: !Element}>} propertyElements
     * @param {boolean} overflow
     * @param {number=} arrayLength
     */
    _appendArrayOrObjectPropertyElements: function(parent, propertyElements, overflow, arrayLength)
    {
        const maxFlatArrayLength = 100;

        /**
         * @param {{name: string, element: !Element}} a
         * @param {{name: string, element: !Element}} b
         * @return {number}
         */
        function comparator(a, b)
        {
            var isIndex1 = String.isArrayIndexPropertyName(a.name, arrayLength);
            var isIndex2 = String.isArrayIndexPropertyName(b.name, arrayLength);
            if (isIndex1 && isIndex2)
                return Number(a.name) - Number(b.name);
            if (isIndex1)
                return -1;
            if (isIndex2)
                return 1;
            return 0;
        }

        var isArray = typeof arrayLength === "number";
        if (isArray)
            propertyElements.stableSort(comparator);
        var isFlatArray = isArray && (arrayLength <= maxFlatArrayLength);

        parent.createTextChild(isArray ? "[" : "{");
        var firstElement = true;
        var lastNonEmptyArrayIndex = -1;

        function appendCommaIfNeeded()
        {
            if (firstElement)
                firstElement = false;
            else
                parent.createTextChild(", ");
        }

        /**
         * @param {number=} index
         */
        function appendUndefinedArrayElements(index)
        {
            if (typeof index !== "number")
                return;
            var undefinedRange = index - lastNonEmptyArrayIndex - 1;
            lastNonEmptyArrayIndex = index;
            if (undefinedRange < 1)
                return;
            appendCommaIfNeeded();
            var span = parent.createChild("span", "console-formatted-undefined");
            span.textContent = WebInspector.UIString("undefined × %d", undefinedRange);
        }

        /**
         * @param {string} name
         */
        function appendPropertyName(name)
        {
            if (/^\s|\s$|^$|\n/.test(name))
                name = "\"" + name.replace(/\n/g, "\u21B5") + "\"";
            parent.createChild("span", "name").textContent = name;
            parent.createTextChild(": ");
        }

        for (var i = 0, n = propertyElements.length; i < n; ++i) {
            var name = propertyElements[i].name;
            var element = propertyElements[i].element;
            var isIndex = String.isArrayIndexPropertyName(name, arrayLength);
            var index = isIndex ? Number(name) : 0;

            if (isFlatArray) {
                appendUndefinedArrayElements(isIndex ? index : arrayLength);
                appendCommaIfNeeded();
                if (!isIndex)
                    appendPropertyName(name);
            } else {
                appendCommaIfNeeded();
                if (!isArray || !isIndex || index !== i)
                    appendPropertyName(name);
            }

            parent.appendChild(element);
        }
        if (isFlatArray)
            appendUndefinedArrayElements(arrayLength);

        if (overflow)
            parent.createChild("span").textContent = "\u2026";
        parent.createTextChild(isArray ? "]" : "}");
    },

    /**
     * @param {!WebInspector.RemoteObject} object
     * @param {!Array.<!RuntimeAgent.PropertyPreview>} propertyPath
     * @return {!Element}
     */
    _renderPropertyPreviewOrAccessor: function(object, propertyPath)
    {
        var property = propertyPath.peekLast();
        if (property.type === "accessor")
            return this._formatAsAccessorProperty(object, propertyPath.select("name"), false);
        return this._renderPropertyPreview(property.type, /** @type {string} */ (property.subtype), property.value);
    },

    /**
     * @param {string} type
     * @param {string=} subtype
     * @param {string=} description
     * @return {!Element}
     */
    _renderPropertyPreview: function(type, subtype, description)
    {
        var span = document.createElement("span");
        span.className = "console-formatted-" + type;

        if (type === "function") {
            span.textContent = "function";
            return span;
        }

        if (type === "object" && subtype === "regexp") {
            span.classList.add("console-formatted-string");
            span.textContent = description;
            return span;
        }

        if (type === "object" && subtype === "node" && description) {
            span.classList.add("console-formatted-preview-node");
            WebInspector.DOMPresentationUtils.createSpansForNodeTitle(span, description);
            return span;
        }

        if (type === "string") {
            span.textContent = "\"" + description.replace(/\n/g, "\u21B5") + "\"";
            return span;
        }

        span.textContent = description;
        return span;
    },

    _formatParameterAsNode: function(object, elem)
    {
        /**
         * @param {!DOMAgent.NodeId} nodeId
         * @this {WebInspector.ConsoleMessageImpl}
         */
        function printNode(nodeId)
        {
            if (!nodeId) {
                // Sometimes DOM is loaded after the sync message is being formatted, so we get no
                // nodeId here. So we fall back to object formatting here.
                this._formatParameterAsObject(object, elem, false);
                return;
            }
            var node = WebInspector.domAgent.nodeForId(nodeId);
            var renderer = WebInspector.moduleManager.instance(WebInspector.Renderer, node);
            if (renderer)
                elem.appendChild(renderer.render(node));
            else
                console.error("No renderer for node found");
        }
        object.pushNodeToFrontend(printNode.bind(this));
    },

    /**
     * @param {!WebInspector.RemoteObject} array
     * @return {boolean}
     */
    useArrayPreviewInFormatter: function(array)
    {
        return this.type !== WebInspector.ConsoleMessage.MessageType.DirXML && !!array.preview;
    },

    /**
     * @param {!WebInspector.RemoteObject} array
     * @param {!Element} elem
     */
    _formatParameterAsArray: function(array, elem)
    {
        if (this.useArrayPreviewInFormatter(array)) {
            this._formatParameterAsArrayOrObject(array, "", elem, true);
            return;
        }

        const maxFlatArrayLength = 100;
        if (this._isOutdated || array.arrayLength() > maxFlatArrayLength)
            this._formatParameterAsObject(array, elem, false);
        else
            array.getAllProperties(false, this._printArray.bind(this, array, elem));
    },

    /**
     * @param {!Array.<!WebInspector.RemoteObject>} parameters
     * @return {!Element}
     */
    _formatParameterAsTable: function(parameters)
    {
        var element = document.createElement("span");
        var table = parameters[0];
        if (!table || !table.preview)
            return element;

        var columnNames = [];
        var preview = table.preview;
        var rows = [];
        for (var i = 0; i < preview.properties.length; ++i) {
            var rowProperty = preview.properties[i];
            var rowPreview = rowProperty.valuePreview;
            if (!rowPreview)
                continue;

            var rowValue = {};
            const maxColumnsToRender = 20;
            for (var j = 0; j < rowPreview.properties.length; ++j) {
                var cellProperty = rowPreview.properties[j];
                var columnRendered = columnNames.indexOf(cellProperty.name) != -1;
                if (!columnRendered) {
                    if (columnNames.length === maxColumnsToRender)
                        continue;
                    columnRendered = true;
                    columnNames.push(cellProperty.name);
                }

                if (columnRendered) {
                    var cellElement = this._renderPropertyPreviewOrAccessor(table, [rowProperty, cellProperty]);
                    cellElement.classList.add("nowrap-below");
                    rowValue[cellProperty.name] = cellElement;
                }
            }
            rows.push([rowProperty.name, rowValue]);
        }

        var flatValues = [];
        for (var i = 0; i < rows.length; ++i) {
            var rowName = rows[i][0];
            var rowValue = rows[i][1];
            flatValues.push(rowName);
            for (var j = 0; j < columnNames.length; ++j)
                flatValues.push(rowValue[columnNames[j]]);
        }

        if (!flatValues.length)
            return element;
        columnNames.unshift(WebInspector.UIString("(index)"));
        var dataGrid = WebInspector.DataGrid.createSortableDataGrid(columnNames, flatValues);
        dataGrid.renderInline();
        this._dataGrids.push(dataGrid);
        this._dataGridParents.put(dataGrid, element);
        return element;
    },

    _formatParameterAsString: function(output, elem)
    {
        var span = document.createElement("span");
        span.className = "console-formatted-string source-code";
        span.appendChild(WebInspector.linkifyStringAsFragment(output.description));

        // Make black quotes.
        elem.classList.remove("console-formatted-string");
        elem.appendChild(document.createTextNode("\""));
        elem.appendChild(span);
        elem.appendChild(document.createTextNode("\""));
    },

    /**
     * @param {!WebInspector.RemoteObject} array
     * @param {!Element} elem
     * @param {?Array.<!WebInspector.RemoteObjectProperty>} properties
     */
    _printArray: function(array, elem, properties)
    {
        if (!properties) {
            // Fall back to object formatting.
            this._formatParameterAsObject(array, elem, false);
            return;
        }
        const maxNonIndexElements = 5;
        var arrayLength = array.arrayLength();

        var elements = [];
        var nonIndexElements = 0;
        for (var i = 0; i < properties.length; ++i) {
            var property = properties[i];
            var name = property.name;
            if (!String.isArrayIndexPropertyName(name, arrayLength)) {
                if (name === "length" || !property.enumerable)
                    continue;
                if (++nonIndexElements > maxNonIndexElements)
                    continue;
            }
            var element = null;
            if (property.getter)
                element = this._formatAsAccessorProperty(array, [name], true);
            else if (property.value)
                element = this._formatAsArrayEntry(property.value);
            if (element)
                elements.push({ name: name, element: element });
        }

        var overflow = (nonIndexElements > maxNonIndexElements);
        this._appendArrayOrObjectPropertyElements(elem, elements, overflow, arrayLength);
    },

    /**
     * @param {!WebInspector.RemoteObject} output
     * @return {!Element}
     */
    _formatAsArrayEntry: function(output)
    {
        // Prevent infinite expansion of cross-referencing arrays.
        return this._formatParameter(output, output.subtype === "array", false);
    },

    /**
     * @param {!WebInspector.RemoteObject} object
     * @param {!Array.<string>} propertyPath
     * @param {boolean} isArrayEntry
     * @return {!Element}
     */
    _formatAsAccessorProperty: function(object, propertyPath, isArrayEntry)
    {
        var rootElement = WebInspector.ObjectPropertyTreeElement.createRemoteObjectAccessorPropertySpan(object, propertyPath, onInvokeGetterClick.bind(this));

        /**
         * @param {?WebInspector.RemoteObject} result
         * @param {boolean=} wasThrown
         * @this {WebInspector.ConsoleMessageImpl}
         */
        function onInvokeGetterClick(result, wasThrown)
        {
            if (!result)
                return;
            rootElement.removeChildren();
            if (wasThrown) {
                var element = rootElement.createChild("span", "error-message");
                element.textContent = WebInspector.UIString("<exception>");
                element.title = result.description;
            } else if (isArrayEntry) {
                rootElement.appendChild(this._formatAsArrayEntry(result));
            } else {
                // Make a PropertyPreview from the RemoteObject similar to the backend logic.
                const maxLength = 100;
                var type = result.type;
                var subtype = result.subtype;
                var description = "";
                if (type !== "function" && result.description) {
                    if (type === "string" || subtype === "regexp")
                        description = result.description.trimMiddle(maxLength);
                    else
                        description = result.description.trimEnd(maxLength);
                }
                rootElement.appendChild(this._renderPropertyPreview(type, subtype, description));
            }
        }

        return rootElement;
    },

    /**
     * @param {string} format
     * @param {!Array.<string>} parameters
     * @param {!Element} formattedResult
     * @this {WebInspector.ConsoleMessageImpl}
     */
    _formatWithSubstitutionString: function(format, parameters, formattedResult)
    {
        var formatters = {};

        /**
         * @param {boolean} force
         * @param {!Object} obj
         * @return {!Element}
         * @this {WebInspector.ConsoleMessageImpl}
         */
        function parameterFormatter(force, obj)
        {
            return this._formatParameter(obj, force, false);
        }

        function stringFormatter(obj)
        {
            return obj.description;
        }

        function floatFormatter(obj)
        {
            if (typeof obj.value !== "number")
                return "NaN";
            return obj.value;
        }

        function integerFormatter(obj)
        {
            if (typeof obj.value !== "number")
                return "NaN";
            return Math.floor(obj.value);
        }

        function bypassFormatter(obj)
        {
            return (obj instanceof Node) ? obj : "";
        }

        var currentStyle = null;
        function styleFormatter(obj)
        {
            currentStyle = {};
            var buffer = document.createElement("span");
            buffer.setAttribute("style", obj.description);
            for (var i = 0; i < buffer.style.length; i++) {
                var property = buffer.style[i];
                if (isWhitelistedProperty(property))
                    currentStyle[property] = buffer.style[property];
            }
        }

        function isWhitelistedProperty(property)
        {
            var prefixes = ["background", "border", "color", "font", "line", "margin", "padding", "text", "-webkit-background", "-webkit-border", "-webkit-font", "-webkit-margin", "-webkit-padding", "-webkit-text"];
            for (var i = 0; i < prefixes.length; i++) {
                if (property.startsWith(prefixes[i]))
                    return true;
            }
            return false;
        }

        // Firebug uses %o for formatting objects.
        formatters.o = parameterFormatter.bind(this, false);
        formatters.s = stringFormatter;
        formatters.f = floatFormatter;
        // Firebug allows both %i and %d for formatting integers.
        formatters.i = integerFormatter;
        formatters.d = integerFormatter;

        // Firebug uses %c for styling the message.
        formatters.c = styleFormatter;

        // Support %O to force object formatting, instead of the type-based %o formatting.
        formatters.O = parameterFormatter.bind(this, true);

        formatters._ = bypassFormatter;

        function append(a, b)
        {
            if (b instanceof Node)
                a.appendChild(b);
            else if (typeof b !== "undefined") {
                var toAppend = WebInspector.linkifyStringAsFragment(String(b));
                if (currentStyle) {
                    var wrapper = document.createElement('span');
                    for (var key in currentStyle)
                        wrapper.style[key] = currentStyle[key];
                    wrapper.appendChild(toAppend);
                    toAppend = wrapper;
                }
                a.appendChild(toAppend);
            }
            return a;
        }

        // String.format does treat formattedResult like a Builder, result is an object.
        return String.format(format, parameters, formatters, formattedResult, append);
    },

    clearHighlight: function()
    {
        if (!this._formattedMessage)
            return;

        var highlightedMessage = this._formattedMessage;
        delete this._formattedMessage;
        delete this._anchorElement;
        delete this._messageElement;
        this._formatMessage();
        this._element.replaceChild(this._formattedMessage, highlightedMessage);
    },

    highlightSearchResults: function(regexObject)
    {
        if (!this._formattedMessage)
            return;

        this._highlightSearchResultsInElement(regexObject, this._messageElement);
        if (this._anchorElement)
            this._highlightSearchResultsInElement(regexObject, this._anchorElement);

        this._element.scrollIntoViewIfNeeded();
    },

    _highlightSearchResultsInElement: function(regexObject, element)
    {
        regexObject.lastIndex = 0;
        var text = element.textContent;
        var match = regexObject.exec(text);
        var matchRanges = [];
        while (match) {
            matchRanges.push(new WebInspector.SourceRange(match.index, match[0].length));
            match = regexObject.exec(text);
        }
        WebInspector.highlightSearchResults(element, matchRanges);
    },

    /**
     * @return {boolean}
     */
    matchesRegex: function(regexObject)
    {
        regexObject.lastIndex = 0;
        return regexObject.test(this.message) || (!!this._anchorElement && regexObject.test(this._anchorElement.textContent));
    },

    /**
     * @return {!Element}
     */
    toMessageElement: function()
    {
        if (this._element)
            return this._element;

        var element = document.createElement("div");
        element.message = this;
        element.className = "console-message";

        this._element = element;

        switch (this.level) {
        case WebInspector.ConsoleMessage.MessageLevel.Log:
            element.classList.add("console-log-level");
            break;
        case WebInspector.ConsoleMessage.MessageLevel.Debug:
            element.classList.add("console-debug-level");
            break;
        case WebInspector.ConsoleMessage.MessageLevel.Warning:
            element.classList.add("console-warning-level");
            break;
        case WebInspector.ConsoleMessage.MessageLevel.Error:
            element.classList.add("console-error-level");
            break;
        case WebInspector.ConsoleMessage.MessageLevel.Info:
            element.classList.add("console-info-level");
            break;
        }

        if (this.type === WebInspector.ConsoleMessage.MessageType.StartGroup || this.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed)
            element.classList.add("console-group-title");

        element.appendChild(this.formattedMessage);

        if (this.repeatCount > 1)
            this.updateRepeatCount();

        return element;
    },

    _populateStackTraceTreeElement: function(parentTreeElement)
    {
        for (var i = 0; i < this._stackTrace.length; i++) {
            var frame = this._stackTrace[i];

            var content = document.createElementWithClass("div", "stacktrace-entry");
            var messageTextElement = document.createElement("span");
            messageTextElement.className = "console-message-text source-code";
            var functionName = frame.functionName || WebInspector.UIString("(anonymous function)");
            messageTextElement.appendChild(document.createTextNode(functionName));
            content.appendChild(messageTextElement);

            if (frame.scriptId) {
                content.appendChild(document.createTextNode(" "));
                var urlElement = this._linkifyCallFrame(frame);
                if (!urlElement)
                    continue;
                content.appendChild(urlElement);
            }

            var treeElement = new TreeElement(content);
            parentTreeElement.appendChild(treeElement);
        }
    },

    updateRepeatCount: function() {
        if (!this._element)
            return;

        if (!this.repeatCountElement) {
            this.repeatCountElement = document.createElement("span");
            this.repeatCountElement.className = "bubble";

            this._element.insertBefore(this.repeatCountElement, this._element.firstChild);
            this._element.classList.add("repeated-message");
        }
        this.repeatCountElement.textContent = this.repeatCount;
    },

    /**
     * @return {string}
     */
    toString: function()
    {
        var sourceString;
        switch (this.source) {
            case WebInspector.ConsoleMessage.MessageSource.XML:
                sourceString = "XML";
                break;
            case WebInspector.ConsoleMessage.MessageSource.JS:
                sourceString = "JavaScript";
                break;
            case WebInspector.ConsoleMessage.MessageSource.Network:
                sourceString = "Network";
                break;
            case WebInspector.ConsoleMessage.MessageSource.ConsoleAPI:
                sourceString = "ConsoleAPI";
                break;
            case WebInspector.ConsoleMessage.MessageSource.Storage:
                sourceString = "Storage";
                break;
            case WebInspector.ConsoleMessage.MessageSource.AppCache:
                sourceString = "AppCache";
                break;
            case WebInspector.ConsoleMessage.MessageSource.Rendering:
                sourceString = "Rendering";
                break;
            case WebInspector.ConsoleMessage.MessageSource.CSS:
                sourceString = "CSS";
                break;
            case WebInspector.ConsoleMessage.MessageSource.Security:
                sourceString = "Security";
                break;
            case WebInspector.ConsoleMessage.MessageSource.Other:
                sourceString = "Other";
                break;
        }

        var typeString;
        switch (this.type) {
            case WebInspector.ConsoleMessage.MessageType.Log:
                typeString = "Log";
                break;
            case WebInspector.ConsoleMessage.MessageType.Dir:
                typeString = "Dir";
                break;
            case WebInspector.ConsoleMessage.MessageType.DirXML:
                typeString = "Dir XML";
                break;
            case WebInspector.ConsoleMessage.MessageType.Trace:
                typeString = "Trace";
                break;
            case WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed:
            case WebInspector.ConsoleMessage.MessageType.StartGroup:
                typeString = "Start Group";
                break;
            case WebInspector.ConsoleMessage.MessageType.EndGroup:
                typeString = "End Group";
                break;
            case WebInspector.ConsoleMessage.MessageType.Assert:
                typeString = "Assert";
                break;
            case WebInspector.ConsoleMessage.MessageType.Result:
                typeString = "Result";
                break;
            case WebInspector.ConsoleMessage.MessageType.Profile:
            case WebInspector.ConsoleMessage.MessageType.ProfileEnd:
                typeString = "Profiling";
                break;
        }

        var levelString;
        switch (this.level) {
            case WebInspector.ConsoleMessage.MessageLevel.Log:
                levelString = "Log";
                break;
            case WebInspector.ConsoleMessage.MessageLevel.Warning:
                levelString = "Warning";
                break;
            case WebInspector.ConsoleMessage.MessageLevel.Debug:
                levelString = "Debug";
                break;
            case WebInspector.ConsoleMessage.MessageLevel.Error:
                levelString = "Error";
                break;
            case WebInspector.ConsoleMessage.MessageLevel.Info:
                levelString = "Info";
                break;
        }

        return sourceString + " " + typeString + " " + levelString + ": " + this.formattedMessage.textContent + "\n" + this.url + " line " + this.line;
    },

    get text()
    {
        return this._messageText;
    },

    /**
     * @return {?WebInspector.DebuggerModel.Location}
     */
    location: function()
    {
        // FIXME(62725): stack trace line/column numbers are one-based.
        var lineNumber = this.stackTrace ? this.stackTrace[0].lineNumber - 1 : this.line - 1;
        var columnNumber = this.stackTrace && this.stackTrace[0].columnNumber ? this.stackTrace[0].columnNumber - 1 : 0;
        return WebInspector.debuggerModel.createRawLocationByURL(this.url, lineNumber, columnNumber);
    },

    /**
     * @param {?WebInspector.ConsoleMessage} msg
     * @return {boolean}
     */
    isEqual: function(msg)
    {
        if (!msg)
            return false;

        if (this._stackTrace) {
            if (!msg._stackTrace)
                return false;
            var l = this._stackTrace;
            var r = msg._stackTrace;
            if (l.length !== r.length)
                return false;
            for (var i = 0; i < l.length; i++) {
                if (l[i].url !== r[i].url ||
                    l[i].functionName !== r[i].functionName ||
                    l[i].lineNumber !== r[i].lineNumber ||
                    l[i].columnNumber !== r[i].columnNumber)
                    return false;
            }
        }

        return (this.source === msg.source)
            && (this.type === msg.type)
            && (this.level === msg.level)
            && (this.line === msg.line)
            && (this.url === msg.url)
            && (this.message === msg.message)
            && (this._request === msg._request);
    },

    get stackTrace()
    {
        return this._stackTrace;
    },

    /**
     * @return {!WebInspector.ConsoleMessage}
     */
    clone: function()
    {
        return WebInspector.ConsoleMessage.create(this.source, this.level, this._messageText, this.type, this.url, this.line, this.column, this.repeatCount, this._parameters, this._stackTrace, this._request ? this._request.requestId : undefined, this._isOutdated);
    },

    __proto__: WebInspector.ConsoleMessage.prototype
}


/*
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @constructor
 * @extends {WebInspector.Panel}
 */
WebInspector.ConsolePanel = function()
{
    WebInspector.Panel.call(this, "console");
    this._view = WebInspector.consoleView;
}

WebInspector.ConsolePanel.prototype = {
    /**
     * @return {!Element}
     */
    defaultFocusedElement: function()
    {
        return this._view.defaultFocusedElement();
    },

    wasShown: function()
    {
        WebInspector.Panel.prototype.wasShown.call(this);
        this._view.show(this.element);
    },

    willHide: function()
    {
        WebInspector.Panel.prototype.willHide.call(this);
        if (WebInspector.ConsolePanel.WrapperView._instance)
            WebInspector.ConsolePanel.WrapperView._instance._showViewInWrapper();
    },

    __proto__: WebInspector.Panel.prototype
}

/**
 * @constructor
 * @implements {WebInspector.Drawer.ViewFactory}
 */
WebInspector.ConsolePanel.ViewFactory = function()
{
}

WebInspector.ConsolePanel.ViewFactory.prototype = {
    /**
     * @return {!WebInspector.View}
     */
    createView: function()
    {
        if (!WebInspector.ConsolePanel.WrapperView._instance)
            WebInspector.ConsolePanel.WrapperView._instance = new WebInspector.ConsolePanel.WrapperView();
        return WebInspector.ConsolePanel.WrapperView._instance;
    }
}

/**
 * @constructor
 * @extends {WebInspector.View}
 */
WebInspector.ConsolePanel.WrapperView = function()
{
    WebInspector.View.call(this);
    this.element.classList.add("console-view-wrapper");

    this._view = WebInspector.consoleView;
    // FIXME: this won't be needed once drawer becomes a view.
    this.wasShown();
}

WebInspector.ConsolePanel.WrapperView.prototype = {
    wasShown: function()
    {
        if (!WebInspector.inspectorView.currentPanel() || WebInspector.inspectorView.currentPanel().name !== "console")
            this._showViewInWrapper();
    },

    /**
     * @return {!Element}
     */
    defaultFocusedElement: function()
    {
        return this._view.defaultFocusedElement();
    },

    focus: function()
    {
        this._view.focus();
    },

    _showViewInWrapper: function()
    {
        this._view.show(this.element);
    },

    __proto__: WebInspector.View.prototype
}



/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @extends {WebInspector.View}
 * @implements {WebInspector.Searchable}
 * @constructor
 * @param {boolean} hideContextSelector
 */
WebInspector.ConsoleView = function(hideContextSelector)
{
    WebInspector.View.call(this);
    this.registerRequiredCSS("filter.css");

    this._searchableView = new WebInspector.SearchableView(this);
    this._searchableView.setMinimalSearchQuerySize(0);
    this._searchableView.show(this.element);

    this._contentsElement = this._searchableView.element;
    this._contentsElement.classList.add("console-view");
    this._visibleMessagesIndices = [];
    this._urlToMessageCount = {};

    this._clearConsoleButton = new WebInspector.StatusBarButton(WebInspector.UIString("Clear console log."), "clear-status-bar-item");
    this._clearConsoleButton.addEventListener("click", this._requestClearMessages, this);

    this._executionContextSelector = new WebInspector.StatusBarComboBox(this._executionContextChanged.bind(this), "console-context");
    this._topLevelOptionByFrameId = {};
    this._subOptionsByFrameId = {};

    this._filter = new WebInspector.ConsoleViewFilter();
    this._filter.addEventListener(WebInspector.ConsoleViewFilter.Events.FilterChanged, this._updateMessageList.bind(this));

    if (hideContextSelector)
        this._executionContextSelector.element.classList.add("hidden");

    this._filterBar = new WebInspector.FilterBar();

    var statusBarElement = this._contentsElement.createChild("div", "console-status-bar");
    statusBarElement.appendChild(this._clearConsoleButton.element);
    statusBarElement.appendChild(this._filterBar.filterButton().element);
    statusBarElement.appendChild(this._executionContextSelector.element);

    this._filtersContainer = this._contentsElement.createChild("div", "console-filters-header hidden");
    this._filtersContainer.appendChild(this._filterBar.filtersElement());
    this._filterBar.addEventListener(WebInspector.FilterBar.Events.FiltersToggled, this._onFiltersToggled, this);
    this._filter.addFilters(this._filterBar);

    this.messagesElement = document.createElement("div");
    this.messagesElement.id = "console-messages";
    this.messagesElement.className = "monospace";
    this.messagesElement.addEventListener("click", this._messagesClicked.bind(this), true);
    this._contentsElement.appendChild(this.messagesElement);
    this._scrolledToBottom = true;

    this.promptElement = document.createElement("div");
    this.promptElement.id = "console-prompt";
    this.promptElement.className = "source-code";
    this.promptElement.spellcheck = false;
    this.messagesElement.appendChild(this.promptElement);
    this.messagesElement.appendChild(document.createElement("br"));

    this.topGroup = new WebInspector.ConsoleGroup(null);
    this.messagesElement.insertBefore(this.topGroup.element, this.promptElement);
    this.currentGroup = this.topGroup;

    this._registerShortcuts();
    this.registerRequiredCSS("textPrompt.css");

    this.messagesElement.addEventListener("contextmenu", this._handleContextMenuEvent.bind(this), false);

    WebInspector.settings.monitoringXHREnabled.addChangeListener(this._monitoringXHREnabledSettingChanged.bind(this));

    WebInspector.console.addEventListener(WebInspector.ConsoleModel.Events.MessageAdded, this._consoleMessageAdded, this);
    WebInspector.console.addEventListener(WebInspector.ConsoleModel.Events.ConsoleCleared, this._consoleCleared, this);

    this._linkifier = new WebInspector.Linkifier();

    this.prompt = new WebInspector.TextPromptWithHistory(WebInspector.runtimeModel.completionsForTextPrompt.bind(WebInspector.runtimeModel));
    this.prompt.setSuggestBoxEnabled("generic-suggest");
    this.prompt.renderAsBlock();
    this.prompt.attach(this.promptElement);
    this.prompt.proxyElement.addEventListener("keydown", this._promptKeyDown.bind(this), false);
    this.prompt.setHistoryData(WebInspector.settings.consoleHistory.get());

    WebInspector.runtimeModel.contextLists().forEach(this._addFrame, this);
    WebInspector.runtimeModel.addEventListener(WebInspector.RuntimeModel.Events.FrameExecutionContextListAdded, this._frameAdded, this);
    WebInspector.runtimeModel.addEventListener(WebInspector.RuntimeModel.Events.FrameExecutionContextListRemoved, this._frameRemoved, this);

    this._filterStatusMessageElement = document.createElement("div");
    this._filterStatusMessageElement.classList.add("console-message");
    this._filterStatusTextElement = this._filterStatusMessageElement.createChild("span", "console-info");
    this._filterStatusMessageElement.createTextChild(" ");
    var resetFiltersLink = this._filterStatusMessageElement.createChild("span", "console-info node-link");
    resetFiltersLink.textContent = WebInspector.UIString("Show all messages.");
    resetFiltersLink.addEventListener("click", this._filter.reset.bind(this._filter), true);

    this.messagesElement.insertBefore(this._filterStatusMessageElement, this.topGroup.element);

    this._updateFilterStatus();
}

WebInspector.ConsoleView.prototype = {
    /**
     * @return {!Element}
     */
    defaultFocusedElement: function()
    {
        return this.promptElement
    },

    _onFiltersToggled: function(event)
    {
        var toggled = /** @type {boolean} */ (event.data);
        this._filtersContainer.enableStyleClass("hidden", !toggled);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _frameAdded: function(event)
    {
        var contextList = /** @type {!WebInspector.FrameExecutionContextList} */ (event.data);
        this._addFrame(contextList);
    },

    /**
     * @param {!WebInspector.FrameExecutionContextList} contextList
     */
    _addFrame: function(contextList)
    {
        var maxLength = 50;
        var topLevelOption = this._executionContextSelector.createOption(contextList.displayName.trimMiddle(maxLength), contextList.url);
        topLevelOption._executionContext = null;
        this._topLevelOptionByFrameId[contextList.frameId] = topLevelOption;
        this._subOptionsByFrameId[contextList.frameId] = [];

        contextList.addEventListener(WebInspector.FrameExecutionContextList.EventTypes.ContextsUpdated, this._frameUpdated, this);
        contextList.addEventListener(WebInspector.FrameExecutionContextList.EventTypes.ContextAdded, this._contextAdded, this);
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _frameRemoved: function(event)
    {
        var contextList = /** @type {!WebInspector.FrameExecutionContextList} */ (event.data);

        this._removeSubOptions(contextList.frameId);
        var topLevelOption = this._topLevelOptionByFrameId[contextList.frameId];
        this._executionContextSelector.removeOption(topLevelOption);
        delete this._topLevelOptionByFrameId[contextList.frameId];
        delete this._subOptionsByFrameId[contextList.frameId];
        this._executionContextChanged();
    },

    /**
     * @param {string} frameId
     * @return {boolean}
     */
    _removeSubOptions: function(frameId)
    {
        var selectedOptionRemoved = false;
        var subOptions = this._subOptionsByFrameId[frameId];
        for (var i = 0; i < subOptions.length; ++i) {
            selectedOptionRemoved |= this._executionContextSelector.selectedOption() === subOptions[i];
            this._executionContextSelector.removeOption(subOptions[i]);
        }
        this._subOptionsByFrameId[frameId] = [];
        return selectedOptionRemoved;
    },

    _executionContextChanged: function()
    {
        var runtimeContext = WebInspector.runtimeModel.currentExecutionContext();
        if (this._currentExecutionContext() !== runtimeContext)
            WebInspector.runtimeModel.setCurrentExecutionContext(this._currentExecutionContext());
    },

    /**
     * @return {?WebInspector.ExecutionContext}
     */
    _currentExecutionContext: function()
    {
        var option = this._executionContextSelector.selectedOption();
        return option ? option._executionContext : null;
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _frameUpdated: function(event)
    {
        var contextList = /** @type {!WebInspector.FrameExecutionContextList} */ (event.data);
        var option = this._topLevelOptionByFrameId[contextList.frameId];
        var maxLength = 50;
        option.text = contextList.displayName.trimMiddle(maxLength);
        option.title = contextList.url;

        var selectedRemoved = this._removeSubOptions(contextList.frameId);

        if (selectedRemoved) {
            this._executionContextSelector.select(option);
            this._executionContextChanged();
        }
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _contextAdded: function(event)
    {
        var contextList = /** @type {!WebInspector.FrameExecutionContextList} */ (event.data);

        var currentExecutionContext = this._currentExecutionContext();
        var shouldSelectOption = this._removeSubOptions(contextList.frameId);

        var topLevelOption = this._topLevelOptionByFrameId[contextList.frameId];
        var nextTopLevelOption = topLevelOption.nextSibling;
        var subOptions = this._subOptionsByFrameId[contextList.frameId];
        var executionContexts = contextList.executionContexts();
        for (var i = 0; i < executionContexts.length; ++i) {
            if (executionContexts[i].isMainWorldContext) {
                topLevelOption._executionContext = executionContexts[i];
                continue;
            }
            var subOption = document.createElement("option");
            subOption.text = "\u00a0\u00a0\u00a0\u00a0" + executionContexts[i].name;
            subOption._executionContext = executionContexts[i];
            this._executionContextSelector.selectElement().insertBefore(subOption, nextTopLevelOption);
            subOptions.push(subOption);

            if (shouldSelectOption && executionContexts[i] === currentExecutionContext) {
                this._executionContextSelector.select(subOption);
                shouldSelectOption = false;
            }
        }

        if (shouldSelectOption)
            this._executionContextSelector.select(topLevelOption);

        this._executionContextChanged();
    },

    willHide: function()
    {
        this.prompt.hideSuggestBox();
        this.prompt.clearAutoComplete(true);
    },

    wasShown: function()
    {
        if (!this.prompt.isCaretInsidePrompt())
            this.prompt.moveCaretToEndOfPrompt();
    },

    focus: function()
    {
        WebInspector.setCurrentFocusElement(this.promptElement);
        this.prompt.moveCaretToEndOfPrompt();
    },

    storeScrollPositions: function()
    {
        WebInspector.View.prototype.storeScrollPositions.call(this);
        this._scrolledToBottom = this.messagesElement.isScrolledToBottom();
    },

    restoreScrollPositions: function()
    {
        if (this._scrolledToBottom)
            this._immediatelyScrollIntoView();
        else
            WebInspector.View.prototype.restoreScrollPositions.call(this);
    },

    onResize: function()
    {
        this.restoreScrollPositions();
    },

    _isScrollIntoViewScheduled: function()
    {
        return !!this._scrollIntoViewTimer;
    },

    _scheduleScrollIntoView: function()
    {
        if (this._scrollIntoViewTimer)
            return;

        /**
         * @this {WebInspector.ConsoleView}
         */
        function scrollIntoView()
        {
            delete this._scrollIntoViewTimer;
            this.messagesElement.scrollTop = this.messagesElement.scrollHeight - this.messagesElement.clientHeight;
        }
        this._scrollIntoViewTimer = setTimeout(scrollIntoView.bind(this), 20);
    },

    _immediatelyScrollIntoView: function()
    {
        this.promptElement.scrollIntoView(true);
        this._cancelScheduledScrollIntoView();
    },

    _cancelScheduledScrollIntoView: function()
    {
        if (!this._isScrollIntoViewScheduled())
            return;

        clearTimeout(this._scrollIntoViewTimer);
        delete this._scrollIntoViewTimer;
    },

    /**
     * @param {number=} count
     */
    _updateFilterStatus: function(count) {
        count = (typeof count === "undefined") ? (WebInspector.console.messages.length - this._visibleMessagesIndices.length) : count;
        this._filterStatusTextElement.textContent = WebInspector.UIString(count == 1 ? "%d message is hidden by filters." : "%d messages are hidden by filters.", count);
        this._filterStatusMessageElement.style.display = count ? "" : "none";
    },

    /**
     * @param {!WebInspector.Event} event
     */
    _consoleMessageAdded: function(event)
    {
        var message = /** @type {!WebInspector.ConsoleMessage} */ (event.data);
        var index = message.index;

        if (this._urlToMessageCount[message.url])
            this._urlToMessageCount[message.url]++;
        else
            this._urlToMessageCount[message.url] = 1;

        if (this._filter.shouldBeVisible(message))
            this._showConsoleMessage(index);
        else
            this._updateFilterStatus();
    },

    _showConsoleMessage: function(index)
    {
        var message = WebInspector.console.messages[index];

        // this.messagesElement.isScrolledToBottom() is forcing style recalculation.
        // We just skip it if the scroll action has been scheduled.
        if (!this._isScrollIntoViewScheduled() && ((message instanceof WebInspector.ConsoleCommandResult) || this.messagesElement.isScrolledToBottom()))
            this._scheduleScrollIntoView();

        this._visibleMessagesIndices.push(index);

        if (message.type === WebInspector.ConsoleMessage.MessageType.EndGroup) {
            var parentGroup = this.currentGroup.parentGroup;
            if (parentGroup)
                this.currentGroup = parentGroup;
        } else {
            if (message.type === WebInspector.ConsoleMessage.MessageType.StartGroup || message.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed) {
                var group = new WebInspector.ConsoleGroup(this.currentGroup);
                this.currentGroup.messagesElement.appendChild(group.element);
                this.currentGroup = group;
                message.group = group;
            }
            this.currentGroup.addMessage(message);
        }

        if (this._searchRegex && message.matchesRegex(this._searchRegex)) {
            this._searchResultsIndices.push(index);
            this._searchableView.updateSearchMatchesCount(this._searchResultsIndices.length);
        }
    },

    _consoleCleared: function()
    {
        this._scrolledToBottom = true;
        for (var i = 0; i < this._visibleMessagesIndices.length; ++i)
            WebInspector.console.messages[this._visibleMessagesIndices[i]].willHide();
        this._visibleMessagesIndices = [];
        this._searchResultsIndices = [];

        if (this._searchRegex)
            this._searchableView.updateSearchMatchesCount(0);

        this.currentGroup = this.topGroup;
        this.topGroup.messagesElement.removeChildren();

        this._clearCurrentSearchResultHighlight();
        this._updateFilterStatus(0);

        this._linkifier.reset();
    },

    _handleContextMenuEvent: function(event)
    {
        if (event.target.enclosingNodeOrSelfWithNodeName("a"))
            return;

        var contextMenu = new WebInspector.ContextMenu(event);

        function monitoringXHRItemAction()
        {
            WebInspector.settings.monitoringXHREnabled.set(!WebInspector.settings.monitoringXHREnabled.get());
        }
        contextMenu.appendCheckboxItem(WebInspector.UIString("Log XMLHttpRequests"), monitoringXHRItemAction.bind(this), WebInspector.settings.monitoringXHREnabled.get());

        function preserveLogItemAction()
        {
            WebInspector.settings.preserveConsoleLog.set(!WebInspector.settings.preserveConsoleLog.get());
        }
        contextMenu.appendCheckboxItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Preserve log upon navigation" : "Preserve Log upon Navigation"), preserveLogItemAction.bind(this), WebInspector.settings.preserveConsoleLog.get());

        var sourceElement = event.target.enclosingNodeOrSelfWithClass("console-message");

        var filterSubMenu = contextMenu.appendSubMenuItem(WebInspector.UIString("Filter"));

        if (sourceElement && sourceElement.message.url) {
            var menuTitle = WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Hide messages from %s" : "Hide Messages from %s", new WebInspector.ParsedURL(sourceElement.message.url).displayName);
            filterSubMenu.appendItem(menuTitle, this._filter.addMessageURLFilter.bind(this._filter, sourceElement.message.url));
        }

        filterSubMenu.appendSeparator();
        var unhideAll = filterSubMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Unhide all" : "Unhide All"), this._filter.removeMessageURLFilter.bind(this._filter));
        filterSubMenu.appendSeparator();

        var hasFilters = false;

        for (var url in this._filter.messageURLFilters) {
            filterSubMenu.appendCheckboxItem(String.sprintf("%s (%d)", new WebInspector.ParsedURL(url).displayName, this._urlToMessageCount[url]), this._filter.removeMessageURLFilter.bind(this._filter, url), true);
            hasFilters = true;
        }

        filterSubMenu.setEnabled(hasFilters || (sourceElement && sourceElement.message.url));
        unhideAll.setEnabled(hasFilters);

        contextMenu.appendSeparator();
        contextMenu.appendItem(WebInspector.UIString(WebInspector.useLowerCaseMenuTitles() ? "Clear console" : "Clear Console"), this._requestClearMessages.bind(this));

        var request = (sourceElement && sourceElement.message) ? sourceElement.message.request() : null;
        if (request && request.type === WebInspector.resourceTypes.XHR) {
            contextMenu.appendSeparator();
            contextMenu.appendItem(WebInspector.UIString("Replay XHR"), NetworkAgent.replayXHR.bind(null, request.requestId));
        }

        contextMenu.show();
    },

    _updateMessageList: function()
    {
        var group = this.topGroup;
        var sourceMessages = WebInspector.console.messages;
        var visibleMessageIndex = 0;
        var newVisibleMessages = [];

        if (this._searchRegex)
            this._searchResultsIndices = [];

        var anchor = null;
        for (var i = 0; i < sourceMessages.length; ++i) {
            var sourceMessage = sourceMessages[i];
            var visibleMessage = WebInspector.console.messages[this._visibleMessagesIndices[visibleMessageIndex]];

            if (visibleMessage === sourceMessage) {
                if (this._filter.shouldBeVisible(visibleMessage)) {
                    newVisibleMessages.push(this._visibleMessagesIndices[visibleMessageIndex]);

                    if (this._searchRegex && sourceMessage.matchesRegex(this._searchRegex))
                        this._searchResultsIndices.push(i);

                    if (sourceMessage.type === WebInspector.ConsoleMessage.MessageType.EndGroup) {
                        anchor = group.element;
                        group = group.parentGroup || group;
                    } else if (sourceMessage.type === WebInspector.ConsoleMessage.MessageType.StartGroup || sourceMessage.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed) {
                        group = sourceMessage.group;
                        anchor = group.messagesElement.firstChild;
                    } else
                        anchor = visibleMessage.toMessageElement();
                } else {
                    visibleMessage.willHide();
                    visibleMessage.toMessageElement().remove();
                }
                ++visibleMessageIndex;
            } else {
                if (this._filter.shouldBeVisible(sourceMessage)) {

                    if (this._searchRegex && sourceMessage.matchesRegex(this._searchRegex))
                        this._searchResultsIndices.push(i);

                    group.addMessage(sourceMessage, anchor ? anchor.nextSibling : group.messagesElement.firstChild);
                    newVisibleMessages.push(i);
                    anchor = sourceMessage.toMessageElement();
                }
            }
        }

        if (this._searchRegex)
            this._searchableView.updateSearchMatchesCount(this._searchResultsIndices.length);

        this._visibleMessagesIndices = newVisibleMessages;
        this._updateFilterStatus();
    },

    _monitoringXHREnabledSettingChanged: function(event)
    {
        ConsoleAgent.setMonitoringXHREnabled(event.data);
    },

    _messagesClicked: function()
    {
        if (!this.prompt.isCaretInsidePrompt() && window.getSelection().isCollapsed)
            this.prompt.moveCaretToEndOfPrompt();
    },

    _registerShortcuts: function()
    {
        this._shortcuts = {};

        var shortcut = WebInspector.KeyboardShortcut;
        var section = WebInspector.shortcutsScreen.section(WebInspector.UIString("Console"));

        var shortcutL = shortcut.makeDescriptor("l", WebInspector.KeyboardShortcut.Modifiers.Ctrl);
        this._shortcuts[shortcutL.key] = this._requestClearMessages.bind(this);
        var keys = [shortcutL];
        if (WebInspector.isMac()) {
            var shortcutK = shortcut.makeDescriptor("k", WebInspector.KeyboardShortcut.Modifiers.Meta);
            this._shortcuts[shortcutK.key] = this._requestClearMessages.bind(this);
            keys.unshift(shortcutK);
        }
        section.addAlternateKeys(keys, WebInspector.UIString("Clear console"));

        section.addKey(shortcut.makeDescriptor(shortcut.Keys.Tab), WebInspector.UIString("Autocomplete common prefix"));
        section.addKey(shortcut.makeDescriptor(shortcut.Keys.Right), WebInspector.UIString("Accept suggestion"));

        keys = [
            shortcut.makeDescriptor(shortcut.Keys.Down),
            shortcut.makeDescriptor(shortcut.Keys.Up)
        ];
        section.addRelatedKeys(keys, WebInspector.UIString("Next/previous line"));

        if (WebInspector.isMac()) {
            keys = [
                shortcut.makeDescriptor("N", shortcut.Modifiers.Alt),
                shortcut.makeDescriptor("P", shortcut.Modifiers.Alt)
            ];
            section.addRelatedKeys(keys, WebInspector.UIString("Next/previous command"));
        }

        section.addKey(shortcut.makeDescriptor(shortcut.Keys.Enter), WebInspector.UIString("Execute command"));
    },

    _requestClearMessages: function()
    {
        WebInspector.console.requestClearMessages();
    },

    _promptKeyDown: function(event)
    {
        if (isEnterKey(event)) {
            this._enterKeyPressed(event);
            return;
        }

        var shortcut = WebInspector.KeyboardShortcut.makeKeyFromEvent(event);
        var handler = this._shortcuts[shortcut];
        if (handler) {
            handler();
            event.preventDefault();
        }
    },

    /**
     * @param {string} expression
     * @param {boolean} showResultOnly
     */
    evaluateUsingTextPrompt: function(expression, showResultOnly)
    {
        this._appendCommand(expression, this.prompt.text, false, showResultOnly);
    },

    _enterKeyPressed: function(event)
    {
        if (event.altKey || event.ctrlKey || event.shiftKey)
            return;

        event.consume(true);

        this.prompt.clearAutoComplete(true);

        var str = this.prompt.text;
        if (!str.length)
            return;
        this._appendCommand(str, "", true, false);
    },

    /**
     * @param {!WebInspector.RemoteObject} result
     * @param {boolean} wasThrown
     * @param {!WebInspector.ConsoleCommand} originatingCommand
     */
    _printResult: function(result, wasThrown, originatingCommand)
    {
        if (!result)
            return;

        /**
         * @param {string=} url
         * @param {number=} lineNumber
         * @param {number=} columnNumber
         * @this {WebInspector.ConsoleView}
         */
        function addMessage(url, lineNumber, columnNumber)
        {
            var message = new WebInspector.ConsoleCommandResult(result, wasThrown, originatingCommand, this._linkifier, url, lineNumber, columnNumber);
            WebInspector.console.addMessage(message);
        }

        if (result.type !== "function") {
            addMessage.call(this);
            return;
        }

        DebuggerAgent.getFunctionDetails(result.objectId, didGetDetails.bind(this));

        /**
         * @param {?Protocol.Error} error
         * @param {!DebuggerAgent.FunctionDetails} response
         * @this {WebInspector.ConsoleView}
         */
        function didGetDetails(error, response)
        {
            if (error) {
                console.error(error);
                addMessage.call(this);
                return;
            }

            var url;
            var lineNumber;
            var columnNumber;
            var script = WebInspector.debuggerModel.scriptForId(response.location.scriptId);
            if (script && script.sourceURL) {
                url = script.sourceURL;
                lineNumber = response.location.lineNumber + 1;
                columnNumber = response.location.columnNumber + 1;
            }
            addMessage.call(this, url, lineNumber, columnNumber);
        }
    },

    /**
     * @param {string} text
     * @param {string} newPromptText
     * @param {boolean} useCommandLineAPI
     * @param {boolean} showResultOnly
     */
    _appendCommand: function(text, newPromptText, useCommandLineAPI, showResultOnly)
    {
        if (!showResultOnly) {
            var commandMessage = new WebInspector.ConsoleCommand(text);
            WebInspector.console.addMessage(commandMessage);
        }
        this.prompt.text = newPromptText;

        /**
         * @param {?WebInspector.RemoteObject} result
         * @param {boolean} wasThrown
         * @param {?RuntimeAgent.RemoteObject=} valueResult
         * @this {WebInspector.ConsoleView}
         */
        function printResult(result, wasThrown, valueResult)
        {
            if (!result)
                return;

            if (!showResultOnly) {
                this.prompt.pushHistoryItem(text);
                WebInspector.settings.consoleHistory.set(this.prompt.historyData.slice(-30));
            }

            this._printResult(result, wasThrown, commandMessage);
        }
        WebInspector.runtimeModel.evaluate(text, "console", useCommandLineAPI, false, false, true, printResult.bind(this));

        WebInspector.userMetrics.ConsoleEvaluated.record();
    },

    /**
     * @return {!Array.<!Element>}
     */
    elementsToRestoreScrollPositionsFor: function()
    {
        return [this.messagesElement];
    },

    searchCanceled: function()
    {
        this._clearCurrentSearchResultHighlight();
        delete this._searchResultsIndices;
        delete this._searchRegex;
    },

    /**
     * @param {string} query
     * @param {boolean} shouldJump
     */
    performSearch: function(query, shouldJump)
    {
        this.searchCanceled();
        this._searchableView.updateSearchMatchesCount(0);
        this._searchRegex = createPlainTextSearchRegex(query, "gi");

        this._searchResultsIndices = [];
        for (var i = 0; i < this._visibleMessagesIndices.length; i++) {
            if (WebInspector.console.messages[this._visibleMessagesIndices[i]].matchesRegex(this._searchRegex))
                this._searchResultsIndices.push(this._visibleMessagesIndices[i]);
        }
        this._searchableView.updateSearchMatchesCount(this._searchResultsIndices.length);
        this._currentSearchResultIndex = -1;
        if (shouldJump && this._searchResultsIndices.length)
            this._jumpToSearchResult(0);
    },

    jumpToNextSearchResult: function()
    {
        if (!this._searchResultsIndices || !this._searchResultsIndices.length)
            return;
        this._jumpToSearchResult((this._currentSearchResultIndex + 1) % this._searchResultsIndices.length);
    },

    jumpToPreviousSearchResult: function()
    {
        if (!this._searchResultsIndices || !this._searchResultsIndices.length)
            return;
        var index = this._currentSearchResultIndex - 1;
        if (index === -1)
            index = this._searchResultsIndices.length - 1;
        this._jumpToSearchResult(index);
    },

    _clearCurrentSearchResultHighlight: function()
    {
        if (!this._searchResultsIndices)
            return;
        var highlightedMessage = WebInspector.console.messages[this._searchResultsIndices[this._currentSearchResultIndex]];
        if (highlightedMessage)
            highlightedMessage.clearHighlight();
        this._currentSearchResultIndex = -1;
    },

    _jumpToSearchResult: function(index)
    {
        this._clearCurrentSearchResultHighlight();
        this._currentSearchResultIndex = index;
        this._searchableView.updateCurrentMatchIndex(this._currentSearchResultIndex);
        WebInspector.console.messages[this._searchResultsIndices[index]].highlightSearchResults(this._searchRegex);
    },

    __proto__: WebInspector.View.prototype
}

/**
 * @extends {WebInspector.Object}
 * @constructor
 */
WebInspector.ConsoleViewFilter = function()
{
    this._messageURLFilters = WebInspector.settings.messageURLFilters.get();
    this._filterChanged = this.dispatchEventToListeners.bind(this, WebInspector.ConsoleViewFilter.Events.FilterChanged);
};

WebInspector.ConsoleViewFilter.Events = {
    FilterChanged: "FilterChanged"
};

WebInspector.ConsoleViewFilter.prototype = {
    addFilters: function(filterBar)
    {
        this._textFilterUI = new WebInspector.TextFilterUI(true);
        this._textFilterUI.addEventListener(WebInspector.FilterUI.Events.FilterChanged, this._textFilterChanged, this);
        filterBar.addFilter(this._textFilterUI);

        this._levelFilterUI = new WebInspector.NamedBitSetFilterUI();
        this._levelFilterUI.addBit("error", WebInspector.UIString("Errors"));
        this._levelFilterUI.addBit("warning", WebInspector.UIString("Warnings"));
        this._levelFilterUI.addBit("info", WebInspector.UIString("Info"));
        this._levelFilterUI.addBit("log", WebInspector.UIString("Logs"));
        this._levelFilterUI.addBit("debug", WebInspector.UIString("Debug"));
        this._levelFilterUI.bindSetting(WebInspector.settings.messageLevelFilters);
        this._levelFilterUI.addEventListener(WebInspector.FilterUI.Events.FilterChanged, this._filterChanged, this);
        filterBar.addFilter(this._levelFilterUI);
    },

    _textFilterChanged: function(event)
    {
        this._filterRegex = this._textFilterUI.regex();

        this._filterChanged();
    },

    /**
     * @param {string} url
     */
    addMessageURLFilter: function(url)
    {
        this._messageURLFilters[url] = true;
        WebInspector.settings.messageURLFilters.set(this._messageURLFilters);
        this._filterChanged();
    },

    /**
     * @param {string} url
     */
    removeMessageURLFilter: function(url)
    {
        if (!url)
            this._messageURLFilters = {};
        else
            delete this._messageURLFilters[url];

        WebInspector.settings.messageURLFilters.set(this._messageURLFilters);
        this._filterChanged();
    },

    /**
     * @returns {!Object}
     */
    get messageURLFilters()
    {
        return this._messageURLFilters;
    },

    /**
     * @param {!WebInspector.ConsoleMessage} message
     * @return {boolean}
     */
    shouldBeVisible: function(message)
    {
        if ((message.type === WebInspector.ConsoleMessage.MessageType.StartGroup || message.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed || message.type === WebInspector.ConsoleMessage.MessageType.EndGroup))
            return true;

        if (message.type === WebInspector.ConsoleMessage.MessageType.Result || message.type === WebInspector.ConsoleMessage.MessageType.Command)
            return true;

        if (message.url && this._messageURLFilters[message.url])
            return false;

        if (message.level && !this._levelFilterUI.accept(message.level))
            return false;

        if (this._filterRegex) {
            this._filterRegex.lastIndex = 0;
            if (!message.matchesRegex(this._filterRegex))
                return false;
        }

        return true;
    },

    reset: function()
    {
        this._messageURLFilters = {};
        WebInspector.settings.messageURLFilters.set(this._messageURLFilters);
        WebInspector.settings.messageLevelFilters.set({});
        this._filterChanged();
    },

    __proto__: WebInspector.Object.prototype
};


/**
 * @constructor
 * @extends {WebInspector.ConsoleMessage}
 */
WebInspector.ConsoleCommand = function(text)
{
    this.text = text;
    this.type = WebInspector.ConsoleMessage.MessageType.Command;
}

WebInspector.ConsoleCommand.prototype = {
    wasShown: function()
    {
    },

    willHide: function()
    {
    },

    clearHighlight: function()
    {
        var highlightedMessage = this._formattedCommand;
        delete this._formattedCommand;
        this._formatCommand();
        this._element.replaceChild(this._formattedCommand, highlightedMessage);
    },

    /**
     * @param {!RegExp} regexObject
     */
    highlightSearchResults: function(regexObject)
    {
        regexObject.lastIndex = 0;
        var match = regexObject.exec(this.text);
        var matchRanges = [];
        while (match) {
            matchRanges.push(new WebInspector.SourceRange(match.index, match[0].length));
            match = regexObject.exec(this.text);
        }
        WebInspector.highlightSearchResults(this._formattedCommand, matchRanges);
        this._element.scrollIntoViewIfNeeded();
    },

    /**
     * @param {!RegExp} regexObject
     * @return {boolean}
     */
    matchesRegex: function(regexObject)
    {
        regexObject.lastIndex = 0;
        return regexObject.test(this.text);
    },

    /**
     * @return {!Element}
     */
    toMessageElement: function()
    {
        if (!this._element) {
            this._element = document.createElement("div");
            this._element.command = this;
            this._element.className = "console-user-command";

            this._formatCommand();
            this._element.appendChild(this._formattedCommand);
        }
        return this._element;
    },

    _formatCommand: function()
    {
        this._formattedCommand = document.createElement("span");
        this._formattedCommand.className = "console-message-text source-code";
        this._formattedCommand.textContent = this.text;
    },

    __proto__: WebInspector.ConsoleMessage.prototype
}

/**
 * @extends {WebInspector.ConsoleMessageImpl}
 * @constructor
 * @param {!WebInspector.RemoteObject} result
 * @param {boolean} wasThrown
 * @param {!WebInspector.ConsoleCommand} originatingCommand
 * @param {!WebInspector.Linkifier} linkifier
 * @param {string=} url
 * @param {number=} lineNumber
 * @param {number=} columnNumber
 */
WebInspector.ConsoleCommandResult = function(result, wasThrown, originatingCommand, linkifier, url, lineNumber, columnNumber)
{
    var level = (wasThrown ? WebInspector.ConsoleMessage.MessageLevel.Error : WebInspector.ConsoleMessage.MessageLevel.Log);
    this.originatingCommand = originatingCommand;
    WebInspector.ConsoleMessageImpl.call(this, WebInspector.ConsoleMessage.MessageSource.JS, level, "", linkifier, WebInspector.ConsoleMessage.MessageType.Result, url, lineNumber, columnNumber, undefined, [result]);
}

WebInspector.ConsoleCommandResult.prototype = {
    /**
     * @override
     * @param {!WebInspector.RemoteObject} array
     * @return {boolean}
     */
    useArrayPreviewInFormatter: function(array)
    {
        return false;
    },

    /**
     * @return {!Element}
     */
    toMessageElement: function()
    {
        var element = WebInspector.ConsoleMessageImpl.prototype.toMessageElement.call(this);
        element.classList.add("console-user-command-result");
        return element;
    },

    __proto__: WebInspector.ConsoleMessageImpl.prototype
}

/**
 * @constructor
 */
WebInspector.ConsoleGroup = function(parentGroup)
{
    this.parentGroup = parentGroup;

    var element = document.createElement("div");
    element.className = "console-group";
    element.group = this;
    this.element = element;

    if (parentGroup) {
        var bracketElement = document.createElement("div");
        bracketElement.className = "console-group-bracket";
        element.appendChild(bracketElement);
    }

    var messagesElement = document.createElement("div");
    messagesElement.className = "console-group-messages";
    element.appendChild(messagesElement);
    this.messagesElement = messagesElement;
}

WebInspector.ConsoleGroup.prototype = {
    /**
     * @param {!WebInspector.ConsoleMessage} message
     * @param {!Node=} node
     */
    addMessage: function(message, node)
    {
        var element = message.toMessageElement();

        if (message.type === WebInspector.ConsoleMessage.MessageType.StartGroup || message.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed) {
            this.messagesElement.parentNode.insertBefore(element, this.messagesElement);
            element.addEventListener("click", this._titleClicked.bind(this), false);
            var groupElement = element.enclosingNodeOrSelfWithClass("console-group");
            if (groupElement && message.type === WebInspector.ConsoleMessage.MessageType.StartGroupCollapsed)
                groupElement.classList.add("collapsed");
        } else {
            this.messagesElement.insertBefore(element, node || null);
            message.wasShown();
        }

        if (element.previousSibling && message.originatingCommand && element.previousSibling.command === message.originatingCommand)
            element.previousSibling.classList.add("console-adjacent-user-command-result");
    },

    _titleClicked: function(event)
    {
        var groupTitleElement = event.target.enclosingNodeOrSelfWithClass("console-group-title");
        if (groupTitleElement) {
            var groupElement = groupTitleElement.enclosingNodeOrSelfWithClass("console-group");
            if (groupElement && !groupElement.classList.toggle("collapsed")) {
                if (groupElement.group) {
                    groupElement.group.wasShown();
                }
            }
            groupTitleElement.scrollIntoViewIfNeeded(true);
        }
        event.consume(true);
    },

    wasShown: function()
    {
        if (this.element.classList.contains("collapsed"))
            return;
        var node = this.messagesElement.firstChild;
        while (node) {
            if (node.classList.contains("console-message") && node.message)
                node.message.wasShown();
            if (node.classList.contains("console-group") && node.group)
                node.group.wasShown();
            node = node.nextSibling;
        }
    }
}

/**
 * @type {!WebInspector.ConsoleView}
 */
WebInspector.consoleView;

WebInspector.ConsoleMessage.create = function(source, level, message, type, url, line, column, repeatCount, parameters, stackTrace, requestId, isOutdated)
{
    return new WebInspector.ConsoleMessageImpl(source, level, message, WebInspector.consoleView._linkifier, type, url, line, column, repeatCount, parameters, stackTrace, requestId, isOutdated);
}


/* ------------------------------------------------------------------------ */
module.exports = WebInspector;
});