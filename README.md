# Waffle Chart Visualization Library

Waffle charts are a good way to display data when the items are countable. In particular, this is a better way to
display a proportion (see ``quantile`` below).

## Cell
*To Be Implemented*

Convenience function for creating cells that look good. Not required to be used with the other functions below, but makes some common patterns easier. The default for cell a *rect* element.

## Row
Creates a layout of cells in a single row.

### API

row.**cellSize**(value)

Gets or sets cell size for each cell in the row. ``value`` can be either a number or a list of 2 numbers representing *width* and *height* respectively. If ``value`` is a number, the width and height are set to the same value.

row.**padding**(value)

Gets or sets the padding between cells. ``value`` can be either a number or a list of 2 numbers representing the padding for *left* and *right* sides. If ``value`` is a number, the left and right paddings are set to the same value.

row.**roundValue**(function)

Gets or sets the function used to round the value passed to the ``cells`` function. By default, ``Math.round`` is used so the number of cells is always a whole number. 

If *function* is ``null``, no rounding is performed. In this case, the last cell will have a fractional value, representing the partial remainder of the value.

row.**segmentPadding**(value)

Gets or sets the segment padding between cells. ``value`` can be either a number or a list of 2 numbers representing the padding for *left* and *right* sides. If ``value`` is a number, the left and right padding values are set to the same value.

row.**segmentSize**(value)

Gets or sets the number of cells that represent a segment. Combined with the *segmentPadding* property, cells can be grouped so that a long row can be easily counted.

row.**cells**(value)

Returns a list of *value* cell objects, each with the following properties:

| property   | description |
| ---------- | ----------- |
| ``x``      | The x position of the cell |
| ``value``  | Value of the cell, 1 or the remaining fractional part of value for the last cell. |
| ``width``  | Width of the cell. |
| ``height`` | Height of the cell. |

Using this function, it's straight-forward to plot the cells. For example,

	d3.select('svg#waffle-row')
	  .selectAll('.cell')
      .data(waffle.row().cells(42))
      .enter()
		.append('rect')
		.classed('cell', true)
		.attr('x', function(d) { return d.x; })
		...


## Bar
Creates a layout of cells in a bar made of a constant number of cells across.

### API

bar.**align**(value)

Gets or sets the alignment of the individual rows that make up the bar. Value can be one of: *left*, *top*, *center*, *right*, *bottom*, *outside*. The cells are ordered and placed based on this alignment.

bar.**cellSize**(value)

Gets or sets cell size for each cell in the row. ``value`` can be either a number or a list of 2 numbers representing *width* and *height* respectively. If ``value`` is a number, the width and height are set to the same value.

bar.**initialOffset**(value)

Gets or sets the bar's first row, so that it can be only partially filled. *value* represents the number of cells that should not be included in the first row. This is useful for stacking (see the *stack* function below) several bars together so they fit nicely.

bar.**orient**(value)

Gets or sets the orientation of the bar. *value* can either be *horizontal* (default) or *vertical*.

bar.**padding**(value)

Gets or sets the padding between cells. ``value`` can be either a number or a list of 4 numbers representing the padding for *top*, *left*, *right*, and *bottom* sides. If ``value`` is a number, all 4 padding values are set to the same value.

bar.**segmentPadding**(value)

Gets or sets the segment padding between cells. ``value`` can be either a number or a list of 2 numbers representing the padding for *left* and *top* sides. If ``value`` is a number, the left and right padding values are set to the same value.

bar.**segmentSize**(value)

Gets or sets the number of cells that represent a segment. *value* can be a single number, a pair (list) of numbers or a list of pairs of numbers. If *value* is a single number, *value* is used for both x and y segments. If *value* is a list of 2 numbers, they are used for x and y segments sizes respectively. If *value* is a list of pairs, then the padding is applied at all pairs. This can have the effect of extra padding at major groups. For example, if *value* is ``[[5, 5], [10, 10]]``, then *segmentPadding* is added every 5 (in both directions) and another *segmentPadding* is added each 10. This has the effect of doubling the padding at 10. This ultimately creates groups of 25 cells and larger groups of 100 cells.

Combined with the *segmentPadding* property, cells can be grouped so that squares or rectangles of cells can be easily counted.

bar.**width**(value)

Gets or sets the number of cells wide the bar is.

bar.**cells**(value)

Returns a list of *value* cell objects, each with the following properties:

| property   | description |
| ---------- | ----------- |
| ``x``      | The x position of the cell |
| ``value``  | Value of the cell, 1 or the remaining fractional part of value for the last cell. |
| ``width``  | Width of the cell. |
| ``height`` | Height of the cell. |
| ``i``      | The x index of the cell. |
| ``j``      | The y index of the cell. |

Using this function, it's straight-forward to plot the cells. For example,

	d3.select('svg#waffle-bar')
	  .selectAll('.cell')
      .data(waffle.bar().cells(42))
      .enter()
		.append('rect')
		.classed('cell', true)
		.attr('x', function(d) { return d.x; })
		.attr('y', function(d) { return d.y; })
		...


## Stack
*To Be Implemented*

Creates a stack of multiple bars.

## Quantile
By default, creates a 10x10 square of cells divided into quadrants. This is a convenient way to display a percentage.

### API
*Full API To Be Written*

quantile.**fillOrder**(value)

Gets or sets the order in which the cells are filled. *value* can be one of: *rows*, *columns*, *square*, *quadrant* (default), *radial*, *quadrant-center*, or a custom comparator function.

If *value* is a custom comparator, it is called with the full cell object. A custom compare can use the cell properties as returned by the **cells** function. For example, *rows* uses the *i* and *j* properties:

	var fillOrderRows = function(a, b) {
        return a.j == b.j ? a.i - b.i : a.j - b.j;
    };

