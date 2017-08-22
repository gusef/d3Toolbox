HTMLWidgets.widget({

    name: 'd3Dendrogram',

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
            this.tree = x.tree;

           	this.param = {
           	    "horiz" : x.horiz,
                "label" : x.label,
                "lab_adj" : x.lab_adj,
                "classic" : x.classic_tree,
                "axis" : x.axis,
                "title" : x.title,
                "subtitle" : x.subtitle,
                "margins" : x.margins,
                "callback" : x.callback_handler
            };

            this.redraw(this.tree, this.param, wid, hei);
        },

        resize: function(width, height) {
            el.innerHTML = '';
            wid = width;
            hei = height;
            svg  = d3.select(el).append("svg")
    	             .attr("width", width)
    	             .attr("height", height);
	        this.redraw(this.tree, this.param, wid, hei);
        },

        redraw: function(tree, param, width, height) {

        	var margin = param.margins;

    		//if there is a title add more margin
    		if (param.title !== ''){
    		    margin.top += 40;
    		}

	    	var wid = width - margin.left - margin.right;
		    var hei = height - margin.top - margin.bottom;

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
    	    	       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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
                    var ret = d.descendants()
                               .map(function(e) { return e.data.label; })
                               .filter(function(r){ return r !== ""; });
                    Shiny.onInputChange(param.callback,ret);
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
    };
  }
});
