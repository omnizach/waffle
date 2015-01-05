waffle = {};

waffle.row = function() {
	var round = Math.round,
		offsets = [{ threshold: 1, size: 1 }, 
				   { threshold: 5, size: 1.25 }];

	function my(value) {
		if (typeof(round) == 'function') {
			value = round(value);
		}
		
		var result = [],
			dx = 0;
		
		for (var v = 0; v < value; v++) {
			result.push({ x: dx, weight: (value-v >= 1 ? 1 : value-v) });
			
			for (var i = offsets.length-1; i >= 0; i--) {
				if ((v+1) % offsets[i].threshold == 0) {
					dx += offsets[i].size;
					break;
				}
			}
		}
		
		return result;
	}
	
	my.round = function(_) {
		if (!arguments.length) return round;
		round = _;
		return my;
	};
	
	my.offsets = function(_) {
		if (!arguments.length) return offsets;
		offsets = _;
		return my;
	};
	
	return my;
};

waffle.quantile = function() {
	var round = Math.round,
		sectionSize = [5, 5],
		sectionGap = 0.25,
		quantiles = 100,
		rows = Math.ceil(Math.sqrt(quantiles)),
		columns = rows,
		fillRule = 'square'; // square, section, rows, columns

	function blankResult() {
		var result = [];
		var dx = 0;
		
		for (var i = 0; i < rows; i++) {
			var dy = 0;
			for (var j = 0; j < columns; j++) {
				if (i*rows + j > quantiles)
					break;
			
				result.push({ x: dx, y: dy, i: i, j: j, weight: 0 });

				dy++;

				if ((j+1) % sectionSize[1] == 0) {
					dy += sectionGap;
				}
			}

			dx++;

			if ((i+1) % sectionSize[0] == 0) {
				dx += sectionGap;
			}
		}
		
		return result;
	}
}

waffle.quantile = function() {
	var round = Math.round,
		offsets = [{ threshold: 1, size: 1, axis: 'x' },
				   { threshold: 5, size: 1.25, axis: 'x' },
				   { threshold: 1, size: 1, axis: 'y' },
				   { threshold: 5, size: 1.25, axis: 'y'}],
		quantiles = 100,
		rows = Math.ceil(Math.sqrt(quantiles)),
		columns = rows,
		fillRule = 'square'; // square, section, rows, columns
		
	function blankResult() {
		var result = [];
		var dx = 0;
		
		for (var i = 0; i < rows; i++) {
			var dy = 0;
			for (var j = 0; j < columns; j++) {
				if (i*rows + j > quantiles)
					break;
			
				result.push({ x: dx, y: dy, i: i, j: j, weight: 0 });
				
				for (var k = offsets.length-1; k >= 0; k--) {
					if (offsets[k].axis == 'y' && (j+1) % offsets[k].threshold == 0) {
						dy += offsets[k].size;
						break;				
					}
				}
			}
			
			for (var k = offsets.length-1; k >= 0; k--) {
				if (offsets[k].axis == 'x' && (i+1) % offsets[k].threshold == 0) {
					dx += offsets[k].size;
					break;				
				}
			}
		}
		
		return result;
	}
		
	function fillRows(value) {
		var result = blankResult();
		
		for (k in result) {
			result[k].weight = Math.max(0, Math.min(1, value - (result[k].j*columns+result[k].i)));
		}
		
		return result;
	}
	
	function fillColumns(value) {
		var result = blankResult();
		
		for (k in result) {
			result[k].weight = Math.max(0, Math.min(1, value - (result[k].i*rows+result[k].j)));
		}
		
		return result;
	}
	
	function fillSquare(value) {
		var result = blankResult(),
			sideLength = Math.floor(Math.sqrt(value)),
			remainder = value - sideLength*sideLength,
			ySide = Math.floor(remainder/2),
			xSide = remainder-ySide;
			
		for (k in result) {
			if (result[k].i < sideLength && result[k].j < sideLength)
				result[k].weight = 1;
			else if (result[k].i == sideLength && result[k].j < xSide)
				result[k].weight = Math.min(1, xSide - result[k].j);
			else if (result[k].j == sideLength && result[k].i < ySide)
				result[k].weight = Math.min(1, ySide - result[k].i);
		}
		
		return result;
	}
	
	function fillSection(value) {
		var result = blankResult();
		
		
	}
				   
	function my(value) {
		if (typeof(round) == 'function') {
			value = round(value);
		}
		
		
		if (fillRule == 'rows')
			return fillRows(value);
		
		if (fillRule == 'columns')
			return fillColumns(value);
			
		if (fillRule == 'square')
			return fillSquare(value);
			
		if (fillRule == 'section')
			return fillSection(value);
	}

	my.round = function(_) {
		if (!arguments.length) return round;
		round = _;
		return my;
	};
	
	my.offsets = function(_) {
		if (!arguments.length) return offsets;
		offsets = _;
		return my;
	};
	
	my.quantiles = function(_) {
		if (!arguments.length) return quantiles;
		quantiles = _;
		return my;
	};
	
	my.rows = function(_) {
		if (!arguments.length) return rows;
		rows = _;
		return my;
	};
	
	my.columns = function(_) {
		if (!arguments.length) return columns;
		columns = _;
		return my;
	};
	
	my.fillRule = function(_) {
		if (!arguments.length) return fillRule;
		fillRule = _;
		return my;
	}
	
	return my;
};
