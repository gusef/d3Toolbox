////////////////////////////////////////////////////////////////////////////////
// Legend
function draw_d3Legend(svg, param, width, height, collection, id){
    var top = param.title === null ? 0 : 10;

    var g = svg.append("g")
    	       .attr("transform",
    	             "translate(" + param.margins.left + "," + (param.margins.top + top) + ")");

    if (param.title !== null){
        svg.append("text")
           .attr("text-anchor", "start")
           .attr("transform", "translate("+ 15 +","+ 15 + ")")
           .attr("font-size", param.fontsize)
           .attr("font-weight", "bold")
           .text(param.title);
    }

    var d3data = HTMLWidgets.dataframeToD3(param.legend);

    g.selectAll(".legend")
      .data(d3data)
      .enter().append("rect")
      .attr("class", "legend")
      .attr("x", 5)
      .attr("y", function(d,i) { return i * (param.square + 10); })
      .attr("width", param.square)
      .attr("height", param.square)
      .attr("fill", function(d, i) { return d.color; });

    g.selectAll(".legtext")
      .data(d3data)
      .enter().append("text")
       .attr("class", "legtext")
       .text(function(d){ return d.text; })
       .attr("font-size", param.fontsize)
       .attr("x", param.square + 10)
       .attr("y", function(d,i) { return  2+ param.square/2 + i * (param.square + 10); })
       .attr("text-anchor", "start");

}

////////////////////////////////////////////////////////////////////////////////
// Colorkey
function draw_d3Colorkey(svg, param, width, height, collection, id){
    var wid = param.keysize.width;
    var hei = param.keysize.height;

    var g = svg.append("g")
    	       .attr("transform", "translate(" + (width - wid)/2 + "," + (height - hei)/2 + ")");

  // scales
    var x = d3.scaleLinear()
              .domain([Math.min.apply(null,param.hist.breaks),
                       Math.max.apply(null,param.hist.breaks)])
              .rangeRound([0, wid]);
    var y = d3.scaleLinear()
              .domain([0, Math.max.apply(null,param.hist.counts) * 1.1])
              .rangeRound([hei, 0]);

    // add the x and y axes
 	g.append("g")
     .attr("class", "axis axis--x")
	 .attr("transform", "translate(0," + hei + ")")
	 .call(d3.axisBottom(x).ticks(4));

	g.append("g")
	 .attr("class", "axis axis--y")
	 .call(d3.axisLeft(y).ticks(4));

    // now add titles to the axes
    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("transform", "translate("+ (((width - wid) / 2) - 30)  +","+ (height/2) + ")rotate(-90)")
       .text(param.ylab);

    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("transform", "translate("+ (width/2) +","+(hei + ((height - hei) / 2) + 30) + ")")
       .text(param.xlab);

    svg.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", "translate("+ (width/2) +","+ (height - hei - ((height - hei) / 2) - 20) + ")")
           .attr("font-size", "12px")
           .attr("font-weight", "bold")
           .text(param.title);

    svg.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", "translate("+ (width/2) +","+ (height - hei - ((height - hei) / 2) - 5 ) +")")
           .attr("font-size", "12px")
           .attr("font-weight", "bold")
           .text(param.subtitle);

    // update the scales
    var col = d3.scaleBand()
                .domain(param.colscale)
                .rangeRound([0, wid]);

    var bar = g.selectAll(".colkey")
               .data(param.colscale)
               .enter().append("g")
               .attr("class", "colkey");

    // add the color bars
    g.selectAll(".bar")
     .data(param.colscale)
     .enter().append("rect")
     .attr("class", "bar")
     .attr("x", function(d) { return col(d); })
     .attr("y", 0)
     .attr("width", col.bandwidth())
     .attr("height", hei)
     .attr("fill", function(d) { return d; });

    // add the histogram lines
    g.selectAll(".countline")
     .data(param.colscale)
     .enter().append("line")
     .attr("class", "countline")
     .attr("x1", function(d) { return col(d); })
     .attr("y1", function(d, i) { return y(param.hist.counts[i]); })
     .attr("x2", function(d) { return col(d) + col.bandwidth(); } )
     .attr("y2", function(d, i) { return y(param.hist.counts[i]); })
     .attr("stroke", "Aqua");

    // add the vertical histogram lines
    g.selectAll(".verticalcount")
     .data(param.colscale)
     .enter().append("line")
     .attr("class", "countline")
     .attr("x1", function(d) { return col(d); })
     .attr("y1", function(d, i) { return i === 0 ? y(0) : y(param.hist.counts[i-1]); })
     .attr("x2", function(d) { return col(d); } )
     .attr("y2", function(d, i) { return y(param.hist.counts[i]); })
     .attr("stroke", "Aqua");
}


