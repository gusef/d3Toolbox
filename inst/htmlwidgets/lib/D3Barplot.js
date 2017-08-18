HTMLWidgets.widget({

  name: 'D3Barplot',

  type: 'output',

  factory: function(el, width, height) {

    var svg  = d3.select(el).append("svg")
                 .attr("width",width)
                 .attr("height",height);
    var data = null;
    var param = null;

    return{
        renderValue: function(x) {
           	this.data = x.data;
           	this.param = {"tooltip" : x.tooltip !== '',
           	              "singleVar" : Object.keys(this.data).length == 1,
           	              "fill" : x.fill,
           	              "unit" : x.unit,
           	              "xlab" : x.xlab,
                          "ylab" : x.ylab,
                          "yrange" : x.yrange,
                          "padding" : x.padding,
           	              "title" : x.title,
           	              "subtitle" : x.subtitle,
                          "max_value" : x.max_value,
           	              "callback" : x.callback_handler
           	    };

           	//add the row names
           	this.data.name = x.name;

           	//if there are tooltips add them
           	if (this.param.tooltip){
           	    this.data.tooltip = x.tooltip;
           	}
           	this.redraw(this.data, this.param, width, height);
        },
        resize: function(width, height) {
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

            // scales
            var x = d3.scaleBand().rangeRound([0, wid]).padding(param.padding);
        	var y = d3.scaleLinear().rangeRound([hei, 0]);

      	    var g = svg.append("g")
		    	       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //specify the ranges
	   	    x.domain(data.name);
	   	    if (param.yrange === null){
                y.domain([0, param.max_value]);
            } else {
                y.domain(param.yrange);
            }

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
           if (param.title !== ''){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate("+ (width/2) +","+((margin.top/3))+")")
                    .attr("font-size", "24px")
                    .text(param.title);
           }

           if (param.subtitle !== ''){
                svg.append("text")
                    .attr("text-anchor", "middle")
                    .attr("transform", "translate("+ (width/2) +","+((2*margin.top/3))+")")
                    .attr("font-size", "15px")
                    .text(param.subtitle);
           }

	       var tool_tip = d3.tip()
    	                    .attr('class', 'd3-tip')
			                .offset([-10, 0]);

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
                      .on("click", function(d) { return Shiny.onInputChange(param.callback, d.name)});

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
                      .on("click", function(d) { 
                                     var current = null;
                                     var counter = 0;
                                     Object.keys(d.data).forEach(function(key,index) {
                                        counter += d.data[key];
                                        if(counter === d[1]) {
                                            current = key;
                                        }   
                                     });
                                     return Shiny.onInputChange(param.callback,
                                                                {'x_val' : d.data.name,
                                                                 'y_val' : current
                                                                });
                                }); 

            }
   	    }
     };
   }
});
