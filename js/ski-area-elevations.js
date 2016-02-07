"use strict";

function skiAreaElevationsPlot() {
    var width = 550;
    var height = 400;
    var margin = {'top': 30, 'left': 30, 'bottom': 30, 'right': 40};
    
    function chart(selection) {
        selection.each(function(data) {
            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");

            svg.attr('width', width)
            .attr('height', height);

            var zoom = d3.behavior.zoom()
                .on("zoom", draw);

            data = Object.keys(data).map(function(key) {
                    return data[key];
            }).sort(function(a,b) {
                return b.max_elev - a.max_elev; 
            });

            gEnter.insert("rect", "g")
            .attr("class", "pane")
            .attr("width", width)
            .attr("height", height)
            .attr('pointer-events', 'all')
            
            gEnter.call(zoom);

            var yScale = d3.scale.linear()
            .domain([0, d3.max(data.map(function(d) { return d.max_elev; }))])
            .range([height - margin.top - margin.bottom, 0]);

            data.map(function(d) { 
                d.area = +d.area + 1.8;
                d.cumarea = Math.log(d.area); 
            });

            var widthScale = d3.scale.linear()
            .domain([0, Math.log(d3.max(data.map(function(d) { return d.area; })))])
            .range([1, 10]);


            var cumWidths = data.reduce(function(r, a) {
                if (r.length > 0)
                    a.cumarea += r[r.length - 1] + 2;

                r.push(+a.cumarea);
                return r;
                }, []);

            var totalWidth = cumWidths[cumWidths.length - 1] + 
                Math.log(data[data.length - 1].area);

            var xScaleDomain = [-totalWidth / 10, cumWidths[cumWidths.length - 1] + totalWidth / 10];

            var xScale = d3.scale.linear()
            .domain(xScaleDomain)
            .range([0, width - margin.left - margin.right]);

            zoom.x(xScale).scaleExtent([1,data.length / 10])
            .xExtent(xScaleDomain);

            var gYAxis = gEnter.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")");

            var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("right")
            .tickSize(-(width - margin.left - margin.right))
            .tickPadding(6);

            gYAxis.call(yAxis);


            var gMain = gEnter.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            gMain.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", -margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height);

            function skiAreaMouseover(d, i) {
                /*
                gMain.selectAll('#n-' + d.uid)
                .attr('visibility', 'visible');
                */

                d3.select(this)
                .classed('hovered', true);
            }

            function skiAreaMouseout(d) {
                /*
                gMain.selectAll('#n-' + d.uid)
                .attr('visibility', resortVisibility);
                */

                d3.select(this)
                .classed('hovered', false);
            }

    function intersectRect(r1, r2) {
        return !(r2.left > r1.right || 
                 r2.right < r1.left || 
                 r2.top > r1.bottom ||
                 r2.bottom < r1.top);
    }


            var gResorts = gMain.selectAll('.resort-g')
            .data(data)
            .enter()
            .append('g')
            .attr("clip-path", "url(#clip)");

            // the rectangle showing each rect
            gResorts.append('rect')
            .classed('resort-rect', true)
            .on('mouseover', skiAreaMouseover)
            .on('mouseout', skiAreaMouseout);

            let labelSort = (a,b) => { return b.area - a.area; };
            data.sort(labelSort);

            draw();

            function draw() {
                function scaledX(d,i) {
                    return xScale(d.cumarea) - (xScale(Math.log(d.area)) - xScale(0));
                }

                function rectWidth(d,i) {
                    return xScale(Math.log(d.area)) - xScale(0); 
                }


                gMain.selectAll('.resort-rect')
                .attr('x', scaledX)
                .attr('y', (d) => { return yScale(d.max_elev); })
                .attr('width', rectWidth)
                .attr('height', (d) => { return yScale(d.min_elev) - yScale(d.max_elev);  })
                .classed('resort-rect', true)

                let labelFilter =  (d) => {
                    if ((d.cumarea - Math.log(d.area)) > xScale.invert(0) &&
                        (d.cumarea) < xScale.invert(width - margin.left - margin.right))
                        return true;
                    return false;
                }
                let labelText = (d) => { return d.name; };
                let labelAnchor = (d) => { return 'middle' };
                let labelId = (d) => { return `n-${d.uid}`; }
                let labelPosition = (d,i) => { 
                    return `translate(${scaledX(d,i) + rectWidth(d,i) / 2},
                                      ${yScale(d.max_elev) - 7})`;
                }

                var zoomableLabelsOrientation = zoomableLabels()
                .labelFilter(labelFilter)
                .labelText(labelText)
                .labelAnchor(labelAnchor)
                .labelId(labelId)
                .labelPosition(labelPosition)
                .labelParent(gMain)
                .labelSort(labelSort);

                gResorts.call(zoomableLabelsOrientation);
            }
        });
    }

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    return chart;
}
