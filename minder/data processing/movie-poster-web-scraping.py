# -*- coding: utf-8 -*-
"""Copy of CIS450 IMDB Movie Posters

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1qDyI9nIJxVmCs0g-mruIg6dB1TgJu4Y_

## Downloads
"""

import pandas as pd

!gdown --id 1wKMbdv2WxjJNC_VXmekjPxuoH-sakwmJ

!gdown --id 1lDLjGunbEoVKA9NHqfDyhXstjI4-znRI

!gdown --id 1glULCsS3nJNu49tGGB-ZdOLyYxZq-BIF

"""## Creating dataframes"""

links_df = pd.read_csv('links.csv')
links_df

metadata_df = pd.read_csv('movies_metadata.csv')
metadata_df.rename(columns={"imdb_id": "tconst"}, inplace=True)
metadata_df.head()

title_df = pd.read_csv('title.tsv', sep='\t')

movies_df = title_df[title_df['titleType']=='movie']
movies_df = movies_df[['tconst', 'primaryTitle', 'isAdult', 'startYear', 'runtimeMinutes']]

joined_df = metadata_df.set_index('tconst').join(movies_df.set_index('tconst'), how='inner')
joined_df = joined_df[['adult', 'original_language', 'overview', 'runtimeMinutes', 'tagline', 'title', 'startYear', 'id']]
joined_df.isna().sum()

joined_df['id'] = joined_df['id'].astype(int)

links_df.rename(columns={"tmdbId": "id"}, inplace=True)

new_joined = joined_df.set_index('id').join(links_df.set_index('id'))
new_joined.head()

joined_df['adult'].value_counts()

new_joined.reset_index(inplace=True)
new_joined.drop(columns=['id', 'movieId'])

new_joined.rename(columns={"adult": "isAdult", "original_language": "language", "runtimeMinutes": "runtime", "startYear": "release_year", "imdbId": "movie_id"}, inplace=True)
new_joined

new_joined.drop(columns=['movieId'], inplace=True)
new_joined

new_joined.drop(columns=['id'], inplace=True)

new_joined = new_joined[new_joined['title'].notna()]
new_joined.isna().sum()

new_joined.drop(columns=['isAdult'], inplace=True)

new_joined.to_csv('all_data.csv', encoding = 'utf-8')

"""## Web scraping"""

from bs4 import BeautifulSoup
import requests

ids = new_joined['movie_id'].to_frame()

test_df = pd.DataFrame(columns = ['movie_id', 'url'])

for i, j in ids.iloc[:40000].iterrows():
  tconstid = 'tt'+ (7-len(str(j['movie_id'])))*'0' + f"{j['movie_id']}"
  url = "https://www.imdb.com/title/" + tconstid
  test_df = test_df.append({'movie_id': j['movie_id'], 'url': url}, ignore_index=True)
test_df

ids = test_df

def scrape(df, x):
  output_df = df
  output_df['poster'] = ''

  for i, j in df.iterrows():
    webpage = requests.get(j['url']).text

    soup = BeautifulSoup(webpage, 'html.parser')
    poster = soup.find('div', class_='ipc-poster').find('img', class_='ipc-image')
    if poster and poster['srcset']:
      poster_url = poster['srcset'].split(', ')[-1].split(' ')[0]
      output_df['poster'][i] = poster_url
    else: 
      output_df['poster'][i] = ''

    print(i)
  output_df.to_csv(f'output_{x}.csv', encoding = 'utf-8')

sections = []
for x in range(1000, 41000, 1000):
  sections.append(ids.iloc[x-1000:x])

for x in range(0, 41):
  scrape(sections[x], x+1)