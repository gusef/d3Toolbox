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
                "classic" : x.classic_tree,
                "label" : x.label
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


        	var margin = {top: 40, right: 20, bottom: 50, left: 60};
	    	var wid = width - margin.left - margin.right;
		    var hei = height - margin.top - margin.bottom;


     	    var g = svg.append("g")
    	    	       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    	    var cluster = d3.cluster()
                .size([hei, wid - 160])
                .separation(function(a, b) { return 1; });


            var root = d3.hierarchy(tree, function(d) { return d.children; })
                         .sum(function(d) { return d.branchset ? 0 : 1; })
                         .sort(function(a, b) { return (a.value - b.value) || d3.ascending(a.data.height, b.data.height); });

            cluster(root);

            var link;
            if (param.classic){
                
                link = g.selectAll(".link")
                        .data(root.descendants().slice(1))
                        .enter().append("g");
                link.append("line")
                        .attr("class", "link")
                        .attr("x1", function(d) { return d.parent.y; } )
                        .attr("y1", function(d) { return d.parent.x; })
                        .attr("x2", function(d, i) { return d.parent.y; } )
                        .attr("y2", function(d) { return d.x; });
                link.append("line")
                    .attr("class", "link")
                    .attr("x1", function(d) { return d.parent.y; } )
                    .attr("y1", function(d) { return d.x; })
                    .attr("x2", function(d, i) { return d.y; } )
                    .attr("y2", function(d) { return d.x; });
                link.on("mouseover", mouseov(true))
                    .on("mouseout", mouseov(false));

            } else {
                
                link = g.selectAll(".link")
                      .data(root.descendants().slice(1))
                    .enter().append("path")
                      .attr("class", "link")
                      .attr("d", function(d) {
                        return "M" + d.y + "," + d.x
                            + "C" + (d.parent.y + 5) + "," + d.x
                            + " " + (d.parent.y + 5) + "," + d.parent.x
                            + " " + d.parent.y + "," + d.parent.x;});
            }
            
            var node = g.selectAll(".node")
                  .data(root.descendants())
                .enter().append("g")
                  .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
                  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

            if (param.label){
                node.append("text")
                    .attr("dy", 3)
                    .attr("x", 8)
                    .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
                    .text(function(d) { return d.data.label; });
            }
            
            function mouseov(active) {
                return function(d) {
                    d3.select(this).classed("link--active", active); };
            }
            
        }
    };
  }
});
