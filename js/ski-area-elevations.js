"use strict";

function skiAreaElevationsPlot() {
    var width = 550;
    var height = 400;
    var minX = 0, maxX = 0, minY = 0, maxY = 0;
    var maxZoom = 1;
    var margin = {'top': 30, 'left': 30, 'bottom': 30, 'right': 40};
    let tileDirectory = null;

    let xOrigScale = null;
    let xScale = null;
    let yScale = null;
    let widthScale = null;

    let loadedTiles = {};

    let minArea = 0;
    let maxArea = 0;
    let xScaleDomain = null;

    let labelSort = (a,b) => { return b.area - a.area; };
    let gMain = null;
    let gResorts = null;
    let shownTiles = new Set();
    let rectId = (d) => { return `r-${d.uid}`; };

    function tileId(tile) {
        // uniquely identify the tile with a string
        return tile.join("/");
    }

    function chart(selection) {
        function isTileLoaded(tile) {
            // check if a particular tile is already loaded
            // go through the shownTiles dictionary to check
            // if this tile is already loaded

            if (tileId(tile) in loadedTiles)
                return true;
            else
                return false;
        }

        function skiAreaMouseover(d, i) {
            d3.select(this)
            .classed('hovered', true);
        }

        function skiAreaMouseout(d) {
            d3.select(this)
            .classed('hovered', false);
        }

        function skiAreaId(d) {
            return d.uid;
        }

        function showTiles(tiles) {
            // refresh the display and make sure the tiles that need to be
            // displayed are displayed
            
            // check to make sure all the tiles we're trying to display
            // are already loaded
            let allLoaded = true;
            tiles.forEach((t) => {
                allLoaded = allLoaded && isTileLoaded(t);
            });
            if (!allLoaded)
                return;
            
            let gTiles = gMain.selectAll('.tile-g')
            .data(tiles, tileId)

            let gTilesEnter = gTiles.enter()
            let gTilesExit = gTiles.exit()

            gTilesEnter.append('g')
            .classed('tile-g', true)
            .each(function(tile) {
                let gTile = d3.select(this);
                let data = loadedTiles[tileId(tile)].shown;

                data.map(function(d) { 
                    d.area = +d.area;
                    d.cumarea = +d.cumarea;
                    //d.cumarea = Math.log(d.area); 
                });

                //let labelSort = (a,b) => { return b.area - a.area; };
                let elevationSort = (a,b) => { return b.max_elev - a.max_elev; };
                data.sort(elevationSort);

                gResorts = gTile.selectAll('.resort-g')
                .data(data, skiAreaId)
                .enter()
                .append('g')
                .classed('resort-g', true)
                .attr("clip-path", "url(#clip)")

                // the rectangle showing each rect
                gResorts.append('rect')
                .classed('resort-rect', true)
                .attr('id', rectId)
                .on('mouseover', skiAreaMouseover)
                .on('mouseout', skiAreaMouseout);

                var textLabels = gResorts
                .append('text')
                .classed('zoomable-label', true)
                .attr('id', labelId)
                .attr('text-anchor', labelAnchor)
                .text(labelText)
                .attr('visibility', 'hidden')
                .each((d) => { d.shown = false; d.shownTime = null});
            })

            gTilesExit.remove();
            
            // only redraw if the tiles have changed
            if (gTilesEnter.size() > 0 || gTilesExit.size() > 0) {
                /*
                tiles.forEach((t) => {
                    console.log('t:', t);
                });
                */
                draw();
            }
        }

        function removeTile(tile) {
            // remove all of the elements associated with this tile
            //
        }

        function refreshTiles(currentTiles) {
            // be shown and add those that should be shown
            currentTiles.forEach((tile) => {
                if (!isTileLoaded(tile)) {
                    // if the tile isn't loaded, load it
                    d3.json(tileDirectory + `/${tile[0]}/${tile[1]}.json`,
                            function(error, data) {
                                loadedTiles[tileId(tile)] = data;
                                showTiles(currentTiles);
                            });
                } else {
                    showTiles(currentTiles);
                }
            });
        }

        // setup the data-agnostic parts of the chart
        var svg = selection.append('svg')
        var gEnter = svg.append("g");

        svg.attr('width', width)
        .attr('height', height);

        var zoom = d3.behavior.zoom()
        .on("zoom", zoomed);

        gEnter.insert("rect", "g")
        .attr("class", "pane")
        .attr("width", width)
        .attr("height", height)
        .attr('pointer-events', 'all')

        gEnter.call(zoom);

        var gYAxis = gEnter.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (width - margin.right) + "," + margin.top + ")");

        gMain = gEnter.append('g')
        .classed('main-g', true)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        gMain.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", -margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", height);


        d3.json(tileDirectory + '/tile_info.json', function(error, tile_info) {
            // set up the data-dependent sections of the chart
            minX = tile_info.min_pos;
            maxX = tile_info.max_pos + 0.001;

            minY = tile_info.min_y;
            maxY = tile_info.max_y;

            minArea = tile_info.min_importance;
            maxArea = tile_info.max_importance;

            maxZoom = tile_info.max_zoom;

            xScaleDomain = [minX, maxX];

            yScale = d3.scale.linear()
            .domain([minY, maxY])
            .range([height - margin.top - margin.bottom, 0]);

            widthScale = d3.scale.linear()
            .domain([0, Math.log(maxArea)])
            .range([1, 7]);

            xScale = d3.scale.linear()
            .domain(xScaleDomain)
            .range([0, width - margin.left - margin.right]);

            xOrigScale = xScale.copy();

            zoom.x(xScale).scaleExtent([1,Math.pow(2, maxZoom)])
            //.xExtent(xScaleDomain);

            var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("right")
            .tickSize(-(width - margin.left - margin.right))
            .tickPadding(6);

            gYAxis.call(yAxis);

            refreshTiles([[0,0]]);
        });

        function zoomed() {
            var reset_s = 0;

          if ((xScale.domain()[1] - xScale.domain()[0]) >= (maxX - minX)) {
            zoom.x(xScale.domain([minX, maxX]));
            reset_s = 1;
          }
          if ((yScale.domain()[1] - yScale.domain()[0]) >= (maxY - minY)) {
            //zoom.y(yScale.domain([minY, maxY]));
            reset_s += 1;
          }
          if (reset_s == 2) { // Both axes are full resolution. Reset.
            zoom.scale(1);
            zoom.translate([0,0]);
          }
          else {
            if (xScale.domain()[0] < minX) {
              xScale.domain([minX, xScale.domain()[1] - xScale.domain()[0] + minX]);
              zoom.translate([minX, zoom.translate()[1]]);
            }
            if (xScale.domain()[1] > maxX) {
              var xdom0 = xScale.domain()[0] - xScale.domain()[1] + maxX;
              xScale.domain([xdom0, maxX]);

              zoom.translate([xOrigScale.range()[0] - xOrigScale(xScale.domain()[0] * zoom.scale()),
                              xScale.domain()[1]])
            }
            if (yScale.domain()[0] < minY) {
              yScale.domain([minY, yScale.domain()[1] - yScale.domain()[0] + minY]);
            }
            if (yScale.domain()[1] > maxY) {
              var ydom0 = yScale.domain()[0] - yScale.domain()[1] + maxY;
              yScale.domain([ydom0, maxY]);
            }
          }

            draw();
        }

        let labelFilter =  (d) => {
            if ((d.cumarea - Math.log(d.area)) > xScale.invert(0) &&
                (d.cumarea) < xScale.invert(width - margin.left - margin.right))
            return true;
            return false;
        }
        let labelText = (d) => { return d.name; };
        let labelAnchor = (d) => { return 'middle' };
        let labelId = (d) => { return `n-${d.uid}`; };

        var zoomableLabelsOrientation = zoomableLabels()
        .labelLeftBoundary(margin.left / 3)
        .labelRightBoundary(width - margin.right / 3)
        .labelFilter((d) => { return true; })
        .labelText(labelText)
        .labelAnchor(labelAnchor)
        .labelId(labelId)
        .labelParent(gMain)
        .labelSort(labelSort)
        .labelMarkerId(rectId)
        .labelClass('.zoomable-label');

        function draw() {
            // draw the scene, if we're zooming, then we need to check if we
            // need to redraw the tiles, otherwise it's irrelevant
            function scaledX(d,i) {
                return xScale(d.cumarea) - (xScale(Math.log(d.area)) - xScale(0));
            }

            function rectWidth(d,i) {
                return xScale(Math.log(d.area)) - xScale(0); 
            }

            gMain.selectAll('.resort-rect')
            .attr('x', scaledX)
            .attr('y', (d) => { return yScale(d.max_elev); })
            //.attr('width', rectWidth)
            .attr('width', (w) => { return(widthScale(Math.log(w.area))); })
            .attr('height', (d) => { return yScale(d.min_elev) - yScale(d.max_elev);  })
            .classed('resort-rect', true)

            gResorts = gMain.selectAll('.resort-g');

            let labelPosition = (d,i) => { 
                return `translate(${scaledX(d,i) + widthScale(Math.log(d.area)) / 2},
                ${yScale(d.max_elev) - 7})`;
            }

            let textLabels = gResorts.selectAll('.zoomable-label')
                .attr('transform', labelPosition)

            zoomableLabelsOrientation
            .labelPosition(labelPosition);

            gResorts.call(zoomableLabelsOrientation);

            // this will become the tiling code
            let zoomLevel = Math.round(Math.log(zoom.scale()) / Math.LN2) + 2;

            // the ski areas are positioned according to their
            // cumulative widths, which means the tiles need to also
            // be calculated according to cumulative width
            let totalWidth = maxX - minX;

            var tileWidth = totalWidth /  Math.pow(2, zoomLevel);
            let epsilon = 0.000001;
            let rows = d3.range(Math.floor(zoom.x().domain()[0] / tileWidth),
                                Math.ceil((zoom.x().domain()[1] - epsilon) / tileWidth));

            // hey hye
            let tiles = [];
            rows.forEach((r) => { tiles.push([zoomLevel, r]);});

            refreshTiles(tiles);
        }
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

    chart.minX = function(_) {
        if (!arguments.length) return minX;
        minX = _;
        return chart;
    };

    chart.maxX = function(_) {
        if (!arguments.length) return maxX;
        maxX = _;
        return chart;
    };

    chart.maxZoom = function(_) {
        if (!arguments.length) return maxZoom;
        maxZoom = _;
        return chart;
    };

    chart.tileDirectory = function(_) {
        if (!arguments.length) return tileDirectory;
        tileDirectory = _;
        return chart;
    };

    return chart;
}
