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

            // scales
        	var y = d3.scaleOrdinal()
                      .domain([0, data[0].length - 1])
        	          .range([hei, 0]);

        	//add color scale
      	    var col = d3.scaleOrdinal()
      	              .domain(d3.extent([].concat.apply([], data)))
        	          .range(param.colors);

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

            //show the labels on the bottom
            if (param.show_xax){
                var x = d3.scaleBand()
                          .domain(param.xax)
                          .rangeRound([0, wid]);
                var xlabels = g.selectAll(".xlab")
                  .data(param.xax)
                  .enter().append("text")
                   .attr("class", "xlab")
                   .text(function (d) { return d; })
                   .attr("x", function(d) { return x(d); })
                   .attr("y", hei)
                   .attr("transform", function(d) { return "rotate(270," + x(d) + "," + hei + ")"; })
                   .style("text-anchor", "end");
            }

            //show the labels on the right
            if (param.show_yax){
                var y = d3.scaleBand()
                          .domain(param.yax)
                          .rangeRound([0, hei]);
                var ylabels = g.selectAll(".ylab")
                  .data(param.yax)
                  .enter().append("text")
                   .attr("class", "ylab")
                   .text(function (d) { return d; })
                   .attr("x", wid)
                   .attr("y", function(d) { return y(d); })
                   .style("text-anchor", "start");
            }


            d3data = HTMLWidgets.dataframeToD3(data);

        }
    };
  }
});
