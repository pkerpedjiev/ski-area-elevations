#!/usr/bin/python

import json
import sys
import argparse

def make_search_tiles(entries, options, zoom_level):
    '''
    Make tiles for search the names in the json_file.

    :param entries: A list of json objects
    :param options: A set of options (i.e. output_dir, etc...) indicating how
                    the tiles should be created
    :return: A list of tiles
    '''
    # group each entry in json_file according to its starting letter
    ngrams = set([entry[options.name][:zoom_level] for entry in entries])

    tile = {}
    tile['zoom'] = zoom_level
    tile['shown'] = sorted(entries, key=lambda x: -float(x[options.importance]))[:options.max_entries_per_tile]

    tiles = [tile]

    for ngram in ngrams:
        sub_json = filter(lambda x: x[options.name][:zoom_level] == ngram, entries)

        if zoom_level < options.max_zoom:
            tiles += make_search_tiles(sub_json, options, zoom_level+1)

    return tiles

    # recurse further down

def main():
    parser = argparse.ArgumentParser(description="""
    
    python make_search_tiles.py processed-ski-area-elevations.json

    Create jsons for searching for ski areas. These will consist
    of all the n-grams found in the ski area names.
""")

    parser.add_argument('json_file', nargs=1)
    parser.add_argument('-n', '--name', default='name',
            help='The field in the json entry which specifies its name')
    parser.add_argument('-o', '--output-dir', 
            help="The directory into which to place the output files",
            required=True)

    #parser.add_argument('-o', '--options', default='yo',
    #					 help="Some option", type='str')
    #parser.add_argument('-u', '--useless', action='store_true', 
    #					 help='Another useless option')

    args = parser.parse_args()

    with open(args.json_file[0], 'r') as f:
        json_file = json.load(f)

    tiles = make_search_tiles(json_file, args.output_dir)

if __name__ == '__main__':
    main()


