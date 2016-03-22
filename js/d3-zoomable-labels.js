"use strict";

function zoomableLabels() {
    let labelFilter = null;
    let labelText = null;
    let labelAnchor = null;
    let labelId = null;
    let labelPosition = null;
    let labelParent = null
    let labelSort = null;
    let labelLeftBoundary = null;
    let labelRightBoundary = null;
    let labelClass = 'zoomable-label';
    let markerClass = 'resort-rect';

    let labelMarkerId = null;
    let previouslyVisible = {};
    let markerPreviouslyVisible = {};

    function intersectRect(r1, r2, padding) {
        if (arguments.length < 3)
            padding = 0;

        if (r1.width == 0 || r2.width == 0)
            return false;

        return !(r2.left > (r1.right + padding) || 
                 r2.right < (r1.left - padding) || 
                 r2.top > (r1.bottom + padding) ||
                 r2.bottom < (r1.top - padding));
    }

    function chart(selection) {
       // go through 
        let textLabels = selection.selectAll(labelClass)
        .attr('visibility', 'visible');

        let markerObjs = selection.selectAll(markerClass)
        .attr('visibility', 'visible');

        textLabels.each(function(d) {
            if (d.uid in previouslyVisible)
                d.shown = true;
        });

        markerObjs.each(function(d) {
            if (d.uid in markerPreviouslyVisible)
                d.markerShown = true;
        });

        textLabels.each(function(d) {
            let bb1 = this.getBoundingClientRect();
            let rb1 = labelParent.select('#' + labelMarkerId(d)).node().getBoundingClientRect();

            let rectIntersect = false;
            let labelIntersect = false;

            textLabels.each(function(e) {
                if (d == e)
                    return;

                let bb2 = d3.select(this).node().getBoundingClientRect();
                let rb2 = d3.select('#' + labelMarkerId(e)).node().getBoundingClientRect();

                if (e.shown && intersectRect(bb1, bb2, 2)) {
                    labelIntersect = true;

                    if (d.shown) {
                        if (previouslyVisible[d.uid] < previouslyVisible[e.uid])
                            e.shown = false;
                    }
                }

                if (e.markerShown && intersectRect(rb1, rb2, 1)) {

                    if (d.shown) {
                        if (previouslyVisible[d.uid] < previouslyVisible[e.uid])
                            e.shown = false;
                    }

                    if (d.markerShown) {
                        if (markerPreviouslyVisible[d.uid] < markerPreviouslyVisible[e.uid])
                            e.markerShown = false;
                    }

                    rectIntersect = true;
                }

            });

            let date = new Date();
            if (!labelIntersect && !rectIntersect) {
                d.shown = true;
                d.markerShown = true;

                if (!(d.uid in previouslyVisible)) {
                    previouslyVisible[d.uid] = date.getTime();
                    markerPreviouslyVisible[d.uid] = date.getTime();
                }
            } else if (!rectIntersect) {
                d.markerShown = true;

                if (!(d.uid in previouslyVisible)) {
                    markerPreviouslyVisible[d.uid] = date.getTime();
                }
            }
        });

        textLabels.filter((d) => { return !d.shown; })
        .attr('visibility', 'hidden');

        markerObjs.filter((d) => { return !d.markerShown; })
        .attr('visibility', 'hidden');


    }

    chart.labelFilter = function(_) {
        if (!arguments.length) return labelFilter;
        labelFilter = _;
        return chart;
    }

    chart.labelText = function(_) {
        if (!arguments.length) return labelText;
        labelText = _;
        return chart;
    }

    chart.labelAnchor = function(_) {
        if (!arguments.length) return labelAnchor;
        labelAnchor = _;
        return chart;
    }
    
    chart.labelId = function(_) {
        if (!arguments.length) return labelId;
        labelId = _;
        return chart;
    }

    chart.labelPosition = function(_) {
        if (!arguments.length) return labelPosition;
        labelPosition = _;
        return chart;
    }

    chart.labelParent = function(_) {
        if (!arguments.length) return labelParent;
        labelParent = _;
        return chart;
    }

    chart.labelSort = function(_) {
        if (!arguments.length) return labelSort;
        labelSort = _;
        return chart;
    }
    
    chart.labelLeftBoundary = function(_) {
        if (!arguments.length) return labelLeftBoundary;
        labelLeftBoundary = _;
        return chart;
    }

    chart.labelRightBoundary = function(_) {
        if (!arguments.length) return labelRightBoundary;
        labelRightBoundary = _;
        return chart;
    }

    chart.labelMarkerId = function(_) {
        if (!arguments.length) return labelMarkerId;
        labelMarkerId = _;
        return chart;
    }

    chart.labelClass = function(_) {
        if (!arguments.length) return labelClass;
        labelClass = _;
        return chart;
    }

    chart.markerClass = function(_) {
        if (!arguments.length) return markerClass;
        markerClass = _;
        return chart;
    }

    return chart;
}

