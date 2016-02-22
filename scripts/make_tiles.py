#!/usr/bin/python

import argparse
import json
import os
import os.path as op
import sys

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
    tile['shown'] = sorted(entries, key=lambda x: -float(x[options.importance]))[:options.max_entries_per_tile]
    tile['start_x'] = start_x
    tile['end_x'] = end_x
    tile['zoom'] = zoom_level

    midpoint = (end_x + start_x) / 2.

    tile['num'] = int(((midpoint - options.min_pos) /
                   ((options.max_pos - options.min_pos) / float(2 ** zoom_level))))

    left_entries = filter(lambda x: x[options.position] <= midpoint, entries)
    right_entries = filter(lambda x: x[options.position] > midpoint, entries)
    tiles = [tile]

    if zoom_level < options.max_zoom:
        tiles += make_tiles(left_entries, options, zoom_level+1, start_x = start_x,
                end_x = midpoint)
        tiles += make_tiles(right_entries, options, zoom_level+1, start_x = midpoint,
                end_x = end_x)

    return tiles

def main():
    usage = """
    python make_tiles.py json_file

    Create tiles for all of the entries in the JSON file.
    """
    num_args= 1
    parser = argparse.ArgumentParser()

    #parser.add_argument('-o', '--options', dest='some_option', default='yo', help="Place holder for a real option", type='str')
    #parser.add_argument('-u', '--useless', dest='uselesss', default=False, action='store_true', help='Another useless option')
    parser.add_argument('json_file')
    parser.add_argument('-i', '--importance', dest='importance', default='importance',
            help='The field in each JSON entry that indicates how important that entry is',
            type=str)

    group = parser.add_mutually_exclusive_group()
    group.add_argument('-p', '--position', dest='position', default='position',
            help='Where this entry would be placed on the x axis',
            type=str)
    group.add_argument('-s', '--sort-by', 
            default=None,
            help='Sort by a field and use as the position') 

    parser.add_argument('-e', '--max-entries-per-tile', dest='max_entries_per_tile', default=100,
        help='The maximum number of entries that can be displayed on a single tile',
        type=int)
    parser.add_argument('-m', '--max-zoom', dest='max_zoom', default=5,
            help='The maximum zoom level')
    parser.add_argument('--min-pos', dest='min_pos', default=None,
            help='The minimum x position', type=float)
    parser.add_argument('--max-pos', dest='max_pos', default=None,
            help='The maximum x position', type=float)
    parser.add_argument('-o', '--output-dir', help='The directory to place the tiles',
                        required=True)

    args = parser.parse_args()


    with open(args.json_file, 'r') as f:
        entries = json.load(f)

        if args.sort_by is not None:
            # we want the position to be equal to the index of each entry
            # when the whole list is sorted by a certain value
            entries = sorted(entries, key=lambda x: x[args.sort_by])
            for i, entry in enumerate(entries):
                entry['sorted_position'] = i
            args.position = 'sorted_position'

        if args.max_pos is None:
            args.max_pos = max(map(lambda x: x[args.position], entries))
        if args.min_pos is None:
            args.min_pos = min(map(lambda x: x[args.position], entries))

        args.total_x_width = args.max_pos - args.min_pos

        entries = sorted(entries, key= lambda x: -float(x[args.importance]))

        tiles = make_tiles(entries, args, zoom_level = 0, 
                   start_x = args.min_pos, end_x = args.max_pos)

        tileset = {'min_pos': args.min_pos,
                   'max_pos': args.max_pos,
                   'max_zoom': args.max_zoom}

        if not op.exists(args.output_dir):
            os.makedirs(args.output_dir)

        print >>sys.stderr, "tileset:", tileset

        with open(op.join(args.output_dir, 'tile_info.json'), 'w') as f:
            json.dump(tileset, f)

        for tile in tiles:
            output_dir = op.join(args.output_dir, str(tile['zoom']))

            if not op.exists(output_dir):
                os.makedirs(output_dir)

            output_file = op.join(output_dir, '{}.json'.format(tile['num']))
            with open(output_file, 'w') as f:
                json.dump(tile, f)

if __name__ == '__main__':
    main()


