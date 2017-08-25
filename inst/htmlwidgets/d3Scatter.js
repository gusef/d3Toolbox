HTMLWidgets.widget({

    name: 'd3Scatter',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
        var data = null;
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
            this.data = x.data;
           	this.param = {"dotsize" : x.dotsize,
           	              "xlab" : x.xlab,
                          "ylab" : x.ylab,
                          "xrange" : x.xrange,
                          "yrange" : x.yrange,
                          "title" : x.title,
           	              "subtitle" : x.subtitle,
           	              "tooltip" : x.tooltip,
           	              "legend" : x.legend,
           	              "margins" : x.margins,
                          "callback" : x.callback_handler
           	};
            draw_scatter(svg, this.data, this.param, wid, hei);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            svg  = d3.select(el).append("svg")
	            .attr("width", wid)
	            .attr("height", hei);
	        draw_scatter(svg, this.data, this.param, wid, hei);
        },


    };
  }
});
