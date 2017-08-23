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
            this.redraw(this.data, this.raw_values, this.param, wid, hei);
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
	        this.redraw(this.data, this.raw_values, this.param, width, height);
        },

        redraw: function(data, raw_values, param, width, height) {

    		var margin = param.margins;
            var top = param.title !== '' ? 40 : 0 ;

	    	var wid = width - margin.left - margin.right;
		    var hei = height - margin.top - margin.bottom - top;

            // title and subtitle
            if (param.title !== null){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform",
                          "translate("+ (width/2) +","+(((margin.top+top)/3))+")")
                    .attr("font-size", "24px")
                    .text(param.title);
            }

            if (param.subtitle !== null){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform",
                          "translate("+ (width/2) +","+((2*(margin.top+top)/3))+")")
                    .attr("font-size", "15px")
                    .text(param.subtitle);
            }

      	    var g = svg.append("g")
		    	       .attr("transform",
		    	             "translate(" + margin.left + "," + (margin.top + top) + ")");

            var xlab = d3.scaleBand()
                         .domain(param.xax)
                         .rangeRound([0, wid]);

            //show the labels on the bottom
            if (param.show_xax){
                var xlabels = g.selectAll(".xlab")
                  .data(param.xax)
                  .enter().append("text")
                   .attr("class", "xlab selectlabel")
                   .text(function (d) { return d; })
                   .attr("x", function(d) { return xlab(d) + 0.7 * xlab.bandwidth(); })
                   .attr("y", hei + 3)
                   .attr("transform", function(d) { return "rotate(270," + (xlab(d)  + 0.7 * xlab.bandwidth()) + "," + (hei + 3) + ")"; })
                   .style("text-anchor", "end")
                   .on("click", click("xlab"));
            }

            var ylab = d3.scaleBand()
                      .domain(param.yax)
                      .rangeRound([hei, 0]);

            //show the labels on the right
            if (param.show_yax){
                var ylabels = g.selectAll(".ylab")
                  .data(param.yax)
                  .enter().append("text")
                   .attr("class", "ylab selectlabel")
                   .text(function (d) { return d; })
                   .attr("x", wid + 3)
                   .attr("y", function(d) { return ylab(d)  + 0.6 * ylab.bandwidth(); })
                   .style("text-anchor", "start")
                   .on("click", click("ylab"));
            }

            // clicking a label
            function click(click_type) {
                return function(d) {
                    Shiny.onInputChange(param.callback,{"type" : click_type,
                                                        "value" : d});
                };
            }

            //setting the scales for the actual data
            var x = d3.scaleBand()
                      .domain(d3.range(data[0].length))
                      .rangeRound([0, wid]);

            var y = d3.scaleBand()
                      .domain(d3.range(data.length))
                      .rangeRound([hei, 0]);

           //add tooltip
            var tiphtml = function(d, i) {
                var col = d3.select(this).attr("column");
                var y_rev = param.yax.slice();
                row = d3.select(d3.select(this).node().parentNode).attr("row");
                var value = raw_values[row][col];
                var ret = "<strong>Value:</strong> <span style='color:red; float:right'>" + Math.round(value * 100) / 100 + "</span><br/>";
                ret += "<strong>x-label:</strong> <span style='color:white; float:right'>" + param.xax[col] + "</span><br/>";
                ret += "<strong>y-label:</strong> <span style='color:white; float:right'>" + y_rev.reverse()[row] + "</span><br/>";
                return ret;
            };

            //add tooltip to svg
            var tool_tip = d3.tip()
    	                     .attr('class', 'd3-tip')
			                 .offset([-10, 0])
			                 .html(tiphtml);
            svg.call(tool_tip);

            //generate the matrix
            var row = g.selectAll(".row")
                       .data(data);
            var rowenter = row.enter().append("g")
                              .attr("class", "row")
                              .attr("row", function(d, i) { return i; } )
                              .attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });

            var cell = row.merge(rowenter)
                          .selectAll(".cell")
                          .data(function(d) { return d; })
                          .enter().append("rect")
                          .attr("class", "cell")
                          .attr("x", function(d, i) { return x(i); })
                          .attr("column", function(d, i) { return i; } )
                          .attr("width", x.bandwidth())
                          .attr("height", y.bandwidth())
                          .style("fill", function(d){ return d; })
        			      .on('mouseover', tool_tip.show)
                          .on('mouseout',  tool_tip.hide);

        }
    };
  }
});
