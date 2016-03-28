var bestPictures = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/films/post_1960.json',
    remote: {
        url: '../data/films/queries/%QUERY.json',
        wildcard: '%QUERY'
    }
});

$('#remote .typeahead').typeahead(null, {
    name: 'best-pictures',
    display: 'value',
    source: bestPictures
});
