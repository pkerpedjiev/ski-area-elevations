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
    parser.add_argument('--uids-to-names', default=None)
    #parser.add_argument('-o', '--options', default='yo',
    #					 help="Some option", type='str')
    #parser.add_argument('-u', '--useless', action='store_true', 
    #					 help='Another useless option')

    args = parser.parse_args()

    uids_to_names = {}
    if args.uids_to_names is not None:
        with open(args.uids_to_names, 'r') as f:
            uids_to_names = json.load(f)

    with open(args.json_file[0], 'r') as f:
        entries = sorted(json.load(f), key=lambda x: -int(x['max_elev']))

        for entry in entries:
            if entry['uid'] in uids_to_names:
                entry['name'] = uids_to_names[entry['uid']]

        fudge_factor = 1.8
        entries[0]['cumarea'] = math.log(float(entries[0]['area']) + fudge_factor)

        for i in range(1,len(entries)):
            entries[i]['area'] =  float(entries[i]['area']) + fudge_factor
            entries[i]['cumarea'] = (entries[i-1]['cumarea'] + 
                                     math.log(entries[i]['area']) +
                                     2)
    
        print json.dumps(entries, indent=2)

if __name__ == '__main__':
    main()


