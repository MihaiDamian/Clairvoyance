import shutil
import fnmatch
import os


BUILD_DIR = 'build'
SRC_DIR = 'src'

BUILD_PRODUCT_NAME = 'clairvoyance.js'


if not os.path.exists(BUILD_DIR):
    os.makedirs(BUILD_DIR)

output = open(os.path.join(BUILD_DIR, BUILD_PRODUCT_NAME), 'wb')
print('Concatenating files...')
for root, dirs, filenames in os.walk(SRC_DIR):
    for filename in fnmatch.filter(filenames, '*.js'):
        filepath = os.path.join(root, filename)
        print(filepath)
        shutil.copyfileobj(open(filepath, 'rb'), output)
output.close()

print('Done.')
