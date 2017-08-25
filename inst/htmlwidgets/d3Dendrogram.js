HTMLWidgets.widget({

    name: 'd3Dendrogram',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
        var tree = null;
        var param = null;
        var wid = null;
        var hei = null;

    return {

        renderValue: function(x) {
            el.innerHTML = '';

            //figuring out width and height in a way that redrawing works
            wid = wid === null ? width : wid;
            hei = hei === null ? height : hei;

            svg  = d3.select(el).append("svg")
                     .attr("width", wid)
                     .attr("height", hei);
            this.tree = x.tree;

           	this.param = {
           	    "horiz" : x.horiz,
                "label" : x.label,
                "lab_adj" : x.lab_adj,
                "classic" : x.classic_tree,
                "axis" : x.axis,
                "title" : x.title,
                "subtitle" : x.subtitle,
                "margins" : x.margins,
                "callback" : x.callback_handler
            };

            draw_dendrogram(svg, this.tree, this.param, wid, hei);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            svg  = d3.select(el).append("svg")
    	             .attr("width", wid)
    	             .attr("height", hei);
	        draw_dendrogram(svg, this.tree, this.param, wid, hei);
        },
    };
  }
});
