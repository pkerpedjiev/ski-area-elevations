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

    let labelMarkerId = null;

    function intersectRect(r1, r2, padding) {
        if (arguments.length < 3)
            padding = 0;

        return !(r2.left > (r1.right + padding) || 
                 r2.right < (r1.left - padding) || 
                 r2.top > (r1.bottom + padding) ||
                 r2.bottom < (r1.top - padding));
    }

    function chart(selection) {
        let visibleAreas = selection.data().filter(labelFilter);
        visibleAreas.sort(labelSort);

        // remove all the labels
        labelParent.selectAll('.zoomable-label').remove();

        var textLabels = labelParent.selectAll('.zoomable-label')
        .data(visibleAreas)
        .enter()
        .append('text')
        .classed('zoomable-label', true)
        .attr('id', labelId)
        .attr('text-anchor', labelAnchor)
        .text(labelText)
        .attr('transform', labelPosition);

        textLabels.each(function(d,i) {
            labelParent.select('#' + labelMarkerId(d)).attr('visibility', 'visible');
        });


        textLabels.each(function(d,i) {
            let bb1 = this.getBoundingClientRect();
            let rb1 = labelParent.select('#' + labelMarkerId(d)).node().getBoundingClientRect();

            if (d3.select(this).attr('visibility') == 'hidden')
                return;

            if (labelLeftBoundary != null) {
                // if the label sticks out on the left side, hide it
                if (bb1.left < labelLeftBoundary) {
                    d3.select(this).attr('visibility', 'hidden')
                    d3.select('#' + labelMarkerId(d)).attr('visibility', 'hidden');
                }
            }

            if (labelRightBoundary != null) {
                // if the label sticks out on the left side, hide it
                if (bb1.right > labelRightBoundary) {
                    d3.select(this).attr('visibility', 'hidden')
                    d3.select('#' + labelMarkerId(d)).attr('visibility', 'hidden');
                }
            }

            textLabels.each(function(e,j) {
                if (j <= i)
                    return;

                let bb2 = d3.select(this).node().getBoundingClientRect();
                let rb2 = d3.select('#' + labelMarkerId(e)).node().getBoundingClientRect();

                if (intersectRect(bb1, bb2, 2) || intersectRect(rb1, rb2, 2)) {
                    d3.select(this).attr('visibility', 'hidden');
                    d3.select('#' + labelMarkerId(e)).attr('visibility', 'hidden');
                    return;
                }
            });
        });
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

    return chart;
}

