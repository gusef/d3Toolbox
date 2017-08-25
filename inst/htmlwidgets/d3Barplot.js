HTMLWidgets.widget({

  name: 'd3Barplot',

  type: 'output',

  factory: function(el, width, height) {

    var svg  = d3.select(el).append("svg")
                 .attr("width",width)
                 .attr("height",height);
    var data = null;
    var param = null;
    var wid = null;
    var hei = null;

    return{
        renderValue: function(x) {
            el.innerHTML = '';

            //figuring out width and height in a way that redrawing works
            wid = wid === null ? width : wid;
            hei = hei === null ? height : hei;

            svg  = d3.select(el).append("svg")
                     .attr("width", wid)
                     .attr("height", hei);

           	this.data = x.data;
           	this.param = {"tooltip" : x.tooltip !== '',
           	              "singleVar" : Object.keys(this.data).length == 1,
           	              "fill" : x.fill,
           	              "unit" : x.unit,
           	              "xlab" : x.xlab,
                          "ylab" : x.ylab,
                          "show_axes" : x.show_axes,
                          "yrange" : x.yrange,
                          "padding" : x.padding,
           	              "title" : x.title,
           	              "subtitle" : x.subtitle,
                          "max_value" : x.max_value,
                          "margins" : x.margins,
           	              "callback" : x.callback_handler
           	    };

           	//add the row names
           	this.data.name = x.name;

           	//if there are tooltips add them
           	if (this.param.tooltip){
           	    this.data.tooltip = x.tooltip;
           	}
           	draw_barplot(svg, this.data, this.param, wid, hei);
        },
        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            svg  = d3.select(el).append("svg")
    	             .attr("width", wid)
    	             .attr("height", hei);
	        draw_barplot(svg, this.data, this.param, wid, hei);
        },
     };
   }
});
