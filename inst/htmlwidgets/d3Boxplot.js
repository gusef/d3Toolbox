HTMLWidgets.widget({

    name: 'd3Boxplot',

    type: 'output',

    factory: function(el, width, height) {

        var svg  = null;
        var data = null;
        var outliers = null;
        var param = null;
        var stats = null;

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

            this.redraw(this.data, this.param, this.stats, this.outliers, width, height);
        },

        resize: function(width, height) {
            d3.select(el).select("svg")
	            .attr("width", width)
	            .attr("height", height);
	        d3.select(el).select("svg").selectAll("g").remove();
	        d3.select(el).select("svg").selectAll("text").remove();
	        d3.select(el).selectAll("d3-tip").remove();
	        this.redraw(this.data, this.param, this.stats, this.outliers, width, height);

        },

        redraw: function(data, param, stats, outlier, width, height) {

           	var margin = param.margins;

    		//if there is a title add more margin
    		if (param.title !== ''){
    		    margin.top += 40;
    		}

	    	var wid = width - margin.left - margin.right;
		    var hei = height - margin.top - margin.bottom;

           // scales
            var x = d3.scaleBand()
                      .domain(param.names)
                      .rangeRound([0, wid])
                      .padding(0.2);

        	var y = d3.scaleLinear()
                      .domain([param.range[0],param.range[1]])
        	          .rangeRound([hei, 0]);

    	    var g = svg.append("g")
     	    	       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     	    // add the x and y axes
	     	g.append("g")
	 		      .attr("class", "axis axis--x")
			      .attr("transform", "translate(0," + hei + ")")
		    	  .call(d3.axisBottom(x));

			g.append("g")
			      .attr("class", "axis axis--y")
			      .call(d3.axisLeft(y).ticks(10, param.unit));

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

            var d3data = HTMLWidgets.dataframeToD3(stats);

            // Add center line
            g.selectAll("line.center")
                .data(d3data)
                  .enter().append("line")
                    .attr("class", "center")
                    .attr("x1", function(d, i) { return x(param.names[i]) + x.bandwidth()/2; } )
                    .attr("y1", function(d) { return y(d[0]); })
                    .attr("x2", function(d, i) { return x(param.names[i]) + x.bandwidth()/2; } )
                    .attr("y2", function(d) { return y(d[4]); });

            // Add bottom whisker
            g.selectAll("line.whisker")
                .data(d3data)
                  .enter().append("line")
                    .attr("class", "bottomwhisker")
                    .attr("x1", function(d, i) { return x(param.names[i]) + 2 * x.bandwidth() / 7; } )
                    .attr("y1", function(d) { return y(d[0]); })
                    .attr("x2", function(d, i) { return x(param.names[i]) + 5 * x.bandwidth() / 7; } )
                    .attr("y2", function(d) { return y(d[0]); });

            // Add top whisker
            g.selectAll("line.whisker")
                .data(d3data)
                  .enter().append("line")
                    .attr("class", "topwhisker")
                    .attr("x1", function(d, i) { return x(param.names[i]) + 2 * x.bandwidth() / 7; } )
                    .attr("y1", function(d) { return y(d[4]); })
                    .attr("x2", function(d, i) { return x(param.names[i]) + 5 * x.bandwidth() / 7; } )
                    .attr("y2", function(d) { return y(d[4]); });

            //tooltip for the boxplot statistics
            var tiphtml = function(d) {
                var html = "<strong>Min</strong> <span style='color:red; float:right'>" + d[0] + "</span><br/>";
                html = html + "<strong>1st QTL</strong> <span style='color:red; float:right'>" + d[1] + "</span><br/>";
                html = html + "<strong>Median</strong> <span style='color:red; float:right'>" + d[2] + "</span><br/>";
                html = html + "<strong>3rd QTL</strong> <span style='color:red; float:right'>" + d[3] + "</span><br/>";
                html = html + "<strong>Max</strong> <span style='color:red; float:right'>" + d[4] + "</span><br/>";
                return html;
            };
            var tool_tip = d3.tip()
    	           .attr('class', 'd3-tip')
			       .offset([-10, 0])
			       .html(tiphtml);
            svg.call(tool_tip);

            // add box
            g.selectAll(".box")
            	   .data(d3data)
       	    		  .enter().append("rect")
       		    	    .attr("class", "box")
    			        .attr("x", function(d, i) { return x(param.names[i]); })
    			        .attr("y", function(d) { return y(d[3]); })
    			        .attr("width", x.bandwidth())
    			        .attr("height", function(d) { return y(d[1]) - y(d[3]); })
    			        .attr("fill", function(d, i) { return param.col[i]; })
                        .on('mouseover', tool_tip.show)
                        .on('mouseout', tool_tip.hide );

            // Add median line
            g.selectAll("line.median")
                .data(d3data)
                  .enter().append("line")
                    .attr("class", "median")
                    .attr("x1", function(d, i) { return x(param.names[i]); } )
                    .attr("y1", function(d) { return y(d[2]); })
                    .attr("x2", function(d, i) { return x(param.names[i]) + x.bandwidth(); } )
                    .attr("y2", function(d) { return y(d[2]); });

            // only show the outliers
            d3data = HTMLWidgets.dataframeToD3(outlier);

            g.selectAll(".dot")
                .data(d3data)
                .enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", param.dotsize)
                    .attr("cx", function(d) { return x(d.name) + x.bandwidth()/2; })
                    .attr("cy", function(d) { return y(d.x); })
                    .style("fill", "white");

            if (param.showdots){
                //tooltip for the timple plot
                tiphtml = function(d) {
                    return "<strong>"+d.name+"</strong> <span style='color:red; float:right'>" + d.x + "</span><br/>";
                };
                var dot_tip = d3.tip()
    	            .attr('class', 'd3-tip')
			        .offset([-10, 0])
			        .html(tiphtml);
                svg.call(dot_tip);

                //draw the dots
                d3data = HTMLWidgets.dataframeToD3(data);
                g.selectAll(".dot")
                    .data(d3data)
                    .enter().append("circle")
                        .attr("class", "dot")
                        .attr("r", param.dotsize)
                        .attr("cx", function(d) { return x(d.name) + x.bandwidth()/2; })
                        .attr("cy", function(d) { return y(d.x); })
                        .style("fill", param.dotcol)
                        .on('mouseover', dot_tip.show)
                        .on('mouseout',  dot_tip.hide)
                        .on("click", function(d) { return Shiny.onInputChange(param.callback,
                                                                              {'name' : d.name,
                                                                               'x' : d.x}); });
            }
        }
    };
  }
});
