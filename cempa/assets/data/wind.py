#!/usr/bin/env python3
'''
    get-winds.py

    - get the latest data from nomads.ncep.noaa.gov unless we have it already
    - generate file /maps/wms/data/windy.json
    - generate windy.latest file with time stamp

'''

import os
import sys
import fcntl
import json
import numpy as np
from datetime import datetime
from netCDF4 import Dataset

if len(sys.argv) > 1 and sys.argv[1] == '-h':
    print("Usage: get-winds.py [-h] [YYYYMMDD] [HH] [RES]")
    print("       HH = 00 | 06 | 12 | 18")
    print("       RES = 1p00 | 0p50 | 0p25\n")
    quit()

# only let one instance of the program run at a time
# if it is already running, a 2nd instance would be trying to
# process the same files as the first
lock = open(os.path.realpath(__file__), 'r')
try:
        fcntl.flock(lock, fcntl.LOCK_EX|fcntl.LOCK_NB)
except:
        os._exit(0)

JSONFILE = 'test.json'

utcnow = datetime.utcnow()

YYYYMMDD = utcnow.strftime("%Y%m%d")

# force HH to be 00 | 06 | 12 | 18
HH = '{0:0>2}'.format(int(int(utcnow.strftime("%H"))/6)*6)

# select the spatial resolution of the data
RES = '1p00'  #  1p00 | 0p50 | 0p25

if len(sys.argv) > 1:
    YYYYMMDD = sys.argv[1]

if len(sys.argv) > 2:
    HH = sys.argv[2]

if len(sys.argv) > 3:
    RES = sys.argv[3]

URL = 'https://nomads.ncep.noaa.gov:9090/dods/gfs_{0}/gfs{1}/gfs_{0}_{2}z'.format(RES, YYYYMMDD, HH)

print(URL + "\n")

ds = Dataset(URL)

refTime = utcnow.strftime("%Y-%m-%dT{}:00:00.000Z".format(HH))
fcTime = 0

lon1 = float(ds.variables['lon'][0])
lon2 = float(ds.variables['lon'][-1])
lat1 = float(ds.variables['lat'][0])
lat2 = float(ds.variables['lat'][-1])
nx = ds.dimensions['lon'].size
ny = ds.dimensions['lat'].size
dx = (lon2 - lon1 + 1) / nx
dy = (lat2 - lat1 + 1) / ny

if lat1 < lat2:
    ugrd10m = np.flipud(ds.variables['ugrd10m'][fcTime,:,:]).flatten().filled().                                                                                                                                                             tolist()
    vgrd10m = np.flipud(ds.variables['vgrd10m'][fcTime,:,:]).flatten().filled().                                                                                                                                                             tolist()
    tmp = lat2
    lat2 = lat1
    lat1 = tmp
    dy = abs(dy)  # negative dy breaks wind-layer
else:
    ugrd10m = ds.variables['ugrd10m'][fcTime,:,:].flatten().filled().tolist()
    vgrd10m = ds.variables['vgrd10m'][fcTime,:,:].flatten().filled().tolist()


data = [
    { "header": {
        "lo1": lon1,
        "lo2": lon2,
        "la1": lat1,
        "la2": lat2,
        "nx": nx,
        "ny": ny,
        "dx": dx,
        "dy": dy,
        "parameterCategory": 2,
        "parameterNumber": 2,
        "refTime": refTime,
        "forecastTime": fcTime
      },
      "data": ugrd10m
    },
    { "header": {
        "lo1": lon1,
        "lo2": lon2,
        "la1": lat1,
        "la2": lat2,
        "nx": nx,
        "ny": ny,
        "dx": dx,
        "dy": dy,
        "parameterCategory": 2,
        "parameterNumber": 3,
        "refTime": refTime,
        "forecastTime": fcTime
      },
      "data": vgrd10m
    },
];

# 1p00 json file is about 1MB using dec=3
# 0p25 json file is about 15MB using dec=3, and 13MB using dec=2
def round_floats(o):
    dec = 3
    if RES == '0p25':
        dec = 2
    if isinstance(o, float): return round(o, 3)
    if isinstance(o, dict): return {k: round_floats(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)): return [round_floats(x) for x in o]
    return o

with open(JSONFILE, 'w') as f:
    json.dump(round_floats(data), f, ensure_ascii=True)