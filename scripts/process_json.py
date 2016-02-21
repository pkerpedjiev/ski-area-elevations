#!/usr/bin/python

import json
import math
import sys
import argparse

def main():
    parser = argparse.ArgumentParser(description="""
    python process_json.py json_file

    Make any necessary changes to the json file before making tiles
    of it.
""")

    parser.add_argument('json_file', nargs=1)
    #parser.add_argument('-o', '--options', default='yo',
    #					 help="Some option", type='str')
    #parser.add_argument('-u', '--useless', action='store_true', 
    #					 help='Another useless option')

    args = parser.parse_args()
    with open(args.json_file[0], 'r') as f:
        entries = json.load(f)

        fudge_factor = 1.8
        entries[0]['cumarea'] = math.log(float(entries[0]['area']) + fudge_factor)

        for i in range(1,len(entries)):
            entries[i]['cumarea'] = (entries[i-1]['cumarea'] + 
                                     math.log(float(entries[i]['area']) +
                                              fudge_factor) +
                                     2)
    
        print json.dumps(entries)

if __name__ == '__main__':
    main()


