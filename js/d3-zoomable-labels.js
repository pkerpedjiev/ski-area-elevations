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

    let labelMarkerId = null;
    let previouslyVisible = {};

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
        //let visibleAreas = selection.data().filter(labelFilter);
        //visibleAreas.sort(labelSort);

        // remove all the labels
        //labelParent.selectAll('.zoomable-label').remove();


        /*
        textLabels.each(function(d,i) {
            labelParent.select('#' + labelMarkerId(d)).attr('visibility', 'visible');
        });
        */

       // go through 
        let textLabels = selection.selectAll(labelClass)
        .attr('visibility', 'visible');

        textLabels.each(function(d) {
            if (d.uid in previouslyVisible)
                d.shown = true;
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
                    //console.log('intersection:', d.name, e.name, bb1, bb2);
                }

                if (e.shown && intersectRect(rb1, rb2, 2)) {
                    //rectIntersect = true;
                }

            });

            if (!labelIntersect && !rectIntersect) {
                d.shown = true;
                let date = new Date();
                if (!(d.uid in previouslyVisible)) {
                    previouslyVisible[d.uid] = date.getTime();
                    console.log('dt:', previouslyVisible[d.uid]);
                }
            } else {
            }
        });

        textLabels.filter((d) => { return !d.shown; })
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

    return chart;
}

