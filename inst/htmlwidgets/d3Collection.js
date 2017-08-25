HTMLWidgets.widget({

    name: 'd3Collection',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
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

            console.log(x);

//            draw_scatter(svg, this.data, this.param, wid, hei);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            d3.select(el).select("svg")
	            .attr("width", wid)
	            .attr("height", hei);

//	        draw_scatter(svg, this.data, this.param, wid, hei);
        },


    };
  }
});
