HTMLWidgets.widget({

    name: 'd3Image',

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
           	this.param = {"xlab" : x.xlab,
                          "ylab" : x.ylab,
                          "xax" : x.xax,
                          "yax" : x.yax,
                          "colors" : x.colors,
                          "title" : x.title,
                          "subtitle" : x.subtitle,
                          "margins" : x.margins,
                          "show_xax" : x.show_xax,
                          "show_yax" : x.show_yax,
                          "callback" : x.callback_handler
           	};
            this.redraw(this.data, this.param, wid, hei);
        },

        resize: function(width, height) {

            wid = width;
            hei = height;
            d3.select(el).select("svg")
	            .attr("width", width)
	            .attr("height", height);
	        d3.select(el).select("svg").selectAll("g").remove();
	        d3.select(el).select("svg").selectAll("text").remove();
	        d3.select(el).selectAll("d3-tip").remove();
	        this.redraw(this.data, this.param, width, height);
        },

        redraw: function(data, param, width, height) {

    		//if there is a title add more margin
    		if (param.title !== ''){
    		    param.margins.top += 40;
    		}

	    	var wid = width - param.margins.left - param.margins.right;
		    var hei = height - param.margins.top - param.margins.bottom;

            // title and subtitle
            if (param.title !== null){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform",
                          "translate("+ (width/2) +","+((param.margins.top/3))+")")
                    .attr("font-size", "24px")
                    .text(param.title);
            }

            if (param.subtitle !== null){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform",
                          "translate("+ (width/2) +","+((2*param.margins.top/3))+")")
                    .attr("font-size", "15px")
                    .text(param.subtitle);
            }


      	    var g = svg.append("g")
		    	       .attr("transform",
		    	             "translate(" + param.margins.left + "," + param.margins.top + ")");

            var x = d3.scaleBand()
                      .rangeRound([0, wid]);

            //show the labels on the bottom
            if (param.show_xax){
                x.domain(param.xax);
                var xlabels = g.selectAll(".xlab")
                  .data(param.xax)
                  .enter().append("text")
                   .attr("class", "xlab")
                   .text(function (d) { return d; })
                   .attr("x", function(d) { return x(d) + 0.7 * x.bandwidth(); })
                   .attr("y", hei + 5)
                   .attr("transform", function(d) { return "rotate(270," + (x(d)  + 0.7 * x.bandwidth()) + "," + (hei + 5) + ")"; })
                   .style("text-anchor", "end");
            }

            var y = d3.scaleBand()
                      .rangeRound([0, hei]);

            //show the labels on the right
            if (param.show_yax){
                y.domain(param.yax);
                var ylabels = g.selectAll(".ylab")
                  .data(param.yax)
                  .enter().append("text")
                   .attr("class", "ylab")
                   .text(function (d) { return d; })
                   .attr("x", wid)
                   .attr("y", function(d) { return y(d)  + 0.6 * y.bandwidth(); })
                   .style("text-anchor", "start");
            }

            // resetting the scales
            x.domain(d3.range(data[0].length));
            y.domain(d3.range(data.length));

            // add a color scale
            var ext = d3.extent(data);
            var color = d3.scaleOrdinal()
                .domain([d3.min(ext[0]),d3.max(ext[1])])
                .range(param.colors);

            //generate the matrix
            var row = g.selectAll(".row")
                       .data(data);
            var rowenter = row.enter().append("g")
                              .attr("class", "row")
                              .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

            var cell = row.merge(rowenter)
                          .selectAll(".cell")
                          .data(function(d) { return d; })
                          .enter().append("rect")
                          .attr("class", "cell")
                          .attr("x", function(d, i) { return x(i); })
                          .attr("width", x.bandwidth())
                          .attr("height", y.bandwidth())
                          .style("fill", function(d){ return color(d); });
        }
    };
  }
});
