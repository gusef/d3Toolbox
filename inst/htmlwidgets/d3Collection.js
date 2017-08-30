HTMLWidgets.widget({

    name: 'd3Collection',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
        var wid = null;
        var hei = null;
        var collection  = null;


    return {

        renderValue: function(x) {
            el.innerHTML = '';

            //figuring out width and height in a way that redrawing works
            this.wid = wid === null ? width : this.wid;
            this.hei = hei === null ? height : this.hei;

            this.collection = x;
            this.svg  = d3.select(el).append("svg")
                          .attr("width", this.wid)
                          .attr("height", this.hei);

            this.draw_collection(this.svg, this.collection, this.wid, this.hei);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            this.wid = width;
            this.hei = height;
            this.svg  = d3.select(el).append("svg")
            	                .attr("width", this.wid)
            	                .attr("height", this.hei);

            this.draw_collection(this.svg, this.collection, this.wid, this.hei);
        },


        draw_collection : function(svg, collection, width, height){
            // fix the overall margins
            var margin = collection.margins;
            var top = collection.title !== null ? 30 : 0 ;

        	var wid = width - margin.left - margin.right;
        	var hei = height - margin.top - margin.bottom - top;

            var g = svg.append("g")
    	       .attr("transform", "translate(" + margin.left + "," + (margin.top + top) + ")");

            // add title
            if (collection.title !== ''){
                svg.append("text")
                   .attr("text-anchor", "middle")
                   .attr("transform", "translate("+ (width/2) +","+((margin.top+top)/2)+")")
                   .attr("font-size", "24px")
                   .text(collection.title);
            }

            for (var i = 0; i < collection.data.length; i++) {
                var x = null, y = null, pwid = null, phei = null;
                var current_x = 0, current_y = 0;
                //go through lmat to figure out dimensions, allowing multiple rows / columns
                 for (var j = 0; j < collection.lwid.length; j++) {
                    for (var k = 0; k < collection.lhei.length; k++) {

                        //only the subplot we are currently working on
                        if (collection.lmat[k][j] === (i+1)){
                            // if we have not encountered an element before
                            if (x === null){
                                x = current_x;
                                y = current_y;
                                pwid = width * collection.lwid[j];
                                phei = height * collection.lhei[k];
                            }else{
                                // if we are in the same row
                                if (x === current_x){
                                    pwid += width * collection.lwid[j];
                                }

                                // if we are in the same column
                                if (y === current_y){
                                    phei += height * collection.lhei[k];
                                }
                            }
                        }
                        current_y += height * collection.lhei[k];
                    }
                    current_y = 0;
                    current_x += width * collection.lwid[j];
                }


                var obj = collection.data[i];

                //add a new group for each subplot
                //and save it to the collection object so we can access it later
                obj.sub_g = g.append("g")
                             .attr("x", x)
                             .attr("y", y)
                             .attr("width", pwid)
                             .attr("height", phei)
                             .attr("transform",
                                   "translate(" + x + "," + y + ")");

                // call the appropriate plot
                var func = 'draw_' + obj.type;
                window[func](obj.sub_g, obj, pwid, phei, this, i);

            }

        },

        //function called when rows or columns from specific subplots are selected
        update : function(obj, id, axis, index){

            var con = obj.collection.connectors;

            //only if row/column connectors were specified
            if (con !== null){

                //figure out which one of the connectors is active and inactive
                var active = getConnectors(con, id, axis);

                var sub, func;
                // then deactivate all inactive ones
                for (var m = 0; m < obj.collection.data.length; m++){
                    sub = obj.collection.data[m];
                    func = 'update_' + sub.type;
                    window[func](sub.sub_g, '', []);
                }


                // then activate all active ones
                for (var l = 0; l < active.length; l++){
                    var idx = active[l];
                    for (var k = 0; k < con[idx].names.length; k++ ){
                        // -1 because of the R/javascript index differences
                        sub = obj.collection.data[con[idx].names[k] - 1];
                        func = 'update_' + sub.type;
                        //run update with empty indices to deactivate all elements
                        window[func](sub.sub_g, con[idx].dims[k], index);
                    }
                }

            }
        }
    };
  }
});


//returns an array with all connectors
function getConnectors(con, id, axis){
    var ret = [];
   //look through all connections
    for (var i = 0; i < con.length; i++) {
        //figure out if the current caller is part of the current connection
        for (var j=0; j < con[i].dims.length; j++ ){
            // id + 1 since R and javascript start indexing at 1/0
            if (con[i].names[j] === (id + 1) && con[i].dims[j] === axis){
                ret.push(i);
            }
        }
    }
    return(ret);
}

