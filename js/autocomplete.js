if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

var bestPictures = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '/jsons/autocomplete-suggestions/ac_.json',
    remote: {
        url: '/jsons/autocomplete-suggestions/ac_%QUERY.json',
        wildcard: '%QUERY',
        prepare: (query, settings) => {
            // replace multiple spaces with a single underscore

            let tokenizer = Bloodhound.tokenizers.whitespace;
            let filename = tokenizer(query.trim()).join('_')
            let url = settings.url.replace('%QUERY', filename)

            settings.url = url;

            return settings;
        }
    }
});

