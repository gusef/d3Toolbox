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

            console.log('render wid ' + wid);
            console.log('render width ' + width);


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
                          "callback" : x.callback_handler
           	};
            this.redraw(this.data, this.param, wid, hei);
        },

        resize: function(width, height) {
            console.log('redraw wid ' + wid);

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
            d3data = HTMLWidgets.dataframeToD3(data);

    		var margin = {top: 40, right: 20, bottom: 50, left: 60};

    		//if there is a title add more margin
    		if (param.title !== ''){
    		    margin.top += 40;
    		}

	    	var wid = width - margin.left - margin.right;
		    var hei = height - margin.top - margin.bottom;


            // get the data ranges and add a padding for nicer display
            var x_dom = d3.extent(data.x),
                x_range = x_dom[1] - x_dom[0],
                y_dom = d3.extent(data.y),
                y_range = y_dom[1] - y_dom[0];

            // scales
            var x = d3.scaleLinear()
                      .rangeRound([0, wid]);

            if (param.xrange === null){
                x.domain([x_dom[0] - (x_range * 0.05), x_dom[1] + (x_range * 0.05)]);
            } else {
                x.domain(param.xrange);
            }

        	var y = d3.scaleLinear()
                      .rangeRound([hei, 0]);

            if (param.yrange === null){
                y.domain([y_dom[0] - (y_range * 0.05), y_dom[1] + (y_range * 0.05)]);
            } else {
                y.domain(param.yrange);
            }

      	    var g = svg.append("g")
    	    	       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

           // add the x and y axes
	     	g.append("g")
    	     	  .attr('transform', 'translate(0,' + hei + ')')
	 		      .attr("class", "axis axis--x")
		    	  .call(d3.axisBottom(x));

			g.append("g")
			      .attr("class", "axis axis--y")
			      .call(d3.axisLeft(y));

            // now add titles to the axes
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate("+ (margin.left/3) +","+(height/2)+")rotate(-90)")
                .text(param.ylab);

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "translate("+ (width/2) +","+(height-(margin.bottom/3))+")")
                .text(param.xlab);

            // title and subtitle
            if (param.title !== null){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate("+ (width/2) +","+((margin.top/3))+")")
                    .attr("font-size", "24px")
                    .text(param.title);
            }

            if (param.subtitle !== null){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate("+ (width/2) +","+((2*margin.top/3))+")")
                    .attr("font-size", "15px")
                    .text(param.subtitle);
            }

            //add tooltip
            var tiphtml = function(d) {
                var keys = param.tooltip === null ? ['x','y','name'] : param.tooltip;
                var ret = "";


                if (!Array.isArray(keys)){
                    ret = "<strong>"+keys+"</strong> <span style='color:red; float:right'>" + d[keys] + "</span><br/>";
                }else{
                    keys.forEach(function(k){
                        ret += "<strong>"+k+"</strong> <span style='color:red; float:right'>" + d[k] + "</span><br/>";
                    });
                }
                return ret;
            };

            var tool_tip = d3.tip()
    	                     .attr('class', 'd3-tip')
			                 .offset([-10, 0])
			                 .html(tiphtml);
            svg.call(tool_tip);

            //draw the dots
            g.selectAll(".dot")
                .data(d3data)
                .enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", param.dotsize)
                    .attr("cx", function(d) { return x(d.x); })
                    .attr("cy", function(d) { return y(d.y); })
                    .style("fill", function(d) { return d.col; })
                    .on('mouseover', tool_tip.show)
                    .on('mouseout',  tool_tip.hide);

            // Lasso functions
            var lasso_start = function() {
                lasso.items()
                     .attr("r",param.dotsize) // reset size
                     .classed("not_possible",true)
                     .classed("selected",false);
            };

            var lasso_draw = function() {
                lasso.possibleItems()
                    .classed("not_possible",false)
                    .classed("possible",true);
                lasso.notPossibleItems()
                    .classed("not_possible",true)
                    .classed("possible",false);
            };

            var lasso_end = function() {
                // Reset the color of all dots
                lasso.items()
                    .classed("not_possible",false)
                    .classed("possible",false);

                // Style the selected dots
                lasso.selectedItems()
                    .classed("selected",true)
                    .attr("r",param.dotsize * 2);

                var ret = lasso.selectedItems();
                Shiny.onInputChange(param.callback,
                                    ret.nodes().map(function(d) { return d.__data__.name; }) );

                // Reset the style of the not selected dots
                lasso.notSelectedItems()
                    .attr("r",param.dotsize);
            };

            var lasso = d3.lasso()
                .closePathSelect(true)
                .closePathDistance(100)
                .items(svg.selectAll(".dot"))
                .targetArea(svg)
                .on("start",lasso_start)
                .on("draw",lasso_draw)
                .on("end",lasso_end);
            svg.call(lasso);

            if (param.legend !== null){
                // reshape the legend data so D3 can play around with it
                var d3legend = HTMLWidgets.dataframeToD3(param.legend);

                // add a legend object for each item
                var legend = g.selectAll(".legend")
                                .data(d3legend)
                                   .enter().append("g")
                                   .attr("class", "legend")
                                   .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                // add a rectangle on each element
                legend.append("rect")
                      .attr("x", wid - 18)
                      .attr("width", 18)
                      .attr("height", 18)
                      .style("fill", function(d) { return d.col; });

                // add the text to each element
                legend.append("text")
                      .attr("x", wid - 24)
                      .attr("y", 9)
                      .attr("dy", ".35em")
                      .style("text-anchor", "end")
                      .text(function(d) { return d.name; });
            }


        }
    };
  }
});
