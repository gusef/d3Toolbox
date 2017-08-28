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

            // then plot all of them one by one
            var current_x = 0;
            for (var i = 0; i < collection.lwid.length; i++) {
                var current_y = 0;
                var current_wid = width * collection.lwid[i];
                for (var j = 0; j < collection.lhei.length; j++) {
                    var current_hei = height * collection.lhei[j];

                    var sub_g = g.append("g")
                                 .attr("x", current_x)
                                 .attr("y", current_y)
                                 .attr("width", current_wid)
                                 .attr("height", current_hei)
                                 .attr("transform",
                                       "translate(" + current_x + "," + current_y + ")");

                    var id = collection.lmat[j][i];
                    if (id !== null){
                        // call the appropriate plot
                        var obj = collection.data[id-1];
                        var func = 'draw_' + obj.type;
                        window[func](sub_g, obj, current_wid, current_hei, this, id);
                    }
                    current_y += current_hei;
                }
            current_x +=  current_wid;
            }
        },

        update : function(collection, id, axis, index){

            var con = collection.collection.connectors;

            if (con !== null){
                for (var i = 0; j < con.length; j++) {

                }
            }
        }

    };
  }
});
