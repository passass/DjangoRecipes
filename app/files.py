import os

def create_dirs_by_absolute_path(absolute_path):
    gone_path = ""
    for dir in absolute_path.split("\\"):
        if not os.path.isfile(dir):
            gone_path += f"{dir}\\"
            os.mkdir(gone_path)


def save_file(absolute_path, file_io):
    with open(absolute_path, "wb+") as f:
        f.write(file_io.file.getbuffer())

image_extensions = ["png", "jpg"]


def is_image(filename):
    return filename.split('.')[-1] in image_extensions


def get_file_extension(filename):
    return filename.split('.')[-1]