////////////////////////////////////////////////////////////////////////////////
// barplot
function draw_d3Barplot(svg, param, width, height, collection, id) {
    var data = param.data;
    var margin = param.margins;
    var top = param.title !== null ? 40 : 0 ;

	var wid = width - margin.left - margin.right;
	var hei = height - margin.top - margin.bottom - top;

    // scales
    var x = d3.scaleBand()
              .domain(data.name)
              .rangeRound([0, wid])
              .padding(param.padding);
    var y = d3.scaleLinear().rangeRound([hei, 0]);

    var g = svg.append("g")
    	       .attr("transform", "translate(" + margin.left + "," + (margin.top + top) + ")");

    //specify the ranges
    if (param.yrange === null){
        y.domain([0, param.max_value]);
    } else {
        y.domain(param.yrange);
    }

    // add the x and y axes
    if (param.show_axes){
     	g.append("g")
	     .attr("class", "axis axis--x")
		 .attr("transform", "translate(0," + hei + ")")
    	 .call(d3.axisBottom(x));

    	g.append("g")
    	 .attr("class", "axis axis--y")
    	 .call(d3.axisLeft(y).ticks(10, param.unit));
    }

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
           .attr("transform", "translate("+ (width/2) +","+((margin.top+top)/3)+")")
           .attr("font-size", "24px")
           .text(param.title);
    }

    if (param.subtitle !== null){
        svg.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", "translate("+ (width/2) +","+(2*(margin.top+top)/3)+")")
           .attr("font-size", "15px")
           .text(param.subtitle);
    }

	var tool_tip = d3.tip()
                     .attr('class', 'd3-tip')
	                 .offset([-10, 0]);

    d3data = HTMLWidgets.dataframeToD3(data);

    if (param.singleVar){
        tool_tip.html(function(d) {
            return "<strong>y:</strong> <span style='color:yellow'>" + d.tooltip + "</span>"; });
        svg.call(tool_tip);

        //add color scale
        var z = d3.scaleOrdinal()
                  .range(param.fill)
                  .domain(data.name);

	    g.selectAll(".bar")
         .data(d3data)
         .enter().append("rect")
         .attr("class", "bar")
         .attr("x", function(d) { return x(d.name); })
         .attr("y", function(d) { return y(d.x); })
         .attr("width", x.bandwidth())
         .attr("height", function(d) { return hei - y(d.x); })
         .attr("fill", function(d) { return z(d.name); })
         .on('mouseover', (param.tooltip) ? tool_tip.show : null)
         .on('mouseout',  (param.tooltip) ? tool_tip.hide : null)
         .on("click", function(d, i) {
                var ret;
                //if this was called by a collection
                if (collection !== 'undefined'){
                    ret = collection.update(collection,id, 'value', i);
                }else{
                    ret = Shiny.onInputChange(param.callback, d.name);
                }
                return ret; });

   } else {
        tool_tip.html(function(d) {
           return "<strong>y:</strong> <span style='color:yellow'>" + d.data.tooltip + "</span>"; });
        svg.call(tool_tip);

        var keys = Object.keys(d3.values(d3data)[0]);
        keys = keys.filter( function(item) {
            return (item !== 'name') && (item !== 'tooltip'); });

        //add color scale
        var cols = d3.scaleOrdinal()
                     .range(param.fill)
                     .domain(keys);

        g.append("g")
         .selectAll("g")
         .data(d3.stack().keys(keys)(d3data))
         .enter().append("g")
         .attr("fill", function(d) { return cols(d.key); })
         .selectAll("rect")
         .data(function(d) { return d; })
         .enter().append("rect")
         .attr("class", "stackbar")
         .attr("x", function(d) { return x(d.data.name); })
         .attr("y", function(d) { return y(d[1]); })
         .attr("height", function(d) { return y(d[0]) - y(d[1]); })
         .attr("width", x.bandwidth())
         .on('mouseover', (param.tooltip) ? tool_tip.show : null)
         .on('mouseout',  (param.tooltip) ? tool_tip.hide : null)
         .on("click", function(d, i) {
               var current = null;
               var counter = 0;
               Object.keys(d.data).forEach(function(key,index) {
                    counter += d.data[key];
                    if(counter === d[1]) {
                        current = key;
                    }
                });

                var ret;
                //if this was called by a collection
                if (collection !== 'undefined'){
                    ret = collection.update(collection, id, 'value', i);
                }else{
                    ret = Shiny.onInputChange(param.callback,
                                           {'x_value' : d.data.name,
                                            'y_value' : current});
                }
                return ret;
            });

    }
}

