"use strict";

function skiAreaElevationsPlot() {
    var width = 550;
    var height = 400;
    var minX = 0, maxX = 0, minY = 0, maxY = 0;
    var maxZoom = 1;
    var margin = {'top': 30, 'left': 30, 'bottom': 30, 'right': 40};
    let tileDirectory = null;

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

        function showTile(tile) {
            // load a tile [zoom_level, position]
            //
            // Create all of the svg elements needed to display this tile
            // this should just be the rectangles and the labels associated
            // with each ski area
            if (shownTiles.has(tileId(tile)))
                return;
            else
                shownTiles.add(tileId(tile));

            let data = loadedTiles[tileId(tile)].shown;

            data.map(function(d) { 
                d.area = +d.area;
                d.cumarea = +d.cumarea;
                //d.cumarea = Math.log(d.area); 
            });

            //let labelSort = (a,b) => { return b.area - a.area; };
            let elevationSort = (a,b) => { return b.max_elev - a.max_elev; };
            data.sort(elevationSort);

            gResorts = gMain.selectAll('.resort-g')
            .data(data)
            .enter()
            .append('g')
            .attr("clip-path", "url(#clip)");

            // the rectangle showing each rect
            gResorts.append('rect')
            .classed('resort-rect', true)
            .on('mouseover', skiAreaMouseover)
            .on('mouseout', skiAreaMouseout);

            draw();
        }

        function removeTile(tile) {
            // remove all of the elements associated with this tile
            //
        }

        function refreshTiles(currentTiles) {
            // go through all the shown tiles and remove those that shouldn't
            // be shown and add those that should be shown
            currentTiles.forEach((tile) => {
                if (!isTileLoaded(tile)) {
                    // if the tile isn't loaded, load it
                    d3.json(tileDirectory + `/${tile[0]}/${tile[1]}.json`,
                            function(error, data) {
                                console.log('loaded:', tile);
                                loadedTiles[tileId(tile)] = data;
                                showTile(tile);
                            });
                } else {
                    showTile(tile);
                }
            });
        }

        // setup the data-agnostic parts of the chart
        var svg = selection.append('svg')
        var gEnter = svg.append("g");

        svg.attr('width', width)
        .attr('height', height);

        var zoom = d3.behavior.zoom()
        .on("zoom", draw);

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
            maxX = tile_info.max_pos;

            minY = tile_info.min_y;
            maxY = tile_info.max_y;

            minArea = tile_info.min_area;
            maxArea = tile_info.max_area;

            maxZoom = tile_info.max_zoom;

            xScaleDomain = [minX, maxX];

            yScale = d3.scale.linear()
            .domain([minY, maxY])
            .range([height - margin.top - margin.bottom, 0]);

            widthScale = d3.scale.linear()
            .domain([0, Math.log(maxArea)])
            .range([1, 10]);

            xScale = d3.scale.linear()
            .domain(xScaleDomain)
            .range([0, width - margin.left - margin.right]);

            zoom.x(xScale).scaleExtent([1,Math.pow(2, maxZoom)])
            .xExtent(xScaleDomain);

            var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("right")
            .tickSize(-(width - margin.left - margin.right))
            .tickPadding(6);

            gYAxis.call(yAxis);

            refreshTiles([[0,0]]);
        });



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

            // this will become the tiling code
            let zoomLevel = Math.round(Math.log(zoom.scale()) / Math.LN2);
            console.log('zoom.scale', zoom.scale(), zoomLevel);
            console.log('zoom', zoom.x().domain());

            // the ski areas are positioned according to their
            // cumulative widths, which means the tiles need to also
            // be calculated according to cumulative width
            let totalWidth = maxX - minX;

            var tileWidth = totalWidth /  Math.pow(2, zoomLevel);
            console.log('totalWidth:', totalWidth, 'tileWidth:', tileWidth);
            let rows = d3.range(Math.floor(zoom.x().domain()[0] / tileWidth),
                                Math.ceil(zoom.x().domain()[1] / tileWidth));

                                // hey hye
                                let tiles = [];
                                rows.forEach((r) => { tiles.push([zoomLevel, r]);});
                                tiles.forEach((t) => {
                                    console.log('t:', t);
                                });

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
