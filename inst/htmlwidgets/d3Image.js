HTMLWidgets.widget({

    name: 'd3Image',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
        var data = null;
        var raw_values = null;
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
            this.raw_values = x.raw_values;
           	this.param = {"xlab" : x.xlab,
                          "ylab" : x.ylab,
                          "xax" : x.xax,
                          "yax" : x.yax,
                          "title" : x.title,
                          "subtitle" : x.subtitle,
                          "margins" : x.margins,
                          "show_xax" : x.show_xax,
                          "show_yax" : x.show_yax,
                          "callback" : x.callback_handler
           	};
            draw_image(svg, this.data, this.raw_values, this.param, wid, hei);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            svg  = d3.select(el).append("svg")
    	             .attr("width", wid)
    	             .attr("height", hei);
	        draw_image(svg, this.data, this.raw_values, this.param, wid, hei);
        },


    };
  }
});
