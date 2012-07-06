
var jslos = {

	/*
	* Parameters for the returned line-of-sight array
	* 
	* VISIBLE indicates that a tile is visible
	* BLOCKED indicates that a tile is not visible
	* CENTER indicates that a tile is the central point around which the calculation was done
	*/ 
	VISIBLE: 1,
	BLOCKED: 0,
	UNSEEN: 2,

	/*
	* blocker_values: list of all blocker values 
	*/
	blocker_values: new Array(),


	/*
	* @param {Array}	A list of the tiles that you have already seen
	*/
	viewed_tiles: undefined,

	/*
	* Clears the matrix with already seen tiles
	*/
	reset_viewed_tiles: function(height, width){
		this.viewed_tiles = this.create_matrix(height, width);
		for ( var i = 0; i < width; i++){
			for ( var j = 0; j < height; j++){
				this.viewed_tiles[j][i] = this.UNSEEN;
			}
		}
	},

	/*
	* The aggregated visible tiles
	*/
	clear_viewed_tiles: function(){
		this.viewed_tiles = undefined;
	},

	/*
	* @param undefiend	A matrix that can be used for agregating visible tiles 	
	*/
	merged_visible_tiles: undefined,

	/*
	* Clears the matrix with aggregated visible tiles
	*/
	reset_merged_tiles: function(height, width){
		this.merged_visible_tiles = this.create_matrix(height, width);
		for ( var i = 0; i < width; i++){
			for ( var j = 0; j < height; j++){
				this.merged_visible_tiles[j][i] = this.BLOCKED;
			}
		}
	},

	/*
	* Clear the aggregated visible tiles
	* They are set to undefiend which means they will not be used any more.
	*/
	clear_merged_tiles: function(){
		this.merged_visible_tiles = undefined;
	},

	/**
	* Creates and returns a Matrix.
	*
	* @param {Integer} rows		The height of the new matrix.
	* @param {Integer} cols		The width of the new matrix.
	* @return {Array[Array]}	Returns a matrix.
	*/
	create_matrix: function(rows, cols) {

		        var matrix = new Array(rows);
		        for( var row = 0; row < rows; row++) {
		                matrix[row] = new Array(cols);
		        }

			return matrix;
	},

	/**
	* Calculates the line of sight and returns a new matrix with the calculated line-of-sight.
	*
	* @param {Array[Array]} matrix	The matrix which line-of-sight should be calculated on.
	* @param {Integer} row		The row of the center tile.
	* @param {Integer} col		The col of the center tile.
	* @param {Integer} rings	The number of rings that should be counted.
	* @return {Array[Array]}   	Returns a matrix with the calculated line-of-sight.
	*/
	calculate_line_of_sight: function(matrix, center, rings){
		// Create Return Matrix
		var los_matrix = this.create_matrix(matrix.length, matrix[0].length);

		// EMPTY LOG
		this.LOG = "";

		// For each ring
		var ring;
		var cell;
		var pos;
		var start;
		var stop;
		var range;
		var shadow_array = new Array();
		var visible;

		// Set Center as visible
		los_matrix[center.row][center.col] = this.VISIBLE;
		if ( this.merged_visible_tiles != undefined ){
			this.merged_visible_tiles[center.row][center.col] = this.VISIBLE;
		}
		if ( this.viewed_tiles != undefined ){
			this.viewed_tiles[center.row][center.col] = matrix[center.row][center.col];
		}

		for ( ring = 1; ring <= rings; ring++){
			var cells = this.number_of_cells(ring);
			range = 360 / cells;

			for ( cell = 1; cell <= cells; cell++ ) {

				pos = this.get_cell_position(cell, ring, center);

				if ( pos.row >= 0 && pos.row < matrix.length && pos.col >= 0 && pos.col < matrix[0].length ){

					// Calculate Start and Stop Values for the cell
					start = this.get_start(cell, range);
					stop = this.get_stop(cell, range);

					// Check if cell is visible
					if ( start < 0 ) {
						visible =  this.is_visible_special(start, stop, shadow_array);
					} else {
						visible =  this.is_visible(start, stop, shadow_array);
					}

					// Mark cell as visible or blocked
					if ( visible === false ) {
						los_matrix[pos.row][pos.col] = this.BLOCKED;
					} else {
						los_matrix[pos.row][pos.col] = this.VISIBLE;
						if ( this.viewed_tiles != undefined ){
							this.viewed_tiles[pos.row][pos.col] = matrix[pos.row][pos.col];
						}
						if ( this.merged_visible_tiles != undefined ){
							this.merged_visible_tiles[pos.row][pos.col] = this.VISIBLE;
						}
					}

					// Check if cell is blocking or not blocking
					// Update shadow arch if it is
					blocking = this.is_blocking(matrix[pos.row][pos.col]);
					if ( blocking === true ){
						if ( start < 0 ) {
							this.update_arch(360+start,360,shadow_array);
							this.update_arch(0,stop,shadow_array);
						} else {
							this.update_arch(start,stop,shadow_array);
						}
					}

					//this.LOG = this.LOG + "(" + ring + "," + cell + ")    " + start + " - " + stop + " visible:" + visible + " blocking: " + blocking + "<br/>";
					//this.LOG = this.LOG + shadow_array + "<br/> ";
					//this.LOG = this.blocker_values;

				}
			}
		}

		return los_matrix;
	},

	/**
	* Updates the shadow array object with new "shadows".
	* A shadow is a blocked area
	*
	* @param {Double} start		The start of the new shadowed area
	* @param {Double} stop		The end of the new shadowed area
	* @param {Array} shadow_array	The shadow array object that will be updated
	* @return {void}
	*/
	update_arch: function(start, stop, shadow_array){
		// Round Too two decimals
		start = Math.round(start*100)/100;
		stop = Math.round(stop*100)/100;

		var updated = false;
		for ( i = 0; i < shadow_array.length; i = i + 2){
			// Check if start and stop is within shadow array
			// check:  X--start--stop--X
			// result: X---------------X
			if ( start >= shadow_array[i] && stop <= shadow_array[i+1] ){
				updated = true;
			}

			// Check if start is within shadow array and stop outside
			// Then we updated top shadow array to stop
			// check:  X--start--X...stop
			// result: X----------------X
			if ( start >= shadow_array[i] && start <= shadow_array[i+1] && stop > shadow_array[i+1]  ){
				shadow_array[i+1] = stop;
				updated = true;
			}

			// Check if stop is within shadow array and start outside
			// Then we updated bottom shadow array to start
			// check:  start  X--stop--X
			// result: X---------------X
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


	/**
	* Checks if a special area is Visible
	* This method is used for the areas which are across the "gap" of the arc. 
	* Example start = 350 and stop = 10
	*
	* @param {Double} start		The start of the area
	* @param {Double} stop		The end of the area
	* @param {Array} shadow_array	The shadow array object 
	* @return {Boolean}		true/false based on whether the area is blocked or not
	*/
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

	/**
	* Checks if an area is Visible
	* An area is invisible if both start and end is within the shadow
	*
	* @param {Double} start		The start of the area
	* @param {Double} stop		The end of the area
	* @param {Array} shadow_array	The shadow array object 
	* @return {Boolean}		true/false based on whether the area is blocked or not
	*/
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

	/**
	* Checks if an cell value is a BLOCKER
	*
	* @param {Object} value		The value of the cell to be checked
	* @return {Boolean}		true/false based on whether the cell value is a BLOCKER or not
	*/
	is_blocking: function(value){
		if ( value in this.oc(this.blocker_values) ){
			return true;
		} else {
			return false;
		}
	},

	oc: function(arr)
	{
	  var o = {};
	  for(var i=0;i<arr.length;i++)
	  {
	    o[arr[i]]='';
	  }
	  return o;
	},

	/**
	* Gets the start arch value of a cell based on index
	*
	* @param {Integer} cell		The index of the cell
	* @param {Float} range		The range of each cell
	* @return {Float}		start arch value
	*/
	get_start: function(cell, range){
		return ((cell-1)*range)-(range/2);
	},

	/**
	* Gets the end arch value of a cell based on index
	*
	* @param {Integer} cell		The index of the cell
	* @param {Float} range		The range of each cell
	* @return {Float}		end arch value
	*/
	get_stop: function(cell, range){
		return (cell*range)-(range/2);
	},

	/**
	* Position Class
	* Create a position object base on row and col
	*
	* @param {Integer} row		The row of the position
	* @param {Integer} col		The row of the position
	* @return {Position}		Returns position class object 
	* @constructor
	*/
	p: function(row,col){
		return { row: row, col: col };
	},

	/**
	* Returns the a position based on the index of the cell and which ring it's in
	* The returned positon is absolute in the matrix. It's based on the starting position which
	* is sent into method with startrow and starcol
	*
	* @param {Integer} cell			The index of the cell
	* @param {Integer} ring			The index of the ring
	* @param {Position} start_position	The central position
	* @return {Position}			end arch value
	*/
	get_cell_position: function(cell, ring, start_position){
		var x = this.CELLPOSITIONS[ring+'-'+cell];
		return this.p(start_position.row+x.row, start_position.col+x.col);
	},

	/**
	* Returns the number of cells in the ring based on which ring index.
	*
	* @param {Integer} ring		The index of the ring
	* @return {Integer}		The number of cells in the ring
	*/
	number_of_cells: function(ring){
		return ring * 8;
	},

	/**
	* Returns an array with the pre-calculated cell positions relative to 
	*
	* @return {Array}		pre-calculated cell positions
	*/
	get_cell_positions: function(rings){

		var arr = new Array();

		var counter;

		for(var ring=1; ring<=rings; ring++){
			counter = 1;

			for(var i=0;             i<=ring;      i++,counter++){ arr[ring+'-'+counter] = jslos.p(ring*-1,i); }
			for(var i=((ring*-1)+1); i<=ring;     i++,counter++){ arr[ring+'-'+counter] = jslos.p(i,ring);}
			for(var i=(ring-1);      i>=(ring*-1); i--,counter++){ arr[ring+'-'+counter] = jslos.p(ring,i); }
			for(var i=(ring-1);      i>=(ring*-1); i--,counter++){ arr[ring+'-'+counter] = jslos.p(i,ring*-1); }
			for(var i=((ring*-1)+1); i<=-1;        i++,counter++){ arr[ring+'-'+counter] = jslos.p(ring*-1,i); }
		}

		return arr;
	},

	/* 
	* @param {String} LOG	Used for debugging.
	*/ 
	LOG: "",

}

/* 
* Loads the cellpositions into an array 
*/
jslos.CELLPOSITIONS = jslos.get_cell_positions(20);

