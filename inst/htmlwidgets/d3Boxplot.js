HTMLWidgets.widget({

    name: 'd3Boxplot',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
        var data = null;
        var outliers = null;
        var param = null;
        var stats = null;
        var wid = null;
        var hei = null;

    return {

        renderValue: function(x) {
            el.innerHTML = '';
            svg  = d3.select(el).append("svg")
                     .attr("width",width)
                     .attr("height",height);
            this.data = x.data;
            this.stats = x.stats;
            this.outliers = x.outliers;
           	this.param = {"range" : x.range,
           	              "names" : x.names,
           	              "col" : x.col,
                          "showdots" : x.showdots,
                          "dotcol" : x.dotcol,
           	              "dotsize" : x.dotsize,
           	              "xlab" : x.xlab,
                          "ylab" : x.ylab,
                          "title" : x.title,
           	              "subtitle" : x.subtitle,
           	              "legend" : x.legend,
           	              "margins" : x.margins,
                          "callback" : x.callback_handler
           	};

            //Special case where there is only one list element
            if (typeof(this.param.names) === 'string'){
                this.param.names = [this.param.names];
                this.param.col = [this.param.col];
            }

            draw_boxplot(svg, this.data, this.param, this.stats, this.outliers, width, height);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            svg  = d3.select(el).append("svg")
    	             .attr("width", wid)
    	             .attr("height", hei);
            draw_boxplot(svg, this.data, this.param, this.stats, this.outliers, wid, hei);
        },

    };
  }
});
