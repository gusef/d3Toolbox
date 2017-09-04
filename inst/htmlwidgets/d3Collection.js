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
                //figure out where the subplot goes
                var dims = getDimensions (collection, i, width, height);
                var obj = collection.data[i];
                
                //set the callback to the heatmap callback
                obj.callback = collection.callback;

                //add a new group for each subplot
                //and save it to the collection object so we can access it later
                obj.sub_g = g.append("g")
                             .attr("x", dims.x)
                             .attr("y", dims.y)
                             .attr("width", dims.pwid)
                             .attr("height", dims.phei)
                             .attr("transform",
                                   "translate(" + dims.x + "," + dims.y + ")");

                //add a click box that when activated deselects everything
                var that = this;
                obj.sub_g.append('rect')
                         .attr('class', 'click-capture')
                         .style('opacity', 0)
                         .attr('width', dims.pwid)
                         .attr('height', dims.phei)
                         .on("click", function(){that.update(that, i, '', [], true)});

                // call the appropriate plot
                var func = 'draw_' + obj.type;
                window[func](obj.sub_g, obj, dims.pwid, dims.phei, this, i);
            }

        },

        //function called when rows or columns from specific subplots are selected
        update : function(obj, id, axis, index, clear_old){
            var con = obj.collection.connectors;

            //only if row/column connectors were specified
            if (con !== null){

                //figure out which one of the connectors is active and inactive
                var active = getConnectors(con, id, axis);
                var sub, func;
                if (clear_old){
                    // then deactivate all 
                    for (var m = 0; m < obj.collection.data.length; m++){
                        sub = obj.collection.data[m];
                        func = 'update_' + sub.type;
                        window[func](sub.sub_g, '', [], clear_old);
                    }
                }
                
                //only if there are connections
                if (active.length > 0){
                    // then activate all active ones
                    for (var l = 0; l < active.length; l++){
                        var idx = active[l];
                        for (var k = 0; k < con[idx].names.length; k++ ){
                            // -1 because of the R/javascript index differences
                            sub = obj.collection.data[con[idx].names[k] - 1];
                            func = 'update_' + sub.type;
                        
                            //run update with empty indices to deactivate all elements
                            window[func](sub.sub_g, con[idx].dims[k], index, clear_old);
                        }
                    }
                }
            }
        }
    };
  }
});

//helper function that figures out position and dimension of a subplot
function getDimensions (collection, idx, width, height) {
    var x = null, y = null, pwid = null, phei = null;
    var current_x = 0, current_y = 0;
    //go through lmat to figure out dimensions, allowing multiple rows / columns
     for (var j = 0; j < collection.lwid.length; j++) {
        for (var k = 0; k < collection.lhei.length; k++) {
            //only the subplot we are currently working on
            if (collection.lmat[k][j] === (idx + 1)){
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
    return {"x" : x,
            "y" : y,
            "pwid" : pwid,
            "phei" :phei };
}

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

