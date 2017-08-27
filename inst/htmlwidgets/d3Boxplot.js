HTMLWidgets.widget({

    name: 'd3Boxplot',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
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
            this.param = x;
            draw_d3Boxplot(svg, this.param, wid, hei);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            svg  = d3.select(el).append("svg")
    	             .attr("width", wid)
    	             .attr("height", hei);
            draw_d3Boxplot(svg, this.param, wid, hei);
        },

    };
  }
});
