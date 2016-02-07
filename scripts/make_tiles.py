#!/usr/bin/python

import json
import sys
from optparse import OptionParser

def make_tiles(entries, options, start_x):
    """
    Create tiles for all of the passed in entries.

    If the passed in entries have the following positions and areas:

    4 15.99
    1 7.27
    6 3.88
    7 3.05
    5 3.02
    2 2.99
    3 2.48

    And we only allow one area per tile, then the returned
    tiles will be:

    {current: [4], from: 1, to: 7,
        left: { current: [1], from: 1, to: 3,
           left: { from: 1, to: 1, current: [1] }
           right: { from: 2, to: 3, current: [2] 
            left
        }
        right:  { current: [4], from: 4, to: 7,

        }
    }

    :entries: The list of objects to make tiles for
    :options: Options passed in to the program
    :start_x: The initial x position
    :returns:
    """
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

    (options, args) = parser.parse_args()

    if len(args) < num_args:
        parser.print_help()
        sys.exit(1)

    with open(args[0], 'r') as f:
        entries = json.load(f)
        entries = sorted(entries, key= lambda x: -float(x[options.importance]))

        print >>sys.stderr, "Entries:", entries

if __name__ == '__main__':
    main()


