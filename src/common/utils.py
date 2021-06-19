import requests
import pandas as pd


class Utils(object):
    @staticmethod
    def wgs84_to_baidu(spots):
        df = pd.DataFrame(spots)
        df['lon_lat'] = df['lon'].map(str) + ',' + df['lat'].map(str)
        to_be_converted = df['lon_lat'].values.tolist()
        coords = ";".join(to_be_converted)
        url = 'http://api.map.baidu.com/geoconv/v1/'
        params = {'coords': coords,
                  'from': 1,
                  'to': 5,
                  'ak': 'z7stCPSnzG7lHjyEODGNY1nxMMqtXsBR'}
        for i in range(3):
            response = requests.get(url=url, params=params)
            if response.json()['status'] == 0:
                df_converted = pd.DataFrame(response.json()['result'])
                df['lon'] = df_converted['x']
                df['lat'] = df_converted['y']
                return df
        return None
