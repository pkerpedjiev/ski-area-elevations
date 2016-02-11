#!/usr/bin/python

import json
import sys
from optparse import OptionParser

def make_tiles(entries, options, zoom_level, start_x, end_x):
    """
    Create tiles for all of the passed in entries.

    If the passed in entries have the following positions and areas:

    3 15.99
    0 7.27
    5 3.88
    6 3.05
    4 3.02
    1 2.99
    2 2.48

    0 1 2 3 4 5 6

    And we only allow one area per tile, then the returned
    tiles will be:

    Left: always from start(parent) to start(parent) + (end(parent) - start(parent) / 2)
    right: always from (end(parent) - start(parent) / 2) + 1 to end(parent)
    shown: the ones with the maximum values within that tile


    {shown: [3], from: 0, to: 6, zoom: 0,
        left: { shown: [3], from: 0, to: 3, zoom: 1
           left: { from: 0, to: 1, shown: [0], zoom: 1
              left: {from: 0, to: 0, shown: [0] }
              right: {from: 1, to 1, shown: [1] }
           }
           right: { from: 2, to: 3, shown: [2] 
              left { from: 2, to: 2, shown: [2] },
              right { from 3, to: 3, shown: [3] }
           }
        }
        right:  { shown: [4], from: 4, to: 7,

        }
    }

    :entries: The list of objects to make tiles for
    :options: Options passed in to the program
    :zoom_level: The current zoom level
    :start_x: The initial x position
    :end_x: The final x position
    :returns:
    """
    # show only a subset of the entries that fall within this tile
    tile = {}
    tile['shown'] = sorted(entries, key=lambda x: x[options.importance])[:options.max_entries_per_tile]
    tile['start_x'] = start_x
    tile['end_x'] = end_x
    tile['zoom'] = zoom_level

    midpoint = (end_x - start_x) / 2

    left_entries = filter(lambda x: x[options.position] <= midpoint, entries)
    right_entries = filter(lambda x: x[options.position] > midpoint, entries)

    if zoom < options.max_zoom:
        tiles += make_tiles(left_entries, options, zoom_level+1, start_x = start_x,
                end_x = midpoint)
        tiles += make_tiles(right_entries, options, zoom_level+1, start_x = midpoint,
                end_x = end_x)

    pass

def main():
    usage = """
    python make_tiles.py json_file

    Create tiles for all of the entries in the JSON file.
    """
    num_args= 1
    parser = OptionParser(usage=usage)

    #parser.add_option('-o', '--options', dest='some_option', default='yo', help="Place holder for a real option", type='str')
    #parser.add_option('-u', '--useless', dest='uselesss', default=False, action='store_true', help='Another useless option')
    parser.add_option('-i', '--importance', dest='importance', default='importance',
            help='The field in each JSON entry that indicates how important that entry is',
            type='string')
    parser.add_option('-p', '--position', dest='position', default='position',
            help='Where this entry would be placed on the x axis',
            type='string')
    parser.add_option('-e', '--max-entries-per-tile', dest='max_entries_per_tile', default=100,
        help='The maximum number of entries that can be displayed on a single tile')
    parser.add_option('-m', '--max-zoom', dest='max_zoom', default=5,
            help='The maximum zoom level')

    (options, args) = parser.parse_args()

    if len(args) < num_args:
        parser.print_help()
        sys.exit(1)

    with open(args[0], 'r') as f:
        entries = json.load(f)

        options.max_pos = max(map(lambda x: x[options.position], entries))
        options.min_pos = min(map(lambda x: x[options.position], entries))

        entries = sorted(entries, key= lambda x: -float(x[options.importance]))

        make_tiles(entries, options, zoom_level = 0, 
                   start_x = options.min_pos, end_x = options.max_pos)

        print >>sys.stderr, "Entries:", entries


if __name__ == '__main__':
    main()


