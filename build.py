from glob import iglob
import shutil
import os


BUILD_DIR = 'build'
SRC_DIR = 'src'

BUILD_PRODUCT_NAME = 'clairvoyance.js'


if not os.path.exists(BUILD_DIR):
    os.makedirs(BUILD_DIR)

output = open(os.path.join(BUILD_DIR, BUILD_PRODUCT_NAME), 'wb')
for module in iglob(os.path.join(SRC_DIR, '*.js')):
    shutil.copyfileobj(open(module, 'rb'), output)
    output.write('\n\n'.encode('UTF-8'))
output.close()