////////////////////////////////////////////////////////////////////////////////
//boxplot
function draw_d3Boxplot(svg, param, width, height, collection, id) {

    var data = param.data;
    var stats = param.stats;
    var outlier = param.outlier;

    //Special case where there is only one list element
    if (typeof(param.names) === 'string'){
        param.names = [param.names];
        param.col = [param.col];
    }

	var margin = param.margins;
    var top = param.title !== null ? 40 : 0 ;
    var wid = width - margin.left - margin.right;
	var hei = height - margin.top - margin.bottom - top;

    // scales
    var x = d3.scaleBand()
              .domain(param.names)
              .rangeRound([0, wid])
              .padding(0.2);

    var y = d3.scaleLinear()
              .domain([param.range[0],param.range[1]])
              .rangeRound([hei, 0]);

    var g = svg.append("g")
    	       .attr("transform", "translate(" + margin.left + "," + (margin.top + top) + ")");

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
           .attr("transform", "translate("+ (width/2) +","+((margin.top+top)/3)+")")
           .attr("font-size", "24px")
           .text(param.title);
    }

    if (param.subtitle !== null){
        svg.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", "translate("+ (width/2) +","+(2*(margin.top+top)/3)+")")
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
     .on('mouseout', tool_tip.hide)
     .on("click", function(d, i) {
            var ret;
            //if this was called by a collection
            if (collection !== 'undefined'){
                ret = collection.update(collection, id, 'value', i);
            }else{
                ret = Shiny.onInputChange(param.callback, d.name);
            }
            return ret; });

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

////////////////////////////////////////////////////////////////////////////////
//scatter plot
function draw_d3Scatter(svg, param, width, height, collection, id) {
    var data = param.data;
    var d3data = HTMLWidgets.dataframeToD3(data);

    var margin = param.margins;
    var top = param.title !== null ? 40 : 0 ;

	var wid = width - margin.left - margin.right;
	var hei = height - margin.top - margin.bottom - top;

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
    	       .attr("transform", "translate(" + margin.left + "," + (margin.top + top) + ")");

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
           .attr("transform", "translate("+ (width/2) +","+((margin.top+top)/3)+")")
           .attr("font-size", "24px")
           .text(param.title);
    }

    if (param.subtitle !== null){
        svg.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", "translate("+ (width/2) +","+(2*(margin.top+top)/3)+")")
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
            ret += "<strong>"+k+"</strong> <span style='color:red; float:right'>" + d[k] + "</span><br/>"; });
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

