'use strict';
var waffle = (function() {

    var waffle = {};

    waffle.row = function() {
        
        var my = {};
        
        var cellSize = 1,
            padding = null,
            padding_ = [0, 0],
            round = Math.floor,
            round_ = Math.floor,
            roundValue = Math.round,
            segmentPadding = null,
            segmentPadding_ = 0,
            segmentSize = 5;
            
        my.cellSize = function(_) {
            if (!arguments.length) return cellSize;
            cellSize = _;
            return my;
        };
        
        my.padding = function(_) {
            if (!arguments.length) return padding;
            padding = _;
            padding_ = padding === null ? [0, 0] :
                      (Array.isArray(padding) ? padding : [+padding, +padding]);
            return my;
        };
        
        my.round = function(_) {
            if (!arguments.length) return round;
            round = _;
            round_ = round ? round : function(d) { return d; };
            return my;
        };
        
        my.roundValue = function(_) {
            if (!arguments.length) return roundValue;
            roundValue = _;
            return my;
        };
        
        my.segmentPadding = function(_) {
            if (!arguments.length) return segmentPadding;
            segmentPadding = _;
            segmentPadding_ = segmentPadding ? +segmentPadding : 0;
            return my;
        };
        
        my.segmentSize = function(_) {
            if (!arguments.length) return segmentSize;
            segmentSize = _;
            return my;
        };

        my.cells = function (value) {
            if (typeof roundValue == 'function') {
                value = roundValue(value);
            }

            var result = [],
                dx = padding_[0];

            for (var i = 0; i < value; i++) {
                result.push({ x: dx,
                              value: (value - i >= 1 ? 1 : value - i),
                              width: cellSize, height: cellSize });
                dx += padding_[1] + cellSize + padding_[0] +
                      ((i + 1) % segmentSize === 0 ? segmentPadding_ : 0);
            }

            return result;
        }

        return my;
    };

    waffle.quantile = function() {
    
        var my = {};
        
        var roundValue = Math.round,
            round = Math.floor,
            round_ = Math.floor,
            gridSize = [10, 10],
            cx_ = 5,
            cy_ = 5,
            size = [1, 1],
            cellSize = null,
            fillOrder = 'quadrant', // rows, columns, square, quadrant, radial,
                                    // quadrant-center, <comparator>
            padding = null,
            padding_ = [0, 0, 0, 0],
            quadrantPadding = null,
            quadrantPadding_ = [0, 0],
            orient = 'top-left', // top-left, top-right,
                                 // bottom-left, bottom-right
            reverseX_ = false,
            reverseY_ = false;

        var fillOrderProxy = fillOrderQuadrant;

        var fillOrderColumns = function(a, b) {
            return a.i == b.i ? a.j - b.j : a.i - b.i;
        };

        var fillOrderRows = function(a, b) {
            return a.j == b.j ? a.i - b.i : a.j - b.j;
        };

        var fillOrderSquare = function(a, b) {
            return Math.max(a.i, a.j) == Math.max(b.i, b.j) ?
                    Math.min(a.i + 0.5, a.j) - Math.min(b.i + 0.5, b.j) :
                    (Math.max(a.i, a.j) < Math.max(b.i, b.j) ? -1 : 1);
        };

        var quadrant = function(d) {
            return (d.i < cx_ ? 0 : 1) + (d.j < cy_ ? 0 : 2);
        };

        var fillOrderQuadrant = function(a, b) {
            var qa = quadrant(a), qb = quadrant(b);

            if (qa != qb)
                return qa - qb;

            switch (qa) {
                case 0:
                case 3: return fillOrderSquare(a, b);
                case 1: return fillOrderColumns(a, b);
                case 2: return fillOrderRows(a, b);
            }
        };

        var fillOrderRadial = function(a, b) {
            var distance2 = function(d) {
                return Math.pow(d.i - cx_ + 0.51, 2) +
                        Math.pow(d.j - cy_ + 0.52, 2);
            };
            return distance2(a) - distance2(b);
        };

        var fillOrderQuadrantCenter = function(a, b) {
            var qa = quadrant(a), qb = quadrant(b);

            if (qa != qb)
                return qa - qb;

            switch (qa) {
                case 0: return fillOrderSquare({i: gridSize[0] - a.i,
                                                j: gridSize[1] - a.j},
                                               {i: gridSize[0] - b.i,
                                                j: gridSize[1] - b.j});
                case 1: return fillOrderSquare({i: a.i,
                                                j: gridSize[1] - a.j - 1},
                                               {i: b.i,
                                                j: gridSize[1] - b.j - 1});
                case 2: return fillOrderSquare({i: gridSize[0] - a.i - 1,
                                                j: a.j},
                                               {i: gridSize[0] - b.i - 1,
                                                j: b.j});
                case 3: return fillOrderSquare(a, b);
            }
        };

        function cellSize_() {
            if (cellSize !== null) {
                return (Array.isArray(cellSize) ? cellSize :
                        [cellSize, cellSize]).map(round_);
            }

            return [((Array.isArray(size) ? size[0] : size) -
                        (gridSize[0]) * (padding_[1] + padding_[2]) -
                        quadrantPadding_[0]) / gridSize[0],
                    ((Array.isArray(size) ? size[1] : size) -
                        (gridSize[1]) * (padding_[0] + padding_[3]) -
                        quadrantPadding_[1]) / gridSize[1]
                   ].map(round_);
        }

        function size_() {
            var cs = cellSize_();
            return [(cs[0] + round_(padding_[1]) + round_(padding_[2])) *
                        gridSize[0] +
                        round_(quadrantPadding_[0]),
                    (cs[1] + round_(padding_[0]) + round_(padding_[3])) *
                        gridSize[1] +
                        round_(quadrantPadding_[1])
                   ];
        }

        function blankGrid() {
            var result = [],
                cs = cellSize_(),
                s = size_(),
                p = padding_.map(round_),
                q = quadrantPadding_.map(round_);

            var dx = p[1];
            for (var i = 0; i < gridSize[0]; i++) {
                var dy = p[0];
                for (var j = 0; j < gridSize[1]; j++) {
                    result.push({ x: reverseX_ ? s[0] - dx - cs[0] : dx,
                                  y: reverseY_ ? s[1] - dy - cs[1] : dy,
                                  i: i,
                                  j: j,
                                  value: 0,
                                  width: cs[0],
                                  height: cs[1] });
                    dy += p[0] + cs[1] + p[3] + (j == cy_ - 1 ? q[1] : 0);
                }
                dx += p[1] + cs[0] + p[2] + (i == cx_ - 1 ? q[0] : 0);
            }

            return result;
        }
        
        my.roundValue = function(_) {
            if (!arguments.length) return roundValue;
            roundValue = _;
            return my;
        };

        my.round = function(_) {
            if (!arguments.length) return round;
            round = _;
            round_ = round ? round : function(d) { return d; };
            return my;
        };

        my.gridSize = function(_) {
            if (!arguments.length) return gridSize;
            gridSize = _;
            cx_ = gridSize[0] / 2;
            cy_ = gridSize[1] / 2;
            return my;
        };

        my.quantile = function() {
            return gridSize[0] * gridSize[1];
        };

        my.size = function(_) {
            if (!arguments.length) return size_();
            size = _;
            cellSize = null;

            return my;
        };

        my.cellSize = function(_) {
            if (!arguments.length) return cellSize;
            cellSize = _;
            size = null;

            return my;
        };

        my.fillOrder = function(_) {
            if (!arguments.length) return fillOrder;
            fillOrder = _;

            if (typeof fillOrder == 'function') {
                fillOrderProxy = fillOrder;
                return my;
            }

            switch (fillOrder) {
                case 'columns' : fillOrderProxy = fillOrderColumns; break;
                case 'quadrant' : fillOrderProxy = fillOrderQuadrant; break;
                case 'quadrant-center' :
                        fillOrderProxy = fillOrderQuadrantCenter; break;
                case 'radial' : fillOrderProxy = fillOrderRadial; break;
                case 'rows' : fillOrderProxy = fillOrderRows; break;
                case 'square' : fillOrderProxy = fillOrderSquare; break;
            }

            return my;
        };

        my.padding = function(_) {
            if (!arguments.length) return padding;
            padding = _;
            padding_ = padding === null ? [0, 0, 0, 0] :
                (Array.isArray(padding) ? padding :
                    [+padding, +padding, +padding, +padding]);
            return my;
        };

        my.quadrantPadding = function(_) {
            if (!arguments.length) return quadrantPadding;
            quadrantPadding = _;
            quadrantPadding_ = quadrantPadding === null ? [0, 0] :
                (Array.isArray(quadrantPadding) ? quadrantPadding :
                    [+quadrantPadding, +quadrantPadding]);
            return my;
        };

        my.orient = function(_) {
            if (!arguments.length) return orient;
            orient = _;
            reverseX_ = orient.indexOf('right') != -1;
            reverseY_ = orient.indexOf('bottom') != -1;
            return my;
        };

        my.cells = function (value) {
            if (value === null)
                return blankGrid().sort(fillOrderProxy);

            if (typeof roundValue == 'function') {
                value = roundValue(value);
            }

            var result = blankGrid().sort(fillOrderProxy);

            for (var i = 0; i < value; i++) {
                result[i].value = Math.min(value - i, 1);
            }

            return result;
        }

        return my;
    };

    waffle.bar = function() {
        var my = {};
        
        var align = 'left', // left/top, center, right/bottom, outside
            cellSize = 1,
            cellSize_ = [1, 1],
            initialOffset = 0,
            orient = 'horizontal', // horizontal, vertical
            padding = null,
            padding_ = [0, 0, 0, 0],
            round = Math.floor,
            round_ = Math.floor,
            roundValue = Math.round,
            segmentPadding = null,
            segmentPadding_ = [[0, 0]],
            segmentSize = [[5, 5], [10, 10]],
            segmentSize_ = segmentSize,
            width = 5;
        
        my.align = function(_) {
            if (!arguments.length) return align;
            align = _;
            return my;
        };
        
        my.cellSize = function(_) {
            if (!arguments.length) return cellSize;
            cellSize = _;
            cellSize_ = cellSize === null ? 0 :
                (Array.isArray(cellSize) ? cellSize : [+cellSize, +cellSize]);
            return my;
        };
        
        my.initialOffset = function(_) {
            if (!arguments.length) return initialOffset;
            initialOffset = _;
            return my;
        };
        
        my.orient = function(_) {
            if (!arguments.length) return orient;
            orient = _;
            return my;
        };
        
        my.padding = function(_) {
            if (!arguments.length) return padding;
            padding = _;
            padding_ = padding === null ? [0, 0, 0, 0] :
                (Array.isArray(padding) ? padding :
                    [padding, padding, padding, padding]);
            return my;
        };
        
        my.round = function(_) {
            if (!arguments.length) return round;
            round = _;
            round_ = round ? round : function(d) { return d; };
            return my;
        };
        
        my.roundValue = function(_) {
            if (!arguments.length) return roundValue;
            roundValue = _;
            return my;
        };

        my.segmentPadding = function(_) {
            if (!arguments.length) return segmentPadding;
            segmentPadding = _;

            if (!segmentPadding) {
                segmentPadding_ = [[0, 0]];
            } else if (Array.isArray(segmentPadding)) {
                segmentPadding_ = segmentPadding.map(function(d) {
                    return Array.isArray(d) ? d : [+d, +d];
                });
            } else {
                segmentPadding_ = [[+segmentPadding, +segmentPadding]];
            }

            return my;
        };

        my.segmentSize = function(_) {
            if (!arguments.length) return segmentSize;
            segmentSize = _;
            if (!segmentSize) {
                segmentSize_ = [[5, 5], [10, 10]];
            } else if (Array.isArray(segmentSize)) {
                segmentSize_ = segmentSize.map(function(d) {
                    return Array.isArray(d) ? d : [+d, +d];
                });
            } else {
                segmentSize_ = [[+segmentSize, +segmentSize]];
            }

            return my;
        };

        my.width = function(_) {
            if (!arguments.length) return width;
            width = _;
            return my;
        };
        
        my.cells = function (value) {
            var result = [],
                c = cellSize_.map(round_),
                p = padding_.map(round_),
                s = segmentPadding_.map(function(d) { return d.map(round_); }),
                v = (typeof roundValue == 'function' ? 
                        roundValue(value) : value) + initialOffset;

            if (orient == 'vertical') {
                c = [c[1], c[0]];
                p = [p[1], p[0], p[3], p[2]];
                s = s.map(function(d) { return [d[1], d[0]]; });
            }

            var findSegmentPadding = function(offset, idx) {
                for (var k = segmentSize_.length - 1; k >= 0; k--) {
                    if ((offset + 1) % segmentSize_[k][idx] === 0) {
                        return s[Math.min(k, s.length - 1)][idx];
                    }
                }
                return 0;
            };
            
            var ys = [], dy = p[0];
            for (var j = 0; j < width; j++) {
                ys.push(dy);
                dy += p[0] + c[1] + p[3] + findSegmentPadding(j, 1);
            }
            
            if (align == 'right' || align == 'bottom') {
                ys.reverse();
            } else if (align == 'center' || align == 'outside') {
                var midpoint = ys[Math.floor(width/2)]-0.01;
                ys.sort(function(a, b) { 
                    return Math.abs(a-midpoint) - Math.abs(b-midpoint); 
                });
                if (align == 'outside') {
                    ys.reverse();
                }
            }
            
            var dx = p[1];
            for (var i = 0; i < Math.ceil(v / width); i++) {
                for (var j = 0; j < width && i*width+j < v; j++) {
                    result.push({ x: orient == 'vertical' ? ys[j] : dx,
                                  y: orient == 'vertical' ? dx : ys[j],
                                  i: i,
                                  j: j,
                                  value: 1,
                                  width: c[0],
                                  height: c[1] });
                }
                dx += p[1] + c[0] + p[2] + findSegmentPadding(i, 0);
            }
            
            // the last value might be fractional, adjust accordingly
            if (v % 1 > 0) {
                result[result.length - 1].value = v % 1;
            }
            
            // adjust the front if there is an initial offset
            for (var j = 0; j < initialOffset; j++) {
                result.shift();
            }

            return result;
        }

        return my;
    };
    
    waffle.stack = function() {
    
        function my(values) {
        }
        
        return my;
    };
    
    return waffle;

})();
