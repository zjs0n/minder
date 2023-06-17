import csv


fr = open("name_basics.tsv", "r")
fw = open("name_basics_out.tsv", "w")
for line in fr:
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split("\t")
    fw.write("\n" + cols[0][2:] + "\t" + cols[1] + "\t" + cols[2] + "\t" + cols[3])
fr.close()
fw.close()

fr = open("title_basics.tsv", "r")
fw = open("title_basics_out.tsv", "w")
fw.write("tconst\ttitle\tisAdult\treleaseYear\truntime")
for line in fr:
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split("\t")
    if cols[1] == "movie":
        fw.write("\n" + cols[0][2:] + "\t" + cols[2] + "\t" + cols[4] + "\t" + cols[5] + "\t" + cols[7])
fr.close()
fw.close()

fr = open("title_basics.tsv", "r")
fw = open("title_genre.tsv", "w")
for line in fr:
    cols = line.split("\t")
    movie_id = cols[0]
    genres = cols[8].split(",")
    if genres[-1][-1] == "\n":
        genres[-1] = genres[-1][:-1]
    for genre in genres:
        fw.write("\n" + movie_id[2:] + "\t" + genre)
fr.close()
fw.close()

fr = open("title_principals.tsv", "r")
fw = open("cast_of.tsv", "w")
fw.write("tconst\tnconst")
for line in fr:
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split("\t")
    if cols[3] == "actor" or cols[3] == "actress":
        fw.write("\n" + cols[0][2:] + "\t" + cols[2][2:])
fr.close()
fw.close()

existt = [False] * 100000000
fr = open("title_basics_out.tsv", "r")
for line in fr:
    if line[0] == "\n":
        continue
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split("\t")
    existt[int(cols[0])] = True
fr.close()

existn = [False] * 100000000
fr = open("name_basics_out.tsv", "r")
for line in fr:
    if "nconst" in line:
        continue
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split("\t")
    existn[int(cols[0])] = True
fr.close()

fr = open("title_genre.tsv", "r")
fw = open("title_genre_out.tsv", "w")
fw.write("tconst\tgenres")
for line in fr:
    if line == "tconst\tgenres\n":
        continue
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split("\t")
    if cols[1] == "\\N":
        continue
    if existt[int(cols[0][2:])]:
        fw.write("\n" + cols[0][2:] + "\t" + cols[1])
fr.close()
fw.close()

fr = open("director_of.csv", "r")
fw = open("director_of.tsv", "w")
fw.write("tconst\tnconsts")
for line in fr:
    if line == "tconst,nconst\n":
        continue
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split(",")
    if cols[1] == "\\N":
        continue
    if existt[int(cols[0])] and existn[int(cols[1])]:
        fw.write("\n" + cols[0] + "\t" + cols[1])
fr.close()
fw.close()

fr = open("cast_of.csv", "r")
fw = open("cast_of.tsv", "w")
fw.write("tconst\tnconsts")
for line in fr:
    if line == "tconst,nconst\n":
        continue
    if line[-1] == "\n":
        line = line[:-1]
    cols = line.split(",")
    if cols[1] == "\\N":
        continue
    if existt[int(cols[0])] and existn[int(cols[1])]:
        fw.write("\n" + cols[0] + "\t" + cols[1])
fr.close()
fw.close()

fr = open("keywords.csv", "r")
fw = open("keywords.tsv", "w")
fw.write("tmdb_id\tkeyword")
for cols in csv.reader(fr, delimiter=',', quotechar='"'):
    movie_id = cols[0]
    dirty_keywords = cols[1].split("'name': ")
    keywords = []
    for keyword in dirty_keywords[1:]:
        keywords.append(keyword[1:].split("}")[0][:-1])
        if keywords[-1][0] == '"' and keywords[-1][-1] == '"':
            keywords[-1] = keywords[-1][1:-1]

    for keyword in keywords:
        fw.write("\n" + movie_id + "\t" + keyword)
fr.close()
fw.close()


def denull(txt):
    txt = txt.replace('\n', '')
    txt = txt.replace('\t', '')
    return "\\N" if txt == "" else txt

fr = open("movies_metadata.csv", "r")
fw = open("movies_metadata.tsv", "w")
fw.write("movie_id\tlanguage\toverview\ttagline\tposter_path\tvote_average")
for cols in csv.reader(fr, delimiter=',', quotechar='"'):
    if cols[0] == "adult":
        continue
    if len(cols[6]) != 9 and len(cols[6]) != 10:
        continue
    if len(cols) == 24:
        fw.write("\n" + cols[6][2:] + "\t" + cols[7] + "\t" + denull(cols[9]) + "\t" + denull(cols[20]) + "\t" + denull(cols[11]) + "\t" + denull(cols[22]))
fr.close()
fw.close()

fr = open("data.csv", "r")
fw = open("data.tsv", "w")
for i, cols in enumerate(csv.reader(fr, delimiter=',', quotechar='"')):
    cols[3] = cols[3].replace('\n', '')
    cols[3] = cols[3].replace('\t', '')

    fw.write('\t'.join(map(str, cols)) + "\n")
fr.close()
fw.close()