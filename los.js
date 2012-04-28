
var jslos = {

	VISIBLE: 1,
	BLOCKED: 0,
	EMPTY: 9,
	BLOCKER: 8,

	create_matrix: function(width, height) {

		        var matrix = new Array(height);
		        var row;
		        var col;
		        for( row = 0; row < height; row++) {
		                matrix[row] = new Array(width);
				for ( col = 0; col < width; col++){
					matrix[row][col] = this.EMPTY;
				}
		        }

			return matrix;

	},

	calculate_line_of_sight: function(matrix, row, col, rings){
		var los_matrix = this.create_matrix(matrix.length, matrix[0].length);

		// EMPTY LOG
		this.LOG = "";

		// For each ring
		var ring;
		var cell;
		var p;
		var start;
		var stop;
		var range;
		var shadow_array = new Array();
		var visible;

		for ( ring = 1; ring <= rings; ring++){
			var cells = this.number_of_cells(ring);
			range = 360 / cells;

			for ( cell = 1; cell <= cells; cell++ ) {

				p = this.get_cell_position(cell, ring, row, col);

				if ( p.row >= 0 && p.row < matrix.length && p.col >= 0 && p.col < matrix[0].length ){

					start = this.get_start(cell, range);
					stop = this.get_stop(cell, range);
					if ( start < 0 ) {
						visible =  this.is_visible_special(start, stop, shadow_array);
					} else {
						visible =  this.is_visible(start, stop, shadow_array);
					}
					blocking = this.is_blocking(matrix[p.row][p.col]);

					if ( visible === false ) {
						los_matrix[p.row][p.col] = this.BLOCKED;
					} else {
						los_matrix[p.row][p.col] = this.VISIBLE;
					}

					if ( blocking === true ){
						if ( start < 0 ) {
							this.update_arch(360+start,360,shadow_array);
							this.update_arch(0,stop,shadow_array);
						} else {
							this.update_arch(start,stop,shadow_array);
						}
					}

					//this.LOG = this.LOG + "(" + ring + "," + cell + ")    " + start + " - " + stop + " visible:" + visible + " blocking: " + blocking + "<br/>";
					//this.LOG = this.LOG + shadow_array + "<br/><br/>";

				}
			}
		}

		return los_matrix;
	},

	update_arch: function(start, stop, shadow_array){
		var updated = false;
		for ( i = 0; i < shadow_array.length; i = i + 2){
			if ( start >= shadow_array[i] && stop <= shadow_array[i+1] ){
				updated = true;
			}

			if ( start >= shadow_array[i] && start <= shadow_array[i+1] && stop > shadow_array[i+1]  ){
				shadow_array[i+1] = stop;
				updated = true;
			}
			if ( stop >= shadow_array[i] && stop <= shadow_array[i+1] && start < shadow_array[i] ){
				shadow_array[i] = start;
				updated = true;
			}
		}
		if ( updated === false ) {
			shadow_array.push(start);	
			shadow_array.push(stop);	
		}
	},

	is_visible_special: function(start, stop, shadow_array) {
		var visible = true;
		var halfway = false;

		var i = 0;
		for ( i = 0; i < shadow_array.length; i = i + 2){
			if ( 360+start >= shadow_array[i] && 360 <= shadow_array[i+1] ){
				halfway = true;
			}
		}
		if ( halfway === true ){
			for ( i = 0; i < shadow_array.length; i = i + 2){
				if ( 0 >= shadow_array[i] && stop <= shadow_array[i+1] ){
					visible = false;
				}
			}
		}

		return visible;
	},

	is_visible: function(start, stop, shadow_array) {
		var visible = true;
		var i = 0;
		for ( i = 0; i < shadow_array.length; i = i + 2){
			if ( start >= shadow_array[i] && stop <= shadow_array[i+1] ){
				visible = false;
			}
		}

		return visible;
	},

	is_blocking: function(value){
		if ( value === this.BLOCKER ){
			return true;
		} else {
			return false;
		}
	},

	get_start: function(cell, range){
		return ((cell-1)*range)-(range/2);
	},

	get_stop: function(cell, range){
		return (cell*range)-(range/2);
	},

	p: function(row,col){
		return { row: row, col: col };
	},

	get_cell_position: function(cell, ring, startrow, startcol){
		var x = this.CELLPOSITIONS[ring+'-'+cell];
		return this.p(startrow+x.row, startcol+x.col);
	},

	number_of_cells: function(ring){
		return ring * 8;
	},

	load_cells: function(){

		var arr = new Array();

		arr['1-1'] = this.p(-1,0);
		arr['1-2'] = this.p(-1,1);
		arr['1-3'] = this.p(0,1);
		arr['1-4'] = this.p(1,1);
		arr['1-5'] = this.p(1,0);
		arr['1-6'] = this.p(1,-1);
		arr['1-7'] = this.p(0,-1);
		arr['1-8'] = this.p(-1,-1);

		arr['2-1'] = this.p(-2,0);
		arr['2-2'] = this.p(-2,1);
		arr['2-3'] = this.p(-2,2);
		arr['2-4'] = this.p(-1,2);
		arr['2-5'] = this.p(0,2);
		arr['2-6'] = this.p(1,2);
		arr['2-7'] = this.p(2,2);
		arr['2-8'] = this.p(2,1);
		arr['2-9'] = this.p(2,0);
		arr['2-10'] = this.p(2,-1);
		arr['2-11'] = this.p(2,-2);
		arr['2-12'] = this.p(1,-2);
		arr['2-13'] = this.p(0,-2);
		arr['2-14'] = this.p(-1,-2);
		arr['2-15'] = this.p(-2,-2);
		arr['2-16'] = this.p(-2,-1);

		arr['3-1'] = this.p(-3,0);
		arr['3-2'] = this.p(-3,1);
		arr['3-3'] = this.p(-3,2);
		arr['3-4'] = this.p(-3,3);
		arr['3-5'] = this.p(-2,3);
		arr['3-6'] = this.p(-1,3);
		arr['3-7'] = this.p(0,3);
		arr['3-8'] = this.p(1,3);
		arr['3-9'] = this.p(2,3);
		arr['3-10'] = this.p(3,3);
		arr['3-11'] = this.p(3,2);
		arr['3-12'] = this.p(3,1);
		arr['3-13'] = this.p(3,0);
		arr['3-14'] = this.p( 3,-1);
		arr['3-15'] = this.p( 3,-2);
		arr['3-16'] = this.p( 3,-3);
		arr['3-17'] = this.p( 2,-3);
		arr['3-18'] = this.p( 1,-3);
		arr['3-19'] = this.p( 0,-3);
		arr['3-20'] = this.p(-1,-3);
		arr['3-21'] = this.p(-2,-3);
		arr['3-22'] = this.p(-3,-3);
		arr['3-23'] = this.p(-3,-2);
		arr['3-24'] = this.p(-3,-1);

		arr['4-1'] = this.p(-4,0);
		arr['4-2'] = this.p(-4,1);
		arr['4-3'] = this.p(-4,2);
		arr['4-4'] = this.p(-4,3);
		arr['4-5'] = this.p(-4,4);
		arr['4-6'] = this.p(-3,4);
		arr['4-7'] = this.p(-2,4);
		arr['4-8'] = this.p(-1,4);
		arr['4-9'] = this.p(0,4);
		arr['4-10'] = this.p(1,4);
		arr['4-11'] = this.p(2,4);
		arr['4-12'] = this.p(3,4);
		arr['4-13'] = this.p(4,4);
		arr['4-14'] = this.p( 4, 3);
		arr['4-15'] = this.p( 4, 2);
		arr['4-16'] = this.p( 4, 1);
		arr['4-17'] = this.p( 4, 0);
		arr['4-18'] = this.p( 4,-1);
		arr['4-19'] = this.p( 4,-2);
		arr['4-20'] = this.p( 4,-3);
		arr['4-21'] = this.p( 4,-4);
		arr['4-22'] = this.p( 3,-4);
		arr['4-23'] = this.p( 2,-4);
		arr['4-24'] = this.p( 1,-4);
		arr['4-25'] = this.p( 0,-4);
		arr['4-26'] = this.p(-1,-4);
		arr['4-27'] = this.p(-2,-4);
		arr['4-28'] = this.p(-3,-4);
		arr['4-29'] = this.p(-4,-4);
		arr['4-30'] = this.p(-4,-3);
		arr['4-31'] = this.p(-4,-2);
		arr['4-32'] = this.p(-4,-1);

		arr['5-1']  = this.p(-5,0);
		arr['5-2']  = this.p(-5,1);
		arr['5-3']  = this.p(-5,2);
		arr['5-4']  = this.p(-5,3);
		arr['5-5']  = this.p(-5,4);
		arr['5-6']  = this.p(-5,5);
		arr['5-7']  = this.p(-4,5);
		arr['5-8']  = this.p(-3,5);
		arr['5-9']  = this.p(-2,5);
		arr['5-10'] = this.p(-1,5);
		arr['5-11'] = this.p( 0,5);
		arr['5-12'] = this.p( 1,5);
		arr['5-13'] = this.p( 2,5);
		arr['5-14'] = this.p( 3,5);
		arr['5-15'] = this.p( 4,5);
		arr['5-16'] = this.p( 5,5);
		arr['5-17'] = this.p( 5, 4);
		arr['5-18'] = this.p( 5, 3);
		arr['5-19'] = this.p( 5, 2);
		arr['5-20'] = this.p( 5, 1);
		arr['5-21'] = this.p( 5, 0);
		arr['5-22'] = this.p( 5,-1);
		arr['5-23'] = this.p( 5,-2);
		arr['5-24'] = this.p( 5,-3);
		arr['5-25'] = this.p( 5,-4);
		arr['5-26'] = this.p( 5,-5);
		arr['5-27'] = this.p( 4,-5);
		arr['5-28'] = this.p( 3,-5);
		arr['5-29'] = this.p( 2,-5);
		arr['5-30'] = this.p( 1,-5);
		arr['5-31'] = this.p( 0,-5);
		arr['5-32'] = this.p(-1,-5);
		arr['5-33'] = this.p(-2,-5);
		arr['5-34'] = this.p(-3,-5);
		arr['5-35'] = this.p(-4,-5);
		arr['5-36'] = this.p(-5,-5);
		arr['5-37'] = this.p(-5,-4);
		arr['5-38'] = this.p(-5,-3);
		arr['5-39'] = this.p(-5,-2);
		arr['5-40'] = this.p(-5,-1);

		return arr;
	},

	LOG: "",

}

jslos.CELLPOSITIONS = jslos.load_cells();