////////////////////////////////////////////////////////////////////////////////
//dendrogram
function draw_d3Dendrogram(svg, param, width, height, collection, id) {
    var tree = param.data;

	var margin = param.margins;
    var top = param.title !== null ? 40 : 0 ;

	var wid = width - margin.left - margin.right;
    var hei = height - margin.top - margin.bottom - top;

    // title and subtitle
    if (param.title !== null){
        svg.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", "translate("+ (width/2) +","+((margin.top+top)/3)+")")
           .attr("font-size", "24px")
           .text(param.title);
    }

    if (param.subtitle !== null){
        svg.append("text")
           .attr("text-anchor", "middle")
           .attr("transform", "translate("+ (width/2) +","+((2*(margin.top+top)/3))+")")
           .attr("font-size", "15px")
           .text(param.subtitle);
    }

    //generate a tree
    var cluster = d3.cluster()
                    .separation(function(a, b) { return 1; });

    // adjust direction
    var getX, getY;
    if (param.horiz){
        getX = function(d){return d.y};
        getY = function(d){return d.x};
        cluster.size([hei, wid - (param.label ? param.lab_adj : 0)]);
    }else{
        getX = function(d){return d.x};
        getY = function(d){return d.y};
        cluster.size([wid, hei - (param.label ? param.lab_adj : 0)]);
    }

    var g = svg.append("g")
    	       .attr("transform", "translate(" + margin.left + "," + (margin.top + top) + ")");

    var root = d3.hierarchy(tree, function(d) { return d.children; });
    cluster(root);

    // use the actual heights derived in R
    var tree_hei = root.descendants().map(function(d) { return d.y; });

    var sc = d3.scaleLinear()
               .domain([0,root.data.height])
               .rangeRound([Math.max.apply(null,tree_hei),
                            Math.min.apply(null,tree_hei)]);
    root.each(function(d){ d.y = sc(d.data.height); });

    // add the axis
    if (param.axis){
        if (param.horiz){
	    	g.append("g")
         	 .attr('transform', 'translate(0,' + hei + ')')
	 		 .attr("class", "axis axis--x")
		     .call(d3.axisBottom(sc));
        } else {
            g.append("g")
	         .attr("class", "axis axis--y")
	         .call(d3.axisLeft(sc));
        }
    }

    // generate a connector group
    var link = g.selectAll(".link")
                .data(root.descendants().slice(1))
                .enter().append("g")
                .each(function(d) { d.linkNode = this; })
                .attr("class", "g_dend");


    if (param.classic){
        if (param.horiz){
            // add line from parent
            link.append("line")
                .attr("class", "link link--parent")
                .attr("x1", function(d) { return getX(d.parent); } )
                .attr("y1", function(d) { return getY(d.parent); })
                .attr("x2", function(d, i) { return getX(d.parent); } )
                .attr("y2", function(d) { return getY(d); });

            // add line to child
            link.append("line")
                .attr("class", "link link--child")
                .attr("x1", function(d) { return getX(d.parent); } )
                .attr("y1", function(d) { return getY(d); })
                .attr("x2", function(d, i) { return getX(d); } )
                .attr("y2", function(d) { return getY(d); });
        } else {
            // add line from parent
            link.append("line")
                .attr("class", "link link--parent")
                .attr("x1", function(d) { return getX(d.parent); } )
                .attr("y1", function(d) { return getY(d.parent); })
                .attr("x2", function(d, i) { return getX(d); } )
                .attr("y2", function(d) { return getY(d.parent); });

            // add line to child
            link.append("line")
                .attr("class", "link link--child")
                .attr("x1", function(d) { return getX(d); } )
                .attr("y1", function(d) { return getY(d.parent); })
                .attr("x2", function(d, i) { return getX(d); } )
                .attr("y2", function(d) { return getY(d); });
        }
    } else {
        if (param.horiz) {
            link.append("path")
                .attr("class", "link link--curved")
                .attr("d", function(d) {
                    return "M" + getX(d) + "," + getY(d)
                        + "C" + getX(d.parent) + "," + getY(d)
                        + " " + getX(d.parent) + "," + getY(d.parent)
                        + " " + getX(d.parent) + "," + getY(d.parent); });
        } else {
            link.append("path")
                .attr("class", "link link--curved")
                .attr("d", function(d) {
                    return "M" + getX(d) + "," + getY(d)
                        + "C" + getX(d) + "," + getY(d.parent)
                        + " " + getX(d.parent) + "," + getY(d.parent)
                        + " " + getX(d.parent) + "," + getY(d.parent); });
        }
    }

    //add listener box
    link.append('rect')
        .attr('class', 'click-capture')
        .style('visibility', 'hidden')
        .attr('x', function(d) { return Math.min(getX(d.parent),getX(d)); })
        .attr('y', function(d) { return Math.min(getY(d.parent), getY(d)); })
        .attr('width', function(d) { return Math.abs(getX(d) - getX(d.parent)); })
        .attr('height', function(d) { return Math.abs(getY(d) - getY(d.parent)); });

    // add listeners
    link.on("mouseover", mouseov(true))
        .on("mouseout", mouseov(false))
        .on("click", click());

    // highlighting with mouseover
    function mouseov(active) {
        return function(d) {
            if (param.classic){
                d.each(function(e){d3.select(e.linkNode)
                                     .select(".link--child")
                                     .classed("link--active", active);});
                d.each(function(e){d3.select(e.linkNode)
                                     .select(".link--parent")
                                     .classed("link--active", active);});
            }else{
                d.each(function(e){d3.select(e.linkNode)
                                     .select(".link--curved")
                                     .classed("link--active", active);});
            }
            d.each(function(e){d3.select(e.label)
                                 .classed("label--active", active);});
        };
    }

    // selecting all children when clicking
    function click() {
        return function(d) {
            var labels = d.descendants()
                       .map(function(e) { return e.data.label; })
                       .filter(function(r){ return r !== ""; });
            var ret;
            //if this was called by a collection
            if (collection !== 'undefined'){
                var indices = labels.map(function(lab) { return param.label_text.indexOf(lab); });
                function sortNumber(a,b) {
                    return a - b;
                }
                ret = collection.update(collection, id, 'value', indices.sort(sortNumber));
            //otherwise return to shiny
            }else{
                ret = Shiny.onInputChange(param.callback, labels);
            }
            return ret;
        };
    }

    var node = g.selectAll(".node")
                .data(root.descendants())
                .enter().append("g")
                .attr("class", function(d) { return "node" + (d.children ? "node--internal" : "node--leaf"); })
                .attr("transform", function(d) { return "translate(" + getX(d) + "," + getY(d) + ")"; });

    if (param.label){
        if (param.horiz) {
            node.append("text")
                .each(function(d) { d.label = this; })
                .attr("dy", 3)
                .attr("x", 8)
                .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
                .text(function(d) { return d.data.label; });
        } else {
            node.append("text")
                .each(function(d) { d.label = this; })
                .attr("transform","rotate(270 5,0)")
                .style("text-anchor", "end" )
                .text(function(d) { return d.data.label; });
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
//Image
function draw_d3Image(svg, param, width, height, collection, id) {

    var data = param.data;
    var raw_values = param.raw_values;
	var margin = param.margins;
    var top = param.title !== null ? 40 : 0 ;

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
                 .range([0, wid]);

    //show the labels on the bottom
    if (param.show_xax){
        var xlabels = g.selectAll(".xlab")
                       .data(param.xax)
                       .enter().append("text")
                       .attr("class", "xlab selectlabel")
                       .text(function (d) { return d; })
                       .attr("x", function(d) { return xlab(d) + 0.8 * xlab.bandwidth(); })
                       .attr("y", hei + 3)
                       .attr("transform", function(d) { return "rotate(270," + (xlab(d)  + 0.8 * xlab.bandwidth()) + "," + (hei + 3) + ")"; })
                       .style("text-anchor", "end")
                       .on("click", click("column"))
                       .on("mouseover", mouseov(true))
                       .on("mouseout", mouseov(false));
    }

    var ylab = d3.scaleBand()
                 .domain(param.yax)
                 .range([hei, 0]);

    //show the labels on the right
    if (param.show_yax){
        var ylabels = g.selectAll(".ylab")
                       .data(param.yax)
                       .enter().append("text")
                       .attr("class", "ylab selectlabel")
                       .text(function (d) { return d; })
                       .attr("x", wid + 3)
                       .attr("y", function(d) { return ylab(d)  + 0.8 * ylab.bandwidth(); })
                       .style("text-anchor", "start")
                       .on("click", click("row"))
                       .on("mouseover", mouseov(true))
                       .on("mouseout", mouseov(false));
    }

    // highlighting with mouseover
    function mouseov(active) {
        return function(d) {
            d3.select(this).classed("label--active", active);
        };
    }

    // clicking a label
    function click(click_type) {
        return function(d, i) {
                var ret;
                //if this was called by a collection
                if (collection !== 'undefined'){
                    ret = collection.update(collection,id, click_type, i);
                }else{
                    ret = Shiny.onInputChange(param.callback,
                                              {"type" : click_type,
                                               "value" : d});
                }
                return ret;
        };
    }

    //setting the scales for the actual data
    var x = d3.scaleBand()
              .domain(d3.range(data[0].length))
              .range([0, wid]);
    var y = d3.scaleBand()
              .domain(d3.range(data.length))
              .range([hei, 0]);

    //add tooltip
    var tiphtml = function(d, i) {
        var col = d3.select(this).attr("column");
        row = d3.select(d3.select(this).node().parentNode).attr("row");
        var ret = "";

        if (raw_values !== null){
            var value = raw_values[row][col];
            ret += "<strong>Value:</strong> <span style='color:red; float:right'>" + Math.round(value * 100) / 100 + "</span><br/>";
        }
        if (param.xax !== null){
            ret += "<strong>x-label:</strong> <span style='color:white; float:right'>" + param.xax[col] + "</span><br/>";
        }
        if (param.yax !== null){
            ret += "<strong>y-label:</strong> <span style='color:white; float:right'>" + param.yax[row] + "</span><br/>";
        }
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
                  .style("fill", function(d){ return d; });

    if (raw_values !== null || param.xax !== null || param.yax !== null){
        cell.on('mouseover', tool_tip.show)
            .on('mouseout',  tool_tip.hide);
    }
}


