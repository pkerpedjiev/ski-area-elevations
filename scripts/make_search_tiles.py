#!/usr/bin/python

import json
import sys
import argparse

def make_search_tiles(json_file, output_dir):
    '''
    Make tiles for search the names in the json_file.

    :param json_file: A list of json objects
    :param output_dir: An output directory to store the tiles
    :return: Nothing, the tiles will be stored in output_dir
    '''
    # group each entry in json_file according to its starting letter

    # recurse further down

def main():
    parser = argparse.ArgumentParser(description="""
    
    python make_search_tiles.py processed-ski-area-elevations.json

    Create jsons for searching for ski areas. These will consist
    of all the n-grams found in the ski area names.
""")

    parser.add_argument('json_file', nargs=1)
    parser.add_option('-n', '--name', default='name',
            help='The field in the json entry which specifies its name')
    parser.add_option('-o', '--output-dir', 
            help="The directory into which to place the output files",
            required=True)

    #parser.add_argument('-o', '--options', default='yo',
    #					 help="Some option", type='str')
    #parser.add_argument('-u', '--useless', action='store_true', 
    #					 help='Another useless option')

    args = parser.parse_args()
    print "args:", args

    with open(args.json_file, 'r') as f:
        json_file = json.load(f)

    tiles = make_search_tiles(json_file)

if __name__ == '__main__':
    main()


