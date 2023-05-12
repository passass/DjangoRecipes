import os

sizes = {

}

Folderpath = 'D:/S.T.A.L.K.E.R. REALITY 1.6/MO2/mods'


def get_dir_size(path='.'):
    total = 0
    with os.scandir(path) as it:
        for entry in it:
            if entry.is_file():
                total += entry.stat().st_size
            elif entry.is_dir():
                total += get_dir_size(entry.path)
    return total

for path, dirs, files in os.walk(Folderpath):
    for folder in dirs:
        fp = os.path.join(path, folder)
        size = get_dir_size(fp)
        if size != 0:
            if sizes.get(size):
                print(sizes.get(size), " = ", folder, f'size: {size}')
            else:
                sizes[size] = folder
    break

