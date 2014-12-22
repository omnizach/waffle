waffle = {};

waffle.row = function() {
	var showPartial = false,
		round = function(d) { return Math.round(d); },
		gaps = [{ threshold: 5, size: 0.25 }];

	function my(value) {
		if (!showPartial) {
			value = round(value);
		}
		
		var result = [],
			delta = 0,
			v = 0;
		
		for (var v = 0; v < value; v++) {
			result.push({ x: v+delta, weight: (value-v >= 1 ? 1 : value-v) });
			
			for (var i = gaps.length-1; i >= 0; i--) {
				if ((v+1) % gaps[i].threshold == 0) {
					delta += gaps[i].size;
					break;
				}
			}
		}
		
		return result;
	}
	
	my.showPartial = function(_) {
		if (!arguments.length) return showPartial;
		showPartial = _;
		return my;
	};
	
	my.round = function(_) {
		if (!arguments.length) return round;
		round = _;
		return my;
	};
	
	my.gaps = function(_) {
		if (!arguments.length) return gaps;
		gaps = _;
		return my;
	};
	
	return my;
};
