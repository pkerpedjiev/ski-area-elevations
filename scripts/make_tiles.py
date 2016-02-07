#!/usr/bin/python

import json
import sys
from optparse import OptionParser

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


